import { AttendanceRecord, AttendanceStatus } from '../types';

export const MANDATORY_MINIMUM_PERCENTAGE = 85; // Configured institutional minimum: 85%
export const STATUTORY_VTU_FLOOR = 75; // Absolute statutory VTU minimum

export interface SubjectAttendanceMetrics {
  subjectCode: string;
  totalConducted: number;
  attended: number;
  absent: number;
  late: number;
  onDuty: number;
  percentage: number;
  status: 'safe' | 'warning' | 'defaulter';
  classesNeededFor85: number;
  classesNeededFor75: number;
  bunkAllowanceFor85: number;
  bunkAllowanceFor75: number;
}

export interface StudentOverallMetrics {
  totalConductedAllSubjects: number;
  totalAttendedAllSubjects: number;
  overallPercentage: number;
  status: 'safe' | 'warning' | 'defaulter';
  subjectBreakdown: SubjectAttendanceMetrics[];
}

/**
 * Calculates attendance metrics for a specific subject based on recorded sessions.
 * Standard institutional minimum is 85%.
 */
export function calculateSubjectAttendance(
  subjectCode: string,
  records: AttendanceRecord[],
  studentId: string
): SubjectAttendanceMetrics {
  const studentRecords = records.filter(
    r => r.studentId === studentId && r.subjectCode === subjectCode
  );

  // Cancelled or free periods do not count towards conducted classes
  const validRecords = studentRecords.filter(r => r.status !== 'cancelled');
  const totalConducted = validRecords.length;
  let attended = 0;
  let absent = 0;
  let late = 0;
  let onDuty = 0;

  for (const r of validRecords) {
    if (r.status === 'present') attended++;
    else if (r.status === 'absent') absent++;
    else if (r.status === 'late') {
      late++;
      attended++; // Late counted as attended in class
    } else if (r.status === 'od') {
      onDuty++;
      attended++; // Approved OD counts as attended per institutional regulations
    }
  }

  const effectiveAttended = attended;
  const percentage = totalConducted > 0 ? (effectiveAttended / totalConducted) * 100 : 0;
  const roundedPercentage = Math.round(percentage * 10) / 10;

  // Status tiers based on 85% minimum percentage requirement:
  let status: 'safe' | 'warning' | 'defaulter' = 'safe';
  if (totalConducted > 0) {
    if (roundedPercentage < MANDATORY_MINIMUM_PERCENTAGE) {
      status = 'defaulter'; // < 85%
    } else if (roundedPercentage < 90) {
      status = 'warning'; // 85% to 89.9%
    } else {
      status = 'safe'; // >= 90%
    }
  }

  // Classes needed to reach 85% and statutory 75%
  const classesNeededFor85 = totalConducted > 0 ? calculateClassesNeeded(effectiveAttended, totalConducted, MANDATORY_MINIMUM_PERCENTAGE) : 0;
  const classesNeededFor75 = totalConducted > 0 ? calculateClassesNeeded(effectiveAttended, totalConducted, STATUTORY_VTU_FLOOR) : 0;

  // Bunk allowance to maintain 85% and 75%
  const bunkAllowanceFor85 = totalConducted > 0 ? calculateBunkAllowance(effectiveAttended, totalConducted, MANDATORY_MINIMUM_PERCENTAGE) : 0;
  const bunkAllowanceFor75 = totalConducted > 0 ? calculateBunkAllowance(effectiveAttended, totalConducted, STATUTORY_VTU_FLOOR) : 0;

  return {
    subjectCode,
    totalConducted,
    attended: effectiveAttended - onDuty,
    absent,
    late,
    onDuty,
    percentage: roundedPercentage,
    status,
    classesNeededFor85,
    classesNeededFor75,
    bunkAllowanceFor85,
    bunkAllowanceFor75
  };
}

/**
 * Calculates consecutive classes needed to attain target percentage T (e.g. 85).
 * Formula: k = ceil((T*c - a) / (1 - T))
 */
export function calculateClassesNeeded(attended: number, conducted: number, targetPercent: number): number {
  if (conducted === 0) return 0;
  const targetFraction = targetPercent / 100;
  if (attended / conducted >= targetFraction) return 0;

  const numerator = targetFraction * conducted - attended;
  const denominator = 1 - targetFraction;
  const needed = Math.ceil(numerator / denominator);
  return Math.max(0, needed);
}

/**
 * Calculates consecutive classes student can safely miss (bunk) without dropping below targetPercent.
 * Formula: b = floor((attended / targetFraction) - conducted)
 */
export function calculateBunkAllowance(attended: number, conducted: number, targetPercent: number): number {
  if (conducted === 0) return 0;
  const targetFraction = targetPercent / 100;
  if (attended / conducted < targetFraction) return 0;

  const maxAllowedConducted = Math.floor(attended / targetFraction);
  const allowance = maxAllowedConducted - conducted;
  return Math.max(0, allowance);
}

/**
 * Simulates future attendance based on student-defined attendance plan against 85% target.
 */
export function simulateAttendanceProjection(
  currentAttended: number,
  currentConducted: number,
  futureClassesCount: number,
  futureClassesToAttend: number,
  targetThreshold = MANDATORY_MINIMUM_PERCENTAGE
): { projectedPercentage: number; meetsVTUThreshold: boolean; delta: number } {
  const newAttended = currentAttended + futureClassesToAttend;
  const newConducted = currentConducted + futureClassesCount;
  const projected = newConducted > 0 ? (newAttended / newConducted) * 100 : 100;
  const rounded = Math.round(projected * 10) / 10;
  const currentPct = currentConducted > 0 ? (currentAttended / currentConducted) * 100 : 100;

  return {
    projectedPercentage: rounded,
    meetsVTUThreshold: rounded >= targetThreshold,
    delta: Math.round((rounded - currentPct) * 10) / 10
  };
}
