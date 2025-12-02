import type { Prisma, Task } from "@prisma/client";
import { TaskType } from "@prisma/client";

export class TaskInputError extends Error {}

export type TaskPayload = {
  text?: string;
  type?: string;
  start?: string | Date | null;
  end?: string | Date | null;
  progress?: number | null;
  duration?: number | null;
  parent?: number | string | null;
  details?: string | null;
  assigned?: string | number | null;
  open?: boolean | null;
  base_start?: string | Date | null;
  base_end?: string | Date | null;
};

const typeMap: Record<string, TaskType> = {
  project: TaskType.PROJECT,
  summary: TaskType.SUMMARY,
  task: TaskType.TASK,
  milestone: TaskType.MILESTONE,
};

const clamp = (value: number) => {
  if (Number.isNaN(value)) {
    return 0;
  }
  return Math.min(100, Math.max(0, Math.round(value)));
};

const toDate = (value?: string | Date | null) => {
  if (!value) {
    return null;
  }
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const toParentId = (value?: number | string | null) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  const parsed = typeof value === "string" ? Number(value) : value;
  return Number.isNaN(parsed) || parsed <= 0 ? null : parsed;
};

const toAssigned = (value?: string | number | null) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  return typeof value === "number" ? String(value) : value;
};

const resolveType = (value?: string) => {
  if (!value) {
    return TaskType.TASK;
  }
  const normalized = value.toLowerCase();
  return typeMap[normalized] ?? TaskType.TASK;
};

export const serializeTask = (task: Task) => ({
  id: task.id,
  text: task.text,
  type: task.type.toLowerCase(),
  start: task.startDate.toISOString(),
  end: task.endDate ? task.endDate.toISOString() : null,
  progress: task.progress,
  duration: task.duration ?? null,
  parent: task.parentId ?? 0,
  details: task.details ?? null,
  assigned: task.assigned ?? null,
  open: task.open ?? true,
  base_start: task.baseStart ? task.baseStart.toISOString() : null,
  base_end: task.baseEnd ? task.baseEnd.toISOString() : null,
});

export const buildCreateData = (
  payload: TaskPayload
): Prisma.TaskUncheckedCreateInput => {
  if (!payload.text) {
    throw new TaskInputError("Task title is required");
  }
  const startDate = toDate(payload.start);
  if (!startDate) {
    throw new TaskInputError("Valid start date is required");
  }

  const data: Prisma.TaskUncheckedCreateInput = {
    text: payload.text,
    type: resolveType(payload.type),
    startDate,
    endDate: toDate(payload.end),
    progress: clamp(payload.progress ?? 0),
    duration: payload.duration ?? null,
    parentId: toParentId(payload.parent),
    details: payload.details ?? null,
    assigned: toAssigned(payload.assigned),
    open: payload.open ?? true,
    baseStart: toDate(payload.base_start),
    baseEnd: toDate(payload.base_end),
  };

  return data;
};

export const buildUpdateData = (
  payload: TaskPayload
): Prisma.TaskUncheckedUpdateInput => {
  const data: Prisma.TaskUncheckedUpdateInput = {};

  if (payload.text !== undefined) {
    data.text = payload.text;
  }
  if (payload.type !== undefined) {
    data.type = resolveType(payload.type);
  }
  if (payload.start !== undefined) {
    const date = toDate(payload.start);
    if (!date) {
      throw new TaskInputError("start must be a valid date");
    }
    data.startDate = date;
  }
  if (payload.end !== undefined) {
    data.endDate = toDate(payload.end);
  }
  if (payload.progress !== undefined) {
    data.progress = clamp(payload.progress ?? 0);
  }
  if (payload.duration !== undefined) {
    data.duration = payload.duration ?? null;
  }
  if (payload.parent !== undefined) {
    data.parentId = toParentId(payload.parent);
  }
  if (payload.details !== undefined) {
    data.details = payload.details ?? null;
  }
  if (payload.assigned !== undefined) {
    data.assigned = toAssigned(payload.assigned);
  }
  if (payload.open !== undefined) {
    data.open = payload.open;
  }
  if (payload.base_start !== undefined) {
    data.baseStart = toDate(payload.base_start);
  }
  if (payload.base_end !== undefined) {
    data.baseEnd = toDate(payload.base_end);
  }

  return data;
};

export const parseTaskId = (value: string) => {
  const id = Number(value);
  if (!Number.isFinite(id) || id <= 0) {
    throw new TaskInputError("Task id must be a positive number");
  }
  return id;
};
