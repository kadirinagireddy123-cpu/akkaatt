import React, { useState, useMemo } from 'react';
import {
  AlertOctagon,
  X,
  Calendar,
  Clock,
  ArrowDownRight,
  CheckSquare,
  Square,
  Siren,
  AlertTriangle
} from 'lucide-react';
import {
  TimetablePeriodSlot,
  CampusAttendanceRecord,
  AcademicSettings
} from '../../types/campusPulse';

interface MassBunkModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
  slots: TimetablePeriodSlot[];
  records: CampusAttendanceRecord[];
  academicSettings: AcademicSettings;
  onExecuteMassBunk: (date: string, selectedSlotIds: string[]) => void;
}

export const MassBunkModal: React.FC<MassBunkModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  slots,
  records,
  academicSettings,
  onExecuteMassBunk
}) => {
  const [bunkDate, setBunkDate] = useState<string>(selectedDate);
  const [selectedSlotIds, setSelectedSlotIds] = useState<string[]>(() => slots.map(s => s.id));

  // Current attendance statistics
  const validRecords = records.filter(r => r.status !== 'cancelled' && r.status !== 'holiday');
  const currentConducted = validRecords.length;
  const currentPresent = validRecords.filter(r => r.status === 'present').length;
  const currentPercentage =
    currentConducted > 0 ? Math.round((currentPresent / currentConducted) * 1000) / 10 : 0;

  // Projected statistics if mass bunked
  const bunkCount = selectedSlotIds.length;
  const projectedConducted = currentConducted + bunkCount;
  const projectedPresent = currentPresent;
  const projectedPercentage =
    projectedConducted > 0 ? Math.round((projectedPresent / projectedConducted) * 1000) / 10 : 0;

  const dropPercent = Math.round((currentPercentage - projectedPercentage) * 10) / 10;

  const toggleSlot = (id: string) => {
    setSelectedSlotIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedSlotIds(slots.map(s => s.id));
  };

  const deselectAll = () => {
    setSelectedSlotIds([]);
  };

  const handleConfirm = () => {
    onExecuteMassBunk(bunkDate, selectedSlotIds);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#121620] border border-rose-900/60 rounded-3xl max-w-lg w-full p-6 shadow-2xl shadow-rose-950/80 space-y-5 animate-in fade-in zoom-in-95">
        {/* Modal Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-600/20 border border-rose-500/40 text-rose-500 flex items-center justify-center shrink-0">
              <AlertOctagon className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white">Mass Bunk Tool</h3>
                <span className="px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 text-[10px] font-bold border border-rose-800">
                  SIMULATION
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Simulate percentage drop and mark multiple lectures absent simultaneously.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-[#1a2130]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Date Selector */}
        <div className="bg-[#151b27] border border-[#232c3e] rounded-2xl p-3 flex items-center justify-between text-xs">
          <span className="font-bold text-slate-300">Target Date:</span>
          <input
            type="date"
            value={bunkDate}
            onChange={e => setBunkDate(e.target.value)}
            className="bg-[#1c2434] border border-[#2d3a52] text-xs font-mono font-bold text-white px-3 py-1.5 rounded-xl focus:outline-none"
          />
        </div>

        {/* Real-time Percentage Drop Simulator Card */}
        <div className="p-4 rounded-2xl bg-[#1d0e14] border border-rose-900/50 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase">CURRENT ATTENDANCE</div>
              <div className="text-2xl font-black font-mono text-white mt-0.5">
                {currentPercentage}%
              </div>
            </div>

            <div className="text-rose-400 flex items-center gap-1 font-mono font-bold text-sm">
              <ArrowDownRight className="w-4 h-4" />
              <span>-{dropPercent}% drop</span>
            </div>

            <div className="text-right">
              <div className="text-[10px] font-bold text-slate-400 uppercase">PROJECTED ATTENDANCE</div>
              <div
                className={`text-2xl font-black font-mono mt-0.5 ${
                  projectedPercentage < academicSettings.minimumTargetPercent
                    ? 'text-rose-500'
                    : projectedPercentage < academicSettings.safeThresholdPercent
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                {projectedPercentage}%
              </div>
            </div>
          </div>

          {projectedPercentage < academicSettings.safeThresholdPercent && currentConducted > 0 && (
            <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-800 text-[11px] text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>
                Warning! Mass bunking will drop you below the <strong>{academicSettings.safeThresholdPercent}% safe cushion</strong>.
              </span>
            </div>
          )}
        </div>

        {/* Classes To Bunk List */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>Select Classes to Bunk ({selectedSlotIds.length}/{slots.length}):</span>
            <div className="flex gap-2 text-[11px]">
              <button onClick={selectAll} className="text-sky-400 hover:underline">
                Select All
              </button>
              <span>•</span>
              <button onClick={deselectAll} className="text-slate-400 hover:underline">
                Deselect
              </button>
            </div>
          </div>

          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {slots.map(slot => {
              const isChecked = selectedSlotIds.includes(slot.id);

              return (
                <button
                  key={slot.id}
                  onClick={() => toggleSlot(slot.id)}
                  className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between text-xs transition-colors ${
                    isChecked
                      ? 'bg-rose-950/40 border-rose-800 text-white'
                      : 'bg-[#151b27] border-[#222a3b] text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {isChecked ? (
                      <CheckSquare className="w-4 h-4 text-rose-500 shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-500 shrink-0" />
                    )}
                    <div>
                      <span className="font-bold">{slot.subjectCode}</span>
                      <span className="text-slate-400 ml-1.5 text-[11px]">{slot.subjectName}</span>
                    </div>
                  </div>

                  <span className="font-mono text-[10px] text-slate-400">{slot.timeRange}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl bg-[#161c28] border border-[#242f44] text-xs font-bold text-slate-300 hover:bg-[#1e2638]"
          >
            Cancel
          </button>

          <button
            onClick={handleConfirm}
            disabled={selectedSlotIds.length === 0}
            className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:brightness-110 text-xs font-black text-white shadow-lg shadow-rose-950 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Siren className="w-4 h-4" />
            <span>Confirm Mass Bunk ({selectedSlotIds.length})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
