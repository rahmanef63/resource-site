# feedback-widget

Floating feedback button. Default → localStorage queue. Opt-in → Convex inbox.

## Use (localStorage default)
```tsx
<FeedbackButton />
const { items } = useFeedbackStore();   // read queue
```

## Use (Convex)
1. Copy `convex/feedback.ts` to consumer's `convex/`.
2. Add schema fragment.
3. Pass mutation to button:
```tsx
const submit = useMutation(api.feedback.submit);
<FeedbackButton onSubmit={(text) => submit({ text })} />
```
