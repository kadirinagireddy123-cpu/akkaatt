import React, { useState } from 'react';
import {
  Settings,
  LogOut,
  Palette,
  Check,
  Sun,
  Moon,
  Laptop,
  Building,
  Save,
  CheckCircle2
} from 'lucide-react';
import {
  ThemePalette,
  AppearanceMode,
  AcademicSettings
} from '../../types/campusPulse';
import { THEME_DEFINITIONS } from '../../utils/themeConfig';

interface SettingsViewProps {
  currentTheme: ThemePalette;
  onSelectTheme: (t: ThemePalette) => void;
  appearanceMode: AppearanceMode;
  onSelectAppearanceMode: (m: AppearanceMode) => void;
  academicSettings: AcademicSettings;
  onSaveAcademicSettings: (settings: AcademicSettings) => void;
  onResetToZero?: () => void;
  onLogout?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentTheme,
  onSelectTheme,
  appearanceMode,
  onSelectAppearanceMode,
  academicSettings,
  onSaveAcademicSettings,
  onResetToZero,
  onLogout
}) => {
  const [formData, setFormData] = useState<AcademicSettings>(academicSettings);
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveAcademicSettings(formData);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* 1. HEADER (Screenshot 7) */}
      <div className="bg-[#10141d] border border-[#1e2637] rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-sky-400" />
            <h1 className="text-xl font-extrabold text-white">
              Application Preferences & Security
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Configure Dept details, attendance criteria, modern UI themes, and PIN privacy
          </p>
        </div>

        {onLogout && (
          <button
            onClick={onLogout}
            className="px-4 py-2.5 rounded-xl bg-rose-950/40 border border-rose-800 hover:bg-rose-900/60 text-rose-300 font-bold text-xs flex items-center gap-2 self-start sm:self-auto transition-colors"
          >
            <LogOut className="w-4 h-4 text-rose-400" />
            <span>Log Out Portal</span>
          </button>
        )}
      </div>

      {/* 2. COLOR THEMES & APPEARANCE (Screenshot 7) */}
      <div className="bg-[#10141d] border border-[#1e2637] rounded-3xl p-6 shadow-xl space-y-5">
        <div>
          <div className="flex items-center gap-2 text-sm font-extrabold text-white">
            <Palette className="w-4 h-4 text-sky-400" />
            <span>Color Themes & Appearance</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Choose between Red, Green, Orange, Indigo, or Blue themes, along with dark or light mode.
          </p>
        </div>

        {/* 5 Theme Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {Object.values(THEME_DEFINITIONS).map(t => {
            const isSelected = currentTheme === t.id;

            return (
              <button
                key={t.id}
                onClick={() => onSelectTheme(t.id)}
                className={`p-4 rounded-2xl border text-left transition-all flex items-start justify-between ${
                  isSelected
                    ? 'bg-[#182030] border-white shadow-xl'
                    : 'bg-[#131824] border-[#1f2738] hover:border-slate-500 hover:bg-[#161c2b]'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: t.dotColor }}
                    />
                    <span className="font-extrabold text-sm text-white">{t.name}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">{t.tagline}</p>
                </div>

                {isSelected && (
                  <Check className="w-4 h-4 text-white shrink-0 mt-0.5" />
                )}
              </button>
            );
          })}
        </div>

        {/* Appearance Mode (Light / Dark / System) */}
        <div className="pt-3 border-t border-[#1a2233] space-y-2">
          <div className="text-xs font-bold text-slate-300">Appearance Mode</div>
          <div className="inline-flex p-1 bg-[#141924] border border-[#212a3d] rounded-2xl gap-1">
            <button
              onClick={() => onSelectAppearanceMode('light')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                appearanceMode === 'light'
                  ? 'bg-white text-slate-900 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>Light</span>
            </button>

            <button
              onClick={() => onSelectAppearanceMode('dark')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                appearanceMode === 'dark'
                  ? 'bg-white text-slate-900 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span>Dark</span>
            </button>

            <button
              onClick={() => onSelectAppearanceMode('system')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                appearanceMode === 'system'
                  ? 'bg-white text-slate-900 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Laptop className="w-3.5 h-3.5" />
              <span>System</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. COLLEGE & DEPARTMENT SETTINGS (Screenshot 7) */}
      <form onSubmit={handleSubmit} className="bg-[#10141d] border border-[#1e2637] rounded-3xl p-6 shadow-xl space-y-5">
        <div>
          <div className="flex items-center gap-2 text-sm font-extrabold text-white">
            <Building className="w-4 h-4 text-sky-400" />
            <span>College & Department Settings</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Personalize your degree, class section, and VTU attendance percentage targets.
          </p>
        </div>

        {savedNotice && (
          <div className="p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs font-bold rounded-2xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Academic settings saved successfully!</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-bold text-slate-300 block mb-1.5">
              Department
            </label>
            <input
              type="text"
              value={formData.department}
              onChange={e => setFormData({ ...formData, department: e.target.value })}
              className="w-full bg-[#131824] border border-[#20283b] text-white p-3 rounded-2xl focus:outline-none focus:border-cyan-500 font-bold"
            />
          </div>

          <div>
            <label className="font-bold text-slate-300 block mb-1.5">
              Semester & Section
            </label>
            <input
              type="text"
              value={formData.semesterSection}
              onChange={e => setFormData({ ...formData, semesterSection: e.target.value })}
              className="w-full bg-[#131824] border border-[#20283b] text-white p-3 rounded-2xl focus:outline-none focus:border-cyan-500 font-bold"
            />
          </div>

          <div className="md:col-span-2">
            <label className="font-bold text-slate-300 block mb-1.5">
              Classroom Location
            </label>
            <input
              type="text"
              value={formData.classroomLocation}
              onChange={e => setFormData({ ...formData, classroomLocation: e.target.value })}
              className="w-full bg-[#131824] border border-[#20283b] text-white p-3 rounded-2xl focus:outline-none focus:border-cyan-500 font-bold"
            />
          </div>

          <div>
            <label className="font-bold text-slate-300 block mb-1">
              VTU Mandatory Minimum Attendance (%)
            </label>
            <input
              type="number"
              min="50"
              max="100"
              value={formData.minimumTargetPercent}
              onChange={e => setFormData({ ...formData, minimumTargetPercent: parseInt(e.target.value) || 85 })}
              className="w-full bg-[#131824] border border-[#20283b] text-white p-3 rounded-2xl focus:outline-none focus:border-cyan-500 font-mono font-bold"
            />
            <span className="text-[10px] text-rose-400 mt-1 block font-semibold">
              VTU statutory minimum requirement is 85%
            </span>
          </div>

          <div>
            <label className="font-bold text-slate-300 block mb-1">
              Safe Cushion Attendance Target (%)
            </label>
            <input
              type="number"
              min="50"
              max="100"
              value={formData.safeThresholdPercent}
              onChange={e => setFormData({ ...formData, safeThresholdPercent: parseInt(e.target.value) || 90 })}
              className="w-full bg-[#131824] border border-[#20283b] text-white p-3 rounded-2xl focus:outline-none focus:border-cyan-500 font-mono font-bold"
            />
            <span className="text-[10px] text-emerald-400 mt-1 block font-semibold">
              Safe cushion target is 90% (bunk allowance buffer)
            </span>
          </div>
        </div>

        <div className="pt-2 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            className="px-5 py-3 rounded-2xl bg-white text-slate-950 hover:bg-slate-200 font-black text-xs flex items-center gap-2 shadow-lg transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save Academic Settings</span>
          </button>

          {onResetToZero && (
            <button
              type="button"
              onClick={onResetToZero}
              className="px-4 py-3 rounded-2xl bg-rose-950/40 border border-rose-800 text-rose-300 hover:bg-rose-900/60 font-bold text-xs flex items-center gap-2 transition-colors"
            >
              <span>Reset All Attendance Records to 0%</span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
