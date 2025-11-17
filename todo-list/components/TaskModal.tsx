"use client";
import React, { useEffect, useState } from 'react';
import { Task } from '../types/task';
import * as db from '../lib/db';
import { v4 as uuidv4 } from 'uuid';

type Props = {};

export default function TaskModal(_: Props) {
  const [open, setOpen] = useState(false);
  const [task, setTask] = useState<Partial<Task> | null>(null);

  useEffect(() => {
    function handler(e: any) {
      // if detail is null or undefined, open a blank new task
      const detail = e?.detail;
      setTask(detail == null ? {} : detail);
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
    const newTask: Task = {
      id: (task as any).id || uuidv4(),
      title: task.title!,
      description: task.description || '',
      category: task.category || 'Others',
      priority: (task.priority as any) || 'medium',
      dueDate: task.dueDate || null,
      reminder: task.reminder || null,
      completed: !!task.completed,
      createdAt: (task as any).createdAt || now,
    };
    await db.addTask(newTask);
    close();
    window.dispatchEvent(new CustomEvent('reload-tasks'));
  }

  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={close}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{task?.title ? 'Edit Task' : 'New Task'}</h2>
        <input
          value={task?.title ?? ''}
          onChange={(e) => setTask({ ...(task || {}), title: e.target.value })}
          placeholder="Title"
        />
        <textarea
          value={task?.description ?? ''}
          onChange={(e) => setTask({ ...(task || {}), description: e.target.value })}
          placeholder="Add more details..."
        />
        <div className="modal-row">
          <select
            value={task?.category ?? 'Others'}
            onChange={(e) => setTask({ ...(task || {}), category: e.target.value })}
          >
            <option>Work</option>
            <option>Study</option>
            <option>Life</option>
            <option>Others</option>
          </select>
          <select
            value={task?.priority ?? 'medium'}
            onChange={(e) => setTask({ ...(task || {}), priority: e.target.value as any })}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div className="modal-actions">
          <button onClick={close} className="btn ghost">Cancel</button>
          <button onClick={save} className="btn primary">Save Changes</button>
        </div>
      </div>
    </div>
  );
}
