import { format } from "date-fns";

type ScaleUnit = "year" | "quarter" | "month" | "week" | "day" | "hour";

type ScaleFormatter = string | ((date: Date, next?: Date) => string);

export interface DataScale {
  unit: ScaleUnit;
  step: number;
  format?: ScaleFormatter;
  css?: (date: Date) => string;
}

export interface DataTask {
  id: number;
  start: Date;
  end?: Date;
  text: string;
  progress: number;
  parent: number;
  type: string;
  open?: boolean;
  details?: string;
  assigned?: number | string;
  base_start?: Date;
  base_end?: Date;
  duration?: number;
}

export interface DataLink {
  id: number;
  source: number;
  target: number;
  type: string;
}

export interface DataSet {
  tasks: DataTask[];
  links: DataLink[];
  scales: DataScale[];
}

type DatasetName = "day" | "hour";

export const weekScaleTemplate = (a: Date, b?: Date): string => {
  const next = b ?? a;
  return `${a.getMonth()} - ${next.getMonth()}`;
};

export const weekScaleAltTemplate = (a: Date, b?: Date): string => {
  const next = b ?? a;
  return `${format(a, "MMM d")} - ${format(next, "MMM d")}`;
};

export const dayStyle = (a: Date): string => {
  const day = a.getDay() == 5 || a.getDay() == 6;
  return day ? "sday" : "";
};

export const complexScales: DataScale[] = [
  { unit: "year", step: 1, format: "yyyy" },
  { unit: "month", step: 2, format: "MMMM yyy" },
  { unit: "week", step: 1, format: "w" },
  { unit: "day", step: 1, format: "d", css: dayStyle },
];

export const bigScales: DataScale[] = [
  { unit: "year", step: 1, format: "yyyy" },
  { unit: "quarter", step: 1, format: "QQQQ yyyy" },
  { unit: "month", step: 1, format: "MMMM yyy" },
  { unit: "week", step: 1, format: weekScaleAltTemplate },
];

const generatedLinks: DataLink[] = [
  { id: 1, source: 3, target: 4, type: "e2s" },
  { id: 2, source: 1, target: 2, type: "e2s" },
  { id: 24, source: 1, target: 13, type: "s2s" },
  { id: 22, source: 1, target: 6, type: "s2s" },
  { id: 23, source: 1, target: 3, type: "s2s" },
  { id: 21, source: 8, target: 1, type: "s2s" },
  { id: 25, source: 1, target: 14, type: "s2s" },
  { id: 26, source: 1, target: 15, type: "s2s" },
  { id: 27, source: 1, target: 16, type: "s2s" },
  { id: 28, source: 1, target: 14, type: "s2s" },
  { id: 3, source: 5, target: 6, type: "s2e" },
  { id: 4, source: 8, target: 6, type: "s2s" },
];

function getTasks(prefix = "", maxSize = 50, maxYears = 100): DataTask[] {
  const tasks: DataTask[] = [];
  for (let i = 1; i <= maxSize; i++) {
    const ii = i % (365 * maxYears);

    let start = 2 + ii - (ii >= 13 ? 12 : 0);
    let end = start + 1 + Math.round(Math.random() * 2);
    tasks.push({
      id: i,
      start: new Date(2020, 2, start),
      end: new Date(2020, 2, end),
      text: prefix + "Task " + i,
      progress: Math.round((100 * i) / maxSize),
      parent: 0,
      type: "task",
    });
  }

  tasks[3].parent = 3;
  tasks[4].parent = 3;
  tasks[5].parent = 3;
  tasks[6].parent = 6;
  tasks[7].parent = 6;
  tasks[8].parent = 6;
  tasks[9].parent = 9;
  tasks[10].parent = 9;
  tasks[11].parent = 9;

  tasks[2].type = "summary";
  tasks[5].type = "summary";
  tasks[8].type = "summary";
  tasks[11].type = "summary";
  tasks[15].type = "milestone";
  delete tasks[15].end;

  return tasks;
}

const tasks: DataTask[] = [
  {
    id: 1,
    start: new Date(2024, 3, 2),
    end: new Date(2024, 3, 17),
    text: "Project planning",
    progress: 30,
    parent: 0,
    type: "summary",
    open: true,
    details: "Outline the project's scope and resources.",
    assigned: "",
  },
  {
    id: 10,
    start: new Date(2024, 3, 2),
    end: new Date(2024, 3, 5),
    text: "Marketing analysis",
    progress: 100,
    parent: 1,
    type: "task",
    details: "Analyze market trends and competitors.",
    assigned: 1,
  },
  {
    id: 11,
    start: new Date(2024, 3, 5),
    end: new Date(2024, 3, 7),
    text: "Discussions",
    progress: 100,
    parent: 1,
    type: "task",
    details: "Team discussions on project strategies.",
    assigned: "",
  },
  {
    id: 110,
    start: new Date(2024, 3, 6),
    end: new Date(2024, 3, 9),
    text: "Initial design",
    progress: 60,
    parent: 11,
    type: "task",
    details: "Draft initial design concepts.",
    assigned: "",
  },
  {
    id: 111,
    start: new Date(2024, 3, 9),
    text: "Presentation",
    progress: 0,
    parent: 11,
    type: "milestone",
    details: "Present initial designs to stakeholders.",
    assigned: "",
  },
  {
    id: 112,
    start: new Date(2024, 3, 7),
    end: new Date(2024, 3, 12),
    text: "Prototyping",
    progress: 10,
    parent: 11,
    type: "task",
    assigned: "",
  },
  {
    id: 113,
    start: new Date(2024, 3, 8),
    end: new Date(2024, 3, 17),
    text: "User testing",
    progress: 0,
    parent: 11,
    type: "task",
    assigned: "",
  },

  {
    id: 12,
    start: new Date(2024, 3, 8),
    text: "Approval of strategy",
    progress: 100,
    parent: 1,
    type: "milestone",
    assigned: "",
  },

  {
    id: 2,
    start: new Date(2024, 3, 2),
    end: new Date(2024, 3, 12),
    text: "Project management",
    progress: 10,
    parent: 0,
    type: "summary",
    open: true,
    assigned: 2,
  },
  {
    id: 20,
    start: new Date(2024, 3, 2),
    end: new Date(2024, 3, 6),
    text: "Resource planning",
    progress: 10,
    parent: 2,
    type: "task",
    assigned: "",
  },
  {
    id: 21,
    start: new Date(2024, 3, 6),
    end: new Date(2024, 3, 8),
    text: "Getting approval",
    progress: 10,
    parent: 2,
    type: "task",
    assigned: "",
  },
  {
    id: 22,
    start: new Date(2024, 3, 8),
    end: new Date(2024, 3, 10),
    text: "Team introduction",
    progress: 0,
    parent: 2,
    type: "task",
    assigned: "",
  },
  {
    id: 23,
    start: new Date(2024, 3, 10),
    end: new Date(2024, 3, 12),
    text: "Resource management",
    progress: 10,
    parent: 2,
    type: "task",
    assigned: "",
  },

  {
    id: 3,
    start: new Date(2024, 3, 9),
    end: new Date(2024, 4, 15),
    text: "Development",
    progress: 30,
    parent: 0,
    type: "summary",
    open: true,
    assigned: "",
  },
  {
    id: 30,
    start: new Date(2024, 3, 9),
    end: new Date(2024, 3, 15),
    text: "Prototyping",
    progress: 3,
    parent: 3,
    type: "task",
    assigned: 3,
  },
  {
    id: 31,
    start: new Date(2024, 3, 15),
    end: new Date(2024, 3, 30),
    text: "Basic functionality",
    progress: 0,
    parent: 3,
    type: "task",
    assigned: "",
  },
  {
    id: 32,
    start: new Date(2024, 3, 30),
    end: new Date(2024, 4, 15),
    text: "Finalizing MVA",
    progress: 0,
    parent: 3,
    type: "task",
    assigned: "",
  },

  {
    id: 4,
    start: new Date(2024, 3, 9),
    end: new Date(2024, 4, 25),
    text: "Testing",
    progress: 3,
    parent: 0,
    type: "summary",
    open: true,
    assigned: "",
  },
  {
    id: 40,
    start: new Date(2024, 3, 9),
    end: new Date(2024, 3, 15),
    text: "Testing prototype",
    progress: 3,
    parent: 4,
    type: "task",
    assigned: 4,
  },
  {
    id: 41,
    start: new Date(2024, 3, 15),
    end: new Date(2024, 3, 30),
    text: "Testing basic features",
    progress: 0,
    parent: 4,
    type: "task",
    assigned: "",
  },
  {
    id: 42,
    start: new Date(2024, 3, 30),
    end: new Date(2024, 4, 15),
    text: "Testing MVA",
    progress: 0,
    parent: 4,
    type: "task",
    assigned: "",
  },
  {
    id: 43,
    start: new Date(2024, 4, 15),
    end: new Date(2024, 4, 25),
    text: "Beta testing",
    progress: 0,
    parent: 4,
    type: "task",
    details:
      "Comprehensive testing of the beta version before the final release.",
    assigned: "",
  },

  {
    id: 5,
    start: new Date(2024, 4, 25),
    text: "Release 1.0.0",
    progress: 0,
    parent: 0,
    type: "milestone",
    details: "Official release of version 1.0.0 to the public.",
    assigned: "",
  },
];
const links: DataLink[] = [
  {
    id: 1,
    source: 10,
    target: 11,
    type: "e2s",
  },
  {
    id: 2,
    source: 11,
    target: 12,
    type: "e2s",
  },
  {
    id: 3,
    source: 110,
    target: 111,
    type: "e2s",
  },
  {
    id: 4,
    source: 20,
    target: 21,
    type: "e2s",
  },
  {
    id: 5,
    source: 21,
    target: 22,
    type: "e2s",
  },
  {
    id: 6,
    source: 22,
    target: 23,
    type: "e2s",
  },
  {
    id: 7,
    source: 42,
    target: 5,
    type: "e2s",
  },
];

const scales: DataScale[] = [
  { unit: "month", step: 1, format: "MMMM yyy" },
  { unit: "day", step: 1, format: "d", css: dayStyle },
];

export function getGeneratedData(
  prefix = "",
  maxSize = 50,
  maxYears = 100
): { tasks: DataTask[]; generatedLinks: DataLink[]; scales: DataScale[] } {
  const generatedTasks = getTasks(prefix, maxSize, maxYears);
  return { tasks: generatedTasks, generatedLinks, scales };
}

const tasksHour: DataTask[] = [
  {
    id: 1,
    start: new Date(2025, 3, 10, 8, 0),
    end: new Date(2025, 3, 10, 20, 0),
    text: "Preparing Venue",
    progress: 90,
    parent: 0,
    type: "summary",
    open: true,
  },
  {
    id: 11,
    start: new Date(2025, 3, 10, 8, 0),
    end: new Date(2025, 3, 10, 12, 0),
    text: "Stage Setup",
    progress: 100,
    parent: 1,
    type: "task",
  },
  {
    id: 12,
    start: new Date(2025, 3, 10, 12, 0),
    end: new Date(2025, 3, 10, 17, 0),
    text: "Technical Setup",
    progress: 100,
    parent: 1,
    type: "task",
  },
  {
    id: 13,
    start: new Date(2025, 3, 10, 14, 0),
    end: new Date(2025, 3, 10, 20, 0),
    text: "Decoration",
    progress: 85,
    parent: 1,
    type: "task",
  },
  {
    id: 2,
    start: new Date(2025, 3, 10, 16, 0),
    end: new Date(2025, 3, 10, 22, 0),
    text: "Rehearsal Session",
    progress: 60,
    parent: 0,
    type: "summary",
    open: true,
  },
  {
    id: 21,
    start: new Date(2025, 3, 10, 16, 0),
    end: new Date(2025, 3, 10, 19, 0),
    text: "Speakers Rehearsal",
    progress: 100,
    parent: 2,
    type: "task",
  },
  {
    id: 22,
    start: new Date(2025, 3, 10, 19, 0),
    text: "Sound Check",
    progress: 0,
    parent: 2,
    type: "milestone",
  },
  {
    id: 23,
    start: new Date(2025, 3, 10, 19, 0),
    end: new Date(2025, 3, 10, 22, 0),
    text: "Full Run-through",
    progress: 40,
    parent: 2,
    type: "task",
  },

  {
    id: 3,
    start: new Date(2025, 3, 11, 8, 0),
    end: new Date(2025, 3, 11, 21, 0),
    text: "Conference Day",
    progress: 0,
    parent: 0,
    type: "summary",
    open: true,
  },
  {
    id: 31,
    start: new Date(2025, 3, 11, 8, 0),
    end: new Date(2025, 3, 11, 12, 0),
    text: "Catering setup",
    progress: 0,
    parent: 3,
    type: "task",
  },
  {
    id: 32,
    start: new Date(2025, 3, 11, 10, 0),
    end: new Date(2025, 3, 11, 12, 0),
    text: "Tech Check",
    progress: 0,
    parent: 3,
    type: "task",
  },
  {
    id: 33,
    start: new Date(2025, 3, 11, 12, 0),
    end: new Date(2025, 3, 11, 16, 0),
    text: "Registration",
    progress: 0,
    parent: 3,
    type: "task",
  },
  {
    id: 34,
    start: new Date(2025, 3, 11, 16, 0),
    end: new Date(2025, 3, 11, 20, 0),
    text: "Main Conference",
    progress: 0,
    parent: 3,
    type: "task",
  },
  {
    id: 35,
    start: new Date(2025, 3, 11, 20, 0),
    text: "Closing Ceremony",
    progress: 0,
    parent: 3,
    type: "milestone",
  },
];

const linksHour: DataLink[] = [
  { id: 1, source: 11, target: 12, type: "e2s" },
  { id: 2, source: 21, target: 22, type: "e2s" },
  { id: 3, source: 22, target: 23, type: "e2s" },
  { id: 4, source: 32, target: 33, type: "e2s" },
  { id: 5, source: 33, target: 34, type: "e2s" },
  { id: 6, source: 34, target: 35, type: "e2s" },
];

const scalesHour: DataScale[] = [
  { unit: "day", step: 1, format: "MMM d" },
  { unit: "hour", step: 1, format: "HH:mm" },
];

export const users = [
  { id: 1, label: "Laura Turner" },
  { id: 2, label: "Robert Williams" },
  { id: 3, label: "Mary Johnson" },
  { id: 4, label: "John Doe" },
];

const datasets: Record<DatasetName, DataSet> = {
  day: { tasks, links, scales },
  hour: { tasks: tasksHour, links: linksHour, scales: scalesHour },
};

export function getData(name: DatasetName = "day"): DataSet {
  return datasets[name];
}

export function getBaselinesData(): DataSet {
  const t = tasks.map((t) => ({
    ...t,
    base_start: t.start,
    base_end: t.end,
  }));

  return { tasks: t, links, scales };
}

export const taskTypes = [
  { id: "task", label: "Task" },
  { id: "summary", label: "Summary task" },
  { id: "milestone", label: "Milestone" },
  { id: "urgent", label: "Urgent" },
  { id: "narrow", label: "Narrow" },
  { id: "progress", label: "Progress" },
  { id: "round", label: "Rounded" },
];

export function getTypedData(): DataSet {
  const t = tasks.map((task, i) => {
    const res = { ...task };
    if (res.type == "task" && i % 3) {
      res.type = taskTypes[(i % 5) + 2].id;
    }
    return res;
  });

  return { tasks: t, links, scales };
}

function hoursTemplate(a: Date, b?: Date): string {
  const next = b ?? a;
  return `${format(a, "HH:mm")} - ${format(next, "HH:mm")}`;
}
export const zoomConfig = {
  level: 3,
  levels: [
    {
      minCellWidth: 200,
      maxCellWidth: 400,
      scales: [{ unit: "year", step: 1, format: "yyyy" }],
    },
    {
      minCellWidth: 150,
      maxCellWidth: 400,
      scales: [
        { unit: "year", step: 1, format: "yyyy" },
        { unit: "quarter", step: 1, format: "QQQQ" },
      ],
    },
    {
      minCellWidth: 250,
      maxCellWidth: 350,
      scales: [
        { unit: "quarter", step: 1, format: "QQQQ" },
        { unit: "month", step: 1, format: "MMMM yyy" },
      ],
    },
    {
      minCellWidth: 100,
      scales: [
        { unit: "month", step: 1, format: "MMMM yyy" },
        { unit: "week", step: 1, format: "'week' w" },
      ],
    },
    {
      maxCellWidth: 200,
      scales: [
        { unit: "month", step: 1, format: "MMMM yyy" },
        { unit: "day", step: 1, format: "d", css: dayStyle },
      ],
    },
    {
      minCellWidth: 25,
      maxCellWidth: 100,
      scales: [
        { unit: "day", step: 1, format: "MMM d", css: dayStyle },
        { unit: "hour", step: 6, format: hoursTemplate },
      ],
    },
    {
      maxCellWidth: 120,
      scales: [
        { unit: "day", step: 1, format: "MMM d", css: dayStyle },
        { unit: "hour", step: 1, format: "HH:mm" },
      ],
    },
  ],
};
