import { NextResponse } from "next/server";
import type { Link, ScalePreset } from "@prisma/client";

import { prisma } from "@/lib/prisma";

import {
  TaskInputError,
  type TaskPayload,
  buildCreateData,
  serializeTask,
} from "./taskUtils";

function serializeLink(link: Link) {
  return {
    id: link.id,
    type: link.type.toLowerCase(),
    source: link.sourceId,
    target: link.targetId,
  };
}

function serializeScale(scale: ScalePreset) {
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
    tasks: tasks.map((task) => serializeTask(task)),
    links: links.map((link) => serializeLink(link)),
    scales: scales.map((scale) => serializeScale(scale)),
  });
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as TaskPayload;
    const data = buildCreateData(payload);
    const created = await prisma.task.create({ data });

    return NextResponse.json({ task: serializeTask(created) }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}

function handleError(error: unknown) {
  if (error instanceof TaskInputError) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  if (error instanceof Error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(
    { error: "Unexpected server error" },
    { status: 500 }
  );
}
