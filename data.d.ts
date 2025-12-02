type ScaleUnit = "year" | "quarter" | "month" | "week" | "day" | "hour";

type ScaleFormatter = string | ((start: Date, end: Date) => string);

export interface DataScale {
  unit: ScaleUnit;
  step?: number;
  format?: ScaleFormatter;
  css?: (date: Date) => string;
}

export interface DataTask {
  id: number;
  text: string;
  start: Date;
  end?: Date;
  progress: number;
  parent: number;
  type: string;
  open?: boolean;
  details?: string;
  assigned?: number | string;
  base_start?: Date;
  base_end?: Date;
}

export interface DataLink {
  id: number;
  source: number;
  target: number;
  type: string;
}

export interface DataSet {
  tasks: DataTask[];
  links: DataLink[];
  scales: DataScale[];
}

declare module "./data" {
  export { DataScale, DataTask, DataLink, DataSet };

  export function getData(name?: "day" | "hour"): DataSet;
  export function getGeneratedData(
    prefix?: string,
    maxSize?: number,
    maxYears?: number
  ): { tasks: DataTask[]; generatedLinks: DataLink[]; scales: DataScale[] };
  export function getBaselinesData(): DataSet;
  export function getTypedData(): DataSet;

  export const tasks: DataTask[];
  export const links: DataLink[];
  export const scales: DataScale[];
  export const generatedLinks: DataLink[];
}

declare module "./data.js" {
  export * from "./data";
}
