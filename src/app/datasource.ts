export type GanttTask = {
  id: number;
  text: string;
  type: "project" | "summary" | "task" | "milestone";
  start: Date;
  end: Date;
  duration: number;
  progress: number;
  parent?: number | null;
  open?: boolean;
  resources?: number[];
};

export type GanttLink = {
  id: number;
  source: number;
  target: number;
  type: "fs" | "sf" | "ss" | "ff" | "e2e";
};

export type GanttResource = {
  id: number;
  text: string;
  role: string;
  color: string;
};

export type GanttScale = {
  unit: "year" | "month" | "week" | "day" | "hour";
  step: number;
  format: string;
};

export type GanttColumn = {
  name: string;
  label?: string;
  width?: number;
  align?: "left" | "center" | "right";
  tree?: boolean;
};

const baseDate = new Date(2024, 3, 1); // April 1, 2024

const addDays = (days: number) => {
  const next = new Date(baseDate);
  next.setDate(baseDate.getDate() + days);
  return next;
};

export const resources: GanttResource[] = [
  { id: 1, text: "Program Management", role: "Program", color: "#6366f1" },
  { id: 2, text: "Design", role: "UX", color: "#ec4899" },
  { id: 3, text: "Frontend", role: "Engineering", color: "#0ea5e9" },
  { id: 4, text: "Backend", role: "Engineering", color: "#14b8a6" },
  { id: 5, text: "QA", role: "Quality", color: "#f97316" },
];

export const tasks: GanttTask[] = [
  {
    id: 100,
    text: "Svar Willow Program",
    type: "project",
    start: addDays(0),
    end: addDays(90),
    duration: 90,
    progress: 0.42,
    open: true,
  },
  {
    id: 110,
    text: "Discovery",
    type: "summary",
    start: addDays(0),
    end: addDays(20),
    duration: 20,
    progress: 0.75,
    parent: 100,
    resources: [1],
  },
  {
    id: 111,
    text: "Stakeholder Interviews",
    type: "task",
    start: addDays(1),
    end: addDays(7),
    duration: 6,
    progress: 1,
    parent: 110,
    resources: [1],
  },
  {
    id: 112,
    text: "Experience Mapping",
    type: "task",
    start: addDays(4),
    end: addDays(14),
    duration: 10,
    progress: 0.6,
    parent: 110,
    resources: [2],
  },
  {
    id: 120,
    text: "Design System",
    type: "summary",
    start: addDays(18),
    end: addDays(40),
    duration: 22,
    progress: 0.55,
    parent: 100,
    resources: [2],
  },
  {
    id: 121,
    text: "Visual Exploration",
    type: "task",
    start: addDays(18),
    end: addDays(27),
    duration: 9,
    progress: 0.9,
    parent: 120,
    resources: [2],
  },
  {
    id: 122,
    text: "Component Library",
    type: "task",
    start: addDays(25),
    end: addDays(40),
    duration: 15,
    progress: 0.3,
    parent: 120,
    resources: [2, 3],
  },
  {
    id: 130,
    text: "Implementation",
    type: "summary",
    start: addDays(38),
    end: addDays(78),
    duration: 40,
    progress: 0.35,
    parent: 100,
    resources: [3, 4],
  },
  {
    id: 131,
    text: "Frontend Sprint",
    type: "task",
    start: addDays(38),
    end: addDays(58),
    duration: 20,
    progress: 0.55,
    parent: 130,
    resources: [3],
  },
  {
    id: 132,
    text: "API Stabilization",
    type: "task",
    start: addDays(44),
    end: addDays(70),
    duration: 26,
    progress: 0.25,
    parent: 130,
    resources: [4],
  },
  {
    id: 140,
    text: "Validation",
    type: "summary",
    start: addDays(70),
    end: addDays(90),
    duration: 20,
    progress: 0.1,
    parent: 100,
    resources: [5],
  },
  {
    id: 141,
    text: "Regression Suite",
    type: "task",
    start: addDays(70),
    end: addDays(85),
    duration: 15,
    progress: 0.1,
    parent: 140,
    resources: [5],
  },
  {
    id: 142,
    text: "Launch",
    type: "milestone",
    start: addDays(90),
    end: addDays(90),
    duration: 0,
    progress: 0,
    parent: 140,
    resources: [1, 3, 5],
  },
];

export const links: GanttLink[] = [
  { id: 1, source: 111, target: 112, type: "fs" },
  { id: 2, source: 112, target: 121, type: "fs" },
  { id: 3, source: 121, target: 122, type: "fs" },
  { id: 4, source: 122, target: 131, type: "fs" },
  { id: 5, source: 131, target: 132, type: "fs" },
  { id: 6, source: 132, target: 141, type: "fs" },
  { id: 7, source: 141, target: 142, type: "fs" },
];

export const scales: GanttScale[] = [
  { unit: "month", step: 1, format: "MMMM yyyy" },
  { unit: "week", step: 1, format: "'Week' w" },
  { unit: "day", step: 1, format: "dd" },
];

export const columns: GanttColumn[] = [
  { name: "text", label: "Task", tree: true, width: 260 },
  { name: "start", label: "Start", width: 120 },
  { name: "end", label: "End", width: 120 },
  { name: "duration", label: "Days", align: "center", width: 80 },
  { name: "progress", label: "Progress", width: 100 },
];

export const willowData = {
  tasks,
  links,
  resources,
  scales,
  columns,
};
