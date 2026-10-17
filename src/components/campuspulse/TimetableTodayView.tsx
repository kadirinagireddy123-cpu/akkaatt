import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  AlertOctagon,
  Sun,
  Settings2,
  Check,
  X,
  MinusCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import {
  TimetablePeriodSlot,
  CampusAttendanceRecord,
  AttendanceActionStatus,
  DayScheduleMode,
  WeekdayTimetableDay
} from '../../types/campusPulse';

import {
  formatLocalDateLong,
  shiftDateDays,
  isDateToday,
  getTodayDateString,
  getDateForDayInCurrentWeek,
  getDayOfWeek
} from '../../utils/dateUtils';

interface TimetableTodayViewProps {
  selectedDate: string;
  onSelectDate: (d: string) => void;
  slots: TimetablePeriodSlot[];
  records: CampusAttendanceRecord[];
  onMarkSlot: (slot: TimetablePeriodSlot, status: AttendanceActionStatus) => void;
  onMarkEntireDayHoliday: () => void;
  onOpenMassBunk: () => void;
  onNavigateToFullTimetable?: () => void;
  scheduleMode?: DayScheduleMode;
  onSelectScheduleMode?: (mode: DayScheduleMode) => void;
  saturdayRoutineDay?: WeekdayTimetableDay;
  onSelectSaturdayRoutineDay?: (day: WeekdayTimetableDay) => void;
  onOpenSaturdayRoutineModal?: () => void;
}

export const TimetableTodayView: React.FC<TimetableTodayViewProps> = ({
  selectedDate,
  onSelectDate,
  slots,
  records,
  onMarkSlot,
  onMarkEntireDayHoliday,
  onOpenMassBunk,
  onNavigateToFullTimetable,
  scheduleMode = 'Normal Classes',
  onSelectScheduleMode,
  saturdayRoutineDay = 'Mon',
  onSelectSaturdayRoutineDay,
  onOpenSaturdayRoutineModal
}) => {
  const shiftDay = (days: number) => {
    onSelectDate(shiftDateDays(selectedDate, days));
  };

  const formattedDayTitle = formatLocalDateLong(selectedDate);
  const isToday = isDateToday(selectedDate);
  const activeDayOfWeek = getDayOfWeek(selectedDate);
  const isSaturday = activeDayOfWeek === 'Sat';

  const todayRecords = records.filter(r => r.date === selectedDate);
  const scheduledCount = slots.length;
  const markedCount = slots.filter(s =>
    todayRecords.some(r => r.periodId === s.id && r.subjectCode === s.subjectCode)
  ).length;
  const presentCount = slots.filter(s =>
    todayRecords.some(r => r.periodId === s.id && r.subjectCode === s.subjectCode && r.status === 'present')
  ).length;
  const absentCount = slots.filter(s =>
    todayRecords.some(r => r.periodId === s.id && r.subjectCode === s.subjectCode && r.status === 'absent')
  ).length;

  const getSlotStatus = (slot: TimetablePeriodSlot): AttendanceActionStatus | 'unmarked' => {
    const match = todayRecords.find(
      r => r.periodId === slot.id && r.subjectCode === slot.subjectCode
    );
    return match ? match.status : 'unmarked';
  };

  const weekDayButtons: ('Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat')[] = [
    'Mon',
    'Tue',
    'Wed',
    'Thu',
    'Fri',
    'Sat'
  ];

  return (
    <div className="space-y-6">
      {/* 1. TOP HEADER WITH DATE STEPPER, DAY PILLS & CALENDAR INPUT */}
      <div className="bg-[#10141d] border border-[#1e2637] rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => shiftDay(-1)}
              className="w-9 h-9 rounded-xl bg-[#161c28] border border-[#253046] hover:bg-[#1f283a] text-slate-300 flex items-center justify-center transition-colors shrink-0"
              title="Previous Day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black text-white">
                  {formattedDayTitle}
                </h1>
                {isToday ? (
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-cyan-400 text-slate-950 shadow-sm shadow-cyan-400/30">
                    TODAY
                  </span>
                ) : (
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#1b2333] text-slate-300 border border-[#273449]">
                    SELECTED DAY
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {scheduledCount} scheduled periods • {markedCount} marked
              </p>
            </div>

            <button
              onClick={() => shiftDay(1)}
              className="w-9 h-9 rounded-xl bg-[#161c28] border border-[#253046] hover:bg-[#1f283a] text-slate-300 flex items-center justify-center transition-colors shrink-0"
              title="Next Day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Date Input Box & Today Button */}
          <div className="flex items-center gap-2 flex-wrap">
            {!isToday && (
              <button
                onClick={() => onSelectDate(getTodayDateString())}
                className="px-3 py-1.5 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 text-xs font-black transition-colors"
              >
                Jump to Today
              </button>
            )}

            <div className="flex items-center gap-2 bg-[#151c28] border border-[#232f46] px-3 py-1.5 rounded-xl">
              <Calendar className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <input
                type="date"
                value={selectedDate}
                onChange={e => e.target.value && onSelectDate(e.target.value)}
                className="bg-transparent text-xs font-mono font-bold text-white focus:outline-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Quick Weekday Switcher Strip */}
        <div className="pt-2 border-t border-[#1a2130] flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 shrink-0">
            Jump to Day:
          </span>
          <button
            onClick={() => onSelectDate(getTodayDateString())}
            className={`px-3 py-1 rounded-lg font-bold text-xs transition-colors shrink-0 ${
              isToday
                ? 'bg-cyan-600 text-white shadow-sm shadow-cyan-600/30'
                : 'bg-[#151b27] text-slate-300 hover:text-white border border-[#232d40]'
            }`}
          >
            Today
          </button>
          {weekDayButtons.map(day => {
            const dayDate = getDateForDayInCurrentWeek(day, selectedDate);
            const isDaySelected = activeDayOfWeek === day;
            return (
              <button
                key={day}
                onClick={() => onSelectDate(dayDate)}
                className={`px-3 py-1 rounded-lg font-bold text-xs transition-colors shrink-0 ${
                  isDaySelected
                    ? 'bg-[#222e44] text-cyan-300 border border-cyan-500/60 shadow-sm'
                    : 'bg-[#151b27] text-slate-400 hover:text-white border border-[#232d40]'
                }`}
                title={`Switch to this week's ${day}`}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. CONTROLS BAR: DAY MODE, MARK HOLIDAY, MASS BUNK TODAY (Screenshot 2) */}
      <div className="bg-[#10141d] border border-[#1e2637] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <span className="font-bold text-white">Day Schedule Mode</span>
          <select
            value={scheduleMode}
            onChange={e => {
              const newMode = e.target.value as DayScheduleMode;
              onSelectScheduleMode?.(newMode);
            }}
            className="bg-[#161c28] border border-[#26334a] text-xs font-bold text-slate-200 px-3 py-1.5 rounded-xl focus:outline-none"
          >
            <option value="Normal Classes">Normal Classes</option>
            <option value="Exam">Exam Mode</option>
            <option value="Event">Fest / Event Mode</option>
            <option value="Holiday">College Holiday</option>
          </select>

          {isSaturday && scheduleMode === 'Normal Classes' && (
            <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-950/80 border border-blue-500/40 text-cyan-300 font-mono text-[11px] font-bold">
              <span>Working Sat:</span>
              <strong className="text-white">{saturdayRoutineDay} Timetable</strong>
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isSaturday && scheduleMode === 'Normal Classes' && onOpenSaturdayRoutineModal && (
            <button
              onClick={onOpenSaturdayRoutineModal}
              className="px-3 py-2 rounded-xl bg-blue-600/20 border border-blue-500/40 text-cyan-200 hover:bg-blue-600/30 font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Change Saturday Routine</span>
            </button>
          )}

          <button
            onClick={onMarkEntireDayHoliday}
            className="px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 font-bold text-xs flex items-center gap-1.5 transition-colors"
          >
            <Sun className="w-3.5 h-3.5 text-amber-400" />
            <span>Mark Entire Day Holiday</span>
          </button>

          <button
            onClick={onOpenMassBunk}
            className="px-4 py-2 rounded-xl bg-rose-600/20 border border-rose-600/40 text-rose-300 hover:bg-rose-600/30 font-bold text-xs flex items-center gap-1.5 transition-colors"
          >
            <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
            <span>Mass Bunk Today</span>
          </button>
        </div>
      </div>

      {/* Dynamic Saturday Routine Selector Banner when on Saturday and mode is Normal Classes */}
      {isSaturday && scheduleMode === 'Normal Classes' && (
        <div className="bg-gradient-to-r from-blue-950 via-[#131c2e] to-indigo-950 border border-blue-500/40 rounded-2xl p-4 sm:p-5 text-white shadow-xl space-y-3.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-mono font-bold bg-blue-500/30 text-blue-300 border border-blue-500/40 px-2 py-0.5 rounded">
                SATURDAY CLASS TIMETABLE
              </span>
              <span className="text-xs text-blue-200">Dynamic Schedule</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-xs font-mono font-bold bg-blue-900/60 border border-blue-400/50 px-3 py-1 rounded-xl text-cyan-300">
                Active: {saturdayRoutineDay} Timetable
              </div>
              {onOpenSaturdayRoutineModal && (
                <button
                  onClick={onOpenSaturdayRoutineModal}
                  className="px-2.5 py-1 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-200 text-xs font-bold transition-colors"
                >
                  Configure
                </button>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-white">
              Which day's timetable applies this Saturday?
            </h3>
            <p className="text-xs text-blue-200/80 mt-0.5">
              Saturday classes follow the college circular for Monday–Friday replacement. Select which day to activate:
            </p>
          </div>

          {/* 5 Weekday Selection Pills/Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
            {([
              { day: 'Mon', label: 'Monday', count: 6 },
              { day: 'Tue', label: 'Tuesday', count: 7 },
              { day: 'Wed', label: 'Wednesday', count: 7 },
              { day: 'Thu', label: 'Thursday', count: 7 },
              { day: 'Fri', label: 'Friday', count: 7 }
            ] as const).map(w => {
              const isActive = saturdayRoutineDay === w.day;
              return (
                <button
                  key={w.day}
                  onClick={() => onSelectSaturdayRoutineDay?.(w.day)}
                  className={`p-2.5 sm:p-3 rounded-xl border text-center transition-all ${
                    isActive
                      ? 'bg-blue-600 border-cyan-300 text-white font-extrabold shadow-lg shadow-blue-950/60 ring-2 ring-cyan-400/50'
                      : 'bg-[#0f1624] hover:bg-[#162136] border-[#22314d] text-slate-300 font-semibold'
                  }`}
                >
                  <div className="text-xs font-bold">{w.label}</div>
                  <div
                    className={`text-[10px] font-mono mt-0.5 ${
                      isActive ? 'text-cyan-200 font-bold' : 'text-slate-400'
                    }`}
                  >
                    {isActive ? '✓ Active' : `${w.count} Periods`}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Saturday Non-Normal Mode Notice */}
      {isSaturday && scheduleMode !== 'Normal Classes' && (
        <div className="bg-[#121722] border border-[#232f45] rounded-2xl p-4 text-xs text-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="font-extrabold text-white text-sm">
              Saturday Schedule Mode: {scheduleMode}
            </div>
            <p className="text-slate-400 mt-0.5">
              No regular period attendance is required for this Saturday.
            </p>
          </div>
          <button
            onClick={() => onSelectScheduleMode?.('Normal Classes')}
            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-colors shrink-0"
          >
            Switch to Normal Classes
          </button>
        </div>
      )}

      {/* 3. STATS ROW (Screenshot 2) with VTU & Cushion Indicator */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 text-center">
        <div className="bg-[#10141d] border border-[#1e2637] rounded-2xl p-4">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            SCHEDULED
          </div>
          <div className="text-3xl font-black font-mono text-white mt-1">
            {scheduledCount}
          </div>
        </div>

        <div className="bg-[#10141d] border border-[#1e2637] rounded-2xl p-4">
          <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
            PRESENT TODAY
          </div>
          <div className="text-3xl font-black font-mono text-emerald-400 mt-1">
            {presentCount}
          </div>
        </div>

        <div className="bg-[#10141d] border border-[#1e2637] rounded-2xl p-4">
          <div className="text-[11px] font-bold text-rose-400 uppercase tracking-wider">
            ABSENT TODAY
          </div>
          <div className="text-3xl font-black font-mono text-rose-400 mt-1">
            {absentCount}
          </div>
        </div>

        <div className="bg-[#10141d] border border-[#1e2637] rounded-2xl p-4 flex flex-col justify-between">
          <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">
            VTU &amp; CUSHION
          </div>
          <div className="text-xs font-mono font-black text-white mt-1 flex items-center justify-center gap-1.5 flex-wrap">
            <span className="text-rose-300 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-800">85% Min</span>
            <span className="text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">90% Cushion</span>
          </div>
        </div>
      </div>

      {/* 4. CLASS SLOTS LIST (Screenshot 2) */}
      {slots.length === 0 ? (
        <div className="bg-[#10141d] border border-[#1e2637] rounded-3xl p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#161c28] border border-[#232f46] text-slate-400 flex items-center justify-center mx-auto">
            <Calendar className="w-6 h-6 text-slate-400" />
          </div>
          <h3 className="text-base font-black text-white">
            No Classes Scheduled in Timetable for this Day
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            Per the official Section "B" timetable, no periods are assigned for this day (free day or weekend). In accordance with your rule, unmentioned periods are excluded and not counted in attendance.
          </p>
          {onNavigateToFullTimetable && (
            <button
              onClick={onNavigateToFullTimetable}
              className="mt-2 px-4 py-2 rounded-xl bg-cyan-950/60 border border-cyan-800 text-cyan-300 hover:bg-cyan-900 text-xs font-bold transition-colors inline-flex items-center gap-2"
            >
              <span>View Master Timetable Sheet</span>
            </button>
          )}
        </div>
      ) : (
      <div className="space-y-3.5">
        {slots.map(slot => {
          const currentStatus = getSlotStatus(slot);

          return (
            <div
              key={slot.id}
              className="bg-[#10141d] border border-[#1e2637] rounded-3xl p-5 shadow-xl transition-all hover:border-[#2a354c]"
            >
              {/* Slot Header Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#18202e]">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono font-bold text-slate-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>{slot.timeRange}</span>
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#18202e] text-slate-300">
                    {slot.durationMinutes} min
                  </span>
                  {slot.isBlock && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                      100-min Block
                    </span>
                  )}
                  {slot.isLab && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                      Lab
                    </span>
                  )}
                </div>

                {/* Status Pill in Upper Right */}
                {currentStatus !== 'unmarked' && (
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider self-start sm:self-auto ${
                      currentStatus === 'present'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                        : currentStatus === 'absent'
                        ? 'bg-rose-950 text-rose-300 border border-rose-700'
                        : currentStatus === 'cancelled'
                        ? 'bg-slate-800 text-slate-300 border border-slate-600'
                        : 'bg-amber-950 text-amber-300 border border-amber-700'
                    }`}
                  >
                    ✓ {currentStatus.toUpperCase()}
                  </span>
                )}
              </div>

              {/* Subject Title & Notes */}
              <div className="py-4">
                <div className="text-lg font-black text-white">
                  {slot.subjectCode}{' '}
                  <span className="text-sm font-normal text-slate-400 font-sans">
                    {slot.subjectName}
                  </span>
                </div>

                {slot.noteTag && (
                  <div className="mt-2 text-xs font-medium text-purple-300 bg-purple-950/40 border border-purple-800/60 p-2.5 rounded-xl inline-block">
                    {slot.noteTag}
                  </div>
                )}
              </div>

              {/* 4 Big Action Buttons + Configure Lab / Options */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#18202e]">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => onMarkSlot(slot, 'present')}
                    className={`min-h-[42px] px-4 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all ${
                      currentStatus === 'present'
                        ? 'bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-950 scale-102'
                        : 'bg-[#18202f] text-slate-300 hover:bg-emerald-950 hover:text-emerald-300'
                    }`}
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Present</span>
                  </button>

                  <button
                    onClick={() => onMarkSlot(slot, 'absent')}
                    className={`min-h-[42px] px-4 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all ${
                      currentStatus === 'absent'
                        ? 'bg-rose-600 text-white shadow-lg shadow-rose-950 scale-102'
                        : 'bg-[#18202f] text-slate-300 hover:bg-rose-950 hover:text-rose-300'
                    }`}
                  >
                    <X className="w-4 h-4 stroke-[3]" />
                    <span>Absent</span>
                  </button>

                  <button
                    onClick={() => onMarkSlot(slot, 'cancelled')}
                    className={`min-h-[42px] px-3.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all ${
                      currentStatus === 'cancelled'
                        ? 'bg-slate-700 text-white shadow-md'
                        : 'bg-[#18202f] text-slate-400 hover:text-white'
                    }`}
                  >
                    <MinusCircle className="w-4 h-4" />
                    <span>Cancelled</span>
                  </button>

                  <button
                    onClick={() => onMarkSlot(slot, 'holiday')}
                    className={`min-h-[42px] px-3.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all ${
                      currentStatus === 'holiday'
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                        : 'bg-[#18202f] text-slate-400 hover:text-amber-400'
                    }`}
                  >
                    <Sun className="w-4 h-4" />
                    <span>Holiday</span>
                  </button>
                </div>

                <button
                  className="text-xs font-semibold text-slate-400 hover:text-slate-200 flex items-center gap-1.5 self-start sm:self-auto p-2 rounded-xl bg-[#141924] border border-[#20283b]"
                >
                  <Settings2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>{slot.isLab ? 'Configure Lab' : 'Options'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
};
