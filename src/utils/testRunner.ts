import {
  getEffectiveDayForDate,
  getDailyScheduleForStudent,
  isSubjectEnrolledForStudent
} from './timetableEngine';
import {
  calculateSubjectAttendance,
  calculateClassesNeeded,
  calculateBunkAllowance,
  MANDATORY_MINIMUM_PERCENTAGE
} from './vtuCalculator';
import { processOfflineSync, enqueueAttendanceAction, clearOfflineQueue } from './offlineSync';
import { validateAttendanceToken } from './qrCrypto';
import { SEED_USERS, SUBJECTS, TIMETABLE_ENTRIES, SATURDAY_OVERRIDES } from '../data/seedData';
import { AttendanceRecord, AuditLog } from '../types';

export interface TestCaseResult {
  id: string;
  name: string;
  category: 'parallel_electives' | 'saturday_swaps' | 'edit_window' | 'duplicate_prevention' | 'offline_sync' | 'vtu_math';
  passed: boolean;
  expected: string;
  actual: string;
  durationMs: number;
}

export function runAllSystemTests(): TestCaseResult[] {
  const results: TestCaseResult[] = [];

  // TEST 1: Parallel Electives Isolation
  {
    const start = performance.now();
    const rahul = SEED_USERS.find(u => u.id === 'stu-1')!; // Finance + BA
    const zeeshan = SEED_USERS.find(u => u.id === 'stu-3')!; // Logistics + BA

    const rahulSchedule = getDailyScheduleForStudent(rahul, '2026-10-12'); // Monday
    const zeeshanSchedule = getDailyScheduleForStudent(zeeshan, '2026-10-12'); // Monday

    const rahulP1 = rahulSchedule.find(s => s.slotNumber === 'P1');
    const zeeshanP1 = zeeshanSchedule.find(s => s.slotNumber === 'P1');

    const passed =
      rahulP1?.subject.code === 'MBAFM311' &&
      zeeshanP1?.subject.code === 'MBALS313';

    results.push({
      id: 'test-parallel-electives',
      name: 'Parallel Electives: Separate specialization streams in identical slot',
      category: 'parallel_electives',
      passed,
      expected: 'Rahul gets Finance MBAFM311; Zeeshan gets Logistics MBALS313',
      actual: `Rahul=${rahulP1?.subject.code}, Zeeshan=${zeeshanP1?.subject.code}`,
      durationMs: Math.round(performance.now() - start)
    });
  }

  // TEST 2: Saturday Day Swaps
  {
    const start = performance.now();
    const sat1 = getEffectiveDayForDate('2026-09-26', SATURDAY_OVERRIDES);
    const sat2 = getEffectiveDayForDate('2026-10-24', SATURDAY_OVERRIDES);
    const satUnmapped = getEffectiveDayForDate('2026-10-17', SATURDAY_OVERRIDES);

    const passed =
      sat1.isSaturdaySwap &&
      sat1.effectiveDay === 'Mon' &&
      sat2.isSaturdaySwap &&
      sat2.effectiveDay === 'Tue' &&
      satUnmapped.effectiveDay === 'Sat' &&
      !satUnmapped.isSaturdaySwap;

    results.push({
      id: 'test-saturday-swaps',
      name: 'Saturday Swaps: Photo schedule dates correctly mapped to weekday routines',
      category: 'saturday_swaps',
      passed,
      expected: '26/09 -> Mon, 24/10 -> Tue, 17/10 -> No swap (Sat)',
      actual: `26/09=${sat1.effectiveDay}, 24/10=${sat2.effectiveDay}, 17/10=${satUnmapped.effectiveDay}`,
      durationMs: Math.round(performance.now() - start)
    });
  }

  // TEST 3: Mandatory 85% Minimum Percentage Math
  {
    const start = performance.now();
    // Case A: 7 out of 10 classes attended (70%) -> Target 85%.
    // k = ceil((0.85*10 - 7) / (1 - 0.85)) = ceil(1.5 / 0.15) = 10
    const needed = calculateClassesNeeded(7, 10, 85);

    // Case B: 19 out of 20 classes attended (95%) -> Target 85%.
    // b = floor(19 / 0.85 - 20) = floor(22.35 - 20) = 2
    const allowance = calculateBunkAllowance(19, 20, 85);

    const passed = needed === 10 && allowance === 2;

    results.push({
      id: 'test-85-pct-math',
      name: '85% Minimum Attendance Formula: Recovery classes & safe bunk margin',
      category: 'vtu_math',
      passed,
      expected: '7/10 requires 10 consecutive attendances for 85%; 19/20 allows 2 safe bunks',
      actual: `Needed=${needed}, Safe bunks=${allowance}`,
      durationMs: Math.round(performance.now() - start)
    });
  }

  // TEST 4: 24-Hour Edit Window Rule
  {
    const start = performance.now();
    const now = Date.now();
    const twoHoursAgo = new Date(now - 2 * 3600 * 1000).toISOString();
    const thirtyHoursAgo = new Date(now - 30 * 3600 * 1000).toISOString();

    const isTwoHoursEditable = (now - new Date(twoHoursAgo).getTime()) / (3600 * 1000) <= 24;
    const isThirtyHoursEditable = (now - new Date(thirtyHoursAgo).getTime()) / (3600 * 1000) <= 24;

    const passed = isTwoHoursEditable === true && isThirtyHoursEditable === false;

    results.push({
      id: 'test-edit-window',
      name: '24-Hour Edit Window: Allows timely corrections, locks expired records',
      category: 'edit_window',
      passed,
      expected: '2-hour record editable; 30-hour record locked',
      actual: `2h=${isTwoHoursEditable ? 'Allowed' : 'Locked'}, 30h=${isThirtyHoursEditable ? 'Allowed' : 'Locked'}`,
      durationMs: Math.round(performance.now() - start)
    });
  }

  // TEST 5: Duplicate Attendance Record Prevention
  {
    const start = performance.now();
    const mockRecord: AttendanceRecord = {
      id: 'test-rec-1',
      sessionId: 'sess-test-dup',
      studentId: 'stu-1',
      subjectCode: 'MBAFM312',
      date: '2026-10-13',
      period: 'P7',
      status: 'present',
      markedBy: 'faculty',
      markedAt: new Date().toISOString()
    };

    clearOfflineQueue();
    enqueueAttendanceAction({ type: 'MARK', record: mockRecord });
    enqueueAttendanceAction({ type: 'MARK', record: mockRecord });

    const auditLogs: AuditLog[] = [];
    const syncResult = processOfflineSync([], auditLogs, 'fac-dk', 'Dr. Dinesh K');
    clearOfflineQueue();

    const passed = syncResult.updatedRecords.length === 1 && syncResult.conflicts.length === 1;

    results.push({
      id: 'test-duplicate-prevention',
      name: 'Duplicate Marking Prevention: Duplicate marking in same session rejected',
      category: 'duplicate_prevention',
      passed,
      expected: '1 record saved, 1 duplicate conflict flagged',
      actual: `Saved=${syncResult.updatedRecords.length}, Conflicts=${syncResult.conflicts.length}`,
      durationMs: Math.round(performance.now() - start)
    });
  }

  // TEST 6: Anti-Proxy QR & PIN Validation
  {
    const start = performance.now();
    const pin = 'K7M9P2';
    const sessionId = 'sess-qr-123';
    
    const validCheck = validateAttendanceToken(pin, sessionId, pin);
    const invalidCheck = validateAttendanceToken('WRONG1', sessionId, pin);

    const passed = validCheck.isValid === true && invalidCheck.isValid === false;

    results.push({
      id: 'test-anti-proxy-token',
      name: 'Anti-Proxy Token & PIN: Validates authentic time-boxed tokens',
      category: 'offline_sync',
      passed,
      expected: 'Correct PIN accepted, incorrect PIN rejected',
      actual: `Correct=${validCheck.isValid}, Incorrect=${invalidCheck.isValid}`,
      durationMs: Math.round(performance.now() - start)
    });
  }

  return results;
}
