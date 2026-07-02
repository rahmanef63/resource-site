"use client";

import { Table2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AiVisualBlock } from "../types";
import { AreaChartCard } from "../charts/AreaChartCard";
import { PieChartCard } from "../charts/PieChartCard";
import { WaterfallChart } from "../charts/WaterfallChart";
import { KpiCard } from "./KpiCard";
import { ChatComparisonTable } from "./ChatComparisonTable";
import { ChatActionList } from "./ChatActionList";

interface Props {
  visuals: AiVisualBlock[];
}

export function ChatVisualRenderer({ visuals }: Props) {
  return (
    <div className="space-y-3 max-w-[85%] md:max-w-[75%]">
      {visuals.map((block, index) => {
        if (block.type === "chart") {
          if (block.variant === "area") {
            return (
              <AreaChartCard
                key={`${block.type}-${index}`}
                title={block.title}
                subtitle={block.subtitle}
                data={block.data.map((d) => ({
                  label: String(d.label ?? "-"),
                  value: Number(d.value ?? 0),
                }))}
              />
            );
          }
          if (block.variant === "pie") {
            return (
              <PieChartCard
                key={`${block.type}-${index}`}
                title={block.title}
                subtitle={block.subtitle}
                data={block.data.map((d) => ({
                  name: String(d.name ?? "-"),
                  value: Number(d.value ?? 0),
                  color: d.color ? String(d.color) : undefined,
                }))}
              />
            );
          }
          return (
            <WaterfallChart
              key={`${block.type}-${index}`}
              title={block.title}
              subtitle={block.subtitle}
              data={block.data.map((d) => ({
                name: String(d.name ?? "-"),
                value: Number(d.value ?? 0),
              }))}
            />
          );
        }

        if (block.type === "kpi_cards") {
          return (
            <div key={`${block.type}-${index}`} className="bg-card border border-border/60 rounded-2xl shadow-sm p-4">
              <div className="mb-3">
                <h3 className="text-sm font-semibold">{block.title}</h3>
                {block.subtitle ? <p className="text-xs text-muted-foreground mt-0.5">{block.subtitle}</p> : null}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {block.items.map((item, j) => (
                  <KpiCard
                    key={`${item.label}-${j}`}
                    label={item.label}
                    value={item.value}
                    badge={item.badge}
                    tone={item.tone}
                  />
                ))}
              </div>
            </div>
          );
        }

        if (block.type === "comparison_table") {
          return <ChatComparisonTable key={`${block.type}-${index}`} block={block} />;
        }

        if (block.type === "action_list") {
          return <ChatActionList key={`${block.type}-${index}`} block={block} />;
        }

        return (
          <div key={`${block.type}-${index}`} className="bg-card border border-border/60 rounded-2xl shadow-sm p-4">
            <div className="mb-3 flex items-center gap-2">
              <Table2 className="h-4 w-4 text-primary" />
              <div>
                <h3 className="text-sm font-semibold">{block.title}</h3>
                {block.subtitle ? <p className="text-xs text-muted-foreground mt-0.5">{block.subtitle}</p> : null}
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  {block.columns.map((c) => (
                    <TableHead key={c}>{c}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {block.rows.map((row, i) => (
                  <TableRow key={`${row.join("-")}-${i}`}>
                    {row.map((cell, j) => (
                      <TableCell key={`${cell}-${j}`}>{cell}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        );
      })}
    </div>
  );
}
