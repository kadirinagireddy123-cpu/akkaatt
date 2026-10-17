import {
  Subject,
  TimeSlot,
  TimetableEntry,
  SaturdayOverride,
  User,
  AttendanceRecord,
  LeaveRequest,
  ProctorNote,
  AuditLog
} from '../types';

export const BITM_CAMPUS_COORDS = {
  latitude: 15.1394, // Ballari, Karnataka
  longitude: 76.9214,
  radiusMeters: 250, // BITM campus perimeter
};

export const TIME_SLOTS: TimeSlot[] = [
  { id: 'P1', period: 'P1', startTime: '09:00', endTime: '09:50', label: '09:00 - 09:50' },
  { id: 'P2', period: 'P2', startTime: '09:50', endTime: '10:40', label: '09:50 - 10:40' },
  // Short break 10:40-10:45
  { id: 'P3', period: 'P3', startTime: '10:45', endTime: '11:35', label: '10:45 - 11:35' },
  { id: 'P4', period: 'P4', startTime: '11:35', endTime: '12:25', label: '11:35 - 12:25' },
  // Lunch break 12:25-13:15
  { id: 'P5', period: 'P5', startTime: '13:15', endTime: '14:05', label: '13:15 - 14:05' },
  { id: 'P6', period: 'P6', startTime: '14:05', endTime: '14:55', label: '14:05 - 14:55' },
  // Short break 14:55-15:00
  { id: 'P7', period: 'P7', startTime: '15:00', endTime: '15:50', label: '15:00 - 15:50' },
  { id: 'P8', period: 'P8', startTime: '15:50', endTime: '16:40', label: '15:50 - 16:40' },
];

export const SUBJECTS: Subject[] = [
  // Business Analytics (Dual)
  {
    code: 'MBABA311',
    name: 'Data Analytics for Managers',
    facultyName: 'Mrs. Prathiba Mishra',
    facultyId: 'fac-pm',
    credits: 4,
    category: 'analytics',
    classroom: 'SH3',
    section: 'B'
  },
  {
    code: 'MBABA312',
    name: 'Database Management System',
    facultyName: 'Mr. Kiran Mudaraddi',
    facultyId: 'fac-km',
    credits: 4,
    category: 'analytics',
    classroom: 'SH3',
    section: 'B'
  },
  {
    code: 'MBABA313',
    name: 'Python Programming for Managers',
    facultyName: 'Ms. Manjula Kaur',
    facultyId: 'fac-mk',
    credits: 4,
    category: 'analytics',
    classroom: 'SH3',
    section: 'B'
  },
  // Data Science (Dual)
  {
    code: 'MBADS311',
    name: 'AI & DS for Managers',
    facultyName: 'Mrs. Varada Alekya',
    facultyId: 'fac-va',
    credits: 4,
    category: 'datascience',
    classroom: 'T2 MBA Block',
    section: 'Both'
  },
  {
    code: 'MBADS312',
    name: 'Python for Managers',
    facultyName: 'Mrs. Shwethashree',
    facultyId: 'fac-shw',
    credits: 4,
    category: 'datascience',
    classroom: 'T2 MBA Block',
    section: 'Both'
  },
  {
    code: 'MBADS313',
    name: 'Business Data Management System',
    facultyName: 'Mr. Kiran Mudaraddi',
    facultyId: 'fac-km',
    credits: 4,
    category: 'datascience',
    classroom: 'T2 MBA Block',
    section: 'Both'
  },
  // Logistics & Supply Chain (Primary)
  {
    code: 'MBALS311',
    name: 'Fundamentals of Logistics & Supply Chain Mgmt',
    facultyName: 'Dr. Chakravarthi B / Mr. K S Murthy',
    facultyId: 'fac-ksm',
    credits: 4,
    category: 'logistics',
    classroom: 'LH4',
    section: 'Both'
  },
  {
    code: 'MBALS312',
    name: 'Warehousing Management',
    facultyName: 'Dr. Christopher Raj / Mr. K S Murthy',
    facultyId: 'fac-cr',
    credits: 4,
    category: 'logistics',
    classroom: 'LH4',
    section: 'Both'
  },
  {
    code: 'MBALS313',
    name: 'Procurement for Businesses',
    facultyName: 'Mr. Moula Hussain K / Mr. K S Murthy',
    facultyId: 'fac-mhk',
    credits: 4,
    category: 'logistics',
    classroom: 'LH4',
    section: 'Both'
  },
  // Finance (Primary)
  {
    code: 'MBAFM311',
    name: 'Financial Institutions & Investment Banking',
    facultyName: 'Mr. Nagaraj C / Dr. Sathik S',
    facultyId: 'fac-nc',
    credits: 4,
    category: 'finance',
    classroom: 'SH2',
    section: 'Both'
  },
  {
    code: 'MBAFM312',
    name: 'Investment Management',
    facultyName: 'Dr. Dinesh K',
    facultyId: 'fac-dk',
    credits: 4,
    category: 'finance',
    classroom: 'SH2',
    section: 'Both'
  },
  {
    code: 'MBAFM313',
    name: 'Strategic Cost Management',
    facultyName: 'Dr. Khaja Mohinuddeen J / Dr. Pavan Kumar S.S',
    facultyId: 'fac-kmj',
    credits: 4,
    category: 'finance',
    classroom: 'SH2',
    section: 'Both'
  },
  // Marketing (Primary)
  {
    code: 'MBAMM311',
    name: 'Behavioural Marketing',
    facultyName: 'Dr. Shaheeda Banu S',
    facultyId: 'fac-sbs',
    credits: 4,
    category: 'marketing',
    classroom: 'SH2',
    section: 'Both'
  },
  {
    code: 'MBAMM312',
    name: 'Sales & Retail Management',
    facultyName: 'Dr. Mallesha L',
    facultyId: 'fac-ml',
    credits: 4,
    category: 'marketing',
    classroom: 'SH2',
    section: 'Both'
  },
  {
    code: 'MBAMM313',
    name: 'Services Marketing',
    facultyName: 'Dr. Ravi Kumar J S',
    facultyId: 'fac-rk',
    credits: 4,
    category: 'marketing',
    classroom: 'SH2',
    section: 'Both'
  },
  // HR (Primary)
  {
    code: 'MBAHR311',
    name: 'Talent Acquisition',
    facultyName: 'Ms. Kavita C A',
    facultyId: 'fac-kca',
    credits: 4,
    category: 'hr',
    classroom: 'SH2',
    section: 'Both'
  },
  {
    code: 'MBAHR312',
    name: 'HR Analytics',
    facultyName: 'Dr. Mahesh Kumar C A',
    facultyId: 'fac-mkc',
    credits: 4,
    category: 'hr',
    classroom: 'SH2',
    section: 'Both'
  },
  {
    code: 'MBAHR313',
    name: 'Industrial Relations & Labour Laws',
    facultyName: 'Mrs. Vishnu Priya',
    facultyId: 'fac-vp',
    credits: 4,
    category: 'hr',
    classroom: 'SH2',
    section: 'Both'
  },
  // General Aptitude & Non-academic
  {
    code: '22MBAAT308',
    name: 'Business Aptitude',
    facultyName: 'Prof. Kavita Achchahalli',
    facultyId: 'fac-ka',
    credits: 2,
    category: 'general',
    classroom: 'SH2',
    section: 'Both'
  },
  {
    code: 'CLUB301',
    name: 'Club Activity',
    facultyName: 'Department Coordinators',
    facultyId: 'fac-club',
    credits: 0,
    category: 'general',
    classroom: 'Auditorium / Quadrangle',
    section: 'Both'
  },
  {
    code: 'PROC301',
    name: 'Proctoring / Mentorship',
    facultyName: 'Designated Faculty Mentors',
    facultyId: 'fac-proc',
    credits: 0,
    category: 'general',
    classroom: 'Department Seminar Hall',
    section: 'Both'
  }
];

// Saturday Extra Working Days explicitly listed in the photo:
export const SATURDAY_OVERRIDES: SaturdayOverride[] = [
  { date: '2026-09-26', mappedDay: 'Mon', description: 'Mon Timetable mapped (26/09/2026)' },
  { date: '2026-10-24', mappedDay: 'Tue', description: 'Tue Timetable mapped (24/10/2026)' },
  { date: '2026-10-31', mappedDay: 'Wed', description: 'Wed Timetable mapped (31/10/2026)' },
  { date: '2026-11-14', mappedDay: 'Thu', description: 'Thu Timetable mapped (14/11/2026)' },
  { date: '2026-11-28', mappedDay: 'Fri', description: 'Fri Timetable mapped (28/11/2026)' },
  { date: '2026-12-12', mappedDay: 'Mon', description: 'Mon Timetable mapped (12/12/2026)' },
  { date: '2026-12-26', mappedDay: 'Tue', description: 'Tue Timetable mapped (26/12/2026)' },
  { date: '2027-01-09', mappedDay: 'Wed', description: 'Wed Timetable mapped (09/01/2027)' },
  { date: '2027-01-23', mappedDay: 'Thu', description: 'Thu Timetable mapped (23/01/2027)' },
  { date: '2027-02-13', mappedDay: 'Fri', description: 'Fri Timetable mapped (13/02/2027)' },
  { date: '2027-02-27', mappedDay: 'Mon', description: 'Mon Timetable mapped (27/02/2027)' },
  { date: '2027-03-13', mappedDay: 'Tue', description: 'Tue Timetable mapped (13/03/2027)' },
];

// Weekly Timetable Grid from the BITM Master Schedule photo
export const TIMETABLE_ENTRIES: TimetableEntry[] = [
  // MONDAY
  // P1: LS313 (Procurement) || Parallel FM311/HR311 in SH2
  { id: 'mon-p1-ls', day: 'Mon', period: 'P1', subjectCode: 'MBALS313', classroom: 'LH4', facultyId: 'fac-mhk', section: 'Both', specializationGroup: 'Logistics & SCM' },
  { id: 'mon-p1-fm', day: 'Mon', period: 'P1', subjectCode: 'MBAFM311', classroom: 'SH2', facultyId: 'fac-nc', section: 'Both', specializationGroup: 'Finance', isParallelSlot: true },
  
  // P2: LS312 (Warehousing) || Parallel MM311
  { id: 'mon-p2-ls', day: 'Mon', period: 'P2', subjectCode: 'MBALS312', classroom: 'LH4', facultyId: 'fac-cr', section: 'Both', specializationGroup: 'Logistics & SCM' },
  { id: 'mon-p2-mm', day: 'Mon', period: 'P2', subjectCode: 'MBAMM311', classroom: 'SH2', facultyId: 'fac-sbs', section: 'Both', specializationGroup: 'Marketing', isParallelSlot: true },

  // P3: LS311 (Fundamentals SCM) || Parallel HR311
  { id: 'mon-p3-ls', day: 'Mon', period: 'P3', subjectCode: 'MBALS311', classroom: 'LH4', facultyId: 'fac-ksm', section: 'Both', specializationGroup: 'Logistics & SCM' },
  { id: 'mon-p3-hr', day: 'Mon', period: 'P3', subjectCode: 'MBAHR311', classroom: 'SH2', facultyId: 'fac-kca', section: 'Both', specializationGroup: 'HR', isParallelSlot: true },

  // P4: BA311 (Data Analytics) / DS311 (AI & DS)
  { id: 'mon-p4-ba', day: 'Mon', period: 'P4', subjectCode: 'MBABA311', classroom: 'SH3', facultyId: 'fac-pm', section: 'B', specializationGroup: 'Business Analytics' },
  { id: 'mon-p4-ds', day: 'Mon', period: 'P4', subjectCode: 'MBADS311', classroom: 'T2 MBA Block', facultyId: 'fac-va', section: 'Both', specializationGroup: 'Data Science', isParallelSlot: true },

  // P5: LS313 (Procurement)
  { id: 'mon-p5-ls', day: 'Mon', period: 'P5', subjectCode: 'MBALS313', classroom: 'LH4', facultyId: 'fac-mhk', section: 'Both', specializationGroup: 'Logistics & SCM' },
  { id: 'mon-p5-mm', day: 'Mon', period: 'P5', subjectCode: 'MBAMM312', classroom: 'SH2', facultyId: 'fac-ml', section: 'Both', specializationGroup: 'Marketing', isParallelSlot: true },

  // P6: FM313 (Strategic Cost Mgmt)
  { id: 'mon-p6-fm', day: 'Mon', period: 'P6', subjectCode: 'MBAFM313', classroom: 'SH2', facultyId: 'fac-kmj', section: 'Both', specializationGroup: 'Finance' },
  { id: 'mon-p6-hr', day: 'Mon', period: 'P6', subjectCode: 'MBAHR312', classroom: 'SH3', facultyId: 'fac-mkc', section: 'Both', specializationGroup: 'HR', isParallelSlot: true },

  // P7: FM312 (Investment Mgmt)
  { id: 'mon-p7-fm', day: 'Mon', period: 'P7', subjectCode: 'MBAFM312', classroom: 'SH2', facultyId: 'fac-dk', section: 'Both', specializationGroup: 'Finance' },

  // P8: FM312 (Investment Mgmt)
  { id: 'mon-p8-fm', day: 'Mon', period: 'P8', subjectCode: 'MBAFM312', classroom: 'SH2', facultyId: 'fac-dk', section: 'Both', specializationGroup: 'Finance' },

  // TUESDAY
  // P1: FM311 (Financial Institutions)
  { id: 'tue-p1-fm', day: 'Tue', period: 'P1', subjectCode: 'MBAFM311', classroom: 'SH2', facultyId: 'fac-nc', section: 'Both', specializationGroup: 'Finance' },
  { id: 'tue-p1-ls', day: 'Tue', period: 'P1', subjectCode: 'MBALS311', classroom: 'LH4', facultyId: 'fac-ksm', section: 'Both', specializationGroup: 'Logistics & SCM', isParallelSlot: true },

  // P2: FM313 (Strategic Cost Mgmt)
  { id: 'tue-p2-fm', day: 'Tue', period: 'P2', subjectCode: 'MBAFM313', classroom: 'SH2', facultyId: 'fac-kmj', section: 'Both', specializationGroup: 'Finance' },
  { id: 'tue-p2-mm', day: 'Tue', period: 'P2', subjectCode: 'MBAMM313', classroom: 'SH3', facultyId: 'fac-rk', section: 'Both', specializationGroup: 'Marketing', isParallelSlot: true },

  // P3: FM311 (Financial Institutions)
  { id: 'tue-p3-fm', day: 'Tue', period: 'P3', subjectCode: 'MBAFM311', classroom: 'SH2', facultyId: 'fac-nc', section: 'Both', specializationGroup: 'Finance' },

  // P4: LS313 (Procurement)
  { id: 'tue-p4-ls', day: 'Tue', period: 'P4', subjectCode: 'MBALS313', classroom: 'LH4', facultyId: 'fac-mhk', section: 'Both', specializationGroup: 'Logistics & SCM' },
  { id: 'tue-p4-ba', day: 'Tue', period: 'P4', subjectCode: 'MBABA312', classroom: 'SH3', facultyId: 'fac-km', section: 'B', specializationGroup: 'Business Analytics', isParallelSlot: true },

  // P5: LS311 (SCM)
  { id: 'tue-p5-ls', day: 'Tue', period: 'P5', subjectCode: 'MBALS311', classroom: 'LH4', facultyId: 'fac-ksm', section: 'Both', specializationGroup: 'Logistics & SCM' },
  { id: 'tue-p5-hr', day: 'Tue', period: 'P5', subjectCode: 'MBAHR313', classroom: 'SH2', facultyId: 'fac-vp', section: 'Both', specializationGroup: 'HR', isParallelSlot: true },

  // P6: BA313 / DS312
  { id: 'tue-p6-ba', day: 'Tue', period: 'P6', subjectCode: 'MBABA313', classroom: 'SH3', facultyId: 'fac-mk', section: 'B', specializationGroup: 'Business Analytics' },
  { id: 'tue-p6-ds', day: 'Tue', period: 'P6', subjectCode: 'MBADS312', classroom: 'T2 MBA Block', facultyId: 'fac-shw', section: 'Both', specializationGroup: 'Data Science', isParallelSlot: true },

  // P7: LS312 (Warehousing)
  { id: 'tue-p7-ls', day: 'Tue', period: 'P7', subjectCode: 'MBALS312', classroom: 'LH4', facultyId: 'fac-cr', section: 'Both', specializationGroup: 'Logistics & SCM' },

  // P8: Proctoring (Designated department mentor slot)
  { id: 'tue-p8-proc', day: 'Tue', period: 'P8', subjectCode: 'PROC301', classroom: 'Department Seminar Hall', facultyId: 'fac-proc', section: 'Both', specializationGroup: 'All' },

  // WEDNESDAY
  // P1: Aptitude (22MBAAT308)
  { id: 'wed-p1-apt', day: 'Wed', period: 'P1', subjectCode: '22MBAAT308', classroom: 'SH2', facultyId: 'fac-ka', section: 'Both', specializationGroup: 'All' },

  // P2: LS312 (Warehousing)
  { id: 'wed-p2-ls', day: 'Wed', period: 'P2', subjectCode: 'MBALS312', classroom: 'LH4', facultyId: 'fac-cr', section: 'Both', specializationGroup: 'Logistics & SCM' },
  { id: 'wed-p2-fm', day: 'Wed', period: 'P2', subjectCode: 'MBAFM311', classroom: 'SH2', facultyId: 'fac-nc', section: 'Both', specializationGroup: 'Finance', isParallelSlot: true },

  // P3: LS313 (Procurement)
  { id: 'wed-p3-ls', day: 'Wed', period: 'P3', subjectCode: 'MBALS313', classroom: 'LH4', facultyId: 'fac-mhk', section: 'Both', specializationGroup: 'Logistics & SCM' },
  { id: 'wed-p3-mm', day: 'Wed', period: 'P3', subjectCode: 'MBAMM311', classroom: 'SH2', facultyId: 'fac-sbs', section: 'Both', specializationGroup: 'Marketing', isParallelSlot: true },

  // P4: LS311 (Fundamentals SCM)
  { id: 'wed-p4-ls', day: 'Wed', period: 'P4', subjectCode: 'MBALS311', classroom: 'LH4', facultyId: 'fac-ksm', section: 'Both', specializationGroup: 'Logistics & SCM' },
  { id: 'wed-p4-ba', day: 'Wed', period: 'P4', subjectCode: 'MBABA311', classroom: 'SH3', facultyId: 'fac-pm', section: 'B', specializationGroup: 'Business Analytics', isParallelSlot: true },

  // P5: LS312 (Warehousing)
  { id: 'wed-p5-ls', day: 'Wed', period: 'P5', subjectCode: 'MBALS312', classroom: 'LH4', facultyId: 'fac-cr', section: 'Both', specializationGroup: 'Logistics & SCM' },
  { id: 'wed-p5-hr', day: 'Wed', period: 'P5', subjectCode: 'MBAHR311', classroom: 'SH2', facultyId: 'fac-kca', section: 'Both', specializationGroup: 'HR', isParallelSlot: true },

  // P6: DS313
  { id: 'wed-p6-ds', day: 'Wed', period: 'P6', subjectCode: 'MBADS313', classroom: 'T2 MBA Block', facultyId: 'fac-km', section: 'Both', specializationGroup: 'Data Science' },

  // P7: LS311 (SCM)
  { id: 'wed-p7-ls', day: 'Wed', period: 'P7', subjectCode: 'MBALS311', classroom: 'LH4', facultyId: 'fac-ksm', section: 'Both', specializationGroup: 'Logistics & SCM' },
  { id: 'wed-p7-fm', day: 'Wed', period: 'P7', subjectCode: 'MBAFM313', classroom: 'SH2', facultyId: 'fac-kmj', section: 'Both', specializationGroup: 'Finance', isParallelSlot: true },

  // P8: FM312 (Investment Mgmt)
  { id: 'wed-p8-fm', day: 'Wed', period: 'P8', subjectCode: 'MBAFM312', classroom: 'SH2', facultyId: 'fac-dk', section: 'Both', specializationGroup: 'Finance' },

  // THURSDAY
  // P1-P4: Analytics / DS & Electives
  { id: 'thu-p1-ba', day: 'Thu', period: 'P1', subjectCode: 'MBABA312', classroom: 'SH3', facultyId: 'fac-km', section: 'B', specializationGroup: 'Business Analytics' },
  { id: 'thu-p2-ds', day: 'Thu', period: 'P2', subjectCode: 'MBADS311', classroom: 'T2 MBA Block', facultyId: 'fac-va', section: 'Both', specializationGroup: 'Data Science' },
  { id: 'thu-p3-hr', day: 'Thu', period: 'P3', subjectCode: 'MBAHR312', classroom: 'SH2', facultyId: 'fac-mkc', section: 'Both', specializationGroup: 'HR' },
  { id: 'thu-p4-mm', day: 'Thu', period: 'P4', subjectCode: 'MBAMM312', classroom: 'SH3', facultyId: 'fac-ml', section: 'Both', specializationGroup: 'Marketing' },

  // P5: FM311 (Financial Institutions)
  { id: 'thu-p5-fm', day: 'Thu', period: 'P5', subjectCode: 'MBAFM311', classroom: 'SH2', facultyId: 'fac-nc', section: 'Both', specializationGroup: 'Finance' },
  { id: 'thu-p5-ls', day: 'Thu', period: 'P5', subjectCode: 'MBALS313', classroom: 'LH4', facultyId: 'fac-mhk', section: 'Both', specializationGroup: 'Logistics & SCM', isParallelSlot: true },

  // P6: BA313 / DS312
  { id: 'thu-p6-ba', day: 'Thu', period: 'P6', subjectCode: 'MBABA313', classroom: 'SH3', facultyId: 'fac-mk', section: 'B', specializationGroup: 'Business Analytics' },

  // P7: FM311 (Financial Institutions)
  { id: 'thu-p7-fm', day: 'Thu', period: 'P7', subjectCode: 'MBAFM311', classroom: 'SH2', facultyId: 'fac-nc', section: 'Both', specializationGroup: 'Finance' },

  // P8: Aptitude
  { id: 'thu-p8-apt', day: 'Thu', period: 'P8', subjectCode: '22MBAAT308', classroom: 'SH2', facultyId: 'fac-ka', section: 'Both', specializationGroup: 'All' },

  // FRIDAY
  // P1: Aptitude Practice
  { id: 'fri-p1-apt', day: 'Fri', period: 'P1', subjectCode: '22MBAAT308', classroom: 'SH2', facultyId: 'fac-ka', section: 'Both', specializationGroup: 'All' },

  // P2: Club Activity (From photo)
  { id: 'fri-p2-club', day: 'Fri', period: 'P2', subjectCode: 'CLUB301', classroom: 'Auditorium / Quadrangle', facultyId: 'fac-club', section: 'Both', specializationGroup: 'All' },

  // P3: HR313
  { id: 'fri-p3-hr', day: 'Fri', period: 'P3', subjectCode: 'MBAHR313', classroom: 'SH2', facultyId: 'fac-vp', section: 'Both', specializationGroup: 'HR' },

  // P4: FM313 (Strategic Cost Mgmt)
  { id: 'fri-p4-fm', day: 'Fri', period: 'P4', subjectCode: 'MBAFM313', classroom: 'SH2', facultyId: 'fac-kmj', section: 'Both', specializationGroup: 'Finance' },
  { id: 'fri-p4-ls', day: 'Fri', period: 'P4', subjectCode: 'MBALS312', classroom: 'LH4', facultyId: 'fac-cr', section: 'Both', specializationGroup: 'Logistics & SCM', isParallelSlot: true },

  // P5: MM313
  { id: 'fri-p5-mm', day: 'Fri', period: 'P5', subjectCode: 'MBAMM313', classroom: 'SH3', facultyId: 'fac-rk', section: 'Both', specializationGroup: 'Marketing' },

  // P6: FM313 (Strategic Cost Mgmt)
  { id: 'fri-p6-fm', day: 'Fri', period: 'P6', subjectCode: 'MBAFM313', classroom: 'SH2', facultyId: 'fac-kmj', section: 'Both', specializationGroup: 'Finance' },

  // P7: DS313
  { id: 'fri-p7-ds', day: 'Fri', period: 'P7', subjectCode: 'MBADS313', classroom: 'T2 MBA Block', facultyId: 'fac-km', section: 'Both', specializationGroup: 'Data Science' },

  // P8: FM312 (Investment Mgmt)
  { id: 'fri-p8-fm', day: 'Fri', period: 'P8', subjectCode: 'MBAFM312', classroom: 'SH2', facultyId: 'fac-dk', section: 'Both', specializationGroup: 'Finance' },
];

export const SEED_USERS: User[] = [
  // 1. ADMIN / HOD
  {
    id: 'user-hod',
    name: 'Dr. G.P. Dinesh',
    email: 'hod.mba@bitm.edu.in',
    role: 'admin',
    designation: 'Professor & Head of Department',
    department: 'MBA Department'
  },
  // 2. FACULTY (Key professors from the timetable)
  {
    id: 'fac-dk',
    name: 'Dr. Dinesh K',
    email: 'dinesh.k@bitm.edu.in',
    role: 'faculty',
    designation: 'Associate Professor',
    department: 'MBA Department - Finance'
  },
  {
    id: 'fac-ksm',
    name: 'Mr. K S Murthy',
    email: 'ksmurthy@bitm.edu.in',
    role: 'faculty',
    designation: 'Assistant Professor',
    department: 'MBA Department - SCM & Logistics'
  },
  {
    id: 'fac-pm',
    name: 'Mrs. Prathiba Mishra',
    email: 'prathiba.m@bitm.edu.in',
    role: 'faculty',
    designation: 'Assistant Professor',
    department: 'MBA Department - Business Analytics'
  },
  {
    id: 'fac-kmj',
    name: 'Dr. Khaja Mohinuddeen J',
    email: 'khaja.m@bitm.edu.in',
    role: 'faculty',
    designation: 'Professor',
    department: 'MBA Department - Finance'
  },
  {
    id: 'fac-sbs',
    name: 'Dr. Shaheeda Banu S',
    email: 'shaheeda.b@bitm.edu.in',
    role: 'faculty',
    designation: 'Associate Professor',
    department: 'MBA Department - Marketing'
  },
  {
    id: 'fac-kca',
    name: 'Ms. Kavita C A',
    email: 'kavita.ca@bitm.edu.in',
    role: 'faculty',
    designation: 'Assistant Professor',
    department: 'MBA Department - HR'
  },
  {
    id: 'fac-va',
    name: 'Mrs. Varada Alekya',
    email: 'varada.a@bitm.edu.in',
    role: 'faculty',
    designation: 'Assistant Professor',
    department: 'MBA Department - Data Science'
  },
  // 3. PROCTOR
  {
    id: 'user-proctor-1',
    name: 'Dr. Sathik S',
    email: 'sathik.s@bitm.edu.in',
    role: 'proctor',
    designation: 'Senior Mentor / Proctor Batch 2026-27',
    department: 'MBA Department'
  },
  // 4. STUDENTS - Diverse cross-section of Section A & B with Primary & Dual Electives
  {
    id: 'stu-1',
    name: 'Rahul Sharma',
    email: 'rahul.25mba01@bitm.edu.in',
    role: 'student',
    usn: '3BR25MBA01',
    section: 'A',
    semester: 3,
    primarySpec: 'Finance',
    dualSpec: 'Business Analytics',
    proctorId: 'user-proctor-1',
    phone: '+91 98451 23401'
  },
  {
    id: 'stu-2',
    name: 'Ananya Rao',
    email: 'ananya.25mba02@bitm.edu.in',
    role: 'student',
    usn: '3BR25MBA02',
    section: 'A',
    semester: 3,
    primarySpec: 'Finance',
    dualSpec: 'Data Science',
    proctorId: 'user-proctor-1',
    phone: '+91 98451 23402'
  },
  {
    id: 'stu-3',
    name: 'Mohammed Zeeshan',
    email: 'zeeshan.25mba03@bitm.edu.in',
    role: 'student',
    usn: '3BR25MBA03',
    section: 'B',
    semester: 3,
    primarySpec: 'Logistics & SCM',
    dualSpec: 'Business Analytics',
    proctorId: 'user-proctor-1',
    phone: '+91 98451 23403'
  },
  {
    id: 'stu-4',
    name: 'Pooja Kulkarni',
    email: 'pooja.25mba04@bitm.edu.in',
    role: 'student',
    usn: '3BR25MBA04',
    section: 'A',
    semester: 3,
    primarySpec: 'Marketing',
    dualSpec: 'Business Analytics',
    proctorId: 'user-proctor-1',
    phone: '+91 98451 23404'
  },
  {
    id: 'stu-5',
    name: 'Karthik Gowda',
    email: 'karthik.25mba05@bitm.edu.in',
    role: 'student',
    usn: '3BR25MBA05',
    section: 'B',
    semester: 3,
    primarySpec: 'HR',
    dualSpec: 'Data Science',
    proctorId: 'user-proctor-1',
    phone: '+91 98451 23405'
  },
  {
    id: 'stu-6',
    name: 'Deepa V',
    email: 'deepa.25mba06@bitm.edu.in',
    role: 'student',
    usn: '3BR25MBA06',
    section: 'B',
    semester: 3,
    primarySpec: 'Logistics & SCM',
    dualSpec: 'Data Science',
    proctorId: 'user-proctor-1',
    phone: '+91 98451 23406'
  },
  {
    id: 'stu-7',
    name: 'Venkatesh Prasad',
    email: 'venkatesh.25mba07@bitm.edu.in',
    role: 'student',
    usn: '3BR25MBA07',
    section: 'A',
    semester: 3,
    primarySpec: 'Finance',
    dualSpec: 'Business Analytics',
    proctorId: 'user-proctor-1',
    phone: '+91 98451 23407'
  },
  {
    id: 'stu-8',
    name: 'Meghana B',
    email: 'meghana.25mba08@bitm.edu.in',
    role: 'student',
    usn: '3BR25MBA08',
    section: 'A',
    semester: 3,
    primarySpec: 'Marketing',
    dualSpec: 'Data Science',
    proctorId: 'user-proctor-1',
    phone: '+91 98451 23408'
  },
  {
    id: 'stu-9',
    name: 'Chethan Kumar',
    email: 'chethan.25mba09@bitm.edu.in',
    role: 'student',
    usn: '3BR25MBA09',
    section: 'B',
    semester: 3,
    primarySpec: 'Finance',
    dualSpec: 'Business Analytics',
    proctorId: 'user-proctor-1',
    phone: '+91 98451 23409'
  },
  {
    id: 'stu-10',
    name: 'Sindhu Patil',
    email: 'sindhu.25mba10@bitm.edu.in',
    role: 'student',
    usn: '3BR25MBA10',
    section: 'B',
    semester: 3,
    primarySpec: 'HR',
    dualSpec: 'Business Analytics',
    proctorId: 'user-proctor-1',
    phone: '+91 98451 23410'
  }
];

// Seed Historical Attendance Records across previous dates
export const SEED_ATTENDANCE_RECORDS: AttendanceRecord[] = [
  // Session 1: MBAFM312 (Investment Mgmt)
  { id: 'att-101', sessionId: 'sess-prev-1', studentId: 'stu-1', subjectCode: 'MBAFM312', date: '2026-10-05', period: 'P7', status: 'present', markedBy: 'faculty', markedAt: '2026-10-05T15:10:00Z', synced: true },
  { id: 'att-102', sessionId: 'sess-prev-1', studentId: 'stu-2', subjectCode: 'MBAFM312', date: '2026-10-05', period: 'P7', status: 'present', markedBy: 'faculty', markedAt: '2026-10-05T15:10:00Z', synced: true },
  { id: 'att-103', sessionId: 'sess-prev-1', studentId: 'stu-7', subjectCode: 'MBAFM312', date: '2026-10-05', period: 'P7', status: 'absent', markedBy: 'faculty', markedAt: '2026-10-05T15:10:00Z', synced: true },
  { id: 'att-104', sessionId: 'sess-prev-1', studentId: 'stu-9', subjectCode: 'MBAFM312', date: '2026-10-05', period: 'P7', status: 'present', markedBy: 'faculty', markedAt: '2026-10-05T15:10:00Z', synced: true },

  // Session 2: MBAFM313 (Cost Mgmt)
  { id: 'att-105', sessionId: 'sess-prev-2', studentId: 'stu-1', subjectCode: 'MBAFM313', date: '2026-10-06', period: 'P2', status: 'present', markedBy: 'qr_scan', markedAt: '2026-10-06T09:55:00Z', synced: true },
  { id: 'att-106', sessionId: 'sess-prev-2', studentId: 'stu-2', subjectCode: 'MBAFM313', date: '2026-10-06', period: 'P2', status: 'present', markedBy: 'qr_scan', markedAt: '2026-10-06T09:55:00Z', synced: true },
  { id: 'att-107', sessionId: 'sess-prev-2', studentId: 'stu-7', subjectCode: 'MBAFM313', date: '2026-10-06', period: 'P2', status: 'absent', markedBy: 'faculty', markedAt: '2026-10-06T09:55:00Z', synced: true },
  { id: 'att-108', sessionId: 'sess-prev-2', studentId: 'stu-9', subjectCode: 'MBAFM313', date: '2026-10-06', period: 'P2', status: 'late', markedBy: 'faculty', markedAt: '2026-10-06T09:55:00Z', synced: true },

  // Session 3: MBABA311 (Data Analytics)
  { id: 'att-109', sessionId: 'sess-prev-3', studentId: 'stu-1', subjectCode: 'MBABA311', date: '2026-10-07', period: 'P4', status: 'present', markedBy: 'qr_scan', markedAt: '2026-10-07T11:40:00Z', synced: true },
  { id: 'att-110', sessionId: 'sess-prev-3', studentId: 'stu-3', subjectCode: 'MBABA311', date: '2026-10-07', period: 'P4', status: 'present', markedBy: 'qr_scan', markedAt: '2026-10-07T11:40:00Z', synced: true },
  { id: 'att-111', sessionId: 'sess-prev-3', studentId: 'stu-4', subjectCode: 'MBABA311', date: '2026-10-07', period: 'P4', status: 'od', markedBy: 'system_od', markedAt: '2026-10-07T11:40:00Z', synced: true },
  { id: 'att-112', sessionId: 'sess-prev-3', studentId: 'stu-7', subjectCode: 'MBABA311', date: '2026-10-07', period: 'P4', status: 'absent', markedBy: 'faculty', markedAt: '2026-10-07T11:40:00Z', synced: true },
  { id: 'att-113', sessionId: 'sess-prev-3', studentId: 'stu-9', subjectCode: 'MBABA311', date: '2026-10-07', period: 'P4', status: 'present', markedBy: 'qr_scan', markedAt: '2026-10-07T11:40:00Z', synced: true },
  { id: 'att-114', sessionId: 'sess-prev-3', studentId: 'stu-10', subjectCode: 'MBABA311', date: '2026-10-07', period: 'P4', status: 'present', markedBy: 'qr_scan', markedAt: '2026-10-07T11:40:00Z', synced: true },

  // Session 4: MBALS311 (SCM)
  { id: 'att-115', sessionId: 'sess-prev-4', studentId: 'stu-3', subjectCode: 'MBALS311', date: '2026-10-08', period: 'P5', status: 'present', markedBy: 'faculty', markedAt: '2026-10-08T13:20:00Z', synced: true },
  { id: 'att-116', sessionId: 'sess-prev-4', studentId: 'stu-6', subjectCode: 'MBALS311', date: '2026-10-08', period: 'P5', status: 'present', markedBy: 'faculty', markedAt: '2026-10-08T13:20:00Z', synced: true },

  // Defaulter sample data for student 7 (Venkatesh Prasad): Multiple absences to trigger <75% VTU warning
  { id: 'att-117', sessionId: 'sess-prev-5', studentId: 'stu-7', subjectCode: 'MBAFM311', date: '2026-10-01', period: 'P1', status: 'absent', markedBy: 'faculty', markedAt: '2026-10-01T09:10:00Z', synced: true },
  { id: 'att-118', sessionId: 'sess-prev-6', studentId: 'stu-7', subjectCode: 'MBAFM311', date: '2026-10-02', period: 'P5', status: 'absent', markedBy: 'faculty', markedAt: '2026-10-02T13:20:00Z', synced: true },
  { id: 'att-119', sessionId: 'sess-prev-7', studentId: 'stu-7', subjectCode: 'MBAFM312', date: '2026-09-28', period: 'P7', status: 'absent', markedBy: 'faculty', markedAt: '2026-09-28T15:10:00Z', synced: true },
  { id: 'att-120', sessionId: 'sess-prev-8', studentId: 'stu-7', subjectCode: '22MBAAT308', date: '2026-09-30', period: 'P1', status: 'present', markedBy: 'faculty', markedAt: '2026-09-30T09:10:00Z', synced: true },
];

export const SEED_LEAVE_REQUESTS: LeaveRequest[] = [
  {
    id: 'leave-1',
    studentId: 'stu-4',
    studentName: 'Pooja Kulkarni',
    usn: '3BR25MBA04',
    type: 'on_duty',
    startDate: '2026-10-07',
    endDate: '2026-10-07',
    affectedSlots: [{ date: '2026-10-07', period: 'P4', subjectCode: 'MBABA311' }],
    reason: 'Representing BITM MBA in State Level Management Fest (IIM Bangalore Vista 2026)',
    attachmentName: 'bitm_fest_deputation_letter.pdf',
    status: 'approved',
    reviewedBy: 'Dr. Sathik S (Proctor)',
    reviewedAt: '2026-10-06T14:30:00Z',
    reviewRemarks: 'OD granted for Management Fest participation. Attendance credited automatically.'
  },
  {
    id: 'leave-2',
    studentId: 'stu-7',
    studentName: 'Venkatesh Prasad',
    usn: '3BR25MBA07',
    type: 'medical',
    startDate: '2026-10-14',
    endDate: '2026-10-15',
    affectedSlots: [
      { date: '2026-10-14', period: 'P2', subjectCode: 'MBALS312' },
      { date: '2026-10-14', period: 'P8', subjectCode: 'MBAFM312' }
    ],
    reason: 'Viral fever and medical consultation at VIMS Ballari Hospital',
    attachmentName: 'medical_fitness_certificate_vims.pdf',
    status: 'pending'
  }
];

export const SEED_PROCTOR_NOTES: ProctorNote[] = [
  {
    id: 'note-1',
    proctorId: 'user-proctor-1',
    studentId: 'stu-7',
    date: '2026-10-08',
    category: 'attendance_warning',
    note: 'Student Venkatesh Prasad attendance dropped below 70% in Finance core subjects. Issued first VTU warning notice and counseled regarding eligibility risk.',
    parentContacted: true
  },
  {
    id: 'note-2',
    proctorId: 'user-proctor-1',
    studentId: 'stu-1',
    date: '2026-10-06',
    category: 'academic',
    note: 'Rahul is maintaining >90% attendance across all subjects and is actively preparing for placement aptitude tests.',
    parentContacted: false
  }
];

export const SEED_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    timestamp: '2026-10-13T09:00:15Z',
    userId: 'fac-dk',
    userName: 'Dr. Dinesh K',
    action: 'CREATE_SESSION',
    details: 'Initiated active class session for MBAFM312 (Investment Mgmt) at SH2'
  },
  {
    id: 'log-2',
    timestamp: '2026-10-13T09:02:40Z',
    userId: 'fac-dk',
    userName: 'Dr. Dinesh K',
    action: 'MARK_ATTENDANCE',
    details: 'Marked 22 students present via fast roster tap and anti-proxy QR code'
  },
  {
    id: 'log-3',
    timestamp: '2026-10-12T16:20:00Z',
    userId: 'user-proctor-1',
    userName: 'Dr. Sathik S',
    action: 'APPROVE_LEAVE',
    details: 'Approved OD Leave request leave-1 for Pooja Kulkarni (Fest Deputation)'
  }
];
