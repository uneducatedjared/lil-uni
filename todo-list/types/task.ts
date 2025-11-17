export type Priority = 'low' | 'medium' | 'high';
export type Category = 'All' | 'Work' | 'Study' | 'Life' | 'Others' | string;

export interface Task {
  id: string;
  title: string;
  description?: string;
  category?: Category;
  priority?: Priority;
  dueDate?: string | null; // ISO date string
  reminder?: string | null; // ISO date string
  completed: boolean;
  createdAt: string;
}
