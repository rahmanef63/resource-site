# markdown-editor

Textarea + GFM preview. Default state = localStorage. Optional Convex backing.

## Install
```bash
pnpm add react-markdown remark-gfm
```

## Use (localStorage default)
```tsx
const [value, setValue] = useMarkdownDoc("notes:welcome", "# Hello");
<MarkdownEditor value={value} onChange={setValue} />
```

## Use (Convex backing — opt-in)
1. Copy `convex/markdownDoc.ts` to consumer's `convex/` folder.
2. Add the schema fragment (commented at top of file) to `convex/schema.ts`.
3. Run `pnpm backend:dev-sync`.
4. Swap `useMarkdownDoc` for `useQuery(api.markdownDoc.get) + useMutation(api.markdownDoc.save)`.
