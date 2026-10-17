import React, { useState } from 'react';
import {
  ClassPeriodSlot,
  DayScheduleMode,
  PeriodAttendanceStatus
} from '../../types/portal';
import {
  Check,
  X,
  MinusCircle,
  RotateCcw,
  AlertTriangle,
  ArrowLeftRight,
  Clock,
  Layers,
  ChevronLeft,
  ChevronRight,
  Calendar,
  CheckCircle2,
  FlaskConical,
  Sparkles
} from 'lucide-react';

interface TodayAttendanceTabProps {
  currentDateStr: string; // YYYY-MM-DD
  onDateChange: (newDate: string) => void;
  dayScheduleMode: DayScheduleMode;
  onModeChange: (mode: DayScheduleMode) => void;
  periods: ClassPeriodSlot[];
  onPeriodStatusChange: (periodId: string, status: PeriodAttendanceStatus) => void;
  onMarkAllPresent: () => void;
  onResetDay: () => void;
  onMassBunkDay: () => void;
  onExchangeFaculty: (period: ClassPeriodSlot) => void;
}

export const TodayAttendanceTab: React.FC<TodayAttendanceTabProps> = ({
  currentDateStr,
  onDateChange,
  dayScheduleMode,
  onModeChange,
  periods,
  onPeriodStatusChange,
  onMarkAllPresent,
  onResetDay,
  onMassBunkDay,
  onExchangeFaculty
}) => {
  // Format formatted date label e.g. "Tuesday, October 13, 2026"
  const dateObj = new Date(currentDateStr);
  const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const formattedDayTitle = dateObj.toLocaleDateString('en-US', options);

  // Compute counters
  const totalClasses = periods.length;
  const pendingCount = periods.filter(p => p.status === 'pending').length;
  const attendedCount = periods.filter(p => p.status === 'present').length;
  const absentCount = periods.filter(p => p.status === 'absent').length;

  const handlePrevDay = () => {
    const d = new Date(currentDateStr);
    d.setDate(d.getDate() - 1);
    onDateChange(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(currentDateStr);
    d.setDate(d.getDate() + 1);
    onDateChange(d.toISOString().split('T')[0]);
  };

  return (
    <div className="space-y-4">
      {/* 1. Quick Navigation Sub-Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Today Button */}
          <button
            onClick={() => onDateChange('2026-10-13')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border transition-all ${
              currentDateStr === '2026-10-13'
                ? 'bg-blue-600 border-blue-500 text-white font-bold shadow-md shadow-blue-600/30'
                : 'bg-[#0f1b33] border-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Today (Tue, Oct 13)</span>
          </button>

          {/* Tomorrow Button */}
          <button
            onClick={() => onDateChange('2026-10-14')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border transition-all ${
              currentDateStr === '2026-10-14'
                ? 'bg-blue-600 border-blue-500 text-white font-bold shadow-md shadow-blue-600/30'
                : 'bg-[#0f1b33] border-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Tomorrow (Wed, Oct 14)</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
              6 Classes
            </span>
          </button>

          {/* Saturday Button */}
          <button
            onClick={() => onDateChange('2026-10-17')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border transition-all ${
              currentDateStr === '2026-10-17'
                ? 'bg-blue-600 border-blue-500 text-white font-bold shadow-md shadow-blue-600/30'
                : 'bg-[#0f1b33] border-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Saturday (Sat, Oct 17)</span>
          </button>
        </div>

        {/* Stepper & Date Picker */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#0f1b33] border border-slate-800 rounded-xl overflow-hidden">
            <button
              onClick={handlePrevDay}
              className="px-2.5 py-2 hover:bg-[#152342] text-slate-300 hover:text-white flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Prev</span>
            </button>
            <button
              onClick={handleNextDay}
              className="px-2.5 py-2 hover:bg-[#152342] text-slate-300 hover:text-white border-l border-slate-800 flex items-center gap-1"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <input
            type="date"
            value={currentDateStr}
            onChange={e => onDateChange(e.target.value)}
            className="bg-[#0f1b33] border border-slate-800 text-white rounded-xl px-2.5 py-1.5 font-mono text-xs focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* 2. Main Title Banner Card with Bulk Actions */}
      <div className="bg-[#0c1527] border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {formattedDayTitle}
              </h1>
              {currentDateStr === '2026-10-13' && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-600 text-white">
                  TODAY
                </span>
              )}
            </div>

            <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-2">
              <span className="font-semibold text-slate-200">{totalClasses} Classes Scheduled</span>
              <span>·</span>
              <span className="text-amber-400 font-semibold">{pendingCount} Pending Marking</span>
              <span>·</span>
              <span className="text-emerald-400 font-semibold">{attendedCount} Marked Present</span>
              <span>·</span>
              <span className="text-rose-400 font-semibold">{absentCount} Marked Absent</span>
            </div>
          </div>

          {/* Action Buttons: Mark All Present, Reset, Mass Bunk Day */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onMarkAllPresent}
              className="px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/40 text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Mark All Present</span>
            </button>

            <button
              onClick={onResetDay}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-all flex items-center gap-1.5"
              title="Reset today's markings to pending"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            <button
              onClick={onMassBunkDay}
              className="px-3 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/40 text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Mass Bunk Day</span>
            </button>
          </div>
        </div>

        {/* Day Schedule Mode Dropdown Card */}
        <div className="p-3.5 bg-[#101b33] rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-white">Day Schedule Mode</div>
              <div className="text-[11px] text-slate-400">
                Exam Day, College Fest/Event, Holiday, or Normal Routine
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <select
              value={dayScheduleMode}
              onChange={e => onModeChange(e.target.value as DayScheduleMode)}
              className="bg-[#152342] text-white border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none focus:border-blue-500"
            >
              <option value="Normal Classes">Normal Classes</option>
              <option value="Exam Day">Exam Day</option>
              <option value="College Fest/Event">College Fest/Event</option>
              <option value="Holiday">Holiday</option>
            </select>

            <div className="text-right leading-none border-l border-slate-800 pl-3">
              <div className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">CLASSES</div>
              <div className="text-base font-black font-mono text-white mt-0.5">{totalClasses}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Three Large Stat Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Card 1: Pending */}
        <div className="bg-[#0c1527] border border-slate-800 rounded-2xl p-4 text-center">
          <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
            PENDING MARKING
          </div>
          <div className="text-3xl font-black font-mono text-amber-400 mt-1">
            {pendingCount}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">Classes to mark</div>
        </div>

        {/* Card 2: Attended */}
        <div className="bg-[#0c1527] border border-slate-800 rounded-2xl p-4 text-center">
          <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
            ATTENDED TODAY
          </div>
          <div className="text-3xl font-black font-mono text-emerald-400 mt-1">
            {attendedCount}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">Marked present</div>
        </div>

        {/* Card 3: Missed */}
        <div className="bg-[#0c1527] border border-slate-800 rounded-2xl p-4 text-center">
          <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
            MISSED / BUNKED
          </div>
          <div className="text-3xl font-black font-mono text-rose-400 mt-1">
            {absentCount}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">Marked absent</div>
        </div>
      </div>

      {/* 4. Period Cards List */}
      <div className="space-y-3.5">
        {periods.map(period => {
          const isPending = period.status === 'pending';
          const isPresent = period.status === 'present';
          const isAbsent = period.status === 'absent';
          const isCancelled = period.status === 'cancelled';

          return (
            <div
              key={period.id}
              className={`rounded-2xl border transition-all overflow-hidden ${
                isPresent
                  ? 'bg-[#0a1f1d] border-emerald-600/50'
                  : isAbsent
                  ? 'bg-[#220d15] border-rose-600/50'
                  : isCancelled
                  ? 'bg-[#151c28] border-slate-700'
                  : 'bg-[#0c1527] border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Optional Lab Session Header banner (from Image 3) */}
              {period.isLab && (
                <div className="bg-blue-600 px-4 py-2 text-white flex flex-wrap items-center justify-between text-xs font-semibold">
                  <div className="flex items-center gap-1.5">
                    <FlaskConical className="w-4 h-4" />
                    <span>PRACTICAL LAB SESSION ({period.labSpanPeriods} CONTINUOUS PERIODS) · {period.timeRange} (Morning Break Removed)</span>
                  </div>
                  <span className="font-mono bg-white/20 px-2 py-0.5 rounded text-[11px]">
                    {period.labCredit || '1 Lab Credit (+1)'}
                  </span>
                </div>
              )}

              <div className="p-4 sm:p-5 space-y-3">
                {/* Top Strip: Time Pill + Status Badge */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#14213d] border border-slate-700 text-xs font-mono font-bold text-slate-200">
                      <Clock className="w-3.5 h-3.5 text-blue-400" />
                      <span>{period.timeRange}</span>
                    </span>

                    {period.isLab && (
                      <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase bg-purple-900/60 text-purple-300 border border-purple-700/50">
                        Lab Practical - Batch B1
                      </span>
                    )}
                  </div>

                  {/* Status Pill on top right */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-xl text-xs font-bold font-mono ${
                        isPending
                          ? 'bg-amber-950/80 text-amber-300 border border-amber-700/50'
                          : isPresent
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/50'
                          : isAbsent
                          ? 'bg-rose-950/80 text-rose-300 border border-rose-700/50'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {isPending
                        ? 'Pending Marking'
                        : isPresent
                        ? 'Marked Present (+1)'
                        : isAbsent
                        ? 'Marked Absent'
                        : 'Class Cancelled'}
                    </span>

                    {/* Exchange Faculty button */}
                    <button
                      onClick={() => onExchangeFaculty(period)}
                      className="px-2.5 py-1 rounded-xl bg-[#14213d] hover:bg-[#1a2b50] text-slate-300 hover:text-white border border-slate-700 text-xs font-medium flex items-center gap-1 transition-colors"
                      title="Log class substitute or faculty exchange"
                    >
                      <ArrowLeftRight className="w-3.5 h-3.5" />
                      <span>Exchange Faculty</span>
                    </button>
                  </div>
                </div>

                {/* Middle: Subject Title & Lecturer */}
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-black text-white">
                      {period.subjectCode}
                    </span>
                    <span className="text-sm font-semibold text-slate-300">
                      — {period.subjectName}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                    <span>Lecturer: <strong>{period.facultyName}</strong></span>
                    <span>·</span>
                    <span className="font-mono text-slate-500">Room: {period.classroom}</span>
                  </div>

                  {period.exchangedWithFaculty && (
                    <div className="mt-1.5 p-2 rounded-lg bg-blue-950/50 border border-blue-800/60 text-xs text-blue-200">
                      ✦ Substituted by <strong>{period.exchangedWithFaculty}</strong> ({period.exchangedSubjectCode})
                    </div>
                  )}
                </div>

                {/* Bottom: 1-Tap Attendance Selection Buttons */}
                <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs font-semibold text-amber-400">
                    Select attendance for this class:
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Mark Present */}
                    <button
                      onClick={() => onPeriodStatusChange(period.id, 'present')}
                      className={`min-h-[42px] px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        isPresent
                          ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                          : 'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/40'
                      }`}
                    >
                      <Check className="w-4 h-4 stroke-[2.5]" />
                      <span>Mark Present (+1)</span>
                    </button>

                    {/* Mark Absent */}
                    <button
                      onClick={() => onPeriodStatusChange(period.id, 'absent')}
                      className={`min-h-[42px] px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        isAbsent
                          ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                          : 'bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/40'
                      }`}
                    >
                      <X className="w-4 h-4 stroke-[2.5]" />
                      <span>Mark Absent</span>
                    </button>

                    {/* Cancelled */}
                    <button
                      onClick={() => onPeriodStatusChange(period.id, 'cancelled')}
                      className={`min-h-[42px] px-3 rounded-xl text-xs font-medium transition-all flex items-center gap-1 ${
                        isCancelled
                          ? 'bg-slate-700 text-white'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700'
                      }`}
                      title="Class wasn't taken (doesn't hurt your %)"
                    >
                      <MinusCircle className="w-3.5 h-3.5" />
                      <span>Cancelled</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
