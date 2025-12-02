"use client";

import {
  ContextMenu,
  Editor,
  Gantt,
  Toolbar,
  Willow,
} from "@svar-ui/react-gantt";
import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";

import type { DataScale } from "../../data";
import "../../GanttZoom.css";
import { getData } from "../../data";

type ApiTask = {
  id: number;
  text: string;
  type: string;
  start: string;
  end: string | null;
  progress: number;
  duration: number | null;
  parent: number | null;
  details: string | null;
  assigned: string | null;
  open: boolean | null;
  base_start: string | null;
  base_end: string | null;
};

type ApiLink = {
  id: number;
  type: string;
  source: number;
  target: number;
};

type ApiScale = {
  id: number;
  unit: string;
  step: number;
  format?: string | null;
  cssClass?: string | null;
  order: number;
};

type ApiResponse = {
  tasks: ApiTask[];
  links: ApiLink[];
  scales: ApiScale[];
};

type ClientTask = {
  id: number;
  text: string;
  type: string;
  start: Date;
  end?: Date;
  progress: number;
  duration?: number;
  parent: number;
  details?: string;
  assigned?: string | number;
  open?: boolean;
  base_start?: Date;
  base_end?: Date;
};

type ClientData = {
  tasks: ClientTask[];
  links: ApiLink[];
  scales: DataScale[];
};

const weekendCss = (date: Date) => {
  const day = date.getDay();
  return day === 5 || day === 6 ? "sday" : "";
};

const cssLookup: Record<string, (date: Date) => string> = {
  weekend: weekendCss,
};

const placeholderStyle: CSSProperties = {
  display: "flex",
  height: "100%",
  width: "100%",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  padding: "1rem",
};

function mapTask(task: ApiTask): ClientTask {
  return {
    id: task.id,
    text: task.text,
    type: task.type,
    start: new Date(task.start),
    end: task.end ? new Date(task.end) : undefined,
    progress: task.progress,
    duration: task.duration ?? undefined,
    parent: task.parent ?? 0,
    details: task.details ?? undefined,
    assigned: task.assigned ?? undefined,
    open: typeof task.open === "boolean" ? task.open : undefined,
    base_start: task.base_start ? new Date(task.base_start) : undefined,
    base_end: task.base_end ? new Date(task.base_end) : undefined,
  };
}

function mapScale(scale: ApiScale): DataScale {
  const result: DataScale = {
    unit: scale.unit as DataScale["unit"],
    step: scale.step,
    format: scale.format ?? undefined,
  };

  if (scale.cssClass) {
    const resolver = cssLookup[scale.cssClass];
    if (resolver) {
      result.css = resolver;
    }
  }

  return result;
}

export default function GanttPage() {
  const [api, setApi] = useState<any>();
  const [data, setData] = useState<ClientData | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading"
  );
  const [error, setError] = useState<string | null>(null);

  // const data = useMemo(() => getData(), []);
  useEffect(() => {
    console.log("Gantt data:", data);
  }, [data]);

  useEffect(() => {
    let active = true;

    async function loadData() {
      setStatus("loading");
      setError(null);

      try {
        const response = await fetch("/api/gantt");
        if (!response.ok) {
          throw new Error(`Request failed with ${response.status}`);
        }
        const payload: ApiResponse = await response.json();
        if (!active) {
          return;
        }

        const mappedTasks = payload.tasks.map(mapTask);
        const mappedScales = payload.scales
          .slice()
          .sort((a, b) => a.order - b.order)
          .map(mapScale);

        const mockedPayload = getData();

        setData({
          tasks: mappedTasks,
          links: mockedPayload.tasks,
          scales: mockedPayload.scales,
        });

        // setData({
        //   tasks: payload.tasks,
        //   links: payload.links,
        //   scales: payload.scales,
        // });

        setStatus("ready");
      } catch (err) {
        if (!active) {
          return;
        }
        setError(err instanceof Error ? err.message : "Unknown error");
        setStatus("error");
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, []);

  const content = useMemo(() => {
    if (status === "loading") {
      return <div style={placeholderStyle}>Loading timeline…</div>;
    }

    if (status === "error") {
      return (
        <div style={placeholderStyle} role="alert">
          Failed to load timeline data.
          {error ? ` ${error}` : null}
        </div>
      );
    }

    if (!data) {
      return (
        <div style={placeholderStyle} role="alert">
          No timeline data available.
        </div>
      );
    }

    const ganttElement = (
      <Gantt
        init={setApi}
        tasks={data.tasks}
        links={data.links}
        scales={data.scales}
        zoom
      />
    );

    return (
      <>
        {<ContextMenu api={api}>{ganttElement}</ContextMenu>}
        {api && <Editor api={api} />}
      </>
    );
  }, [api, data, error, status]);

  return (
    <div className="gantt-wrapper">
      <div className="gantt-header">
        <div>
          <h1>Svar React Gantt + Next.js Starter</h1>
          <p>
            App Router + Willow theme with sample resources and timeline scales.
          </p>
        </div>
      </div>
      {data?.tasks && data.links && data.scales && (
        <Willow>
          <Toolbar api={api} />
          <div style={{ height: 520 }}>{content}</div>
        </Willow>
      )}
    </div>
  );
}
