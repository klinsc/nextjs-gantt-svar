-- CreateEnum
CREATE TYPE "TaskType" AS ENUM ('PROJECT', 'SUMMARY', 'TASK', 'MILESTONE');

-- CreateEnum
CREATE TYPE "LinkType" AS ENUM ('FS', 'SF', 'SS', 'FF', 'E2S', 'S2S', 'S2E', 'E2E');

-- CreateEnum
CREATE TYPE "ScaleUnit" AS ENUM ('YEAR', 'QUARTER', 'MONTH', 'WEEK', 'DAY', 'HOUR');

-- CreateEnum
CREATE TYPE "ViewRange" AS ENUM ('DAY', 'WEEK', 'MONTH', 'THREE_MONTH', 'SIX_MONTH', 'YEAR');

-- CreateTable
CREATE TABLE "Task" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "type" "TaskType" NOT NULL DEFAULT 'TASK',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "progress" INTEGER NOT NULL DEFAULT 0,
    "duration" INTEGER,
    "parentId" INTEGER,
    "details" TEXT,
    "assigned" TEXT,
    "open" BOOLEAN DEFAULT true,
    "baseStart" TIMESTAMP(3),
    "baseEnd" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Resource" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT,
    "color" TEXT,

    CONSTRAINT "Resource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskResource" (
    "taskId" INTEGER NOT NULL,
    "resourceId" INTEGER NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaskResource_pkey" PRIMARY KEY ("taskId","resourceId")
);

-- CreateTable
CREATE TABLE "Link" (
    "id" SERIAL NOT NULL,
    "type" "LinkType" NOT NULL,
    "sourceId" INTEGER NOT NULL,
    "targetId" INTEGER NOT NULL,

    CONSTRAINT "Link_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScalePreset" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "unit" "ScaleUnit" NOT NULL,
    "step" INTEGER NOT NULL,
    "format" TEXT NOT NULL,
    "cssClass" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "view" "ViewRange" NOT NULL DEFAULT 'MONTH',

    CONSTRAINT "ScalePreset_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskResource" ADD CONSTRAINT "TaskResource_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskResource" ADD CONSTRAINT "TaskResource_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Link" ADD CONSTRAINT "Link_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Link" ADD CONSTRAINT "Link_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
