"use client";

/** ColumnHeaderMenu — per-column dropdown: rename / change type /
 *  sort asc/desc / hide / delete. Pure callbacks — host wires to db
 *  view config + property schema mutations. */

import {
  Pencil, ArrowUp, ArrowDown, EyeOff, Trash2, ChevronDown, Shapes,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  type Property,
  type PropertyType,
  PROPERTY_TYPES_USER_ADDABLE,
  PROPERTY_TYPE_META,
} from "../types";

export interface ColumnHeaderMenuProps {
  prop: Property;
  onRename?: () => void;
  onTypeChange?: (type: PropertyType) => void;
  onSortAsc?: () => void;
  onSortDesc?: () => void;
  onHide?: () => void;
  onDelete?: () => void;
}

export function ColumnHeaderMenu({
  prop, onRename, onTypeChange, onSortAsc, onSortDesc, onHide, onDelete,
}: ColumnHeaderMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          type="button"
          className="flex h-auto w-full items-center justify-start gap-1 truncate px-0 text-left text-xs font-normal text-muted-foreground hover:bg-transparent hover:text-foreground"
          aria-label="Column menu"
        >
          <span className="truncate">{prop.name}</span>
          <ChevronDown className="h-3 w-3 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="bottom" className="w-52">
        <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
          {prop.name} · {prop.type}
        </DropdownMenuLabel>
        {onRename && (
          <DropdownMenuItem onClick={onRename} className="gap-2 text-sm">
            <Pencil className="h-3.5 w-3.5 text-muted-foreground" /> Rename
          </DropdownMenuItem>
        )}
        {onTypeChange && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
              <Shapes className="h-3 w-3" /> Change type
            </DropdownMenuLabel>
            <div className="max-h-48 overflow-y-auto pb-1">
              {PROPERTY_TYPES_USER_ADDABLE.map((t) => (
                <DropdownMenuItem
                  key={t}
                  onClick={() => onTypeChange(t)}
                  className={`gap-2 text-sm ${t === prop.type ? "bg-accent/60" : ""}`}
                >
                  {PROPERTY_TYPE_META[t].label}
                  {t === prop.type && <span className="ml-auto text-[10px] text-muted-foreground">current</span>}
                </DropdownMenuItem>
              ))}
            </div>
          </>
        )}
        {(onSortAsc || onSortDesc) && <DropdownMenuSeparator />}
        {onSortAsc && (
          <DropdownMenuItem onClick={onSortAsc} className="gap-2 text-sm">
            <ArrowUp className="h-3.5 w-3.5 text-muted-foreground" /> Sort ascending
          </DropdownMenuItem>
        )}
        {onSortDesc && (
          <DropdownMenuItem onClick={onSortDesc} className="gap-2 text-sm">
            <ArrowDown className="h-3.5 w-3.5 text-muted-foreground" /> Sort descending
          </DropdownMenuItem>
        )}
        {(onHide || onDelete) && <DropdownMenuSeparator />}
        {onHide && (
          <DropdownMenuItem onClick={onHide} className="gap-2 text-sm">
            <EyeOff className="h-3.5 w-3.5 text-muted-foreground" /> Hide
          </DropdownMenuItem>
        )}
        {onDelete && (
          <DropdownMenuItem
            onClick={onDelete}
            className="gap-2 text-sm text-destructive focus:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete property
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
