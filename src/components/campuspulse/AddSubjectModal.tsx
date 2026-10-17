import React, { useState } from 'react';
import { X, Plus, BookOpen, Layers } from 'lucide-react';
import { CampusSubject } from '../../types/campusPulse';

interface AddSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSubject: (subject: CampusSubject) => void;
}

export const AddSubjectModal: React.FC<AddSubjectModalProps> = ({
  isOpen,
  onClose,
  onAddSubject
}) => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [facultyName, setFacultyName] = useState('');
  const [category, setCategory] = useState<CampusSubject['category']>('core');
  const [classroom, setClassroom] = useState('LH-10');
  const [isLab, setIsLab] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) return;

    onAddSubject({
      code: code.trim().toUpperCase(),
      name: name.trim(),
      category,
      facultyName: facultyName.trim() || 'Department Faculty',
      classroom: classroom.trim(),
      isLab
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#121620] border border-[#222d42] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#00a8ff]/20 text-[#00a8ff] flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Add New Subject</h3>
              <p className="text-xs text-slate-400">Configure subject code and parameters</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="font-bold text-slate-300 block mb-1">Subject Code</label>
            <input
              type="text"
              required
              placeholder="e.g. AI, CS301, CLOUD"
              value={code}
              onChange={e => setCode(e.target.value)}
              className="w-full bg-[#161c28] border border-[#243046] text-white p-2.5 rounded-xl focus:outline-none focus:border-cyan-500 font-mono font-bold"
            />
          </div>

          <div>
            <label className="font-bold text-slate-300 block mb-1">Subject Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Artificial Intelligence & Expert Systems"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-[#161c28] border border-[#243046] text-white p-2.5 rounded-xl focus:outline-none focus:border-cyan-500 font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-300 block mb-1">Faculty Name</label>
              <input
                type="text"
                placeholder="Professor name"
                value={facultyName}
                onChange={e => setFacultyName(e.target.value)}
                className="w-full bg-[#161c28] border border-[#243046] text-white p-2.5 rounded-xl focus:outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-300 block mb-1">Classroom</label>
              <input
                type="text"
                placeholder="e.g. LH-10"
                value={classroom}
                onChange={e => setClassroom(e.target.value)}
                className="w-full bg-[#161c28] border border-[#243046] text-white p-2.5 rounded-xl focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-300 block mb-1">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as any)}
                className="w-full bg-[#161c28] border border-[#243046] text-white p-2.5 rounded-xl focus:outline-none"
              >
                <option value="core">Core Theory</option>
                <option value="elective">Elective</option>
                <option value="lab">Laboratory</option>
                <option value="aptitude">Aptitude / Training</option>
                <option value="activity">Club / Activity</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-5">
              <input
                type="checkbox"
                id="isLabCheck"
                checked={isLab}
                onChange={e => setIsLab(e.target.checked)}
                className="w-4 h-4 rounded accent-cyan-500"
              />
              <label htmlFor="isLabCheck" className="font-bold text-slate-300">
                Is Practical Lab?
              </label>
            </div>
          </div>

          <div className="flex gap-2.5 pt-3">
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
              Add Subject
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
