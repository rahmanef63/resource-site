"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Bot, FileText, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { AVAILABLE_AGENTS, getAgentById, listRegisteredAgents } from "../agent"

interface AgentSelectorProps {
    selectedAgentId: string | null
    onAgentSelect: (agentId: string | null) => void
    disabled?: boolean
}

// Helper to get icon component from string name
const getIconComponent = (iconName?: string) => {
    switch (iconName) {
        case "FileText": return FileText;
        case "Sparkles": return Sparkles;
        default: return Bot;
    }
}

export function AgentSelector({
    selectedAgentId,
    onAgentSelect,
    disabled
}: AgentSelectorProps) {
    const [open, setOpen] = React.useState(false)
    const selectedAgent = getAgentById(selectedAgentId)
    const IconComponent = getIconComponent(selectedAgent.icon)

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="h-7 w-[180px] justify-between text-xs border-dashed"
                    disabled={disabled}
                >
                    <div className="flex items-center gap-2 truncate">
                        <IconComponent className="h-3.5 w-3.5 shrink-0 text-primary" />
                        <span className="truncate">{selectedAgent.name}</span>
                    </div>
                    <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[240px] p-0" align="start">
                <Command>
                    <CommandInput placeholder="Search agent..." className="h-8 text-xs" />
                    <CommandList>
                        <CommandEmpty>No agent found.</CommandEmpty>
                        <CommandGroup heading="Available Agents">
                            {AVAILABLE_AGENTS.concat(listRegisteredAgents().filter((a: any) => !AVAILABLE_AGENTS.find((ex: any) => ex.id === a.id))).map((agent: any) => {
                                const AgentIcon = getIconComponent(agent.icon)
                                const isSelected = selectedAgentId === agent.id || (!selectedAgentId && agent.id === "general")

                                return (
                                    <CommandItem
                                        key={agent.id}
                                        value={agent.name}
                                        onSelect={() => {
                                            onAgentSelect(agent.id === "general" ? null : agent.id)
                                            setOpen(false)
                                        }}
                                        className="text-xs"
                                    >
                                        <div className="flex items-center gap-2 w-full">
                                            <AgentIcon className={cn(
                                                "h-4 w-4 shrink-0",
                                                isSelected ? "text-primary" : "text-muted-foreground"
                                            )} />

                                            <div className="flex flex-col min-w-0 flex-1">
                                                <span className="font-medium truncate">{agent.name}</span>
                                                <span className="text-[10px] text-muted-foreground truncate">
                                                    {agent.description}
                                                </span>
                                            </div>

                                            <Check
                                                className={cn(
                                                    "ml-auto h-3 w-3",
                                                    isSelected ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                        </div>
                                    </CommandItem>
                                )
                            })}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
