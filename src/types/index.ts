export type Role = 'admin' | 'faculty' | 'student' | 'proctor';

export type PrimarySpecialization = 'Finance' | 'HR' | 'Marketing' | 'Logistics & SCM';
export type DualSpecialization = 'Business Analytics' | 'Data Science';

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'od' | 'cancelled'; // cancelled = class not held

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  avatarUrl?: string;
  // Specific to students
  usn?: string;
  section?: 'A' | 'B';
  primarySpec?: PrimarySpecialization;
  dualSpec?: DualSpecialization;
  proctorId?: string;
  semester?: number;
  // Specific to faculty
  designation?: string;
  department?: string;
}

export interface Subject {
  code: string;
  name: string;
  facultyName: string;
  facultyId: string;
  credits: number;
  category: 'core' | 'finance' | 'hr' | 'marketing' | 'logistics' | 'analytics' | 'datascience' | 'general';
  classroom: string; // e.g. SH2, SH3, LH4, T2 MBA Block
  section?: 'A' | 'B' | 'Both';
}

export type DayOfWeek = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

export interface TimeSlot {
  id: string;
  period: string; // P1, P2, P3, P4, P5, P6, P7, P8
  startTime: string; // "09:00"
  endTime: string;   // "09:50"
  label: string;     // "09:00 - 09:50"
  isBreak?: boolean;
}

export interface TimetableEntry {
  id: string;
  day: DayOfWeek;
  period: string; // P1..P8
  subjectCode: string;
  classroom: string;
  facultyId: string;
  section: 'A' | 'B' | 'Both';
  specializationGroup?: PrimarySpecialization | DualSpecialization | 'All';
  isParallelSlot?: boolean;
}

export interface SaturdayOverride {
  date: string; // "YYYY-MM-DD" e.g. "2026-09-26"
  mappedDay: DayOfWeek; // e.g. "Mon"
  description: string; // "Mon timetable mapped for 26/09/2026"
}

export interface ClassSession {
  id: string;
  date: string; // YYYY-MM-DD
  period: string;
  subjectCode: string;
  facultyId: string;
  section: 'A' | 'B';
  classroom: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  qrCodeToken?: string;
  qrExpiresAt?: number;
  secretPin?: string;
  geofenceRadiusMeters?: number; // e.g., 100m around BITM MBA block
  createdAt: string;
  finalizedAt?: string;
  allowEditUntil?: string; // 24 hours after creation
}

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  studentId: string;
  subjectCode: string;
  date: string;
  period: string;
  status: AttendanceStatus;
  markedBy: 'student' | 'faculty' | 'qr_scan' | 'proctor' | 'system_od';
  markedAt: string;
  updatedAt?: string;
  updatedBy?: string;
  editReason?: string;
  latitude?: number;
  longitude?: number;
  deviceId?: string;
  synced?: boolean; // Offline sync flag
}

export interface LeaveRequest {
  id: string;
  studentId: string;
  studentName: string;
  usn: string;
  type: 'medical' | 'on_duty' | 'personal' | 'placement';
  startDate: string;
  endDate: string;
  affectedSlots: { date: string; period: string; subjectCode: string }[];
  reason: string;
  attachmentName?: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: string;
  reviewRemarks?: string;
}

export interface ProctorNote {
  id: string;
  proctorId: string;
  studentId: string;
  date: string;
  category: 'attendance_warning' | 'academic' | 'parent_call' | 'general';
  note: string;
  parentContacted: boolean;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: 'CREATE_SESSION' | 'MARK_ATTENDANCE' | 'UPDATE_ATTENDANCE' | 'APPROVE_LEAVE' | 'IMPORT_TIMETABLE' | 'MANUAL_OVERRIDE';
  details: string;
  ipAddress?: string;
}
