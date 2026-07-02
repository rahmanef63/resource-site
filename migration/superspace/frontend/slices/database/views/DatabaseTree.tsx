"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import type { Id } from "@convex/_generated/dataModel";
import {
    MoreHorizontal,
    FileEdit,
    Copy,
    Trash2,
    Database, // Added fallback icon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { DatabaseTable } from "../types";

// Use shared IconPicker
import { IconPicker, getIconComponent } from "@/frontend/shared/ui/icons";

export interface DatabaseTreeProps {
    tables: DatabaseTable[];
    selectedId: Id<"dbTables"> | null;
    onSelect: (id: Id<"dbTables">) => void;
    onRename?: (table: DatabaseTable, newName: string) => void;
    onUpdateIcon?: (table: DatabaseTable, iconData: { name: string; color: string }) => void;
    onDuplicate?: (table: DatabaseTable) => void;
    onDelete?: (table: DatabaseTable) => void;
}

export function DatabaseTree({
    tables,
    selectedId,
    onSelect,
    onRename,
    onUpdateIcon,
    onDuplicate,
    onDelete,
}: DatabaseTreeProps) {
    return (
        <div className="space-y-1">
            {tables.map((table) => (
                <DatabaseTreeItem
                    key={table._id}
                    table={table}
                    isSelected={table._id === selectedId}
                    onSelect={() => onSelect(table._id)}
                    onRename={onRename ? (newName) => onRename(table, newName) : undefined}
                    onUpdateIcon={onUpdateIcon ? (iconData) => onUpdateIcon(table, iconData) : undefined}
                    onDuplicate={onDuplicate ? () => onDuplicate(table) : undefined}
                    onDelete={onDelete ? () => onDelete(table) : undefined}
                />
            ))}
        </div>
    );
}

interface DatabaseTreeItemProps {
    table: DatabaseTable;
    isSelected: boolean;
    onSelect: () => void;
    onRename?: (newName: string) => void;
    onUpdateIcon?: (iconData: { name: string; color: string }) => void;
    onDuplicate?: () => void;
    onDelete?: () => void;
}

function DatabaseTreeItem({
    table,
    isSelected,
    onSelect,
    onRename,
    onUpdateIcon,
    onDuplicate,
    onDelete,
}: DatabaseTreeItemProps) {
    const [isHovered, setIsHovered] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    // Get display name
    const displayName = useMemo(() => {
        const name = table.name || "Untitled database";
        return typeof name === "string" ? name : "Untitled database";
    }, [table.name]);

    // Parse icon from JSON or use default
    const { iconName, iconColor } = useMemo(() => {
        const iconValue = table.icon;
        let name = "Database";
        let color = "";

        if (typeof iconValue === "string" && iconValue.startsWith("{")) {
            try {
                const parsed = JSON.parse(iconValue);
                if (parsed.name) name = parsed.name;
                if (parsed.color) color = parsed.color;
            } catch {
                // Use defaults
            }
        } else if (typeof iconValue === "string" && iconValue.length > 0) {
            name = iconValue;
        }

        return { iconName: name, iconColor: color };
    }, [table.icon]);

    const IconComponent = getIconComponent(iconName) || Database;

    // Handle double-click to edit
    const handleDoubleClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        if (onRename) {
            setEditValue(displayName);
            setIsEditing(true);
        }
    }, [displayName, onRename]);

    // Focus input when editing starts
    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    // Handle rename submit
    const handleRenameSubmit = useCallback(() => {
        if (editValue.trim() && editValue.trim() !== displayName && onRename) {
            onRename(editValue.trim());
        }
        setIsEditing(false);
    }, [editValue, displayName, onRename]);

    // Handle key events
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleRenameSubmit();
        } else if (e.key === "Escape") {
            setIsEditing(false);
        }
    }, [handleRenameSubmit]);

    // Handle icon change from shared picker
    const handleIconChange = useCallback((newIconName: string) => {
        if (onUpdateIcon) {
            onUpdateIcon({ name: newIconName, color: iconColor });
        }
    }, [onUpdateIcon, iconColor]);

    const handleColorChange = useCallback((newColor: string) => {
        if (onUpdateIcon) {
            onUpdateIcon({ name: iconName, color: newColor });
        }
    }, [onUpdateIcon, iconName]);

    return (
        <div
            className={cn(
                "group flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors",
                isSelected
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-muted text-foreground"
            )}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={!isEditing ? onSelect : undefined}
            onDoubleClick={handleDoubleClick}
        >
            {/* Icon with picker from shared component */}
            {onUpdateIcon ? (
                <div onClick={(e) => e.stopPropagation()}>
                    <IconPicker
                        icon={iconName}
                        color={iconColor || undefined}
                        onIconChange={handleIconChange}
                        onColorChange={handleColorChange}
                        showColor={true}
                        triggerClassName="h-6 w-6 p-0 border-0 bg-transparent hover:bg-background/50"
                        trigger={
                            <button className="shrink-0 p-0.5 rounded hover:bg-background/50 transition-colors">
                                <IconComponent
                                    className="h-4 w-4"
                                    style={{ color: iconColor || undefined }}
                                />
                            </button>
                        }
                    />
                </div>
            ) : (
                <IconComponent
                    className="h-4 w-4 shrink-0"
                    style={{ color: iconColor || undefined }}
                />
            )}

            {/* Name - editable on double-click */}
            {isEditing ? (
                <Input
                    ref={inputRef}
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={handleRenameSubmit}
                    onKeyDown={handleKeyDown}
                    className="h-6 px-1 py-0 text-sm font-medium flex-1"
                    onClick={(e) => e.stopPropagation()}
                />
            ) : (
                <span className="flex-1 truncate text-sm font-medium">{displayName}</span>
            )}

            {/* Actions menu */}
            {(isHovered || isSelected) && !isEditing && (onRename || onDuplicate || onDelete) && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button aria-label="More options"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        {onRename && (
                            <DropdownMenuItem
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setEditValue(displayName);
                                    setIsEditing(true);
                                }}
                            >
                                <FileEdit className="h-4 w-4 mr-2" />
                                Rename
                            </DropdownMenuItem>
                        )}
                        {onDuplicate && (
                            <DropdownMenuItem
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDuplicate();
                                }}
                            >
                                <Copy className="h-4 w-4 mr-2" />
                                Duplicate
                            </DropdownMenuItem>
                        )}
                        {(onRename || onDuplicate) && onDelete && <DropdownMenuSeparator />}
                        {onDelete && (
                            <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete();
                                }}
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
        </div>
    );
}
