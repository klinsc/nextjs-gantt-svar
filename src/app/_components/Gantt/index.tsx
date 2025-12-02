"use client";

import { ContextMenu, Editor, Gantt, Willow } from "@svar-ui/react-gantt";
import { useMemo, useState } from "react";
import { getData } from "../../data";
import { tasks } from "../../datasource";
import "../../GanttZoom.css";

const timelineStart = tasks.reduce(
  (min, task) => (task.start < min ? task.start : min),
  tasks[0].start
);
const timelineEnd = tasks.reduce(
  (max, task) => (task.end > max ? task.end : max),
  tasks[0].end
);

export default function GanttPage() {
  const timeline = { start: timelineStart, end: timelineEnd };
  const [api, setApi] = useState<any>();
  const data = useMemo(() => getData(), []);

  return (
    <div className="gantt-wrapper">
      <div className="gantt-header">
        <div>
          <h1>Svar React Gantt + Next.js Starter</h1>
          <p>
            App Router + Willow theme with sample resources and timeline scales.
          </p>
        </div>
        <div>
          <p>
            <strong>Timeline:</strong> {timeline.start.toDateString()} →{" "}
            {timeline.end.toDateString()}
          </p>
        </div>
      </div>
      <Willow>
        <div style={{ height: 520 }}>
          <ContextMenu api={api}>
            <Gantt
              init={setApi}
              tasks={data.tasks}
              links={data.links}
              scales={data.scales}
              zoom
            />
          </ContextMenu>
          {api && <Editor api={api} />}
        </div>
      </Willow>
    </div>
  );
}
