"use client";

import {
  ContextMenu,
  Editor,
  Gantt,
  Toolbar,
  Willow,
} from "@svar-ui/react-gantt";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
} from "react";
import type { CSSProperties } from "react";

import { getData, type DataScale } from "../../data";
import "../../GanttZoom.css";

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
  assigned?: string;
  open?: boolean;
  base_start?: Date;
  base_end?: Date;
};

type ClientData = {
  tasks: ClientTask[];
  links: ApiLink[];
  scales: DataScale[];
};

type TaskDraft = {
  text: string;
  type: string;
  start: string;
  end: string;
  parent: string;
  progress: string;
  duration: string;
  details: string;
  assigned: string;
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

const toDateInputValue = (value?: Date) =>
  value ? value.toISOString().slice(0, 10) : "";

const ensureDate = (value?: Date | string | null) => {
  if (!value) {
    return undefined;
  }
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

const createDraft = (): TaskDraft => {
  const today = new Date().toISOString().slice(0, 10);
  return {
    text: "",
    type: "task",
    start: today,
    end: "",
    parent: "",
    progress: "0",
    duration: "",
    details: "",
    assigned: "",
  };
};

const parseNumberField = (value: string) => {
  if (!value.trim()) {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const buildPayloadFromDraft = (draft: TaskDraft) => {
  const payload: Record<string, unknown> = {
    text: draft.text.trim(),
    type: draft.type || "task",
    details: draft.details.trim() ? draft.details : null,
    assigned: draft.assigned.trim() ? draft.assigned : null,
  };

  if (draft.start) {
    payload.start = draft.start;
  }
  if (draft.end) {
    payload.end = draft.end;
  } else {
    payload.end = null;
  }

  const parent = parseNumberField(draft.parent);
  if (parent !== undefined) {
    payload.parent = parent;
  }

  const progress = parseNumberField(draft.progress);
  if (progress !== undefined) {
    payload.progress = progress;
  }

  const duration = parseNumberField(draft.duration);
  if (duration !== undefined) {
    payload.duration = duration;
  }

  return payload;
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
  const [draft, setDraft] = useState<TaskDraft>(createDraft);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [mutating, setMutating] = useState(false);
  const [mutationMessage, setMutationMessage] = useState<string | null>(null);

  const loadData = useCallback(
    async (mode: "default" | "silent" = "default") => {
      if (mode === "default") {
        setStatus("loading");
        setError(null);
      }
      try {
        const response = await fetch("/api/gantt");
        if (!response.ok) {
          throw new Error(`Request failed with ${response.status}`);
        }
        const payload: ApiResponse = await response.json();

        const mockedPayload = getData();

        setData({
          tasks: payload.tasks.map(mapTask),
          links: mockedPayload.links,
          scales: mockedPayload.scales,
        });
        setStatus("ready");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        setStatus("error");
      }
    },
    []
  );

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    if (!api) {
      return;
    }
    const tag = Symbol("gantt-selection");
    api.on(
      "select-task",
      (event: { id?: number | string | null }) => {
        if (event.id === undefined || event.id === null) {
          setSelectedTaskId(null);
          return;
        }
        const numericId = Number(event.id);
        if (!Number.isFinite(numericId)) {
          return;
        }
        setSelectedTaskId(numericId);
        const selected = api.getTask(event.id);
        if (!selected) {
          return;
        }
        setDraft({
          text: selected.text ?? "",
          type: selected.type ?? "task",
          start:
            toDateInputValue(ensureDate(selected.start)) ||
            new Date().toISOString().slice(0, 10),
          end: toDateInputValue(ensureDate(selected.end)),
          parent:
            selected.parent && Number(selected.parent) > 0
              ? String(selected.parent)
              : "",
          progress:
            selected.progress !== undefined
              ? String(selected.progress)
              : draft.progress,
          duration:
            selected.duration !== undefined && selected.duration !== null
              ? String(selected.duration)
              : "",
          details: selected.details ?? "",
          assigned: selected.assigned ?? "",
        });
      },
      { tag }
    );
    return () => {
      api.detach(tag);
    };
  }, [api, draft.progress]);

  const handleDraftChange = (
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = event.target;
    setDraft((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreate = async () => {
    if (!draft.text.trim()) {
      setMutationMessage("Task title is required.");
      return;
    }
    if (!draft.start) {
      setMutationMessage("Start date is required.");
      return;
    }

    setMutating(true);
    setMutationMessage(null);
    try {
      const payload = buildPayloadFromDraft(draft);
      const response = await fetch("/api/gantt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to create task");
      }
      const body = await response.json();
      setMutationMessage(`Created task #${body.task.id}`);
      setSelectedTaskId(body.task.id);
      setDraft((prev) => ({ ...createDraft(), parent: prev.parent }));
      await loadData("silent");
    } catch (err) {
      setMutationMessage(err instanceof Error ? err.message : "Create failed");
    } finally {
      setMutating(false);
    }
  };

  const handleUpdate = async () => {
    if (selectedTaskId === null) {
      setMutationMessage("Select a task to update.");
      return;
    }

    setMutating(true);
    setMutationMessage(null);
    try {
      const payload = buildPayloadFromDraft(draft);
      const response = await fetch(`/api/gantt/${selectedTaskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to update task");
      }
      const body = await response.json();
      setMutationMessage(`Updated task #${body.task.id}`);
      await loadData("silent");
    } catch (err) {
      setMutationMessage(err instanceof Error ? err.message : "Update failed");
    } finally {
      setMutating(false);
    }
  };

  const handleDelete = async () => {
    if (selectedTaskId === null) {
      setMutationMessage("Select a task to delete.");
      return;
    }

    setMutating(true);
    setMutationMessage(null);
    try {
      const response = await fetch(`/api/gantt/${selectedTaskId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to delete task");
      }
      const body = await response.json();
      setMutationMessage(`Deleted tasks: ${body.deleted.join(", ")}`);
      setSelectedTaskId(null);
      setDraft(createDraft());
      await loadData("silent");
    } catch (err) {
      setMutationMessage(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setMutating(false);
    }
  };

  const handleResetForm = () => {
    setDraft(createDraft());
  };

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
        {api ? (
          <ContextMenu api={api}>{ganttElement}</ContextMenu>
        ) : (
          ganttElement
        )}
        {api && <Editor api={api} />}
      </>
    );
  }, [api, data, error, status]);

  const hasSelection = selectedTaskId !== null;
  const canSubmit = Boolean(draft.text.trim() && draft.start);

  return (
    <div className="gantt-wrapper">
      <div className="gantt-header">
        <div>
          <h1>Svar React Gantt + Next.js Starter</h1>
          <p>
            App Router + Willow theme backed by Prisma/PostgreSQL with full CRUD
            examples.
          </p>
        </div>
      </div>

      <div
        style={{
          border: "1px solid #e2e8f0",
          borderRadius: 8,
          padding: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <form onSubmit={(event) => event.preventDefault()}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: "0.75rem",
            }}
          >
            <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span>Title</span>
              <input
                name="text"
                value={draft.text}
                onChange={handleDraftChange}
                placeholder="Task name"
              />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span>Type</span>
              <select
                name="type"
                value={draft.type}
                onChange={handleDraftChange}
              >
                <option value="task">Task</option>
                <option value="summary">Summary</option>
                <option value="milestone">Milestone</option>
              </select>
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span>Start</span>
              <input
                type="date"
                name="start"
                value={draft.start}
                onChange={handleDraftChange}
              />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span>End</span>
              <input
                type="date"
                name="end"
                value={draft.end}
                onChange={handleDraftChange}
              />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span>Parent ID</span>
              <input
                type="number"
                name="parent"
                value={draft.parent}
                onChange={handleDraftChange}
                min="0"
              />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span>Progress</span>
              <input
                type="number"
                name="progress"
                value={draft.progress}
                onChange={handleDraftChange}
                min="0"
                max="100"
              />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span>Duration (days)</span>
              <input
                type="number"
                name="duration"
                value={draft.duration}
                onChange={handleDraftChange}
                min="0"
              />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span>Assigned</span>
              <input
                name="assigned"
                value={draft.assigned}
                onChange={handleDraftChange}
                placeholder="e.g. 3 or Design"
              />
            </label>
          </div>
          <label
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
              marginTop: "0.75rem",
            }}
          >
            <span>Details</span>
            <textarea
              name="details"
              value={draft.details}
              onChange={handleDraftChange}
              rows={3}
              placeholder="Optional description"
            />
          </label>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.75rem",
              marginTop: "1rem",
            }}
          >
            <button
              type="button"
              onClick={handleCreate}
              disabled={mutating || !canSubmit}
            >
              Create Task
            </button>
            <button
              type="button"
              onClick={handleUpdate}
              disabled={mutating || !hasSelection}
            >
              Update Selected
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={mutating || !hasSelection}
            >
              Delete Selected
            </button>
            <button
              type="button"
              onClick={() => {
                setMutationMessage(null);
                void loadData("default");
              }}
              disabled={mutating}
            >
              Reload Data
            </button>
            <button type="button" onClick={handleResetForm} disabled={mutating}>
              Reset Form
            </button>
          </div>
          <div style={{ marginTop: "0.5rem" }}>
            <strong>Selected task:</strong>{" "}
            {hasSelection ? `#${selectedTaskId}` : "none"}
          </div>
          {mutationMessage && (
            <p style={{ marginTop: "0.5rem", color: "#2563eb" }}>
              {mutationMessage}
            </p>
          )}
        </form>
      </div>

      <Willow>
        {api ? <Toolbar api={api} /> : <div style={{ height: 48 }} />}
        <div style={{ height: 520 }}>{content}</div>
      </Willow>
    </div>
  );
}
