import React, { useState } from 'react';
import {
  BarChart3,
  Download,
  FileSpreadsheet,
  FileText,
  RotateCcw,
  Sparkles,
  Database,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import {
  CampusSubject,
  CampusAttendanceRecord,
  AcademicSettings
} from '../../types/campusPulse';

interface ReportsAnalyticsViewProps {
  subjects: CampusSubject[];
  records: CampusAttendanceRecord[];
  academicSettings: AcademicSettings;
  onResetToZero: () => void;
  onLoadScreenshotDemoData: () => void;
}

export const ReportsAnalyticsView: React.FC<ReportsAnalyticsViewProps> = ({
  subjects,
  records,
  academicSettings,
  onResetToZero,
  onLoadScreenshotDemoData
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'substitute' | 'lab' | 'backup'>('overview');

  const validRecords = records.filter(r => r.status !== 'cancelled' && r.status !== 'holiday');
  const totalConducted = validRecords.length;
  const totalPresent = validRecords.filter(r => r.status === 'present').length;
  const totalAbsent = validRecords.filter(r => r.status === 'absent').length;

  const overallPercentage =
    totalConducted > 0 ? Math.round((totalPresent / totalConducted) * 1000) / 10 : 0;

  const vtuMin = academicSettings.minimumTargetPercent || 85;
  const safeCushion = academicSettings.safeThresholdPercent || 90;

  // Breakdown rows
  const breakdownRows = subjects.map(sub => {
    const subRecords = validRecords.filter(r => r.subjectCode === sub.code);
    const conducted = subRecords.length;
    const present = subRecords.filter(r => r.status === 'present').length;
    const absent = subRecords.filter(r => r.status === 'absent').length;
    const pct = conducted > 0 ? Math.round((present / conducted) * 1000) / 10 : 0;

    let safeBunksFor85 = 0;
    if (conducted > 0 && pct >= vtuMin) {
      safeBunksFor85 = Math.max(0, Math.floor(present / (vtuMin / 100) - conducted));
    }

    let neededFor85 = 0;
    if (conducted > 0 && pct < vtuMin) {
      neededFor85 = Math.max(0, Math.ceil(((vtuMin / 100) * conducted - present) / (1 - (vtuMin / 100))));
    }

    let neededFor90 = 0;
    if (conducted > 0 && pct < safeCushion) {
      neededFor90 = Math.max(0, Math.ceil(((safeCushion / 100) * conducted - present) / (1 - (safeCushion / 100))));
    }

    const isDefaulter = conducted > 0 && pct < vtuMin;
    const isThinMargin = conducted > 0 && pct >= vtuMin && pct < safeCushion;
    const isSafeCushion = conducted === 0 || pct >= safeCushion;

    return {
      ...sub,
      conducted,
      present,
      absent,
      percentage: pct,
      safeBunksFor85,
      neededFor85,
      neededFor90,
      isDefaulter,
      isThinMargin,
      isSafeCushion,
      vtuStatusLabel: conducted === 0 ? 'CLEAN (0%)' : isDefaulter ? 'SHORTAGE (<85%)' : 'ELIGIBLE (≥85%)',
      cushionLabel: conducted === 0 ? 'TARGET 90%' : isSafeCushion ? 'SAFE (≥90%)' : 'THIN MARGIN'
    };
  });

  const handleDownloadCSV = () => {
    let csv = `Subject Code,Subject Name,Conducted,Present,Absent,Percentage,VTU 85% Status,90% Cushion,Safe Bunks\n`;
    breakdownRows.forEach(r => {
      csv += `"${r.code}","${r.name}",${r.conducted},${r.present},${r.absent},${r.percentage}%,${r.vtuStatusLabel},${r.cushionLabel},${r.safeBunksFor85}\n`;
    });
    csv += `TOTAL,"All Subjects",${totalConducted},${totalPresent},${totalAbsent},${overallPercentage}%,${overallPercentage >= 85 ? 'ELIGIBLE' : 'SHORTAGE'},-,-\n`;

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CampusPulse_Attendance_${academicSettings.department.replace(/\s+/g, '_')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* 1. HEADER WITH EXPORT BUTTONS (Screenshot 5 & 6) */}
      <div className="bg-[#10141d] border border-[#1e2637] rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-sky-400" />
            <h1 className="text-xl font-extrabold text-white">
              Attendance Reports & Official Exports
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Generate printable PDF reports, CSV audit sheets, substitute logs, and cloud-ready backups
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          <button
            onClick={handlePrintPDF}
            className="px-4 py-2.5 rounded-xl bg-white text-slate-950 font-black text-xs hover:bg-slate-200 transition-colors flex items-center gap-1.5 shadow-md"
          >
            <FileText className="w-4 h-4" />
            <span>Download PDF Report</span>
          </button>

          <button
            onClick={handleDownloadCSV}
            className="px-4 py-2.5 rounded-xl bg-[#182131] border border-[#2a3852] text-white hover:bg-[#202c42] font-black text-xs transition-colors flex items-center gap-1.5 shadow-md"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 2. SUB-TABS (Screenshot 5 & 6) */}
      <div className="flex items-center gap-1.5 p-1 bg-[#10141d] border border-[#1e2637] rounded-2xl overflow-x-auto text-xs font-bold">
        <button
          onClick={() => setActiveSubTab('overview')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
            activeSubTab === 'overview'
              ? 'bg-[#00a8ff] text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Attendance Overview</span>
        </button>

        <button
          onClick={() => setActiveSubTab('substitute')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
            activeSubTab === 'substitute'
              ? 'bg-[#00a8ff] text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Substitute Class Log (16)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('lab')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
            activeSubTab === 'lab'
              ? 'bg-[#00a8ff] text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Lab Attendance Log (20)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('backup')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
            activeSubTab === 'backup'
              ? 'bg-[#00a8ff] text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Backup & Restore</span>
        </button>
      </div>

      {/* 3. OFFICIAL CONSOLIDATED STANDING CARD (Screenshot 5 & 6) */}
      {activeSubTab === 'overview' && (
        <>
          <div className="bg-[#10141d] border border-[#1e2637] rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                OFFICIAL CONSOLIDATED STANDING
              </div>
              <div className="text-4xl sm:text-5xl font-black font-mono text-white mt-2">
                {overallPercentage}%
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {academicSettings.department} • {academicSettings.semesterSection}
              </p>
            </div>

            <div className="flex items-center gap-4 text-center font-mono shrink-0">
              <div className="bg-[#151c28] border border-[#232f46] p-4 rounded-2xl min-w-[90px]">
                <div className="text-[10px] text-slate-400 font-bold uppercase">CONDUCTED</div>
                <div className="text-2xl font-black text-white mt-1">{totalConducted}</div>
              </div>

              <div className="bg-[#12221b] border border-emerald-900/60 p-4 rounded-2xl min-w-[90px]">
                <div className="text-[10px] text-emerald-400 font-bold uppercase">PRESENT</div>
                <div className="text-2xl font-black text-emerald-400 mt-1">{totalPresent}</div>
              </div>

              <div className="bg-[#241217] border border-rose-900/60 p-4 rounded-2xl min-w-[90px]">
                <div className="text-[10px] text-rose-400 font-bold uppercase">ABSENT</div>
                <div className="text-2xl font-black text-rose-400 mt-1">{totalAbsent}</div>
              </div>
            </div>
          </div>

          {/* 4. SUBJECT-WISE BREAKDOWN TABLE (Screenshot 5 & 6) */}
          <div className="bg-[#10141d] border border-[#1e2637] rounded-3xl p-6 shadow-xl space-y-4">
            <h2 className="text-base font-extrabold text-white">
              Subject-wise Breakdown
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-[#1f2738] text-[10px] uppercase font-bold text-slate-400">
                    <th className="py-3 px-3">SUBJECT</th>
                    <th className="py-3 px-3">CONDUCTED</th>
                    <th className="py-3 px-3">PRESENT</th>
                    <th className="py-3 px-3">ABSENT</th>
                    <th className="py-3 px-3">PERCENTAGE</th>
                    <th className="py-3 px-3">VTU 85% RULE</th>
                    <th className="py-3 px-3">90% CUSHION</th>
                    <th className="py-3 px-3">SAFE BUNKS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#171e2c]">
                  {breakdownRows.map(row => (
                    <tr key={row.code} className="hover:bg-[#141a26]/60 transition-colors">
                      <td className="py-3.5 px-3">
                        <div className="font-black text-white">{row.code}</div>
                        <div className="text-[11px] text-slate-400">{row.name}</div>
                      </td>
                      <td className="py-3.5 px-3 font-mono font-bold text-slate-200">
                        {row.conducted}
                      </td>
                      <td className="py-3.5 px-3 font-mono font-bold text-emerald-400">
                        {row.present}
                      </td>
                      <td className="py-3.5 px-3 font-mono font-bold text-rose-400">
                        {row.absent}
                      </td>
                      <td className="py-3.5 px-3 font-mono font-black text-white">
                        {row.percentage}%
                      </td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            row.isDefaulter
                              ? 'bg-rose-950 text-rose-300 border border-rose-800'
                              : row.conducted > 0
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {row.vtuStatusLabel}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            row.isSafeCushion
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : 'bg-amber-950 text-amber-300 border border-amber-800'
                          }`}
                        >
                          {row.cushionLabel}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-mono font-bold text-emerald-400">
                        {row.safeBunksFor85} bunks
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* BACKUP & RESTORE TAB: Zero State & Screenshot Data Controls */}
      {activeSubTab === 'backup' && (
        <div className="bg-[#10141d] border border-[#1e2637] rounded-3xl p-6 shadow-xl space-y-6">
          <div>
            <h2 className="text-base font-extrabold text-white">
              Data Management & Presets
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Switch between a fresh zero-attendance state or load the exact sample dataset from your screenshot (87%).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-[#141924] border border-[#21293c] space-y-3">
              <div className="text-sm font-black text-white">Reset All Attendance to Zero (0%)</div>
              <p className="text-xs text-slate-400">
                Wipes all recorded attendance across all subjects back to 0 conducted, 0 present (clean slate).
              </p>
              <button
                onClick={onResetToZero}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-2 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset to Zero</span>
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-[#141924] border border-[#21293c] space-y-3">
              <div className="text-sm font-black text-white">Load Screenshot Demo Data (87%)</div>
              <p className="text-xs text-slate-400">
                Instantly loads the exact 192 conducted, 167 present, 25 absent data shown in your screenshot.
              </p>
              <button
                onClick={onLoadScreenshotDemoData}
                className="px-4 py-2.5 rounded-xl bg-[#00a8ff] hover:bg-sky-500 text-slate-950 font-black text-xs flex items-center gap-2 transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                <span>Load 87% Demo Data</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'substitute' && (
        <div className="bg-[#10141d] border border-[#1e2637] rounded-3xl p-6 shadow-xl text-center text-xs text-slate-400 space-y-2">
          <RotateCcw className="w-8 h-8 text-sky-400 mx-auto" />
          <h3 className="font-extrabold text-white text-sm">Substitute Class Audit Log</h3>
          <p>No faculty substitutions logged for this week.</p>
        </div>
      )}

      {activeSubTab === 'lab' && (
        <div className="bg-[#10141d] border border-[#1e2637] rounded-3xl p-6 shadow-xl text-center text-xs text-slate-400 space-y-2">
          <Sparkles className="w-8 h-8 text-purple-400 mx-auto" />
          <h3 className="font-extrabold text-white text-sm">Lab Attendance Audit Log</h3>
          <p>Machine Learning Lab & Computer Networks Lab sessions in good standing.</p>
        </div>
      )}
    </div>
  );
};
