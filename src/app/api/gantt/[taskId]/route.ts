import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

import {
  TaskInputError,
  type TaskPayload,
  buildUpdateData,
  parseTaskId,
  serializeTask,
} from "../taskUtils";

type RouteContext = {
  params: {
    taskId: string;
  };
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const id = parseTaskId(context.params.taskId);
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }
    return NextResponse.json({ task: serializeTask(task) });
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const id = parseTaskId(context.params.taskId);
    const payload = (await request.json()) as TaskPayload;
    const data = buildUpdateData(payload);
    if (!Object.keys(data).length) {
      throw new TaskInputError("No fields provided for update");
    }

    const updated = await prisma.task.update({ where: { id }, data });
    return NextResponse.json({ task: serializeTask(updated) });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }
    return handleError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const id = parseTaskId(context.params.taskId);
    const task = await prisma.task.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const ids = await collectDescendantIds(id);

    await prisma.$transaction(async (tx) => {
      await tx.link.deleteMany({
        where: {
          OR: [{ sourceId: { in: ids } }, { targetId: { in: ids } }],
        },
      });
      await tx.taskResource.deleteMany({ where: { taskId: { in: ids } } });
      await tx.task.deleteMany({ where: { id: { in: ids } } });
    });

    return NextResponse.json({ deleted: ids });
  } catch (error) {
    return handleError(error);
  }
}

async function collectDescendantIds(taskId: number) {
  const ids = new Set<number>([taskId]);
  let frontier = [taskId];

  while (frontier.length) {
    const children = await prisma.task.findMany({
      where: { parentId: { in: frontier } },
      select: { id: true },
    });
    frontier = children
      .map((child) => child.id)
      .filter((childId) => !ids.has(childId));
    frontier.forEach((childId) => ids.add(childId));
  }

  return Array.from(ids);
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
