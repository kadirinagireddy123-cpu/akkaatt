import {
  DayOfWeek,
  TimetableEntry,
  Subject,
  User,
  TimeSlot,
  SaturdayOverride
} from '../types';
import {
  TIMETABLE_ENTRIES,
  SUBJECTS,
  TIME_SLOTS,
  SATURDAY_OVERRIDES
} from '../data/seedData';

export interface ResolvedDailySlot {
  periodId: string;
  slotNumber: string; // P1..P8
  timeRange: string;
  startTime: string;
  endTime: string;
  subject: Subject;
  entry: TimetableEntry;
  isSaturdaySwap?: boolean;
  swapDescription?: string;
  isParallel?: boolean;
}

/**
 * Returns the effective DayOfWeek for any given ISO date string ("YYYY-MM-DD").
 * Accounts for Saturday extra working day overrides.
 */
export function getEffectiveDayForDate(
  dateStr: string,
  overrides: SaturdayOverride[] = SATURDAY_OVERRIDES
): { effectiveDay: DayOfWeek; isSaturdaySwap: boolean; swapNote?: string } {
  const dateObj = new Date(dateStr);
  const dayIndex = dateObj.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
  const dayMap: Record<number, DayOfWeek> = {
    0: 'Sun',
    1: 'Mon',
    2: 'Tue',
    3: 'Wed',
    4: 'Thu',
    5: 'Fri',
    6: 'Sat'
  };
  const standardDay = dayMap[dayIndex] || 'Mon';

  if (standardDay === 'Sat') {
    const override = overrides.find(o => o.date === dateStr);
    if (override) {
      return {
        effectiveDay: override.mappedDay,
        isSaturdaySwap: true,
        swapNote: override.description
      };
    }
  }

  return {
    effectiveDay: standardDay,
    isSaturdaySwap: false
  };
}

/**
 * Checks whether a subject belongs to a student based on their specializations and section.
 */
export function isSubjectEnrolledForStudent(subject: Subject, student: User): boolean {
  // If general or non-academic core
  if (subject.category === 'general' || subject.category === 'core') {
    if (!subject.section || subject.section === 'Both' || subject.section === student.section) {
      return true;
    }
  }

  // Check Primary Specialization
  if (
    (subject.category === 'finance' && student.primarySpec === 'Finance') ||
    (subject.category === 'hr' && student.primarySpec === 'HR') ||
    (subject.category === 'marketing' && student.primarySpec === 'Marketing') ||
    (subject.category === 'logistics' && student.primarySpec === 'Logistics & SCM')
  ) {
    if (!subject.section || subject.section === 'Both' || subject.section === student.section) {
      return true;
    }
  }

  // Check Dual Specialization
  if (
    (subject.category === 'analytics' && student.dualSpec === 'Business Analytics') ||
    (subject.category === 'datascience' && student.dualSpec === 'Data Science')
  ) {
    if (!subject.section || subject.section === 'Both' || subject.section === student.section) {
      return true;
    }
  }

  return false;
}

/**
 * Generates the daily timetable for a student based on their primary and dual electives.
 */
export function getDailyScheduleForStudent(
  student: User,
  dateStr: string,
  entries: TimetableEntry[] = TIMETABLE_ENTRIES,
  overrides: SaturdayOverride[] = SATURDAY_OVERRIDES
): ResolvedDailySlot[] {
  const { effectiveDay, isSaturdaySwap, swapNote } = getEffectiveDayForDate(dateStr, overrides);

  // If Sunday or an unmapped Saturday, no classes
  if (effectiveDay === 'Sun' || effectiveDay === 'Sat') {
    return [];
  }

  const dayEntries = entries.filter(e => e.day === effectiveDay);
  const resolvedSlots: ResolvedDailySlot[] = [];

  for (const slot of TIME_SLOTS) {
    // Find matching entries for this period that apply to this student
    const candidateEntries = dayEntries.filter(e => e.period === slot.period);

    for (const entry of candidateEntries) {
      const subject = SUBJECTS.find(s => s.code === entry.subjectCode);
      if (!subject) continue;

      if (isSubjectEnrolledForStudent(subject, student)) {
        resolvedSlots.push({
          periodId: slot.id,
          slotNumber: slot.period,
          timeRange: slot.label,
          startTime: slot.startTime,
          endTime: slot.endTime,
          subject,
          entry,
          isSaturdaySwap,
          swapDescription: swapNote,
          isParallel: entry.isParallelSlot
        });
        break; // Max 1 subject per slot for an individual student
      }
    }
  }

  return resolvedSlots;
}

/**
 * Generates the daily timetable for a faculty member.
 */
export function getDailyScheduleForFaculty(
  facultyId: string,
  dateStr: string,
  entries: TimetableEntry[] = TIMETABLE_ENTRIES,
  overrides: SaturdayOverride[] = SATURDAY_OVERRIDES
): ResolvedDailySlot[] {
  const { effectiveDay, isSaturdaySwap, swapNote } = getEffectiveDayForDate(dateStr, overrides);

  if (effectiveDay === 'Sun' || effectiveDay === 'Sat') {
    return [];
  }

  const dayEntries = entries.filter(e => e.day === effectiveDay && e.facultyId === facultyId);
  const resolvedSlots: ResolvedDailySlot[] = [];

  for (const slot of TIME_SLOTS) {
    const matchingEntries = dayEntries.filter(e => e.period === slot.period);

    for (const entry of matchingEntries) {
      const subject = SUBJECTS.find(s => s.code === entry.subjectCode);
      if (!subject) continue;

      resolvedSlots.push({
        periodId: slot.id,
        slotNumber: slot.period,
        timeRange: slot.label,
        startTime: slot.startTime,
        endTime: slot.endTime,
        subject,
        entry,
        isSaturdaySwap,
        swapDescription: swapNote
      });
    }
  }

  return resolvedSlots;
}

/**
 * Validates a batch of timetable entries for clashes (faculty double-booking or room conflicts).
 */
export function validateTimetableEntries(entries: TimetableEntry[]): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  const facultySlots = new Map<string, string>();
  const roomSlots = new Map<string, string>();

  for (const entry of entries) {
    const facultyKey = `${entry.day}-${entry.period}-${entry.facultyId}`;
    if (entry.facultyId && entry.facultyId !== 'fac-club' && entry.facultyId !== 'fac-proc') {
      if (facultySlots.has(facultyKey)) {
        errors.push(`Faculty conflict: Faculty ${entry.facultyId} is scheduled twice on ${entry.day} ${entry.period}.`);
      } else {
        facultySlots.set(facultyKey, entry.id);
      }
    }

    const roomKey = `${entry.day}-${entry.period}-${entry.classroom}`;
    if (entry.classroom && entry.classroom !== 'Auditorium / Quadrangle') {
      if (roomSlots.has(roomKey)) {
        warnings.push(`Room sharing or clash: Room ${entry.classroom} is booked for multiple groups on ${entry.day} ${entry.period}.`);
      } else {
        roomSlots.set(roomKey, entry.id);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}
