import {
  CampusSubject,
  TimetablePeriodSlot,
  CampusAttendanceRecord,
  AcademicSettings
} from '../types/campusPulse';

export const DEFAULT_ACADEMIC_SETTINGS: AcademicSettings = {
  studentName: 'Student',
  department: 'BITM MBA (Odd Semester 2026-27)',
  semesterSection: '3rd Sem - Section "B"',
  classroomLocation: 'SH3 Civil Floor (Finance/HR/BA), LH4 (Logistics)',
  timetableEffectiveDate: '16-09-2026',
  minimumTargetPercent: 85,
  safeThresholdPercent: 90
};

/**
 * ONLY the subjects that actually have classes scheduled in the Section "B" timetable.
 * If a subject is not mentioned/scheduled in the timetable, it is NOT added here.
 */
export const CAMPUS_SUBJECTS: CampusSubject[] = [
  {
    code: 'MBALS311',
    name: 'Fundamentals of Logistics and Supply Chain Management',
    category: 'core',
    facultyName: 'Dr. Chakravathi B',
    classroom: 'LH4 Civil Floor',
    isLab: false
  },
  {
    code: 'MBALS312',
    name: 'Warehousing Management',
    category: 'core',
    facultyName: 'Dr. Christopher Raj',
    classroom: 'LH4 Civil Floor',
    isLab: false
  },
  {
    code: 'MBALS313',
    name: 'Procurement for Businesses',
    category: 'core',
    facultyName: 'Mr. Moula Hussain K',
    classroom: 'LH4 Civil Floor',
    isLab: false
  },
  {
    code: 'MBAFM311',
    name: 'Financial Institutions and Investment Banking',
    category: 'elective',
    facultyName: 'Mr. Nagaraj C',
    classroom: 'SH3 Civil Floor',
    isLab: false
  },
  {
    code: 'MBAFM312',
    name: 'Investment Management',
    category: 'elective',
    facultyName: 'Dr. Dinesh K',
    classroom: 'SH3 Civil Floor',
    isLab: false
  },
  {
    code: 'MBAFM313',
    name: 'Strategic Cost Management',
    category: 'elective',
    facultyName: 'Dr. Khaja Mohinuddeen J',
    classroom: 'SH3 Civil Floor',
    isLab: false
  },
  {
    code: 'Proctoring',
    name: 'Proctoring & Mentoring Session',
    category: 'activity',
    facultyName: 'Assigned MBA Faculty Proctor',
    classroom: 'SH3 Civil Floor',
    isLab: false
  },
  {
    code: 'Club Activity',
    name: 'Management Club Activity',
    category: 'activity',
    facultyName: 'Student Club Coordinator',
    classroom: 'SH3 Civil Floor',
    isLab: false
  }
];

/**
 * EXACT PERIOD-BY-PERIOD SCHEDULE FROM THE TIMETABLE
 * Empty/blank slots in the timetable are completely excluded (NOT added).
 */
export const WEEKLY_TIMETABLE_SLOTS: TimetablePeriodSlot[] = [
  // ===================== MONDAY (7 classes) =====================
  // P4 (11:35 - 12:25) is blank in timetable -> NOT ADDED
  {
    id: 'mon-p1',
    day: 'Mon',
    timeRange: '9:00 AM – 9:50 AM (P1)',
    durationMinutes: 50,
    subjectCode: 'MBALS313',
    subjectName: 'Procurement for Businesses',
    noteTag: 'LH4 Civil Floor • Mr. Moula Hussain K',
    isBlock: false,
    isLab: false
  },
  {
    id: 'mon-p2',
    day: 'Mon',
    timeRange: '9:50 AM – 10:40 AM (P2)',
    durationMinutes: 50,
    subjectCode: 'MBALS312',
    subjectName: 'Warehousing Management',
    noteTag: 'LH4 Civil Floor • Dr. Christopher Raj',
    isBlock: false,
    isLab: false
  },
  {
    id: 'mon-p3',
    day: 'Mon',
    timeRange: '10:45 AM – 11:35 AM (P3)',
    durationMinutes: 50,
    subjectCode: 'MBALS311',
    subjectName: 'Fundamentals of Logistics & SCM',
    noteTag: 'LH4 Civil Floor • Dr. Chakravathi B',
    isBlock: false,
    isLab: false
  },
  {
    id: 'mon-p5',
    day: 'Mon',
    timeRange: '1:15 PM – 2:05 PM (P5)',
    durationMinutes: 50,
    subjectCode: 'MBALS313',
    subjectName: 'Procurement for Businesses',
    noteTag: 'LH4 Civil Floor • Mr. Moula Hussain K',
    isBlock: false,
    isLab: false
  },
  {
    id: 'mon-p6',
    day: 'Mon',
    timeRange: '2:05 PM – 2:55 PM (P6)',
    durationMinutes: 50,
    subjectCode: 'MBAFM313',
    subjectName: 'Strategic Cost Management',
    noteTag: 'SH3 Civil Floor • Dr. Khaja Mohinuddeen J',
    isBlock: false,
    isLab: false
  },
  {
    id: 'mon-p7',
    day: 'Mon',
    timeRange: '3:00 PM – 3:50 PM (P7)',
    durationMinutes: 50,
    subjectCode: 'MBAFM312',
    subjectName: 'Investment Management',
    noteTag: 'SH3 Civil Floor • Dr. Dinesh K',
    isBlock: false,
    isLab: false
  },
  {
    id: 'mon-p8',
    day: 'Mon',
    timeRange: '3:50 PM – 4:40 PM (P8)',
    durationMinutes: 50,
    subjectCode: 'MBAFM312',
    subjectName: 'Investment Management',
    noteTag: 'SH3 Civil Floor • Dr. Dinesh K',
    isBlock: false,
    isLab: false
  },

  // ===================== TUESDAY (7 classes) =====================
  // P6 (2:05 - 2:55 PM) is blank in timetable -> NOT ADDED
  {
    id: 'tue-p1',
    day: 'Tue',
    timeRange: '9:00 AM – 9:50 AM (P1)',
    durationMinutes: 50,
    subjectCode: 'MBAFM311',
    subjectName: 'Financial Institutions & Investment Banking',
    noteTag: 'SH3 Civil Floor • Mr. Nagaraj C',
    isBlock: false,
    isLab: false
  },
  {
    id: 'tue-p2',
    day: 'Tue',
    timeRange: '9:50 AM – 10:40 AM (P2)',
    durationMinutes: 50,
    subjectCode: 'MBAFM313',
    subjectName: 'Strategic Cost Management',
    noteTag: 'SH3 Civil Floor • Dr. Khaja Mohinuddeen J',
    isBlock: false,
    isLab: false
  },
  {
    id: 'tue-p3',
    day: 'Tue',
    timeRange: '10:45 AM – 11:35 AM (P3)',
    durationMinutes: 50,
    subjectCode: 'MBAFM311',
    subjectName: 'Financial Institutions & Investment Banking',
    noteTag: 'SH3 Civil Floor • Mr. Nagaraj C',
    isBlock: false,
    isLab: false
  },
  {
    id: 'tue-p4',
    day: 'Tue',
    timeRange: '11:35 AM – 12:25 PM (P4)',
    durationMinutes: 50,
    subjectCode: 'MBALS313',
    subjectName: 'Procurement for Businesses',
    noteTag: 'LH4 Civil Floor • Mr. Moula Hussain K',
    isBlock: false,
    isLab: false
  },
  {
    id: 'tue-p5',
    day: 'Tue',
    timeRange: '1:15 PM – 2:05 PM (P5)',
    durationMinutes: 50,
    subjectCode: 'MBALS311',
    subjectName: 'Fundamentals of Logistics & SCM',
    noteTag: 'LH4 Civil Floor • Dr. Chakravathi B',
    isBlock: false,
    isLab: false
  },
  {
    id: 'tue-p7',
    day: 'Tue',
    timeRange: '3:00 PM – 3:50 PM (P7)',
    durationMinutes: 50,
    subjectCode: 'MBALS312',
    subjectName: 'Warehousing Management',
    noteTag: 'LH4 Civil Floor • Dr. Christopher Raj',
    isBlock: false,
    isLab: false
  },
  {
    id: 'tue-p8',
    day: 'Tue',
    timeRange: '3:50 PM – 4:40 PM (P8)',
    durationMinutes: 50,
    subjectCode: 'Proctoring',
    subjectName: 'Proctoring & Mentoring',
    noteTag: 'SH3 Civil Floor • Assigned Faculty Proctor',
    isBlock: false,
    isLab: false
  },

  // ===================== WEDNESDAY (6 classes) =====================
  // P1 (9:00 - 9:50 AM) and P6 (2:05 - 2:55 PM) are blank in timetable -> NOT ADDED
  {
    id: 'wed-p2',
    day: 'Wed',
    timeRange: '9:50 AM – 10:40 AM (P2)',
    durationMinutes: 50,
    subjectCode: 'MBALS312',
    subjectName: 'Warehousing Management',
    noteTag: 'LH4 Civil Floor • Dr. Christopher Raj',
    isBlock: false,
    isLab: false
  },
  {
    id: 'wed-p3',
    day: 'Wed',
    timeRange: '10:45 AM – 11:35 AM (P3)',
    durationMinutes: 50,
    subjectCode: 'MBALS313',
    subjectName: 'Procurement for Businesses',
    noteTag: 'LH4 Civil Floor • Mr. Moula Hussain K',
    isBlock: false,
    isLab: false
  },
  {
    id: 'wed-p4',
    day: 'Wed',
    timeRange: '11:35 AM – 12:25 PM (P4)',
    durationMinutes: 50,
    subjectCode: 'MBALS311',
    subjectName: 'Fundamentals of Logistics & SCM',
    noteTag: 'LH4 Civil Floor • Dr. Chakravathi B',
    isBlock: false,
    isLab: false
  },
  {
    id: 'wed-p5',
    day: 'Wed',
    timeRange: '1:15 PM – 2:05 PM (P5)',
    durationMinutes: 50,
    subjectCode: 'MBALS312',
    subjectName: 'Warehousing Management',
    noteTag: 'LH4 Civil Floor • Dr. Christopher Raj',
    isBlock: false,
    isLab: false
  },
  {
    id: 'wed-p7',
    day: 'Wed',
    timeRange: '3:00 PM – 3:50 PM (P7)',
    durationMinutes: 50,
    subjectCode: 'MBALS311',
    subjectName: 'Fundamentals of Logistics & SCM',
    noteTag: 'LH4 Civil Floor • Dr. Chakravathi B',
    isBlock: false,
    isLab: false
  },
  {
    id: 'wed-p8',
    day: 'Wed',
    timeRange: '3:50 PM – 4:40 PM (P8)',
    durationMinutes: 50,
    subjectCode: 'MBAFM312',
    subjectName: 'Investment Management',
    noteTag: 'SH3 Civil Floor • Dr. Dinesh K',
    isBlock: false,
    isLab: false
  },

  // ===================== THURSDAY (ONLY 2 classes) =====================
  // P1, P2, P3, P4, P6, P8 are blank in timetable -> NOT ADDED
  {
    id: 'thu-p5',
    day: 'Thu',
    timeRange: '1:15 PM – 2:05 PM (P5)',
    durationMinutes: 50,
    subjectCode: 'MBAFM311',
    subjectName: 'Financial Institutions & Investment Banking',
    noteTag: 'SH3 Civil Floor • Mr. Nagaraj C',
    isBlock: false,
    isLab: false
  },
  {
    id: 'thu-p7',
    day: 'Thu',
    timeRange: '3:00 PM – 3:50 PM (P7)',
    durationMinutes: 50,
    subjectCode: 'MBAFM311',
    subjectName: 'Financial Institutions & Investment Banking',
    noteTag: 'SH3 Civil Floor • Mr. Nagaraj C',
    isBlock: false,
    isLab: false
  },

  // ===================== FRIDAY (ONLY 4 classes) =====================
  // P1, P3, P5, P8 are blank in timetable -> NOT ADDED
  {
    id: 'fri-p2',
    day: 'Fri',
    timeRange: '9:50 AM – 10:40 AM (P2)',
    durationMinutes: 50,
    subjectCode: 'Club Activity',
    subjectName: 'Management Club Activity',
    noteTag: 'SH3 Civil Floor • Activity Session',
    isBlock: false,
    isLab: false
  },
  {
    id: 'fri-p4',
    day: 'Fri',
    timeRange: '11:35 AM – 12:25 PM (P4)',
    durationMinutes: 50,
    subjectCode: 'MBAFM313',
    subjectName: 'Strategic Cost Management',
    noteTag: 'SH3 Civil Floor • Dr. Khaja Mohinuddeen J',
    isBlock: false,
    isLab: false
  },
  {
    id: 'fri-p6',
    day: 'Fri',
    timeRange: '2:05 PM – 2:55 PM (P6)',
    durationMinutes: 50,
    subjectCode: 'MBAFM313',
    subjectName: 'Strategic Cost Management',
    noteTag: 'SH3 Civil Floor • Dr. Khaja Mohinuddeen J',
    isBlock: false,
    isLab: false
  },
  {
    id: 'fri-p7',
    day: 'Fri',
    timeRange: '3:00 PM – 3:50 PM (P7)',
    durationMinutes: 50,
    subjectCode: 'MBAFM312',
    subjectName: 'Investment Management',
    noteTag: 'SH3 Civil Floor • Dr. Dinesh K',
    isBlock: false,
    isLab: false
  }
];

/**
 * EXACT SATURDAY EXTRA WORKING DAYS OVERRIDES FROM FOOTER OF TIMETABLE
 */
export const SATURDAY_SCHEDULE_MAPPINGS = [
  { date: '2026-09-26', mappedDay: 'Mon', note: 'Mon Timetable' },
  { date: '2026-10-24', mappedDay: 'Tue', note: 'Tue Timetable' },
  { date: '2026-10-31', mappedDay: 'Wed', note: 'Wed Timetable' },
  { date: '2026-11-14', mappedDay: 'Thu', note: 'Thur Timetable' },
  { date: '2026-11-28', mappedDay: 'Fri', note: 'Fri Timetable' },
  { date: '2026-12-12', mappedDay: 'Mon', note: 'Mon Timetable' },
  { date: '2026-12-26', mappedDay: 'Tue', note: 'Tue Timetable' },
  { date: '2027-01-09', mappedDay: 'Wed', note: 'Wed Timetable' },
  { date: '2027-01-23', mappedDay: 'Thu', note: 'Thur Timetable' },
  { date: '2027-02-13', mappedDay: 'Fri', note: 'Fri Timetable' },
  { date: '2027-02-27', mappedDay: 'Mon', note: 'Mon Timetable' },
  { date: '2027-03-13', mappedDay: 'Tue', note: 'Tue Timetable' }
];

/**
 * Generates sample data ONLY for the 8 active subjects in the Section B timetable.
 */
export function generateSampleScreenshotDataset(): CampusAttendanceRecord[] {
  const records: CampusAttendanceRecord[] = [];
  let recordId = 1;

  // MBALS311: 30 conducted, 27 present, 3 absent (90.0%)
  for (let i = 0; i < 27; i++) {
    records.push({ id: `rec-${recordId++}`, date: '2026-09-21', periodId: 'mon-p3', subjectCode: 'MBALS311', status: 'present', timestamp: new Date().toISOString() });
  }
  for (let i = 0; i < 3; i++) {
    records.push({ id: `rec-${recordId++}`, date: '2026-09-22', periodId: 'mon-p3', subjectCode: 'MBALS311', status: 'absent', timestamp: new Date().toISOString() });
  }

  // MBALS312: 32 conducted, 28 present, 4 absent (87.5%)
  for (let i = 0; i < 28; i++) {
    records.push({ id: `rec-${recordId++}`, date: '2026-09-21', periodId: 'mon-p2', subjectCode: 'MBALS312', status: 'present', timestamp: new Date().toISOString() });
  }
  for (let i = 0; i < 4; i++) {
    records.push({ id: `rec-${recordId++}`, date: '2026-09-22', periodId: 'mon-p2', subjectCode: 'MBALS312', status: 'absent', timestamp: new Date().toISOString() });
  }

  // MBALS313: 35 conducted, 31 present, 4 absent (88.6%)
  for (let i = 0; i < 31; i++) {
    records.push({ id: `rec-${recordId++}`, date: '2026-09-21', periodId: 'mon-p1', subjectCode: 'MBALS313', status: 'present', timestamp: new Date().toISOString() });
  }
  for (let i = 0; i < 4; i++) {
    records.push({ id: `rec-${recordId++}`, date: '2026-09-22', periodId: 'mon-p1', subjectCode: 'MBALS313', status: 'absent', timestamp: new Date().toISOString() });
  }

  // MBAFM311: 28 conducted, 24 present, 4 absent (85.7%)
  for (let i = 0; i < 24; i++) {
    records.push({ id: `rec-${recordId++}`, date: '2026-09-22', periodId: 'tue-p1', subjectCode: 'MBAFM311', status: 'present', timestamp: new Date().toISOString() });
  }
  for (let i = 0; i < 4; i++) {
    records.push({ id: `rec-${recordId++}`, date: '2026-09-22', periodId: 'tue-p1', subjectCode: 'MBAFM311', status: 'absent', timestamp: new Date().toISOString() });
  }

  // MBAFM312: 36 conducted, 31 present, 5 absent (86.1%)
  for (let i = 0; i < 31; i++) {
    records.push({ id: `rec-${recordId++}`, date: '2026-09-21', periodId: 'mon-p7', subjectCode: 'MBAFM312', status: 'present', timestamp: new Date().toISOString() });
  }
  for (let i = 0; i < 5; i++) {
    records.push({ id: `rec-${recordId++}`, date: '2026-09-21', periodId: 'mon-p7', subjectCode: 'MBAFM312', status: 'absent', timestamp: new Date().toISOString() });
  }

  // MBAFM313: 31 conducted, 26 present, 5 absent (83.9% - Warning zone)
  for (let i = 0; i < 26; i++) {
    records.push({ id: `rec-${recordId++}`, date: '2026-09-21', periodId: 'mon-p6', subjectCode: 'MBAFM313', status: 'present', timestamp: new Date().toISOString() });
  }
  for (let i = 0; i < 5; i++) {
    records.push({ id: `rec-${recordId++}`, date: '2026-09-21', periodId: 'mon-p6', subjectCode: 'MBAFM313', status: 'absent', timestamp: new Date().toISOString() });
  }

  // Proctoring: 4 conducted, 4 present (100%)
  for (let i = 0; i < 4; i++) {
    records.push({ id: `rec-${recordId++}`, date: '2026-09-22', periodId: 'tue-p8', subjectCode: 'Proctoring', status: 'present', timestamp: new Date().toISOString() });
  }

  // Club Activity: 4 conducted, 4 present (100%)
  for (let i = 0; i < 4; i++) {
    records.push({ id: `rec-${recordId++}`, date: '2026-09-25', periodId: 'fri-p2', subjectCode: 'Club Activity', status: 'present', timestamp: new Date().toISOString() });
  }

  return records;
}

export interface TimetableCell {
  periodNum: number;
  timeRange: string;
  code: string | null;
  name: string | null;
  faculty: string | null;
  room: string | null;
  isBreak?: boolean;
  breakLabel?: string;
}

export interface DayScheduleRow {
  day: 'Mon' | 'Tues' | 'Wed' | 'Thu' | 'Fri' | 'Sat';
  label: string;
  cells: (TimetableCell | null)[];
}

export const TIMETABLE_PERIOD_HEADERS = [
  { period: 1, time: '9:00 am to 9:50 am' },
  { period: 2, time: '9:50 am to 10:40 am' },
  { break: true, label: 'Break 5 min\n(10:40 – 10:45)' },
  { period: 3, time: '10:45 to 11:35 am' },
  { period: 4, time: '11:35 am to 12:25' },
  { break: true, label: 'Lunch Break\n(12:25 – 1:15 pm)' },
  { period: 5, time: '1:15 pm to 2:05 pm' },
  { period: 6, time: '2:05 pm to 2:55 pm' },
  { break: true, label: 'Break 5 min\n(2:55 – 3:00)' },
  { period: 7, time: '3:00 pm to 3:50 pm' },
  { period: 8, time: '3:50 pm to 4:40 pm' }
];

export const OFFICIAL_TIMETABLE_GRID: DayScheduleRow[] = [
  {
    day: 'Mon',
    label: 'Monday',
    cells: [
      { periodNum: 1, timeRange: '9:00 am to 9:50 am', code: 'LS313', name: 'Procurement for Businesses', faculty: 'Mr. Moula Hussain K', room: 'LH4 Civil Floor' },
      { periodNum: 2, timeRange: '9:50 am to 10:40 am', code: 'LS312', name: 'Warehousing Management', faculty: 'Dr. Christopher Raj', room: 'LH4 Civil Floor' },
      { periodNum: 3, timeRange: '10:45 to 11:35 am', code: 'LS311', name: 'Fundamentals of Logistics and Supply Chain Management', faculty: 'Dr. Chakravathi B', room: 'LH4 Civil Floor' },
      null, // P4 Blank: NO CLASS
      { periodNum: 5, timeRange: '1:15 pm to 2:05 pm', code: 'LS313', name: 'Procurement for Businesses', faculty: 'Mr. Moula Hussain K', room: 'LH4 Civil Floor' },
      { periodNum: 6, timeRange: '2:05 pm to 2:55 pm', code: 'FM313', name: 'Strategic Cost Management', faculty: 'Dr. Khaja Mohinuddeen J', room: 'SH3 Civil Floor' },
      { periodNum: 7, timeRange: '3:00 pm to 3:50 pm', code: 'FM312', name: 'Investment Management', faculty: 'Dr. Dinesh K', room: 'SH3 Civil Floor' },
      { periodNum: 8, timeRange: '3:50 pm to 4:40 pm', code: 'FM312', name: 'Investment Management', faculty: 'Dr. Dinesh K', room: 'SH3 Civil Floor' }
    ]
  },
  {
    day: 'Tues',
    label: 'Tuesday',
    cells: [
      { periodNum: 1, timeRange: '9:00 am to 9:50 am', code: 'FM311', name: 'Financial Institutions and Investment Banking', faculty: 'Mr. Nagaraj C', room: 'SH3 Civil Floor' },
      { periodNum: 2, timeRange: '9:50 am to 10:40 am', code: 'FM313', name: 'Strategic Cost Management', faculty: 'Dr. Khaja Mohinuddeen J', room: 'SH3 Civil Floor' },
      { periodNum: 3, timeRange: '10:45 to 11:35 am', code: 'FM311', name: 'Financial Institutions and Investment Banking', faculty: 'Mr. Nagaraj C', room: 'SH3 Civil Floor' },
      { periodNum: 4, timeRange: '11:35 am to 12:25', code: 'LS313', name: 'Procurement for Businesses', faculty: 'Mr. Moula Hussain K', room: 'LH4 Civil Floor' },
      { periodNum: 5, timeRange: '1:15 pm to 2:05 pm', code: 'LS311', name: 'Fundamentals of Logistics and Supply Chain Management', faculty: 'Dr. Chakravathi B', room: 'LH4 Civil Floor' },
      null, // P6 Blank: NO CLASS
      { periodNum: 7, timeRange: '3:00 pm to 3:50 pm', code: 'LS312', name: 'Warehousing Management', faculty: 'Dr. Christopher Raj', room: 'LH4 Civil Floor' },
      { periodNum: 8, timeRange: '3:50 pm to 4:40 pm', code: 'Proctoring', name: 'Proctoring & Mentoring Session', faculty: 'Assigned MBA Faculty Proctor', room: 'SH3 Civil Floor' }
    ]
  },
  {
    day: 'Wed',
    label: 'Wednesday',
    cells: [
      null, // P1 Blank: NO CLASS
      { periodNum: 2, timeRange: '9:50 am to 10:40 am', code: 'LS312', name: 'Warehousing Management', faculty: 'Dr. Christopher Raj', room: 'LH4 Civil Floor' },
      { periodNum: 3, timeRange: '10:45 to 11:35 am', code: 'LS313', name: 'Procurement for Businesses', faculty: 'Mr. Moula Hussain K', room: 'LH4 Civil Floor' },
      { periodNum: 4, timeRange: '11:35 am to 12:25', code: 'LS311', name: 'Fundamentals of Logistics and Supply Chain Management', faculty: 'Dr. Chakravathi B', room: 'LH4 Civil Floor' },
      { periodNum: 5, timeRange: '1:15 pm to 2:05 pm', code: 'LS312', name: 'Warehousing Management', faculty: 'Dr. Christopher Raj', room: 'LH4 Civil Floor' },
      null, // P6 Blank: NO CLASS
      { periodNum: 7, timeRange: '3:00 pm to 3:50 pm', code: 'LS311', name: 'Fundamentals of Logistics and Supply Chain Management', faculty: 'Dr. Chakravathi B', room: 'LH4 Civil Floor' },
      { periodNum: 8, timeRange: '3:50 pm to 4:40 pm', code: 'FM312', name: 'Investment Management', faculty: 'Dr. Dinesh K', room: 'SH3 Civil Floor' }
    ]
  },
  {
    day: 'Thu',
    label: 'Thursday',
    cells: [
      null, // P1 Blank: NO CLASS
      null, // P2 Blank: NO CLASS
      null, // P3 Blank: NO CLASS
      null, // P4 Blank: NO CLASS
      { periodNum: 5, timeRange: '1:15 pm to 2:05 pm', code: 'FM311', name: 'Financial Institutions and Investment Banking', faculty: 'Mr. Nagaraj C', room: 'SH3 Civil Floor' },
      null, // P6 Blank: NO CLASS
      { periodNum: 7, timeRange: '3:00 pm to 3:50 pm', code: 'FM311', name: 'Financial Institutions and Investment Banking', faculty: 'Mr. Nagaraj C', room: 'SH3 Civil Floor' },
      null  // P8 Blank: NO CLASS
    ]
  },
  {
    day: 'Fri',
    label: 'Friday',
    cells: [
      null, // P1 Blank: NO CLASS
      { periodNum: 2, timeRange: '9:50 am to 10:40 am', code: 'Club Activity', name: 'Management Club Activity', faculty: 'Student Club Coordinator', room: 'SH3 Civil Floor' },
      null, // P3 Blank: NO CLASS
      { periodNum: 4, timeRange: '11:35 am to 12:25', code: 'FM313', name: 'Strategic Cost Management', faculty: 'Dr. Khaja Mohinuddeen J', room: 'SH3 Civil Floor' },
      null, // P5 Blank: NO CLASS
      { periodNum: 6, timeRange: '2:05 pm to 2:55 pm', code: 'FM313', name: 'Strategic Cost Management', faculty: 'Dr. Khaja Mohinuddeen J', room: 'SH3 Civil Floor' },
      { periodNum: 7, timeRange: '3:00 pm to 3:50 pm', code: 'FM312', name: 'Investment Management', faculty: 'Dr. Dinesh K', room: 'SH3 Civil Floor' },
      null  // P8 Blank: NO CLASS
    ]
  }
];
