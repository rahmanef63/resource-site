"use client";

import * as React from "react";
import { Bot, Eye, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { rel, useChatSessions } from "../../../shared/store";

const SKILLS = [
  { name: "general", desc: "Q&A umum, pakai konteks blog (vector search)." },
  { name: "academic-qa", desc: "Untuk visitor yang nanya soal paper / publikasi." },
  { name: "consultation", desc: "Lead-capture flow → tool-call book-call." },
];

export function ChatbotAdminView() {
  const sessions = useChatSessions();
  const flagged = sessions.filter((s) => s.flagged);
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const active = sessions.find((s) => s.id === activeId) ?? null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Chatbot</h1>
          <p className="text-sm text-muted-foreground">
            {SKILLS.length} skills · {sessions.length} sessions · {flagged.length} flagged
          </p>
        </div>
        <Button size="sm" className="gap-1"><Plus className="size-4" /> New skill</Button>
      </div>

      <Tabs defaultValue="sessions">
        <TabsList>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="config">Model config</TabsTrigger>
        </TabsList>

        <TabsContent value="sessions" className="mt-3">
          <div className="grid gap-3 lg:grid-cols-[1fr_2fr]">
            <Card className="border-border/60">
              <CardContent className="p-0">
                {sessions.length === 0 ? (
                  <p className="p-10 text-center text-sm text-muted-foreground">
                    Belum ada session. Buka tab Public dan klik "Tanya AI Lorem" di FAB untuk start.
                  </p>
                ) : (
                  <ul className="divide-y divide-border/60">
                    {sessions.map((s) => (
                      <li key={s.id}>
                        <button
                          onClick={() => setActiveId(s.id)}
                          className={
                            "flex w-full items-start gap-3 p-3 text-left transition " +
                            (activeId === s.id ? "bg-accent" : "hover:bg-accent/40")
                          }
                        >
                          <Bot className="mt-0.5 size-4 text-muted-foreground" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm">
                              {s.messages[s.messages.length - 1]?.content ?? "(empty)"}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {s.visitorId} · {s.messages.length} msg · {rel(s.startedAt)}
                            </p>
                          </div>
                          {s.flagged && (
                            <Badge className="rounded-full bg-rose-500/15 text-[10px] text-rose-300 hover:bg-rose-500/15">
                              flagged
                            </Badge>
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardContent className="flex h-[420px] flex-col gap-3 p-0">
                {active ? (
                  <>
                    <div className="flex items-center justify-between border-b border-border/60 p-3">
                      <p className="text-sm">
                        <span className="font-medium">{active.visitorId}</span>{" "}
                        <span className="text-muted-foreground">· {active.messages.length} messages</span>
                      </p>
                      {active.flagged && (
                        <Badge className="rounded-full bg-rose-500/15 text-[10px] text-rose-300 hover:bg-rose-500/15">
                          AI flag detected
                        </Badge>
                      )}
                    </div>
                    <div className="flex-1 space-y-2 overflow-auto p-3">
                      {active.messages.map((m) => (
                        <div
                          key={m.id}
                          className={
                            "max-w-[75%] rounded-xl px-3 py-2 text-sm " +
                            (m.role === "user"
                              ? "ml-auto bg-foreground text-background"
                              : "bg-muted/40 text-foreground")
                          }
                        >
                          {m.content}
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="grid h-full place-items-center text-sm text-muted-foreground">
                    <div className="text-center">
                      <Eye className="mx-auto size-5" />
                      <p className="mt-2">Pilih session untuk lihat transcript.</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="skills" className="mt-3">
          <div className="grid gap-3 md:grid-cols-3">
            {SKILLS.map((s) => (
              <Card key={s.name} className="border-border/60">
                <CardContent className="p-5">
                  <p className="font-mono text-xs text-muted-foreground">{s.name}</p>
                  <p className="mt-2 text-sm">{s.desc}</p>
                  <Button variant="outline" size="sm" className="mt-3 w-full">Edit prompt</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="config" className="mt-3">
          <Card className="border-border/60">
            <CardContent className="space-y-3 p-6 text-sm">
              <Row k="Default model" v="claude-sonnet-4-6" />
              <Row k="Fallback" v="claude-haiku-4-5" />
              <Row k="Daily budget cap" v="USD $5.00" mono />
              <Row k="Per-visitor rate-limit" v="20 msg / hour" mono />
              <Row k="Vector index" v="posts (1536-dim)" mono />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Row({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{k}</span>
      {mono ? <span className="font-mono">{v}</span> : <Badge variant="outline">{v}</Badge>}
    </div>
  );
}
