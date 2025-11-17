"use client";
import React, { useEffect, useState } from 'react';
import { Task } from '../types/task';
import * as db from '../lib/db';
import { v4 as uuidv4 } from 'uuid';

type Props = {};

export default function TaskModal(_: Props) {
  const [open, setOpen] = useState(false);
  const [task, setTask] = useState<Partial<Task> | null>(null);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderOption, setReminderOption] = useState<'1h' | '1d'>('1h');

  useEffect(() => {
    function handler(e: any) {
      const detail = e?.detail;
      const base = { priority: '中', category: '其他' };
      const initial = detail == null ? base : { ...base, ...detail };
      // determine reminder state from provided detail (if any)
      if (initial.reminder && initial.dueDate) {
        try {
          const due = +new Date(initial.dueDate);
          const rem = +new Date(initial.reminder);
          const diff = due - rem;
          if (diff > 0 && Math.abs(diff - 1000 * 60 * 60) < 1000 * 60 * 30) {
            // ~1 hour before
            setReminderOption('1h');
            setReminderEnabled(true);
          } else if (diff > 0 && Math.abs(diff - 1000 * 60 * 60 * 24) < 1000 * 60 * 30) {
            // ~1 day before
            setReminderOption('1d');
            setReminderEnabled(true);
          } else {
            setReminderEnabled(false);
          }
        } catch (e) {
          setReminderEnabled(false);
        }
      } else {
        setReminderEnabled(false);
      }
      // normalize category if it's lowercased previously
      if (initial && typeof initial.category === 'string') {
        const cat = initial.category;
        const mapping: Record<string, string> = {
          work: 'Work',
          study: 'Study',
          life: 'Life',
          others: 'Others',
        };
        if (mapping[cat]) initial.category = mapping[cat];
      }
      setTask(initial);
      setOpen(true);
    }
    window.addEventListener('open-task', handler as any);
    return () => window.removeEventListener('open-task', handler as any);
  }, []);

  function close() {
    setOpen(false);
    setTask(null);
  }

  async function save() {
    if (!task || !task.title) return;
    const now = new Date().toISOString();
    // compute reminder datetime if enabled and dueDate exists
    let computedReminder: string | null = null;
    if (reminderEnabled && task.dueDate) {
      try {
        const dueMs = +new Date(task.dueDate as string);
        const offset = reminderOption === '1h' ? 1000 * 60 * 60 : 1000 * 60 * 60 * 24;
        const when = new Date(dueMs - offset);
        computedReminder = when.toISOString();
      } catch (e) {
        computedReminder = null;
      }
    }

    const newTask: Task = {
      id: (task as any).id || uuidv4(),
      title: task.title!,
      description: task.description || '',
      category: (task.category as any) || '其他',
      priority: (task.priority as any) || '中',
      dueDate: task.dueDate || null,
      reminder: computedReminder,
      completed: !!task.completed,
      createdAt: (task as any).createdAt || now,
    };
    await db.addTask(newTask);
    close();
    window.dispatchEvent(new CustomEvent('reload-tasks'));
  }

  // helper: convert ISO string (UTC) to `datetime-local` local string "YYYY-MM-DDTHH:MM"
  function formatToDatetimeLocal(iso: string) {
    try {
      const d = new Date(iso);
      if (isNaN(+d)) return '';
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch (e) {
      return '';
    }
  }

  // helper: convert `datetime-local` value (local) to ISO string (UTC)
  function toISOStringFromLocal(localValue: string) {
    try {
      if (!localValue) return '';
      const d = new Date(localValue);
      return d.toISOString();
    } catch (e) {
      return '';
    }
  }

  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={close}>
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <button className="modal-close-btn" onClick={close} aria-label="Close modal">
          ×
        </button>

        <div className="modal-header">
          <input
            className="modal-title-input"
            placeholder="Title"
            aria-label="Task title"
            value={task?.title || ''}
            onChange={(e) => setTask({ ...task, title: e.target.value })}
          />
          <textarea
            className="modal-desc-input"
            placeholder="Add more details..."
            aria-label="Task description"
            rows={3}
            value={task?.description || ''}
            onChange={(e) => setTask({ ...task, description: e.target.value })}
          />
        </div>

        <div className="modal-body">
          <div className="modal-grid">
            <div className="meta-row">
              <span className="meta-label">优先级</span>
              <select
                className="meta-value"
                value={task?.priority || '中'}
                onChange={(e) => setTask({ ...task, priority: e.target.value as any })}
                aria-label="Priority"
              >
                <option value="低">低</option>
                <option value="中">中</option>
                <option value="高">高</option>
              </select>
            </div>

            <div className="meta-row">
              <span className="meta-label">类别</span>
              <select
                className="meta-value"
                value={task?.category || '其他'}
                onChange={(e) => setTask({ ...task, category: e.target.value as any })}
                aria-label="Category"
              >
                <option value="工作">工作</option>
                <option value="学习">学习</option>
                <option value="生活">生活</option>
                <option value="其他">其他</option>
              </select>
            </div>

            <div className="meta-row">
              <span className="meta-label">截至日期</span>
              <input
                className="meta-value"
                type="datetime-local"
                value={
                  task?.dueDate ? formatToDatetimeLocal(task.dueDate as string) : ''
                }
                onChange={(e) =>
                  setTask({ ...task, dueDate: toISOStringFromLocal(e.target.value) })
                }
                aria-label="Due date"
              />
            </div>

            <div className="meta-row">
              <span className="meta-label">提醒</span>
              <div className="meta-value" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input
                    type="checkbox"
                    checked={reminderEnabled}
                    onChange={(e) => setReminderEnabled(e.target.checked)}
                    aria-label="Enable reminder"
                  />
                </label>

                {reminderEnabled && (
                  <select
                    value={reminderOption}
                    onChange={(e) => setReminderOption(e.target.value as any)}
                    aria-label="Reminder option"
                  >
                    <option value="1h">1 小时前</option>
                    <option value="1d">1 天前</option>
                  </select>
                )}
              </div>
            </div>
          </div>
        </div>

        <hr className="modal-divider" />

        <div className="modal-actions">
          <button className="btn ghost" onClick={close}>
            取消
          </button>
          <button className="btn primary" onClick={save} disabled={!task?.title}>
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
