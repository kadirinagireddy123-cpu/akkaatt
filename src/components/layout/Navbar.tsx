import React, { useState } from 'react';
import { User, Role } from '../../types';
import { PWAInstallButton } from '../pwa/PWAInstallButton';
import {
  GraduationCap,
  Wifi,
  WifiOff,
  UserCheck,
  ChevronDown,
  Layers,
  Sparkles,
  ShieldCheck,
  Calendar
} from 'lucide-react';

interface NavbarProps {
  currentUser: User;
  onUserChange: (user: User) => void;
  allUsers: User[];
  isOnline: boolean;
  activeView: string;
  onViewChange: (view: string) => void;
  pendingSyncCount: number;
  onTriggerSync: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onUserChange,
  allUsers,
  isOnline,
  activeView,
  onViewChange,
  pendingSyncCount,
  onTriggerSync
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const getRoleBadgeStyle = (role: Role) => {
    switch (role) {
      case 'admin':
        return 'text-purple-600 bg-purple-50 dark:bg-purple-950/40 dark:text-purple-300';
      case 'faculty':
        return 'text-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-300';
      case 'proctor':
        return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300';
      case 'student':
        return 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-bold shadow-xs shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
                BITM MBA
              </span>
              <span className="text-xs text-slate-500 font-mono hidden sm:inline">
                Sec A & B · 3rd Sem
              </span>
            </div>
            <p className="text-[10px] text-slate-500 truncate hidden md:block">
              Ballari Institute of Technology & Management (Autonomous VTU)
            </p>
          </div>
        </div>

        {/* Zone 2: Navigation Links for Desktop */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
          <button
            onClick={() => onViewChange('main')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 dark:hover:text-white ${
              activeView === 'main' ? 'text-slate-900 dark:text-white font-semibold' : ''
            }`}
          >
            {currentUser.role === 'faculty' && 'Faculty Register'}
            {currentUser.role === 'student' && 'Student Portal'}
            {currentUser.role === 'proctor' && 'Proctor Module'}
            {currentUser.role === 'admin' && 'Department Console'}
          </button>

          <button
            onClick={() => onViewChange('timetable_grid')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 dark:hover:text-white ${
              activeView === 'timetable_grid' ? 'text-slate-900 dark:text-white font-semibold' : ''
            }`}
          >
            Weekly Grid & Sat Swaps
          </button>

          <button
            onClick={() => onViewChange('tests')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 dark:hover:text-white ${
              activeView === 'tests' ? 'text-slate-900 dark:text-white font-semibold' : ''
            }`}
          >
            Test Runner
          </button>

          <button
            onClick={() => onViewChange('docs')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 dark:hover:text-white ${
              activeView === 'docs' ? 'text-slate-900 dark:text-white font-semibold' : ''
            }`}
          >
            ER Diagram & Specs
          </button>
        </nav>

        {/* Zone 3: Actions, Network Status, & Role Switcher */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Offline / Sync Status */}
          {!isOnline ? (
            <div className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-amber-700 bg-amber-50 rounded-lg">
              <WifiOff className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">Offline</span>
            </div>
          ) : pendingSyncCount > 0 ? (
            <button
              onClick={onTriggerSync}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              title="Click to sync offline records"
            >
              <Wifi className="w-3.5 h-3.5 animate-pulse text-blue-600" />
              <span>Sync ({pendingSyncCount})</span>
            </button>
          ) : (
            <div className="hidden sm:flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              <Wifi className="w-3.5 h-3.5" />
              <span>Online</span>
            </div>
          )}

          <PWAInstallButton />

          {/* User Role Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
              aria-label="Switch active test user or role"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 font-bold text-xs">
                {currentUser.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="hidden sm:block text-left pr-1">
                <div className="text-xs font-semibold text-slate-900 dark:text-white leading-tight truncate max-w-[120px]">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-slate-500 capitalize">
                  {currentUser.role} {currentUser.section ? `· Sec ${currentUser.section}` : ''}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showUserDropdown && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserDropdown(false)}
                />
                <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-2 z-50">
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 text-xs font-medium text-slate-500">
                    Switch Active Persona (Evaluate Flows)
                  </div>
                  <div className="max-h-80 overflow-y-auto py-1">
                    {allUsers.map(user => {
                      const isSelected = user.id === currentUser.id;
                      return (
                        <button
                          key={user.id}
                          onClick={() => {
                            onUserChange(user);
                            setShowUserDropdown(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                            isSelected
                              ? 'bg-slate-100 dark:bg-slate-800 font-semibold text-slate-900 dark:text-white'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                          }`}
                        >
                          <div className="truncate pr-2">
                            <div className="truncate font-medium">{user.name}</div>
                            <div className="text-[10px] text-slate-500 truncate">
                              {user.role.toUpperCase()}
                              {user.primarySpec ? ` · ${user.primarySpec} + ${user.dualSpec}` : ''}
                              {user.designation ? ` · ${user.designation}` : ''}
                            </div>
                          </div>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-semibold shrink-0 ${getRoleBadgeStyle(
                              user.role
                            )}`}
                          >
                            {user.role}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
