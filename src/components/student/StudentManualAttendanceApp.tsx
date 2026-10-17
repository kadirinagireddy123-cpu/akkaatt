import React, { useState, useMemo, useEffect } from 'react';
import {
  User,
  Subject,
  AttendanceRecord,
  AttendanceStatus,
  SaturdayOverride,
  PrimarySpecialization,
  DualSpecialization
} from '../../types';
import {
  TIME_SLOTS,
  SUBJECTS,
  TIMETABLE_ENTRIES,
  SATURDAY_OVERRIDES,
  SEED_USERS
} from '../../data/seedData';
import {
  getDailyScheduleForStudent,
  getEffectiveDayForDate,
  ResolvedDailySlot
} from '../../utils/timetableEngine';
import {
  calculateSubjectAttendance,
  calculateClassesNeeded,
  calculateBunkAllowance,
  simulateAttendanceProjection,
  MANDATORY_MINIMUM_PERCENTAGE
} from '../../utils/vtuCalculator';
import {
  Check,
  X,
  MinusCircle,
  Award,
  Calendar,
  Calculator,
  BookOpen,
  UserCheck,
  Sliders,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Settings,
  HelpCircle,
  CalendarDays,
  Plus,
  RotateCcw,
  Edit3,
  Share2,
  Copy,
  Info,
  Flame,
  Sun,
  Moon,
  TrendingUp,
  Percent
} from 'lucide-react';

interface StudentManualAttendanceAppProps {
  initialStudent?: User;
  initialRecords?: AttendanceRecord[];
}

export const StudentManualAttendanceApp: React.FC<StudentManualAttendanceAppProps> = ({
  initialStudent = SEED_USERS[3], // Default student Rahul Sharma (Finance + BA)
  initialRecords = []
}) => {
  // Student Profile State
  const [student, setStudent] = useState<User>(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const savedProfile = window.localStorage.getItem('bitm_student_profile');
        if (savedProfile) return JSON.parse(savedProfile);
      }
    } catch {
      // fallback
    }
    return {
      id: initialStudent.id || 'student-me',
      name: initialStudent.name || 'Rahul Sharma',
      email: initialStudent.email || 'rahul.mba@bitm.edu.in',
      role: 'student',
      usn: initialStudent.usn || '3BR25MBA01',
      section: initialStudent.section || 'A',
      primarySpec: (initialStudent.primarySpec || 'Finance') as PrimarySpecialization,
      dualSpec: (initialStudent.dualSpec || 'Business Analytics') as DualSpecialization,
      semester: 3
    };
  });

  // Save profile to localStorage
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('bitm_student_profile', JSON.stringify(student));
      }
    } catch {
      // ignore
    }
  }, [student]);

  // Target Minimum Threshold (strict 85% default per college mandate)
  const [targetPercentage, setTargetPercentage] = useState<number>(MANDATORY_MINIMUM_PERCENTAGE);

  // Selected date (format: YYYY-MM-DD, e.g. '2026-10-13' which is a Tuesday in academic term)
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-13');

  // Active App Tab: 'daily' (Put Attendance), 'subjects' (Subject Cards), 'calc' (Bunk Calc), 'timetable' (Full Grid), 'profile' (Elective Settings)
  const [activeTab, setActiveTab] = useState<'daily' | 'subjects' | 'calc' | 'timetable' | 'profile'>('daily');

  // Manual Attendance Records store - Zero attendance by default
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        // Force reset to zero for new user session
        const hasReset = window.localStorage.getItem('bitm_student_reset_zero_v3');
        if (!hasReset) {
          window.localStorage.removeItem('bitm_student_manual_attendance');
          window.localStorage.setItem('bitm_student_reset_zero_v3', 'true');
          return [];
        }
        const saved = window.localStorage.getItem('bitm_student_manual_attendance');
        if (saved) return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    // Clean slate: 0 records
    return [];
  });

  // Save changes to localStorage safely
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('bitm_student_manual_attendance', JSON.stringify(attendanceRecords));
      }
    } catch {
      // ignore
    }
  }, [attendanceRecords]);

  // Reset all attendance records to zero
  const handleResetAllToZero = () => {
    if (window.confirm('Reset all attendance records to ZERO (0/0 classes)?')) {
      setAttendanceRecords([]);
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.removeItem('bitm_student_manual_attendance');
          window.localStorage.setItem('bitm_student_reset_zero_v3', 'true');
        }
      } catch {
        // ignore
      }
      showToast('All attendance has been reset to ZERO (0%)!');
    }
  };

  // Notice toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Modal for editing subject counts directly
  const [editingSubject, setEditingSubject] = useState<{
    code: string;
    name: string;
    attended: number;
    conducted: number;
  } | null>(null);

  // Resolve daily classes for the selected date based on student's chosen electives
  const dailySlots = useMemo(() => {
    return getDailyScheduleForStudent(student, selectedDate, TIMETABLE_ENTRIES, SATURDAY_OVERRIDES);
  }, [student, selectedDate]);

  // Effective day info (accounts for Saturday extra working days like 26/09, 24/10, etc.)
  const dayInfo = useMemo(() => {
    return getEffectiveDayForDate(selectedDate, SATURDAY_OVERRIDES);
  }, [selectedDate]);

  // Enrolled subjects for this student based on primary and dual specializations
  const enrolledSubjects = useMemo(() => {
    return SUBJECTS.filter(s => {
      if (s.category === 'general' || s.category === 'core') return true;
      if (s.category === 'finance' && student.primarySpec === 'Finance') return true;
      if (s.category === 'hr' && student.primarySpec === 'HR') return true;
      if (s.category === 'marketing' && student.primarySpec === 'Marketing') return true;
      if (s.category === 'logistics' && student.primarySpec === 'Logistics & SCM') return true;
      if (s.category === 'analytics' && student.dualSpec === 'Business Analytics') return true;
      if (s.category === 'datascience' && student.dualSpec === 'Data Science') return true;
      return false;
    });
  }, [student]);

  // Subject-wise metrics calculated dynamically
  const subjectMetrics = useMemo(() => {
    return enrolledSubjects.map(sub => {
      return calculateSubjectAttendance(sub.code, attendanceRecords, student.id);
    });
  }, [enrolledSubjects, attendanceRecords, student.id]);

  // Overall student attendance metrics
  const overallMetrics = useMemo(() => {
    let totalConducted = 0;
    let totalAttended = 0;

    subjectMetrics.forEach(m => {
      totalConducted += m.totalConducted;
      totalAttended += m.attended + m.onDuty;
    });

    const percentage = totalConducted > 0 ? (totalAttended / totalConducted) * 100 : 0;
    const rounded = Math.round(percentage * 10) / 10;
    const isAboveTarget = totalConducted > 0 ? rounded >= targetPercentage : true;

    const classesNeeded = totalConducted > 0 ? calculateClassesNeeded(totalAttended, totalConducted, targetPercentage) : 0;
    const bunkAllowance = totalConducted > 0 ? calculateBunkAllowance(totalAttended, totalConducted, targetPercentage) : 0;

    return {
      totalConducted,
      totalAttended,
      totalBunked: totalConducted - totalAttended,
      percentage: rounded,
      isAboveTarget,
      classesNeeded,
      bunkAllowance
    };
  }, [subjectMetrics, targetPercentage]);

  // Check the recorded status for a specific slot on selectedDate
  const getSlotStatus = (slot: ResolvedDailySlot): AttendanceStatus | 'unmarked' => {
    const found = attendanceRecords.find(
      r => r.date === selectedDate && r.period === slot.slotNumber && r.subjectCode === slot.subject.code
    );
    return found ? found.status : 'unmarked';
  };

  // Manually mark a period status
  const handleMarkPeriod = (slot: ResolvedDailySlot, status: AttendanceStatus) => {
    setAttendanceRecords(prev => {
      const existingIdx = prev.findIndex(
        r => r.date === selectedDate && r.period === slot.slotNumber && r.subjectCode === slot.subject.code
      );

      const record: AttendanceRecord = {
        id: `rec-${selectedDate}-${slot.slotNumber}-${slot.subject.code}`,
        sessionId: `sess-${selectedDate}-${slot.slotNumber}`,
        studentId: student.id,
        subjectCode: slot.subject.code,
        date: selectedDate,
        period: slot.slotNumber,
        status,
        markedBy: 'student',
        markedAt: new Date().toISOString()
      };

      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx] = record;
        return copy;
      } else {
        return [...prev, record];
      }
    });

    const labelMap: Record<AttendanceStatus, string> = {
      present: 'Attended (Present) ✓',
      absent: 'Missed (Bunked) ✗',
      late: 'Marked Late',
      od: 'On-Duty (OD) 🏆',
      cancelled: 'Class Cancelled / Free —'
    };
    showToast(`${slot.slotNumber} ${slot.subject.code}: ${labelMap[status]}`);
  };

  // Shortcut: Mark all today's classes as Attended
  const handleMarkAllTodayAttended = () => {
    if (dailySlots.length === 0) return;

    setAttendanceRecords(prev => {
      const copy = [...prev];
      dailySlots.forEach(slot => {
        const existingIdx = copy.findIndex(
          r => r.date === selectedDate && r.period === slot.slotNumber && r.subjectCode === slot.subject.code
        );
        const record: AttendanceRecord = {
          id: `rec-${selectedDate}-${slot.slotNumber}-${slot.subject.code}`,
          sessionId: `sess-${selectedDate}-${slot.slotNumber}`,
          studentId: student.id,
          subjectCode: slot.subject.code,
          date: selectedDate,
          period: slot.slotNumber,
          status: 'present',
          markedBy: 'student',
          markedAt: new Date().toISOString()
        };
        if (existingIdx >= 0) {
          copy[existingIdx] = record;
        } else {
          copy.push(record);
        }
      });
      return copy;
    });

    showToast(`Marked all ${dailySlots.length} periods for ${selectedDate} as Attended!`);
  };

  // Quick increment directly from subject cards
  const handleQuickAddSubjectRecord = (subjectCode: string, status: AttendanceStatus) => {
    const newRecord: AttendanceRecord = {
      id: `manual-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      sessionId: `quick-${Date.now()}`,
      studentId: student.id,
      subjectCode,
      date: selectedDate,
      period: 'P-Quick',
      status,
      markedBy: 'student',
      markedAt: new Date().toISOString()
    };
    setAttendanceRecords(prev => [...prev, newRecord]);
    showToast(`Added 1 ${status === 'present' ? 'Attended' : 'Missed'} class for ${subjectCode}`);
  };

  // Undo last action for a subject
  const handleQuickUndoSubjectRecord = (subjectCode: string) => {
    setAttendanceRecords(prev => {
      const idx = [...prev].reverse().findIndex(r => r.subjectCode === subjectCode);
      if (idx === -1) return prev;
      const trueIdx = prev.length - 1 - idx;
      const copy = [...prev];
      copy.splice(trueIdx, 1);
      return copy;
    });
    showToast(`Undid latest entry for ${subjectCode}`);
  };

  // Save manual counts override from the Edit Counts modal
  const handleSaveCustomSubjectCounts = () => {
    if (!editingSubject) return;
    const { code, attended, conducted } = editingSubject;
    const safeConducted = Math.max(0, conducted);
    const safeAttended = Math.min(safeConducted, Math.max(0, attended));
    const absent = safeConducted - safeAttended;

    // Remove existing records for this subject and replace with new synthesized count
    setAttendanceRecords(prev => {
      const filtered = prev.filter(r => r.subjectCode !== code);
      const newRecords: AttendanceRecord[] = [];

      for (let i = 0; i < safeAttended; i++) {
        newRecords.push({
          id: `custom-pres-${code}-${i}`,
          sessionId: `custom-sess-${code}-${i}`,
          studentId: student.id,
          subjectCode: code,
          date: '2026-10-01',
          period: 'P1',
          status: 'present',
          markedBy: 'student',
          markedAt: new Date().toISOString()
        });
      }

      for (let j = 0; j < absent; j++) {
        newRecords.push({
          id: `custom-abs-${code}-${j}`,
          sessionId: `custom-sess-${code}-${j}`,
          studentId: student.id,
          subjectCode: code,
          date: '2026-10-02',
          period: 'P2',
          status: 'absent',
          markedBy: 'student',
          markedAt: new Date().toISOString()
        });
      }

      return [...filtered, ...newRecords];
    });

    showToast(`Updated ${code}: ${safeAttended} attended out of ${safeConducted} classes!`);
    setEditingSubject(null);
  };

  // Date stepper
  const handleShiftDate = (days: number) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + days);
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  // Quick jump to a weekday in the active BITM timetable week (Week of Oct 12-16, 2026)
  const jumpToDay = (dayIndex: number) => {
    const dates = [
      '2026-10-12', // Mon
      '2026-10-13', // Tue
      '2026-10-14', // Wed
      '2026-10-15', // Thu
      '2026-10-16', // Fri
      '2026-09-26'  // Sat swap
    ];
    if (dates[dayIndex]) {
      setSelectedDate(dates[dayIndex]);
    }
  };

  // Share attendance report
  const handleCopyReport = () => {
    let report = `📊 *BITM MBA 3rd Sem Attendance Report*\n`;
    report += `👤 Student: ${student.name} (${student.usn})\n`;
    report += `📚 Section ${student.section} | ${student.primarySpec} + ${student.dualSpec}\n`;
    report += `🎯 Overall: ${overallMetrics.percentage}% (${overallMetrics.totalAttended}/${overallMetrics.totalConducted} classes) — ${overallMetrics.isAboveTarget ? '✅ Safe (≥ 85%)' : '⚠️ Shortage (< 85%)'}\n\n`;
    report += `*Subject Breakdown:*\n`;

    subjectMetrics.forEach(m => {
      const s = enrolledSubjects.find(sub => sub.code === m.subjectCode);
      const icon = m.percentage >= targetPercentage ? '✅' : '⚠️';
      report += `${icon} ${m.subjectCode}: ${m.percentage}% (${m.attended}/${m.totalConducted}) - ${s?.name?.substring(0, 24)}\n`;
    });

    if (navigator.clipboard) {
      navigator.clipboard.writeText(report);
      showToast('Attendance report copied to clipboard!');
    }
  };

  // Calculator State
  const [calcSelectedSubject, setCalcSelectedSubject] = useState<string>('');
  const [calcUpcomingTotal, setCalcUpcomingTotal] = useState<number>(6);
  const [calcUpcomingAttended, setCalcUpcomingAttended] = useState<number>(5);

  useEffect(() => {
    if (!calcSelectedSubject && enrolledSubjects.length > 0) {
      setCalcSelectedSubject(enrolledSubjects[0].code);
    }
  }, [enrolledSubjects, calcSelectedSubject]);

  const calcSubjectMetric = subjectMetrics.find(m => m.subjectCode === calcSelectedSubject);
  const calcProjection = useMemo(() => {
    if (!calcSubjectMetric) return null;
    return simulateAttendanceProjection(
      calcSubjectMetric.attended + calcSubjectMetric.onDuty,
      calcSubjectMetric.totalConducted,
      calcUpcomingTotal,
      calcUpcomingAttended,
      targetPercentage
    );
  }, [calcSubjectMetric, calcUpcomingTotal, calcUpcomingAttended, targetPercentage]);

  // SVG Circular Gauge calculation
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, overallMetrics.percentage) / 100) * circumference;

  return (
    <div className="space-y-5 max-w-3xl mx-auto pb-12">
      {/* Toast Notice */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. TOP HERO: RADIAL GAUGE & 85% VTU COMPLIANCE STATUS */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Left: Student Identity & Electives */}
          <div className="space-y-1.5 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-mono font-semibold text-slate-600 dark:text-slate-400">
              <span>BITM MBA 3rd Sem</span>
              <span>·</span>
              <span className="font-bold text-slate-900 dark:text-white">Sec {student.section}</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              {student.name}
            </h1>

            <div className="text-xs text-slate-500 flex flex-wrap items-center justify-center sm:justify-start gap-1.5">
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">{student.primarySpec}</span>
              <span>+</span>
              <span className="font-semibold text-sky-600 dark:text-sky-400">{student.dualSpec}</span>
              <span>·</span>
              <span className="font-mono">{student.usn}</span>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <button
                onClick={() => setActiveTab('profile')}
                className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors"
              >
                <Settings className="w-3 h-3" />
                <span>Change Electives</span>
              </button>

              <button
                onClick={handleCopyReport}
                className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors"
                title="Copy WhatsApp formatted summary"
              >
                <Share2 className="w-3 h-3" />
                <span>Share Summary</span>
              </button>

              <button
                onClick={handleResetAllToZero}
                className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors border border-rose-200 dark:border-rose-900/50"
                title="Reset all attendance records to zero (0/0)"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset to 0</span>
              </button>
            </div>
          </div>

          {/* Right: Circular Progress Gauge */}
          <div className="flex items-center gap-5 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shrink-0">
            {/* SVG Circle */}
            <div className="relative w-24 h-24 flex items-center justify-center">
              <svg className="w-24 h-24 -rotate-90 transform" viewBox="0 0 100 100">
                {/* Background Track */}
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  className="stroke-slate-200 dark:stroke-slate-700"
                  strokeWidth="8"
                  fill="transparent"
                />
                {/* 85% Target Marker */}
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  className={
                    overallMetrics.totalConducted === 0
                      ? 'stroke-slate-300 dark:stroke-slate-700'
                      : overallMetrics.isAboveTarget
                      ? 'stroke-emerald-500'
                      : 'stroke-rose-500'
                  }
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className={`text-xl font-black font-mono leading-none ${
                  overallMetrics.totalConducted === 0
                    ? 'text-slate-600 dark:text-slate-400'
                    : overallMetrics.isAboveTarget
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}>
                  {overallMetrics.percentage}%
                </span>
                <span className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
                  Target: 85%
                </span>
              </div>
            </div>

            {/* Attendance Counts */}
            <div className="space-y-1 text-xs">
              <div>
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  overallMetrics.totalConducted === 0
                    ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    : overallMetrics.isAboveTarget
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                    : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                }`}>
                  {overallMetrics.totalConducted === 0
                    ? '0 / 0 Classes Marked'
                    : overallMetrics.isAboveTarget
                    ? '✓ Safe (≥ 85%)'
                    : '⚠ Shortage (< 85%)'}
                </span>
              </div>
              <div className="text-slate-500 dark:text-slate-400 font-mono text-[11px] pt-1">
                <div>Attended: <strong className="text-slate-900 dark:text-white">{overallMetrics.totalAttended}</strong></div>
                <div>Bunked: <strong className="text-slate-900 dark:text-white">{overallMetrics.totalBunked}</strong></div>
                <div>Total: <strong className="text-slate-900 dark:text-white">{overallMetrics.totalConducted}</strong></div>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Safe Bunk / Classes Needed Banner */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          {overallMetrics.totalConducted === 0 ? (
            <div className="text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/60 w-full flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              <span>
                <strong>Attendance is at 0 (0/0 classes).</strong> Start marking your lectures under <strong>"Put Attendance"</strong> or tap <strong>+ Attended / + Bunked</strong> under "Subjects"!
              </span>
            </div>
          ) : overallMetrics.isAboveTarget ? (
            <div className="text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800/50 w-full flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>
                <strong>Attendance is Safe!</strong> You can bunk <strong>{overallMetrics.bunkAllowance} more classes</strong> without dropping below the 85% college minimum.
              </span>
            </div>
          ) : (
            <div className="text-rose-800 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-xl border border-rose-200 dark:border-rose-800/50 w-full flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>
                <strong>Attendance Shortage!</strong> You need to attend the next <strong>{overallMetrics.classesNeeded} consecutive classes</strong> to reach 85%.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 2. SUB-NAVIGATION TABS */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-200/80 dark:bg-slate-800 rounded-2xl overflow-x-auto shadow-inner">
        <button
          onClick={() => setActiveTab('daily')}
          className={`flex-1 min-w-[120px] py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'daily'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Calendar className="w-3.5 h-3.5 text-emerald-600" />
          <span>Put Attendance</span>
        </button>

        <button
          onClick={() => setActiveTab('subjects')}
          className={`flex-1 min-w-[120px] py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'subjects'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 text-blue-600" />
          <span>Subjects ({enrolledSubjects.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('calc')}
          className={`flex-1 min-w-[120px] py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'calc'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Calculator className="w-3.5 h-3.5 text-purple-600" />
          <span>Bunk Calculator</span>
        </button>

        <button
          onClick={() => setActiveTab('timetable')}
          className={`flex-1 min-w-[110px] py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'timetable'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <CalendarDays className="w-3.5 h-3.5 text-amber-600" />
          <span>Timetable</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex-1 min-w-[100px] py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'profile'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Settings className="w-3.5 h-3.5 text-slate-600" />
          <span>Electives</span>
        </button>
      </div>

      {/* 3. TAB 1: PUT ATTENDANCE (DAILY TIMETABLE LOGGING) */}
      {activeTab === 'daily' && (
        <div className="space-y-4">
          {/* Quick Day Switcher Strip */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-xs space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Select Day to Mark:
              </span>

              {/* Day Pills: Mon, Tue, Wed, Thu, Fri, Sat */}
              <div className="flex items-center gap-1 overflow-x-auto py-0.5">
                {[
                  { label: 'Mon', index: 0, date: '2026-10-12' },
                  { label: 'Tue', index: 1, date: '2026-10-13' },
                  { label: 'Wed', index: 2, date: '2026-10-14' },
                  { label: 'Thu', index: 3, date: '2026-10-15' },
                  { label: 'Fri', index: 4, date: '2026-10-16' },
                  { label: 'Sat (Swap)', index: 5, date: '2026-09-26' }
                ].map(d => {
                  const isActive = selectedDate === d.date;
                  return (
                    <button
                      key={d.label}
                      onClick={() => setSelectedDate(d.date)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      {d.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Date Stepper Bar */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleShiftDate(-1)}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                  title="Previous Day"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <input
                  type="date"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  className="text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-900 dark:text-white"
                />

                <button
                  onClick={() => handleShiftDate(1)}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                  title="Next Day"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {dailySlots.length > 0 && (
                <button
                  onClick={handleMarkAllTodayAttended}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Mark All Periods Attended</span>
                </button>
              )}
            </div>
          </div>

          {/* Saturday Extra Working Day Notice */}
          {dayInfo.isSaturdaySwap && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 text-amber-900 dark:text-amber-200 rounded-2xl text-xs flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Saturday Extra Working Day:</strong> Mapped to <strong>{dayInfo.effectiveDay} timetable</strong> as per BITM academic schedule ({dayInfo.swapNote}).
              </span>
            </div>
          )}

          {/* Daily Schedule Slots List with Tactile 1-Tap Buttons */}
          {dailySlots.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-10 text-center space-y-2">
              <Calendar className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                No classes scheduled for {selectedDate} ({dayInfo.effectiveDay})
              </h3>
              <p className="text-xs text-slate-500">
                Sunday or non-working day. Tap one of the day buttons above (Mon, Tue, Wed, Thu, Fri) to put attendance!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-500 px-1 uppercase tracking-wider flex items-center justify-between">
                <span>{dayInfo.effectiveDay} Lectures ({dailySlots.length} Periods)</span>
                <span>Tap Your Attendance Below</span>
              </div>

              {dailySlots.map(slot => {
                const currentStatus = getSlotStatus(slot);
                const subMetric = subjectMetrics.find(m => m.subjectCode === slot.subject.code);

                return (
                  <div
                    key={slot.periodId}
                    className={`p-4 rounded-2xl border transition-all shadow-xs ${
                      currentStatus === 'present'
                        ? 'bg-emerald-50/50 border-emerald-300 dark:bg-emerald-950/30 dark:border-emerald-800'
                        : currentStatus === 'absent'
                        ? 'bg-rose-50/50 border-rose-300 dark:bg-rose-950/30 dark:border-rose-800'
                        : currentStatus === 'cancelled'
                        ? 'bg-slate-100/70 border-slate-300 dark:bg-slate-800/50 dark:border-slate-700'
                        : currentStatus === 'od'
                        ? 'bg-indigo-50/50 border-indigo-300 dark:bg-indigo-950/30 dark:border-indigo-800'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      {/* Left: Slot & Subject Details */}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md text-slate-700 dark:text-slate-300">
                            {slot.slotNumber} ({slot.timeRange})
                          </span>
                          <span className="text-[11px] font-mono text-slate-500">
                            Room {slot.subject.classroom}
                          </span>
                          {subMetric && (
                            <span className={`text-[11px] font-mono font-bold ${
                              subMetric.percentage >= targetPercentage ? 'text-emerald-600' : 'text-rose-600'
                            }`}>
                              ({subMetric.percentage}%)
                            </span>
                          )}
                        </div>

                        <div className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                          {slot.subject.code} — {slot.subject.name}
                        </div>

                        <div className="text-xs text-slate-500 mt-0.5">
                          Faculty: <strong>{slot.subject.facultyName}</strong>
                        </div>
                      </div>

                      {/* Right: Tactile 1-Tap Action Buttons (Attended, Bunked, Free, OD) */}
                      <div className="flex items-center gap-2 shrink-0">
                        {/* 1. Attended / Present */}
                        <button
                          onClick={() => handleMarkPeriod(slot, 'present')}
                          className={`min-h-[44px] px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs ${
                            currentStatus === 'present'
                              ? 'bg-emerald-600 text-white ring-2 ring-emerald-500 shadow-md scale-102'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-100 hover:text-emerald-800'
                          }`}
                        >
                          <Check className="w-4 h-4 stroke-[3]" />
                          <span>Attended</span>
                        </button>

                        {/* 2. Missed / Bunked */}
                        <button
                          onClick={() => handleMarkPeriod(slot, 'absent')}
                          className={`min-h-[44px] px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs ${
                            currentStatus === 'absent'
                              ? 'bg-rose-600 text-white ring-2 ring-rose-500 shadow-md scale-102'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-rose-100 hover:text-rose-800'
                          }`}
                        >
                          <X className="w-4 h-4 stroke-[3]" />
                          <span>Bunked</span>
                        </button>

                        {/* 3. Class Cancelled / Free Period */}
                        <button
                          onClick={() => handleMarkPeriod(slot, 'cancelled')}
                          className={`min-h-[44px] px-2.5 rounded-xl text-xs font-medium flex items-center gap-1 transition-all ${
                            currentStatus === 'cancelled'
                              ? 'bg-slate-700 text-white ring-2 ring-slate-600'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900'
                          }`}
                          title="Class cancelled by college or teacher on leave"
                        >
                          <MinusCircle className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Free</span>
                        </button>

                        {/* 4. On-Duty (OD) */}
                        <button
                          onClick={() => handleMarkPeriod(slot, 'od')}
                          className={`min-h-[44px] px-2.5 rounded-xl text-xs font-medium flex items-center gap-1 transition-all ${
                            currentStatus === 'od'
                              ? 'bg-indigo-600 text-white ring-2 ring-indigo-500'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900'
                          }`}
                          title="Official college duty, fest or sports"
                        >
                          <Award className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">OD</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 4. TAB 2: SUBJECT-WISE QUICK CARDS (INCREMENT / DECREMENT / EDIT COUNTS) */}
      {activeTab === 'subjects' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                My Subjects & Attendance Counters (85% Target)
              </h2>
              <p className="text-xs text-slate-500">
                Tap + Attended or + Bunked for fast manual logging, or Edit to set your exact numbers.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {subjectMetrics.map(m => {
              const sub = enrolledSubjects.find(s => s.code === m.subjectCode);
              const isEligible = m.percentage >= targetPercentage;

              return (
                <div
                  key={m.subjectCode}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                        {m.subjectCode}
                      </div>
                      <div className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">
                        {sub?.name}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {sub?.facultyName} · Room {sub?.classroom}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className={`text-xl font-black font-mono tabular-nums ${
                        isEligible ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                      }`}>
                        {m.percentage}%
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {m.attended + m.onDuty} / {m.totalConducted} classes
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${isEligible ? 'bg-emerald-500' : 'bg-rose-500'}`}
                      style={{ width: `${Math.min(100, m.percentage)}%` }}
                    />
                  </div>

                  {/* Bunk advice & Edit Counts button */}
                  <div className="text-[11px] flex items-center justify-between text-slate-600 dark:text-slate-400">
                    {isEligible ? (
                      <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                        Safe: Can bunk <strong>{m.bunkAllowanceFor85} classes</strong>
                      </span>
                    ) : (
                      <span className="text-rose-600 dark:text-rose-400 font-medium">
                        Need next <strong>{m.classesNeededFor85} classes</strong> for 85%
                      </span>
                    )}

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingSubject({
                          code: m.subjectCode,
                          name: sub?.name || m.subjectCode,
                          attended: m.attended + m.onDuty,
                          conducted: m.totalConducted
                        })}
                        className="text-blue-600 dark:text-blue-400 hover:underline text-[11px] font-semibold flex items-center gap-0.5"
                        title="Edit exact attended and total classes"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => handleQuickUndoSubjectRecord(m.subjectCode)}
                        className="text-slate-400 hover:text-slate-600 text-[11px] flex items-center gap-0.5"
                        title="Undo last recorded class"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Undo</span>
                      </button>
                    </div>
                  </div>

                  {/* Quick Tactile Taps */}
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => handleQuickAddSubjectRecord(m.subjectCode, 'present')}
                      className="min-h-[40px] rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Attended (+1)</span>
                    </button>

                    <button
                      onClick={() => handleQuickAddSubjectRecord(m.subjectCode, 'absent')}
                      className="min-h-[40px] rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 hover:bg-rose-100 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <MinusCircle className="w-3.5 h-3.5" />
                      <span>Bunked (+1)</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. TAB 3: "WHAT IF I BUNK" INTERACTIVE CALCULATOR */}
      {activeTab === 'calc' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-5">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calculator className="w-5 h-5 text-purple-600" />
              <span>"What If I Bunk?" Simulator (85% Target)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Test how skipping or attending upcoming classes will affect your attendance against the mandatory <strong>85% attendance rule</strong>.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Select Subject:
              </label>
              <select
                value={calcSelectedSubject}
                onChange={e => setCalcSelectedSubject(e.target.value)}
                className="w-full text-xs font-medium p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              >
                {subjectMetrics.map(m => {
                  const s = enrolledSubjects.find(sub => sub.code === m.subjectCode);
                  return (
                    <option key={m.subjectCode} value={m.subjectCode}>
                      {m.subjectCode} — {s?.name} ({m.percentage}%)
                    </option>
                  );
                })}
              </select>
            </div>

            {calcSubjectMetric && (
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                <div>
                  <div className="text-slate-500">Current Attendance</div>
                  <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                    {calcSubjectMetric.percentage}%
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {calcSubjectMetric.attended + calcSubjectMetric.onDuty} of {calcSubjectMetric.totalConducted} classes
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-slate-500">Safe Margin</div>
                  <div className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    {calcSubjectMetric.bunkAllowanceFor85} classes
                  </div>
                  <div className="text-[10px] text-slate-400">to maintain ≥ 85%</div>
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  <span>Upcoming Classes:</span>
                  <span className="font-mono font-bold text-indigo-600">{calcUpcomingTotal} classes</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={calcUpcomingTotal}
                  onChange={e => {
                    const val = parseInt(e.target.value);
                    setCalcUpcomingTotal(val);
                    if (calcUpcomingAttended > val) setCalcUpcomingAttended(val);
                  }}
                  className="w-full accent-indigo-600"
                />
              </div>

              <div>
                <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  <span>I Will Attend:</span>
                  <span className="font-mono font-bold text-emerald-600">
                    {calcUpcomingAttended} (Bunking {calcUpcomingTotal - calcUpcomingAttended})
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={calcUpcomingTotal}
                  value={calcUpcomingAttended}
                  onChange={e => setCalcUpcomingAttended(parseInt(e.target.value))}
                  className="w-full accent-emerald-600"
                />
              </div>
            </div>

            {/* Projection Result */}
            {calcProjection && (
              <div className={`p-4 rounded-2xl border ${
                calcProjection.meetsVTUThreshold
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                  : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider">
                      Projected Attendance Outcome
                    </div>
                    <div className="text-2xl font-black font-mono mt-0.5">
                      {calcProjection.projectedPercentage}%{' '}
                      <span className="text-xs font-normal">
                        ({calcProjection.delta >= 0 ? `+${calcProjection.delta}%` : `${calcProjection.delta}%`})
                      </span>
                    </div>
                    <p className="text-xs mt-1">
                      If you miss {calcUpcomingTotal - calcUpcomingAttended} out of {calcUpcomingTotal} upcoming classes, your new attendance will be <strong>{calcProjection.projectedPercentage}%</strong>.
                    </p>
                  </div>

                  <span className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 self-start sm:self-auto ${
                    calcProjection.meetsVTUThreshold ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                  }`}>
                    {calcProjection.meetsVTUThreshold ? '✓ Above 85% Target' : '⚠️ Shortage (< 85%)'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. TAB 4: MASTER TIMETABLE GRID (WEEKLY SCHEDULE) */}
      {activeTab === 'timetable' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-4">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              BITM MBA 3rd Sem Timetable
            </h2>
            <p className="text-xs text-slate-500">
              Odd Semester 2026-27 · Effective 16-09-2026 · Classrooms: SH2 (Sec A Finance/HR/Marketing), SH3 (Sec B), LH4 (Logistics), T2 (Data Science).
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <th className="p-2.5 font-bold">Day / Period</th>
                  {TIME_SLOTS.map(slot => (
                    <th key={slot.period} className="p-2 font-mono text-[11px]">
                      {slot.period}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {(['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] as const).map(day => (
                  <tr key={day} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="p-2.5 font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/40">
                      {day}
                    </td>
                    {TIME_SLOTS.map(slot => {
                      const matching = TIMETABLE_ENTRIES.filter(e => e.day === day && e.period === slot.period);
                      return (
                        <td key={`${day}-${slot.period}`} className="p-2 align-top">
                          {matching.length === 0 ? (
                            <span className="text-slate-300 dark:text-slate-700 text-[10px]">—</span>
                          ) : (
                            <div className="space-y-1">
                              {matching.map(e => (
                                <div
                                  key={e.id}
                                  className="text-[10px] font-mono p-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                                >
                                  <strong>{e.subjectCode.replace('MBA', '')}</strong>
                                  <div className="text-[9px] text-slate-500">{e.classroom}</div>
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Saturday Swaps List */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Saturday Working Days (Mapped Timetables)
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {SATURDAY_OVERRIDES.map(ov => (
                <div key={ov.date} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <div className="font-mono text-[10px] text-slate-500">{ov.date}</div>
                  <div className="font-bold text-slate-900 dark:text-white">{ov.mappedDay} Timetable</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 7. TAB 5: STUDENT PROFILE & ELECTIVES SETTINGS */}
      {activeTab === 'profile' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-4">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Student Profile & Electives Setup
            </h2>
            <p className="text-xs text-slate-500">
              Set your name, section, and specialization choices. Your timetable and subject list adjust immediately.
            </p>
          </div>

          {/* Preset Student Switcher */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Quick Student Presets:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                onClick={() => {
                  setStudent({
                    id: 'student-rahul',
                    name: 'Rahul Sharma',
                    email: 'rahul.mba@bitm.edu.in',
                    role: 'student',
                    usn: '3BR25MBA01',
                    section: 'A',
                    primarySpec: 'Finance',
                    dualSpec: 'Business Analytics',
                    semester: 3
                  });
                  showToast('Loaded: Rahul Sharma (Sec A, Finance + BA)');
                }}
                className="p-2 text-left rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs hover:border-blue-500"
              >
                <div className="font-bold">Rahul Sharma</div>
                <div className="text-[10px] text-slate-500">Sec A · Finance + Analytics</div>
              </button>

              <button
                onClick={() => {
                  setStudent({
                    id: 'student-priya',
                    name: 'Priya Patil',
                    email: 'priya.mba@bitm.edu.in',
                    role: 'student',
                    usn: '3BR25MBA14',
                    section: 'A',
                    primarySpec: 'Marketing',
                    dualSpec: 'Data Science',
                    semester: 3
                  });
                  showToast('Loaded: Priya Patil (Sec A, Marketing + DS)');
                }}
                className="p-2 text-left rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs hover:border-blue-500"
              >
                <div className="font-bold">Priya Patil</div>
                <div className="text-[10px] text-slate-500">Sec A · Marketing + Data Science</div>
              </button>

              <button
                onClick={() => {
                  setStudent({
                    id: 'student-venkatesh',
                    name: 'Venkatesh Prasad',
                    email: 'venkatesh.mba@bitm.edu.in',
                    role: 'student',
                    usn: '3BR25MBA32',
                    section: 'B',
                    primarySpec: 'HR',
                    dualSpec: 'Business Analytics',
                    semester: 3
                  });
                  showToast('Loaded: Venkatesh Prasad (Sec B, HR + BA)');
                }}
                className="p-2 text-left rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs hover:border-blue-500"
              >
                <div className="font-bold">Venkatesh Prasad</div>
                <div className="text-[10px] text-slate-500">Sec B · HR + Analytics</div>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Your Name:
              </label>
              <input
                type="text"
                value={student.name}
                onChange={e => setStudent(prev => ({ ...prev, name: e.target.value }))}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                University Seat Number (USN):
              </label>
              <input
                type="text"
                value={student.usn}
                onChange={e => setStudent(prev => ({ ...prev, usn: e.target.value.toUpperCase() }))}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Section:
              </label>
              <select
                value={student.section}
                onChange={e => setStudent(prev => ({ ...prev, section: e.target.value as any }))}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
              >
                <option value="A">Section A (Room SH2)</option>
                <option value="B">Section B (Room SH3)</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Target Minimum Percentage:
              </label>
              <select
                value={targetPercentage}
                onChange={e => setTargetPercentage(parseInt(e.target.value))}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold"
              >
                <option value={85}>85% (Mandatory College Minimum)</option>
                <option value={75}>75% (VTU Statutory Minimum)</option>
                <option value={90}>90% (Distinction)</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Primary Elective:
              </label>
              <select
                value={student.primarySpec}
                onChange={e => setStudent(prev => ({ ...prev, primarySpec: e.target.value as PrimarySpecialization }))}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-medium"
              >
                <option value="Finance">Finance (FM311, FM312, FM313)</option>
                <option value="Logistics & SCM">Logistics & Supply Chain (LS311, LS312, LS313 - LH4)</option>
                <option value="Marketing">Marketing (MM311, MM312, MM313)</option>
                <option value="HR">HR (HR311, HR312, HR313)</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Dual Elective:
              </label>
              <select
                value={student.dualSpec}
                onChange={e => setStudent(prev => ({ ...prev, dualSpec: e.target.value as DualSpecialization }))}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-medium"
              >
                <option value="Business Analytics">Business Analytics (BA311, BA312, BA313)</option>
                <option value="Data Science">Data Science (DS311, DS312, DS313 - T2 MBA Block)</option>
              </select>
            </div>
          </div>

          <div className="pt-3 flex justify-between items-center">
            <button
              onClick={() => {
                if (window.confirm('Reset all manual attendance records to defaults?')) {
                  window.localStorage.removeItem('bitm_student_manual_attendance');
                  window.location.reload();
                }
              }}
              className="text-xs text-rose-600 hover:underline"
            >
              Reset Data to Defaults
            </button>

            <button
              onClick={() => {
                showToast('Profile updated!');
                setActiveTab('daily');
              }}
              className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:bg-slate-800"
            >
              Save & Open Put Attendance
            </button>
          </div>
        </div>
      )}

      {/* MODAL: EDIT SUBJECT ATTENDANCE COUNTS MANUALLY */}
      {editingSubject && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 max-w-sm w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-blue-600">{editingSubject.code}</span>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">
                  Edit Attendance Numbers
                </h3>
              </div>
              <button
                onClick={() => setEditingSubject(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Type your existing attended and total conducted classes for {editingSubject.name}.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Classes Attended:
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={editingSubject.attended}
                  onChange={e => setEditingSubject({ ...editingSubject, attended: parseInt(e.target.value) || 0 })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono font-bold text-sm"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Total Classes Conducted:
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={editingSubject.conducted}
                  onChange={e => setEditingSubject({ ...editingSubject, conducted: parseInt(e.target.value) || 0 })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono font-bold text-sm"
                />
              </div>

              {editingSubject.conducted > 0 && (
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-center">
                  <span className="text-slate-500">Resulting Percentage: </span>
                  <span className={`font-mono font-bold ${
                    Math.round((editingSubject.attended / editingSubject.conducted) * 100) >= targetPercentage
                      ? 'text-emerald-600'
                      : 'text-rose-600'
                  }`}>
                    {Math.round((editingSubject.attended / editingSubject.conducted) * 100)}%
                  </span>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setEditingSubject(null)}
                className="flex-1 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCustomSubjectCounts}
                className="flex-1 py-2 text-xs font-bold rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900"
              >
                Save Counts
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
