export const PRODUCT_BRIEF = {
  institution: "Ballari Institute of Technology & Management (BITM), Ballari",
  program: "Master of Business Administration (MBA), 3rd Semester",
  academicYear: "2026-2027 (Odd Semester), W.E.F: 16-09-2026",
  vision: "A mobile-first, high-reliability attendance intelligence engine designed for autonomous MBA colleges under VTU Belagavi. Eliminates manual paper registers, resolves parallel specialization clashes, provides anti-proxy QR and geo-verification, and arms students with proactive VTU 75% calculators.",
  roleFlows: [
    {
      role: "Faculty",
      title: "Fast Classroom Attendance & Anti-Proxy Verification",
      steps: [
        "Selects current timetable slot or taps 'Start Current Class' on the mobile dashboard.",
        "System resolves room (SH2, SH3, LH4, T2) and automatically filters only enrolled students for that elective group.",
        "Faculty can display a dynamic, rotating QR code (30s refresh + fallback 6-digit PIN) or use 1-tap 'Mark All Present' followed by rapid tap toggles (Present, Absent, Late, OD).",
        "Submits attendance session. Edit window stays unlocked for 24 hours with mandatory change reasoning and immutable audit log.",
        "Full offline support: marks locally during connectivity dead-zones and synchronizes upon campus Wi-Fi reconnection."
      ]
    },
    {
      role: "Student",
      title: "Personalized Timetable, QR Check-In & VTU Calculator",
      steps: [
        "Views customized daily schedule derived from their Primary Specialization (Finance, HR, Marketing, SCM) and Dual Specialization (Business Analytics, Data Science).",
        "Checks in via in-app QR scanner or enters faculty's 6-digit session PIN with campus geofence verification.",
        "Monitors real-time subject-wise attendance percentages with VTU 75% mandatory threshold indicator and early-warning amber tier (<85%).",
        "Uses the 'What If I Bunk' calculator to know exact safe skips remaining or consecutive classes required to regain eligibility.",
        "Submits Medical and On-Duty (OD) exemption requests with document attachments for proctor approval."
      ]
    },
    {
      role: "Proctor (Mentor)",
      title: "Mentee Welfare, Defaulter Interventions & OD Approval",
      steps: [
        "Monitors assigned mentee roster with live color-coded attendance indicators (<75% Defaulter Red, 75-84% Warning Amber).",
        "Conducts Tuesday Period 8 designated Proctoring slot sessions, recording mentoring notes and counseling records.",
        "Reviews and approves student Medical / OD exemption requests (automatically adjusting attendance in the register).",
        "Generates parent communication dispatches via preformatted WhatsApp / SMS notification alerts."
      ]
    },
    {
      role: "Admin & HOD",
      title: "Department Oversight, Schedule Governance & VTU Reports",
      steps: [
        "Master Timetable governance: imports, edits, and monitors weekly grid (Mon-Fri P1-P8) and manages Saturday extra working day mappings.",
        "Oversees syllabus conduction rates across faculty members to detect lagging subjects.",
        "Generates official VTU Form-B Defaulter Lists and semester-end eligibility reports with 1-click CSV/Excel export.",
        "Configures institute holiday calendars, classroom allocations, and faculty substitutions."
      ]
    }
  ]
};

export const POSTGRESQL_SCHEMA_SQL = `-- =====================================================================
-- BITM MBA ATTENDANCE MANAGEMENT SYSTEM - PRODUCTION POSTGRESQL SCHEMA
-- Institution: Ballari Institute of Technology & Management (BITM)
-- Timezone: Asia/Kolkata everywhere
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "citext";

-- 1. USERS & ROLES
CREATE TYPE user_role AS ENUM ('admin', 'faculty', 'student', 'proctor');
CREATE TYPE primary_spec AS ENUM ('Finance', 'HR', 'Marketing', 'Logistics & SCM');
CREATE TYPE dual_spec AS ENUM ('Business Analytics', 'Data Science');
CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'late', 'od');
CREATE TYPE session_status AS ENUM ('scheduled', 'active', 'completed', 'cancelled');
CREATE TYPE leave_type AS ENUM ('medical', 'on_duty', 'personal', 'placement');
CREATE TYPE leave_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email CITEXT UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    phone VARCHAR(20),
    role user_role NOT NULL,
    usn VARCHAR(20) UNIQUE, -- e.g., 3BR25MBA01
    section CHAR(1) CHECK (section IN ('A', 'B')),
    semester SMALLINT DEFAULT 3,
    primary_spec primary_spec,
    dual_spec dual_spec,
    proctor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    designation VARCHAR(100),
    department VARCHAR(100) DEFAULT 'MBA Department',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_section ON users(section);
CREATE INDEX idx_users_usn ON users(usn);
CREATE INDEX idx_users_proctor ON users(proctor_id);

-- 2. SUBJECTS
CREATE TABLE subjects (
    code VARCHAR(15) PRIMARY KEY, -- e.g., 'MBAFM312', 'MBALS313'
    name VARCHAR(200) NOT NULL,
    faculty_id UUID REFERENCES users(id) ON DELETE SET NULL,
    credits SMALLINT NOT NULL DEFAULT 4,
    category VARCHAR(30) NOT NULL, -- core, finance, hr, marketing, logistics, analytics, datascience, general
    classroom VARCHAR(50) NOT NULL, -- SH2, SH3, LH4, T2 MBA Block
    section_scope VARCHAR(10) DEFAULT 'Both', -- 'A', 'B', 'Both'
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_subjects_category ON subjects(category);

-- 3. TIMETABLE SLOTS & GRID
CREATE TABLE timetable_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    day_of_week VARCHAR(3) CHECK (day_of_week IN ('Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat')),
    period VARCHAR(5) NOT NULL, -- 'P1', 'P2', ..., 'P8'
    subject_code VARCHAR(15) NOT NULL REFERENCES subjects(code) ON DELETE CASCADE,
    classroom VARCHAR(50) NOT NULL,
    faculty_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    section CHAR(1) DEFAULT 'B',
    is_parallel_slot BOOLEAN DEFAULT FALSE,
    specialization_group VARCHAR(50),
    effective_from DATE DEFAULT '2026-09-16',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tt_day_period ON timetable_slots(day_of_week, period);
CREATE INDEX idx_tt_subject ON timetable_slots(subject_code);

-- 4. SATURDAY EXTRA WORKING DAYS / SCHEDULE OVERRIDES
CREATE TABLE schedule_overrides (
    override_date DATE PRIMARY KEY, -- e.g., '2026-09-26'
    mapped_day VARCHAR(3) NOT NULL CHECK (mapped_day IN ('Mon', 'Tue', 'Wed', 'Thu', 'Fri')),
    is_holiday BOOLEAN DEFAULT FALSE,
    description TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. ATTENDANCE SESSIONS
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_date DATE NOT NULL,
    period VARCHAR(5) NOT NULL,
    subject_code VARCHAR(15) NOT NULL REFERENCES subjects(code) ON DELETE CASCADE,
    faculty_id UUID NOT NULL REFERENCES users(id),
    section CHAR(1) NOT NULL,
    classroom VARCHAR(50) NOT NULL,
    status session_status DEFAULT 'scheduled',
    qr_code_token VARCHAR(255),
    secret_pin CHAR(6),
    qr_expires_at TIMESTAMPTZ,
    geofence_lat NUMERIC(9,6) DEFAULT 15.139400,
    geofence_lng NUMERIC(9,6) DEFAULT 76.921400,
    geofence_radius_meters INT DEFAULT 250,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    finalized_at TIMESTAMPTZ,
    allow_edit_until TIMESTAMPTZ, -- CURRENT_TIMESTAMP + INTERVAL '24 hours'
    CONSTRAINT uq_session_slot UNIQUE (session_date, period, subject_code, section)
);

CREATE INDEX idx_sessions_date ON sessions(session_date);
CREATE INDEX idx_sessions_faculty ON sessions(faculty_id);

-- 6. ATTENDANCE RECORDS
CREATE TABLE attendance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject_code VARCHAR(15) NOT NULL REFERENCES subjects(code),
    session_date DATE NOT NULL,
    period VARCHAR(5) NOT NULL,
    status attendance_status NOT NULL DEFAULT 'absent',
    marked_by VARCHAR(30) NOT NULL, -- 'faculty', 'qr_scan', 'proctor', 'system_od'
    marked_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ,
    updated_by UUID REFERENCES users(id),
    edit_reason TEXT,
    latitude NUMERIC(9,6),
    longitude NUMERIC(9,6),
    device_id VARCHAR(100),
    is_offline_sync BOOLEAN DEFAULT FALSE,
    CONSTRAINT uq_session_student UNIQUE (session_id, student_id)
);

CREATE INDEX idx_att_student ON attendance_records(student_id);
CREATE INDEX idx_att_subject_student ON attendance_records(subject_code, student_id);
CREATE INDEX idx_att_date ON attendance_records(session_date);

-- 7. LEAVE & ON-DUTY (OD) WORKFLOW
CREATE TABLE leave_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    leave_type leave_type NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT NOT NULL,
    attachment_url TEXT,
    status leave_status DEFAULT 'pending',
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMPTZ,
    review_remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_leaves_student ON leave_requests(student_id);
CREATE INDEX idx_leaves_status ON leave_requests(status);

-- 8. PROCTORING & MENTORING NOTES
CREATE TABLE proctor_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proctor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    interaction_date DATE DEFAULT CURRENT_DATE,
    category VARCHAR(50) NOT NULL, -- attendance_warning, academic, parent_call, counseling
    note TEXT NOT NULL,
    parent_contacted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_proctor_notes_student ON proctor_notes(student_id);

-- 9. IMMUTABLE AUDIT LOGS
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    user_id UUID REFERENCES users(id),
    user_name VARCHAR(150),
    action VARCHAR(50) NOT NULL,
    details TEXT NOT NULL,
    ip_address INET
);

CREATE INDEX idx_audit_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX idx_audit_user ON audit_logs(user_id);
`;

export const OPENAPI_SPEC = {
  openapi: "3.0.3",
  info: {
    title: "BITM MBA Attendance Management System API",
    version: "1.0.0",
    description: "RESTful API specification for Ballari Institute of Technology & Management MBA attendance workflows, timetable engine, QR check-in, VTU metrics, and proctoring."
  },
  servers: [{ url: "/api/v1", description: "Production / Dev API Server" }],
  paths: {
    "/auth/login": {
      post: {
        summary: "Login with college email and password/OTP",
        requestBody: {
          content: { "application/json": { schema: { type: "object", properties: { email: { type: "string" }, password: { type: "string" } } } } }
        },
        responses: { 200: { description: "Returns JWT access & refresh tokens with user profile" } }
      }
    },
    "/timetable/daily": {
      get: {
        summary: "Fetch resolved daily timetable for date",
        parameters: [
          { name: "date", in: "query", schema: { type: "string", format: "date" } },
          { name: "userId", in: "query", schema: { type: "string" } }
        ],
        responses: { 200: { description: "Returns schedule slots with Saturday swap mappings applied" } }
      }
    },
    "/sessions/start": {
      post: {
        summary: "Faculty initiates an active attendance session",
        requestBody: {
          content: { "application/json": { schema: { type: "object", properties: { date: { type: "string" }, period: { type: "string" }, subjectCode: { type: "string" } } } } }
        },
        responses: { 201: { description: "Returns session with dynamic QR code & 6-digit PIN" } }
      }
    },
    "/attendance/mark-batch": {
      post: {
        summary: "Faculty submits batch attendance records",
        requestBody: {
          content: { "application/json": { schema: { type: "object", properties: { sessionId: { type: "string" }, records: { type: "array" } } } } }
        },
        responses: { 200: { description: "Batch saved and audit log generated" } }
      }
    },
    "/attendance/verify-qr": {
      post: {
        summary: "Student check-in via QR scan or 6-digit PIN",
        requestBody: {
          content: { "application/json": { schema: { type: "object", properties: { sessionId: { type: "string" }, tokenOrPin: { type: "string" }, latitude: { type: "number" }, longitude: { type: "number" }, deviceId: { type: "string" } } } } }
        },
        responses: { 200: { description: "Attendance recorded successfully" }, 403: { description: "Geofence / token expired" } }
      }
    },
    "/attendance/metrics/{studentId}": {
      get: {
        summary: "Retrieve VTU attendance percentages & bunk allowance",
        parameters: [{ name: "studentId", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Subject-wise % and safe bunk margin" } }
      }
    },
    "/leaves/request": {
      post: {
        summary: "Student submits Medical or OD Leave request",
        requestBody: {
          content: { "multipart/form-data": { schema: { type: "object", properties: { leaveType: { type: "string" }, startDate: { type: "string" }, endDate: { type: "string" }, reason: { type: "string" }, document: { type: "string", format: "binary" } } } } }
        },
        responses: { 201: { description: "Submitted for Proctor/HOD review" } }
      }
    },
    "/reports/defaulters": {
      get: {
        summary: "HOD/Admin export of students below 75% VTU threshold",
        parameters: [
          { name: "threshold", in: "query", schema: { type: "number", default: 75 } },
          { name: "section", in: "query", schema: { type: "string" } }
        ],
        responses: { 200: { description: "Returns CSV/JSON defaulter list" } }
      }
    }
  }
};
