import { readSliceFiles } from "@/lib/slice-files";
import { SliceCodeViewer } from "./code-viewer";

interface Props {
  slug: string;
  slicePath: string;
}

/**
 * Server entry — reads slice files from disk at build time and passes
 * the flat file list to the client viewer. Slices with empty `slicePath`
 * (e.g. pure-backend slices) should NOT render this; gate at the caller.
 */
export async function SliceCodeSection({ slug, slicePath }: Props) {
  const files = await readSliceFiles(slicePath);
  return <SliceCodeViewer slug={slug} rootPath={slicePath} files={files} />;
}
