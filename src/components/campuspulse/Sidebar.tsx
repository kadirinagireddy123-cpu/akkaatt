import React from 'react';
import {
  LayoutGrid,
  CalendarDays,
  Calendar,
  BookOpen,
  BarChart3,
  Download,
  Settings,
  AlertOctagon,
  Siren
} from 'lucide-react';
import { AppView, ThemePalette } from '../../types/campusPulse';
import { THEME_DEFINITIONS } from '../../utils/themeConfig';

import { LogOut } from 'lucide-react';

interface SidebarProps {
  activeView: AppView;
  onSelectView: (v: AppView) => void;
  onOpenMassBunk: () => void;
  currentTheme: ThemePalette;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onSelectView,
  onOpenMassBunk,
  currentTheme,
  onLogout
}) => {
  const theme = THEME_DEFINITIONS[currentTheme];

  const navItems: { id: AppView; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { id: 'timetable', label: "Today's Timetable", icon: CalendarDays },
    { id: 'weekly_timetable', label: 'Full Timetable Sheet', icon: BarChart3 },
    { id: 'calendar', label: 'Calendar & History', icon: Calendar },
    { id: 'subjects', label: 'Subject Attendance', icon: BookOpen },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'backup', label: 'Backup & Export', icon: Download },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <aside className="w-64 bg-[#0a0d13] border-r border-[#1a212e] p-4 flex flex-col gap-5 shrink-0 hidden lg:flex min-h-[calc(100vh-4rem)]">
      {/* Top Prominent MASS BUNK Callout Card */}
      <button
        onClick={onOpenMassBunk}
        className="w-full text-left p-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-lg shadow-rose-950/50 hover:brightness-110 active:scale-98 transition-all flex items-center justify-between group"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <AlertOctagon className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-xs font-black tracking-wide flex items-center gap-1.5 uppercase">
              <span>MASS BUNK</span>
            </div>
            <div className="text-[11px] text-white/80 font-medium">
              Multi-Class Bunk Tool
            </div>
          </div>
        </div>
        <Siren className="w-4 h-4 text-white/80 group-hover:animate-bounce" />
      </button>

      {/* Navigation Section */}
      <div className="space-y-1">
        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-2">
          NAVIGATION
        </div>

        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectView(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all text-left ${
                isActive
                  ? `${theme.activeBg} ${theme.glowClass}`
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#131924]'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-inherit' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Logout button at bottom of Sidebar */}
      {onLogout && (
        <div className="pt-3 mt-auto border-t border-[#1a212e]">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold text-rose-400 hover:text-rose-200 hover:bg-rose-950/40 border border-transparent hover:border-rose-900/60 transition-all text-left"
          >
            <LogOut className="w-4 h-4 shrink-0 text-rose-400" />
            <span>Logout Portal</span>
          </button>
        </div>
      )}
    </aside>
  );
};
