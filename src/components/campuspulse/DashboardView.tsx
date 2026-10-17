import React from 'react';
import {
  Calendar,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  AlertOctagon,
  ArrowRight,
  Palette,
  Check,
  X,
  MinusCircle,
  Sun,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import {
  AcademicSettings,
  CampusSubject,
  TimetablePeriodSlot,
  CampusAttendanceRecord,
  ThemePalette,
  AttendanceActionStatus,
  DayScheduleMode,
  WeekdayTimetableDay
} from '../../types/campusPulse';
import { THEME_DEFINITIONS } from '../../utils/themeConfig';
import {
  formatLocalDateLong,
  shiftDateDays,
  isDateToday,
  getTodayDateString,
  getDayOfWeek,
  getDateForDayInCurrentWeek
} from '../../utils/dateUtils';

interface DashboardViewProps {
  academicSettings: AcademicSettings;
  currentTheme: ThemePalette;
  onSelectTheme: (t: ThemePalette) => void;
  selectedDate: string;
  onSelectDate?: (d: string) => void;
  subjects: CampusSubject[];
  todaySlots: TimetablePeriodSlot[];
  records: CampusAttendanceRecord[];
  onMarkSlot: (slot: TimetablePeriodSlot, status: AttendanceActionStatus) => void;
  onOpenMassBunk: () => void;
  onNavigateToTimetable: () => void;
  onNavigateToFullTimetable: () => void;
  onResetToZero: () => void;
  scheduleMode?: DayScheduleMode;
  onSelectScheduleMode?: (mode: DayScheduleMode) => void;
  saturdayRoutineDay?: WeekdayTimetableDay;
  onSelectSaturdayRoutineDay?: (day: WeekdayTimetableDay) => void;
  onOpenSaturdayRoutineModal?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  academicSettings,
  currentTheme,
  onSelectTheme,
  selectedDate,
  onSelectDate,
  subjects,
  todaySlots,
  records,
  onMarkSlot,
  onOpenMassBunk,
  onNavigateToTimetable,
  onNavigateToFullTimetable,
  onResetToZero,
  scheduleMode = 'Normal Classes',
  onSelectScheduleMode,
  saturdayRoutineDay = 'Mon',
  onSelectSaturdayRoutineDay,
  onOpenSaturdayRoutineModal
}) => {
  const theme = THEME_DEFINITIONS[currentTheme];

  // Overall calculations across all valid attendance records
  const validRecords = records.filter(r => r.status !== 'cancelled' && r.status !== 'holiday');
  const totalConducted = validRecords.length;
  const totalPresent = validRecords.filter(r => r.status === 'present').length;
  const totalAbsent = validRecords.filter(r => r.status === 'absent').length;

  const overallPercentage =
    totalConducted > 0 ? Math.round((totalPresent / totalConducted) * 1000) / 10 : 0;

  // Today's classes calculations
  const todayRecords = records.filter(r => r.date === selectedDate);
  const classesTodayCount = todaySlots.length;
  const markedTodayCount = todaySlots.filter(s =>
    todayRecords.some(r => r.periodId === s.id && r.subjectCode === s.subjectCode)
  ).length;
  const presentTodayCount = todaySlots.filter(s =>
    todayRecords.some(
      r => r.periodId === s.id && r.subjectCode === s.subjectCode && r.status === 'present'
    )
  ).length;

  const vtuMin = academicSettings.minimumTargetPercent || 85;
  const safeCushion = academicSettings.safeThresholdPercent || 90;

  // Safe bunks overall to maintain VTU 85% minimum
  let overallSafeBunksFor85 = 0;
  if (totalConducted > 0 && overallPercentage >= vtuMin) {
    overallSafeBunksFor85 = Math.max(0, Math.floor(totalPresent / (vtuMin / 100) - totalConducted));
  }

  // Consecutive classes needed overall to cross 85% VTU minimum
  let overallNeededFor85 = 0;
  if (totalConducted > 0 && overallPercentage < vtuMin) {
    overallNeededFor85 = Math.max(0, Math.ceil(((vtuMin / 100) * totalConducted - totalPresent) / (1 - (vtuMin / 100))));
  }

  // Consecutive classes needed overall to reach 90% Safe Cushion
  let overallNeededFor90 = 0;
  if (totalConducted > 0 && overallPercentage < safeCushion) {
    overallNeededFor90 = Math.max(0, Math.ceil(((safeCushion / 100) * totalConducted - totalPresent) / (1 - (safeCushion / 100))));
  }

  // Safe bunks overall for 90% cushion
  let overallSafeBunksFor90 = 0;
  if (totalConducted > 0 && overallPercentage >= safeCushion) {
    overallSafeBunksFor90 = Math.max(0, Math.floor(totalPresent / (safeCushion / 100) - totalConducted));
  }

  // Subject-wise analytics
  const subjectAnalytics = subjects.map(sub => {
    const subRecords = validRecords.filter(r => r.subjectCode === sub.code);
    const conducted = subRecords.length;
    const present = subRecords.filter(r => r.status === 'present').length;
    const absent = subRecords.filter(r => r.status === 'absent').length;
    const pct = conducted > 0 ? Math.round((present / conducted) * 1000) / 10 : 0;

    // Consecutive classes needed to reach 85% VTU minimum
    let neededFor85 = 0;
    if (conducted > 0 && pct < vtuMin) {
      neededFor85 = Math.max(0, Math.ceil(((vtuMin / 100) * conducted - present) / (1 - (vtuMin / 100))));
    }

    // Consecutive classes needed to reach 90% Safe Cushion
    let neededFor90 = 0;
    if (conducted > 0 && pct < safeCushion) {
      neededFor90 = Math.max(0, Math.ceil(((safeCushion / 100) * conducted - present) / (1 - (safeCushion / 100))));
    }

    // Safe bunks to maintain 85% VTU minimum
    let safeBunksFor85 = 0;
    if (conducted > 0 && pct >= vtuMin) {
      safeBunksFor85 = Math.max(0, Math.floor(present / (vtuMin / 100) - conducted));
    }

    // Safe bunks to maintain 90% Safe Cushion
    let safeBunksFor90 = 0;
    if (conducted > 0 && pct >= safeCushion) {
      safeBunksFor90 = Math.max(0, Math.floor(present / (safeCushion / 100) - conducted));
    }

    const isBelow85 = conducted > 0 && pct < vtuMin;
    const isWarning85to90 = conducted > 0 && pct >= vtuMin && pct < safeCushion;
    const isSafeCushion = conducted === 0 || pct >= safeCushion;

    return {
      ...sub,
      conducted,
      present,
      absent,
      percentage: pct,
      neededFor85,
      neededFor90,
      safeBunksFor85,
      safeBunksFor90,
      isBelow85,
      isWarning85to90,
      isSafeCushion
    };
  });

  const shortage85Count = subjectAnalytics.filter(s => s.isBelow85).length;
  const warning85to90Count = subjectAnalytics.filter(s => s.isWarning85to90).length;
  const safeCushionCount = subjectAnalytics.filter(s => s.isSafeCushion).length;
  const recoveryAlerts = subjectAnalytics.filter(s => s.conducted > 0 && s.percentage < safeCushion);

  const formattedDate = formatLocalDateLong(selectedDate);
  const isToday = isDateToday(selectedDate);
  const dayName = getDayOfWeek(selectedDate);

  const getSlotStatus = (slot: TimetablePeriodSlot): AttendanceActionStatus | 'unmarked' => {
    const match = todayRecords.find(
      r => r.periodId === slot.id && r.subjectCode === slot.subjectCode
    );
    return match ? match.status : 'unmarked';
  };

  return (
    <div className="space-y-6">
      {/* 1. WELCOME CARD (Screenshot 1 top banner) */}
      <div className="bg-[#10141d] border border-[#1e2637] rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-xl bg-[#00a8ff] text-slate-950 font-black text-xs uppercase tracking-wider shadow-sm shadow-[#00a8ff]/30">
              {academicSettings.department}
            </span>
            <span className="px-3 py-1 rounded-xl bg-[#1b2333] text-slate-200 font-bold text-xs uppercase tracking-wider border border-[#2a364e]">
              {academicSettings.semesterSection}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Welcome back, {academicSettings.studentName}
          </h1>

          <p className="text-xs text-slate-400 flex flex-wrap items-center gap-2">
            <span>📍 Classroom: {academicSettings.classroomLocation}</span>
            <span>•</span>
            <span>🗓️ Timetable Effective: {academicSettings.timetableEffectiveDate}</span>
          </p>
        </div>

        {/* Right Date Card with Interactive Switcher */}
        <div className="bg-[#151c28] border border-[#232f46] rounded-2xl p-4 shrink-0 flex flex-col justify-between gap-3 min-w-[260px]">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-slate-400">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isToday ? "Today's Attendance" : 'Selected Date'}</span>
            </div>
            {isToday ? (
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                LIVE TODAY
              </span>
            ) : (
              onSelectDate && (
                <button
                  onClick={() => onSelectDate(getTodayDateString())}
                  className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#1e2738] hover:bg-cyan-950 text-cyan-400 hover:text-cyan-300 border border-[#2b3952] transition-colors"
                >
                  Jump to Today
                </button>
              )
            )}
          </div>

          <div className="flex items-center justify-between gap-2">
            {onSelectDate && (
              <button
                onClick={() => onSelectDate(shiftDateDays(selectedDate, -1))}
                className="w-8 h-8 rounded-xl bg-[#1b2333] border border-[#26334a] hover:bg-[#222d42] text-slate-300 flex items-center justify-center transition-colors shrink-0"
                title="Previous Day"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}

            <div className="text-center flex-1 px-1">
              <div className="text-xs sm:text-sm font-extrabold text-white">
                {formattedDate}
              </div>
              {onSelectDate && (
                <div className="mt-1 flex items-center justify-center">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={e => e.target.value && onSelectDate(e.target.value)}
                    className="bg-[#10141d] border border-[#222c3d] text-[11px] font-mono font-bold text-cyan-300 px-2.5 py-1 rounded-lg focus:outline-none focus:border-cyan-500 cursor-pointer"
                  />
                </div>
              )}
            </div>

            {onSelectDate && (
              <button
                onClick={() => onSelectDate(shiftDateDays(selectedDate, 1))}
                className="w-8 h-8 rounded-xl bg-[#1b2333] border border-[#26334a] hover:bg-[#222d42] text-slate-300 flex items-center justify-center transition-colors shrink-0"
                title="Next Day"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. THEME CUSTOMIZATION BAR (Screenshot 1) */}
      <div className="bg-[#10141d] border border-[#1e2637] rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#182030] flex items-center justify-center text-slate-300 shrink-0">
            <Palette className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">Customize CampusPulse UI Palette</span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                SUGGESTED THEMES
              </span>
            </div>
            <p className="text-slate-400 text-[11px] mt-0.5">
              Tap to preview Crimson Red, Emerald Green, Amber Orange, or Indigo before finalizing
            </p>
          </div>
        </div>

        {/* Quick Theme Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onSelectTheme('crimson')}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
              currentTheme === 'crimson'
                ? 'bg-rose-600 border-rose-500 text-white shadow-md shadow-rose-900/50'
                : 'bg-[#151b27] border-[#253046] text-slate-300 hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            <span>Crimson Red</span>
          </button>

          <button
            onClick={() => onSelectTheme('emerald')}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
              currentTheme === 'emerald'
                ? 'bg-emerald-600 border-emerald-500 text-white shadow-md shadow-emerald-900/50'
                : 'bg-[#151b27] border-[#253046] text-slate-300 hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Emerald Green</span>
          </button>

          <button
            onClick={() => onSelectTheme('amber')}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
              currentTheme === 'amber'
                ? 'bg-amber-600 border-amber-500 text-white shadow-md shadow-amber-900/50'
                : 'bg-[#151b27] border-[#253046] text-slate-300 hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>Amber Orange</span>
          </button>

          <button
            onClick={() => onSelectTheme('indigo')}
            className="px-3 py-1.5 rounded-xl bg-[#151b27] border border-[#253046] text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>More Themes</span>
          </button>
        </div>
      </div>

      {/* 2.5 DEDICATED VTU 85% MINIMUM & 90% SAFE CUSHION INDICATORS */}
      <div className="bg-[#10141d] border border-[#1e2637] rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1b2333]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-white">VTU Attendance Rule &amp; Safe Cushion Indicators</h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#1e2637] text-slate-300 border border-[#2b364e]">
                  Autonomous Regulations
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                VTU mandates 85% statutory minimum attendance. A 90% target provides a safe cushion against exam detention.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-extrabold bg-rose-950/70 text-rose-300 border border-rose-800">
              VTU Min: 85%
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-extrabold bg-emerald-950/70 text-emerald-300 border border-emerald-800">
              Safe Cushion: 90%
            </span>
          </div>
        </div>

        {/* 3 Status Panels */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* Panel 1: VTU 85% Minimum Status */}
          <div className={`p-4 rounded-2xl border flex flex-col justify-between space-y-3 ${
            shortage85Count > 0 || (totalConducted > 0 && overallPercentage < vtuMin)
              ? 'bg-rose-950/30 border-rose-800/80'
              : 'bg-[#141a27] border-[#222c40]'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                1. VTU 85% Statutory Rule
              </span>
              <span className={`text-[10px] font-mono font-extrabold px-2 py-0.5 rounded ${
                totalConducted === 0
                  ? 'bg-slate-800 text-slate-300'
                  : overallPercentage < vtuMin
                  ? 'bg-rose-900 text-rose-200 animate-pulse'
                  : 'bg-emerald-900/80 text-emerald-200'
              }`}>
                {totalConducted === 0 ? 'CLEAN (0.0%)' : overallPercentage < vtuMin ? 'DETENTION RISK' : 'COMPLIANT'}
              </span>
            </div>

            <div className="space-y-1">
              <div className="text-xl font-black text-white flex items-baseline gap-2">
                <span>{overallPercentage}%</span>
                <span className="text-xs text-slate-400 font-normal">/ 85.0% floor</span>
              </div>
              <p className="text-xs text-slate-300 leading-snug">
                {totalConducted === 0
                  ? 'New semester clean slate. Maintain ≥85% across all subjects.'
                  : overallPercentage < vtuMin
                  ? `Shortage of ${(vtuMin - overallPercentage).toFixed(1)}%. Need ${overallNeededFor85} consecutive presents to clear detention!`
                  : `Safely above VTU floor by +${(overallPercentage - vtuMin).toFixed(1)}%.`}
              </p>
            </div>

            <div className="text-[11px] font-semibold text-rose-400/90 pt-2 border-t border-[#20293d]">
              {shortage85Count > 0 ? `⚠️ ${shortage85Count} subject(s) in shortage (<85%)` : '✓ 0 subjects in VTU shortage'}
            </div>
          </div>

          {/* Panel 2: 90% Safe Cushion Status */}
          <div className={`p-4 rounded-2xl border flex flex-col justify-between space-y-3 ${
            totalConducted > 0 && overallPercentage >= safeCushion
              ? 'bg-emerald-950/30 border-emerald-800/80'
              : 'bg-[#141a27] border-[#222c40]'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                2. 90% Safe Cushion Zone
              </span>
              <span className={`text-[10px] font-mono font-extrabold px-2 py-0.5 rounded ${
                totalConducted === 0
                  ? 'bg-slate-800 text-slate-300'
                  : overallPercentage >= safeCushion
                  ? 'bg-emerald-900 text-emerald-200'
                  : 'bg-amber-900/80 text-amber-200'
              }`}>
                {totalConducted === 0 ? 'TARGET 90%' : overallPercentage >= safeCushion ? 'CUSHION ACTIVE' : 'THIN MARGIN'}
              </span>
            </div>

            <div className="space-y-1">
              <div className="text-xl font-black text-white flex items-baseline gap-2">
                <span>{overallPercentage}%</span>
                <span className="text-xs text-slate-400 font-normal">/ 90.0% cushion</span>
              </div>
              <p className="text-xs text-slate-300 leading-snug">
                {totalConducted === 0
                  ? 'Aim for ≥90% to maintain comfortable emergency leave tolerance.'
                  : overallPercentage >= safeCushion
                  ? `Comfortable safety cushion of +${(overallPercentage - safeCushion).toFixed(1)}% above target.`
                  : `Need ${overallNeededFor90} consecutive presents to establish 90% cushion.`}
              </p>
            </div>

            <div className="text-[11px] font-semibold text-emerald-400/90 pt-2 border-t border-[#20293d]">
              {safeCushionCount} subject(s) safely cushioned (≥90%)
            </div>
          </div>

          {/* Panel 3: Safe Bunk Tolerance Calculator */}
          <div className="p-4 rounded-2xl bg-[#141a27] border border-[#222c40] flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                3. Bunk Buffer Allowance
              </span>
              <span className="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                VTU CALC
              </span>
            </div>

            <div className="space-y-1">
              <div className="text-xl font-black text-white flex items-baseline gap-2">
                <span className="text-emerald-400 font-mono font-black">{overallSafeBunksFor85}</span>
                <span className="text-xs text-slate-300 font-normal">safe bunks allowed</span>
              </div>
              <p className="text-xs text-slate-300 leading-snug">
                {totalConducted === 0
                  ? 'Clean semester: Zero classes conducted yet. Bunk allowance unlocks after classes are logged.'
                  : overallSafeBunksFor85 > 0
                  ? `You can safely miss ${overallSafeBunksFor85} class(es) while strictly remaining above the 85% VTU minimum.`
                  : overallPercentage < vtuMin
                  ? '0 safe bunks available. Must attend upcoming classes consecutively.'
                  : 'Thin margin! Next absence will push you close to or below 85% VTU limit.'}
              </p>
            </div>

            <div className="text-[11px] font-semibold text-cyan-300 pt-2 border-t border-[#20293d] flex items-center justify-between">
              <span>Warning zone (85-89%):</span>
              <span className="font-mono font-bold text-amber-300">{warning85to90Count} subjects</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. METRICS GRID - 5 CARDS ROW (Screenshot 1) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Card 1: OVERALL ATTENDANCE */}
        <div className="bg-[#10141d] border border-[#1e2637] rounded-3xl p-5 shadow-lg flex flex-col justify-between sm:col-span-2 lg:col-span-1">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                OVERALL ATTENDANCE
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                overallPercentage >= safeCushion
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                  : overallPercentage >= vtuMin
                  ? 'bg-amber-950/80 text-amber-300 border border-amber-800'
                  : 'bg-rose-950/80 text-rose-300 border border-rose-800'
              }`}>
                {totalConducted === 0
                  ? '● CLEAN SLATE'
                  : overallPercentage >= safeCushion
                  ? '● SAFE CUSHION (≥90%)'
                  : overallPercentage >= vtuMin
                  ? '● THIN MARGIN (85-89%)'
                  : '● VTU SHORTAGE (<85%)'}
              </span>
            </div>

            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-4xl font-black font-mono tracking-tight text-white">
                {overallPercentage}%
              </span>
              <span className="text-xs text-slate-400 font-semibold">
                VTU Min: {vtuMin}%
              </span>
            </div>

            {/* Custom Milestone Progress Bar with 85% & 90% indicators */}
            <div className="mt-3 space-y-1">
              <div className="w-full bg-[#1c2434] h-2.5 rounded-full overflow-hidden relative">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    overallPercentage >= safeCushion
                      ? 'bg-emerald-400'
                      : overallPercentage >= vtuMin
                      ? 'bg-amber-400'
                      : 'bg-rose-500'
                  }`}
                  style={{ width: `${Math.min(100, overallPercentage)}%` }}
                />
              </div>

              <div className="flex justify-between text-[9px] font-mono font-bold text-slate-500 pt-0.5">
                <span>0%</span>
                <span className="text-rose-400">{vtuMin}% VTU Min</span>
                <span className="text-emerald-400">{safeCushion}% Safe</span>
                <span>100%</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#1b2333] grid grid-cols-3 text-center text-xs font-mono">
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-bold">CONDUCTED</div>
              <div className="text-white font-extrabold text-sm">{totalConducted}</div>
            </div>
            <div>
              <div className="text-[10px] text-emerald-400 uppercase font-bold">PRESENT</div>
              <div className="text-emerald-400 font-extrabold text-sm">{totalPresent}</div>
            </div>
            <div>
              <div className="text-[10px] text-rose-400 uppercase font-bold">ABSENT</div>
              <div className="text-rose-400 font-extrabold text-sm">{totalAbsent}</div>
            </div>
          </div>
        </div>

        {/* Card 2: CLASSES TODAY */}
        <div className="bg-[#10141d] border border-[#1e2637] rounded-3xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <span>CLASSES TODAY</span>
              <Clock className="w-4 h-4 text-slate-500" />
            </div>
            <div className="text-4xl font-black font-mono text-white mt-3">
              {classesTodayCount}
            </div>
          </div>
          <div className="text-xs text-slate-400 font-medium pt-3 border-t border-[#1b2333]">
            {markedTodayCount} of {classesTodayCount} marked
          </div>
        </div>

        {/* Card 3: PRESENT TODAY */}
        <div className="bg-[#10141d] border border-[#1e2637] rounded-3xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <span>PRESENT TODAY</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-4xl font-black font-mono text-emerald-400 mt-3">
              {presentTodayCount}
            </div>
          </div>
          <div className="text-xs text-slate-400 font-medium pt-3 border-t border-[#1b2333]">
            Classes attended
          </div>
        </div>

        {/* Card 4: VTU SHORTAGE (< 85%) */}
        <div className="bg-[#10141d] border border-[#1e2637] rounded-3xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <span>VTU SHORTAGE (&lt; 85%)</span>
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            </div>
            <div className={`text-4xl font-black font-mono mt-3 ${shortage85Count > 0 ? 'text-rose-500 animate-pulse' : 'text-white'}`}>
              {shortage85Count}
            </div>
          </div>
          <div className={`text-xs font-medium pt-3 border-t border-[#1b2333] ${shortage85Count > 0 ? 'text-rose-400 font-bold' : 'text-slate-400'}`}>
            {shortage85Count > 0 ? `${shortage85Count} subject(s) in detention risk` : 'No VTU shortages'}
          </div>
        </div>

        {/* Card 5: SAFE CUSHION (≥ 90%) */}
        <div className="bg-[#10141d] border border-[#1e2637] rounded-3xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <span>SAFE CUSHION (≥ 90%)</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-4xl font-black font-mono mt-3 text-emerald-400">
              {safeCushionCount}
            </div>
          </div>
          <div className="text-xs font-medium pt-3 border-t border-[#1b2333] text-emerald-400/90 font-medium">
            {warning85to90Count > 0 ? `${warning85to90Count} in warning zone (85-89%)` : 'Meeting 90% safe buffer'}
          </div>
        </div>
      </div>

      {/* 4. MASS BUNK BANNER CALLOUT (Screenshot 1) */}
      <div className="rounded-3xl p-5 bg-gradient-to-r from-[#200f14] via-[#1a0c10] to-[#12080a] border border-rose-900/50 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-600/20 border border-rose-500/40 text-rose-500 flex items-center justify-center shrink-0 shadow-lg shadow-rose-950">
            <AlertOctagon className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white">
              Need to mass bunk today or an upcoming day?
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Select multiple classes together with automatic safe bunk & percentage drop projections.
            </p>
          </div>
        </div>

        <button
          onClick={onOpenMassBunk}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:brightness-110 text-white font-extrabold text-xs tracking-wider shadow-lg shadow-rose-950 flex items-center justify-center gap-2 shrink-0 transition-transform active:scale-98"
        >
          <AlertOctagon className="w-4 h-4" />
          <span>Launch Mass Bunk</span>
        </button>
      </div>

      {/* 5. ATTENDANCE RECOVERY & ALERTS (Screenshot 1) */}
      <div className="bg-[#10141d] border border-[#1e2637] rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-rose-400 uppercase tracking-wider">
          <AlertTriangle className="w-4 h-4" />
          <span>ATTENDANCE RECOVERY & ALERTS</span>
        </div>

        {recoveryAlerts.length === 0 ? (
          <div className="p-4 rounded-2xl bg-[#161c28] border border-[#232e42] text-xs text-slate-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              {totalConducted === 0
                ? 'Clean slate: No classes recorded yet. All subject analytics are at 0%.'
                : 'All subjects are currently above the 85% safe attendance cushion. No recovery alerts!'}
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {recoveryAlerts.map(sub => (
              <div
                key={sub.code}
                className="p-4 rounded-2xl bg-[#151b27] border border-amber-500/30 space-y-2 shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-sm font-black text-white">{sub.code}</span>
                    <div className="text-xs text-slate-400 mt-0.5">{sub.name}</div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold font-mono text-xs border border-amber-500/30">
                    {sub.percentage}% (Warning)
                  </span>
                </div>

                <div className="pt-2 text-xs text-amber-400/90 font-medium">
                  Need <strong>{sub.neededFor85} presents</strong> for 85% VTU • Safe:{' '}
                  <strong>{sub.safeBunksFor85} bunks</strong> (≥85% VTU rule)
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 6. TODAY'S SCHEDULED CLASSES (Screenshot 1 & 2) */}
      <div className="bg-[#10141d] border border-[#1e2637] rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-extrabold text-white">
              {isToday ? "Today's Scheduled Classes" : `Scheduled Classes for ${dayName}`} ({todaySlots.length})
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Only periods present in the official timetable appear here • Blank slots are excluded
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onResetToZero}
              className="text-xs font-bold px-3 py-1.5 rounded-xl bg-[#171d2b] border border-[#273449] hover:bg-rose-950/40 hover:text-rose-300 text-slate-300 transition-colors"
              title="Reset all attendance back to zero"
            >
              Reset to 0%
            </button>
            <button
              onClick={onNavigateToFullTimetable}
              className="text-xs font-bold px-3 py-1.5 rounded-xl bg-cyan-950/40 border border-cyan-800 text-cyan-300 hover:bg-cyan-900/60 transition-colors flex items-center gap-1.5"
            >
              <span>Master Timetable Sheet</span>
            </button>
            <button
              onClick={onNavigateToTimetable}
              className="text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors px-2 py-1.5"
            >
              <span>Today View</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Working Saturday Timetable Banner when on Saturday */}
        {dayName === 'Sat' && (
          <div className="mb-4 bg-gradient-to-r from-blue-950/70 via-[#131b2c] to-indigo-950/70 border border-blue-500/40 rounded-2xl p-4 text-white flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-lg">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40 px-2 py-0.5 rounded">
                  SATURDAY CLASS SCHEDULE
                </span>
                <span className="text-xs font-bold text-cyan-300">
                  {scheduleMode === 'Normal Classes'
                    ? `Active Routine: ${saturdayRoutineDay === 'Mon' ? 'Monday' : saturdayRoutineDay === 'Tue' ? 'Tuesday' : saturdayRoutineDay === 'Wed' ? 'Wednesday' : saturdayRoutineDay === 'Thu' ? 'Thursday' : 'Friday'} Timetable`
                    : `Mode: ${scheduleMode}`}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                {scheduleMode === 'Normal Classes'
                  ? "Which day's timetable applies this Saturday? Quick switch:"
                  : `Saturday is set to ${scheduleMode}. Switch back to Normal Classes to follow weekday routine.`}
              </p>
            </div>

            {scheduleMode === 'Normal Classes' ? (
              <div className="flex items-center gap-1.5 flex-wrap">
                {(['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] as const).map(d => {
                  const isActive = saturdayRoutineDay === d;
                  return (
                    <button
                      key={d}
                      onClick={() => onSelectSaturdayRoutineDay?.(d)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white border border-cyan-400 shadow-md ring-1 ring-cyan-400/50'
                          : 'bg-[#151c2a] text-slate-300 hover:text-white border border-[#232f46]'
                      }`}
                    >
                      {d}
                    </button>
                  );
                })}
                {onOpenSaturdayRoutineModal && (
                  <button
                    onClick={onOpenSaturdayRoutineModal}
                    className="px-3 py-1.5 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-700 text-cyan-300 text-xs font-bold transition-colors ml-1"
                  >
                    Change Timetable
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={() => onSelectScheduleMode?.('Normal Classes')}
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors"
              >
                Switch to Normal Classes
              </button>
            )}
          </div>
        )}

        {todaySlots.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-[#141924] border border-[#21293c] text-slate-400 space-y-3">
            <div className="text-sm font-bold text-slate-200">
              No classes mentioned in timetable for this day ({dayName})!
            </div>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Per timetable rules, free slots and unscheduled days are not counted in attendance. Switch to a weekday to view and mark scheduled classes:
            </p>
            {onSelectDate && (
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                {(['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] as const).map(day => (
                  <button
                    key={day}
                    onClick={() => onSelectDate(getDateForDayInCurrentWeek(day, selectedDate))}
                    className="px-3 py-1.5 rounded-xl bg-[#1a2233] hover:bg-cyan-950 border border-[#29364f] text-cyan-300 font-bold text-xs transition-colors"
                  >
                    View {day} Classes
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
        <div className="space-y-3">
          {todaySlots.map(slot => {
            const currentStatus = getSlotStatus(slot);

            return (
              <div
                key={slot.id}
                className="p-4 rounded-2xl bg-[#141924] border border-[#21293c] flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-[#2f3b54]"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-400">
                      {slot.timeRange}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#1f2638] text-slate-300">
                      {slot.durationMinutes} min
                    </span>
                    {slot.isBlock && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                        100-min Block
                      </span>
                    )}
                    {slot.isLab && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                        Lab
                      </span>
                    )}
                  </div>

                  <div className="text-base font-black text-white mt-1">
                    {slot.subjectCode}{' '}
                    <span className="text-xs font-normal text-slate-400 font-sans">
                      {slot.subjectName}
                    </span>
                  </div>

                  {slot.noteTag && (
                    <div className="text-[11px] text-purple-400/90 font-medium mt-1">
                      {slot.noteTag}
                    </div>
                  )}
                </div>

                {/* 4 Action Buttons matching Screenshot 2 */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onMarkSlot(slot, 'present')}
                    className={`min-h-[40px] px-3.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all ${
                      currentStatus === 'present'
                        ? 'bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-950'
                        : 'bg-[#1a2130] text-slate-300 hover:bg-emerald-950 hover:text-emerald-300'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Present</span>
                  </button>

                  <button
                    onClick={() => onMarkSlot(slot, 'absent')}
                    className={`min-h-[40px] px-3.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all ${
                      currentStatus === 'absent'
                        ? 'bg-rose-600 text-white shadow-md shadow-rose-950'
                        : 'bg-[#1a2130] text-slate-300 hover:bg-rose-950 hover:text-rose-300'
                    }`}
                  >
                    <X className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Absent</span>
                  </button>

                  <button
                    onClick={() => onMarkSlot(slot, 'cancelled')}
                    className={`min-h-[40px] px-2.5 rounded-xl text-xs font-medium flex items-center gap-1 transition-all ${
                      currentStatus === 'cancelled'
                        ? 'bg-slate-600 text-white'
                        : 'bg-[#1a2130] text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <MinusCircle className="w-3.5 h-3.5" />
                    <span>Cancelled</span>
                  </button>

                  <button
                    onClick={() => onMarkSlot(slot, 'holiday')}
                    className={`min-h-[40px] px-2.5 rounded-xl text-xs font-medium flex items-center gap-1 transition-all ${
                      currentStatus === 'holiday'
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-[#1a2130] text-slate-400 hover:text-amber-400'
                    }`}
                  >
                    <Sun className="w-3.5 h-3.5" />
                    <span>Holiday</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        )}
      </div>
    </div>
  );
};
