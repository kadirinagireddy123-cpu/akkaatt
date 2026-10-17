import {
  StudentProfile,
  ClassPeriodSlot,
  LecturerExchange,
  SubjectStats
} from '../types/portal';

export const DEFAULT_STUDENT_PROFILE: StudentProfile = {
  name: 'Venkatesh Prasad',
  usn: '3BR25MBA01',
  department: 'Dept. of MBA & Mgmt Studies (Ballari Institute of Technology & Management)',
  semesterSection: 'Semester III - B SEC',
  assignedClassroom: 'SH-3, 2nd Floor, Management Block / LH-10',
  labBatch: 'Batch B1 (1-22)',
  minThreshold: 85, // 85% mandatory minimum
  safeZoneTarget: 90 // 90% comfortable buffer
};

export const DEFAULT_SUBJECTS_LIST: SubjectStats[] = [
  {
    code: 'MBAFM311',
    name: 'Financial Institutions & Investment Banking',
    facultyName: 'Prof. Nagaraj C · BITM Dept.',
    classroom: 'SH-2',
    conducted: 14,
    present: 13,
    absent: 1,
    cancelled: 1
  },
  {
    code: 'MBAFM312',
    name: 'Investment Management',
    facultyName: 'Dr. Dinesh K · BITM Dept.',
    classroom: 'SH-2',
    conducted: 16,
    present: 14,
    absent: 2,
    cancelled: 0
  },
  {
    code: 'MBAFM313',
    name: 'Strategic Cost Management',
    facultyName: 'Dr. Khaja Mohinuddeen J · BITM Dept.',
    classroom: 'SH-2',
    conducted: 15,
    present: 14,
    absent: 1,
    cancelled: 1
  },
  {
    code: 'MBALS311',
    name: 'Fundamentals of Logistics & Supply Chain Mgmt',
    facultyName: 'Dr. Chakravarthi B / Prof. K S Murthy',
    classroom: 'LH-4',
    conducted: 12,
    present: 11,
    absent: 1,
    cancelled: 0
  },
  {
    code: 'MBALS312',
    name: 'Warehousing Management',
    facultyName: 'Dr. Christopher Raj · BITM Dept.',
    classroom: 'LH-4',
    conducted: 13,
    present: 12,
    absent: 1,
    cancelled: 0
  },
  {
    code: 'MBALS313',
    name: 'Procurement for Businesses',
    facultyName: 'Mr. Moula Hussain K · BITM Dept.',
    classroom: 'LH-4',
    conducted: 14,
    present: 13,
    absent: 1,
    cancelled: 0
  },
  {
    code: 'MBABA311',
    name: 'Data Analytics for Managers',
    facultyName: 'Mrs. Prathiba Mishra · BITM Dept.',
    classroom: 'SH-3',
    conducted: 15,
    present: 14,
    absent: 1,
    cancelled: 1
  },
  {
    code: 'MBABA312',
    name: 'Database Management System Lab',
    facultyName: 'Mr. Kiran Mudaraddi · BITM Dept.',
    classroom: 'Computer Center Lab 2',
    conducted: 18,
    present: 17,
    absent: 1,
    cancelled: 0
  },
  {
    code: '22MBAAT308',
    name: 'Business Aptitude & Soft Skills',
    facultyName: 'Prof. Kavita Achchahalli · BITM Dept.',
    classroom: 'SH-2',
    conducted: 10,
    present: 10,
    absent: 0,
    cancelled: 0
  }
];

export const MASTER_DAY_TEMPLATES: Record<string, ClassPeriodSlot[]> = {
  Monday: [
    {
      id: 'mon-1',
      periodNumber: 1,
      periodLabel: 'P1',
      timeRange: '09:00 AM - 09:50 AM',
      subjectCode: 'MBALS313',
      subjectName: 'Procurement for Businesses',
      facultyName: 'Mr. Moula Hussain K · BITM Dept.',
      classroom: 'LH-4',
      credits: 1,
      status: 'pending'
    },
    {
      id: 'mon-2',
      periodNumber: 2,
      periodLabel: 'P2',
      timeRange: '09:50 AM - 10:40 AM',
      subjectCode: 'MBALS312',
      subjectName: 'Warehousing Management',
      facultyName: 'Dr. Christopher Raj · BITM Dept.',
      classroom: 'LH-4',
      credits: 1,
      status: 'pending'
    },
    {
      id: 'mon-3',
      periodNumber: 3,
      periodLabel: 'P3',
      timeRange: '10:45 AM - 11:35 AM',
      subjectCode: 'MBALS311',
      subjectName: 'Fundamentals of Logistics & SCM',
      facultyName: 'Dr. Chakravarthi B · BITM Dept.',
      classroom: 'LH-4',
      credits: 1,
      status: 'pending'
    },
    {
      id: 'mon-4',
      periodNumber: 4,
      periodLabel: 'P4',
      timeRange: '11:35 AM - 12:25 PM',
      subjectCode: 'MBABA311',
      subjectName: 'Data Analytics for Managers',
      facultyName: 'Mrs. Prathiba Mishra · BITM Dept.',
      classroom: 'SH-3',
      credits: 1,
      status: 'pending'
    },
    {
      id: 'mon-5',
      periodNumber: 5,
      periodLabel: 'P5',
      timeRange: '01:15 PM - 02:05 PM',
      subjectCode: 'MBALS313',
      subjectName: 'Procurement for Businesses',
      facultyName: 'Mr. Moula Hussain K · BITM Dept.',
      classroom: 'LH-4',
      credits: 1,
      status: 'pending'
    },
    {
      id: 'mon-6',
      periodNumber: 6,
      periodLabel: 'P6',
      timeRange: '02:05 PM - 02:55 PM',
      subjectCode: 'MBAFM313',
      subjectName: 'Strategic Cost Management',
      facultyName: 'Dr. Khaja Mohinuddeen J · BITM Dept.',
      classroom: 'SH-2',
      credits: 1,
      status: 'pending'
    }
  ],
  Tuesday: [
    {
      id: 'tue-1',
      periodNumber: 1,
      periodLabel: 'P1',
      timeRange: '09:00 AM - 09:50 AM',
      subjectCode: 'MBAFM311',
      subjectName: 'Financial Institutions & Investment Banking',
      facultyName: 'Mr. Nagaraj C · BITM Dept.',
      classroom: 'SH-2',
      credits: 1,
      status: 'pending'
    },
    {
      id: 'tue-2',
      periodNumber: 2,
      periodLabel: 'P2',
      timeRange: '09:50 AM - 10:40 AM',
      subjectCode: 'MBAFM313',
      subjectName: 'Strategic Cost Management',
      facultyName: 'Dr. Khaja Mohinuddeen J · BITM Dept.',
      classroom: 'SH-2',
      credits: 1,
      status: 'pending'
    },
    {
      id: 'tue-3',
      periodNumber: 3,
      periodLabel: 'P3',
      timeRange: '10:45 AM - 11:35 AM',
      subjectCode: 'MBAFM311',
      subjectName: 'Financial Institutions & Investment Banking',
      facultyName: 'Mr. Nagaraj C · BITM Dept.',
      classroom: 'SH-2',
      credits: 1,
      status: 'pending'
    },
    {
      id: 'tue-4',
      periodNumber: 4,
      periodLabel: 'P4',
      timeRange: '11:35 AM - 12:25 PM',
      subjectCode: 'MBALS313',
      subjectName: 'Procurement for Businesses',
      facultyName: 'Mr. Moula Hussain K · BITM Dept.',
      classroom: 'LH-4',
      credits: 1,
      status: 'pending'
    },
    {
      id: 'tue-5',
      periodNumber: 5,
      periodLabel: 'P5',
      timeRange: '01:15 PM - 02:05 PM',
      subjectCode: 'MBALS311',
      subjectName: 'Fundamentals of Logistics & SCM',
      facultyName: 'Dr. Chakravarthi B · BITM Dept.',
      classroom: 'LH-4',
      credits: 1,
      status: 'pending'
    },
    {
      id: 'tue-6',
      periodNumber: 6,
      periodLabel: 'P6',
      timeRange: '02:05 PM - 02:55 PM',
      subjectCode: 'MBABA313',
      subjectName: 'Python Programming for Managers',
      facultyName: 'Ms. Manjula Kaur · BITM Dept.',
      classroom: 'SH-3',
      credits: 1,
      status: 'pending'
    },
    {
      id: 'tue-7',
      periodNumber: 7,
      periodLabel: 'P7',
      timeRange: '03:00 PM - 03:50 PM',
      subjectCode: 'MBALS312',
      subjectName: 'Warehousing Management',
      facultyName: 'Dr. Christopher Raj · BITM Dept.',
      classroom: 'LH-4',
      credits: 1,
      status: 'pending'
    },
    {
      id: 'tue-8',
      periodNumber: 8,
      periodLabel: 'P8',
      timeRange: '03:50 PM - 04:40 PM',
      subjectCode: 'PROC301',
      subjectName: 'Department Proctoring & Mentorship',
      facultyName: 'Dr. Sathik S · Proctor In-Charge',
      classroom: 'Department Seminar Hall',
      credits: 1,
      status: 'pending'
    }
  ],
  Wednesday: [
    {
      id: 'wed-lab-1',
      periodNumber: 1,
      periodLabel: 'P1-P3',
      timeRange: '09:00 AM - 11:35 AM',
      subjectCode: 'MBABA312 Lab',
      subjectName: 'DBMS & Data Analytics Practical Lab',
      facultyName: 'Mr. Kiran Mudaraddi · BITM Dept.',
      classroom: 'Computer Center Lab 2',
      credits: 3,
      isLab: true,
      labSpanPeriods: 3,
      labCredit: '3 Lab Credits (+3)',
      status: 'pending'
    },
    {
      id: 'wed-4',
      periodNumber: 4,
      periodLabel: 'P4',
      timeRange: '11:35 AM - 12:25 PM',
      subjectCode: 'MBALS311',
      subjectName: 'Fundamentals of Logistics & SCM',
      facultyName: 'Dr. Chakravarthi B · BITM Dept.',
      classroom: 'LH-4',
      credits: 1,
      status: 'pending'
    },
    {
      id: 'wed-5',
      periodNumber: 5,
      periodLabel: 'P5',
      timeRange: '01:15 PM - 02:05 PM',
      subjectCode: 'MBALS312',
      subjectName: 'Warehousing Management',
      facultyName: 'Dr. Christopher Raj · BITM Dept.',
      classroom: 'LH-4',
      credits: 1,
      status: 'pending'
    },
    {
      id: 'wed-6',
      periodNumber: 6,
      periodLabel: 'P6',
      timeRange: '02:05 PM - 02:55 PM',
      subjectCode: 'MBADS313',
      subjectName: 'Business Data Management System',
      facultyName: 'Mr. Kiran Mudaraddi · BITM Dept.',
      classroom: 'T2 MBA Block',
      credits: 1,
      status: 'pending'
    }
  ],
  Thursday: [
    {
      id: 'thu-1',
      periodNumber: 1,
      periodLabel: 'P1',
      timeRange: '09:00 AM - 09:50 AM',
      subjectCode: 'MBABA312',
      subjectName: 'Database Management System',
      facultyName: 'Mr. Kiran Mudaraddi · BITM Dept.',
      classroom: 'SH-3',
      credits: 1,
      status: 'pending'
    },
    {
      id: 'thu-2',
      periodNumber: 2,
      periodLabel: 'P2',
      timeRange: '09:50 AM - 10:40 AM',
      subjectCode: 'MBADS311',
      subjectName: 'AI & Data Science for Managers',
      facultyName: 'Mrs. Varada Alekya · BITM Dept.',
      classroom: 'T2 MBA Block',
      credits: 1,
      status: 'pending'
    },
    {
      id: 'thu-3',
      periodNumber: 3,
      periodLabel: 'P3',
      timeRange: '10:45 AM - 11:35 AM',
      subjectCode: 'MBAHR312',
      subjectName: 'HR Analytics',
      facultyName: 'Dr. Mahesh Kumar C A · BITM Dept.',
      classroom: 'SH-2',
      credits: 1,
      status: 'pending'
    },
    {
      id: 'thu-4',
      periodNumber: 4,
      periodLabel: 'P4',
      timeRange: '11:35 AM - 12:25 PM',
      subjectCode: 'MBAMM312',
      subjectName: 'Sales & Retail Management',
      facultyName: 'Dr. Mallesha L · BITM Dept.',
      classroom: 'SH-3',
      credits: 1,
      status: 'pending'
    },
    {
      id: 'thu-5',
      periodNumber: 5,
      periodLabel: 'P5',
      timeRange: '01:15 PM - 02:05 PM',
      subjectCode: 'MBAFM311',
      subjectName: 'Financial Institutions & Investment Banking',
      facultyName: 'Mr. Nagaraj C · BITM Dept.',
      classroom: 'SH-2',
      credits: 1,
      status: 'pending'
    },
    {
      id: 'thu-6',
      periodNumber: 6,
      periodLabel: 'P6',
      timeRange: '02:05 PM - 02:55 PM',
      subjectCode: 'MBABA313',
      subjectName: 'Python Programming for Managers',
      facultyName: 'Ms. Manjula Kaur · BITM Dept.',
      classroom: 'SH-3',
      credits: 1,
      status: 'pending'
    }
  ],
  Friday: [
    {
      id: 'fri-1',
      periodNumber: 1,
      periodLabel: 'P1',
      timeRange: '09:00 AM - 09:50 AM',
      subjectCode: '22MBAAT308',
      subjectName: 'Business Aptitude & Quantitative Skills',
      facultyName: 'Prof. Kavita Achchahalli · BITM Dept.',
      classroom: 'SH-2',
      credits: 1,
      status: 'pending'
    },
    {
      id: 'fri-2',
      periodNumber: 2,
      periodLabel: 'P2',
      timeRange: '09:50 AM - 10:40 AM',
      subjectCode: 'CLUB301',
      subjectName: 'MBA Management Club Activity',
      facultyName: 'Club Coordinators · BITM Dept.',
      classroom: 'Auditorium / Quadrangle',
      credits: 1,
      status: 'pending'
    },
    {
      id: 'fri-3',
      periodNumber: 3,
      periodLabel: 'P3',
      timeRange: '10:45 AM - 11:35 AM',
      subjectCode: 'MBAHR313',
      subjectName: 'Industrial Relations & Labor Laws',
      facultyName: 'Mrs. Vishnu Priya · BITM Dept.',
      classroom: 'SH-2',
      credits: 1,
      status: 'pending'
    },
    {
      id: 'fri-4',
      periodNumber: 4,
      periodLabel: 'P4',
      timeRange: '11:35 AM - 12:25 PM',
      subjectCode: 'MBAFM313',
      subjectName: 'Strategic Cost Management',
      facultyName: 'Dr. Khaja Mohinuddeen J · BITM Dept.',
      classroom: 'SH-2',
      credits: 1,
      status: 'pending'
    }
  ],
  Saturday: [
    // Dynamic Saturday template: by default mirrors Monday routine
    {
      id: 'sat-1',
      periodNumber: 1,
      periodLabel: 'P1',
      timeRange: '09:00 AM - 09:50 AM',
      subjectCode: 'MBALS313',
      subjectName: 'Procurement for Businesses (Compensatory)',
      facultyName: 'Mr. Moula Hussain K · BITM Dept.',
      classroom: 'LH-4',
      credits: 1,
      status: 'pending'
    },
    {
      id: 'sat-2',
      periodNumber: 2,
      periodLabel: 'P2',
      timeRange: '09:50 AM - 10:40 AM',
      subjectCode: 'MBALS312',
      subjectName: 'Warehousing Management',
      facultyName: 'Dr. Christopher Raj · BITM Dept.',
      classroom: 'LH-4',
      credits: 1,
      status: 'pending'
    },
    {
      id: 'sat-3',
      periodNumber: 3,
      periodLabel: 'P3',
      timeRange: '10:45 AM - 11:35 AM',
      subjectCode: 'MBALS311',
      subjectName: 'Fundamentals of Logistics & SCM',
      facultyName: 'Dr. Chakravarthi B · BITM Dept.',
      classroom: 'LH-4',
      credits: 1,
      status: 'pending'
    },
    {
      id: 'sat-4',
      periodNumber: 4,
      periodLabel: 'P4',
      timeRange: '11:35 AM - 12:25 PM',
      subjectCode: 'MBABA311',
      subjectName: 'Data Analytics for Managers',
      facultyName: 'Mrs. Prathiba Mishra · BITM Dept.',
      classroom: 'SH-3',
      credits: 1,
      status: 'pending'
    },
    {
      id: 'sat-5',
      periodNumber: 5,
      periodLabel: 'P5',
      timeRange: '01:15 PM - 02:05 PM',
      subjectCode: 'MBALS313',
      subjectName: 'Procurement for Businesses',
      facultyName: 'Mr. Moula Hussain K · BITM Dept.',
      classroom: 'LH-4',
      credits: 1,
      status: 'pending'
    },
    {
      id: 'sat-6',
      periodNumber: 6,
      periodLabel: 'P6',
      timeRange: '02:05 PM - 02:55 PM',
      subjectCode: 'MBAFM313',
      subjectName: 'Strategic Cost Management',
      facultyName: 'Dr. Khaja Mohinuddeen J · BITM Dept.',
      classroom: 'SH-2',
      credits: 1,
      status: 'pending'
    }
  ]
};

export const SEED_EXCHANGES: LecturerExchange[] = [
  {
    id: 'exch-1',
    date: '2026-10-05',
    timeRange: '01:15 PM - 02:05 PM',
    originalSubjectCode: 'MBAFM311',
    originalSubjectName: 'Financial Institutions',
    originalFaculty: 'Mr. Nagaraj C',
    exchangedSubjectCode: 'MBAFM313',
    exchangedSubjectName: 'Strategic Cost Management',
    exchangedFaculty: 'Dr. Khaja Mohinuddeen J',
    reason: 'Prof. Nagaraj requested slot exchange for VTU University academic audit',
    status: 'present'
  },
  {
    id: 'exch-2',
    date: '2026-09-29',
    timeRange: '02:05 PM - 02:55 PM',
    originalSubjectCode: 'MBALS311',
    originalSubjectName: 'Logistics & SCM',
    originalFaculty: 'Dr. Chakravarthi B',
    exchangedSubjectCode: 'MBABA311',
    exchangedSubjectName: 'Data Analytics for Managers',
    exchangedFaculty: 'Mrs. Prathiba Mishra',
    reason: 'Extra syllabus numerical session taken by Mrs. Prathiba Mishra',
    status: 'present'
  }
];
