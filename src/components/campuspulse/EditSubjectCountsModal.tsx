import React, { useState } from 'react';
import { X, Edit2, Save } from 'lucide-react';
import { CampusSubject } from '../../types/campusPulse';

interface EditSubjectCountsModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject: CampusSubject | null;
  currentPresent: number;
  currentConducted: number;
  onSaveCounts: (subjectCode: string, present: number, conducted: number) => void;
}

export const EditSubjectCountsModal: React.FC<EditSubjectCountsModalProps> = ({
  isOpen,
  onClose,
  subject,
  currentPresent,
  currentConducted,
  onSaveCounts
}) => {
  const [present, setPresent] = useState(currentPresent);
  const [conducted, setConducted] = useState(currentConducted);

  // Sync state when subject changes
  React.useEffect(() => {
    setPresent(currentPresent);
    setConducted(currentConducted);
  }, [subject, currentPresent, currentConducted]);

  if (!isOpen || !subject) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const safeConducted = Math.max(0, conducted);
    const safePresent = Math.min(safeConducted, Math.max(0, present));
    onSaveCounts(subject.code, safePresent, safeConducted);
    onClose();
  };

  const calculatedPct = conducted > 0 ? Math.round((present / conducted) * 1000) / 10 : 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#121620] border border-[#222d42] rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs font-mono font-bold text-sky-400">{subject.code}</span>
            <h3 className="text-base font-extrabold text-white mt-0.5">{subject.name}</h3>
            <p className="text-xs text-slate-400">Manual Attendance Adjustment</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="font-bold text-slate-300 block mb-1">Classes Present (Attended)</label>
            <input
              type="number"
              min="0"
              max="200"
              value={present}
              onChange={e => setPresent(parseInt(e.target.value) || 0)}
              className="w-full bg-[#161c28] border border-[#243046] text-white p-2.5 rounded-xl font-mono font-bold text-sm focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="font-bold text-slate-300 block mb-1">Total Classes Conducted</label>
            <input
              type="number"
              min="0"
              max="200"
              value={conducted}
              onChange={e => setConducted(parseInt(e.target.value) || 0)}
              className="w-full bg-[#161c28] border border-[#243046] text-white p-2.5 rounded-xl font-mono font-bold text-sm focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="p-3 bg-[#151b27] border border-[#232c3e] rounded-xl text-center">
            <span className="text-slate-400">Resulting Percentage: </span>
            <span className="font-mono font-black text-white text-base ml-1">
              {calculatedPct}%
            </span>
          </div>

          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-[#161c28] border border-[#232f46] font-bold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-[#00a8ff] hover:bg-sky-400 text-slate-950 font-black shadow-lg shadow-cyan-950"
            >
              Save Counts
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
