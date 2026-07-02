import React, { useState } from "react"
import {
    Plug,
    Settings,
    CheckCircle,
    ExternalLink,
    Search,
    Trash2,
    Power,
    RefreshCw,
    AlertCircle,
    Zap,
    Clock,
    Plus
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { ResponsiveDialog } from "@/frontend/shared/ui"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EmptyState } from "@/frontend/shared/ui/dashboard"
import { IntegrationDef, IntegrationsData, INTEGRATION_CATEGORIES, AVAILABLE_INTEGRATIONS } from "../types"

interface IntegrationsDashboardProps {
    data: IntegrationsData;
    onConnect: (integrationId: string, name: string) => Promise<void>;
    onDisconnect: (id: string) => Promise<void>;
}

export const IntegrationsDashboard: React.FC<IntegrationsDashboardProps> = ({ data, onConnect, onDisconnect }) => {
    const { integrations, isLoading } = data
    const [selectedCategory, setSelectedCategory] = useState("all")
    const [searchQuery, setSearchQuery] = useState("")
    const [connectDialogOpen, setConnectDialogOpen] = useState(false)
    const [disconnectDialogOpen, setDisconnectDialogOpen] = useState(false)
    const [selectedIntegration, setSelectedIntegration] = useState<IntegrationDef | null>(null)
    const [isProcessing, setIsProcessing] = useState(false)

    const connectedIds = integrations.map((i) => i.integrationId)

    const filteredIntegrations = AVAILABLE_INTEGRATIONS.filter(
        (i) => {
            const matchesCategory = selectedCategory === "all" || i.category === selectedCategory
            const matchesSearch = !searchQuery ||
                i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                i.description.toLowerCase().includes(searchQuery.toLowerCase())
            return matchesCategory && matchesSearch
        }
    )

    const handleConnect = async () => {
        if (!selectedIntegration) return
        setIsProcessing(true)
        try {
            await onConnect(selectedIntegration.id, selectedIntegration.name)
            setConnectDialogOpen(false)
            setSelectedIntegration(null)
        } catch (error) {
            console.error("Failed to connect:", error)
        } finally {
            setIsProcessing(false)
        }
    }

    const handleDisconnect = async () => {
        if (!selectedIntegration) return
        setIsProcessing(true)
        try {
            // Find the connected integration ID needed for the API call
            // selectedIntegration here is the Definition (IntegrationDef)
            const connected = integrations.find(i => i.integrationId === selectedIntegration.id)
            if (connected) {
                await onDisconnect(connected._id)
            }
            setDisconnectDialogOpen(false)
            setSelectedIntegration(null)
        } catch (error) {
            console.error("Failed to disconnect:", error)
        } finally {
            setIsProcessing(false)
        }
    }

    const openConnectDialog = (integration: IntegrationDef) => {
        setSelectedIntegration(integration)
        setConnectDialogOpen(true)
    }

    const openDisconnectDialog = (integration: IntegrationDef) => {
        setSelectedIntegration(integration)
        setDisconnectDialogOpen(true)
    }

    return (
        <div className="space-y-6">
            {/* Dashboard Logic */}
            <Tabs defaultValue="available" className="space-y-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="overflow-x-auto w-full sm:w-auto">
                        <TabsList className="flex justify-start min-w-max">
                            <TabsTrigger value="available">
                                <Plug className="h-4 w-4 mr-2" />
                                Available
                            </TabsTrigger>
                            <TabsTrigger value="connected">
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Connected ({integrations.length})
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search integrations..."
                            className="pl-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <TabsContent value="available" className="space-y-6">
                    <div className="flex gap-2 flex-wrap">
                        {INTEGRATION_CATEGORIES.map((cat) => (
                            <Button
                                key={cat.id}
                                variant={selectedCategory === cat.id ? "default" : "outline"}
                                size="sm"
                                onClick={() => setSelectedCategory(cat.id)}
                            >
                                {cat.name}
                            </Button>
                        ))}
                    </div>

                    {filteredIntegrations.length === 0 ? (
                        <Card>
                            <CardContent className="p-0">
                                <EmptyState
                                    icon={Search}
                                    title="No integrations found"
                                    description="Try a different search or category"
                                />
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {filteredIntegrations.map((integration) => {
                                const isConnected = connectedIds.includes(integration.id)
                                return (
                                    <Card key={integration.id} className="overflow-hidden hover:shadow-md transition-all">
                                        <CardHeader className="pb-2">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-lg ${integration.color} text-white text-xl`}>
                                                        {integration.icon}
                                                    </div>
                                                    <div>
                                                        <CardTitle className="text-base flex items-center gap-2">
                                                            {integration.name}
                                                            {isConnected && (
                                                                <Badge variant="default" className="gap-1 text-xs">
                                                                    <CheckCircle className="h-3 w-3" />
                                                                    Connected
                                                                </Badge>
                                                            )}
                                                        </CardTitle>
                                                        <CardDescription className="text-xs mt-0.5">{integration.category}</CardDescription>
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-2">{integration.description}</p>
                                        </CardHeader>
                                        <CardFooter className="pt-0">
                                            {isConnected ? (
                                                <div className="flex gap-2 w-full">
                                                    <Button variant="outline" size="sm" className="flex-1">
                                                        <Settings className="h-4 w-4 mr-1" />
                                                        Configure
                                                    </Button>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button aria-label="Settings" variant="ghost" size="sm"><Settings className="h-4 w-4" /></Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem><RefreshCw className="h-4 w-4 mr-2" />Sync Now</DropdownMenuItem>
                                                            <DropdownMenuItem><ExternalLink className="h-4 w-4 mr-2" />Open Dashboard</DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem className="text-destructive" onClick={() => openDisconnectDialog(integration)}>
                                                                <Trash2 className="h-4 w-4 mr-2" />Disconnect
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            ) : (
                                                <Button className="w-full gap-2" onClick={() => openConnectDialog(integration)}>
                                                    <Plus className="h-4 w-4" />Connect
                                                </Button>
                                            )}
                                        </CardFooter>
                                    </Card>
                                )
                            })}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="connected" className="space-y-4">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12"><p className="text-muted-foreground">Loading integrations...</p></div>
                    ) : integrations.length === 0 ? (
                        <Card>
                            <CardContent className="p-0">
                                <EmptyState
                                    icon={Plug}
                                    title="No integrations connected"
                                    description="Browse available integrations to get started"
                                    action={
                                        <Button onClick={() => {
                                            const tabBtn = document.querySelector('[value="available"]') as HTMLElement;
                                            if (tabBtn) tabBtn.click();
                                        }}>
                                            Browse Integrations
                                        </Button>
                                    }
                                />
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-3">
                            {integrations.map((integration) => {
                                const info = AVAILABLE_INTEGRATIONS.find(i => i.id === integration.integrationId)
                                return (
                                    <Card key={integration._id}>
                                        <CardContent className="p-4">
                                            <div className="flex items-center gap-4">
                                                <div className={`p-2 rounded-lg ${info?.color || "bg-gray-500"} text-white text-xl`}>
                                                    {info?.icon || "🔌"}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-medium">{info?.name || "Unknown Integration"}</h4>
                                                        <Badge variant={integration.status === "active" ? "default" : "secondary"} className="gap-1">
                                                            {integration.status === "active" ? <><Power className="h-3 w-3" /> Active</> :
                                                                integration.status === "error" ? <><AlertCircle className="h-3 w-3" /> Error</> :
                                                                    <><Clock className="h-3 w-3" /> Inactive</>}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                                                        <span>Connected {new Date(integration.createdAt).toLocaleDateString()}</span>
                                                        {integration.lastSyncAt && <span>Last sync: {new Date(integration.lastSyncAt).toLocaleString()}</span>}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button variant="outline" size="sm"><RefreshCw className="h-4 w-4 mr-1" />Sync</Button>
                                                    <Button aria-label="Settings" variant="outline" size="sm"><Settings className="h-4 w-4" /></Button>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild><Button aria-label="Open in new tab" variant="ghost" size="sm"><ExternalLink className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem><Zap className="h-4 w-4 mr-2" />View Logs</DropdownMenuItem>
                                                            <DropdownMenuItem><ExternalLink className="h-4 w-4 mr-2" />Open in {info?.name}</DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem className="text-destructive" onClick={() => {
                                                                if (info) openDisconnectDialog(info)
                                                            }}>
                                                                <Trash2 className="h-4 w-4 mr-2" />Disconnect
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {/* Connect Dialog */}
            <ResponsiveDialog open={connectDialogOpen} onOpenChange={setConnectDialogOpen} variant="modal" size="md">
                <ResponsiveDialog.Header>
                    <ResponsiveDialog.Title className="flex items-center gap-3">
                        {selectedIntegration && <span className="text-2xl">{selectedIntegration.icon}</span>}
                        Connect {selectedIntegration?.name}
                    </ResponsiveDialog.Title>
                    <ResponsiveDialog.Description>{selectedIntegration?.description}</ResponsiveDialog.Description>
                </ResponsiveDialog.Header>
                <ResponsiveDialog.Body className="px-4 py-4 sm:px-6">
                    <div className="space-y-4">
                        <Card className="bg-muted/50">
                            <CardContent className="p-4">
                                <div className="flex gap-3">
                                    <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                                    <div className="text-sm">
                                        <p className="font-medium">What this integration does:</p>
                                        <ul className="text-muted-foreground mt-1 space-y-1">
                                            <li>• Sync data between your workspace and {selectedIntegration?.name}</li>
                                            <li>• Receive real-time notifications</li>
                                            <li>• Automate workflows</li>
                                        </ul>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <p className="text-sm text-muted-foreground">
                            You&apos;ll be redirected to {selectedIntegration?.name} to authorize access.
                            You can disconnect this integration at any time.
                        </p>
                    </div>
                </ResponsiveDialog.Body>
                <ResponsiveDialog.Footer className="flex-col-reverse sm:flex-row">
                    <Button variant="outline" onClick={() => setConnectDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleConnect} disabled={isProcessing}>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        {isProcessing ? "Connecting..." : "Connect"}
                    </Button>
                </ResponsiveDialog.Footer>
            </ResponsiveDialog>

            {/* Disconnect Dialog */}
            <ResponsiveDialog open={disconnectDialogOpen} onOpenChange={setDisconnectDialogOpen} variant="alert" size="md">
                <ResponsiveDialog.Header>
                    <ResponsiveDialog.Title>Disconnect {selectedIntegration?.name}?</ResponsiveDialog.Title>
                    <ResponsiveDialog.Description>
                        This will remove the connection between your workspace and {selectedIntegration?.name}.
                        Any synced data will remain, but future syncs will stop.
                    </ResponsiveDialog.Description>
                </ResponsiveDialog.Header>
                <ResponsiveDialog.Footer className="flex-col-reverse sm:flex-row">
                    <Button variant="outline" onClick={() => setDisconnectDialogOpen(false)}>Cancel</Button>
                    <Button variant="destructive" onClick={handleDisconnect} disabled={isProcessing}>
                        {isProcessing ? "Disconnecting..." : "Disconnect"}
                    </Button>
                </ResponsiveDialog.Footer>
            </ResponsiveDialog>
        </div>
    );
};
