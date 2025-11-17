"use client";
import React, { useEffect, useState, useRef} from 'react';
import { Task, Category } from '../types/task';
import TaskItem from './TaskItem';
import * as db from '../lib/db';
import { scheduleReminders, clearAllReminders } from '../lib/reminder';

type Props = {
  initialCategory?: Category;
};

export default function TaskList({ initialCategory = 'All' }: Props) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [category, setCategory] = useState<Category>(initialCategory);
  const [sortBy, setSortBy] = useState<'created' | 'due' | 'priority'>('created');
  const [isSortDropdownOpen, setSortDropdownOpen] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    load();
    function onReload() {
      load();
    }
    window.addEventListener('reload-tasks', onReload);
    return () => {
      window.removeEventListener('reload-tasks', onReload);
      clearAllReminders();
    };
  }, []);


  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setSortDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [sortDropdownRef]);

  async function load() {
    const all = await db.getAllTasks();
    const sortedAll = all.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    setTasks(sortedAll);
    // schedule reminders for tasks (best-effort, in-page)
    scheduleReminders(sortedAll);
  }

  // ensure we clear reminders when unmounting component
  useEffect(() => {
    return () => clearAllReminders();
  }, []);

  async function handleToggle(id: string) {
    const t = await db.getTask(id);
    if (!t) return;
    t.completed = !t.completed;
    await db.updateTask(t);
    load();
  }

  async function handleDelete(id: string) {
    await db.deleteTask(id);
    load();
  }

  function openTask(t: Task) {
    // simple inspect: open modal via dispatching custom event
    window.dispatchEvent(new CustomEvent('open-task', { detail: t }));
  }

  const filtered = tasks.filter((t) => category === 'All' || t.category === category);

  const sorted = filtered.sort((a, b) => {
    if (sortBy === 'due') {
      const da = a.dueDate ? +new Date(a.dueDate) : Infinity;
      const dbb = b.dueDate ? +new Date(b.dueDate) : Infinity;
      return da - dbb;
    }
    if (sortBy === 'priority') {
      const score = (p?: string) => (p === 'high' ? 1 : p === 'medium' ? 2 : 3);
      return score(a.priority) - score(b.priority);
    }
    return +new Date(b.createdAt) - +new Date(a.createdAt);
  });

  return (
    <div>
      <div className="controls">
        <div className="tabs">
          {['All', 'Work', 'Study', 'Life', 'Others'].map((c) => (
            <button
              key={c}
              className={c === category ? 'active' : ''}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="custom-dropdown-container" ref={sortDropdownRef}>
          <button className="sort-trigger" onClick={() => setSortDropdownOpen(!isSortDropdownOpen)}>
            <span className="sort-icon">⇅</span> Sort
          </button>
          {isSortDropdownOpen && (
            <div className="dropdown-menu">
              <button
                onClick={() => {
                  setSortBy('created');
                  setSortDropdownOpen(false);
                }}
              >
                Created date
              </button>
              <button
                onClick={() => {
                  setSortBy('due');
                  setSortDropdownOpen(false);
                }}
              >
                Due date
              </button>
              <button
                onClick={() => {
                  setSortBy('priority');
                  setSortDropdownOpen(false);
                }}
              >
                Priority
              </button>
            </div>
          )}
        </div>
      </div>

      <div role="list" className="task-list">
        {sorted.map((t) => (
          <TaskItem key={t.id} task={t} onToggle={handleToggle} onDelete={handleDelete} onOpen={openTask} />
        ))}
        {sorted.length === 0 && <div className="empty">No tasks yet — press + to add one</div>}
      </div>
    </div>
  );
}
