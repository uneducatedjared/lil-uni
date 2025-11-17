import { Task } from '../types/task';

const timeouts = new Map<string, number>();

function showNotification(title: string, body?: string) {
  if (typeof window === 'undefined') return;
  if (Notification.permission === 'granted') {
    try {
      new Notification(title, { body });
    } catch (e) {
      // ignore
    }
  }
}

export function clearAllReminders() {
  for (const id of timeouts.keys()) {
    const t = timeouts.get(id)!;
    window.clearTimeout(t);
  }
  timeouts.clear();
}

export function scheduleReminders(tasks: Task[]) {
  if (typeof window === 'undefined') return;
  if (!('Notification' in window)) return;

  // request permission if needed
  if (Notification.permission === 'default') {
    Notification.requestPermission().catch(() => {});
  }

  clearAllReminders();

  const now = Date.now();
  for (const t of tasks) {
    if (!t.reminder || t.completed) continue;
    const when = +new Date(t.reminder);
    if (isNaN(when)) continue;
    const delay = when - now;
    if (delay <= 0) {
      // past — show immediately
      showNotification(`Reminder: ${t.title}`, t.description || '');
      continue;
    }
    const timeoutId = window.setTimeout(() => {
      showNotification(`Reminder: ${t.title}`, t.description || '');
      timeouts.delete(t.id);
    }, delay);
    timeouts.set(t.id, timeoutId);
  }
}
