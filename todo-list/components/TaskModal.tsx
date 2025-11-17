"use client";
import React, { useEffect, useState } from 'react';
import { Task } from '../types/task';
import * as db from '../lib/db';
import { v4 as  uuidv4 } from 'uuid';
import { formatToDatetimeLocal, toISOStringFromLocal } from '../lib/utils';

const ONE_HOUR_MS = 1000 * 60 * 60;
const ONE_DAY_MS = 24 * ONE_HOUR_MS;
const THIRTY_MINUTES_MS = 30 * 60 * 1000;

export default function TaskModal() {
  const [open, setOpen] = useState<boolean>(false);
  const [task, setTask] = useState<Task | null>(null);
  const [reminderEnabled, setReminderEnabled] = useState<boolean>(false);
  const [reminderOption, setReminderOption] = useState<'1h' | '1d'>('1h');

  useEffect(() => {
    function handler(e: Event) {
      const detail = (e as CustomEvent<Task>).detail;
      const base = { priority: '中' as const, category: '其他' as const };
      const initial = detail == null ? base : { ...base, ...detail };
      
      // determine reminder state from provided detail (if any)
      if (detail?.reminder && detail?.dueDate) {
        try {
          const due = +new Date(detail?.dueDate);
          const rem = +new Date(detail?.reminder);
          const diff = due - rem;
          if (diff > 0 && Math.abs(diff - ONE_HOUR_MS) < THIRTY_MINUTES_MS) {
            setReminderOption('1h');
            setReminderEnabled(true);
          } else if (diff > 0 && Math.abs(diff - ONE_DAY_MS) < THIRTY_MINUTES_MS) {
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
        const cat = initial.category.toLowerCase();
        const mapping: Record<string, Task['category']> = {
          work: '工作',
          study: '学习',
          life: '生活',
          others: '其他',
        };
        if (mapping[cat]) {
          initial.category = mapping[cat];
        }
      }

      setTask(initial as Task);
      setOpen(true);
    }
    window.addEventListener('open-task', handler);
    return () => window.removeEventListener('open-task', handler);
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
        const dueMs = +new Date(task.dueDate);
        const offset = reminderOption === '1h' ? ONE_HOUR_MS : ONE_DAY_MS;
        const when = new Date(dueMs - offset);
        computedReminder = when.toISOString();
      } catch (e) {
        computedReminder = null;
      }
    }

    const newTask: Task = {
      id: task.id || uuidv4(),
      title: task.title,
      description: task.description || '',
      category: task.category || '其他',
      priority: task.priority || '中',
      dueDate: task.dueDate || null,
      reminder: computedReminder,
      completed: !!task.completed,
      createdAt: task.createdAt || now,
    };

    await db.addTask(newTask);
    close();
    window.dispatchEvent(new CustomEvent('reload-tasks'));
  }

  if (!open || !task) return null;

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
            value={task.title || ''}
            onChange={(e) => setTask({ ...task, title: e.target.value })}
          />
          <textarea
            className="modal-desc-input"
            placeholder="Add more details..."
            aria-label="Task description"
            rows={3}
            value={task.description || ''}
            onChange={(e) => setTask({ ...task, description: e.target.value })}
          />
        </div>

        <div className="modal-body">
          <div className="modal-grid">
            <div className="meta-row">
              <span className="meta-label">优先级</span>
              <select
                className="meta-value"
                value={task.priority || '中'}
                onChange={(e) => setTask({ ...task, priority: e.target.value as Task['priority'] })}
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
                value={task.category || '其他'}
                onChange={(e) => setTask({ ...task, category: e.target.value as Task['category'] })}
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
                value={task.dueDate ? formatToDatetimeLocal(task.dueDate) : ''}
                onChange={(e) =>
                  setTask({ ...task, dueDate: toISOStringFromLocal(e.target.value) })
                }
                aria-label="Due date"
              />
            </div>

            <div className="meta-row">
              <span className="meta-label">提醒</span>
              <div className="meta-value reminder-controls">
                <input
                  type="checkbox"
                  id="reminder-toggle"
                  checked={reminderEnabled}
                  onChange={(e) => setReminderEnabled(e.target.checked)}
                  aria-label="Enable reminder"
                />
                <label htmlFor="reminder-toggle" className="toggle-switch"></label>

                {reminderEnabled && (
                  <select
                    value={reminderOption}
                    onChange={(e) => setReminderOption(e.target.value as '1h' | '1d')}
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
        <div className="modal-actions">
          <button className="btn ghost" onClick={close}>
            取消
          </button>
          <button className="btn primary" onClick={save} disabled={!task.title}>
            保存
          </button>
        </div>
      </div>
    </div>
  );
}