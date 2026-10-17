export type ThemePalette = 'ocean' | 'crimson' | 'emerald' | 'amber' | 'indigo';

export type AppearanceMode = 'light' | 'dark' | 'system';

export type AppView =
  | 'dashboard'
  | 'timetable'
  | 'weekly_timetable'
  | 'calendar'
  | 'subjects'
  | 'reports'
  | 'backup'
  | 'settings';

export type AttendanceActionStatus = 'present' | 'absent' | 'cancelled' | 'holiday';

export type DayScheduleMode = 'Normal Classes' | 'Exam' | 'Event' | 'Holiday';
export type WeekdayTimetableDay = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri';

export interface CampusSubject {
  code: string;
  name: string;
  category: 'core' | 'lab' | 'aptitude' | 'elective' | 'activity';
  facultyName?: string;
  classroom?: string;
  isLab?: boolean;
}

export interface TimetablePeriodSlot {
  id: string;
  day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat';
  timeRange: string;
  durationMinutes: number;
  subjectCode: string;
  subjectName: string;
  noteTag?: string;
  isBlock?: boolean;
  isLab?: boolean;
}

export interface CampusAttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  periodId: string;
  subjectCode: string;
  status: AttendanceActionStatus;
  timestamp: string;
  note?: string;
}

export interface AcademicSettings {
  studentName: string;
  department: string;
  semesterSection: string;
  classroomLocation: string;
  timetableEffectiveDate: string;
  minimumTargetPercent: number; // e.g. 75
  safeThresholdPercent: number; // e.g. 85
}
