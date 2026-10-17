import React, { useState } from 'react';
import {
  GraduationCap,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  CalendarDays,
  Building,
  User,
  Info
} from 'lucide-react';
import { AcademicSettings } from '../../types/campusPulse';

interface StudentLoginPageProps {
  onLogin: (studentData: {
    studentName: string;
    usn: string;
    department?: string;
    semesterSection?: string;
  }) => void;
  defaultSettings: AcademicSettings;
}

export const StudentLoginPage: React.FC<StudentLoginPageProps> = ({
  onLogin,
  defaultSettings
}) => {
  const [usn, setUsn] = useState<string>('3BR25MBA01');
  const [studentName, setStudentName] = useState<string>('Student');
  const [password, setPassword] = useState<string>('bitm@123');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!usn.trim()) {
      setErrorMsg('Please enter your University Seat Number (USN)');
      return;
    }
    if (!password.trim()) {
      setErrorMsg('Please enter your password');
      return;
    }

    onLogin({
      studentName: studentName.trim() || 'Student',
      usn: usn.trim().toUpperCase(),
      department: defaultSettings.department,
      semesterSection: defaultSettings.semesterSection
    });
  };

  const handleQuickLogin = () => {
    onLogin({
      studentName: 'Student (Section B)',
      usn: '3BR25MBA01',
      department: defaultSettings.department,
      semesterSection: defaultSettings.semesterSection
    });
  };

  return (
    <div className="min-h-screen bg-[#07090e] bg-radial-at-c from-[#111827] via-[#080b11] to-[#040609] text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 selection:bg-cyan-500 selection:text-slate-900">
      <div className="w-full max-w-lg space-y-6">
        {/* Institutional Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-[#00a8ff]/15 border border-[#00a8ff]/40 text-[#00a8ff] mx-auto flex items-center justify-center shadow-2xl shadow-[#00a8ff]/20">
            <GraduationCap className="w-9 h-9 stroke-[2.2]" />
          </div>

          <div>
            <div className="text-[11px] font-black tracking-widest text-[#00a8ff] uppercase flex items-center justify-center gap-2">
              <span>BALLARI INSTITUTE OF TECHNOLOGY & MANAGEMENT</span>
            </div>
            <div className="text-[10px] font-mono font-semibold text-slate-400 mt-0.5">
              Autonomous Institute Affiliated to VTU, Belagavi · NAAC &apos;A+&apos; Grade
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-1.5">
              CampusPulse Attendance Portal
            </h1>
            <p className="text-xs text-slate-300 font-medium mt-1">
              MBA Programme (Odd Semester 2026-27) · 3rd Sem Section &quot;B&quot;
            </p>
          </div>
        </div>

        {/* VTU Compliance & Safe Cushion Highlights Banner */}
        <div className="bg-[#0f1420]/90 border border-[#1d273a] rounded-2xl p-4 shadow-xl grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-rose-400 font-black text-[11px] uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>VTU 85% MINIMUM</span>
            </div>
            <div className="text-[11px] text-slate-300 mt-1">
              Mandatory VTU attendance threshold. Below 85% incurs exam detention alert.
            </div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-emerald-400 font-black text-[11px] uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>90% SAFE CUSHION</span>
            </div>
            <div className="text-[11px] text-slate-300 mt-1">
              Safety cushion buffer to afford emergency leaves without risking detention.
            </div>
          </div>
        </div>

        {/* Login Form Card */}
        <div className="bg-[#0e121b]/95 backdrop-blur-xl border border-[#1e2738] rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5">
          <div className="flex items-center justify-between pb-3.5 border-b border-[#1b2332]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                <Lock className="w-3.5 h-3.5" />
              </div>
              <span className="text-sm font-extrabold text-white">Student Login</span>
            </div>
            <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
              Odd Sem 2026-27
            </span>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs font-semibold flex items-center gap-2">
              <Info className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* University Seat Number (USN) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>University Seat No. (USN)</span>
                <span className="text-[10px] font-normal text-slate-400 font-mono">e.g. 3BR25MBA01</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={usn}
                  onChange={e => setUsn(e.target.value.toUpperCase())}
                  placeholder="ENTER UNIVERSITY SEAT NO."
                  className="w-full bg-[#131924] border border-[#242f44] rounded-xl px-3.5 py-3 text-xs font-mono font-extrabold tracking-wider text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  required
                />
              </div>
            </div>

            {/* Student Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">
                Student Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={studentName}
                  onChange={e => setStudentName(e.target.value)}
                  placeholder="Student"
                  className="w-full bg-[#131924] border border-[#242f44] rounded-xl px-3.5 py-3 text-xs font-bold text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300">
                  Portal Password / Security PIN
                </label>
                <button
                  type="button"
                  onClick={() => setPassword('bitm@123')}
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 underline font-mono font-semibold"
                >
                  Use default (bitm@123)
                </button>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter portal password"
                  className="w-full bg-[#131924] border border-[#242f44] rounded-xl px-3.5 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Department info badge */}
            <div className="p-3 rounded-xl bg-[#141a27] border border-[#20293a] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <Building className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="font-medium text-[11px]">
                  {defaultSettings.semesterSection} · {defaultSettings.classroomLocation}
                </span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">
                Active Batch
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-600 hover:brightness-110 text-slate-950 font-black text-xs shadow-lg shadow-cyan-600/25 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
            >
              <span>Login to Attendance Portal</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>

            {/* Quick Demo Student Login */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={handleQuickLogin}
                className="w-full py-2.5 rounded-xl bg-[#161d2a] hover:bg-[#1d2638] border border-[#263148] text-slate-300 hover:text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Quick Login (Section &quot;B&quot; Student Demo)</span>
              </button>
            </div>
          </form>
        </div>

        {/* Official Master Timetable Adherence Note */}
        <div className="p-4 rounded-2xl bg-[#0e121b]/80 border border-[#1b2332] text-xs text-slate-400 space-y-1.5 text-center">
          <div className="flex items-center justify-center gap-1.5 text-slate-300 font-bold">
            <CalendarDays className="w-3.5 h-3.5 text-cyan-400" />
            <span>Official Master Timetable Attached</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            Strictly aligned with BITM MBA Section &quot;B&quot; timetable (Effective 16-09-2026). Periods with no classes are excluded from tracking. Clean attendance begins at 0.0%.
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-slate-500 font-medium">
          Ballari Institute of Technology and Management · Autonomous Institution under VTU
        </p>
      </div>
    </div>
  );
};
