import React, { useState, useMemo } from 'react';
import { SubjectStats } from '../../types/portal';
import {
  BookOpen,
  Search,
  Plus,
  RotateCcw,
  Edit2,
  Check,
  X,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';

interface SubjectsPunchTabProps {
  subjects: SubjectStats[];
  onAddAttendance: (code: string, type: 'present' | 'absent') => void;
  onResetSubject: (code: string) => void;
  onAddCustomSubject: (newSubject: SubjectStats) => void;
  targetThreshold: number; // 85%
}

export const SubjectsPunchTab: React.FC<SubjectsPunchTabProps> = ({
  subjects,
  onAddAttendance,
  onResetSubject,
  onAddCustomSubject,
  targetThreshold
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'lowest' | 'highest' | 'name'>('lowest');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newCode, setNewCode] = useState<string>('');
  const [newName, setNewName] = useState<string>('');
  const [newFaculty, setNewFaculty] = useState<string>('');
  const [newRoom, setNewRoom] = useState<string>('SH-2');

  const filteredSubjects = useMemo(() => {
    return subjects
      .filter(s => {
        const q = searchQuery.toLowerCase();
        return s.code.toLowerCase().includes(q) || s.name.toLowerCase().includes(q);
      })
      .sort((a, b) => {
        const pctA = a.conducted > 0 ? (a.present / a.conducted) * 100 : 0;
        const pctB = b.conducted > 0 ? (b.present / b.conducted) * 100 : 0;
        if (sortBy === 'lowest') return pctA - pctB;
        if (sortBy === 'highest') return pctB - pctA;
        return a.code.localeCompare(b.code);
      });
  }, [subjects, searchQuery, sortBy]);

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim()) return;
    onAddCustomSubject({
      code: newCode.trim().toUpperCase(),
      name: newName.trim() || newCode.trim().toUpperCase(),
      facultyName: newFaculty.trim() || 'Prof. In-Charge · BITM Dept.',
      classroom: newRoom.trim() || 'SH-2',
      conducted: 0,
      present: 0,
      absent: 0,
      cancelled: 0
    });
    setNewCode('');
    setNewName('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner Matching Image 5 */}
      <div className="bg-[#0c1527] border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-400" />
              <h1 className="text-xl font-bold text-white">
                Subject Attendance & Safe Bunk Analytics
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Real-time percentage formulas, safe-to-bunk tolerance, and recovery targets (Goal: <strong>{targetThreshold}%</strong>)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (confirm('Reset all subjects to empty?')) {
                  subjects.forEach(s => onResetSubject(s.code));
                }
              }}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Mark All Empty</span>
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-600/30"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add Subject</span>
            </button>
          </div>
        </div>

        {/* Search Bar & Sort Dropdown */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search subject code or name..."
              className="w-full bg-[#131d31] border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="whitespace-nowrap font-medium">Sort By:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="bg-[#131d31] text-white border border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none"
            >
              <option value="lowest">Lowest Attendance First</option>
              <option value="highest">Highest Attendance First</option>
              <option value="name">Subject Code A-Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Subject Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSubjects.map(sub => {
          const percentage = sub.conducted > 0 ? Math.round((sub.present / sub.conducted) * 1000) / 10 : 0;
          const isEligible = percentage >= targetThreshold;
          const isZero = sub.conducted === 0;

          // Safe bunk calculation relative to 85%
          let safeBunks = 0;
          let neededPresents = 0;
          if (sub.conducted > 0) {
            const targetFrac = targetThreshold / 100;
            if (percentage >= targetThreshold) {
              safeBunks = Math.max(0, Math.floor(sub.present / targetFrac) - sub.conducted);
            } else {
              neededPresents = Math.max(0, Math.ceil((targetFrac * sub.conducted - sub.present) / (1 - targetFrac)));
            }
          }

          return (
            <div
              key={sub.code}
              className="bg-[#0c1527] border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 hover:border-slate-700 transition-colors"
            >
              {/* Header: Code + Pill + Edit icon */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-black text-white">{sub.code}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">
                      {isZero ? 'EMPTY (0/0)' : `(${sub.present}/${sub.conducted})`}
                    </span>
                  </div>
                  <div className="text-xs text-slate-300 font-medium mt-0.5">
                    {sub.name}
                  </div>
                </div>

                <button
                  onClick={() => onResetSubject(sub.code)}
                  className="text-slate-500 hover:text-slate-300 p-1"
                  title="Reset counts"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Big Percentage + Attended counter */}
              <div className="flex items-baseline justify-between">
                <div
                  className={`text-3xl font-black font-mono tabular-nums ${
                    isZero
                      ? 'text-slate-400'
                      : isEligible
                      ? 'text-emerald-400'
                      : 'text-rose-400'
                  }`}
                >
                  {percentage}%
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  {sub.present} / {sub.conducted} classes attended
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-[#14213d] h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    isZero ? 'bg-slate-700' : isEligible ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${isZero ? 0 : Math.min(100, percentage)}%` }}
                />
              </div>

              {/* 4 Stats: Conducted, Present, Absent, Cancelled */}
              <div className="grid grid-cols-4 gap-2 text-center text-xs py-2 bg-[#101b33] rounded-xl border border-slate-800/80">
                <div>
                  <div className="text-[9px] font-mono text-slate-400 font-bold uppercase">CONDUCTED</div>
                  <div className="font-bold font-mono text-white mt-0.5">{sub.conducted}</div>
                </div>
                <div>
                  <div className="text-[9px] font-mono text-emerald-400 font-bold uppercase">PRESENT</div>
                  <div className="font-bold font-mono text-emerald-300 mt-0.5">{sub.present}</div>
                </div>
                <div>
                  <div className="text-[9px] font-mono text-rose-400 font-bold uppercase">ABSENT</div>
                  <div className="font-bold font-mono text-rose-300 mt-0.5">{sub.absent}</div>
                </div>
                <div>
                  <div className="text-[9px] font-mono text-slate-400 font-bold uppercase">CANCELLED</div>
                  <div className="font-bold font-mono text-slate-300 mt-0.5">{sub.cancelled}</div>
                </div>
              </div>

              {/* Status Note */}
              <div className="text-xs text-slate-400">
                Attendance status:{' '}
                <strong className={isZero ? 'text-slate-300' : isEligible ? 'text-emerald-400' : 'text-rose-400'}>
                  {isZero
                    ? 'Empty / No classes yet'
                    : isEligible
                    ? `Safe Zone (≥ ${targetThreshold}%)`
                    : `Shortage Risk (< ${targetThreshold}%)`}
                </strong>
              </div>

              {/* Quick Punch Row */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <span className="text-xs font-semibold text-slate-300">Quick Punch:</span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onAddAttendance(sub.code, 'present')}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 text-xs font-bold transition-all flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Attended (+1)</span>
                  </button>

                  <button
                    onClick={() => onAddAttendance(sub.code, 'absent')}
                    className="px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 text-xs font-bold transition-all flex items-center gap-1"
                  >
                    <span>Bunked (+1)</span>
                  </button>
                </div>
              </div>

              {/* Target 85% Safe Zone Callout */}
              <div className="text-xs font-mono text-slate-400">
                Target {targetThreshold}% Safe Zone:{' '}
                {isZero ? (
                  <span className="text-slate-300">Need 0 presents</span>
                ) : isEligible ? (
                  <span className="text-emerald-400 font-bold">Can safely bunk {safeBunks} classes</span>
                ) : (
                  <span className="text-rose-400 font-bold">Need {neededPresents} consecutive presents</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Custom Subject Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0f1b33] border border-slate-700 rounded-3xl p-6 text-white space-y-4">
            <h3 className="text-base font-bold">Add Custom Subject</h3>
            <form onSubmit={handleCreateSubject} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">Subject Code (e.g. 22CAL54 / MBABA311)</label>
                <input
                  type="text"
                  value={newCode}
                  onChange={e => setNewCode(e.target.value.toUpperCase())}
                  placeholder="MBADS311"
                  className="w-full bg-[#152342] border border-slate-700 rounded-xl p-2.5 font-mono text-white"
                  required
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Subject Full Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="AI & Data Science for Managers"
                  className="w-full bg-[#152342] border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Faculty In-Charge</label>
                <input
                  type="text"
                  value={newFaculty}
                  onChange={e => setNewFaculty(e.target.value)}
                  placeholder="Mrs. Varada Alekya · BITM Dept."
                  className="w-full bg-[#152342] border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Classroom</label>
                <input
                  type="text"
                  value={newRoom}
                  onChange={e => setNewRoom(e.target.value)}
                  placeholder="T2 MBA Block / LH-10"
                  className="w-full bg-[#152342] border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-xs"
                >
                  Add Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
