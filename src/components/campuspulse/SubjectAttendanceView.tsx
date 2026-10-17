import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  ArrowUpDown,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  MinusCircle,
  PlusCircle,
  RotateCcw
} from 'lucide-react';
import {
  CampusSubject,
  CampusAttendanceRecord,
  AcademicSettings,
  AttendanceActionStatus
} from '../../types/campusPulse';

interface SubjectAttendanceViewProps {
  subjects: CampusSubject[];
  records: CampusAttendanceRecord[];
  academicSettings: AcademicSettings;
  onOpenAddSubject: () => void;
  onEditSubjectCounts: (subject: CampusSubject, attended: number, conducted: number) => void;
  onQuickLog: (subjectCode: string, status: AttendanceActionStatus) => void;
}

export const SubjectAttendanceView: React.FC<SubjectAttendanceViewProps> = ({
  subjects,
  records,
  academicSettings,
  onOpenAddSubject,
  onEditSubjectCounts,
  onQuickLog
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'lowest' | 'highest' | 'alphabetical' | 'most'>('lowest');

  // Compute subject metrics
  const validRecords = records.filter(r => r.status !== 'cancelled' && r.status !== 'holiday');

  const subjectStats = useMemo(() => {
    return subjects.map(sub => {
      const subRecords = validRecords.filter(r => r.subjectCode === sub.code);
      const conducted = subRecords.length;
      const present = subRecords.filter(r => r.status === 'present').length;
      const absent = subRecords.filter(r => r.status === 'absent').length;
      const cancelled = records.filter(r => r.subjectCode === sub.code && r.status === 'cancelled').length;

      const pct = conducted > 0 ? Math.round((present / conducted) * 1000) / 10 : 0;

      const vtuMin = academicSettings.minimumTargetPercent || 85;
      const safeCushion = academicSettings.safeThresholdPercent || 90;

      // Safe bunks to strictly maintain VTU 85% minimum
      let safeBunksFor85 = 0;
      if (conducted > 0 && pct >= vtuMin) {
        safeBunksFor85 = Math.max(0, Math.floor(present / (vtuMin / 100) - conducted));
      }

      // Needed presents to reach 85% VTU minimum
      let neededFor85 = 0;
      if (conducted > 0 && pct < vtuMin) {
        neededFor85 = Math.max(0, Math.ceil(((vtuMin / 100) * conducted - present) / (1 - (vtuMin / 100))));
      }

      // Needed presents to reach 90% Safe Cushion
      let neededFor90 = 0;
      if (conducted > 0 && pct < safeCushion) {
        neededFor90 = Math.max(0, Math.ceil(((safeCushion / 100) * conducted - present) / (1 - (safeCushion / 100))));
      }

      const isCritical = conducted > 0 && pct < vtuMin;
      const isWarning = conducted > 0 && pct >= vtuMin && pct < safeCushion;
      const isSafe = conducted === 0 || pct >= safeCushion;

      return {
        ...sub,
        conducted,
        present,
        absent,
        cancelled,
        percentage: pct,
        safeBunksFor85,
        neededFor85,
        neededFor90,
        isSafe,
        isWarning,
        isCritical
      };
    });
  }, [subjects, validRecords, records, academicSettings]);

  // Filter and sort
  const sortedSubjects = useMemo(() => {
    return subjectStats
      .filter(s => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return s.code.toLowerCase().includes(q) || s.name.toLowerCase().includes(q);
      })
      .sort((a, b) => {
        if (sortBy === 'lowest') return a.percentage - b.percentage;
        if (sortBy === 'highest') return b.percentage - a.percentage;
        if (sortBy === 'alphabetical') return a.code.localeCompare(b.code);
        if (sortBy === 'most') return b.conducted - a.conducted;
        return 0;
      });
  }, [subjectStats, searchQuery, sortBy]);

  return (
    <div className="space-y-6">
      {/* 1. HEADER (Screenshot 4) */}
      <div className="bg-[#10141d] border border-[#1e2637] rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-sky-400" />
            <h1 className="text-xl font-extrabold text-white">
              Subject Attendance & Safe Bunk Analytics
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time percentage formulas, safe-to-bunk tolerance, and recovery targets
          </p>
        </div>

        <button
          onClick={onOpenAddSubject}
          className="px-4 py-2.5 rounded-xl bg-white text-slate-950 font-black text-xs hover:bg-slate-200 transition-colors flex items-center gap-1.5 self-start md:self-auto shadow-md"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add Subject</span>
        </button>
      </div>

      {/* 2. SEARCH & SORT BAR (Screenshot 4) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search subject code or name..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-[#131722] border border-[#20283b] text-slate-200 text-xs pl-9 pr-3 py-2.5 rounded-2xl focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-slate-400 font-bold flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>Sort By:</span>
          </span>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="bg-[#131722] border border-[#20283b] text-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none font-semibold"
          >
            <option value="lowest">Lowest Attendance First</option>
            <option value="highest">Highest Attendance First</option>
            <option value="alphabetical">Alphabetical</option>
            <option value="most">Most Classes Conducted</option>
          </select>
        </div>
      </div>

      {/* 3. 2-COLUMN SUBJECT CARDS GRID (Screenshot 4) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sortedSubjects.map(sub => (
          <div
            key={sub.code}
            className="bg-[#10141d] border border-[#1e2637] rounded-3xl p-5 shadow-xl space-y-4 transition-all hover:border-[#2a354c]"
          >
            {/* Top row: Code, Status Pill, Edit Button */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-white">{sub.code}</h3>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      sub.isCritical
                        ? 'bg-rose-950/80 text-rose-300 border border-rose-800'
                        : sub.isWarning
                        ? 'bg-amber-950/80 text-amber-300 border border-amber-800'
                        : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                    }`}
                  >
                    {sub.isCritical
                      ? '● VTU SHORTAGE (<85%)'
                      : sub.isWarning
                      ? '● THIN MARGIN (85-89%)'
                      : '● SAFE CUSHION (≥90%)'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{sub.name}</p>
              </div>

              <button
                onClick={() => onEditSubjectCounts(sub, sub.present, sub.conducted)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#1a2130] transition-colors"
                title="Edit counts manually"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Percentage Display & Fraction */}
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-black font-mono text-white">
                {sub.percentage}%
              </span>
              <span className="text-xs font-mono text-slate-400">
                {sub.present} / {sub.conducted} classes
              </span>
            </div>

            {/* Progress Bar with VTU 85% & 90% Safe Cushion */}
            <div className="w-full bg-[#1c2434] h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  sub.isCritical
                    ? 'bg-rose-500'
                    : sub.isWarning
                    ? 'bg-amber-400'
                    : 'bg-emerald-400'
                }`}
                style={{ width: `${Math.min(100, sub.percentage)}%` }}
              />
            </div>

            {/* 4 Stats Grid: CONDUCTED, PRESENT, ABSENT, CANCELLED */}
            <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono py-2.5 px-3 rounded-2xl bg-[#141924] border border-[#1e2638]">
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-bold">CONDUCTED</div>
                <div className="text-white font-extrabold text-sm">{sub.conducted}</div>
              </div>
              <div>
                <div className="text-[10px] text-emerald-400 uppercase font-bold">PRESENT</div>
                <div className="text-emerald-400 font-extrabold text-sm">{sub.present}</div>
              </div>
              <div>
                <div className="text-[10px] text-rose-400 uppercase font-bold">ABSENT</div>
                <div className="text-rose-400 font-extrabold text-sm">{sub.absent}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-bold">CANCELLED</div>
                <div className="text-slate-300 font-extrabold text-sm">{sub.cancelled}</div>
              </div>
            </div>

            {/* Safe to Bunk Green Box (≥ 85% VTU Rule) */}
            <div className="p-3 rounded-2xl bg-[#121c1f] border border-emerald-900/40 text-xs flex items-center justify-between">
              <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Safe to Bunk (≥85% VTU Min):</span>
              </span>
              <span className="font-mono font-black text-emerald-300 text-sm">
                {sub.safeBunksFor85} class{sub.safeBunksFor85 === 1 ? '' : 'es'}
              </span>
            </div>

            {/* Target 90% Safe Cushion & VTU Recovery Line */}
            <div className="text-xs text-slate-400 space-y-1 pt-0.5">
              <div className="flex items-center justify-between">
                <span>VTU 85% Recovery:</span>
                <span className="font-bold text-slate-200">
                  {sub.conducted === 0
                    ? 'Clean slate (0 conducted)'
                    : sub.isCritical
                    ? `Need ${sub.neededFor85} consecutive presents to clear detention`
                    : '✓ Meets VTU 85% rule'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>90% Safe Cushion Target:</span>
                <span className={`font-bold ${sub.isSafe ? 'text-emerald-400' : 'text-amber-300'}`}>
                  {sub.conducted === 0
                    ? 'Target 90% cushion'
                    : sub.neededFor90 > 0
                    ? `Need ${sub.neededFor90} presents for 90% cushion`
                    : '🛡️ Safe cushion active (≥90%)'}
                </span>
              </div>
            </div>

            {/* Quick 1-Tap Increments */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#18202e]">
              <button
                onClick={() => onQuickLog(sub.code, 'present')}
                className="py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center justify-center gap-1 transition-colors"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Present (+1)</span>
              </button>

              <button
                onClick={() => onQuickLog(sub.code, 'absent')}
                className="py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center justify-center gap-1 transition-colors"
              >
                <MinusCircle className="w-3.5 h-3.5" />
                <span>Absent (+1)</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
