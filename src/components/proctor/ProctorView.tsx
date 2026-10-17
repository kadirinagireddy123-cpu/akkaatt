import React, { useState } from 'react';
import {
  User,
  Subject,
  AttendanceRecord,
  LeaveRequest,
  ProctorNote,
  AuditLog
} from '../../types';
import { calculateSubjectAttendance, MANDATORY_MINIMUM_PERCENTAGE } from '../../utils/vtuCalculator';
import {
  ShieldAlert,
  Users,
  CheckCircle,
  XCircle,
  FileText,
  PhoneCall,
  MessageSquare,
  Clock,
  Calendar,
  AlertTriangle
} from 'lucide-react';

interface ProctorViewProps {
  currentProctor: User;
  students: User[];
  subjects: Subject[];
  attendanceRecords: AttendanceRecord[];
  leaveRequests: LeaveRequest[];
  proctorNotes: ProctorNote[];
  onApproveLeave: (leaveId: string, approved: boolean, remarks: string, auditLog: AuditLog) => void;
  onAddProctorNote: (note: ProctorNote, auditLog: AuditLog) => void;
}

export const ProctorView: React.FC<ProctorViewProps> = ({
  currentProctor,
  students,
  subjects,
  attendanceRecords,
  leaveRequests,
  proctorNotes,
  onApproveLeave,
  onAddProctorNote
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>('stu-7'); // Venkatesh Prasad (defaulter sample)
  const [newNoteText, setNewNoteText] = useState<string>('');
  const [parentContactedCheck, setParentContactedCheck] = useState<boolean>(true);
  const [noteCategory, setNoteCategory] = useState<'attendance_warning' | 'academic' | 'parent_call'>('attendance_warning');
  const [actionSuccessNotice, setActionSuccessNotice] = useState<string | null>(null);
  const [parentAlertPreview, setParentAlertPreview] = useState<string | null>(null);

  const mentees = students;

  // Calculate mentee stats using 85% minimum threshold
  const menteeStats = mentees.map(student => {
    let totalConducted = 0;
    let totalAttended = 0;

    subjects.forEach(sub => {
      const metric = calculateSubjectAttendance(sub.code, attendanceRecords, student.id);
      totalConducted += metric.totalConducted;
      totalAttended += metric.attended + metric.onDuty;
    });

    const percentage = totalConducted > 0 ? (totalAttended / totalConducted) * 100 : 100;
    const rounded = Math.round(percentage * 10) / 10;

    return {
      student,
      percentage: rounded,
      isDefaulter: rounded < MANDATORY_MINIMUM_PERCENTAGE, // < 85%
      isWarning: rounded >= MANDATORY_MINIMUM_PERCENTAGE && rounded < 90
    };
  });

  const selectedMentee = mentees.find(m => m.id === selectedStudentId) || mentees[0];

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim() || !selectedMentee) return;

    const newNote: ProctorNote = {
      id: `note-${Date.now()}`,
      proctorId: currentProctor.id,
      studentId: selectedMentee.id,
      date: new Date().toISOString().split('T')[0],
      category: noteCategory,
      note: newNoteText,
      parentContacted: parentContactedCheck
    };

    const auditLog: AuditLog = {
      id: `audit-note-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: currentProctor.id,
      userName: currentProctor.name,
      action: 'CREATE_SESSION',
      details: `Proctor ${currentProctor.name} recorded counseling note for ${selectedMentee.name} (${selectedMentee.usn}). Category: ${noteCategory}. Parent Contacted: ${parentContactedCheck}`
    };

    onAddProctorNote(newNote, auditLog);
    setNewNoteText('');
    setActionSuccessNotice('Mentoring note and parent communication logged.');
    setTimeout(() => setActionSuccessNotice(null), 3000);
  };

  const handleLeaveDecision = (leaveId: string, approved: boolean) => {
    const remarks = approved
      ? 'Approved by Proctor: institutional attendance credited towards 85% requirement.'
      : 'Rejected by Proctor: inadequate documentation provided.';

    const auditLog: AuditLog = {
      id: `audit-proctor-leave-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: currentProctor.id,
      userName: currentProctor.name,
      action: 'APPROVE_LEAVE',
      details: `Proctor ${currentProctor.name} ${approved ? 'APPROVED' : 'REJECTED'} leave request ${leaveId}. Remarks: ${remarks}`
    };

    onApproveLeave(leaveId, approved, remarks, auditLog);
    setActionSuccessNotice(`Leave request ${approved ? 'approved' : 'rejected'}.`);
    setTimeout(() => setActionSuccessNotice(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Proctor Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Proctor & Mentorship Module
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Mentor: <strong className="text-slate-800 dark:text-slate-200">{currentProctor.name}</strong> · Designated Slot: <strong className="text-slate-800 dark:text-slate-200">Tuesday Period 8 (15:50 - 16:40)</strong>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold">
              {menteeStats.filter(m => m.isDefaulter).length} Shortage (&lt;85%)
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold">
              {menteeStats.filter(m => m.isWarning).length} At-Risk (85-89%)
            </div>
          </div>
        </div>

        {/* Mentee Quick Cards */}
        <div className="pt-4">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Assigned Mentees (MBA 3rd Semester) — Minimum Requirement: 85%
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
            {menteeStats.map(({ student, percentage, isDefaulter, isWarning }) => {
              const isSelected = selectedStudentId === student.id;
              return (
                <button
                  key={student.id}
                  onClick={() => setSelectedStudentId(student.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'border-slate-900 dark:border-white bg-slate-900 text-white shadow-md'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 text-slate-900 dark:text-white hover:border-slate-300'
                  }`}
                >
                  <div className="text-xs font-bold truncate">{student.name}</div>
                  <div className={`text-[10px] font-mono ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                    {student.usn}
                  </div>
                  <div className={`text-sm font-black font-mono mt-1 ${
                    isSelected
                      ? 'text-white'
                      : isDefaulter
                      ? 'text-rose-600'
                      : isWarning
                      ? 'text-amber-500'
                      : 'text-emerald-600'
                  }`}>
                    {percentage}%
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {actionSuccessNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccessNotice}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Mentee Counseling & Parent Intervention Form */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Mentoring & Parent Communication Log: {selectedMentee?.name}
            </h2>
            <p className="text-xs text-slate-500">
              USN: {selectedMentee?.usn} · Phone: {selectedMentee?.phone || 'N/A'} · Sec {selectedMentee?.section}
            </p>
          </div>

          <form onSubmit={handleAddNote} className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Interaction Category
              </label>
              <select
                value={noteCategory}
                onChange={e => setNoteCategory(e.target.value as any)}
                className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              >
                <option value="attendance_warning">Attendance Shortage Warning (&lt;85%)</option>
                <option value="parent_call">Parent Telephonic Counseling</option>
                <option value="academic">Academic & Career Mentorship Discussion</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Mentoring Notes & Counseling Summary
              </label>
              <textarea
                rows={3}
                value={newNoteText}
                onChange={e => setNewNoteText(e.target.value)}
                placeholder="e.g. Counseled regarding repeated morning absences. Parent notified regarding 85% requirement."
                className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                required
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="parentCheck"
                checked={parentContactedCheck}
                onChange={e => setParentContactedCheck(e.target.checked)}
                className="rounded text-slate-900"
              />
              <label htmlFor="parentCheck" className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                Parent/Guardian informed regarding 85% threshold status
              </label>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:bg-slate-800"
              >
                Save Proctor Note
              </button>

              <button
                type="button"
                onClick={() => {
                  setParentAlertPreview(
                    `[BITM MBA Automated Parent Alert]\nDear Parent,\nThis is to notify that your ward ${selectedMentee?.name} (${selectedMentee?.usn}) has attendance below the mandatory 85% threshold in MBA 3rd Sem.\nPlease contact Proctor ${currentProctor.name}.`
                  );
                }}
                className="px-3 py-2 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-medium flex items-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Preview Parent SMS/WhatsApp</span>
              </button>
            </div>
          </form>

          {/* In-App Parent Alert Preview Banner (Replaces window.alert) */}
          {parentAlertPreview && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-2">
              <div className="font-bold text-emerald-900 flex items-center justify-between">
                <span>Dispatched Parent SMS Notification Preview</span>
                <button
                  onClick={() => setParentAlertPreview(null)}
                  className="text-emerald-700 font-semibold"
                >
                  ✕
                </button>
              </div>
              <pre className="font-sans text-emerald-800 whitespace-pre-wrap bg-white p-2.5 rounded-lg border border-emerald-100">
                {parentAlertPreview}
              </pre>
            </div>
          )}

          {/* Past Notes for this Mentee */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Past Mentoring History
            </div>
            <div className="space-y-2">
              {proctorNotes
                .filter(n => n.studentId === selectedMentee?.id)
                .map(note => (
                  <div
                    key={note.id}
                    className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs"
                  >
                    <div className="flex items-center justify-between text-slate-500 mb-1">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[10px]">
                        {note.category.replace('_', ' ')}
                      </span>
                      <span className="font-mono text-[10px]">{note.date}</span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300">{note.note}</p>
                    {note.parentContacted && (
                      <span className="text-[10px] text-emerald-600 font-semibold mt-1 inline-block">
                        ✓ Parent Contacted
                      </span>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Right: Leave & On-Duty (OD) Approval Queue */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Student Leave & On-Duty (OD) Exemption Queue
            </h2>
            <p className="text-xs text-slate-500">
              Approving an OD request automatically credits attendance for all affected periods.
            </p>
          </div>

          <div className="space-y-3">
            {leaveRequests.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                No leave requests pending.
              </div>
            ) : (
              leaveRequests.map(leave => (
                <div
                  key={leave.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white text-sm">
                        {leave.studentName}
                      </span>
                      <span className="text-slate-400 ml-2 font-mono">{leave.usn}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      leave.status === 'approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : leave.status === 'rejected'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {leave.status}
                    </span>
                  </div>

                  <div className="text-slate-600 dark:text-slate-300">
                    <strong>Type:</strong> {leave.type.toUpperCase()} · <strong>Date:</strong> {leave.startDate}
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 italic">
                    "{leave.reason}"
                  </p>

                  {leave.attachmentName && (
                    <div className="text-[11px] text-blue-600 flex items-center gap-1 font-mono">
                      <FileText className="w-3.5 h-3.5" />
                      <span>{leave.attachmentName}</span>
                    </div>
                  )}

                  {leave.status === 'pending' && (
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                      <button
                        onClick={() => handleLeaveDecision(leave.id, true)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 text-xs"
                      >
                        Approve & Credit Attendance
                      </button>
                      <button
                        onClick={() => handleLeaveDecision(leave.id, false)}
                        className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 font-semibold hover:bg-rose-100 text-xs"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
