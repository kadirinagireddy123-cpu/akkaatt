import React, { useState, useEffect } from 'react';
import {
  User,
  Subject,
  AttendanceRecord,
  AttendanceStatus,
  ClassSession,
  AuditLog
} from '../../types';
import {
  getDailyScheduleForFaculty,
  isSubjectEnrolledForStudent,
  ResolvedDailySlot
} from '../../utils/timetableEngine';
import {
  createQRPayload,
  generateQRCodeDataUrl,
  generateSessionPin
} from '../../utils/qrCrypto';
import { enqueueAttendanceAction } from '../../utils/offlineSync';
import {
  Play,
  QrCode,
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  Users,
  RefreshCw,
  Edit3,
  Calendar,
  MapPin,
  ShieldAlert,
  ChevronRight,
  FileCheck
} from 'lucide-react';

interface FacultyAttendanceViewProps {
  currentFaculty: User;
  students: User[];
  subjects: Subject[];
  attendanceRecords: AttendanceRecord[];
  onSaveAttendance: (newRecords: AttendanceRecord[], auditLog: AuditLog) => void;
  isOnline: boolean;
}

export const FacultyAttendanceView: React.FC<FacultyAttendanceViewProps> = ({
  currentFaculty,
  students,
  subjects,
  attendanceRecords,
  onSaveAttendance,
  isOnline
}) => {
  // Current date (default to 2026-10-13 or user-selectable date)
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-13');
  const [scheduleSlots, setScheduleSlots] = useState<ResolvedDailySlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<ResolvedDailySlot | null>(null);

  // Active attendance state
  const [sessionActive, setSessionActive] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string>('');
  const [sessionPin, setSessionPin] = useState<string>('');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [qrCountdown, setQrCountdown] = useState<number>(30);
  const [showQRModal, setShowQRModal] = useState<boolean>(false);

  // Student marks map: studentId -> status
  const [markingMap, setMarkingMap] = useState<Record<string, AttendanceStatus>>({});
  const [editReasonModal, setEditReasonModal] = useState<boolean>(false);
  const [editReasonText, setEditReasonText] = useState<string>('');
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<string | null>(null);

  // Load faculty's slots for selected date
  useEffect(() => {
    const slots = getDailyScheduleForFaculty(currentFaculty.id, selectedDate);
    setScheduleSlots(slots);
    if (slots.length > 0) {
      setSelectedSlot(slots[0]);
    } else {
      setSelectedSlot(null);
    }
  }, [currentFaculty.id, selectedDate]);

  // Filter students who are actually enrolled in the selected subject
  const enrolledStudents = React.useMemo(() => {
    if (!selectedSlot) return [];
    return students.filter(student =>
      isSubjectEnrolledForStudent(selectedSlot.subject, student)
    );
  }, [selectedSlot, students]);

  // Load any existing attendance records for the selected slot on this date
  useEffect(() => {
    if (!selectedSlot) return;
    const existingForSlot = attendanceRecords.filter(
      r => r.date === selectedDate && r.period === selectedSlot.slotNumber && r.subjectCode === selectedSlot.subject.code
    );

    const initialMap: Record<string, AttendanceStatus> = {};
    enrolledStudents.forEach(stu => {
      const rec = existingForSlot.find(r => r.studentId === stu.id);
      initialMap[stu.id] = rec ? rec.status : 'present'; // Default all to present for speed
    });
    setMarkingMap(initialMap);

    // If already finalized
    if (existingForSlot.length > 0) {
      setActiveSessionId(existingForSlot[0].sessionId);
    }
  }, [selectedSlot, selectedDate, attendanceRecords, enrolledStudents]);

  // Generate QR code and countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (sessionActive && selectedSlot) {
      const pin = generateSessionPin();
      setSessionPin(pin);
      const payload = createQRPayload(activeSessionId, selectedSlot.subject.code, currentFaculty.id, pin);
      generateQRCodeDataUrl(payload).then(url => setQrDataUrl(url));

      setQrCountdown(30);
      timer = setInterval(() => {
        setQrCountdown(prev => {
          if (prev <= 1) {
            // Regenerate
            const newPin = generateSessionPin();
            setSessionPin(newPin);
            const newPayload = createQRPayload(activeSessionId, selectedSlot.subject.code, currentFaculty.id, newPin);
            generateQRCodeDataUrl(newPayload).then(url => setQrDataUrl(url));
            return 30;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [sessionActive, selectedSlot, activeSessionId, currentFaculty.id]);

  const handleStartClass = () => {
    if (!selectedSlot) return;
    const newSessionId = `sess-${selectedDate}-${selectedSlot.slotNumber}-${Date.now()}`;
    setActiveSessionId(newSessionId);
    setSessionActive(true);
    setShowQRModal(true);
  };

  const handleMarkAll = (status: AttendanceStatus) => {
    const next: Record<string, AttendanceStatus> = {};
    enrolledStudents.forEach(s => {
      next[s.id] = status;
    });
    setMarkingMap(next);
  };

  const handleToggleStudent = (studentId: string) => {
    setMarkingMap(prev => {
      const curr = prev[studentId] || 'present';
      const order: AttendanceStatus[] = ['present', 'absent', 'late', 'od'];
      const nextIdx = (order.indexOf(curr) + 1) % order.length;
      return {
        ...prev,
        [studentId]: order[nextIdx]
      };
    });
  };

  const handleSetStudentStatus = (studentId: string, status: AttendanceStatus) => {
    setMarkingMap(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleCommitAttendance = (reason?: string) => {
    if (!selectedSlot) return;

    const sessionId = activeSessionId || `sess-${selectedDate}-${selectedSlot.slotNumber}-${Date.now()}`;
    const timestamp = new Date().toISOString();

    const newRecords: AttendanceRecord[] = enrolledStudents.map(student => ({
      id: `rec-${sessionId}-${student.id}`,
      sessionId,
      studentId: student.id,
      subjectCode: selectedSlot.subject.code,
      date: selectedDate,
      period: selectedSlot.slotNumber,
      status: markingMap[student.id] || 'present',
      markedBy: 'faculty',
      markedAt: timestamp,
      updatedAt: reason ? timestamp : undefined,
      updatedBy: reason ? currentFaculty.id : undefined,
      editReason: reason,
      synced: isOnline
    }));

    if (!isOnline) {
      newRecords.forEach(rec => {
        enqueueAttendanceAction({ type: 'MARK', record: rec });
      });
    }

    const auditLog: AuditLog = {
      id: `audit-${Date.now()}`,
      timestamp,
      userId: currentFaculty.id,
      userName: currentFaculty.name,
      action: reason ? 'UPDATE_ATTENDANCE' : 'MARK_ATTENDANCE',
      details: `${currentFaculty.name} ${reason ? 'updated' : 'finalized'} attendance for ${selectedSlot.subject.code} (${selectedSlot.subject.name}), Period ${selectedSlot.slotNumber} on ${selectedDate}. ${reason ? `Reason: ${reason}` : ''}`
    };

    onSaveAttendance(newRecords, auditLog);
    setSessionActive(false);
    setShowQRModal(false);
    setEditReasonModal(false);
    setSaveSuccessNotice(
      `Attendance for ${selectedSlot.subject.code} (${newRecords.length} students) ${isOnline ? 'saved successfully' : 'queued locally (offline)'}.`
    );
    setTimeout(() => setSaveSuccessNotice(null), 4000);
  };

  // Stats for the active roster
  const presentCount = Object.values(markingMap).filter(s => s === 'present' || s === 'late' || s === 'od').length;
  const absentCount = Object.values(markingMap).filter(s => s === 'absent').length;

  return (
    <div className="space-y-6">
      {/* Date & Slot Selector Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Faculty Attendance Register
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Logged in as <strong className="text-slate-800 dark:text-slate-200">{currentFaculty.name}</strong> · {currentFaculty.designation}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 whitespace-nowrap">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Date:</span>
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
        </div>

        {/* Schedule Slots Carousel for the day */}
        <div className="pt-4">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Assigned Slots on {selectedDate} ({scheduleSlots.length} Total)
          </div>

          {scheduleSlots.length === 0 ? (
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-center text-xs text-slate-500">
              No classes assigned to you on this date (Sunday or non-teaching day). Try switching the date or testing a Saturday swap date like <strong className="text-slate-800">2026-09-26</strong>!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {scheduleSlots.map(slot => {
                const isSelected = selectedSlot?.slotNumber === slot.slotNumber && selectedSlot?.subject.code === slot.subject.code;
                return (
                  <button
                    key={`${slot.slotNumber}-${slot.subject.code}`}
                    onClick={() => setSelectedSlot(slot)}
                    className={`p-3 rounded-xl border text-left transition-all relative ${
                      isSelected
                        ? 'border-slate-900 dark:border-white bg-slate-900 text-white shadow-md'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-800 dark:text-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                        {slot.slotNumber} · {slot.timeRange}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}>
                        Room: {slot.subject.classroom}
                      </span>
                    </div>
                    <div className={`text-sm font-semibold mt-1 truncate ${isSelected ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                      {slot.subject.code}
                    </div>
                    <div className={`text-xs truncate ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                      {slot.subject.name}
                    </div>
                    {slot.isSaturdaySwap && (
                      <div className="mt-1 text-[10px] text-amber-300 font-medium">
                        ✦ Sat Swap ({slot.swapDescription})
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {saveSuccessNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveSuccessNotice}</span>
        </div>
      )}

      {/* Selected Slot Attendance Roster */}
      {selectedSlot && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-5">
          {/* Slot Header & Primary Actions */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300 font-semibold">
                  {selectedSlot.slotNumber} ({selectedSlot.timeRange})
                </span>
                <span className="text-xs text-slate-500">
                  Room: <strong>{selectedSlot.subject.classroom}</strong> · Section: <strong>{selectedSlot.subject.section}</strong>
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                {selectedSlot.subject.code} — {selectedSlot.subject.name}
              </h2>
              <div className="text-xs text-slate-500 flex items-center gap-3 mt-1">
                <span>Enrolled: <strong>{enrolledStudents.length} Students</strong></span>
                <span>·</span>
                <span className="text-emerald-600 font-semibold">Present: {presentCount}</span>
                <span>·</span>
                <span className="text-rose-600 font-semibold">Absent: {absentCount}</span>
              </div>
            </div>

            {/* Attendance Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleStartClass}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-xs"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start Class & Show QR</span>
              </button>

              <button
                onClick={() => handleMarkAll('present')}
                className="px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Mark All Present
              </button>

              <button
                onClick={() => setEditReasonModal(true)}
                className="px-3 py-2 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300 rounded-xl transition-colors flex items-center gap-1"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit / Finalize</span>
              </button>
            </div>
          </div>

          {/* Student Roster List with Fast 1-Tap Toggles */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 px-2">
              <span>Student / USN / Specialization</span>
              <span>Attendance Status</span>
            </div>

            {enrolledStudents.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 dark:bg-slate-800 rounded-xl">
                No students enrolled in this specific specialization group.
              </div>
            ) : (
              enrolledStudents.map(student => {
                const status = markingMap[student.id] || 'present';

                return (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 bg-slate-50/40 dark:bg-slate-800/30 transition-colors"
                  >
                    <div
                      className="cursor-pointer flex-1 pr-3"
                      onClick={() => handleToggleStudent(student.id)}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">
                          {student.name}
                        </span>
                        <span className="text-[10px] font-mono bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-1.5 py-0.2 rounded">
                          {student.usn}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Sec {student.section} · {student.primarySpec} + {student.dualSpec}
                      </div>
                    </div>

                    {/* Segmented Status Selector with minimum 44px hitboxes */}
                    <div className="flex items-center gap-1 p-1 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                      <button
                        onClick={() => handleSetStudentStatus(student.id, 'present')}
                        className={`min-h-[38px] px-2.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1 ${
                          status === 'present'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                        }`}
                        title="Present"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">P</span>
                      </button>

                      <button
                        onClick={() => handleSetStudentStatus(student.id, 'absent')}
                        className={`min-h-[38px] px-2.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1 ${
                          status === 'absent'
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                        }`}
                        title="Absent"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">A</span>
                      </button>

                      <button
                        onClick={() => handleSetStudentStatus(student.id, 'late')}
                        className={`min-h-[38px] px-2.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1 ${
                          status === 'late'
                            ? 'bg-amber-500 text-white shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                        }`}
                        title="Late"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">L</span>
                      </button>

                      <button
                        onClick={() => handleSetStudentStatus(student.id, 'od')}
                        className={`min-h-[38px] px-2.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1 ${
                          status === 'od'
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                        }`}
                        title="On-Duty"
                      >
                        <Award className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">OD</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Quick Commit Bar */}
          <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
            <div className="text-xs text-slate-500">
              💡 Tap student row or buttons to toggle status. Edits remain unlocked for 24h with audit log.
            </div>
            <button
              onClick={() => handleCommitAttendance()}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold shadow-md hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
            >
              <FileCheck className="w-4 h-4" />
              <span>Save & Finalize Attendance</span>
            </button>
          </div>
        </div>
      )}

      {/* Dynamic Anti-Proxy QR Code Modal */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-center">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="text-left">
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Live Attendance Check-In
                </span>
                <p className="text-[11px] text-slate-500">
                  {selectedSlot?.subject.code} · Room {selectedSlot?.subject.classroom}
                </p>
              </div>
              <button
                onClick={() => setShowQRModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            {/* QR Display */}
            <div className="my-4 flex flex-col items-center justify-center">
              {qrDataUrl ? (
                <div className="p-3 bg-white rounded-2xl shadow-inner border border-slate-200">
                  <img
                    src={qrDataUrl}
                    alt="Anti-proxy attendance QR"
                    className="w-56 h-56 rounded-lg object-contain"
                  />
                </div>
              ) : (
                <div className="w-56 h-56 flex items-center justify-center bg-slate-100 rounded-2xl">
                  <RefreshCw className="w-6 h-6 animate-spin text-slate-400" />
                </div>
              )}

              {/* Rotating Backup PIN */}
              <div className="mt-3 p-2 bg-slate-100 dark:bg-slate-800 rounded-xl w-full">
                <div className="text-[10px] uppercase font-semibold text-slate-500">
                  Manual Backup Code (For devices without scanner)
                </div>
                <div className="text-xl font-mono font-bold tracking-widest text-slate-900 dark:text-white">
                  {sessionPin || 'BTM842'}
                </div>
              </div>

              {/* Expiration Timer & Geofence Notice */}
              <div className="mt-3 flex items-center justify-between w-full text-xs text-slate-500">
                <div className="flex items-center gap-1 text-blue-600 font-semibold font-mono">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Refreshes in {qrCountdown}s</span>
                </div>
                <div className="flex items-center gap-1 text-slate-500">
                  <MapPin className="w-3 h-3 text-emerald-500" />
                  <span>Geofenced to BITM</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => {
                  setShowQRModal(false);
                  handleCommitAttendance();
                }}
                className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:bg-slate-800"
              >
                Done Scanning & Finalize Roster
              </button>
              <button
                onClick={() => setShowQRModal(false)}
                className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                Close & Return to Manual Roster
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 24-Hour Edit Window Audit Reason Modal */}
      {editReasonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-5 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              <span>Record Modification Audit Reason (24h Policy)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Under autonomous VTU audit guidelines, all retrospective attendance modifications must be accompanied by an official justification.
            </p>

            <textarea
              value={editReasonText}
              onChange={e => setEditReasonText(e.target.value)}
              placeholder="e.g., Student was present but network delayed check-in / Verified late bus arrival."
              rows={3}
              className="mt-3 w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900"
            />

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                onClick={() => setEditReasonModal(false)}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                onClick={() => handleCommitAttendance(editReasonText || 'Routine faculty attendance correction')}
                className="px-4 py-1.5 text-xs font-bold text-white bg-slate-900 rounded-xl hover:bg-slate-800"
              >
                Confirm & Log Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
