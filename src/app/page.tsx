import dynamic from "next/dynamic";

const DynamicGantt = dynamic(() => import("./_components/Gantt"), {
  ssr: false,
});

export default function HomePage() {
  return (
    <main>
      <DynamicGantt />
    </main>
  );
}
