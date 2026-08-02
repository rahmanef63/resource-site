import { StartHere } from "@/features/start-here";

// Live preview: the guided tour on the in-memory mock catalog (generic apps + 3
// stages). Real OS: configureStartHere({ mode:"live", apps, open, stages }).

export default function StartHerePreview() {
  return (
    <div className="h-dvh w-full">
      <StartHere />
    </div>
  );
}
