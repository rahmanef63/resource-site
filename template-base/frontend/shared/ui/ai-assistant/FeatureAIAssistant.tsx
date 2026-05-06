/**
 * Feature AI Assistant Button
 *
 * Dialog/drawer button that opens a feature-scoped AI chat. Used by the
 * global site-header on any feature route. For an embedded right-panel
 * AI experience use `FeatureShell` instead.
 */

"use client";

import * as React from "react";
import { Bot, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
    DrawerTrigger,
} from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { subAgentRegistry } from "@/frontend/shared/ai/agent";
import {
    useIsFeaturePanelMounted,
    useRightPanelStore,
} from "@/frontend/shared/ui/layout/feature-shell/rightPanelStore";
import { AIChatPanel } from "./AIChatPanel";

type AIChatPanelContext = React.ComponentProps<typeof AIChatPanel>["context"];

export interface FeatureAIAssistantProps {
    /** Feature ID to filter agents (e.g., 'documents', 'tasks') */
    featureId: string;
    /** Custom title for the assistant */
    title?: string;
    /** Custom description */
    description?: string;
    /** Placeholder text for input */
    placeholder?: string;
    /** Button variant */
    buttonVariant?: "default" | "outline" | "ghost" | "secondary";
    /** Button size */
    buttonSize?: "default" | "sm" | "lg" | "icon";
    /** Show button label */
    showLabel?: boolean;
    /** Custom className for button */
    className?: string;
    /** Output context (e.g. selected document) */
    context?: AIChatPanelContext;
    /**
     * Historical compatibility: accepted but ignored. All variants render
     * the same dialog/drawer; the embedded-panel variant lives in
     * `FeatureShell`.
     */
    mode?: "dialog";
}

export function FeatureAIAssistant({
    featureId,
    title,
    description,
    placeholder,
    buttonVariant = "ghost",
    buttonSize = "icon",
    showLabel = false,
    className,
    context,
}: FeatureAIAssistantProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const isMobile = useIsMobile();

    const agent = React.useMemo(() => {
        const agents = subAgentRegistry.getAllAgents();
        return agents.find((a) => a.featureId === featureId);
    }, [featureId]);

    // Store-aware mode: when an active FeatureShell is mounted for this
    // featureId, the button becomes a trigger that opens the inspector AI
    // tab. Otherwise it falls back to the standalone dialog/drawer below
    // (preserves behavior on legacy pages without FeatureShell).
    const isPanelMounted = useIsFeaturePanelMounted(featureId);
    const openTab = useRightPanelStore((s) => s.openTab);

    const agentTitle = title || agent?.name || "AI Assistant";
    const agentDescription =
        description || agent?.description || `Get AI help for ${featureId}`;

    const TriggerButton = (
        <Button
            variant={buttonVariant}
            size={buttonSize}
            className={cn("gap-2", className)}
        >
            <Bot className="h-4 w-4" />
            {showLabel && <span>AI</span>}
        </Button>
    );

    // Store-trigger short-circuit: dispatch openTab + don't mount Dialog/Drawer.
    if (isPanelMounted) {
        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant={buttonVariant}
                            size={buttonSize}
                            className={cn("gap-2", className)}
                            onClick={() => openTab(featureId, "ai")}
                            aria-label={agentTitle}
                        >
                            <Bot className="h-4 w-4" />
                            {showLabel && <span>AI</span>}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Open AI Assistant</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    }

    const AIContent = (
        <>
            <div className="px-4 py-3 border-b flex-shrink-0">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-primary/10">
                        <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                        <div className="text-base font-semibold">{agentTitle}</div>
                        <div className="text-xs text-muted-foreground">
                            {agentDescription}
                        </div>
                    </div>
                    {agent && (
                        <Badge variant="secondary" className="text-xs">
                            {agent.tools.length} tools
                        </Badge>
                    )}
                </div>
            </div>
            <div className="flex-1 min-h-0">
                <AIChatPanel
                    featureId={featureId}
                    placeholder={placeholder}
                    context={context}
                    className="h-full border-0"
                />
            </div>
        </>
    );

    if (isMobile) {
        return (
            <Drawer open={isOpen} onOpenChange={setIsOpen}>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <DrawerTrigger asChild>{TriggerButton}</DrawerTrigger>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Open AI Assistant</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                <DrawerContent className="h-[85vh] flex flex-col p-0 gap-0">
                    <DrawerHeader className="sr-only">
                        <DrawerTitle>{agentTitle}</DrawerTitle>
                        <DrawerDescription>{agentDescription}</DrawerDescription>
                    </DrawerHeader>
                    {AIContent}
                </DrawerContent>
            </Drawer>
        );
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <DialogTrigger asChild>{TriggerButton}</DialogTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Open AI Assistant</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>

            <DialogContent className="sm:max-w-[500px] h-[600px] flex flex-col p-0 gap-0">
                <DialogHeader className="sr-only">
                    <DialogTitle>{agentTitle}</DialogTitle>
                    <DialogDescription>{agentDescription}</DialogDescription>
                </DialogHeader>
                {AIContent}
            </DialogContent>
        </Dialog>
    );
}

export default FeatureAIAssistant;
