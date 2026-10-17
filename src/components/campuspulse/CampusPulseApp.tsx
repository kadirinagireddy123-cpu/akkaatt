import React, { useState, useEffect } from 'react';
import {
  ThemePalette,
  AppearanceMode,
  AppView,
  AcademicSettings,
  CampusSubject,
  TimetablePeriodSlot,
  CampusAttendanceRecord,
  AttendanceActionStatus,
  DayScheduleMode,
  WeekdayTimetableDay
} from '../../types/campusPulse';
import {
  DEFAULT_ACADEMIC_SETTINGS,
  CAMPUS_SUBJECTS,
  WEEKLY_TIMETABLE_SLOTS,
  SATURDAY_SCHEDULE_MAPPINGS,
  generateSampleScreenshotDataset
} from '../../data/campusPulseData';
import { THEME_DEFINITIONS } from '../../utils/themeConfig';
import { getTodayDateString, getDayOfWeek } from '../../utils/dateUtils';
import { TopHeader } from './TopHeader';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { DashboardView } from './DashboardView';
import { TimetableTodayView } from './TimetableTodayView';
import { FullWeeklyTimetableView } from './FullWeeklyTimetableView';
import { CalendarHistoryView } from './CalendarHistoryView';
import { SubjectAttendanceView } from './SubjectAttendanceView';
import { ReportsAnalyticsView } from './ReportsAnalyticsView';
import { SettingsView } from './SettingsView';
import { StudentLoginPage } from './StudentLoginPage';
import { MassBunkModal } from './MassBunkModal';
import { AddSubjectModal } from './AddSubjectModal';
import { EditSubjectCountsModal } from './EditSubjectCountsModal';
import { SaturdayRoutineModal } from './SaturdayRoutineModal';
import { CheckCircle2 } from 'lucide-react';

export const CampusPulseApp: React.FC = () => {
  // Authentication Gate: Opens to Login Page whenever app is opened
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Theme palette: 'ocean' (default), 'crimson', 'emerald', 'amber', 'indigo'
  const [currentTheme, setCurrentTheme] = useState<ThemePalette>(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = window.localStorage.getItem('cp_theme');
        if (saved && (saved in THEME_DEFINITIONS)) return saved as ThemePalette;
      }
    } catch {}
    return 'ocean';
  });

  // Appearance mode: 'dark' (default), 'light', 'system'
  const [appearanceMode, setAppearanceMode] = useState<AppearanceMode>(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = window.localStorage.getItem('cp_appearance');
        if (saved) return saved as AppearanceMode;
      }
    } catch {}
    return 'dark';
  });

  useEffect(() => {
    try {
      localStorage.setItem('cp_theme', currentTheme);
      localStorage.setItem('cp_appearance', appearanceMode);
    } catch {}

    if (appearanceMode === 'dark' || (appearanceMode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [currentTheme, appearanceMode]);

  // Active navigation view
  const [activeView, setActiveView] = useState<AppView>('dashboard');

  // Selected date: Dynamic today's date (no longer hardcoded/fixed)
  const [selectedDate, setSelectedDate] = useState<string>(() => getTodayDateString());

  // Academic Settings for BITM MBA Section B (Default 85% attendance target)
  const [academicSettings, setAcademicSettings] = useState<AcademicSettings>(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = window.localStorage.getItem('cp_academic_settings_v4');
        if (saved) return JSON.parse(saved);
      }
    } catch {}
    return DEFAULT_ACADEMIC_SETTINGS;
  });

  // Subjects for BITM MBA Section B (Only subjects in timetable)
  const [subjects, setSubjects] = useState<CampusSubject[]>(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = window.localStorage.getItem('cp_subjects_v4');
        if (saved) return JSON.parse(saved);
      }
    } catch {}
    return CAMPUS_SUBJECTS;
  });

  // Attendance Records: Starts clean/empty (zero attendance) as user requested
  const [records, setRecords] = useState<CampusAttendanceRecord[]>(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = window.localStorage.getItem('cp_attendance_records_v4');
        if (saved) return JSON.parse(saved);
      }
    } catch {}
    return [];
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('cp_academic_settings_v4', JSON.stringify(academicSettings));
      localStorage.setItem('cp_subjects_v4', JSON.stringify(subjects));
      localStorage.setItem('cp_attendance_records_v4', JSON.stringify(records));

      // Remove any legacy saved members / user lists across sessions
      localStorage.removeItem('bitm_student_profile');
      localStorage.removeItem('bitm_users');
      localStorage.removeItem('cp_saved_members');
      localStorage.removeItem('cp_user_profiles');
      localStorage.removeItem('bitm_saved_members');
    } catch {}
  }, [academicSettings, subjects, records]);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Login handler
  const handleLogin = (studentData: {
    studentName: string;
    usn: string;
    department?: string;
    semesterSection?: string;
  }) => {
    setAcademicSettings(prev => ({
      ...prev,
      studentName: studentData.studentName,
      department: studentData.department || prev.department,
      semesterSection: studentData.semesterSection || prev.semesterSection
    }));
    setIsAuthenticated(true);
    showToast(`Logged in as ${studentData.studentName} (${studentData.usn})`);
  };

  // Logout handler (returns back to login page)
  const handleLogout = () => {
    setIsAuthenticated(false);
    setActiveView('dashboard');
    showToast('Signed out of student attendance portal.');
  };

  // Modals state
  const [massBunkModalOpen, setMassBunkModalOpen] = useState(false);
  const [addSubjectModalOpen, setAddSubjectModalOpen] = useState(false);
  const [saturdayRoutineModalOpen, setSaturdayRoutineModalOpen] = useState(false);
  const [editSubjectTarget, setEditSubjectTarget] = useState<{
    subject: CampusSubject;
    present: number;
    conducted: number;
  } | null>(null);

  // Day Schedule Mode per date (default 'Normal Classes')
  const [scheduleModeMap, setScheduleModeMap] = useState<Record<string, DayScheduleMode>>(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = window.localStorage.getItem('cp_schedule_mode_map_v1');
        if (saved) return JSON.parse(saved);
      }
    } catch {}
    return {};
  });

  // Saturday Timetable Routine per Saturday date (default from circular mapping or 'Mon')
  const [saturdayRoutineMap, setSaturdayRoutineMap] = useState<Record<string, WeekdayTimetableDay>>(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = window.localStorage.getItem('cp_saturday_routines_v1');
        if (saved) return JSON.parse(saved);
      }
    } catch {}
    const initialMap: Record<string, WeekdayTimetableDay> = {};
    SATURDAY_SCHEDULE_MAPPINGS.forEach(item => {
      initialMap[item.date] = item.mappedDay as WeekdayTimetableDay;
    });
    return initialMap;
  });

  const rawDayOfWeek = getDayOfWeek(selectedDate);
  const isSaturday = rawDayOfWeek === 'Sat';
  const currentScheduleMode: DayScheduleMode = scheduleModeMap[selectedDate] || 'Normal Classes';

  const defaultSaturdayMapped = SATURDAY_SCHEDULE_MAPPINGS.find(m => m.date === selectedDate)?.mappedDay as WeekdayTimetableDay | undefined;
  const currentSaturdayRoutine: WeekdayTimetableDay = saturdayRoutineMap[selectedDate] || defaultSaturdayMapped || 'Mon';

  const handleSelectScheduleMode = (mode: DayScheduleMode) => {
    setScheduleModeMap(prev => {
      const updated = { ...prev, [selectedDate]: mode };
      try {
        localStorage.setItem('cp_schedule_mode_map_v1', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    showToast(`Schedule Mode: ${mode}`);
    // When on Saturday and day schedule mode is Normal Classes, ask which day's timetable!
    if (isSaturday && mode === 'Normal Classes') {
      setSaturdayRoutineModalOpen(true);
    }
  };

  const handleSelectSaturdayRoutineDay = (day: WeekdayTimetableDay) => {
    setSaturdayRoutineMap(prev => {
      const updated = { ...prev, [selectedDate]: day };
      try {
        localStorage.setItem('cp_saturday_routines_v1', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    const dayLabels: Record<WeekdayTimetableDay, string> = {
      Mon: 'Monday',
      Tue: 'Tuesday',
      Wed: 'Wednesday',
      Thu: 'Thursday',
      Fri: 'Friday'
    };
    showToast(`Saturday schedule set to ${dayLabels[day]}'s timetable`);
  };

  // Auto prompt if student opens Saturday and schedule mode is Normal Classes but no routine explicitly saved
  useEffect(() => {
    if (isSaturday && currentScheduleMode === 'Normal Classes' && !saturdayRoutineMap[selectedDate]) {
      setSaturdayRoutineModalOpen(true);
    }
  }, [selectedDate, isSaturday, currentScheduleMode]);

  // Compute timetable slots for the selected date's day of week
  let effectiveDay: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun' = rawDayOfWeek;
  if (isSaturday) {
    if (currentScheduleMode === 'Normal Classes') {
      effectiveDay = currentSaturdayRoutine;
    }
  }

  const todaySlots = (isSaturday && currentScheduleMode !== 'Normal Classes')
    ? []
    : WEEKLY_TIMETABLE_SLOTS.filter(s => s.day === effectiveDay);

  // Mark a specific slot
  const handleMarkSlot = (slot: TimetablePeriodSlot, status: AttendanceActionStatus) => {
    setRecords(prev => {
      const existingIdx = prev.findIndex(
        r => r.date === selectedDate && r.periodId === slot.id && r.subjectCode === slot.subjectCode
      );

      const newRecord: CampusAttendanceRecord = {
        id: `rec-${selectedDate}-${slot.id}-${Date.now()}`,
        date: selectedDate,
        periodId: slot.id,
        subjectCode: slot.subjectCode,
        status,
        timestamp: new Date().toISOString()
      };

      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx] = newRecord;
        return copy;
      }
      return [...prev, newRecord];
    });

    const labelMap: Record<AttendanceActionStatus, string> = {
      present: 'Present ✓',
      absent: 'Absent (Bunked) ✗',
      cancelled: 'Class Cancelled',
      holiday: 'Marked Holiday'
    };
    showToast(`${slot.subjectCode}: ${labelMap[status]}`);
  };

  // Mark entire day as holiday
  const handleMarkEntireDayHoliday = () => {
    if (todaySlots.length === 0) return;
    setRecords(prev => {
      const copy = [...prev];
      todaySlots.forEach(slot => {
        const existingIdx = copy.findIndex(
          r => r.date === selectedDate && r.periodId === slot.id && r.subjectCode === slot.subjectCode
        );
        const newRecord: CampusAttendanceRecord = {
          id: `rec-${selectedDate}-${slot.id}-${Date.now()}`,
          date: selectedDate,
          periodId: slot.id,
          subjectCode: slot.subjectCode,
          status: 'holiday',
          timestamp: new Date().toISOString()
        };
        if (existingIdx >= 0) {
          copy[existingIdx] = newRecord;
        } else {
          copy.push(newRecord);
        }
      });
      return copy;
    });
    showToast(`Marked all ${todaySlots.length} periods on ${selectedDate} as Holiday!`);
  };

  // Execute Mass Bunk
  const handleExecuteMassBunk = (date: string, selectedSlotIds: string[]) => {
    setRecords(prev => {
      const copy = [...prev];
      selectedSlotIds.forEach(slotId => {
        const slot = WEEKLY_TIMETABLE_SLOTS.find(s => s.id === slotId);
        if (!slot) return;

        const existingIdx = copy.findIndex(
          r => r.date === date && r.periodId === slot.id && r.subjectCode === slot.subjectCode
        );
        const newRecord: CampusAttendanceRecord = {
          id: `rec-mass-${date}-${slot.id}-${Date.now()}`,
          date,
          periodId: slot.id,
          subjectCode: slot.subjectCode,
          status: 'absent',
          note: 'Mass Bunked',
          timestamp: new Date().toISOString()
        };

        if (existingIdx >= 0) {
          copy[existingIdx] = newRecord;
        } else {
          copy.push(newRecord);
        }
      });
      return copy;
    });
    showToast(`🚨 Mass Bunked ${selectedSlotIds.length} lectures! Marked as Absent.`);
  };

  // Quick log on subject card (+ Present / + Absent)
  const handleQuickLog = (subjectCode: string, status: AttendanceActionStatus) => {
    const newRecord: CampusAttendanceRecord = {
      id: `rec-quick-${Date.now()}`,
      date: selectedDate,
      periodId: `quick-${Date.now()}`,
      subjectCode,
      status,
      timestamp: new Date().toISOString()
    };
    setRecords(prev => [...prev, newRecord]);
    showToast(`${subjectCode}: +1 ${status === 'present' ? 'Present' : 'Absent'} logged!`);
  };

  // Save manual counts overwrite
  const handleSaveManualCounts = (subjectCode: string, presentCount: number, conductedCount: number) => {
    const absentCount = conductedCount - presentCount;

    setRecords(prev => {
      const filtered = prev.filter(r => r.subjectCode !== subjectCode);
      const newItems: CampusAttendanceRecord[] = [];

      for (let i = 0; i < presentCount; i++) {
        newItems.push({
          id: `manual-p-${subjectCode}-${i}`,
          date: '2026-09-01',
          periodId: 'p-man',
          subjectCode,
          status: 'present',
          timestamp: new Date().toISOString()
        });
      }
      for (let j = 0; j < absentCount; j++) {
        newItems.push({
          id: `manual-a-${subjectCode}-${j}`,
          date: '2026-09-02',
          periodId: 'p-man',
          subjectCode,
          status: 'absent',
          timestamp: new Date().toISOString()
        });
      }
      return [...filtered, ...newItems];
    });

    showToast(`Updated ${subjectCode}: ${presentCount} / ${conductedCount} classes.`);
  };

  // Delete a historical record
  const handleDeleteRecord = (id: string) => {
    setRecords(prev => prev.filter(r => r.id !== id));
    showToast('Record deleted.');
  };

  // Add a new subject
  const handleAddSubject = (newSubject: CampusSubject) => {
    setSubjects(prev => {
      if (prev.some(s => s.code === newSubject.code)) return prev;
      return [...prev, newSubject];
    });
    showToast(`Subject ${newSubject.code} added!`);
  };

  // Reset all to zero
  const handleResetToZero = () => {
    if (window.confirm('Reset all attendance counts to ZERO (0/0 classes)?')) {
      setRecords([]);
      showToast('All attendance records reset to zero (0%)!');
    }
  };

  // Load sample 87% screenshot dataset
  const handleLoadScreenshotDemoData = () => {
    const demoData = generateSampleScreenshotDataset();
    setRecords(demoData);
    showToast('Loaded Screenshot Demo Dataset (87% overall attendance, 192 conducted, 167 present)!');
  };

  // When opening the app, open Login Page with no saved members
  if (!isAuthenticated) {
    return (
      <StudentLoginPage
        onLogin={handleLogin}
        defaultSettings={academicSettings}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#07090d] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Toast Notice */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#161d2b] border border-cyan-500/40 text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header matching Screenshot 1 with VTU 85% & 90% indicators and Logout */}
      <TopHeader
        currentTheme={currentTheme}
        onSelectTheme={setCurrentTheme}
        appearanceMode={appearanceMode}
        onToggleAppearance={() =>
          setAppearanceMode(prev => (prev === 'dark' ? 'light' : 'dark'))
        }
        onOpenMassBunk={() => setMassBunkModalOpen(true)}
        onResetToZero={handleResetToZero}
        onLogout={handleLogout}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        academicSettings={academicSettings}
      />

      {/* Main Body Layout: Sidebar + Viewport */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        {/* Left Sidebar matching Screenshot 1 */}
        <Sidebar
          activeView={activeView}
          onSelectView={setActiveView}
          onOpenMassBunk={() => setMassBunkModalOpen(true)}
          currentTheme={currentTheme}
          onLogout={handleLogout}
        />

        {/* Center Main Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-24 lg:pb-8">
          {activeView === 'dashboard' && (
            <DashboardView
              academicSettings={academicSettings}
              currentTheme={currentTheme}
              onSelectTheme={setCurrentTheme}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              subjects={subjects}
              todaySlots={todaySlots}
              records={records}
              onMarkSlot={handleMarkSlot}
              onOpenMassBunk={() => setMassBunkModalOpen(true)}
              onNavigateToTimetable={() => setActiveView('timetable')}
              onNavigateToFullTimetable={() => setActiveView('weekly_timetable')}
              onResetToZero={handleResetToZero}
              scheduleMode={currentScheduleMode}
              onSelectScheduleMode={handleSelectScheduleMode}
              saturdayRoutineDay={currentSaturdayRoutine}
              onSelectSaturdayRoutineDay={handleSelectSaturdayRoutineDay}
              onOpenSaturdayRoutineModal={() => setSaturdayRoutineModalOpen(true)}
            />
          )}

          {activeView === 'timetable' && (
            <TimetableTodayView
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              slots={todaySlots}
              records={records}
              onMarkSlot={handleMarkSlot}
              onMarkEntireDayHoliday={handleMarkEntireDayHoliday}
              onOpenMassBunk={() => setMassBunkModalOpen(true)}
              onNavigateToFullTimetable={() => setActiveView('weekly_timetable')}
              scheduleMode={currentScheduleMode}
              onSelectScheduleMode={handleSelectScheduleMode}
              saturdayRoutineDay={currentSaturdayRoutine}
              onSelectSaturdayRoutineDay={handleSelectSaturdayRoutineDay}
              onOpenSaturdayRoutineModal={() => setSaturdayRoutineModalOpen(true)}
            />
          )}

          {activeView === 'weekly_timetable' && (
            <FullWeeklyTimetableView
              academicSettings={academicSettings}
              onNavigateToToday={() => setActiveView('timetable')}
            />
          )}

          {activeView === 'calendar' && (
            <CalendarHistoryView
              records={records}
              subjects={subjects}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              onDeleteRecord={handleDeleteRecord}
            />
          )}

          {activeView === 'subjects' && (
            <SubjectAttendanceView
              subjects={subjects}
              records={records}
              academicSettings={academicSettings}
              onOpenAddSubject={() => setAddSubjectModalOpen(true)}
              onEditSubjectCounts={(sub, pres, cond) =>
                setEditSubjectTarget({ subject: sub, present: pres, conducted: cond })
              }
              onQuickLog={handleQuickLog}
            />
          )}

          {activeView === 'reports' && (
            <ReportsAnalyticsView
              subjects={subjects}
              records={records}
              academicSettings={academicSettings}
              onResetToZero={handleResetToZero}
              onLoadScreenshotDemoData={handleLoadScreenshotDemoData}
            />
          )}

          {activeView === 'backup' && (
            <ReportsAnalyticsView
              subjects={subjects}
              records={records}
              academicSettings={academicSettings}
              onResetToZero={handleResetToZero}
              onLoadScreenshotDemoData={handleLoadScreenshotDemoData}
            />
          )}

          {activeView === 'settings' && (
            <SettingsView
              currentTheme={currentTheme}
              onSelectTheme={setCurrentTheme}
              appearanceMode={appearanceMode}
              onSelectAppearanceMode={setAppearanceMode}
              academicSettings={academicSettings}
              onSaveAcademicSettings={setAcademicSettings}
              onResetToZero={handleResetToZero}
              onLogout={handleLogout}
            />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation for phones */}
      <MobileNav
        activeView={activeView}
        onSelectView={setActiveView}
        onOpenMassBunk={() => setMassBunkModalOpen(true)}
        currentTheme={currentTheme}
      />

      {/* Modals */}
      <MassBunkModal
        isOpen={massBunkModalOpen}
        onClose={() => setMassBunkModalOpen(false)}
        selectedDate={selectedDate}
        slots={todaySlots}
        records={records}
        academicSettings={academicSettings}
        onExecuteMassBunk={handleExecuteMassBunk}
      />

      <AddSubjectModal
        isOpen={addSubjectModalOpen}
        onClose={() => setAddSubjectModalOpen(false)}
        onAddSubject={handleAddSubject}
      />

      <EditSubjectCountsModal
        isOpen={Boolean(editSubjectTarget)}
        onClose={() => setEditSubjectTarget(null)}
        subject={editSubjectTarget?.subject || null}
        currentPresent={editSubjectTarget?.present || 0}
        currentConducted={editSubjectTarget?.conducted || 0}
        onSaveCounts={handleSaveManualCounts}
      />

      {/* Saturday Timetable Routine Selection Modal */}
      <SaturdayRoutineModal
        isOpen={saturdayRoutineModalOpen}
        onClose={() => setSaturdayRoutineModalOpen(false)}
        selectedDate={selectedDate}
        activeRoutineDay={currentSaturdayRoutine}
        onSelectRoutineDay={handleSelectSaturdayRoutineDay}
      />
    </div>
  );
};
