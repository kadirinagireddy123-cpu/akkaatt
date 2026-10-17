import React, { useState } from 'react';
import { GraduationCap, Lock, Eye, EyeOff, Sparkles, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';
import { StudentProfile } from '../../types/portal';

interface LoginScreenProps {
  onLogin: (usn: string, profile?: Partial<StudentProfile>) => void;
  defaultProfile: StudentProfile;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, defaultProfile }) => {
  const [usn, setUsn] = useState<string>('3BR25MBA01');
  const [password, setPassword] = useState<string>('bitm@123');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [name, setName] = useState<string>(defaultProfile.name);
  const [department, setDepartment] = useState<string>(defaultProfile.department);
  const [semesterSection, setSemesterSection] = useState<string>(defaultProfile.semesterSection);
  const [assignedRoom, setAssignedRoom] = useState<string>(defaultProfile.assignedClassroom);

  const handleAutoFill = () => {
    setUsn('3BR25MBA01');
    setPassword('bitm@123');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!usn.trim()) return;
    onLogin(usn.toUpperCase(), {
      name: name.trim() || 'Student',
      department,
      semesterSection,
      assignedClassroom: assignedRoom
    });
  };

  return (
    <div className="min-h-screen bg-[#070b14] bg-radial-at-c from-[#111c38] via-[#070b14] to-[#04060c] text-slate-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-[#4f46e5]/20 border border-[#6366f1]/40 text-[#818cf8] mx-auto flex items-center justify-center shadow-lg shadow-indigo-500/10">
            <GraduationCap className="w-8 h-8" />
          </div>

          <div>
            <div className="text-[11px] font-bold tracking-widest text-[#818cf8] uppercase">
              BALLARI INSTITUTE OF TECHNOLOGY & MANAGEMENT
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-1">
              Student Attendance Portal
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Dept. of MBA & Mgmt Studies · Semester III - B SEC · Room SH-2 / LH-10
            </p>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-[#0f172a]/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Lock className="w-4 h-4 text-indigo-400" />
              <span>Student Password Login</span>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-800/50">
              Secure Access
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* USN Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                University Seat No. (USN)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={usn}
                  onChange={e => setUsn(e.target.value.toUpperCase())}
                  placeholder="ENTER UNIVERSITY SEAT NO. (USN)"
                  className="w-full bg-[#131d31] border border-slate-700/80 rounded-xl px-3.5 py-3 text-xs font-mono font-bold tracking-wider text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">
                  Portal Password
                </label>
                <button
                  type="button"
                  onClick={() => setPassword('bitm@123')}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 underline font-mono"
                >
                  Use Default (bitm@123)
                </button>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-[#131d31] border border-slate-700/80 rounded-xl px-3.5 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Default Password Hint with Auto Fill */}
            <div className="bg-[#131d31]/70 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-slate-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  Default Password: <strong className="text-white font-mono">bitm@123</strong> or USN
                </span>
              </div>
              <button
                type="button"
                onClick={handleAutoFill}
                className="px-2 py-0.5 rounded bg-indigo-600/30 text-indigo-300 hover:bg-indigo-600/50 text-[11px] font-bold"
              >
                Auto Fill
              </button>
            </div>

            {/* Collapsible Student Profile Details */}
            <div className="border border-slate-800/80 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setShowDetails(!showDetails)}
                className="w-full px-3 py-2 bg-[#131d31]/50 hover:bg-[#131d31] flex items-center justify-between text-xs font-semibold text-slate-300"
              >
                <span>Student Profile Details</span>
                {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showDetails && (
                <div className="p-3 bg-[#0b1322] space-y-2 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Student Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full bg-[#131d31] border border-slate-700 rounded-lg p-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Semester & Section</label>
                    <input
                      type="text"
                      value={semesterSection}
                      onChange={e => setSemesterSection(e.target.value)}
                      className="w-full bg-[#131d31] border border-slate-700 rounded-lg p-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Classroom</label>
                    <input
                      type="text"
                      value={assignedRoom}
                      onChange={e => setAssignedRoom(e.target.value)}
                      className="w-full bg-[#131d31] border border-slate-700 rounded-lg p-1.5 text-xs text-white"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-transform active:scale-[0.99]"
            >
              <span>Login to Attendance Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-slate-500">
          Ballari Institute of Technology and Management (BITM) · Autonomous Institution
        </p>
      </div>
    </div>
  );
};
