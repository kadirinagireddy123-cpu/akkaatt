import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  Trash2,
  Edit2,
  Check,
  X,
  MinusCircle,
  Sun
} from 'lucide-react';
import {
  CampusAttendanceRecord,
  CampusSubject,
  AttendanceActionStatus
} from '../../types/campusPulse';
import {
  parseLocalDate,
  getTodayDateString,
  isDateToday
} from '../../utils/dateUtils';

interface CalendarHistoryViewProps {
  records: CampusAttendanceRecord[];
  subjects: CampusSubject[];
  selectedDate: string;
  onSelectDate: (d: string) => void;
  onDeleteRecord: (id: string) => void;
}

export const CalendarHistoryView: React.FC<CalendarHistoryViewProps> = ({
  records,
  subjects,
  selectedDate,
  onSelectDate,
  onDeleteRecord
}) => {
  const initialDate = parseLocalDate(selectedDate || getTodayDateString());
  const [currentYear, setCurrentYear] = useState<number>(() => initialDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(() => initialDate.getMonth());

  // Filter state for detailed history list
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('ALL');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  // Month navigation
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonth(m => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonth(m => m + 1);
    }
  };

  const monthName = new Date(currentYear, currentMonth, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  // Calculate calendar days in month
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    const days: ({ dayNumber: number; dateStr: string } | null)[] = [];
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const monthStr = String(currentMonth + 1).padStart(2, '0');
      const dayStr = String(d).padStart(2, '0');
      const dateStr = `${currentYear}-${monthStr}-${dayStr}`;
      days.push({ dayNumber: d, dateStr });
    }
    return days;
  }, [currentYear, currentMonth]);

  // Map of records by date
  const recordsByDate = useMemo(() => {
    const map = new Map<string, CampusAttendanceRecord[]>();
    records.forEach(r => {
      const list = map.get(r.date) || [];
      list.push(r);
      map.set(r.date, list);
    });
    return map;
  }, [records]);

  // Filtered detailed history list
  const filteredRecords = useMemo(() => {
    return records
      .filter(r => {
        if (selectedSubjectFilter !== 'ALL' && r.subjectCode !== selectedSubjectFilter) return false;
        if (selectedStatusFilter !== 'ALL' && r.status !== selectedStatusFilter) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchCode = r.subjectCode.toLowerCase().includes(q);
          const matchNote = r.note?.toLowerCase().includes(q) || false;
          const matchDate = r.date.includes(q);
          if (!matchCode && !matchNote && !matchDate) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortOrder === 'newest') return b.date.localeCompare(a.date);
        return a.date.localeCompare(b.date);
      });
  }, [records, selectedSubjectFilter, selectedStatusFilter, searchQuery, sortOrder]);

  return (
    <div className="space-y-6">
      {/* 1. HEADER (Screenshot 3) */}
      <div className="bg-[#10141d] border border-[#1e2637] rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-sky-400" />
            <h1 className="text-xl font-extrabold text-white">
              Calendar & Attendance History
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Interactive month grid with status dots, instant date editing, and complete audit trail
          </p>
        </div>

        {/* Status Legend */}
        <div className="flex items-center gap-3 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-slate-300">Present</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span className="text-slate-300">Absent</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span className="text-slate-300">Holiday</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
            <span className="text-slate-300">Cancelled</span>
          </div>
        </div>
      </div>

      {/* 2. MONTH CALENDAR GRID (Screenshot 3) */}
      <div className="bg-[#10141d] border border-[#1e2637] rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-white">{monthName}</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const now = new Date();
                setCurrentYear(now.getFullYear());
                setCurrentMonth(now.getMonth());
                onSelectDate(getTodayDateString());
              }}
              className="px-2.5 py-1 rounded-xl bg-[#161c28] border border-[#232f46] hover:bg-[#1e283b] text-cyan-300 text-xs font-black transition-colors"
            >
              Current Month
            </button>
            <div className="flex items-center gap-1">
              <button
                onClick={prevMonth}
                className="w-8 h-8 rounded-xl bg-[#161c28] border border-[#232f46] hover:bg-[#1e283b] text-slate-300 flex items-center justify-center transition-colors"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextMonth}
                className="w-8 h-8 rounded-xl bg-[#161c28] border border-[#232f46] hover:bg-[#1e283b] text-slate-300 flex items-center justify-center transition-colors"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-extrabold uppercase tracking-wider text-slate-400">
          <div>SUN</div>
          <div>MON</div>
          <div>TUE</div>
          <div>WED</div>
          <div>THU</div>
          <div>FRI</div>
          <div>SAT</div>
        </div>

        {/* Calendar Cells Grid */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((cell, idx) => {
            if (!cell) {
              return <div key={`empty-${idx}`} className="h-20 rounded-2xl bg-[#0d1016]/40" />;
            }

            const dayRecords = recordsByDate.get(cell.dateStr) || [];
            const isSelected = selectedDate === cell.dateStr;
            const totalCount = dayRecords.length;

            return (
              <button
                key={cell.dateStr}
                onClick={() => onSelectDate(cell.dateStr)}
                className={`h-20 rounded-2xl p-2.5 text-left flex flex-col justify-between transition-all border ${
                  isSelected
                    ? 'bg-[#182030] border-white ring-2 ring-white/30 shadow-lg'
                    : 'bg-[#131824] border-[#1f2738] hover:border-slate-500 hover:bg-[#161c2b]'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-mono font-black text-sm text-white">
                    {cell.dayNumber}
                  </span>
                  {totalCount > 0 && (
                    <span className="text-[10px] font-mono font-bold text-slate-400">
                      {totalCount}
                    </span>
                  )}
                </div>

                {/* Colored dots indicators */}
                <div className="flex items-center gap-1 overflow-x-hidden flex-wrap">
                  {dayRecords.slice(0, 5).map((r, i) => (
                    <span
                      key={i}
                      className={`w-2 h-2 rounded-full ${
                        r.status === 'present'
                          ? 'bg-emerald-400'
                          : r.status === 'absent'
                          ? 'bg-rose-500'
                          : r.status === 'holiday'
                          ? 'bg-amber-400'
                          : 'bg-slate-400'
                      }`}
                    />
                  ))}
                </div>
              </button>
            );
          })}
        </div>

        <div className="text-xs text-slate-400 pt-2 flex items-center gap-1.5">
          <span>💡 Click any date above to open and modify its attendance records.</span>
        </div>
      </div>

      {/* 3. DETAILED ATTENDANCE HISTORY LIST (Screenshot 3 bottom) */}
      <div className="bg-[#10141d] border border-[#1e2637] rounded-3xl p-6 shadow-xl space-y-4">
        <div>
          <h2 className="text-base font-extrabold text-white">
            Detailed Attendance History ({filteredRecords.length} records)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Filter by professor, date, subject, lab, or substitution
          </p>
        </div>

        {/* Filter Controls Row (Screenshot 3) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search professor, subject, notes..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-[#151c28] border border-[#232f46] text-slate-200 text-xs pl-8 pr-3 py-2 rounded-xl focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Subject Filter */}
          <div>
            <select
              value={selectedSubjectFilter}
              onChange={e => setSelectedSubjectFilter(e.target.value)}
              className="w-full bg-[#151c28] border border-[#232f46] text-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none"
            >
              <option value="ALL">All Subjects</option>
              {subjects.map(s => (
                <option key={s.code} value={s.code}>
                  {s.code} - {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatusFilter}
              onChange={e => setSelectedStatusFilter(e.target.value)}
              className="w-full bg-[#151c28] border border-[#232f46] text-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="present">Present Only</option>
              <option value="absent">Absent Only</option>
              <option value="cancelled">Cancelled</option>
              <option value="holiday">Holiday</option>
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <select
              value={sortOrder}
              onChange={e => setSortOrder(e.target.value as any)}
              className="w-full bg-[#151c28] border border-[#232f46] text-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>

        {/* History Records Table / List */}
        {filteredRecords.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 bg-[#131824] rounded-2xl border border-[#1f2738]">
            No attendance records match your current filter.
          </div>
        ) : (
          <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
            {filteredRecords.slice(0, 50).map(rec => (
              <div
                key={rec.id}
                className="p-3.5 rounded-2xl bg-[#141924] border border-[#21293c] flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-slate-400 text-[11px] font-bold">
                    {rec.date}
                  </span>
                  <span className="font-mono font-black text-white px-2 py-0.5 rounded bg-[#1e2536]">
                    {rec.subjectCode}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      rec.status === 'present'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                        : rec.status === 'absent'
                        ? 'bg-rose-950 text-rose-300 border border-rose-700'
                        : rec.status === 'holiday'
                        ? 'bg-amber-950 text-amber-300 border border-amber-700'
                        : 'bg-slate-800 text-slate-300 border border-slate-600'
                    }`}
                  >
                    {rec.status}
                  </span>

                  <button
                    onClick={() => onDeleteRecord(rec.id)}
                    className="p-1 rounded text-slate-500 hover:text-rose-400"
                    title="Delete record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
