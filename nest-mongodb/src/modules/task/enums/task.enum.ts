export enum TaskStatus {
  PENDING = 'pending',
  ASSIGNED = 'assigned',
  COMPLETED = 'completed',
}

export type TaskWithoutPending = Extract<TaskStatus, TaskStatus.PENDING>;
