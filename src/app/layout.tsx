import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Svar React Gantt + Next.js Starter",
  description:
    "Next.js App Router demo integrating the SVAR React Gantt component",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
