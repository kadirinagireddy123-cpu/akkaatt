import React, { useState } from 'react';
import { ClassPeriodSlot } from '../../types/portal';
import { TodayAttendanceTab } from './TodayAttendanceTab';
import { Sparkles, Calendar, Layers, Check } from 'lucide-react';

interface SaturdayClassesTabProps {
  currentDateStr: string;
  onDateChange: (date: string) => void;
  saturdayRoutineDay: string; // 'Monday', 'Tuesday', ...
  onRoutineChange: (day: string) => void;
  periods: ClassPeriodSlot[];
  onPeriodStatusChange: (id: string, status: any) => void;
  onMarkAllPresent: () => void;
  onResetDay: () => void;
  onMassBunkDay: () => void;
  onExchangeFaculty: (p: any) => void;
}

export const SaturdayClassesTab: React.FC<SaturdayClassesTabProps> = ({
  currentDateStr,
  onDateChange,
  saturdayRoutineDay,
  onRoutineChange,
  periods,
  onPeriodStatusChange,
  onMarkAllPresent,
  onResetDay,
  onMassBunkDay,
  onExchangeFaculty
}) => {
  const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  return (
    <div className="space-y-4">
      {/* Dynamic Saturday Routine Selector Banner (Matching Image 4) */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-5 text-white shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-mono font-bold bg-white/20 px-2 py-0.5 rounded">
              SATURDAY CLASS TIMETABLE
            </span>
            <span className="text-xs text-blue-100">Dynamic Schedule</span>
          </div>

          <div className="text-xs font-mono font-bold bg-blue-900/40 border border-blue-400/40 px-3 py-1 rounded-xl">
            Active: {saturdayRoutineDay} Timetable
          </div>
        </div>

        <div>
          <h2 className="text-lg font-bold">Which day's timetable applies this Saturday?</h2>
          <p className="text-xs text-blue-100 mt-0.5">
            Saturday classes follow the college circular for Monday–Friday replacement.
          </p>
        </div>

        {/* 5 Weekday Selection Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
          {weekdays.map(day => {
            const isActive = saturdayRoutineDay === day;

            return (
              <button
                key={day}
                onClick={() => onRoutineChange(day)}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  isActive
                    ? 'bg-[#0b1322] border-white text-white font-bold shadow-lg shadow-black/30'
                    : 'bg-white/10 hover:bg-white/20 border-white/20 text-white font-semibold'
                }`}
              >
                <div className="text-xs">{day}</div>
                <div
                  className={`text-[10px] font-mono mt-1 ${
                    isActive ? 'text-emerald-400 font-bold' : 'text-blue-200'
                  }`}
                >
                  {isActive ? 'Active' : 'Select'}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Renders the full attendance list for this Saturday */}
      <TodayAttendanceTab
        currentDateStr={currentDateStr}
        onDateChange={onDateChange}
        dayScheduleMode="Normal Classes"
        onModeChange={() => {}}
        periods={periods}
        onPeriodStatusChange={onPeriodStatusChange}
        onMarkAllPresent={onMarkAllPresent}
        onResetDay={onResetDay}
        onMassBunkDay={onMassBunkDay}
        onExchangeFaculty={onExchangeFaculty}
      />
    </div>
  );
};
