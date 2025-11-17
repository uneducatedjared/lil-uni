import { Task } from '../types/task';

const timeouts = new Map<string, number>();

function showNotification(title: string, body?: string) {
  if (typeof window === 'undefined') return;
  if (Notification.permission === 'granted') {
    try {
      new Notification(title, { body });
    } catch (e) {
      alert('无法显示通知。请检查浏览器设置。');
    }
  }
}

export function clearAllReminders() {
  for (const timeoutId of timeouts.values()) {
    window.clearTimeout(timeoutId);
  }
  timeouts.clear();
}

export async function scheduleReminders(tasks: Task[]) {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return;
  }

  if (Notification.permission === 'default') {
    await Notification.requestPermission().catch(() => {});
  }

  if (Notification.permission === 'denied') {
    const hasAlerted = sessionStorage.getItem('notification-permission-denied');
    if (!hasAlerted) {
      alert('您已禁用通知权限。如果需要接收任务提醒，请在浏览器设置中重新开启。');
      sessionStorage.setItem('notification-permission-denied', 'true');
    }
  }

  clearAllReminders();

  const now = Date.now();
  for (const t of tasks) {
    if (!t.reminder || t.completed) continue;
    const when = +new Date(t.reminder);
    if (isNaN(when)) continue;
    const delay = when - now;
    if (delay <= 0) {
      const whenString = new Date(when).toLocaleString();
      showNotification(`Reminder: ${t.title} in ${whenString}`, t.description || '');
      continue;
    }
    const timeoutId = window.setTimeout(() => {
      showNotification(`Reminder: ${t.title}`, t.description || '');
      timeouts.delete(t.id);
    }, delay);
    timeouts.set(t.id, timeoutId);
  }
}