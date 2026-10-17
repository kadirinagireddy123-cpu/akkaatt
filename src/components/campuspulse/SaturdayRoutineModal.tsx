import React from 'react';
import { X, Calendar, CheckCircle2, BookOpen, Clock, Sparkles } from 'lucide-react';
import { WeekdayTimetableDay, DayScheduleMode } from '../../types/campusPulse';
import { formatLocalDateLong } from '../../utils/dateUtils';
import { WEEKLY_TIMETABLE_SLOTS } from '../../data/campusPulseData';

interface SaturdayRoutineModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
  activeRoutineDay: WeekdayTimetableDay;
  onSelectRoutineDay: (day: WeekdayTimetableDay) => void;
}

const WEEKDAY_OPTIONS: {
  day: WeekdayTimetableDay;
  label: string;
  badgeColor: string;
  accentBorder: string;
}[] = [
  { day: 'Mon', label: 'Monday Timetable', badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/40', accentBorder: 'border-sky-500' },
  { day: 'Tue', label: 'Tuesday Timetable', badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40', accentBorder: 'border-amber-500' },
  { day: 'Wed', label: 'Wednesday Timetable', badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', accentBorder: 'border-emerald-500' },
  { day: 'Thu', label: 'Thursday Timetable', badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40', accentBorder: 'border-indigo-500' },
  { day: 'Fri', label: 'Friday Timetable', badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40', accentBorder: 'border-rose-500' }
];

export const SaturdayRoutineModal: React.FC<SaturdayRoutineModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  activeRoutineDay,
  onSelectRoutineDay
}) => {
  if (!isOpen) return null;

  const formattedDate = formatLocalDateLong(selectedDate);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-[#0e131d] border border-[#26334a] rounded-3xl shadow-2xl p-6 sm:p-7 overflow-hidden max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#1b2333]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider font-extrabold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  SATURDAY CLASS TIMETABLE
                </span>
                <span className="text-xs text-slate-400">Day Schedule: Normal Classes</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white mt-1">
                Which day's timetable applies this Saturday?
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {formattedDate} • Saturday classes follow college circular weekday replacement
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#1a2232] transition-colors shrink-0"
            title="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informative Callout */}
        <div className="mt-4 p-3.5 rounded-2xl bg-[#141b28] border border-[#222e44] text-xs text-slate-300 flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            Select the timetable for this working Saturday as per the departmental circular. All period timings, attendance marking slots, and subject faculty will update automatically.
          </div>
        </div>

        {/* Options Grid: Monday, Tuesday, Wednesday, Thursday, Friday */}
        <div className="mt-4 space-y-2.5 overflow-y-auto pr-1">
          {WEEKDAY_OPTIONS.map(opt => {
            const isSelected = activeRoutineDay === opt.day;
            const daySlots = WEEKLY_TIMETABLE_SLOTS.filter(s => s.day === opt.day);
            const uniqueSubjects = Array.from(new Set(daySlots.map(s => s.subjectCode)));

            return (
              <div
                key={opt.day}
                onClick={() => {
                  onSelectRoutineDay(opt.day);
                  onClose();
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isSelected
                    ? `bg-[#161f30] ${opt.accentBorder} shadow-lg shadow-black/40 ring-1 ring-cyan-500/30`
                    : 'bg-[#101520] border-[#1d2638] hover:bg-[#151c2a] hover:border-[#2a374f]'
                }`}
              >
                <div className="flex items-start sm:items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 border ${
                      isSelected
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-extrabold'
                        : 'bg-[#18202e] text-slate-300 border-[#253248]'
                    }`}
                  >
                    {opt.day}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-white text-sm">
                        {opt.label}
                      </span>
                      {isSelected && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>Active Routine</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 flex-wrap">
                      <span className="flex items-center gap-1 font-mono text-[11px] text-slate-300">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        {daySlots.length} Scheduled Periods
                      </span>
                      <span className="flex items-center gap-1 text-[11px]">
                        <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                        {uniqueSubjects.join(', ')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end">
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      onSelectRoutineDay(opt.day);
                      onClose();
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                      isSelected
                        ? 'bg-cyan-500 text-slate-950 hover:bg-cyan-400'
                        : 'bg-[#1b2333] text-slate-200 hover:bg-[#253147] border border-[#2b3850]'
                    }`}
                  >
                    {isSelected ? 'Selected' : 'Use Timetable'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer actions */}
        <div className="mt-5 pt-4 border-t border-[#1b2333] flex items-center justify-between text-xs">
          <span className="text-slate-400">
            Currently active: <strong className="text-white">{activeRoutineDay} Timetable</strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#161c28] hover:bg-[#1e2638] text-slate-300 font-bold border border-[#26334a] transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
