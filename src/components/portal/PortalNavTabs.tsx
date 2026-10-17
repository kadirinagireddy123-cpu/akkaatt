import React from 'react';
import {
  Calendar,
  CalendarDays,
  BookOpen,
  FlaskConical,
  ArrowLeftRight,
  History,
  FileSpreadsheet,
  Settings,
  Sparkles
} from 'lucide-react';

export type PortalTabId =
  | 'today'
  | 'tomorrow'
  | 'saturday'
  | 'subjects'
  | 'master'
  | 'lab'
  | 'exchanges'
  | 'calendar'
  | 'reports'
  | 'profile';

interface PortalNavTabsProps {
  activeTab: PortalTabId;
  onTabChange: (tab: PortalTabId) => void;
  todayCount: number;
  todayDayName: string;
}

export const PortalNavTabs: React.FC<PortalNavTabsProps> = ({
  activeTab,
  onTabChange,
  todayCount,
  todayDayName
}) => {
  const tabs: Array<{
    id: PortalTabId;
    label: string;
    icon: React.ReactNode;
    badge?: string;
  }> = [
    {
      id: 'today',
      label: "Today's Attendance",
      icon: <Calendar className="w-3.5 h-3.5" />,
      badge: `${todayDayName.slice(0, 3)} · ${todayCount}`
    },
    {
      id: 'tomorrow',
      label: 'Tomorrow',
      icon: <Calendar className="w-3.5 h-3.5" />,
      badge: 'Wed'
    },
    {
      id: 'saturday',
      label: 'Saturday Classes',
      icon: <Sparkles className="w-3.5 h-3.5" />
    },
    {
      id: 'subjects',
      label: 'Subjects & Punch',
      icon: <BookOpen className="w-3.5 h-3.5" />
    },
    {
      id: 'master',
      label: 'Master Timetable',
      icon: <CalendarDays className="w-3.5 h-3.5" />
    },
    {
      id: 'lab',
      label: 'Lab Hub',
      icon: <FlaskConical className="w-3.5 h-3.5" />,
      badge: 'B1'
    },
    {
      id: 'exchanges',
      label: 'Lecturer Exchanges',
      icon: <ArrowLeftRight className="w-3.5 h-3.5" />
    },
    {
      id: 'calendar',
      label: 'Calendar History',
      icon: <History className="w-3.5 h-3.5" />
    },
    {
      id: 'reports',
      label: 'Reports & Register',
      icon: <FileSpreadsheet className="w-3.5 h-3.5" />
    },
    {
      id: 'profile',
      label: 'Profile & Targets',
      icon: <Settings className="w-3.5 h-3.5" />
    }
  ];

  return (
    <div className="bg-[#0b1322] border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1.5 py-2 min-w-max">
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#131d31]'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
