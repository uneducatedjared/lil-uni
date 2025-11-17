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
          <h1>My TODOs</h1>
        </div>
      </header>

      <TaskList />

      <button className="fab" onClick={openNew} aria-label="Add Task">
        +
      </button>

      <TaskModal />
    </main>
  );
}
