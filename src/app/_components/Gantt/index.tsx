"use client";

import { ContextMenu, Editor, Gantt, Willow } from "@svar-ui/react-gantt";
import { useMemo, useState } from "react";
import { getData } from "../../data";
import "../../GanttZoom.css";

export default function GanttPage() {
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
