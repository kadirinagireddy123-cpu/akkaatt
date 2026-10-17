import React from 'react';
import { User } from '../../types';
import {
  CalendarDays,
  ClipboardCheck,
  FileText,
  FlaskConical,
  GraduationCap,
  Users
} from 'lucide-react';

interface BottomNavProps {
  currentUser: User;
  activeView: string;
  onViewChange: (view: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentUser,
  activeView,
  onViewChange
}) => {
  const getRoleLabel = () => {
    switch (currentUser.role) {
      case 'faculty':
        return 'Register';
      case 'student':
        return 'Student';
      case 'proctor':
        return 'Proctor';
      case 'admin':
        return 'Admin';
    }
  };

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800">
      <div className="grid grid-cols-4 items-center h-16 max-w-lg mx-auto">
        {/* Tab 1: Role Primary Workspace */}
        <button
          onClick={() => onViewChange('main')}
          className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] py-1 transition-colors ${
            activeView === 'main'
              ? 'text-slate-900 dark:text-white font-semibold'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          <ClipboardCheck className={`w-5 h-5 ${activeView === 'main' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[11px] tracking-tight mt-1">{getRoleLabel()}</span>
        </button>

        {/* Tab 2: Timetable Grid & Sat Swaps */}
        <button
          onClick={() => onViewChange('timetable_grid')}
          className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] py-1 transition-colors ${
            activeView === 'timetable_grid'
              ? 'text-slate-900 dark:text-white font-semibold'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          <CalendarDays className={`w-5 h-5 ${activeView === 'timetable_grid' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[11px] tracking-tight mt-1">Timetable</span>
        </button>

        {/* Tab 3: Test Runner */}
        <button
          onClick={() => onViewChange('tests')}
          className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] py-1 transition-colors ${
            activeView === 'tests'
              ? 'text-slate-900 dark:text-white font-semibold'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          <FlaskConical className={`w-5 h-5 ${activeView === 'tests' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[11px] tracking-tight mt-1">Tests</span>
        </button>

        {/* Tab 4: Architecture & DDL */}
        <button
          onClick={() => onViewChange('docs')}
          className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] py-1 transition-colors ${
            activeView === 'docs'
              ? 'text-slate-900 dark:text-white font-semibold'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          <FileText className={`w-5 h-5 ${activeView === 'docs' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[11px] tracking-tight mt-1">Schema</span>
        </button>
      </div>
    </div>
  );
};
