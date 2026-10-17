import React from 'react';
import {
  GraduationCap,
  Moon,
  Sun,
  Palette,
  LogOut,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { StudentProfile } from '../../types/portal';

interface PortalHeaderProps {
  profile: StudentProfile;
  overallPercentage: number;
  totalConducted: number;
  totalAttended: number;
  onLogout: () => void;
  onMassBunk: () => void;
  onGoToTomorrow: () => void;
  theme: string;
  setTheme: (t: string) => void;
  isDarkMode: boolean;
  setIsDarkMode: (d: boolean) => void;
}

export const PortalHeader: React.FC<PortalHeaderProps> = ({
  profile,
  overallPercentage,
  totalConducted,
  totalAttended,
  onLogout,
  onMassBunk,
  onGoToTomorrow,
  theme,
  setTheme,
  isDarkMode,
  setIsDarkMode
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#070e1e]/95 backdrop-blur-md border-b border-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Branding & Section Badge */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center font-bold shadow-xs shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>

          <div className="leading-tight">
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>{profile.semesterSection}</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              {profile.assignedClassroom.split(',')[0]}
            </div>
          </div>
        </div>

        {/* Center: Theme Selector, Dark Toggle, Quick Tomorrow */}
        <div className="hidden md:flex items-center gap-2.5">
          {/* Theme Color Dots */}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-[#0f1b33] border border-slate-800 text-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400">THEME:</span>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-blue-500 cursor-pointer ring-1 ring-white"></span>
              <span className="w-3 h-3 rounded-full bg-cyan-500 cursor-pointer"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-500 cursor-pointer"></span>
              <span className="w-3 h-3 rounded-full bg-purple-500 cursor-pointer"></span>
              <span className="w-3 h-3 rounded-full bg-pink-500 cursor-pointer"></span>
              <span className="w-3 h-3 rounded-full bg-amber-500 cursor-pointer"></span>
            </div>
          </div>

          {/* Theme preset selector */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#0f1b33] border border-slate-800 text-xs">
            <Palette className="w-3.5 h-3.5 text-cyan-400" />
            <select
              value={theme}
              onChange={e => setTheme(e.target.value)}
              className="bg-transparent text-xs text-white focus:outline-none cursor-pointer"
            >
              <option value="Nordic Ocean" className="bg-[#0f1b33]">Nordic Ocean</option>
              <option value="Midnight Slate" className="bg-[#0f1b33]">Midnight Slate</option>
              <option value="Cyber Emerald" className="bg-[#0f1b33]">Cyber Emerald</option>
            </select>
          </div>

          {/* Dark / Light Toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#0f1b33] border border-slate-800 text-xs text-slate-300 hover:text-white"
          >
            {isDarkMode ? <Moon className="w-3.5 h-3.5 text-indigo-400" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
            <span>{isDarkMode ? 'Dark' : 'Light'}</span>
          </button>

          {/* Tomorrow Shortcut */}
          <button
            onClick={onGoToTomorrow}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#0f1b33] border border-slate-800 text-xs text-slate-300 hover:text-white"
          >
            <Calendar className="w-3.5 h-3.5 text-blue-400" />
            <span>Tomorrow</span>
          </button>
        </div>

        {/* Right: Overall % Badge, Mass Bunk Button, Logout */}
        <div className="flex items-center gap-2">
          {/* Overall % Pill */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-[#0f1b33] border border-slate-800">
            <div className="text-right">
              <div className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">
                OVERALL
              </div>
              <div className="text-sm font-black font-mono leading-none text-white">
                {overallPercentage}%
              </div>
            </div>
            <div className="text-[10px] text-slate-400 border-l border-slate-700 pl-2 leading-tight">
              {totalConducted === 0 ? (
                <>EMPTY (0/0)<br />No classes logged yet</>
              ) : (
                <>{totalAttended}/{totalConducted} classes<br />Goal: {profile.minThreshold}%</>
              )}
            </div>
          </div>

          {/* Mass Bunk Button (Red) */}
          <button
            onClick={onMassBunk}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600/90 hover:bg-rose-600 text-white text-xs font-bold shadow-md shadow-rose-900/30 transition-transform active:scale-[0.98]"
            title="Mark entire day as Mass Bunk"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Mass Bunk</span>
          </button>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#0f1b33] hover:bg-[#152342] text-slate-300 hover:text-white text-xs border border-slate-800"
            title="Logout of student portal"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};
