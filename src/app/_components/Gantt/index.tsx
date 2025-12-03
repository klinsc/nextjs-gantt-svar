"use client";

import {
  ContextMenu,
  Editor,
  Gantt,
  IApi,
  ILink,
  ITask,
  IZoomConfig,
  Toolbar,
  Willow,
} from "@svar-ui/react-gantt";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getData } from "../../data";
// import "../../GanttZoom.css";
import "@svar-ui/react-gantt/all.css";
import { RestDataProvider } from "@svar-ui/gantt-data-provider";

const url = "http://localhost:3000";
const server = new RestDataProvider(url);

export default function GanttPage() {
  const [api, setApi] = useState<IApi>();
  const mockedData = useMemo(() => getData(), []);
  const [data, setData] = useState<{
    tasks: ITask[];
    links: ILink[];
    zoomConfig?: IZoomConfig;
  }>({
    tasks: [],
    links: [],
  });

  // // Initialize data from server
  // useEffect(() => {
  //   if (data.tasks.length > 0 || data.links.length > 0) return;

  //   async function fetchData() {
  //     setData({ tasks: mockedData.tasks, links: mockedData.links });
  //   }
  //   fetchData();
  // }, [
  //   data.links.length,
  //   data.tasks.length,
  //   mockedData.links,
  //   mockedData.tasks,
  // ]);

  useEffect(() => {
    if (window === undefined) return;

    if (api) {
      api.on("add-task", async (task) => {
        const newTask = task.task;
        setData((prev) => ({
          ...prev,
          tasks: [...prev.tasks, newTask],
        }));
      });

      api.on("update-task", async (task) => {
        const updatedTask = task.task;
        setData((prev) => ({
          ...prev,
          tasks: prev.tasks.map((t) =>
            t.id === updatedTask.id ? { ...t, ...updatedTask } : t
          ),
        }));
      });

      api.on("delete-task", async (task) => {
        setData((prev) => ({
          ...prev,
          tasks: prev.tasks.filter((t) => t.id !== task.id),
        }));
      });

      api.on("add-link", async (link) => {
        setData((prev) => ({
          ...prev,
          links: [...prev.links, link],
        }));
      });

      api.on("delete-link", async (link) => {
        setData((prev) => ({
          ...prev,
          links: prev.links.filter((l) => l.id !== link.id),
        }));
      });

      api.on("zoom-scale", async () => {
        setData((prev) => ({
          ...prev,
          zoomConfig: api.getState().zoom,
        }));
      });
    }
  }, [api]);

  // effect: save data to local storage on change
  useEffect(() => {
    if (data.tasks.length === 0 && data.links.length === 0) return;

    localStorage.setItem(
      "gantt-tasks",
      JSON.stringify({
        tasks: data.tasks,
        links: data.links,
        zoomLevel: data.zoomConfig,
      })
    );
  }, [data]);

  // effect: load data from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem("gantt-tasks");
    if (saved) {
      const parsed = JSON.parse(saved);
      setData({
        tasks: parsed.tasks,
        links: parsed.links,
        zoomConfig: parsed.zoomLevel,
      });
    } else {
      setData({ tasks: mockedData.tasks, links: mockedData.links });
    }
  }, [mockedData.links, mockedData.tasks]);

  // callback: zoomin
  const zoomIn = useCallback(() => {
    if (api) {
      const currentZoom = api.getState().zoom;

      setData((prev) => ({
        ...prev,
        zoomConfig: {
          ...currentZoom,
          level: currentZoom?.level ? currentZoom.level + 1 : 1,
        },
      }));
    }
  }, [api]);
  // callback: zoomout
  const zoomOut = useCallback(() => {
    if (api) {
      const currentZoom = api.getState().zoom;

      setData((prev) => ({
        ...prev,
        zoomConfig: {
          ...currentZoom,
          level:
            currentZoom?.level && currentZoom.level > 0
              ? currentZoom.level - 1
              : 0,
        },
      }));
    }
  }, [api]);

  return (
    <div className="gantt-wrapper">
      <div className="gantt-header">
        <div>
          <h1>Svar React Gantt + Next.js Starter</h1>
          <p>
            App Router + Willow theme with sample resources and timeline scales.
          </p>
          <button onClick={zoomIn}>Zoom In</button>
          <button onClick={zoomOut}>Zoom Out</button>
        </div>
      </div>
      <Willow>
        <Toolbar api={api} />
        <div style={{ height: 520 }}>
          <ContextMenu api={api}>
            <Gantt
              init={setApi}
              tasks={data.tasks}
              links={data.links}
              scales={mockedData.scales}
              zoom={data.zoomConfig}
            />
          </ContextMenu>
          {api && <Editor api={api} />}
        </div>
      </Willow>
    </div>
  );
}
