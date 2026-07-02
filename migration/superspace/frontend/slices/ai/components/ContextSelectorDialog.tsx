/**
 * AI Context Selector Dialog
 * Allows users to select specific knowledge sources from workspaces and features
 */

"use client"

import { useState, useEffect } from "react"
import { Check, ChevronRight, ChevronDown, Brain, Database, FileText, MessageSquare, Layout, Folder } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ResponsiveDialog } from "@/frontend/shared/ui"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useWorkspaceContext } from "@/frontend/shared/foundation/provider/WorkspaceProvider"
import { useAIStore } from "../stores"

// Types for the tree structure
interface ContextNode {
  id: string
  label: string
  type: 'workspace' | 'feature' | 'document'
  icon?: React.ReactNode
  children?: ContextNode[]
  parentId?: string
}

interface ContextSelectorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ContextSelectorDialog({ open, onOpenChange }: ContextSelectorDialogProps) {
  const { workspaceId, isMainWorkspace } = useWorkspaceContext()
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
  const [selectedNodes, setSelectedNodes] = useState<Set<string>>(new Set())
  
  // Get store actions
  const selectedKnowledgeSources = useAIStore((s) => s.selectedKnowledgeSources)
  const setKnowledgeSources = useAIStore((s) => s.setKnowledgeSources)
  
  // Fetch workspaces
  const workspaces = useQuery(api.workspace.workspaces.getUserWorkspaces) || []
  const workspaceList = workspaces as Array<{ _id: string; name?: string }>
  
  // Mock features for now (since we don't have a direct query for all features per workspace yet)
  // In a real implementation, we would fetch enabled features from workspace settings
  const getWorkspaceFeatures = (wsId: string): ContextNode[] => [
    { id: `${wsId}-wiki`, label: "Wiki & Documents", type: 'feature', icon: <FileText className="h-4 w-4" /> },
    { id: `${wsId}-chat`, label: "Chat History", type: 'feature', icon: <MessageSquare className="h-4 w-4" /> },
    { id: `${wsId}-tasks`, label: "Tasks & Projects", type: 'feature', icon: <Layout className="h-4 w-4" /> },
    { id: `${wsId}-db`, label: "Database Records", type: 'feature', icon: <Database className="h-4 w-4" /> },
  ]

  // Build the tree structure
  const treeData: ContextNode[] = [
    {
      id: 'current-workspace',
      label: 'Current Workspace',
      type: 'workspace',
      icon: <Brain className="h-4 w-4 text-purple-400" />,
      children: workspaceId ? getWorkspaceFeatures(workspaceId) : []
    },
    {
      id: 'other-workspaces',
      label: 'Other Workspaces',
      type: 'workspace',
      icon: <Folder className="h-4 w-4 text-blue-400" />,
      children: workspaceList
        .filter((ws) => typeof ws.name === "string")
        .filter((ws) => ws._id !== workspaceId)
        .map((ws) => ({
          id: ws._id,
          label: ws.name as string,
          type: 'workspace',
          children: getWorkspaceFeatures(ws._id)
        }))
    }
  ]

  // Initialize expanded nodes and selected nodes
  useEffect(() => {
    if (open) {
      setExpandedNodes(new Set(['current-workspace', 'other-workspaces']))
      // Initialize selected nodes from store
      // Note: This assumes the store IDs match the tree IDs
      setSelectedNodes(new Set(selectedKnowledgeSources))
    }
  }, [open, selectedKnowledgeSources])

  const toggleExpand = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes)
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId)
    } else {
      newExpanded.add(nodeId)
    }
    setExpandedNodes(newExpanded)
  }

  const toggleSelect = (nodeId: string, checked: boolean) => {
    const newSelected = new Set(selectedNodes)
    if (checked) {
      newSelected.add(nodeId)
    } else {
      newSelected.delete(nodeId)
    }
    setSelectedNodes(newSelected)
  }

  // Recursive tree renderer
  const renderNode = (node: ContextNode, level: number = 0) => {
    const hasChildren = node.children && node.children.length > 0
    const isExpanded = expandedNodes.has(node.id)
    const isSelected = selectedNodes.has(node.id)

    return (
      <div key={node.id} className="select-none">
        <div 
          className={cn(
            "flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-zinc-900 transition-colors cursor-pointer",
            level > 0 && "ml-6"
          )}
        >
          <div 
            className={cn(
              "p-0.5 rounded-sm hover:bg-zinc-800 transition-colors",
              !hasChildren && "opacity-0 pointer-events-none"
            )}
            onClick={(e) => {
              e.stopPropagation()
              toggleExpand(node.id)
            }}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-zinc-500" />
            ) : (
              <ChevronRight className="h-4 w-4 text-zinc-500" />
            )}
          </div>

          <Checkbox 
            id={`node-${node.id}`}
            checked={isSelected}
            onCheckedChange={(checked) => toggleSelect(node.id, checked as boolean)}
            className="data-[state=checked]:bg-purple-500 border-zinc-700"
          />

          <div 
            className="flex items-center gap-2 flex-1 min-w-0"
            onClick={() => toggleExpand(node.id)}
          >
            {node.icon}
            <span className="text-sm text-zinc-300 truncate">{node.label}</span>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="mt-1">
            {node.children!.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      variant="modal"
      size="md"
      contentClassName="bg-zinc-950 border-zinc-800 text-zinc-100 sm:max-w-[500px]"
    >
      <ResponsiveDialog.Header>
        <ResponsiveDialog.Title>Context Sources</ResponsiveDialog.Title>
        <ResponsiveDialog.Description className="text-zinc-400">
          Select which workspaces and features the AI should use for context.
        </ResponsiveDialog.Description>
      </ResponsiveDialog.Header>

      <ResponsiveDialog.Body className="px-4 py-4 sm:px-6">
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-1">
            {treeData.map(node => renderNode(node))}
          </div>
        </ScrollArea>
      </ResponsiveDialog.Body>

      <ResponsiveDialog.Footer className="flex-col-reverse gap-2 sm:flex-row sm:justify-between sm:items-center">
        <div className="text-xs text-zinc-500 text-center sm:text-left">
          {selectedNodes.size} sources selected
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-zinc-400 hover:text-zinc-100">
            Cancel
          </Button>
          <Button
            onClick={() => {
              setKnowledgeSources(Array.from(selectedNodes))
              onOpenChange(false)
            }}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            Apply Context
          </Button>
        </div>
      </ResponsiveDialog.Footer>
    </ResponsiveDialog>
  )
}
