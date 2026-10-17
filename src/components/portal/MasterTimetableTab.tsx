import React, { useState } from 'react';
import { MASTER_DAY_TEMPLATES } from '../../data/portalSeedData';
import { ClassPeriodSlot } from '../../types/portal';
import { CalendarDays, Clock, MapPin, ChevronLeft, ChevronRight, Layers } from 'lucide-react';

export const MasterTimetableTab: React.FC = () => {
  const [activeDay, setActiveDay] = useState<string>('Tuesday');

  const days = [
    { name: 'Monday', count: 6, tag: '' },
    { name: 'Tuesday', count: 8, tag: 'TODAY' },
    { name: 'Wednesday', count: 6, tag: 'TMR' },
    { name: 'Thursday', count: 6, tag: '' },
    { name: 'Friday', count: 4, tag: '' },
    { name: 'Saturday', count: 6, tag: 'DYNAMIC' }
  ];

  const currentSlots: ClassPeriodSlot[] = MASTER_DAY_TEMPLATES[activeDay] || MASTER_DAY_TEMPLATES['Monday'];

  const handlePrevDay = () => {
    const idx = days.findIndex(d => d.name === activeDay);
    const prevIdx = (idx - 1 + days.length) % days.length;
    setActiveDay(days[prevIdx].name);
  };

  const handleNextDay = () => {
    const idx = days.findIndex(d => d.name === activeDay);
    const nextIdx = (idx + 1) % days.length;
    setActiveDay(days[nextIdx].name);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner Matching Image 6 */}
      <div className="bg-gradient-to-r from-[#0062ff] to-[#0091ff] rounded-3xl p-5 sm:p-6 text-white shadow-xl space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] uppercase font-mono font-bold bg-white/20 px-2 py-0.5 rounded">
            DEPT. OF MBA & MGMT · SEMESTER III - B SEC · ROOM SH-3 / LH-10
          </span>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Master Class Timetable
          </h1>
          <p className="text-xs text-blue-100 mt-1">
            Ballari Institute of Technology and Management · Effective from 16th September 2026
          </p>
        </div>

        {/* Info Callout */}
        <div className="p-3 bg-white/10 rounded-2xl border border-white/20 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-white shrink-0" />
            <span>Single Class Session (3 Continuous Periods on Wednesday Morning Lab)</span>
          </div>
          <span className="font-mono text-[11px] bg-white/20 px-2 py-0.5 rounded">
            Attendance records as per official credit
          </span>
        </div>

        {/* Day Selector Strip */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-blue-100">Viewing:</span>
            <span className="px-3 py-1 rounded-xl bg-black/30 font-bold font-mono">
              {activeDay}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevDay}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold flex items-center gap-1 border border-white/20"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Prev Day</span>
            </button>
            <button
              onClick={handleNextDay}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold flex items-center gap-1 border border-white/20"
            >
              <span>Next Day</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 6 Day Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-1">
          {days.map(d => {
            const isSelected = activeDay === d.name;

            return (
              <button
                key={d.name}
                onClick={() => setActiveDay(d.name)}
                className={`p-2.5 rounded-2xl border text-center transition-all ${
                  isSelected
                    ? 'bg-[#0b1322] border-white text-white font-bold shadow-lg shadow-black/30'
                    : 'bg-white/10 hover:bg-white/20 border-white/20 text-white'
                }`}
              >
                <div className="text-xs font-bold">{d.name}</div>
                {d.tag && (
                  <span className={`text-[9px] font-mono px-1 py-0.2 rounded font-bold uppercase mt-1 inline-block ${
                    isSelected ? 'bg-blue-600 text-white' : 'bg-white/20 text-blue-100'
                  }`}>
                    {d.tag}
                  </span>
                )}
                <div className="text-[10px] text-blue-200 mt-1">
                  {d.count} Sessions
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Daily Schedule List for Active Day */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-semibold">
          <span className="text-white font-bold">{activeDay}'s Daily Schedule</span>
          <span>Room: SH-2 / SH-3 / LH-4 / T2</span>
        </div>

        {currentSlots.map(slot => (
          <div
            key={slot.id}
            className="p-4 sm:p-5 rounded-2xl bg-[#0c1527] border border-slate-800 space-y-2 hover:border-slate-700 transition-colors"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#14213d] text-xs font-mono font-bold text-slate-200 border border-slate-700">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                <span>{slot.timeRange}</span>
              </span>

              <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>{slot.classroom}</span>
                </span>
                <span>·</span>
                <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300 font-bold">
                  {slot.credits} Class Credit (+{slot.credits})
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-base font-black text-white">{slot.subjectCode}</span>
                  <span className="text-sm font-semibold text-slate-300">— {slot.subjectName}</span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Lecturer: <strong>{slot.facultyName}</strong>
                </div>
              </div>

              <span className="text-xs font-mono text-slate-400 bg-[#14213d] px-2.5 py-1 rounded-lg self-start sm:self-auto">
                Slots: Period {slot.periodNumber}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
