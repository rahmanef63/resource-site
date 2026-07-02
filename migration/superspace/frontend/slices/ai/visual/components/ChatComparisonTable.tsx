"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AiComparisonTableVisualBlock } from "../types";

interface Props {
  block: AiComparisonTableVisualBlock;
}

export function ChatComparisonTable({ block }: Props) {
  return (
    <div className="bg-card border border-border/60 rounded-2xl shadow-sm p-4">
      <div className="mb-3">
        <h3 className="text-sm font-semibold">{block.title}</h3>
        {block.subtitle ? <p className="text-xs text-muted-foreground mt-0.5">{block.subtitle}</p> : null}
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
      {block.summary ? <p className="text-xs text-muted-foreground mt-3">{block.summary}</p> : null}
    </div>
  );
}
