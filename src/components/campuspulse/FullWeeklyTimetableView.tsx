import React, { useState } from 'react';
import {
  CalendarDays,
  Clock,
  MapPin,
  User,
  CheckCircle,
  AlertCircle,
  FileText,
  Calendar,
  Sparkles,
  Info
} from 'lucide-react';
import {
  OFFICIAL_TIMETABLE_GRID,
  TIMETABLE_PERIOD_HEADERS,
  CAMPUS_SUBJECTS,
  SATURDAY_SCHEDULE_MAPPINGS,
  TimetableCell
} from '../../data/campusPulseData';
import { AcademicSettings } from '../../types/campusPulse';

interface FullWeeklyTimetableViewProps {
  academicSettings: AcademicSettings;
  onNavigateToToday: () => void;
}

export const FullWeeklyTimetableView: React.FC<FullWeeklyTimetableViewProps> = ({
  academicSettings,
  onNavigateToToday
}) => {
  const [selectedCell, setSelectedCell] = useState<{
    day: string;
    cell: TimetableCell;
  } | null>(null);

  return (
    <div className="space-y-6">
      {/* 1. TOP HEADER & NOTICE */}
      <div className="bg-[#10141d] border border-[#1e2637] rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-sky-400" />
            <h1 className="text-xl font-extrabold text-white">
              Official Master Timetable (Section "B")
            </h1>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
              W.E.F 16-09-2026
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Exact physical timetable replica for Ballari Institute of Technology & Management (BITM) MBA 3rd Sem.
          </p>
        </div>

        <button
          onClick={onNavigateToToday}
          className="px-4 py-2.5 rounded-2xl bg-white text-slate-950 hover:bg-slate-200 font-extrabold text-xs flex items-center gap-2 shadow-lg self-start md:self-auto transition-colors"
        >
          <Calendar className="w-4 h-4" />
          <span>Mark Today's Classes</span>
        </button>
      </div>

      {/* 2. TIMETABLE EXCLUSION GUARANTEE BANNER */}
      <div className="bg-[#101929] border border-cyan-500/30 rounded-2xl p-4 flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
          <Info className="w-4 h-4" />
        </div>
        <div className="text-xs space-y-1">
          <div className="font-extrabold text-cyan-200 flex items-center gap-2">
            <span>Official Timetable Rule Strictly Enforced</span>
            <span className="text-[10px] bg-cyan-950 px-2 py-0.5 rounded font-mono text-cyan-300">
              Zero Phantom Slots
            </span>
          </div>
          <p className="text-slate-300 leading-relaxed">
            As requested: <strong>if there is no class mentioned in the timetable, it is completely excluded from the app</strong>.
            Blank periods (such as Mon P4, Tue P6, Wed P1 & P6, Thu morning, and unscheduled subjects) are never marked or counted towards attendance.
          </p>
        </div>
      </div>

      {/* 3. REPLICA OF BITM OFFICIAL TIMETABLE DOCUMENT */}
      <div className="bg-[#0b0e14] border border-[#222b3d] rounded-3xl p-4 sm:p-6 shadow-2xl overflow-hidden">
        {/* Document Header */}
        <div className="text-center pb-5 border-b border-[#1b2333] space-y-1">
          <div className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">
            Basavarajeswari Group of Institutions
          </div>
          <h2 className="text-base sm:text-lg lg:text-xl font-black text-white tracking-tight uppercase">
            BALLARI INSTITUTE OF TECHNOLOGY & MANAGEMENT, Ballari
          </h2>
          <div className="text-xs text-slate-400 flex items-center justify-center gap-2 flex-wrap">
            <span>(An Autonomous Institute under VTU, Belagavi)</span>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-black">
              NAAC A+
            </span>
            <span className="px-2 py-0.5 rounded-full bg-rose-950/80 text-rose-300 border border-rose-800 text-[10px] font-bold">
              VTU 85% Min
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800 text-[10px] font-bold">
              90% Safe Cushion
            </span>
          </div>
          <div className="text-xs font-bold text-sky-300 pt-1">
            TIME TABLE FOR THE YEAR 2026-2027 (ODD SEMESTER) • 3rd Sem • W.E.F: 16-09-2026
          </div>
          <div className="text-xs text-slate-300 flex items-center justify-center gap-3 flex-wrap pt-0.5">
            <span><strong>BRANCH:</strong> MBA</span>
            <span>•</span>
            <span><strong>SEM:</strong> 3rd</span>
            <span>•</span>
            <span><strong>Section:</strong> "B"</span>
          </div>
          <div className="text-[11px] text-slate-400 pt-0.5">
            <strong>CLASS ROOM:</strong> (SH2 Civil Floor - Finance/HR/Marketing → Sec A), (SH3 Civil Floor - Finance/HR/BA → Sec B), (LH4 Civil Floor → Logistics & Supply Chain), DS → T2 MBA Block
          </div>
        </div>

        {/* Master Timetable Grid */}
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[950px] border-collapse text-xs">
            <thead>
              <tr className="bg-[#121722] text-slate-300 border-b border-[#222b3d]">
                <th className="p-3 text-left font-black border-r border-[#222b3d] w-20">
                  Days / Time
                </th>
                <th className="p-2.5 text-center font-bold border-r border-[#222b3d] w-28">
                  <div>9:00 am to 9:50am</div>
                  <div className="text-[10px] text-slate-500 font-mono">P1</div>
                </th>
                <th className="p-2.5 text-center font-bold border-r border-[#222b3d] w-28">
                  <div>9:50 am to 10:40 am</div>
                  <div className="text-[10px] text-slate-500 font-mono">P2</div>
                </th>
                <th className="p-1.5 text-center font-black bg-[#161d2b] border-r border-[#222b3d] text-[10px] text-slate-400 w-12 writing-mode-vertical">
                  Break 5m
                </th>
                <th className="p-2.5 text-center font-bold border-r border-[#222b3d] w-28">
                  <div>10:45 to 11:35 am</div>
                  <div className="text-[10px] text-slate-500 font-mono">P3</div>
                </th>
                <th className="p-2.5 text-center font-bold border-r border-[#222b3d] w-28">
                  <div>11:35 am to 12:25</div>
                  <div className="text-[10px] text-slate-500 font-mono">P4</div>
                </th>
                <th className="p-1.5 text-center font-black bg-[#161d2b] border-r border-[#222b3d] text-[10px] text-amber-400 w-14">
                  Lunch Break<br/><span className="text-[9px] text-slate-500 font-mono">12:25–1:15</span>
                </th>
                <th className="p-2.5 text-center font-bold border-r border-[#222b3d] w-28">
                  <div>1:15pm to 2:05pm</div>
                  <div className="text-[10px] text-slate-500 font-mono">P5</div>
                </th>
                <th className="p-2.5 text-center font-bold border-r border-[#222b3d] w-28">
                  <div>2:05pm to 2:55pm</div>
                  <div className="text-[10px] text-slate-500 font-mono">P6</div>
                </th>
                <th className="p-1.5 text-center font-black bg-[#161d2b] border-r border-[#222b3d] text-[10px] text-slate-400 w-12">
                  Break 5m
                </th>
                <th className="p-2.5 text-center font-bold border-r border-[#222b3d] w-28">
                  <div>3:00pm to 3:50pm</div>
                  <div className="text-[10px] text-slate-500 font-mono">P7</div>
                </th>
                <th className="p-2.5 text-center font-bold w-28">
                  <div>3:50pm to 4:40 pm</div>
                  <div className="text-[10px] text-slate-500 font-mono">P8</div>
                </th>
              </tr>
            </thead>
            <tbody>
              {OFFICIAL_TIMETABLE_GRID.map((row) => {
                const p1 = row.cells[0];
                const p2 = row.cells[1];
                const p3 = row.cells[2];
                const p4 = row.cells[3];
                const p5 = row.cells[4];
                const p6 = row.cells[5];
                const p7 = row.cells[6];
                const p8 = row.cells[7];

                const renderCell = (cell: TimetableCell | null, periodLabel: string) => {
                  if (!cell) {
                    return (
                      <td className="p-2 text-center border-r border-[#1a2130] bg-[#0c0f16]/60">
                        <span className="text-[10px] font-mono text-slate-600 block italic">
                          — No Class —
                        </span>
                        <span className="text-[9px] text-slate-700 block">
                          (Blank in Timetable)
                        </span>
                      </td>
                    );
                  }

                  const isLS = cell.code?.startsWith('LS');
                  const isFM = cell.code?.startsWith('FM');
                  const isProctor = cell.code === 'Proctoring';
                  const isClub = cell.code === 'Club Activity';

                  const badgeClass = isLS
                    ? 'bg-blue-950/70 border-blue-700 text-blue-200'
                    : isFM
                    ? 'bg-emerald-950/70 border-emerald-700 text-emerald-200'
                    : isProctor
                    ? 'bg-purple-950/70 border-purple-700 text-purple-200'
                    : 'bg-amber-950/70 border-amber-700 text-amber-200';

                  return (
                    <td
                      onClick={() => setSelectedCell({ day: row.label, cell })}
                      className="p-2 text-center border-r border-[#1a2130] hover:bg-[#151c2a] cursor-pointer transition-colors"
                    >
                      <div className={`p-2 rounded-xl border ${badgeClass} shadow-sm space-y-0.5`}>
                        <div className="font-black text-xs tracking-wide">
                          {cell.code}
                        </div>
                        <div className="text-[10px] text-slate-300 font-medium truncate max-w-[110px] mx-auto" title={cell.name || ''}>
                          {cell.name}
                        </div>
                        <div className="text-[9px] text-slate-400 truncate max-w-[110px] mx-auto">
                          {cell.faculty?.split(' ')[0]} {cell.faculty?.split(' ')[1] || ''}
                        </div>
                      </div>
                    </td>
                  );
                };

                return (
                  <tr key={row.day} className="border-b border-[#1b2333] hover:bg-[#10141e]/50">
                    <td className="p-3 font-black text-white bg-[#111622] border-r border-[#222b3d]">
                      {row.label}
                    </td>
                    {renderCell(p1, 'P1')}
                    {renderCell(p2, 'P2')}
                    {/* 5 min break column */}
                    <td className="p-1 text-center bg-[#0d121c] border-r border-[#1a2130] text-[9px] text-slate-500 font-mono">
                      Break
                    </td>
                    {renderCell(p3, 'P3')}
                    {renderCell(p4, 'P4')}
                    {/* Lunch break column */}
                    <td className="p-1 text-center bg-[#0d121c] border-r border-[#1a2130] text-[9px] text-slate-500 font-mono">
                      Lunch
                    </td>
                    {renderCell(p5, 'P5')}
                    {renderCell(p6, 'P6')}
                    {/* 5 min break column */}
                    <td className="p-1 text-center bg-[#0d121c] border-r border-[#1a2130] text-[9px] text-slate-500 font-mono">
                      Break
                    </td>
                    {renderCell(p7, 'P7')}
                    {renderCell(p8, 'P8')}
                  </tr>
                );
              })}

              {/* Saturday Row */}
              <tr className="border-b border-[#1b2333] bg-[#0e121b]">
                <td className="p-3 font-black text-amber-300 bg-[#141a27] border-r border-[#222b3d]">
                  Sat
                </td>
                <td colSpan={11} className="p-3 text-xs text-slate-300">
                  <div className="font-bold text-amber-200 mb-1 flex items-center gap-1.5">
                    <span>Working Saturdays Timetable Schedule (Mapped Routine Days)</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-[11px] font-mono">
                    {SATURDAY_SCHEDULE_MAPPINGS.map((sat, idx) => (
                      <div key={idx} className="p-1.5 rounded-lg bg-[#151c2a] border border-[#232e44] text-center">
                        <div className="text-white font-bold">{sat.date}</div>
                        <div className="text-sky-300 font-semibold">{sat.note}</div>
                      </div>
                    ))}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Selected Cell Modal/Drawer if clicked */}
        {selectedCell && (
          <div className="mt-4 p-4 rounded-2xl bg-[#141b28] border border-cyan-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <div className="text-[11px] text-cyan-300 font-mono font-bold">
                {selectedCell.day} • {selectedCell.cell.timeRange}
              </div>
              <div className="text-sm font-black text-white">
                {selectedCell.cell.code} — {selectedCell.cell.name}
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span>{selectedCell.cell.faculty}</span>
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>{selectedCell.cell.room}</span>
                </span>
              </div>
            </div>
            <button
              onClick={() => setSelectedCell(null)}
              className="px-3 py-1.5 rounded-xl bg-[#1e2638] text-slate-300 hover:text-white font-bold self-start sm:self-auto"
            >
              Close
            </button>
          </div>
        )}

        {/* Signatures Footer */}
        <div className="mt-8 pt-5 border-t border-[#1b2333] grid grid-cols-2 sm:grid-cols-4 gap-4 text-center text-xs text-slate-400 font-bold uppercase tracking-wider">
          <div className="p-2 border-t border-slate-700">HOD</div>
          <div className="p-2 border-t border-slate-700">Dean-Academics</div>
          <div className="p-2 border-t border-slate-700">Principal</div>
          <div className="p-2 border-t border-slate-700">Director</div>
        </div>
      </div>

      {/* 4. ACTIVE SECTION B SUBJECTS & FACULTY TABLE */}
      <div className="bg-[#10141d] border border-[#1e2637] rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-sky-400" />
              <span>Section "B" Active Scheduled Subjects & Faculty List</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Only subjects present in this timetable are active in the app.
            </p>
          </div>
          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 self-start sm:self-auto">
            {CAMPUS_SUBJECTS.length} Active Courses
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-[#1f283a] text-slate-400 font-bold uppercase text-[10px]">
                <th className="py-2.5 px-3">Subject Code</th>
                <th className="py-2.5 px-3">Course Title</th>
                <th className="py-2.5 px-3">Faculty In-Charge</th>
                <th className="py-2.5 px-3">Classroom Venue</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#182131]">
              {CAMPUS_SUBJECTS.map((sub) => (
                <tr key={sub.code} className="hover:bg-[#141b27] transition-colors">
                  <td className="py-3 px-3 font-mono font-black text-cyan-300">
                    {sub.code}
                  </td>
                  <td className="py-3 px-3 font-bold text-white">
                    {sub.name}
                  </td>
                  <td className="py-3 px-3 text-slate-300">
                    {sub.facultyName || 'Department Faculty'}
                  </td>
                  <td className="py-3 px-3 text-slate-400 font-medium">
                    {sub.classroom || 'SH3 Civil Floor'}
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                      Active in Timetable
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Note about excluded subjects */}
        <div className="p-3.5 rounded-2xl bg-[#141822] border border-[#21293a] text-xs text-slate-400 leading-relaxed">
          <span className="font-bold text-slate-300">Excluded Elective/Stream Codes: </span>
          The master institutional catalogue contains subjects for Business Analytics (MBABA311-313), Data Science (MBADS311-313), Marketing (MBAMM311-313), Human Resources (MBAHR311-313), and 22MBAAT308. Because this specific timetable is for Section "B" (Finance & Logistics & Supply Chain), all non-scheduled streams have zero periods and are omitted from attendance calculations in accordance with your rule.
        </div>
      </div>
    </div>
  );
};
