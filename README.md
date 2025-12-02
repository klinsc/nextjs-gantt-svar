# Svar React Gantt + Next.js Starter

This project showcases how to integrate the SVAR React Gantt component (Willow theme) inside a Next.js 14 App Router + TypeScript setup.

## Getting started

```bash
npm install
npm run dev
```

Then open http://localhost:3000 to see the Gantt chart rendered on the client side.

## Project structure

```
src/
  app/
    datasource.ts   # Sample Willow-like project data
    globals.css      # Global styles + SVAR CSS import
    layout.tsx
    page.tsx         # Client component rendering Gantt
```

## Notes

- The Gantt component is wrapped with the Willow theme component and rendered only on the client (`"use client"`).
- All required CSS (including the package-provided styles) is imported via `globals.css`.
- Sample tasks, links, resources, columns, and scale settings mimic the Willow example available in the SVAR docs.
