"use client";

import { Gantt, Willow } from "@svar-ui/react-gantt";
import { columns, links, scales, tasks } from "./datasource";

const timelineStart = tasks.reduce(
  (min, task) => (task.start < min ? task.start : min),
  tasks[0].start
);
const timelineEnd = tasks.reduce(
  (max, task) => (task.end > max ? task.end : max),
  tasks[0].end
);

export default function HomePage() {
  const timeline = { start: timelineStart, end: timelineEnd };

  return (
    <main>
      <div className="gantt-wrapper">
        <div className="gantt-header">
          <div>
            <h1>Svar React Gantt + Next.js Starter</h1>
            <p>
              App Router + Willow theme with sample resources and timeline
              scales.
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
            <Gantt
              tasks={tasks}
              links={links}
              scales={scales}
              start={timeline.start}
              end={timeline.end}
              cellHeight={40}
              zoom={false}
            />
          </div>
        </Willow>
      </div>
    </main>
  );
}
