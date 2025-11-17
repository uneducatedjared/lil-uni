"use client";
import React from 'react';
import { Task } from '../types/task';

type Props = {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onOpen: (task: Task) => void;
};

export default function TaskItem({ task, onToggle, onDelete, onOpen }: Props) {
  return (
    <div className="task-item" role="listitem">
      <label className={`checkbox ${task.completed ? 'checked' : ''}`}>
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => onToggle(task.id)}
        />
        <span className="checkmark" />
      </label>
      <div className="task-main" onClick={() => onOpen(task)}>
        <div className={`title ${task.completed ? 'done' : ''}`}>{task.title}</div>
        <div className="meta">{task.dueDate ? new Date(task.dueDate).toLocaleString() : ''}</div>
      </div>
      <button className="delete" onClick={() => onDelete(task.id)} aria-label="Delete">
        ×
      </button>
    </div>
  );
}
