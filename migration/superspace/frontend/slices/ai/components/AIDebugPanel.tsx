import { useEffect, useState } from "react";
import { useSubAgentRouter } from "../hooks/useSubAgentRouter";
import { useSessionDebugStore } from "@/frontend/shared/ui/components/session-info"; // Fixed import
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, CheckCircle2, Terminal, Activity, Database, BrainCircuit, Bug } from "lucide-react";
import { cn } from "@/lib/utils";

export function AIDebugPanel() {
    const { getAvailableAgents, lastAgentUsed, lastToolUsed, isProcessing } = useSubAgentRouter();
    const { agentTraces, toolCallTraces, logs, isDebugging, setDebugging, clearAll } = useSessionDebugStore();
    const agents = getAvailableAgents();
    const [activeTab, setActiveTab] = useState("traces");

    // Combine and sort traces
    const traces = [
        ...agentTraces.map(t => ({ ...t, type: "agent_routing" as const, data: t })),
        ...toolCallTraces.map(t => ({ ...t, type: "tool_execution" as const, data: t })),
        ...logs.map(t => ({ ...t, type: "log" as const, data: t }))
    ].sort((a, b) => b.timestamp - a.timestamp);

    // Auto-enable debugging when panel is open
    useEffect(() => {
        if (!isDebugging) {
            setDebugging(true);
        }
    }, [isDebugging, setDebugging]);

    return (
        <div className="flex flex-col h-full bg-muted/30 border-l border-border/50 w-full">
            <div className="p-4 border-b bg-background/50 backdrop-blur-sm flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Bug className="w-4 h-4 text-primary" />
                    <h3 className="font-semibold text-sm">AI Debugger</h3>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant={isProcessing ? "secondary" : "outline"} className="text-xs">
                        {isProcessing ? "Processing..." : "Idle"}
                    </Badge>
                    <Badge variant={isDebugging ? "default" : "destructive"} className="text-xs cursor-pointer" onClick={() => setDebugging(!isDebugging)}>
                        {isDebugging ? "Recording" : "Paused"}
                    </Badge>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
                <div className="px-4 pt-2">
                    <TabsList className="flex w-full justify-evenly">
                        <TabsTrigger value="traces" className="text-xs">
                            <Activity className="w-3 h-3 mr-2" />
                            Live Traces
                        </TabsTrigger>
                        <TabsTrigger value="agents" className="text-xs">
                            <BrainCircuit className="w-3 h-3 mr-2" />
                            Registry ({agents.length})
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="traces" className="flex-1 min-h-0 flex flex-col mt-0">
                    <div className="p-2 flex justify-end">
                        <button
                            onClick={() => clearAll()}
                            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Clear Traces
                        </button>
                    </div>
                    <ScrollArea className="flex-1 px-4 pb-4">
                        <div className="space-y-3">
                            {traces.length === 0 ? (
                                <div className="text-center text-muted-foreground py-10 text-sm">
                                    No traces recorded yet.
                                    <br />
                                    Interact with the AI to see debug data.
                                </div>
                            ) : (
                                traces.slice().reverse().map((trace) => (
                                    <Card key={trace.id} className="border-border/50 bg-card/50 overflow-hidden">
                                        <CardHeader className="p-3 bg-muted/20 pb-2">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    {trace.type === "agent_routing" ? (
                                                        <BrainCircuit className="w-3.5 h-3.5 text-blue-500" />
                                                    ) : trace.type === "tool_execution" ? (
                                                        <Terminal className="w-3.5 h-3.5 text-purple-500" />
                                                    ) : (
                                                        <Database className="w-3.5 h-3.5 text-orange-500" />
                                                    )}
                                                    <span className="font-medium text-xs uppercase tracking-wider opacity-70">
                                                        {trace.type.replace("_", " ")}
                                                    </span>
                                                </div>
                                                <span className="text-[10px] text-muted-foreground font-mono">
                                                    {new Date(trace.timestamp).toLocaleTimeString()}
                                                </span>
                                            </div>
                                            <CardTitle className="text-sm font-medium mt-1">
                                                {trace.type === "agent_routing" ? (
                                                    <>
                                                        Agent: <span className="text-primary">{(trace.data as any).agentName}</span>
                                                    </>
                                                ) : trace.type === "tool_execution" ? (
                                                    <>
                                                        Tool: <span className="text-primary">{(trace.data as any).toolName}</span>
                                                    </>
                                                ) : (
                                                    "Log"
                                                )}
                                            </CardTitle>
                                        </CardHeader>
                                        <Separator />
                                        <CardContent className="p-3 text-xs space-y-2">
                                            {trace.type === "agent_routing" && (
                                                <>
                                                    <div className="grid grid-cols-[80px_1fr] gap-2">
                                                        <span className="text-muted-foreground">Confidence:</span>
                                                        <span className={cn(
                                                            "font-mono",
                                                            (trace.data as any).confidence > 0.7 ? "text-green-500" : "text-yellow-500"
                                                        )}>
                                                            {((trace.data as any).confidence * 100).toFixed(0)}%
                                                        </span>
                                                    </div>
                                                    <div className="grid grid-cols-[80px_1fr] gap-2">
                                                        <span className="text-muted-foreground">Query:</span>
                                                        <span className="italic text-muted-foreground select-all">"{(trace.data as any).query}"</span>
                                                    </div>
                                                </>
                                            )}

                                            {trace.type === "tool_execution" && (
                                                <>
                                                    <div className="space-y-1">
                                                        <span className="text-muted-foreground block">Arguments:</span>
                                                        <pre className="bg-muted p-2 rounded-md overflow-x-auto font-mono text-[10px]">
                                                            {JSON.stringify((trace.data as any).params, null, 2)}
                                                        </pre>
                                                    </div>
                                                    {(trace.data as any).result && (
                                                        <div className="space-y-1 pt-1">
                                                            <span className="text-muted-foreground block flex items-center gap-1">
                                                                Result: <CheckCircle2 className="w-3 h-3 text-green-500" />
                                                            </span>
                                                            <pre className="bg-muted/50 p-2 rounded-md overflow-x-auto font-mono text-[10px] opacity-80">
                                                                {JSON.stringify((trace.data as any).result, null, 2)}
                                                            </pre>
                                                        </div>
                                                    )}
                                                </>
                                            )}

                                            {(trace.data as any).error && (
                                                <div className="mt-2 text-destructive bg-destructive/10 p-2 rounded flex gap-2 items-start">
                                                    <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
                                                    <span className="font-medium">{(trace.data as any).error}</span>
                                                </div>
                                            )}

                                            {trace.type === "log" && (
                                                <div className="text-muted-foreground">
                                                    {(trace.data as any).message}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>
                    </ScrollArea>
                </TabsContent>

                <TabsContent value="agents" className="flex-1 min-h-0 flex flex-col mt-0">
                    <ScrollArea className="flex-1 px-4 py-4">
                        <div className="space-y-3">
                            {agents.map((agent) => (
                                <Card key={agent.id} className="border-border/50">
                                    <CardHeader className="p-3 pb-2">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-sm font-medium">{agent.name}</CardTitle>
                                            <Badge variant="outline" className="text-[10px]">{agent.id}</Badge>
                                        </div>
                                        <CardDescription className="text-xs line-clamp-2">
                                            {agent.description}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-3 pt-0">
                                        <div className="space-y-2 mt-2">
                                            <span className="text-xs font-semibold text-muted-foreground">Tools ({agent.toolCount}):</span>
                                            <div className="grid gap-2">
                                                {agent.tools.map((tool) => (
                                                    <div key={tool.name} className="bg-muted/30 p-2 rounded text-xs border border-border/50">
                                                        <div className="font-medium text-foreground">{tool.name}</div>
                                                        <div className="text-muted-foreground truncate opacity-80">{tool.description}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </ScrollArea>
                </TabsContent>
            </Tabs>
        </div>
    );
}
