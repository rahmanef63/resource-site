import { HtmlStudio } from "@/features/html-studio";

// Live preview: the sandboxed HTML/CSS/JS editor + live iframe preview on the
// in-memory mock store (Save returns a fake slug; the saved list + open work).
// Real backend: configureHtmlStudio({ mode:"live", save, load, list, remove }).

export default function HtmlStudioPreview() {
  return (
    <div className="h-dvh w-full">
      <HtmlStudio />
    </div>
  );
}
