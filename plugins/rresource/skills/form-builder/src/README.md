# form-builder

zod schema → react-hook-form → minimal auto form. No Convex.

## Install
```bash
pnpm add react-hook-form @hookform/resolvers zod
```

## Use
```tsx
import { z } from "zod";
const Schema = z.object({ name: z.string().min(2), age: z.number().int().min(1) });
<AutoForm schema={Schema} onSubmit={(v) => console.log(v)} />
```

## Custom rendering
For complex layouts, drop `AutoForm` and use `useZodForm` directly with shadcn `<Form>` components.
