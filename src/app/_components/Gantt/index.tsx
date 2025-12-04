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

// const url = "http://localhost:3000";
// const server = new RestDataProvider(url);

export default function GanttPage() {
  const restProvider = useMemo(
    () => new RestDataProvider("https://gantt-backend-go.fly.dev"),
    []
  );

  const [api, setApi] = useState<IApi>();
  const [tasks, setTasks] = useState<ITask[]>();
  const [links, setLinks] = useState<ILink[]>();

  useEffect(() => {
    restProvider.getData().then(({ tasks: t, links: l }) => {
      setTasks(t);
      setLinks(l);
    });
  }, [restProvider]);

  const init = useCallback(
    (api: IApi) => {
      setApi(api);

      api.setNext(restProvider);

      api.on("request-data", (ev) => {
        restProvider.getData(ev.id).then(({ tasks, links }) => {
          api.exec("provide-data", {
            id: ev.id,
            data: {
              tasks,
              links,
            },
          });
        });
      });
    },
    [restProvider]
  );

  return (
    <div className="gantt-wrapper">
      <div className="gantt-header">
        <div>
          <h1>
            แผนดำเนินการสำรวจ-ออกแบบ งานก่อสร้างสถานีไฟฟ้า ปี 2568 ของ กอฟ.
          </h1>
          <p>เวอร์ชันทดลอง</p>
        </div>
      </div>
      <Willow>
        <Toolbar api={api} />
        <div style={{ height: 520 }}>
          <ContextMenu api={api}>
            <Gantt init={init} tasks={tasks} links={links} zoom />
          </ContextMenu>
          {api && <Editor api={api} />}
        </div>
      </Willow>
    </div>
  );
}
