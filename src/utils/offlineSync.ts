import { AttendanceRecord, AuditLog } from '../types';

const QUEUE_KEY = 'bitm_offline_attendance_queue';

// In-memory fallback if localStorage is blocked in sandboxed iframes
let inMemoryQueue: QueuedAttendanceAction[] = [];

export interface QueuedAttendanceAction {
  id: string;
  type: 'MARK' | 'UPDATE';
  record: AttendanceRecord;
  timestamp: string;
  retryCount: number;
}

export function getOfflineQueue(): QueuedAttendanceAction[] {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(QUEUE_KEY);
      if (raw) return JSON.parse(raw);
    }
  } catch {
    // storage disabled in iframe sandbox
  }
  return inMemoryQueue;
}

export function enqueueAttendanceAction(action: Omit<QueuedAttendanceAction, 'id' | 'timestamp' | 'retryCount'>): void {
  const newAction: QueuedAttendanceAction = {
    ...action,
    id: `queue-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    retryCount: 0
  };

  const queue = getOfflineQueue();
  queue.push(newAction);
  inMemoryQueue = queue;

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    }
  } catch {
    // fallback remains in memory
  }
}

export function clearOfflineQueue(): void {
  inMemoryQueue = [];
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(QUEUE_KEY);
    }
  } catch {
    // ignore
  }
}

/**
 * Simulates syncing the offline queue against the master records database.
 */
export function processOfflineSync(
  currentRecords: AttendanceRecord[],
  auditLogs: AuditLog[],
  activeUserId: string,
  activeUserName: string
): {
  updatedRecords: AttendanceRecord[];
  updatedAuditLogs: AuditLog[];
  syncedCount: number;
  conflicts: { actionId: string; reason: string }[];
} {
  const queue = getOfflineQueue();
  if (queue.length === 0) {
    return {
      updatedRecords: currentRecords,
      updatedAuditLogs: auditLogs,
      syncedCount: 0,
      conflicts: []
    };
  }

  const updatedRecords = [...currentRecords];
  const updatedLogs = [...auditLogs];
  const conflicts: { actionId: string; reason: string }[] = [];
  let syncedCount = 0;

  for (const item of queue) {
    const existingIndex = updatedRecords.findIndex(
      r => r.sessionId === item.record.sessionId && r.studentId === item.record.studentId
    );

    if (item.type === 'MARK') {
      if (existingIndex >= 0) {
        conflicts.push({
          actionId: item.id,
          reason: `Attendance for student ${item.record.studentId} in session ${item.record.sessionId} was already recorded.`
        });
      } else {
        updatedRecords.push({ ...item.record, synced: true });
        syncedCount++;
      }
    } else if (item.type === 'UPDATE') {
      if (existingIndex >= 0) {
        const originalTime = new Date(updatedRecords[existingIndex].markedAt).getTime();
        const actionTime = new Date(item.timestamp).getTime();
        const hoursDiff = (actionTime - originalTime) / (1000 * 60 * 60);

        if (hoursDiff > 24) {
          conflicts.push({
            actionId: item.id,
            reason: `24-hour edit window has expired for this attendance record.`
          });
        } else {
          updatedRecords[existingIndex] = {
            ...updatedRecords[existingIndex],
            status: item.record.status,
            updatedAt: item.timestamp,
            updatedBy: activeUserId,
            editReason: item.record.editReason,
            synced: true
          };
          syncedCount++;
        }
      } else {
        updatedRecords.push({ ...item.record, synced: true });
        syncedCount++;
      }
    }
  }

  if (syncedCount > 0) {
    updatedLogs.unshift({
      id: `log-sync-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: activeUserId,
      userName: activeUserName,
      action: 'UPDATE_ATTENDANCE',
      details: `Offline sync completed: ${syncedCount} records reconciled with server.`
    });
  }

  clearOfflineQueue();

  return {
    updatedRecords,
    updatedAuditLogs: updatedLogs,
    syncedCount,
    conflicts
  };
}
