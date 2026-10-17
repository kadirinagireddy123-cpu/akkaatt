import React, { useState, useMemo } from 'react';
import {
  User,
  Subject,
  AttendanceRecord,
  SaturdayOverride,
  AuditLog
} from '../../types';
import { calculateSubjectAttendance, MANDATORY_MINIMUM_PERCENTAGE } from '../../utils/vtuCalculator';
import {
  BarChart3,
  Users,
  Download,
  AlertOctagon,
  Calendar,
  CheckCircle,
  FileSpreadsheet,
  History,
  ShieldCheck,
  Plus
} from 'lucide-react';

interface AdminConsoleViewProps {
  currentAdmin: User;
  students: User[];
  facultyMembers: User[];
  subjects: Subject[];
  attendanceRecords: AttendanceRecord[];
  saturdayOverrides: SaturdayOverride[];
  auditLogs: AuditLog[];
  onAddSaturdayOverride: (override: SaturdayOverride) => void;
}

export const AdminConsoleView: React.FC<AdminConsoleViewProps> = ({
  currentAdmin,
  students,
  facultyMembers,
  subjects,
  attendanceRecords,
  saturdayOverrides,
  auditLogs,
  onAddSaturdayOverride
}) => {
  const [activeTab, setActiveTab] = useState<'defaulters' | 'conduction' | 'saturday' | 'audit'>('defaulters');
  const [thresholdPercent, setThresholdPercent] = useState<number>(MANDATORY_MINIMUM_PERCENTAGE); // Default to 85%
  const [filterSection, setFilterSection] = useState<'All' | 'A' | 'B'>('All');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // New Saturday swap modal state
  const [newSwapDate, setNewSwapDate] = useState<string>('2027-03-27');
  const [newSwapMappedDay, setNewSwapMappedDay] = useState<'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri'>('Wed');

  // Compute Defaulter List based on configured threshold (default 85%)
  const defaulterList = useMemo(() => {
    const list: Array<{
      student: User;
      overallPercentage: number;
      defaultingSubjects: Array<{ code: string; name: string; percentage: number; attended: number; conducted: number }>;
    }> = [];

    students.forEach(student => {
      if (filterSection !== 'All' && student.section !== filterSection) return;

      let totalConducted = 0;
      let totalAttended = 0;
      const failingSubjects: Array<{ code: string; name: string; percentage: number; attended: number; conducted: number }> = [];

      subjects.forEach(sub => {
        const metric = calculateSubjectAttendance(sub.code, attendanceRecords, student.id);
        if (metric.totalConducted > 0) {
          totalConducted += metric.totalConducted;
          totalAttended += metric.attended + metric.onDuty;

          if (metric.percentage < thresholdPercent) {
            failingSubjects.push({
              code: sub.code,
              name: sub.name,
              percentage: metric.percentage,
              attended: metric.attended + metric.onDuty,
              conducted: metric.totalConducted
            });
          }
        }
      });

      const overall = totalConducted > 0 ? (totalAttended / totalConducted) * 100 : 100;
      const rounded = Math.round(overall * 10) / 10;

      if (failingSubjects.length > 0 || rounded < thresholdPercent) {
        list.push({
          student,
          overallPercentage: rounded,
          defaultingSubjects: failingSubjects
        });
      }
    });

    return list;
  }, [students, subjects, attendanceRecords, thresholdPercent, filterSection]);

  const handleExportDefaultersCSV = () => {
    const headers = ['USN', 'Student Name', 'Section', 'Primary Specialization', 'Dual Specialization', 'Overall Attendance %', 'Defaulter Subjects', 'Parent Phone'];
    const rows = defaulterList.map(item => [
      item.student.usn,
      item.student.name,
      item.student.section,
      item.student.primarySpec,
      item.student.dualSpec,
      `${item.overallPercentage}%`,
      item.defaultingSubjects.map(s => `${s.code}(${s.percentage}%)`).join('; '),
      item.student.phone || ''
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `BITM_MBA_Defaulter_List_${thresholdPercent}pct_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleAddOverride = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSwapDate) return;
    onAddSaturdayOverride({
      date: newSwapDate,
      mappedDay: newSwapMappedDay,
      description: `${newSwapMappedDay} Timetable mapped for extra working Saturday (${newSwapDate})`
    });
    setActionNotice(`Saturday swap added: ${newSwapDate} mapped to ${newSwapMappedDay} timetable.`);
    setTimeout(() => setActionNotice(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                Admin & HOD Department Console
              </h1>
              <span className="text-xs font-mono bg-purple-50 text-purple-700 px-2 py-0.5 rounded font-semibold">
                Min Requirement: 85%
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Head of Department: <strong className="text-slate-800 dark:text-slate-200">{currentAdmin.name}</strong> · MBA Department, BITM Ballari
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportDefaultersCSV}
              className="px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold hover:bg-slate-800 transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export Defaulter Report (CSV)</span>
            </button>
          </div>
        </div>

        {/* Console Sub-Tabs */}
        <div className="pt-4 flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setActiveTab('defaulters')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'defaulters'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 hover:text-slate-900'
            }`}
          >
            <AlertOctagon className="w-3.5 h-3.5 text-rose-500" />
            <span>Defaulters List ({defaulterList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('conduction')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'conduction'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Faculty Conduction Rates</span>
          </button>

          <button
            onClick={() => setActiveTab('saturday')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'saturday'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Saturday Swaps & Overrides</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'audit'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Audit Trail ({auditLogs.length})</span>
          </button>
        </div>
      </div>

      {actionNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* TAB 1: DEFAULTERS LIST */}
      {activeTab === 'defaulters' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Official Attendance Defaulter Roster (Threshold: {thresholdPercent}%)
              </h2>
              <p className="text-xs text-slate-500">
                Institutional regulation requires at least <strong>{thresholdPercent}% attendance</strong>. Students below cutoff are flagged for departmental counseling.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-500 font-semibold">Cutoff:</span>
                <select
                  value={thresholdPercent}
                  onChange={e => setThresholdPercent(parseInt(e.target.value))}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-xs font-bold"
                >
                  <option value={85}>85% (Mandatory Minimum)</option>
                  <option value={75}>75% (VTU Statutory Floor)</option>
                  <option value={90}>90% (Strict Monitoring)</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-500 font-semibold">Section:</span>
                <select
                  value={filterSection}
                  onChange={e => setFilterSection(e.target.value as any)}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-xs font-bold"
                >
                  <option value="All">All (A & B)</option>
                  <option value="A">Section A</option>
                  <option value="B">Section B</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 font-semibold">
                  <th className="py-2.5 px-3">USN / Student</th>
                  <th className="py-2.5 px-3">Section & Electives</th>
                  <th className="py-2.5 px-3">Overall %</th>
                  <th className="py-2.5 px-3">Shortage Subjects</th>
                  <th className="py-2.5 px-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {defaulterList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-xs text-slate-500">
                      No defaulters found below {thresholdPercent}% in Section {filterSection}.
                    </td>
                  </tr>
                ) : (
                  defaulterList.map(({ student, overallPercentage, defaultingSubjects }) => (
                    <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-3 px-3 font-medium">
                        <div className="text-slate-900 dark:text-white font-bold">{student.name}</div>
                        <div className="font-mono text-[10px] text-slate-500">{student.usn}</div>
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                        <div>Sec {student.section}</div>
                        <div className="text-[10px] text-slate-500">{student.primarySpec} + {student.dualSpec}</div>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold">
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          overallPercentage < 85 ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {overallPercentage}%
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex flex-wrap gap-1">
                          {defaultingSubjects.map(sub => (
                            <span
                              key={sub.code}
                              className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[10px] text-rose-600 font-semibold"
                            >
                              {sub.code}: {sub.percentage}% ({sub.attended}/{sub.conducted})
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <button
                          onClick={() => {
                            setActionNotice(`Official Defaulter Notice logged for ${student.name} (${student.usn}). Alert dispatched to parent ${student.phone || ''}.`);
                            setTimeout(() => setActionNotice(null), 3500);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-[11px] font-semibold"
                        >
                          Send Notice
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: FACULTY CONDUCTION RATES */}
      {activeTab === 'conduction' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Faculty Syllabus Conduction Monitoring
            </h2>
            <p className="text-xs text-slate-500">
              Department tracking of lectures delivered against required syllabus milestones.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {facultyMembers.map(faculty => {
              const facultySubjects = subjects.filter(s => s.facultyId === faculty.id);

              return (
                <div
                  key={faculty.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white text-sm">
                        {faculty.name}
                      </div>
                      <div className="text-slate-500 text-[11px]">{faculty.designation}</div>
                    </div>
                    <span className="font-mono text-xs font-bold text-blue-600">
                      {facultySubjects.length} Assigned Course(s)
                    </span>
                  </div>

                  <div className="mt-3 space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-700">
                    {facultySubjects.map(sub => (
                      <div key={sub.code} className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-700 dark:text-slate-300 font-medium">
                          {sub.code} — {sub.name}
                        </span>
                        <span className="font-mono bg-slate-200 dark:bg-slate-700 px-1.5 py-0.2 rounded text-[10px]">
                          Room {sub.classroom}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: SATURDAY SWAPS & OVERRIDES MANAGER */}
      {activeTab === 'saturday' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-5">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Schedule Overrides & Saturday Extra Working Days
            </h2>
            <p className="text-xs text-slate-500">
              Map additional compensatory working Saturdays to weekday routines in accordance with VTU academic calendar.
            </p>
          </div>

          <form onSubmit={handleAddOverride} className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-end gap-3 text-xs">
            <div className="w-full sm:w-auto">
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Saturday Date:
              </label>
              <input
                type="date"
                value={newSwapDate}
                onChange={e => setNewSwapDate(e.target.value)}
                className="p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                required
              />
            </div>

            <div className="w-full sm:w-auto">
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Map to Weekday Routine:
              </label>
              <select
                value={newSwapMappedDay}
                onChange={e => setNewSwapMappedDay(e.target.value as any)}
                className="p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              >
                <option value="Mon">Monday Timetable</option>
                <option value="Tue">Tuesday Timetable</option>
                <option value="Wed">Wednesday Timetable</option>
                <option value="Thu">Thursday Timetable</option>
                <option value="Fri">Friday Timetable</option>
              </select>
            </div>

            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold hover:bg-slate-800 flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Saturday Swap</span>
            </button>
          </form>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {saturdayOverrides.map(ov => (
              <div key={ov.date} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                <div className="font-mono text-slate-500 text-[11px]">{ov.date}</div>
                <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                  {ov.mappedDay} Timetable
                </div>
                <div className="text-[10px] text-slate-400 mt-1 truncate">{ov.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT TRAIL */}
      {activeTab === 'audit' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Immutable Department Audit Trail
            </h2>
            <p className="text-xs text-slate-500">
              Verified history of attendance creation, updates, leave grants, and roster modifications.
            </p>
          </div>

          <div className="space-y-2">
            {auditLogs.map(log => (
              <div
                key={log.id}
                className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {log.action}
                    </span>
                    <span className="text-slate-400">·</span>
                    <span className="text-slate-600 dark:text-slate-300 font-medium">
                      {log.userName}
                    </span>
                  </div>
                  <p className="text-slate-500 mt-0.5">{log.details}</p>
                </div>

                <div className="font-mono text-[10px] text-slate-400 shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
