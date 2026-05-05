"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import type { Project, ProjectStatus } from "../../../shared/types";
import { nid, useProjects, useStore } from "../../../shared/store";
import { ADMIN_BASE } from "../../../shared/nav-config";

const STATUSES: ProjectStatus[] = ["discovery", "design", "build", "delivered", "archived"];

function slugify(s: string) {
  return s.toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").slice(0, 64);
}

export function ProjectEditor({ id }: { id: string | null }) {
  const router = useRouter();
  const projects = useProjects();
  const { dispatch } = useStore();
  const existing = id ? projects.find((p) => p.id === id) : null;

  const [title, setTitle] = React.useState(existing?.title ?? "");
  const [slug, setSlug] = React.useState(existing?.slug ?? "");
  const [client, setClient] = React.useState(existing?.client ?? "");
  const [category, setCategory] = React.useState(existing?.category ?? "Brand Identity");
  const [cover, setCover] = React.useState(existing?.cover ?? "");
  const [blurb, setBlurb] = React.useState(existing?.blurb ?? "");
  const [brief, setBrief] = React.useState(existing?.brief ?? "");
  const [outcome, setOutcome] = React.useState(existing?.outcome ?? "");
  const [status, setStatus] = React.useState<ProjectStatus>(existing?.status ?? "discovery");
  const [featured, setFeatured] = React.useState(existing?.featured ?? false);

  function save() {
    if (!title || !client) {
      toast.error("Title and client are required.");
      return;
    }
    const project: Project = {
      id: existing?.id ?? nid("proj"),
      slug: slug || slugify(title),
      title,
      client,
      category,
      cover,
      blurb,
      brief,
      outcome,
      status,
      featured,
      publishedAt: existing?.publishedAt ?? Date.now(),
    };
    dispatch({ type: "project.upsert", project });
    toast.success(existing ? "Project updated" : "Project created");
    router.push(`${ADMIN_BASE}/projects`);
  }

  function remove() {
    if (!existing) return;
    if (!confirm(`Delete "${existing.title}"?`)) return;
    dispatch({ type: "project.delete", id: existing.id });
    toast.success("Deleted");
    router.push(`${ADMIN_BASE}/projects`);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm">
          <Link href={`${ADMIN_BASE}/projects`}><ArrowLeft className="size-3.5" /> Projects</Link>
        </Button>
        <div className="flex gap-2">
          {existing && <Button variant="destructive" size="sm" onClick={remove}>Delete</Button>}
          <Button size="sm" onClick={save}><Save className="size-4" /> Save</Button>
        </div>
      </div>
      <Card className="border-border/60">
        <CardContent className="grid gap-4 p-6 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder={slugify(title)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="client">Client</Label>
            <Input id="client" value={client} onChange={(e) => setClient(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as ProjectStatus)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
            >
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="cover">Cover image URL</Label>
            <Input id="cover" value={cover} onChange={(e) => setCover(e.target.value)} placeholder="https://images.unsplash.com/…" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="blurb">Blurb</Label>
            <Input id="blurb" value={blurb} onChange={(e) => setBlurb(e.target.value)} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="brief">Brief</Label>
            <Textarea id="brief" rows={3} value={brief} onChange={(e) => setBrief(e.target.value)} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="outcome">Outcome</Label>
            <Textarea id="outcome" rows={3} value={outcome} onChange={(e) => setOutcome(e.target.value)} />
          </div>
          <div className="md:col-span-2 flex items-center gap-2">
            <input id="featured" type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
            <Label htmlFor="featured">Featured (show on home page)</Label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
