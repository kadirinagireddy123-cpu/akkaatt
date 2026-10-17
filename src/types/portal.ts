export type ThemeColor = 'ocean' | 'cyan' | 'purple' | 'emerald' | 'amber' | 'rose';

export type DayScheduleMode = 'Normal Classes' | 'Exam Day' | 'College Fest/Event' | 'Holiday';

export type PeriodAttendanceStatus = 'pending' | 'present' | 'absent' | 'cancelled';

export interface StudentProfile {
  name: string;
  usn: string;
  department: string;
  semesterSection: string;
  assignedClassroom: string;
  labBatch: string;
  minThreshold: number; // default 85%
  safeZoneTarget: number; // default 90%
}

export interface ClassPeriodSlot {
  id: string;
  periodNumber: number; // 1..8
  periodLabel: string; // P1..P8
  timeRange: string; // "09:00 AM - 09:50 AM"
  subjectCode: string;
  subjectName: string;
  facultyName: string;
  classroom: string;
  credits: number;
  isLab?: boolean;
  labSpanPeriods?: number; // e.g. 3 continuous periods
  labCredit?: string;
  status: PeriodAttendanceStatus;
  exchangedWithFaculty?: string;
  exchangedSubjectCode?: string;
}

export interface LecturerExchange {
  id: string;
  date: string;
  timeRange: string;
  originalSubjectCode: string;
  originalSubjectName: string;
  originalFaculty: string;
  exchangedSubjectCode: string;
  exchangedSubjectName: string;
  exchangedFaculty: string;
  reason: string;
  status: 'present' | 'absent';
}

export interface DayAttendanceLog {
  date: string; // YYYY-MM-DD
  dayOfWeek: string; // Monday, Tuesday, ...
  mode: DayScheduleMode;
  appliedDayRoutine?: string; // For Saturday swap: "Monday", "Tuesday", etc.
  periods: ClassPeriodSlot[];
}

export interface SubjectStats {
  code: string;
  name: string;
  facultyName: string;
  classroom: string;
  conducted: number;
  present: number;
  absent: number;
  cancelled: number;
}
