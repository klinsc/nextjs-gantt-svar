import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

type TaskRecord = Awaited<ReturnType<typeof prisma.task.findMany>>[number];
type LinkRecord = Awaited<ReturnType<typeof prisma.link.findMany>>[number];
type ScaleRecord = Awaited<
  ReturnType<typeof prisma.scalePreset.findMany>
>[number];

function serializeTask(task: TaskRecord) {
  return {
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
  };
}

function serializeLink(link: LinkRecord) {
  return {
    id: link.id,
    type: link.type.toLowerCase(),
    source: link.sourceId,
    target: link.targetId,
  };
}

function serializeScale(scale: ScaleRecord) {
  return {
    id: scale.id,
    unit: scale.unit.toLowerCase(),
    step: scale.step,
    format: scale.format,
    cssClass: scale.cssClass,
    view: scale.view.toLowerCase(),
    order: scale.order,
  };
}

export async function GET() {
  const [tasks, links, scales] = await Promise.all([
    prisma.task.findMany({ orderBy: { id: "asc" } }),
    prisma.link.findMany({ orderBy: { id: "asc" } }),
    prisma.scalePreset.findMany({ orderBy: { order: "asc" } }),
  ]);

  return NextResponse.json({
    tasks: tasks.map((task: TaskRecord) => serializeTask(task)),
    links: links.map((link: LinkRecord) => serializeLink(link)),
    scales: scales.map((scale: ScaleRecord) => serializeScale(scale)),
  });
}
