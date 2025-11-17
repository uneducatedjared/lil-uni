"use client";
import React, { useEffect, useState, useRef} from 'react';
import { Task, Category } from '../types/task';
import TaskItem from './TaskItem';
import * as db from '../lib/db';
import { scheduleReminders, clearAllReminders } from '../lib/reminder';

type Props = {
  initialCategory?: Category;
};

export default function TaskList({ initialCategory = '全部' }: Props) {
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

  
  async function load() {
    const all = await db.getAllTasks();
    const sortedAll = all.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    setTasks(sortedAll);
    scheduleReminders(sortedAll);
  }

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
    window.dispatchEvent(new CustomEvent('open-task', { detail: t }));
  }

  const filtered = tasks.filter((t) => category === '全部' || t.category === category);

  const sorted = filtered.sort((a, b) => {
    if (sortBy === 'due') {
      const da = a.dueDate ? +new Date(a.dueDate) : Infinity;
      const dbb = b.dueDate ? +new Date(b.dueDate) : Infinity;
      return da - dbb;
    }
    if (sortBy === 'priority') {
      const score = (p?: string) => (p === '高' ? 1 : p === '中' ? 2 : 3);
      return score(a.priority) - score(b.priority);
    }
    return +new Date(b.createdAt) - +new Date(a.createdAt);
  });

  return (
    <div>
      <div className="controls">
        <div className="tabs">
          {['全部', '工作', '学习', '生活', '其他'].map((c) => (
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
            <span className="sort-icon">⇅</span> 排序
          </button>
          {isSortDropdownOpen && (
            <div className="dropdown-menu">
              <button
                onClick={() => {
                  setSortBy('created');
                  setSortDropdownOpen(false);
                }}
              >
                创建时间
              </button>
              <button
                onClick={() => {
                  setSortBy('due');
                  setSortDropdownOpen(false);
                }}
              >
                截至日期
              </button>
              <button
                onClick={() => {
                  setSortBy('priority');
                  setSortDropdownOpen(false);
                }}
              >
                优先级
              </button>
            </div>
          )}
        </div>
      </div>

      <div role="list" className="task-list">
        {sorted.map((t) => (
          <TaskItem key={t.id} task={t} onToggle={handleToggle} onDelete={handleDelete} onOpen={openTask} />
        ))}
        {sorted.length === 0 && <div className="empty">暂无任务 — 点击 + 添加</div>}
      </div>
    </div>
  );
}
