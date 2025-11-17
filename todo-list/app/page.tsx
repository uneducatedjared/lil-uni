"use client";
import React from 'react';
import TaskList from '../components/TaskList';
import TaskModal from '../components/TaskModal';

export default function Page() {
  function openNew() {
    // dispatch with null detail to indicate new task
    window.dispatchEvent(new CustomEvent('open-task', { detail: null }));
  }

  return (
    <main className="container">
      <header className="header">
        <div className="brand">
          <div className="avatar">🌈</div>
          <h1>My Tasks</h1>
        </div>
        <div className="controls-right">Sort</div>
      </header>

      <TaskList />

      <button className="fab" onClick={openNew} aria-label="Add Task">
        +
      </button>

      <TaskModal />
    </main>
  );
}
