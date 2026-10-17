import React, { useState } from 'react';
import {
  Subject,
  TimetableEntry,
  SaturdayOverride,
  DayOfWeek
} from '../../types';
import {
  TIME_SLOTS,
  TIMETABLE_ENTRIES,
  SUBJECTS,
  SATURDAY_OVERRIDES
} from '../../data/seedData';
import { validateTimetableEntries } from '../../utils/timetableEngine';
import {
  Calendar,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  Filter,
  Layers,
  MapPin
} from 'lucide-react';

interface TimetableGridViewProps {
  subjects: Subject[];
  timetableEntries: TimetableEntry[];
  saturdayOverrides: SaturdayOverride[];
  onImportTimetable: (newEntries: TimetableEntry[]) => void;
}

export const TimetableGridView: React.FC<TimetableGridViewProps> = ({
  subjects,
  timetableEntries,
  saturdayOverrides,
  onImportTimetable
}) => {
  const [filterSpec, setFilterSpec] = useState<string>('all');
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [jsonImportText, setJsonImportText] = useState<string>('');
  const [importNotice, setImportNotice] = useState<{ isError: boolean; message: string } | null>(null);

  const days: DayOfWeek[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

  // Filter entries
  const getCellEntries = (day: DayOfWeek, period: string) => {
    return timetableEntries.filter(entry => {
      if (entry.day !== day || entry.period !== period) return false;
      if (filterSpec === 'all') return true;
      if (entry.specializationGroup === 'All') return true;
      return entry.specializationGroup === filterSpec;
    });
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(timetableEntries, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'bitm_mba_3rd_sem_timetable.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportSubmit = () => {
    try {
      const parsed: TimetableEntry[] = JSON.parse(jsonImportText);
      if (!Array.isArray(parsed)) {
        setImportNotice({ isError: true, message: 'Invalid JSON: Timetable must be an array of entries.' });
        return;
      }

      const validation = validateTimetableEntries(parsed);
      if (!validation.isValid) {
        setImportNotice({
          isError: true,
          message: `Validation failed: ${validation.errors.join('; ')}`
        });
        return;
      }

      onImportTimetable(parsed);
      setImportNotice({ isError: false, message: `Successfully imported ${parsed.length} timetable entries!` });
      setTimeout(() => {
        setShowImportModal(false);
        setImportNotice(null);
      }, 2000);
    } catch (e: any) {
      setImportNotice({ isError: true, message: `JSON syntax error: ${e.message}` });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                Master Timetable & Classroom Allocation
              </h1>
              <span className="text-xs font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-semibold">
                W.E.F: 16-09-2026
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Ballari Institute of Technology & Management (BITM) · Autonomous under VTU Belagavi · MBA 3rd Sem (Sec A & B)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportJSON}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>

            <button
              onClick={() => setShowImportModal(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold hover:bg-slate-800 transition-colors flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import Timetable</span>
            </button>
          </div>
        </div>

        {/* Classroom Allocation Map & Specialization Filter */}
        <div className="pt-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="text-xs text-slate-600 dark:text-slate-400 flex flex-wrap items-center gap-3">
            <span className="font-semibold text-slate-900 dark:text-white">Classrooms:</span>
            <span><strong>SH2</strong> (Sec A Finance / HR / Marketing)</span>
            <span>·</span>
            <span><strong>SH3</strong> (Sec B Finance / HR / BA)</span>
            <span>·</span>
            <span><strong>LH4</strong> (Logistics & SCM)</span>
            <span>·</span>
            <span><strong>T2 MBA Block</strong> (Data Science)</span>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-x-auto">
            {['all', 'Finance', 'Logistics & SCM', 'Marketing', 'HR', 'Business Analytics', 'Data Science'].map(cat => (
              <button
                key={cat}
                onClick={() => setFilterSpec(cat)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                  filterSpec === cat
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {cat === 'all' ? 'All Electives' : cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Weekly Visual Grid */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse min-w-[950px]">
            <thead>
              <tr className="bg-slate-100/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
                <th className="p-3 font-bold text-slate-700 dark:text-slate-300 w-20">Days / Time</th>
                {TIME_SLOTS.map((slot, index) => (
                  <React.Fragment key={slot.id}>
                    <th className="p-3 font-bold text-slate-700 dark:text-slate-300 min-w-[105px]">
                      <div className="font-mono">{slot.period}</div>
                      <div className="text-[10px] text-slate-500 font-normal">{slot.label}</div>
                    </th>
                    {/* Breaks */}
                    {index === 1 && (
                      <th className="p-1 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 font-mono text-[9px] uppercase tracking-widest text-center w-8">
                        Break
                      </th>
                    )}
                    {index === 3 && (
                      <th className="p-1 bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 font-mono text-[9px] uppercase tracking-widest text-center w-8">
                        Lunch
                      </th>
                    )}
                    {index === 5 && (
                      <th className="p-1 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 font-mono text-[9px] uppercase tracking-widest text-center w-8">
                        Break
                      </th>
                    )}
                  </React.Fragment>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {days.map(day => (
                <tr key={day} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="p-3 font-bold text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-800/40">
                    {day}
                  </td>
                  {TIME_SLOTS.map((slot, index) => {
                    const entries = getCellEntries(day, slot.period);

                    return (
                      <React.Fragment key={`${day}-${slot.period}`}>
                        <td className="p-2 align-top">
                          {entries.length === 0 ? (
                            <div className="h-14 flex items-center justify-center text-slate-300 dark:text-slate-700 font-mono text-[10px]">
                              —
                            </div>
                          ) : (
                            <div className="space-y-1">
                              {entries.map(e => {
                                const sub = subjects.find(s => s.code === e.subjectCode);
                                return (
                                  <div
                                    key={e.id}
                                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70"
                                  >
                                    <div className="font-bold text-[11px] text-slate-900 dark:text-white flex items-center justify-between">
                                      <span>{e.subjectCode.replace('MBA', '')}</span>
                                      <span className="font-mono text-[9px] text-slate-500">{e.classroom}</span>
                                    </div>
                                    <div className="text-[10px] text-slate-500 truncate mt-0.5" title={sub?.name}>
                                      {sub?.name}
                                    </div>
                                    {e.specializationGroup && e.specializationGroup !== 'All' && (
                                      <div className="text-[9px] text-blue-600 dark:text-blue-400 font-medium truncate">
                                        {e.specializationGroup}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </td>

                        {/* Breaks in body */}
                        {(index === 1 || index === 3 || index === 5) && (
                          <td className="bg-slate-50 dark:bg-slate-800/30 border-x border-slate-100 dark:border-slate-800"></td>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Saturday Extra Working Days Table from the Photo */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Saturday Extra Working Days & Routine Swaps
            </h2>
            <p className="text-xs text-slate-500">
              Saturday has no regular slots. As indicated in the master schedule, designated dates operate on mapped weekday timetables.
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded-lg">
            {saturdayOverrides.length} Days Configured
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
          {saturdayOverrides.map(override => (
            <div
              key={override.date}
              className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs"
            >
              <div className="font-mono text-[11px] text-slate-500">
                {override.date}
              </div>
              <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                {override.mappedDay} Timetable
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Import Timetable JSON
            </h3>
            <p className="text-xs text-slate-500">
              Paste a validated array of TimetableEntry items. The system will automatically check for room conflicts and faculty double-booking.
            </p>

            {importNotice && (
              <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                importNotice.isError ? 'bg-rose-50 text-rose-800' : 'bg-emerald-50 text-emerald-800'
              }`}>
                {importNotice.isError ? (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                )}
                <span>{importNotice.message}</span>
              </div>
            )}

            <textarea
              rows={8}
              value={jsonImportText}
              onChange={e => setJsonImportText(e.target.value)}
              placeholder='[ { "id": "t-1", "day": "Mon", "period": "P1", "subjectCode": "MBAFM311", "classroom": "SH2", "facultyId": "fac-nc", "section": "Both" } ]'
              className="w-full text-xs font-mono p-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                onClick={handleImportSubmit}
                className="px-4 py-1.5 text-xs font-bold text-white bg-slate-900 rounded-xl hover:bg-slate-800"
              >
                Validate & Import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
