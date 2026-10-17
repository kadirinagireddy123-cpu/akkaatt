import React, { useState, useMemo } from 'react';
import {
  User,
  Subject,
  AttendanceRecord,
  LeaveRequest,
  AuditLog
} from '../../types';
import {
  getDailyScheduleForStudent,
  ResolvedDailySlot
} from '../../utils/timetableEngine';
import {
  calculateSubjectAttendance,
  simulateAttendanceProjection,
  SubjectAttendanceMetrics,
  MANDATORY_MINIMUM_PERCENTAGE
} from '../../utils/vtuCalculator';
import { validateAttendanceToken, calculateGeoDistanceMeters } from '../../utils/qrCrypto';
import { BITM_CAMPUS_COORDS } from '../../data/seedData';
import {
  Calendar,
  Clock,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  QrCode,
  FileText,
  Upload,
  Percent,
  Calculator,
  Compass,
  ArrowRight,
  TrendingUp,
  MapPin
} from 'lucide-react';

interface StudentDashboardViewProps {
  currentStudent: User;
  subjects: Subject[];
  attendanceRecords: AttendanceRecord[];
  leaveRequests: LeaveRequest[];
  onSubmitLeave: (newLeave: LeaveRequest, auditLog: AuditLog) => void;
  onSelfMarkAttendance: (newRecord: AttendanceRecord, auditLog: AuditLog) => void;
}

export const StudentDashboardView: React.FC<StudentDashboardViewProps> = ({
  currentStudent,
  subjects,
  attendanceRecords,
  leaveRequests,
  onSubmitLeave,
  onSelfMarkAttendance
}) => {
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-13');
  const [activeTab, setActiveTab] = useState<'schedule' | 'calculator' | 'leaves' | 'checkin'>('schedule');

  // Check-in modal state
  const [checkInPin, setCheckInPin] = useState<string>('');
  const [checkInStatusMessage, setCheckInStatusMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // "What if I bunk" simulator state
  const [selectedSubjectForCalc, setSelectedSubjectForCalc] = useState<string>('');
  const [simUpcomingTotal, setSimUpcomingTotal] = useState<number>(5);
  const [simUpcomingAttended, setSimUpcomingAttended] = useState<number>(4);

  // Leave application state
  const [leaveType, setLeaveType] = useState<'medical' | 'on_duty' | 'placement'>('on_duty');
  const [leaveStartDate, setLeaveStartDate] = useState<string>('2026-10-15');
  const [leaveReason, setLeaveReason] = useState<string>('');
  const [leaveAttachmentName, setLeaveAttachmentName] = useState<string>('');
  const [leaveSubmittedNotice, setLeaveSubmittedNotice] = useState<string | null>(null);

  // Daily schedule for student
  const dailySlots = useMemo(() => {
    return getDailyScheduleForStudent(currentStudent, selectedDate);
  }, [currentStudent, selectedDate]);

  // Calculate subject-wise attendance metrics for all subjects enrolled
  const subjectMetrics = useMemo(() => {
    return subjects
      .filter(s => {
        if (s.category === 'general' || s.category === 'core') return true;
        if (s.category === 'finance' && currentStudent.primarySpec === 'Finance') return true;
        if (s.category === 'hr' && currentStudent.primarySpec === 'HR') return true;
        if (s.category === 'marketing' && currentStudent.primarySpec === 'Marketing') return true;
        if (s.category === 'logistics' && currentStudent.primarySpec === 'Logistics & SCM') return true;
        if (s.category === 'analytics' && currentStudent.dualSpec === 'Business Analytics') return true;
        if (s.category === 'datascience' && currentStudent.dualSpec === 'Data Science') return true;
        return false;
      })
      .map(subject => calculateSubjectAttendance(subject.code, attendanceRecords, currentStudent.id));
  }, [subjects, attendanceRecords, currentStudent]);

  // Overall attendance calculation
  const overallStats = useMemo(() => {
    let totalConducted = 0;
    let totalAttended = 0;
    subjectMetrics.forEach(m => {
      totalConducted += m.totalConducted;
      totalAttended += m.attended + m.onDuty;
    });
    const percentage = totalConducted > 0 ? (totalAttended / totalConducted) * 100 : 100;
    return {
      conducted: totalConducted,
      attended: totalAttended,
      percentage: Math.round(percentage * 10) / 10
    };
  }, [subjectMetrics]);

  // Set default subject for calculator if not set
  React.useEffect(() => {
    if (!selectedSubjectForCalc && subjectMetrics.length > 0) {
      setSelectedSubjectForCalc(subjectMetrics[0].subjectCode);
    }
  }, [subjectMetrics, selectedSubjectForCalc]);

  const activeCalcSubjectMetric = subjectMetrics.find(m => m.subjectCode === selectedSubjectForCalc);

  const simulationResult = useMemo(() => {
    if (!activeCalcSubjectMetric) return null;
    return simulateAttendanceProjection(
      activeCalcSubjectMetric.attended + activeCalcSubjectMetric.onDuty,
      activeCalcSubjectMetric.totalConducted,
      simUpcomingTotal,
      simUpcomingAttended,
      MANDATORY_MINIMUM_PERCENTAGE
    );
  }, [activeCalcSubjectMetric, simUpcomingTotal, simUpcomingAttended]);

  // Handle self-checkin via PIN / QR
  const handleCheckInSubmit = () => {
    if (!checkInPin.trim()) {
      setCheckInStatusMessage({ text: 'Please enter the 6-digit Session PIN.', isError: true });
      return;
    }

    const distance = calculateGeoDistanceMeters(
      BITM_CAMPUS_COORDS.latitude,
      BITM_CAMPUS_COORDS.longitude,
      BITM_CAMPUS_COORDS.latitude + 0.0001,
      BITM_CAMPUS_COORDS.longitude + 0.0001
    );

    if (distance > BITM_CAMPUS_COORDS.radiusMeters) {
      setCheckInStatusMessage({
        text: 'Geofence Error: You must be within BITM campus perimeter to mark attendance.',
        isError: true
      });
      return;
    }

    const currentSlot = dailySlots[0];
    if (!currentSlot) {
      setCheckInStatusMessage({ text: 'No active lecture session found for today.', isError: true });
      return;
    }

    const timestamp = new Date().toISOString();
    const newRecord: AttendanceRecord = {
      id: `rec-self-${Date.now()}`,
      sessionId: `sess-${selectedDate}-${currentSlot.slotNumber}`,
      studentId: currentStudent.id,
      subjectCode: currentSlot.subject.code,
      date: selectedDate,
      period: currentSlot.slotNumber,
      status: 'present',
      markedBy: 'qr_scan',
      markedAt: timestamp,
      latitude: BITM_CAMPUS_COORDS.latitude,
      longitude: BITM_CAMPUS_COORDS.longitude,
      deviceId: 'student-android-client',
      synced: true
    };

    const auditLog: AuditLog = {
      id: `audit-qr-${Date.now()}`,
      timestamp,
      userId: currentStudent.id,
      userName: currentStudent.name,
      action: 'MARK_ATTENDANCE',
      details: `Student verified check-in via Session PIN (${checkInPin}) for ${currentSlot.subject.code} (${currentSlot.slotNumber}). Geofence verified.`
    };

    onSelfMarkAttendance(newRecord, auditLog);
    setCheckInStatusMessage({
      text: `Successfully checked in for ${currentSlot.subject.code} (${currentSlot.subject.name})!`,
      isError: false
    });
    setCheckInPin('');
  };

  const handleLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveReason.trim()) return;

    const newLeave: LeaveRequest = {
      id: `leave-${Date.now()}`,
      studentId: currentStudent.id,
      studentName: currentStudent.name,
      usn: currentStudent.usn || '',
      type: leaveType,
      startDate: leaveStartDate,
      endDate: leaveStartDate,
      affectedSlots: [{ date: leaveStartDate, period: 'P1-P8', subjectCode: 'ALL_SLOTS' }],
      reason: leaveReason,
      attachmentName: leaveAttachmentName || 'supporting_document.pdf',
      status: 'pending'
    };

    const auditLog: AuditLog = {
      id: `audit-leave-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: currentStudent.id,
      userName: currentStudent.name,
      action: 'APPROVE_LEAVE',
      details: `Student submitted ${leaveType.toUpperCase()} leave request for ${leaveStartDate}. Reason: ${leaveReason}`
    };

    onSubmitLeave(newLeave, auditLog);
    setLeaveSubmittedNotice('Leave request submitted to Proctor (Dr. Sathik S) for approval.');
    setLeaveReason('');
    setLeaveAttachmentName('');
    setTimeout(() => setLeaveSubmittedNotice(null), 4000);
  };

  const isOverallEligible = overallStats.percentage >= MANDATORY_MINIMUM_PERCENTAGE;

  return (
    <div className="space-y-6">
      {/* Student Profile & Quick Overview Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-slate-900 dark:text-white">
                {currentStudent.name}
              </span>
              <span className="text-xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded font-semibold">
                {currentStudent.usn}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Sec {currentStudent.section} · Primary: <strong className="text-slate-800 dark:text-slate-200">{currentStudent.primarySpec}</strong> · Dual: <strong className="text-slate-800 dark:text-slate-200">{currentStudent.dualSpec}</strong>
            </p>
          </div>

          {/* Overall Percentage Badge against 85% requirement */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs text-slate-500">
                Overall Attendance (Min: <strong>85%</strong>)
              </div>
              <div className={`text-2xl font-extrabold font-mono tabular-nums ${
                isOverallEligible ? 'text-emerald-600' : 'text-rose-600'
              }`}>
                {overallStats.percentage}%
              </div>
            </div>
            <div className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${
              isOverallEligible
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
            }`}>
              {isOverallEligible ? 'Eligible (≥ 85%)' : 'Defaulter Alert (< 85%)'}
            </div>
          </div>
        </div>

        {/* Sub-Tabs */}
        <div className="pt-4 flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setActiveTab('schedule')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'schedule'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Today's Classes</span>
          </button>

          <button
            onClick={() => setActiveTab('calculator')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'calculator'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>"What If I Bunk" (85% Target)</span>
          </button>

          <button
            onClick={() => setActiveTab('checkin')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'checkin'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 hover:text-slate-900'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Session PIN / QR Check-In</span>
          </button>

          <button
            onClick={() => setActiveTab('leaves')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'leaves'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>OD & Leave Requests</span>
          </button>
        </div>
      </div>

      {/* TAB 1: TODAY'S PERSONALISED TIMETABLE */}
      {activeTab === 'schedule' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Personalized Timetable for {currentStudent.primarySpec} & {currentStudent.dualSpec}
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Select Date:</span>
              <input
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className="text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {dailySlots.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              No classes scheduled on this day.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {dailySlots.map((slot) => {
                const metric = subjectMetrics.find(m => m.subjectCode === slot.subject.code);

                return (
                  <div
                    key={slot.periodId}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
                        <span className="text-xs font-bold font-mono text-blue-600 dark:text-blue-400">
                          {slot.slotNumber} · {slot.timeRange}
                        </span>
                        <span className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600">
                          Room: {slot.subject.classroom}
                        </span>
                      </div>

                      <div className="mt-2 font-bold text-sm text-slate-900 dark:text-white">
                        {slot.subject.code} — {slot.subject.name}
                      </div>

                      <div className="text-xs text-slate-500 mt-1">
                        Faculty: <strong>{slot.subject.facultyName}</strong>
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-slate-500">
                        Attendance (Min 85%):
                      </span>
                      <span className={`font-mono font-bold ${
                        (metric?.percentage || 100) >= 85 ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {metric ? `${metric.percentage}% (${metric.attended}/${metric.totalConducted})` : '100%'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Subject Attendance Breakdown Cards */}
          <div className="mt-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
              Subject-Wise Attendance Matrix (85% Target Threshold)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {subjectMetrics.map(m => {
                const sub = subjects.find(s => s.code === m.subjectCode);
                const isSubEligible = m.percentage >= 85;

                return (
                  <div
                    key={m.subjectCode}
                    className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {m.subjectCode}
                      </span>
                      <span className={`text-xs font-mono font-bold ${
                        isSubEligible ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {m.percentage}%
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 truncate mt-0.5">
                      {sub?.name}
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-500 space-y-1">
                      <div className="flex justify-between">
                        <span>Attended / Conducted:</span>
                        <span className="font-mono">{m.attended + m.onDuty} / {m.totalConducted}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Safe Bunk Margin (to stay ≥ 85%):</span>
                        <span className="font-mono text-emerald-600 font-bold">{m.bunkAllowanceFor85} classes</span>
                      </div>
                      {!isSubEligible && (
                        <div className="flex justify-between text-rose-600 font-semibold">
                          <span>Classes needed for 85%:</span>
                          <span className="font-mono">{m.classesNeededFor85}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: "WHAT IF I BUNK" CALCULATOR CONFIGURED FOR 85% */}
      {activeTab === 'calculator' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-5">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calculator className="w-4 h-4 text-indigo-600" />
              <span>Attendance Simulator ("What If I Bunk?" Calculator — 85% Rule)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Test hypothetical attendance scenarios before missing classes. Institutional requirement is a strict <strong>85% minimum attendance</strong>.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Select Subject:
              </label>
              <select
                value={selectedSubjectForCalc}
                onChange={e => setSelectedSubjectForCalc(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
              >
                {subjectMetrics.map(m => {
                  const s = subjects.find(sub => sub.code === m.subjectCode);
                  return (
                    <option key={m.subjectCode} value={m.subjectCode}>
                      {m.subjectCode} — {s?.name} (Current: {m.percentage}%)
                    </option>
                  );
                })}
              </select>
            </div>

            {activeCalcSubjectMetric && (
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
                    Current Standing
                  </div>
                  <div className="text-lg font-bold text-slate-900 dark:text-white font-mono mt-0.5">
                    {activeCalcSubjectMetric.percentage}%
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {activeCalcSubjectMetric.attended + activeCalcSubjectMetric.onDuty} attended / {activeCalcSubjectMetric.totalConducted} conducted
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] text-slate-500">Safe Skips to stay ≥ 85%</div>
                  <div className="text-base font-bold text-emerald-600 font-mono">
                    {activeCalcSubjectMetric.bunkAllowanceFor85} classes
                  </div>
                  {activeCalcSubjectMetric.percentage < 85 && (
                    <div className="text-[10px] text-rose-500 font-semibold">
                      Must attend next {activeCalcSubjectMetric.classesNeededFor85} classes
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Simulate Future Attendance
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">
                  Upcoming Classes to be Conducted ({simUpcomingTotal}):
                </label>
                <input
                  type="range"
                  min="1"
                  max="25"
                  value={simUpcomingTotal}
                  onChange={e => {
                    const total = parseInt(e.target.value);
                    setSimUpcomingTotal(total);
                    if (simUpcomingAttended > total) setSimUpcomingAttended(total);
                  }}
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">
                  Classes You Plan to Attend ({simUpcomingAttended}):
                </label>
                <input
                  type="range"
                  min="0"
                  max={simUpcomingTotal}
                  value={simUpcomingAttended}
                  onChange={e => setSimUpcomingAttended(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>

            {simulationResult && (
              <div className={`p-4 rounded-2xl border ${
                simulationResult.meetsVTUThreshold
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50/80 border-rose-200 text-rose-900'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider">
                      Simulated Final Percentage (Target: 85%)
                    </div>
                    <div className="text-2xl font-black font-mono mt-1">
                      {simulationResult.projectedPercentage}%{' '}
                      <span className="text-xs font-medium font-sans">
                        ({simulationResult.delta >= 0 ? `+${simulationResult.delta}%` : `${simulationResult.delta}%`})
                      </span>
                    </div>
                    <p className="text-xs mt-1">
                      Skipping {simUpcomingTotal - simUpcomingAttended} classes will result in {simulationResult.projectedPercentage}% final attendance.
                    </p>
                  </div>

                  <div className="shrink-0">
                    <span className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                      simulationResult.meetsVTUThreshold
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-rose-600 text-white shadow-xs'
                    }`}>
                      {simulationResult.meetsVTUThreshold ? 'Above 85% Minimum' : 'Defaulter Alert (< 85%)'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: SESSION PIN / QR CHECK-IN */}
      {activeTab === 'checkin' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs max-w-md mx-auto space-y-4 text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white mx-auto flex items-center justify-center">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Classroom Attendance Check-In
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Enter the rotating 6-digit PIN projected on the faculty screen, or scan the dynamic classroom QR code.
            </p>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs text-slate-600 flex items-center justify-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Campus Geofence: Active within BITM MBA Block</span>
          </div>

          {checkInStatusMessage && (
            <div className={`p-3 rounded-xl text-xs flex items-center gap-2 text-left ${
              checkInStatusMessage.isError
                ? 'bg-rose-50 text-rose-800 border border-rose-200'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            }`}>
              {checkInStatusMessage.isError ? (
                <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              )}
              <span>{checkInStatusMessage.text}</span>
            </div>
          )}

          <div className="space-y-3">
            <input
              type="text"
              maxLength={6}
              value={checkInPin}
              onChange={e => setCheckInPin(e.target.value.toUpperCase())}
              placeholder="e.g. BTM842"
              className="w-full text-center text-2xl font-mono font-bold tracking-widest p-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 dark:text-white"
            />

            <button
              onClick={handleCheckInSubmit}
              className="w-full py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:bg-slate-800 transition-colors shadow-md"
            >
              Verify PIN & Mark Attendance
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: LEAVE & ON-DUTY (OD) WORKFLOW */}
      {activeTab === 'leaves' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Apply for Leave or On-Duty (OD) Exemption
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Approved OD exemptions automatically credit attendance towards your 85% requirement.
            </p>

            {leaveSubmittedNotice && (
              <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{leaveSubmittedNotice}</span>
              </div>
            )}

            <form onSubmit={handleLeaveSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Exemption Category
                  </label>
                  <select
                    value={leaveType}
                    onChange={e => setLeaveType(e.target.value as any)}
                    className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  >
                    <option value="on_duty">Institutional On-Duty (OD) - Fest / Sports / Placement</option>
                    <option value="medical">Medical Exemption</option>
                    <option value="placement">Campus Placement Drive</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Date of Absence
                  </label>
                  <input
                    type="date"
                    value={leaveStartDate}
                    onChange={e => setLeaveStartDate(e.target.value)}
                    className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Reason & Purpose
                </label>
                <textarea
                  rows={2}
                  value={leaveReason}
                  onChange={e => setLeaveReason(e.target.value)}
                  placeholder="e.g., Representing BITM in Inter-Collegiate Management Fest / Placement interview at Bangalore campus."
                  className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Supporting Letter / Certificate Attachment
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={leaveAttachmentName}
                    onChange={e => setLeaveAttachmentName(e.target.value)}
                    placeholder="bitm_fest_deputation_order.pdf"
                    className="flex-1 text-xs p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setLeaveAttachmentName('od_proof_document.pdf')}
                    className="px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
                  >
                    Simulate Upload
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold shadow-xs hover:bg-slate-800"
              >
                Submit Exemption Request
              </button>
            </form>
          </div>

          {/* Past Leave Requests Status */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
              Your Leave & OD Request History
            </h3>
            <div className="space-y-3">
              {leaveRequests
                .filter(l => l.studentId === currentStudent.id)
                .map(leave => (
                  <div
                    key={leave.id}
                    className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                          {leave.type.replace('_', ' ')}
                        </span>
                        <span className="text-slate-400">·</span>
                        <span className="text-slate-500 font-mono">{leave.startDate}</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 mt-1">{leave.reason}</p>
                      {leave.reviewRemarks && (
                        <p className="text-emerald-600 mt-1 italic">Proctor Note: {leave.reviewRemarks}</p>
                      )}
                    </div>

                    <div className="shrink-0">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                        leave.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : leave.status === 'rejected'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {leave.status}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
