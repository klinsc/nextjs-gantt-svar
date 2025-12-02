import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import {
  LinkType,
  PrismaClient,
  ScaleUnit,
  TaskType,
  ViewRange,
} from "@prisma/client";
import { Pool } from "pg";
import { getData } from "../src/app/data";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not defined.");
}

const pool = new Pool({ connectionString: databaseUrl });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const resources = [
  { id: 1, name: "Program Management", role: "Program", color: "#6366f1" },
  { id: 2, name: "Design", role: "UX", color: "#ec4899" },
  { id: 3, name: "Frontend", role: "Engineering", color: "#0ea5e9" },
  { id: 4, name: "Backend", role: "Engineering", color: "#14b8a6" },
  { id: 5, name: "QA", role: "Quality", color: "#f97316" },
];

const taskTypeMap: Record<string, TaskType> = {
  project: TaskType.PROJECT,
  summary: TaskType.SUMMARY,
  task: TaskType.TASK,
  milestone: TaskType.MILESTONE,
};

const linkTypeMap: Record<string, LinkType> = {
  fs: LinkType.FS,
  sf: LinkType.SF,
  ss: LinkType.SS,
  ff: LinkType.FF,
  e2s: LinkType.E2S,
  s2s: LinkType.S2S,
  s2e: LinkType.S2E,
  e2e: LinkType.E2E,
};

const scaleUnitMap: Record<string, ScaleUnit> = {
  year: ScaleUnit.YEAR,
  quarter: ScaleUnit.QUARTER,
  month: ScaleUnit.MONTH,
  week: ScaleUnit.WEEK,
  day: ScaleUnit.DAY,
  hour: ScaleUnit.HOUR,
};

function resolveTaskType(value: string | undefined): TaskType {
  return value
    ? taskTypeMap[value.toLowerCase()] ?? TaskType.TASK
    : TaskType.TASK;
}

function resolveLinkType(value: string): LinkType {
  return linkTypeMap[value.toLowerCase()] ?? LinkType.FS;
}

function resolveScaleUnit(value: string): ScaleUnit {
  return scaleUnitMap[value.toLowerCase()] ?? ScaleUnit.MONTH;
}

async function reset() {
  await prisma.taskResource.deleteMany();
  await prisma.link.deleteMany();
  await prisma.task.deleteMany();
  await prisma.resource.deleteMany();
  await prisma.scalePreset.deleteMany();
}

async function seedResources() {
  await prisma.resource.createMany({ data: resources });
}

async function seedTasks() {
  const dataset = getData("day");

  await prisma.task.createMany({
    data: dataset.tasks.map((task) => ({
      id: task.id,
      text: task.text,
      type: resolveTaskType(task.type),
      startDate: task.start,
      endDate: task.end ?? null,
      progress: Math.round(task.progress),
      duration: task.duration ?? null,
      parentId: task.parent === 0 ? null : task.parent,
      details: task.details ?? null,
      assigned:
        typeof task.assigned === "number"
          ? task.assigned.toString()
          : task.assigned ?? null,
      open: task.open ?? true,
      baseStart: task.base_start ?? null,
      baseEnd: task.base_end ?? null,
    })),
  });

  const assignments = dataset.tasks
    .map((task) =>
      typeof task.assigned === "number"
        ? { taskId: task.id, resourceId: Number(task.assigned) }
        : null
    )
    .filter((value): value is { taskId: number; resourceId: number } =>
      Boolean(value)
    );

  if (assignments.length) {
    await prisma.taskResource.createMany({
      data: assignments,
      skipDuplicates: true,
    });
  }

  await prisma.link.createMany({
    data: dataset.links.map((link) => ({
      id: link.id,
      type: resolveLinkType(link.type),
      sourceId: link.source,
      targetId: link.target,
    })),
  });

  await prisma.scalePreset.createMany({
    data: dataset.scales.map((scale, index) => ({
      name: `Default-${scale.unit}-${scale.step}-${index}`,
      unit: resolveScaleUnit(scale.unit),
      step: scale.step,
      format: typeof scale.format === "string" ? scale.format : "",
      cssClass: scale.css ? "weekend" : null,
      order: index,
      view: ViewRange.MONTH,
    })),
  });
}

async function main() {
  await reset();
  await seedResources();
  await seedTasks();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error("Seed failed", error);
    await prisma.$disconnect();
    process.exit(1);
  });
