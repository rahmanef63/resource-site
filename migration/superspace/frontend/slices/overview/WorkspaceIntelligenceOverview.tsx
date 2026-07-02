"use client"

import * as React from "react"
import type { Id } from "@/convex/_generated/dataModel"
import {
  Building2,
  Network,
  Blocks,
  CheckCircle2,
  CircleDashed,
  ShieldAlert,
  Sparkles,
  GitBranch,
  Users,
  MessagesSquare,
  Wallet,
  Package,
  ListTodo,
  Wand2,
  TriangleAlert,
  ChartNoAxesCombined,
  ChevronRight,
  ChevronDown,
  LayoutGrid
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

// --- TYPES ---
type SubWorkspaceOverview = {
  id: string
  name: string
  featureCoveragePercent: number
  installedCount: number
  setupNeededCount: number
  blockedCount: number
  activeFeatureIcons: string[]
  missingFeatureIcons: string[]
  health: "healthy" | "warning" | "blocked"
}

type FeatureMatrixRow = {
  featureKey: string
  featureLabel: string
  workspaces: {
    workspaceId: string
    status: "installed" | "partial" | "missing" | "blocked"
  }[]
}

type DependencyEdge = {
  id: string
  from: string
  to: string
  isBlocked: boolean
  reason?: string
}

type AlertItem = {
  id: string
  type: "warning" | "error" | "info"
  message: string
  workspace: string
}

type RecommendationItem = {
  id: string
  title: string
  path: string[]
  details: string
  targetWorkspace: string
}

type WorkspaceOverviewData = {
  workspaceId: string
  workspaceName: string
  workspaceType: string
  totalFeatures: number
  installedCount: number
  setupNeededCount: number
  blockedCount: number
  aiReadyCount: number
  subWorkspaceCount: number
  subWorkspaces: SubWorkspaceOverview[]
  featureMatrix: FeatureMatrixRow[]
  dependencyGraph: DependencyEdge[]
  alerts: AlertItem[]
  recommendations: RecommendationItem[]
}

import { useQuery } from "convex/react"
import { api } from "@/frontend/shared/foundation/utils/convex/any-api"
import { useWorkspaceContext } from "@/frontend/shared/foundation/provider/WorkspaceProvider"
import { Skeleton } from "@/components/ui/skeleton"

// --- ICON MAPPER ---
const getIcon = (name: string, props: any = {}) => {
  const icons: Record<string, React.ReactNode> = {
    Building2: <Building2 {...props} />,
    Network: <Network {...props} />,
    Blocks: <Blocks {...props} />,
    CheckCircle2: <CheckCircle2 {...props} />,
    CircleDashed: <CircleDashed {...props} />,
    ShieldAlert: <ShieldAlert {...props} />,
    Sparkles: <Sparkles {...props} />,
    GitBranch: <GitBranch {...props} />,
    Users: <Users {...props} />,
    MessagesSquare: <MessagesSquare {...props} />,
    Wallet: <Wallet {...props} />,
    Package: <Package {...props} />,
    ListTodo: <ListTodo {...props} />,
    Wand2: <Wand2 {...props} />,
    TriangleAlert: <TriangleAlert {...props} />,
    ChartNoAxesCombined: <ChartNoAxesCombined {...props} />,
    LayoutGrid: <LayoutGrid {...props} />,
  }
  return icons[name] || <Blocks {...props} />
}

interface WorkspaceIntelligenceOverviewProps {
  workspaceId?: Id<"workspaces"> | null
}

export function WorkspaceIntelligenceOverview({
  workspaceId,
}: WorkspaceIntelligenceOverviewProps) {
  const { workspaceId: contextWorkspaceId } = useWorkspaceContext()
  const activeWorkspaceId = workspaceId ?? contextWorkspaceId

  const rawData = useQuery(
    api.workspace.overview.getOverview,
    activeWorkspaceId ? { mainWorkspaceId: activeWorkspaceId } : "skip"
  )

  if (!activeWorkspaceId) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <TriangleAlert className="w-12 h-12 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium">Main Workspace Required</h3>
        <p className="text-muted-foreground text-sm max-w-sm mt-2">
          Select your main workspace to load the intelligence overview.
        </p>
      </div>
    )
  }

  if (rawData === undefined) {
    return (
      <div className="flex h-full w-full justify-center overflow-auto">
        <div className="flex w-full max-w-3xl flex-col gap-4 px-4 py-4 pb-12 sm:px-6">
          <Skeleton className="h-32 w-full rounded-xl" />
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
          </div>
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </div>
    )
  }

  if (rawData === null) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <TriangleAlert className="w-12 h-12 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium">Workspace Unavailable</h3>
        <p className="text-muted-foreground text-sm max-w-sm mt-2">
          Intelligence overview data could not be loaded for the current workspace. Ensure you have the proper access.
        </p>
      </div>
    )
  }

  const data = rawData as unknown as WorkspaceOverviewData;

  return (
    <div className="flex h-full w-full justify-center overflow-auto">
      <div className="flex w-full max-w-3xl flex-col gap-4 px-4 py-4 pb-12 sm:px-6">
      {/* 1. Workspace Context Block */}
      <Card className="border shadow-sm">
        <CardContent className="p-4 flex flex-row items-center gap-4">
          <div className="bg-primary/10 p-3 rounded-lg text-primary">
            <Building2 className="w-8 h-8" />
          </div>
          <div className="flex flex-col flex-1">
            <h1 className="text-xl font-bold tracking-tight">{data.workspaceName}</h1>
            <p className="text-sm text-muted-foreground mb-2">{data.workspaceType}</p>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
              <span className="font-medium">{data.totalFeatures} features</span>
              <span className="text-muted-foreground">•</span>
              <span className="font-medium">{data.subWorkspaceCount} sub-workspaces</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 text-xs text-muted-foreground text-right shrink-0">
            <div className="flex items-center gap-1"><Sparkles className="w-3.5 h-3.5 text-blue-500" /> {data.aiReadyCount} AI-ready</div>
            <div className="flex items-center gap-1"><ShieldAlert className="w-3.5 h-3.5 text-destructive" /> {data.blockedCount} blockers</div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Health Snapshot */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="border shadow-sm">
          <CardContent className="p-3">
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <span className="text-xs font-medium text-muted-foreground mb-1">Installed</span>
                <span className="text-2xl font-bold">{data.installedCount}</span>
              </div>
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border shadow-sm">
          <CardContent className="p-3">
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <span className="text-xs font-medium text-muted-foreground mb-1">Setup Needed</span>
                <span className="text-2xl font-bold">{data.setupNeededCount}</span>
              </div>
              <CircleDashed className="w-5 h-5 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border shadow-sm">
          <CardContent className="p-3">
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <span className="text-xs font-medium text-muted-foreground mb-1">Blocked</span>
                <span className="text-2xl font-bold">{data.blockedCount}</span>
              </div>
              <ShieldAlert className="w-5 h-5 text-destructive" />
            </div>
          </CardContent>
        </Card>
        <Card className="border shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
          <CardContent className="p-3">
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <span className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">AI Ready</span>
                <span className="text-2xl font-bold text-blue-700 dark:text-blue-300">{data.aiReadyCount}</span>
              </div>
              <Sparkles className="w-5 h-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. AI Recommendation Panel */}
      {data.recommendations.length > 0 && (
        <Card className="border shadow-sm border-blue-200 dark:border-blue-900/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Sparkles className="w-24 h-24 text-blue-600" />
          </div>
          <CardContent className="p-4 flex flex-col gap-2 relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-blue-500" />
              <h3 className="text-sm font-semibold text-blue-700 dark:text-blue-400">AI Recommendation</h3>
            </div>
            <p className="text-sm">
              Next best move: <span className="font-semibold">{data.recommendations[0].details}</span>
            </p>
            <div className="flex items-center text-xs mt-2 p-2 bg-blue-50/50 dark:bg-blue-950/50 rounded-md border border-blue-100 dark:border-blue-900/30">
              <span className="text-muted-foreground mr-2">Path:</span>
              <div className="flex flex-wrap items-center gap-1 gap-y-2">
                {data.recommendations[0].path.map((step, i) => (
                  <React.Fragment key={step}>
                    <Badge variant="outline" className="bg-background text-[10px] py-0 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400">{step}</Badge>
                    {i < data.recommendations[0].path.length - 1 && <ChevronRight className="w-3 h-3 text-muted-foreground" />}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 4. Sub-workspace Rollup */}
      <div className="flex flex-col gap-2 mt-2">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1">Sub-workspaces</h2>
        
        {data.subWorkspaces.map(ws => (
          <Drawer key={ws.id}>
            <DrawerTrigger asChild>
              <Card className="border shadow-sm cursor-pointer hover:bg-accent/50 transition-colors">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Network className="w-4 h-4 text-muted-foreground" />
                      <span className="font-semibold">{ws.name}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                  
                  <div className="flex items-center gap-x-3 text-xs text-muted-foreground mb-3">
                    <span className="whitespace-nowrap">{ws.installedCount}/{data.totalFeatures} active</span>
                    <span>•</span>
                    {ws.blockedCount > 0 ? (
                      <span className="text-destructive font-medium flex items-center gap-1">
                        <TriangleAlert className="w-3 h-3" /> {ws.blockedCount} blocked
                      </span>
                    ) : ws.setupNeededCount > 0 ? (
                      <span className="text-yellow-600 dark:text-yellow-500 font-medium flex items-center gap-1">
                        <CircleDashed className="w-3 h-3" /> {ws.setupNeededCount} setup
                      </span>
                    ) : (
                      <span className="text-green-600 dark:text-green-500 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> healthy
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3">
                     <div className="flex-1 max-w-[120px]">
                        <Progress value={ws.featureCoveragePercent} className="h-1.5" />
                        <span className="text-[10px] text-muted-foreground mt-1 inline-block">{ws.featureCoveragePercent}% coverage</span>
                     </div>
                     <div className="flex items-center gap-1 flex-wrap flex-1 justify-end">
                       {ws.activeFeatureIcons.map((iconStr, i) => (
                         <div key={i} className="w-5 h-5 bg-secondary flex items-center justify-center rounded">
                             {getIcon(iconStr, { className: "w-3 h-3 border-transparent" })}
                         </div>
                       ))}
                       {ws.missingFeatureIcons.map((iconStr, i) => (
                         <div key={i} className="w-5 h-5 bg-secondary/50 opacity-50 flex items-center justify-center rounded">
                           {getIcon(iconStr, { className: "w-3 h-3 border-transparent" })}
                         </div>
                       ))}
                     </div>
                  </div>
                </CardContent>
              </Card>
            </DrawerTrigger>
            
            <DrawerContent>
              <div className="mx-auto w-full max-w-sm">
                <DrawerHeader className="text-left px-4 pt-4 pb-2">
                  <div className="flex items-center gap-2 mb-1">
                     <Network className="w-5 h-5 text-muted-foreground" />
                     <DrawerTitle>{ws.name}</DrawerTitle>
                  </div>
                  <DrawerDescription className="flex items-center gap-2 text-xs">
                    {ws.installedCount} active • {ws.setupNeededCount} setup • {ws.blockedCount} blocked
                  </DrawerDescription>
                </DrawerHeader>
                <div className="px-4 pb-8 space-y-4">
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span>Coverage</span>
                      <span>{ws.featureCoveragePercent}%</span>
                    </div>
                    <Progress value={ws.featureCoveragePercent} className="h-2" />
                  </div>
                  
                  {ws.activeFeatureIcons.length > 0 && (
                    <div className="space-y-2">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase">Active Features</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {ws.activeFeatureIcons.map((feat, i) => (
                            <div key={i} className="flex items-center gap-2 bg-secondary/30 p-2 rounded-md text-sm border shadow-sm">
                               {getIcon(feat, { className: "w-4 h-4 text-muted-foreground shrink-0" })}
                               <span className="truncate">{feat}</span>
                            </div>
                          ))}
                        </div>
                    </div>
                  )}

                  {ws.missingFeatureIcons.length > 0 && (
                    <div className="space-y-2">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase mt-4">Needs Setup</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {ws.missingFeatureIcons.map((feat, i) => (
                            <div key={i} className="flex items-center gap-2 bg-warning/10 p-2 rounded-md text-sm border shadow-sm">
                               {getIcon(feat, { className: "w-4 h-4 text-yellow-600 shrink-0" })}
                               <span className="truncate opacity-75">{feat}</span>
                            </div>
                          ))}
                        </div>
                    </div>
                  )}
                  
                  {ws.id === "ws_laundry_567" && (
                    <div className="mt-4 p-3 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-lg">
                       <h4 className="flex items-center text-xs font-semibold text-blue-700 dark:text-blue-400 mb-2">
                         <Sparkles className="w-3 h-3 mr-1" /> Recommendation Path
                       </h4>
                       <div className="flex flex-wrap items-center gap-1.5 text-xs">
                          {data.recommendations[0].path.map((p, i) => (
                            <React.Fragment key={i}>
                               <span className={i === 0 ? "font-semibold text-foreground" : "text-muted-foreground"}>{p}</span>
                               {i < data.recommendations[0].path.length - 1 && <ChevronRight className="w-3 h-3 text-muted-foreground opacity-50" />}
                            </React.Fragment>
                          ))}
                          <ChevronRight className="w-3 h-3 text-muted-foreground opacity-50" />
                          <span className="text-muted-foreground">Tasks</span>
                       </div>
                    </div>
                  )}
                </div>
              </div>
            </DrawerContent>
          </Drawer>
        ))}
      </div>

      {/* 5. Progressive Detail Tabs */}
      <Tabs defaultValue="coverage" className="w-full mt-2">
        <div className="overflow-x-auto">
          <TabsList className="flex justify-start min-w-max bg-muted/50 h-10 p-1">
            <TabsTrigger value="coverage" className="text-xs">Coverage</TabsTrigger>
            <TabsTrigger value="structure" className="text-xs">Structure</TabsTrigger>
            <TabsTrigger value="dependencies" className="text-xs">Dependencies</TabsTrigger>
            <TabsTrigger value="alerts" className="text-xs">Alerts</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="coverage" className="mt-4">
          <Card className="border shadow-sm overflow-hidden">
            <CardHeader className="p-3 pb-2 border-b bg-muted/20">
              <CardTitle className="text-sm">Feature Coverage Matrix</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
               <ScrollArea className="w-full">
                  <div className="sm:min-w-[400px]">
                     <div className="grid grid-cols-5 p-2 bg-muted/10 border-b text-xs font-medium text-muted-foreground">
                        <div className="col-span-1 pl-2">Feature</div>
                        <div className="text-center truncate">ZI</div>
                        <div className="text-center truncate">L567</div>
                        <div className="text-center truncate">SDIT</div>
                        <div className="text-center truncate">HQ</div>
                     </div>
                     <div className="flex flex-col">
                       {data.featureMatrix.map(row => (
                         <div key={row.featureKey} className="grid grid-cols-5 p-2 border-b last:border-0 hover:bg-muted/5 text-sm items-center">
                            <div className="col-span-1 pl-2 font-medium">{row.featureLabel}</div>
                            {row.workspaces.map((ws, i) => (
                              <div key={i} className="flex justify-center">
                                 {ws.status === "installed" && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                                 {ws.status === "partial" && <CircleDashed className="w-4 h-4 text-yellow-500" />}
                                 {ws.status === "missing" && <CircleDashed className="w-4 h-4 text-muted-foreground/30" />}
                                 {ws.status === "blocked" && <ShieldAlert className="w-4 h-4 text-destructive" />}
                              </div>
                            ))}
                         </div>
                       ))}
                     </div>
                  </div>
                  <ScrollBar orientation="horizontal" />
               </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="structure" className="mt-4">
          <Card className="border shadow-sm">
            <CardHeader className="p-3 pb-2 border-b bg-muted/20">
               <CardTitle className="text-sm">Workspace Structure</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
               <div className="flex flex-col text-sm">
                  <div className="flex items-center gap-2 mb-2 font-semibold">
                    <Building2 className="w-4 h-4" /> Zian Group
                  </div>
                  <div className="ml-2 pl-3 border-l-2 border-border/50 space-y-3">
                     {data.subWorkspaces.map((ws, i) => (
                       <div key={ws.id} className="relative flex items-center gap-2 text-muted-foreground">
                         <div className="absolute -left-[14px] top-1/2 w-3 border-t-2 border-border/50" />
                         <Network className="w-3.5 h-3.5" />
                         <span>{ws.name}</span>
                       </div>
                     ))}
                     <div className="relative flex items-center gap-2 text-muted-foreground">
                         <div className="absolute -left-[14px] top-1/2 w-3 border-t-2 border-border/50" />
                         <Network className="w-3.5 h-3.5" />
                         <span>HQ Ops</span>
                     </div>
                  </div>
               </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dependencies" className="mt-4">
           <Card className="border shadow-sm">
             <CardHeader className="p-3 pb-2 border-b bg-muted/20">
               <CardTitle className="text-sm">Dependency Flow</CardTitle>
             </CardHeader>
             <CardContent className="p-4 flex flex-col items-center">
                <div className="space-y-1 flex flex-col items-center">
                  <Badge variant="secondary" className="px-3 py-1 font-medium bg-secondary text-foreground rounded-md"><Users className="w-3 h-3 mr-1" /> Users</Badge>
                  <GitBranch className="w-4 h-4 text-muted-foreground my-1 stroke-1" />
                  <Badge variant="secondary" className="px-3 py-1 font-medium bg-secondary text-foreground rounded-md"><Users className="w-3 h-3 mr-1" /> Contacts</Badge>
                  <GitBranch className="w-4 h-4 text-muted-foreground my-1 stroke-1" />
                  <Badge variant="secondary" className="px-3 py-1 font-medium bg-secondary text-foreground rounded-md"><MessagesSquare className="w-3 h-3 mr-1" /> Communications</Badge>
                  <GitBranch className="w-4 h-4 text-muted-foreground my-1 stroke-1" />
                  <Badge variant="secondary" className="px-3 py-1 font-medium bg-secondary text-foreground rounded-md"><ListTodo className="w-3 h-3 mr-1" /> Tasks</Badge>
                </div>
                
                <Separator className="w-full my-6" />
                
                <div className="w-full text-left space-y-3">
                   <h4 className="text-xs font-semibold text-muted-foreground">BLOCKED FLOW</h4>
                   <div className="bg-destructive/10 border border-destructive/20 p-3 rounded-md flex flex-col gap-2">
                       <div className="flex items-center gap-2 text-sm font-semibold text-destructive">
                          <Wallet className="w-4 h-4" /> Finance
                       </div>
                       <div className="flex flex-col ml-1 pl-4 border-l-2 border-destructive/30 space-y-2">
                          <span className="text-xs font-medium uppercase text-muted-foreground mt-1">Blocked By:</span>
                          <div className="text-sm text-foreground flex items-center gap-1">
                            <span className="bg-background border px-2 text-xs rounded-full p-0.5 shadow-sm">Accounts Schema</span>
                            <span className="text-muted-foreground px-1">+</span>
                            <span className="bg-background border px-2 text-xs rounded-full p-0.5 shadow-sm">Role Policy</span>
                          </div>
                       </div>
                   </div>
                </div>
             </CardContent>
           </Card>
        </TabsContent>

        <TabsContent value="alerts" className="mt-4 space-y-2">
           {data.alerts.map(alert => (
             <Card key={alert.id} className="border shadow-sm">
                <CardContent className="p-3 flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">
                    {alert.type === "error" && <TriangleAlert className="w-5 h-5 text-destructive" />}
                    {alert.type === "warning" && <CircleDashed className="w-5 h-5 text-yellow-500" />}
                    {alert.type === "info" && <ShieldAlert className="w-5 h-5 text-blue-500" />}
                  </div>
                  <div className="flex flex-col">
                    <p className="text-sm font-medium leading-snug">{alert.message}</p>
                    <span className="text-xs text-muted-foreground mt-1">Source: {alert.workspace}</span>
                  </div>
                </CardContent>
             </Card>
           ))}
        </TabsContent>
      </Tabs>
      </div>
    </div>
  )
}
