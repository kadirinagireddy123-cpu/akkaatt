import React, { useState } from 'react';
import {
  Activity,
  Sun,
  Moon,
  AlertOctagon,
  Calendar,
  User,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  LogOut,
  ShieldCheck
} from 'lucide-react';
import { ThemePalette, AppearanceMode, AcademicSettings } from '../../types/campusPulse';
import { THEME_DEFINITIONS } from '../../utils/themeConfig';
import {
  formatLocalDateMedium,
  formatLocalDateShort,
  shiftDateDays,
  isDateToday,
  getTodayDateString
} from '../../utils/dateUtils';

interface TopHeaderProps {
  currentTheme: ThemePalette;
  onSelectTheme: (t: ThemePalette) => void;
  appearanceMode: AppearanceMode;
  onToggleAppearance: () => void;
  onOpenMassBunk: () => void;
  onResetToZero?: () => void;
  onLogout?: () => void;
  selectedDate: string;
  onSelectDate?: (d: string) => void;
  academicSettings: AcademicSettings;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  currentTheme,
  onSelectTheme,
  appearanceMode,
  onToggleAppearance,
  onOpenMassBunk,
  onResetToZero,
  onLogout,
  selectedDate,
  onSelectDate,
  academicSettings
}) => {
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const theme = THEME_DEFINITIONS[currentTheme];
  const isToday = isDateToday(selectedDate);
  const formattedDate = formatLocalDateMedium(selectedDate);

  return (
    <header className="sticky top-0 z-30 bg-[#0d1016]/95 backdrop-blur-md border-b border-[#1b2230] px-4 lg:px-6 h-16 flex items-center justify-between gap-4">
      {/* Brand & Class Info */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#00a8ff] flex items-center justify-center text-white shadow-md shadow-[#00a8ff]/30 shrink-0">
          <Activity className="w-6 h-6 stroke-[2.5]" />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="text-base font-extrabold tracking-tight text-white">
              CampusPulse
            </span>
            <span className="text-[10px] font-mono font-bold bg-[#1e2534] text-slate-300 px-2 py-0.5 rounded border border-[#2a3449]">
              {academicSettings.semesterSection}
            </span>
            <span className="text-[10px] font-mono font-black bg-rose-950/80 text-rose-300 px-2 py-0.5 rounded border border-rose-800 hidden sm:inline-block">
              VTU 85% Min
            </span>
            <span className="text-[10px] font-mono font-black bg-emerald-950/80 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800">
              90% Cushion
            </span>
          </div>
          <p className="text-[11px] text-slate-400 hidden sm:block">
            {academicSettings.department} • {academicSettings.classroomLocation}
          </p>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Theme Picker Dropdown */}
        <div className="relative">
          <button
            onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
            className="h-9 px-3 rounded-full bg-[#161c28] border border-[#263147] hover:border-slate-500 text-xs font-semibold text-slate-200 flex items-center gap-2 transition-colors"
          >
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: theme.dotColor }}
            />
            <span className="hidden md:inline">{theme.name}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {themeDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-[#121620] border border-[#242e42] p-1.5 shadow-2xl z-50">
              <div className="text-[10px] uppercase font-bold text-slate-400 px-2.5 py-1">
                Select UI Palette
              </div>
              {Object.values(THEME_DEFINITIONS).map(t => (
                <button
                  key={t.id}
                  onClick={() => {
                    onSelectTheme(t.id);
                    setThemeDropdownOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-left transition-colors ${
                    currentTheme === t.id
                      ? 'bg-[#1e2638] text-white'
                      : 'text-slate-300 hover:bg-[#181f2f]'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: t.dotColor }}
                  />
                  <span>{t.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Theme Mode Toggle (Sun/Moon) */}
        <button
          onClick={onToggleAppearance}
          className="w-9 h-9 rounded-full bg-[#161c28] border border-[#263147] text-amber-400 hover:text-amber-300 flex items-center justify-center transition-colors"
          title="Toggle Theme Mode"
        >
          {appearanceMode === 'dark' ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4 text-slate-300" />
          )}
        </button>

        {/* Reset All to 0% Button */}
        {onResetToZero && (
          <button
            onClick={onResetToZero}
            className="h-9 px-3 rounded-full bg-[#161c28] border border-[#263147] hover:border-rose-500/70 hover:text-rose-300 text-slate-300 text-xs font-bold transition-colors hidden sm:flex items-center gap-1"
            title="Reset all attendance back to zero (clean semester)"
          >
            <span>Reset 0%</span>
          </button>
        )}

        {/* Top MASS BUNK Pill Button */}
        <button
          onClick={onOpenMassBunk}
          className="h-9 px-3 sm:px-3.5 rounded-full bg-rose-950/60 border border-rose-600/70 text-rose-300 hover:bg-rose-900/80 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm shadow-rose-950"
        >
          <AlertOctagon className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
          <span>MASS BUNK</span>
        </button>

        {/* Interactive Date Switcher */}
        <div className="h-9 px-1.5 sm:px-2 rounded-full bg-[#161c28] border border-[#263147] text-xs font-medium text-slate-300 flex items-center gap-1 sm:gap-1.5 shadow-sm">
          {onSelectDate && (
            <button
              onClick={() => onSelectDate(shiftDateDays(selectedDate, -1))}
              className="w-6 h-6 rounded-full hover:bg-[#232d40] text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              title="Previous Day"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          )}

          <div className="relative flex items-center gap-1.5 px-1">
            <Calendar className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            {onSelectDate ? (
              <input
                type="date"
                value={selectedDate}
                onChange={e => e.target.value && onSelectDate(e.target.value)}
                className="bg-transparent text-white font-mono font-bold text-xs cursor-pointer focus:outline-none w-[112px] sm:w-[118px]"
                title="Click to select any date"
              />
            ) : (
              <span className="font-bold text-white text-xs">{formattedDate}</span>
            )}
          </div>

          {onSelectDate && (
            <button
              onClick={() => onSelectDate(shiftDateDays(selectedDate, 1))}
              className="w-6 h-6 rounded-full hover:bg-[#232d40] text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              title="Next Day"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}

          {onSelectDate && !isToday && (
            <button
              onClick={() => onSelectDate(getTodayDateString())}
              className="px-2 py-0.5 rounded-full bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 font-extrabold text-[10px] uppercase transition-colors"
              title="Jump to Today's date"
            >
              Today
            </button>
          )}
        </div>

        {/* User Pill */}
        <div className="h-9 pl-1 pr-3 rounded-full bg-[#161c28] border border-[#263147] flex items-center gap-2 text-xs font-bold text-white">
          <div className="w-7 h-7 rounded-full bg-[#273248] text-slate-200 flex items-center justify-center font-black text-xs">
            {academicSettings.studentName.charAt(0)}
          </div>
          <span className="hidden sm:inline">{academicSettings.studentName}</span>
        </div>

        {/* Logout Button */}
        {onLogout && (
          <button
            onClick={onLogout}
            className="h-9 px-3 rounded-full bg-[#161c28] border border-[#263147] hover:border-rose-500/80 hover:bg-rose-950/40 text-rose-300 text-xs font-bold transition-all flex items-center gap-1.5"
            title="Log out and return to login page"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        )}
      </div>
    </header>
  );
};
