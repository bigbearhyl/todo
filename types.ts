export enum TaskStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED'
}

export interface SubTask {
  id: string;
  content: string;
  isCompleted: boolean;
  completedAt?: string; // ISO String
}

export interface Task {
  id: string;
  title: string;
  description: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  status: TaskStatus;
  completedAt?: string; // ISO String
  subTasks: SubTask[];
  createdAt: string;
}

export interface CreateTaskPayload {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
}

export interface AISettings {
  apiKey: string;
  baseUrl: string;
  modelName: string;
}
