import { openDB, IDBPDatabase } from 'idb';
import { Task } from '../types/task';

const DB_NAME = 'lil-uni-todo-db';
const STORE = 'tasks';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE)) {
          const store = db.createObjectStore(STORE, { keyPath: 'id' });
          store.createIndex('by-created', 'createdAt');
          store.createIndex('by-due', 'dueDate');
          store.createIndex('by-category', 'category');
        }
      },
    });
  }
  return dbPromise;
}

export async function getAllTasks(): Promise<Task[]> {
  const db = await getDB();
  return (await db.getAll(STORE)) as Task[];
}

export async function getTask(id: string): Promise<Task | undefined> {
  const db = await getDB();
  return (await db.get(STORE, id)) as Task | undefined;
}

export async function addTask(task: Task): Promise<void> {
  const db = await getDB();
  await db.put(STORE, task);
}

export async function updateTask(task: Task): Promise<void> {
  const db = await getDB();
  await db.put(STORE, task);
}

export async function deleteTask(id: string): Promise<void> {
  const db = await getDB();
  await db.delete(STORE, id);
}

export async function clearAll(): Promise<void> {
  const db = await getDB();
  await db.clear(STORE);
}
