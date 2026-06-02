import { useRef, type ComponentProps } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FilePicker, type FilePickerHandle } from "@/shared/ui/FilePicker";
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
  const pickerRef = useRef<FilePickerHandle>(null);
  const { upload, uploading } = useFileUpload();

  const onPick = async (files: File[]) => {
    for (const f of files) {
      try {
        const ref = await upload(f);
        onUploaded(ref);
      } catch (e) {
        console.error("Upload failed", e);
      }
    }
  };

  return (
    <>
      <FilePicker ref={pickerRef} multiple={multiple} onFiles={onPick} />
      <Button
        {...props}
        variant="ghost"
        onClick={() => pickerRef.current?.open()}
        disabled={uploading}
        className={cn("h-auto gap-1 p-0 text-xs font-normal text-muted-foreground hover:bg-transparent hover:text-foreground [&_svg]:size-3", className)}
      >
        <Upload className="h-3 w-3" />
        {uploading ? "Uploading…" : label}
      </Button>
    </>
  );
}
