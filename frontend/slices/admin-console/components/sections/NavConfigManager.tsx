"use client"

import * as React from "react"
import { ArrowDown, ArrowUp, Eye, EyeOff, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { MOCK_NAV, type NavItem } from "../../lib/mock"

/**
 * Navigation config — gap section. Reorderable, toggleable nav CRUD over
 * injected items (default: mock). `onChange` receives the full list on every
 * edit; keep it undefined for a self-contained demo.
 */
export function NavConfigManager({
  items = MOCK_NAV,
  onChange,
}: {
  items?: NavItem[]
  onChange?: (items: NavItem[]) => void
}) {
  const [list, setList] = React.useState<NavItem[]>(() =>
    [...items].sort((a, b) => a.order - b.order),
  )

  const commit = (next: NavItem[]) => {
    const ordered = next.map((it, i) => ({ ...it, order: i }))
    setList(ordered)
    onChange?.(ordered)
  }

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir
    if (j < 0 || j >= list.length) return
    const next = [...list]
    ;[next[i], next[j]] = [next[j], next[i]]
    commit(next)
  }

  const patch = (id: string, p: Partial<NavItem>) =>
    commit(list.map((it) => (it.id === id ? { ...it, ...p } : it)))

  const add = () =>
    commit([...list, { id: `n${Date.now()}`, label: "New link", href: "/", order: list.length, visible: true }])

  return (
    <div className="space-y-3">
      <div className="flex justify-between">
        <p className="text-sm text-muted-foreground">{list.length} navigation items</p>
        <Button size="sm" onClick={add}>
          <Plus className="mr-1 size-4" /> Add
        </Button>
      </div>
      {list.map((it, i) => (
        <Card key={it.id} className="flex items-center gap-2 p-2">
          <div className="flex flex-col">
            <Button variant="ghost" size="icon" className="size-6" disabled={i === 0} onClick={() => move(i, -1)}>
              <ArrowUp className="size-3" />
            </Button>
            <Button variant="ghost" size="icon" className="size-6" disabled={i === list.length - 1} onClick={() => move(i, 1)}>
              <ArrowDown className="size-3" />
            </Button>
          </div>
          <Input value={it.label} onChange={(e) => patch(it.id, { label: e.target.value })} className="h-8 flex-1" />
          <Input value={it.href} onChange={(e) => patch(it.id, { href: e.target.value })} className="h-8 flex-1 font-mono text-xs" />
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            title={it.visible ? "Visible" : "Hidden"}
            onClick={() => patch(it.id, { visible: !it.visible })}
          >
            {it.visible ? <Eye className="size-4" /> : <EyeOff className="size-4 text-muted-foreground" />}
          </Button>
          <Button variant="ghost" size="icon" className="size-8" onClick={() => commit(list.filter((x) => x.id !== it.id))}>
            <Trash2 className="size-4 text-destructive" />
          </Button>
        </Card>
      ))}
    </div>
  )
}
