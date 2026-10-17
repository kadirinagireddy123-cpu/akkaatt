/**
 * Timezone-safe local date utilities for CampusPulse.
 * Avoids UTC midnight off-by-one shifts in Western or Eastern timezones.
 */

export const getTodayDateString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const parseLocalDate = (dateStr: string): Date => {
  if (!dateStr) return new Date();
  const parts = dateStr.split('-').map(Number);
  if (parts.length === 3) {
    // Construct with hours at 12:00:00 to prevent timezone and DST shifts
    return new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0);
  }
  return new Date(dateStr);
};

export const formatLocalDateLong = (dateStr: string): string => {
  const d = parseLocalDate(dateStr);
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
};

export const formatLocalDateMedium = (dateStr: string): string => {
  const d = parseLocalDate(dateStr);
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export const formatLocalDateShort = (dateStr: string): string => {
  const d = parseLocalDate(dateStr);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export const getDayOfWeek = (
  dateStr: string
): 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun' => {
  const d = parseLocalDate(dateStr);
  const dayMap: ('Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat')[] = [
    'Sun',
    'Mon',
    'Tue',
    'Wed',
    'Thu',
    'Fri',
    'Sat'
  ];
  return dayMap[d.getDay()];
};

export const shiftDateDays = (dateStr: string, days: number): string => {
  const d = parseLocalDate(dateStr);
  d.setDate(d.getDate() + days);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const isDateToday = (dateStr: string): boolean => {
  return dateStr === getTodayDateString();
};

export const getDateForDayInCurrentWeek = (
  targetDay: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat',
  baseDateStr: string = getTodayDateString()
): string => {
  const base = parseLocalDate(baseDateStr);
  const currentDayIndex = base.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
  const targetMap: Record<string, number> = {
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6
  };
  const targetIndex = targetMap[targetDay];
  const diff = targetIndex - currentDayIndex;
  return shiftDateDays(baseDateStr, diff);
};

