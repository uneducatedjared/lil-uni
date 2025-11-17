export type Priority = '低' | '中' | '高';
export type Category = '全部' | '工作' | '学习' | '生活' | '其他' | string;

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  category?: Category;
  priority?: Priority;
  dueDate?: string | null; // ISO date string
  reminder?: string | null; // ISO date string
  completed: boolean;
  createdAt: string;
}
