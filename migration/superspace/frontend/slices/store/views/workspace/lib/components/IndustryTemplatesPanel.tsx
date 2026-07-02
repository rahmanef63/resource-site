// Industry Templates Panel — embedded in WorkspaceCenterPanel.
// Folded into workspace-store on 2026-05-16. Convex backend stays at
// convex/features/industryTemplates/; the standalone slice was archived
// to docs/archive/industry-templates/.

"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { ResponsiveDialog } from "@/frontend/shared/ui"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Search,
  Star,
  Download,
  ChevronRight,
  Filter,
  Grid3X3,
  List,
  Trophy,
  TrendingUp,
  Sparkles,
  Check,
  ArrowLeft,
  ExternalLink,
  Users,
  Clock,
  Layers,
} from "lucide-react"
import {
  useTemplates,
  useTemplateById,
  useFeaturedTemplates,
  usePopularTemplates,
  useCategories,
  useInstallTemplate,
  useTemplateReviews,
  categoryMetadata,
  featureModules,
  type IndustryCategory,
  type FeatureModule,
} from "@/frontend/shared/foundation/workspaces/lib/useIndustryTemplates"
import type { Id } from "@/convex/_generated/dataModel"
import type { WorkspaceStoreItem } from "../../types"

export interface IndustryTemplatesPanelProps {
  selectedWorkspace: WorkspaceStoreItem | null
}

export function IndustryTemplatesPanel({ selectedWorkspace }: IndustryTemplatesPanelProps) {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null)
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid")
  const [selectedTemplate, setSelectedTemplate] = React.useState<Id<"industryTemplates"> | null>(null)
  const [isInstallDialogOpen, setIsInstallDialogOpen] = React.useState(false)

  const templates = useTemplates({
    category: selectedCategory ?? undefined,
    search: searchQuery || undefined,
  })
  const featuredTemplates = useFeaturedTemplates(6)
  const popularTemplates = usePopularTemplates(8)
  const categories = useCategories()

  const handleSelectTemplate = (templateId: Id<"industryTemplates">) => {
    setSelectedTemplate(templateId)
  }

  const handleBackToList = () => setSelectedTemplate(null)
  const handleInstall = () => setIsInstallDialogOpen(true)

  if (selectedTemplate) {
    return (
      <TemplateDetailView
        templateId={selectedTemplate}
        onBack={handleBackToList}
        onInstall={handleInstall}
        canInstall={Boolean(selectedWorkspace)}
        installCta={selectedWorkspace ? `Install into "${selectedWorkspace.name}"` : "Select a workspace first"}
      >
        {selectedTemplate && (
          <InstallTemplateDialog
            templateId={selectedTemplate}
            workspaceId={selectedWorkspace?.id as Id<"workspaces"> | undefined}
            isOpen={isInstallDialogOpen}
            onClose={() => setIsInstallDialogOpen(false)}
          />
        )}
      </TemplateDetailView>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col gap-3 border-b p-4 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1 md:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center rounded-lg border">
          <Button aria-label="Grid view"
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("grid")}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button aria-label="List view"
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="hidden w-56 border-r bg-muted/30 md:block">
          <ScrollArea className="h-full">
            <div className="p-3">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <Filter className="h-4 w-4" />
                Categories
              </h3>
              <div className="space-y-1">
                <Button
                  variant={selectedCategory === null ? "secondary" : "ghost"}
                  className="w-full justify-start text-xs"
                  size="sm"
                  onClick={() => setSelectedCategory(null)}
                >
                  All
                </Button>
                {categories?.map((cat: { category: string; count: number; name: string }) => (
                  <Button
                    key={cat.category}
                    variant={selectedCategory === cat.category ? "secondary" : "ghost"}
                    className="w-full justify-between text-xs"
                    size="sm"
                    onClick={() => setSelectedCategory(cat.category)}
                  >
                    <span>{cat.name}</span>
                    <Badge variant="outline" className="ml-2">{cat.count}</Badge>
                  </Button>
                ))}
              </div>
            </div>
          </ScrollArea>
        </div>

        <div className="flex-1 overflow-auto">
          <ScrollArea className="h-full">
            <div className="p-4">
              <Tabs defaultValue="all">
                <TabsList className="mb-4 inline-flex flex-wrap">
                  <TabsTrigger value="all" className="flex items-center gap-2">
                    <Layers className="h-4 w-4" /> All
                  </TabsTrigger>
                  <TabsTrigger value="featured" className="flex items-center gap-2">
                    <Trophy className="h-4 w-4" /> Featured
                  </TabsTrigger>
                  <TabsTrigger value="popular" className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" /> Popular
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="all">
                  {templates === undefined ? (
                    <TemplateGridSkeleton />
                  ) : templates.length === 0 ? (
                    <EmptyState searchQuery={searchQuery} category={selectedCategory} />
                  ) : (
                    <TemplateGrid
                      templates={templates}
                      viewMode={viewMode}
                      onSelect={handleSelectTemplate}
                    />
                  )}
                </TabsContent>

                <TabsContent value="featured">
                  {featuredTemplates === undefined ? (
                    <TemplateGridSkeleton />
                  ) : (
                    <TemplateGrid
                      templates={featuredTemplates}
                      viewMode={viewMode}
                      onSelect={handleSelectTemplate}
                    />
                  )}
                </TabsContent>

                <TabsContent value="popular">
                  {popularTemplates === undefined ? (
                    <TemplateGridSkeleton />
                  ) : (
                    <TemplateGrid
                      templates={popularTemplates}
                      viewMode={viewMode}
                      onSelect={handleSelectTemplate}
                    />
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}

export interface TemplateGridProps {
  templates: any[]
  viewMode: "grid" | "list"
  onSelect: (id: Id<"industryTemplates">) => void
}

export function TemplateGrid({ templates, viewMode, onSelect }: TemplateGridProps) {
  if (viewMode === "list") {
    return (
      <div className="space-y-3">
        {templates.map((t) => (
          <TemplateListItem key={t._id} template={t} onSelect={() => onSelect(t._id)} />
        ))}
      </div>
    )
  }
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {templates.map((t) => (
        <TemplateCard key={t._id} template={t} onSelect={() => onSelect(t._id)} />
      ))}
    </div>
  )
}

function TemplateCard({ template, onSelect }: { template: any; onSelect: () => void }) {
  const categoryInfo = categoryMetadata[template.category as IndustryCategory]
  return (
    <Card className="cursor-pointer transition-shadow hover:shadow-md" onClick={onSelect}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{template.name}</CardTitle>
            <CardDescription className="mt-1">{categoryInfo?.name}</CardDescription>
          </div>
          {template.isOfficial && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> Official
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="line-clamp-2 text-sm text-muted-foreground">{template.description}</p>
        <div className="mt-3 flex flex-wrap gap-1">
          {template.features?.slice(0, 4).map((feature: FeatureModule) => (
            <Badge key={feature} variant="outline" className="text-xs">
              {featureModules[feature]?.name ?? feature}
            </Badge>
          ))}
          {template.features?.length > 4 && (
            <Badge variant="outline" className="text-xs">+{template.features.length - 4} more</Badge>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          {template.rating && (
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" /> {template.rating}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Download className="h-4 w-4" /> {template.usageCount ?? template.downloads ?? 0}
          </span>
        </div>
        <Button size="sm" variant="ghost">
          View <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}

function TemplateListItem({ template, onSelect }: { template: any; onSelect: () => void }) {
  const categoryInfo = categoryMetadata[template.category as IndustryCategory]
  return (
    <Card className="cursor-pointer transition-shadow hover:shadow-md" onClick={onSelect}>
      <div className="flex items-center p-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{template.name}</h3>
            {template.isOfficial && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> Official
              </Badge>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{categoryInfo?.name}</p>
          <p className="mt-2 line-clamp-1 text-sm text-muted-foreground">{template.description}</p>
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          {template.rating && (
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" /> {template.rating}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Download className="h-4 w-4" /> {template.usageCount ?? template.downloads ?? 0}
          </span>
          <Button size="sm" variant="ghost">
            View <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}

interface TemplateDetailViewProps {
  templateId: Id<"industryTemplates">
  onBack: () => void
  onInstall: () => void
  canInstall: boolean
  installCta: string
  children?: React.ReactNode
}

function TemplateDetailView({ templateId, onBack, onInstall, canInstall, installCta, children }: TemplateDetailViewProps) {
  const template = useTemplateById(templateId)
  const reviews = useTemplateReviews(templateId, { limit: 5 })

  if (template === undefined) return <TemplateDetailSkeleton />
  if (!template) {
    return (
      <div className="flex h-full items-center justify-center">
        <p>Template not found</p>
      </div>
    )
  }

  const categoryInfo = categoryMetadata[template.category as IndustryCategory]

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-4 border-b p-4">
        <Button aria-label="Back" variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">{template.name}</h1>
            {template.isOfficial && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> Official
              </Badge>
            )}
            {template.isPremium && <Badge>Premium</Badge>}
          </div>
          <p className="text-sm text-muted-foreground">{categoryInfo?.name}</p>
        </div>
        <Button onClick={onInstall} disabled={!canInstall} title={canInstall ? undefined : installCta}>
          <Download className="mr-2 h-4 w-4" />
          {installCta}
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="max-w-4xl p-4">
          <div className="mb-6 flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">{template.reviewStats?.averageRating || "N/A"}</span>
              <span className="text-muted-foreground">
                ({template.reviewStats?.totalReviews || 0} reviews)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Download className="h-5 w-5 text-muted-foreground" />
              <span>{template.usageCount} installs</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <span>v{template.version}</span>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="mb-2 text-lg font-semibold">Description</h2>
            <p className="text-muted-foreground">{template.description}</p>
          </div>

          <div className="mb-6">
            <h2 className="mb-3 text-lg font-semibold">Included Features</h2>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {template.features.map((feature: FeatureModule) => {
                const info = featureModules[feature]
                return (
                  <div key={feature} className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
                    <Check className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium">{info?.name ?? feature}</p>
                      <p className="text-xs text-muted-foreground">{info?.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {template.defaultRoles && template.defaultRoles.length > 0 && (
            <div className="mb-6">
              <h2 className="mb-3 text-lg font-semibold">Pre-configured Roles</h2>
              <div className="space-y-2">
                {template.defaultRoles.map((role: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 rounded-lg border p-3">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{role.name}</p>
                      <p className="text-sm text-muted-foreground">{role.description}</p>
                    </div>
                    {role.isDefault && <Badge variant="outline">Default</Badge>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {template.tags && template.tags.length > 0 && (
            <div className="mb-6">
              <h2 className="mb-2 text-lg font-semibold">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {template.tags.map((tag: string) => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
              </div>
            </div>
          )}

          {template.guides && template.guides.length > 0 && (
            <div className="mb-6">
              <h2 className="mb-3 text-lg font-semibold">Setup Guides</h2>
              <div className="space-y-2">
                {template.guides.map((guide: any) => (
                  <Card key={guide._id} className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{guide.title}</p>
                        <p className="text-sm text-muted-foreground">{guide.type.replace("_", " ")}</p>
                      </div>
                      <Button aria-label="Open in new tab" size="sm" variant="ghost">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <Separator className="my-6" />

          <div>
            <h2 className="mb-3 text-lg font-semibold">Reviews</h2>
            {reviews?.reviews && reviews.reviews.length > 0 ? (
              <div className="space-y-3">
                {reviews.reviews.map((review: any) => (
                  <Card key={review._id} className="p-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{review.user?.name || "Anonymous"}</span>
                      <div className="flex items-center">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    {review.title && <p className="mt-2 font-medium">{review.title}</p>}
                    {review.review && <p className="mt-1 text-muted-foreground">{review.review}</p>}
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No reviews yet</p>
            )}
          </div>
        </div>
      </ScrollArea>
      {children}
    </div>
  )
}

interface InstallTemplateDialogProps {
  templateId: Id<"industryTemplates">
  workspaceId: Id<"workspaces"> | undefined
  isOpen: boolean
  onClose: () => void
}

function InstallTemplateDialog({ templateId, workspaceId, isOpen, onClose }: InstallTemplateDialogProps) {
  const template = useTemplateById(templateId)
  const installTemplate = useInstallTemplate()
  const [isInstalling, setIsInstalling] = React.useState(false)
  const [installProgress, setInstallProgress] = React.useState(0)
  const [includeSampleData, setIncludeSampleData] = React.useState(true)
  const [selectedFeatures, setSelectedFeatures] = React.useState<FeatureModule[]>([])
  const seededRef = React.useRef(false)

  React.useEffect(() => {
    if (seededRef.current) return
    if (template?.features) {
      setSelectedFeatures(template.features as FeatureModule[])
      seededRef.current = true
    }
  }, [template?.features])

  React.useEffect(() => {
    if (!isOpen) {
      seededRef.current = false
      setSelectedFeatures([])
    }
  }, [isOpen])

  const handleInstall = async () => {
    if (!template || !workspaceId) return
    setIsInstalling(true)
    setInstallProgress(0)
    const progressInterval = setInterval(() => {
      setInstallProgress((prev) => (prev >= 90 ? prev : prev + 10))
    }, 400)
    try {
      await installTemplate({
        templateId,
        workspaceId,
        options: { includeSampleData, selectedFeatures },
      })
      clearInterval(progressInterval)
      setInstallProgress(100)
      setTimeout(() => {
        onClose()
        setIsInstalling(false)
        setInstallProgress(0)
      }, 800)
    } catch (err) {
      clearInterval(progressInterval)
      console.error("[IndustryTemplatesPanel] install failed", err)
      setIsInstalling(false)
      setInstallProgress(0)
    }
  }

  const toggleFeature = (feature: FeatureModule) => {
    setSelectedFeatures((prev) =>
      prev.includes(feature) ? prev.filter((f) => f !== feature) : [...prev, feature]
    )
  }

  if (!template) return null

  return (
    <ResponsiveDialog open={isOpen} onOpenChange={onClose} variant="modal" size="md">
      <ResponsiveDialog.Header>
        <ResponsiveDialog.Title>Install {template.name}</ResponsiveDialog.Title>
        <ResponsiveDialog.Description>
          Configure installation before applying to the selected workspace
        </ResponsiveDialog.Description>
      </ResponsiveDialog.Header>

      <ResponsiveDialog.Body>
        {isInstalling ? (
          <div className="py-8">
            <div className="mb-4 text-center">
              <p className="font-medium">Installing template...</p>
              <p className="text-sm text-muted-foreground">
                {installProgress < 100 ? "Setting up your workspace" : "Complete!"}
              </p>
            </div>
            <Progress value={installProgress} className="h-2" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="sampleData"
                checked={includeSampleData}
                onCheckedChange={(checked) => setIncludeSampleData(checked as boolean)}
              />
              <label htmlFor="sampleData" className="text-sm font-medium">Include sample data</label>
            </div>

            <div>
              <h4 className="mb-2 text-sm font-medium">Select features to install:</h4>
              <ScrollArea className="h-48 rounded-lg border p-2">
                <div className="space-y-2">
                  {template.features.map((feature: FeatureModule) => {
                    const info = featureModules[feature]
                    return (
                      <div key={feature} className="flex items-center space-x-2">
                        <Checkbox
                          id={feature}
                          checked={selectedFeatures.includes(feature)}
                          onCheckedChange={() => toggleFeature(feature)}
                        />
                        <label htmlFor={feature} className="text-sm">
                          {info?.name ?? feature} - {info?.description}
                        </label>
                      </div>
                    )
                  })}
                </div>
              </ScrollArea>
            </div>
          </div>
        )}
      </ResponsiveDialog.Body>

      {!isInstalling && (
        <ResponsiveDialog.Footer className="flex-col-reverse sm:flex-row">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleInstall} disabled={selectedFeatures.length === 0 || !workspaceId}>
            Install Template
          </Button>
        </ResponsiveDialog.Footer>
      )}
    </ResponsiveDialog>
  )
}

function TemplateGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="mt-1 h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-12 w-full" />
            <div className="mt-3 flex gap-1">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-16" />
            </div>
          </CardContent>
          <CardFooter>
            <Skeleton className="h-8 w-full" />
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

function TemplateDetailSkeleton() {
  return (
    <div className="p-4">
      <div className="mb-6 flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded" />
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-1 h-4 w-24" />
        </div>
      </div>
      <Skeleton className="mb-6 h-24 w-full" />
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    </div>
  )
}

function EmptyState({ searchQuery, category }: { searchQuery: string; category: string | null }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Layers className="mb-4 h-12 w-12 text-muted-foreground" />
      <h3 className="mb-1 text-lg font-semibold">No templates found</h3>
      <p className="max-w-md text-center text-sm text-muted-foreground">
        {searchQuery
          ? `No templates match "${searchQuery}"`
          : category
          ? `No templates available for ${categoryMetadata[category as IndustryCategory]?.name ?? category}`
          : "No templates available"}
      </p>
    </div>
  )
}
