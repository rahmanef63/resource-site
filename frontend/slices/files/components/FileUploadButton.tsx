import { useRef, type ComponentProps } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useFileUpload } from "../hooks/useFileUpload";
import type { FileRef } from "../types";

interface Props extends ComponentProps<typeof Button> {
  onUploaded: (ref: FileRef) => void;
  multiple?: boolean;
  label?: string;
}

export function FileUploadButton({
  onUploaded,
  multiple = false,
  className,
  label = "Upload",
  ...props
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { upload, uploading } = useFileUpload();

  const onPick = async (files: FileList | null) => {
    if (!files) return;
    for (const f of Array.from(files)) {
      try {
        const ref = await upload(f);
        onUploaded(ref);
      } catch (e) {
        console.error("Upload failed", e);
      }
    }
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        multiple={multiple}
        className="hidden"
        onChange={(e) => onPick(e.target.files)}
      />
      <Button
        {...props}
        variant="ghost"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className={cn("h-auto gap-1 p-0 text-xs font-normal text-muted-foreground hover:bg-transparent hover:text-foreground [&_svg]:size-3", className)}
      >
        <Upload className="h-3 w-3" />
        {uploading ? "Uploading…" : label}
      </Button>
    </>
  );
}
