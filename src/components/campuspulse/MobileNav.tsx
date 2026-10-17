import React from 'react';
import {
  LayoutGrid,
  CalendarDays,
  Calendar,
  BookOpen,
  BarChart3,
  Settings,
  AlertOctagon
} from 'lucide-react';
import { AppView, ThemePalette } from '../../types/campusPulse';
import { THEME_DEFINITIONS } from '../../utils/themeConfig';

interface MobileNavProps {
  activeView: AppView;
  onSelectView: (v: AppView) => void;
  onOpenMassBunk: () => void;
  currentTheme: ThemePalette;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeView,
  onSelectView,
  onOpenMassBunk,
  currentTheme
}) => {
  const theme = THEME_DEFINITIONS[currentTheme];

  const items: { id: AppView; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { id: 'timetable', label: 'Timetable', icon: CalendarDays },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'subjects', label: 'Subjects', icon: BookOpen },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0d1016]/95 backdrop-blur-md border-t border-[#1c2433] px-2 py-1.5 flex items-center justify-around">
      {items.map(item => {
        const Icon = item.icon;
        const isActive = activeView === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onSelectView(item.id)}
            className={`flex flex-col items-center justify-center p-2 rounded-xl text-[10px] font-bold transition-all min-w-[50px] ${
              isActive ? theme.activeText : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Icon className="w-4 h-4 mb-0.5" />
            <span>{item.label}</span>
          </button>
        );
      })}

      <button
        onClick={onOpenMassBunk}
        className="flex flex-col items-center justify-center p-2 rounded-xl text-[10px] font-bold text-rose-400"
      >
        <AlertOctagon className="w-4 h-4 text-rose-500 animate-pulse mb-0.5" />
        <span>Bunk</span>
      </button>
    </nav>
  );
};
