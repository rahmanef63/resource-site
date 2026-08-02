"use client"

import * as React from "react"
import { defineFeaturePreview } from "@/frontend/shared/preview"
import type { FeaturePreviewProps } from "@/frontend/shared/preview"

import { ExampleViewPresenter, type ExampleItem } from "../views/ExampleView"
import type { Id } from "@convex/_generated/dataModel"

const _id = (raw: string) => raw as unknown as Id<"exampleItems">

const MOCK_ITEMS: ExampleItem[] = [
  { _id: _id("ex_1"), name: "Read FEATURE-CREATION guide", completed: true  },
  { _id: _id("ex_2"), name: "Run pnpm run create:feature my-feature", completed: true  },
  { _id: _id("ex_3"), name: "Wire up RBAC in mutations.ts", completed: false },
  { _id: _id("ex_4"), name: "Add audit logging to writes",  completed: false },
]

function ExamplePreview({ compact }: FeaturePreviewProps) {
  const [items, setItems] = React.useState<ExampleItem[]>(MOCK_ITEMS)
  const [newItemName, setNewItemName] = React.useState("")

  if (compact) {
    return (
      <div className="p-4 text-center">
        <h3 className="text-lg font-semibold">Example</h3>
        <p className="mt-2 text-xs text-muted-foreground">
          {items.filter((i) => i.completed).length}/{items.length} done
        </p>
      </div>
    )
  }

  return (
    <div className="h-full overflow-auto">
      <ExampleViewPresenter
        items={items}
        newItemName={newItemName}
        isAdding={false}
        onNewItemNameChange={setNewItemName}
        onAddItem={() => {
          if (!newItemName.trim()) return
          setItems((prev) => [
            ...prev,
            { _id: _id(`ex_${prev.length + 1}`), name: newItemName.trim(), completed: false },
          ])
          setNewItemName("")
        }}
        onToggle={(id) =>
          setItems((prev) => prev.map((i) => (i._id === id ? { ...i, completed: !i.completed } : i)))
        }
        onDelete={(id) => setItems((prev) => prev.filter((i) => i._id !== id))}
      />
    </div>
  )
}

export default defineFeaturePreview({
  featureId: "example",
  name: "Example Feature",
  description: "A minimal example feature demonstrating SuperSpace patterns and conventions.",
  component: ExamplePreview,
  category: "productivity",
  tags: ["example", "patterns", "reference", "learning"],
  mockDataSets: [
    {
      id: "default",
      name: "Reference checklist",
      description: "4 mock items showing the real ExampleViewPresenter with interactive add/toggle/delete.",
      data: { items: MOCK_ITEMS },
    },
  ],
})
