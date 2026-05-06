"use client";

import * as React from "react";
import { Pencil, Trash2, Plus, X, Save, Search, Inbox, ArrowUpDown, ExternalLink } from "lucide-react";
import dynamic from "next/dynamic";
import { Badge } from "@/shared/ui/badge";
import { SkeletonFormField } from "@/shared/ui/skeletons";
import { cn } from "@/lib/utils";

// Form-only field editors — lazy so list browsing doesn't pull in
// the file-upload pipeline (FileUpload + crop + queue) until user
// opens an edit form.
const AdminFileField = dynamic(
  () => import("@/shared/ui/admin-file-field").then((m) => m.AdminFileField),
  { ssr: false, loading: () => <SkeletonFormField /> },
);
const AdminGalleryField = dynamic(
  () => import("@/shared/ui/admin-gallery-field").then((m) => m.AdminGalleryField),
  { ssr: false, loading: () => <SkeletonFormField lines={3} /> },
);
const AdminLinksField = dynamic(
  () => import("@/shared/ui/admin-links-field").then((m) => m.AdminLinksField),
  { ssr: false, loading: () => <SkeletonFormField /> },
);
// RichEditor pulls TipTap (~200 KB). Lazy so tables that don't open the
// edit form never pay the cost.
const AdminRichEditorField = dynamic(
  () => import("@/shared/ui/admin-richeditor-field").then((m) => m.AdminRichEditorField),
  { ssr: false, loading: () => <SkeletonFormField lines={6} /> },
);

export type CrudFieldType =
  | "text"
  | "textarea"
  | "number"
  | "boolean"
  | "select"
  | "array"
  | "file"
  | "gallery"
  | "links"
  | "richeditor";

export interface CrudField<T> {
  key: keyof T & string;
  label: string;
  type: CrudFieldType;
  options?: { label: string; value: string }[];
  placeholder?: string;
  required?: boolean;
  /** Display: render read-only cell in table */
  render?: (value: any, row: T) => React.ReactNode;
}

export interface AdminCrudProps<T extends { _id: string }> {
  title: string;
  items: T[] | undefined;
  fields: CrudField<T>[];
  defaults: Partial<T>;
  onCreate: (input: any) => Promise<any>;
  onUpdate: (id: string, patch: any) => Promise<any>;
  onRemove: (id: string) => Promise<any>;
  /** Optional shape coercion before submit */
  coerce?: (input: Partial<T>) => any;
  /** When set, each table row gets a "Lihat" button opening this href in a new tab. */
  detailHref?: (row: T) => string;
  /** Wired into every `richeditor` field's Refiner mode (LLM rewrite). */
  richEditorRefiner?: (html: string, prompt: string) => Promise<string>;
}

export function AdminCrud<T extends { _id: string }>({
  title,
  items,
  fields,
  defaults,
  onCreate,
  onUpdate,
  onRemove,
  coerce = (v) => v,
  detailHref,
  richEditorRefiner,
}: AdminCrudProps<T>) {
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [creating, setCreating] = React.useState(false);
  const [draft, setDraft] = React.useState<Partial<T>>({});
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [query, setQuery] = React.useState("");
  const [sortKey, setSortKey] = React.useState<string | null>(null);
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("asc");

  const filtered = React.useMemo(() => {
    if (!items) return undefined;
    const q = query.trim().toLowerCase();
    let list = items;
    if (q) {
      list = items.filter((row) =>
        fields.some((f) => {
          const v = (row as any)[f.key];
          if (v == null) return false;
          if (Array.isArray(v)) return v.join(" ").toLowerCase().includes(q);
          return String(v).toLowerCase().includes(q);
        }),
      );
    }
    if (sortKey) {
      const dir = sortDir === "asc" ? 1 : -1;
      list = [...list].sort((a, b) => {
        const av = (a as any)[sortKey];
        const bv = (b as any)[sortKey];
        if (av == null) return 1;
        if (bv == null) return -1;
        if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
        return String(av).localeCompare(String(bv)) * dir;
      });
    }
    return list;
  }, [items, query, sortKey, sortDir, fields]);

  const toggleSort = (key: string) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const beginCreate = () => {
    setCreating(true);
    setEditingId(null);
    setDraft({ ...defaults });
    setError(null);
  };
  const beginEdit = (row: T) => {
    setEditingId(row._id);
    setCreating(false);
    setDraft({ ...row });
    setError(null);
  };
  const cancel = () => {
    setEditingId(null);
    setCreating(false);
    setDraft({});
    setError(null);
  };

  const save = async () => {
    setBusy(true);
    setError(null);
    try {
      const payload = coerce(draft);
      if (creating) await onCreate(payload);
      else if (editingId) {
        const patch = { ...payload };
        delete patch._id;
        delete patch._creationTime;
        delete patch.createdAt;
        await onUpdate(editingId, patch);
      }
      cancel();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan");
    } finally {
      setBusy(false);
    }
  };

  const del = async (id: string) => {
    if (!confirm("Hapus item ini?")) return;
    setBusy(true);
    try {
      await onRemove(id);
    } finally {
      setBusy(false);
    }
  };

  const showForm = creating || editingId !== null;

  const count = items?.length ?? 0;
  const visibleCount = filtered?.length ?? 0;

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-baseline gap-3">
          <h1 className="font-serif text-3xl lg:text-4xl leading-tight">{title}</h1>
          {items !== undefined && (
            <span className="inline-flex items-center gap-1 border-2 border-foreground rounded-sm px-2 py-0.5 text-[10px] uppercase tracking-brutal font-medium tabular-nums">
              {query ? `${visibleCount}/${count}` : count}
            </span>
          )}
        </div>
        {!showForm && (
          <div className="flex items-center gap-2">
            <label className="relative flex items-center">
              <Search className="absolute left-3 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              <input
                type="search"
                placeholder="Cari…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-40 sm:w-56 border-2 border-foreground rounded-md bg-background pl-9 pr-3 py-2 text-xs uppercase tracking-brutal-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              />
            </label>
            <button
              type="button"
              onClick={beginCreate}
              className="inline-flex items-center gap-2 border-2 border-foreground rounded-md shadow-xs bg-foreground text-background px-4 py-2 text-xs uppercase tracking-brutal-sm font-medium transition-all hover:-translate-y-0.5 hover:shadow-md hover:bg-background hover:text-foreground"
            >
              <Plus className="w-4 h-4" /> Tambah
            </button>
          </div>
        )}
      </header>

      {showForm && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
          className="border-2 border-foreground rounded-lg shadow-sm bg-card p-6 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl">{creating ? "Item baru" : "Edit item"}</h2>
            <button
              type="button"
              onClick={cancel}
              className="inline-flex items-center justify-center w-8 h-8 border-2 border-foreground rounded-md hover:bg-foreground hover:text-background transition-colors"
              aria-label="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          {error && (
            <div className="border-2 border-destructive rounded-md bg-destructive/10 px-3 py-2 text-xs uppercase tracking-brutal-sm text-destructive">
              {error}
            </div>
          )}
          <div className="grid gap-4 md:grid-cols-2">
            {fields.map((f) => (
              <FieldInput
                key={f.key}
                field={f}
                value={(draft as any)[f.key]}
                onChange={(v) => setDraft((d) => ({ ...d, [f.key]: v }))}
                onRefine={richEditorRefiner}
              />
            ))}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={cancel}
              className="border-2 border-foreground rounded-md shadow-xs bg-background text-foreground px-4 py-2 text-xs uppercase tracking-brutal-sm font-medium hover:bg-foreground hover:text-background transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={busy}
              className="inline-flex items-center gap-2 border-2 border-foreground rounded-md shadow-xs bg-foreground text-background px-4 py-2 text-xs uppercase tracking-brutal-sm font-medium hover:bg-background hover:text-foreground transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> {busy ? "Menyimpan…" : "Simpan"}
            </button>
          </div>
        </form>
      )}

      {items === undefined ? (
        <div className="border-2 border-foreground rounded-lg shadow-sm divide-y-2 divide-foreground/10 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="px-4 py-4 flex items-center gap-4 animate-pulse">
              <div className="w-32 h-3 bg-muted rounded" />
              <div className="flex-1 h-3 bg-muted rounded" />
              <div className="w-16 h-3 bg-muted rounded" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="border-2 border-foreground rounded-lg shadow-sm p-10 text-center space-y-3">
          <div className="inline-flex items-center justify-center w-12 h-12 border-2 border-foreground rounded-md bg-muted text-muted-foreground">
            <Inbox className="w-5 h-5" />
          </div>
          <div className="text-sm text-muted-foreground">
            Belum ada item. Klik <strong>Tambah</strong> untuk membuat.
          </div>
          <button
            type="button"
            onClick={beginCreate}
            className="inline-flex items-center gap-2 border-2 border-foreground rounded-md shadow-xs bg-foreground text-background px-4 py-2 text-xs uppercase tracking-brutal-sm font-medium transition-all hover:-translate-y-0.5 hover:shadow-md hover:bg-background hover:text-foreground"
          >
            <Plus className="w-4 h-4" /> Tambah item pertama
          </button>
        </div>
      ) : visibleCount === 0 ? (
        <div className="border-2 border-foreground rounded-lg shadow-sm p-8 text-center text-sm text-muted-foreground">
          Tidak ada hasil untuk <strong>&ldquo;{query}&rdquo;</strong>.
        </div>
      ) : (
        <div className="overflow-x-auto border-2 border-foreground rounded-lg shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-foreground text-background sticky top-0">
              <tr>
                {fields.slice(0, 4).map((f) => {
                  const isSorted = sortKey === f.key;
                  return (
                    <th key={f.key} className="px-4 py-3 text-left text-[10px] uppercase tracking-brutal font-medium">
                      <button
                        type="button"
                        onClick={() => toggleSort(f.key)}
                        className="inline-flex items-center gap-1.5 hover:opacity-80"
                      >
                        {f.label}
                        <ArrowUpDown
                          className={cn(
                            "w-3 h-3 transition-opacity",
                            isSorted ? "opacity-100" : "opacity-40",
                          )}
                        />
                        {isSorted && (
                          <span className="tabular-nums text-[9px]">
                            {sortDir === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </button>
                    </th>
                  );
                })}
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-foreground/10">
              {filtered!.map((row) => (
                <tr key={row._id} className="align-top transition-colors hover:bg-accent/40">
                  {fields.slice(0, 4).map((f) => (
                    <td key={f.key} className="px-4 py-3 max-w-xs">
                      {f.render ? (
                        f.render((row as any)[f.key], row)
                      ) : f.type === "boolean" ? (
                        <Badge variant={(row as any)[f.key] ? "inverted" : "muted"}>
                          {(row as any)[f.key] ? "Yes" : "No"}
                        </Badge>
                      ) : f.type === "array" ? (
                        <span className="text-xs text-muted-foreground">
                          {Array.isArray((row as any)[f.key]) ? (row as any)[f.key].join(", ") : ""}
                        </span>
                      ) : f.type === "file" ? (
                        (row as any)[f.key] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={(row as any)[f.key]}
                            alt=""
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                            className="size-12 object-cover border-2 border-foreground rounded-sm bg-background"
                          />
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )
                      ) : f.type === "gallery" ? (
                        (() => {
                          const arr = (row as any)[f.key] as string[] | undefined;
                          if (!arr || arr.length === 0) return <span className="text-xs text-muted-foreground">—</span>;
                          return (
                            <div className="flex items-center gap-1">
                              {arr.slice(0, 3).map((src, idx) => (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  key={`${src}-${idx}`}
                                  src={src}
                                  alt=""
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = "none";
                                  }}
                                  className="size-10 object-cover border-2 border-foreground rounded-sm bg-background"
                                />
                              ))}
                              {arr.length > 3 && (
                                <span className="text-[10px] uppercase tracking-brutal text-muted-foreground">
                                  +{arr.length - 3}
                                </span>
                              )}
                            </div>
                          );
                        })()
                      ) : f.type === "links" ? (
                        (() => {
                          const arr = (row as any)[f.key] as { label: string; url: string }[] | undefined;
                          if (!arr || arr.length === 0) return <span className="text-xs text-muted-foreground">—</span>;
                          return (
                            <div className="flex flex-wrap items-center gap-1">
                              {arr.slice(0, 2).map((l, idx) => (
                                <span
                                  key={idx}
                                  className="text-[10px] uppercase tracking-brutal border-2 border-foreground rounded-sm px-1.5 py-0.5 truncate max-w-[8rem]"
                                  title={l.url}
                                >
                                  {l.label || l.url}
                                </span>
                              ))}
                              {arr.length > 2 && (
                                <span className="text-[10px] uppercase tracking-brutal text-muted-foreground">
                                  +{arr.length - 2}
                                </span>
                              )}
                            </div>
                          );
                        })()
                      ) : (
                        <span className="line-clamp-2 break-words">{String((row as any)[f.key] ?? "")}</span>
                      )}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    {detailHref && (
                      <a
                        href={detailHref(row)}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="mr-2 inline-flex items-center gap-1 border-2 border-foreground rounded-md px-2 py-1 text-[10px] uppercase tracking-brutal-sm transition-all hover:-translate-y-0.5 hover:shadow-xs hover:bg-foreground hover:text-background"
                      >
                        <ExternalLink className="w-3 h-3" /> Lihat
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => beginEdit(row)}
                      className="mr-2 inline-flex items-center gap-1 border-2 border-foreground rounded-md px-2 py-1 text-[10px] uppercase tracking-brutal-sm transition-all hover:-translate-y-0.5 hover:shadow-xs hover:bg-foreground hover:text-background"
                    >
                      <Pencil className="w-3 h-3" /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => del(row._id)}
                      className="inline-flex items-center gap-1 border-2 border-destructive rounded-md text-destructive px-2 py-1 text-[10px] uppercase tracking-brutal-sm transition-all hover:-translate-y-0.5 hover:shadow-xs hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <Trash2 className="w-3 h-3" /> Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function FieldInput<T>({
  field,
  value,
  onChange,
  onRefine,
}: {
  field: CrudField<T>;
  value: any;
  onChange: (v: any) => void;
  onRefine?: (html: string, prompt: string) => Promise<string>;
}) {
  const baseCls =
    "w-full border-2 border-foreground rounded-md bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";
  const wide =
    field.type === "textarea" ||
    field.type === "array" ||
    field.type === "file" ||
    field.type === "gallery" ||
    field.type === "links" ||
    field.type === "richeditor";
  return (
    <div className={cn("space-y-1", wide && "md:col-span-2")}>
      <label className="text-xs uppercase tracking-brutal-sm font-medium">
        {field.label}
        {field.required ? " *" : ""}
      </label>
      {field.type === "file" ? (
        <AdminFileField
          value={value}
          onChange={onChange}
          placeholder={field.placeholder}
        />
      ) : field.type === "gallery" ? (
        <AdminGalleryField value={value} onChange={onChange} />
      ) : field.type === "links" ? (
        <AdminLinksField value={value} onChange={onChange} />
      ) : field.type === "richeditor" ? (
        <AdminRichEditorField
          value={value ?? ""}
          onChange={onChange}
          onRefine={onRefine}
        />
      ) : field.type === "textarea" ? (
        <textarea
          rows={4}
          required={field.required}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className={baseCls}
        />
      ) : field.type === "boolean" ? (
        <select
          value={value ? "true" : "false"}
          onChange={(e) => onChange(e.target.value === "true")}
          className={baseCls}
        >
          <option value="false">No</option>
          <option value="true">Yes</option>
        </select>
      ) : field.type === "select" ? (
        <select
          required={field.required}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className={baseCls}
        >
          <option value="" disabled>
            Select…
          </option>
          {field.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ) : field.type === "number" ? (
        <input
          type="number"
          required={field.required}
          value={value ?? 0}
          onChange={(e) => onChange(Number(e.target.value))}
          className={baseCls}
        />
      ) : field.type === "array" ? (
        <textarea
          rows={3}
          placeholder="Comma-separated"
          value={Array.isArray(value) ? value.join(", ") : ""}
          onChange={(e) =>
            onChange(
              e.target.value
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
            )
          }
          className={baseCls}
        />
      ) : (
        <input
          type="text"
          required={field.required}
          placeholder={field.placeholder}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className={baseCls}
        />
      )}
    </div>
  );
}
