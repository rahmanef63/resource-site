# csv-import-export

Standalone CSV in/out. No Convex.

## Install
```bash
pnpm add papaparse zod
pnpm add -D @types/papaparse
```

## Use
```tsx
import { z } from "zod";
const Row = z.object({ name: z.string(), email: z.string().email() });

<CsvImportButton schema={Row} onRows={(rows) => save(rows)} onError={console.error} />
<CsvExportButton rows={items} filename="export.csv" />
```
