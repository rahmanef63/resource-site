"use client";

import { useState, useEffect } from "react";
import type { Id } from "@convex/_generated/dataModel";
import { PageContainer } from "@/frontend/shared/ui/layout/container";
import { Building2, Brain, Save, Users, Target, MessageSquare, Loader2, Wrench, GitBranch, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useWorkspaceContext, useUpdateWorkspaceContext } from "./api";

export interface WorkspaceContextPageProps {
  workspaceId?: Id<"workspaces"> | null;
}

interface WorkspaceContextFormData {
  teamOverview: string;
  projectContext: string;
  goalsObjectives: string;
  skills: string;
  processes: string;
  tools: string;
  communication: string;
}

const DEFAULT_CONTEXT: WorkspaceContextFormData = {
  teamOverview: "",
  projectContext: "",
  goalsObjectives: "",
  skills: "",
  processes: "",
  tools: "",
  communication: "",
};

/**
 * WorkspaceContextPage - Workspace Context for AI
 * 
 * This page allows users to configure workspace-level context
 * that AI can use for better understanding of the team and projects.
 */
export default function WorkspaceContextPage({ workspaceId }: WorkspaceContextPageProps) {
  const [formData, setFormData] = useState<WorkspaceContextFormData>(DEFAULT_CONTEXT);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Load workspace context from Convex
  const contextData = useWorkspaceContext(workspaceId);
  const updateContext = useUpdateWorkspaceContext();
  
  const isLoading = contextData === undefined;

  // Sync form data when context data loads
  useEffect(() => {
    if (contextData) {
      setFormData({
        teamOverview: contextData.teamOverview || "",
        projectContext: contextData.projectContext || "",
        goalsObjectives: contextData.goalsObjectives || "",
        skills: contextData.skills || "",
        processes: contextData.processes || "",
        tools: contextData.tools || "",
        communication: contextData.communication || "",
      });
      setHasChanges(false);
    }
  }, [contextData]);

  const handleInputChange = (field: keyof WorkspaceContextFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!workspaceId) return;
    
    setIsSaving(true);
    try {
      await updateContext({
        workspaceId,
        ...formData,
      });
      toast.success("Workspace context saved successfully");
      setHasChanges(false);
    } catch (error) {
      console.error("Failed to save workspace context:", error);
      toast.error("Failed to save workspace context");
    } finally {
      setIsSaving(false);
    }
  };

  if (!workspaceId) {
    return (
      <PageContainer maxWidth="full" padding={true} className="h-full">
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">
            Please select a workspace to configure context.
          </p>
        </div>
      </PageContainer>
    );
  }

  if (isLoading) {
    return (
      <PageContainer maxWidth="full" padding={true} className="h-full">
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="2xl" padding={true} className="h-full w-full overflow-auto">
      <div className="space-y-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Building2 className="w-6 h-6" />
              Workspace Context
            </h1>
            <p className="text-muted-foreground">
              Configure workspace context for AI understanding
            </p>
          </div>
          <Button 
            onClick={handleSave} 
            disabled={isSaving || !hasChanges} 
            className="gap-2"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Changes
          </Button>
        </div>

        {/* Team Overview */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team Overview
              <Badge variant="secondary" className="text-xs">
                <Brain className="h-3 w-3 mr-1" />
                AI Context
              </Badge>
            </CardTitle>
            <CardDescription>
              Describe your team structure, roles, and culture
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="team-overview">Team Description</Label>
              <Textarea
                id="team-overview"
                rows={4}
                placeholder="Describe your team - who are the members, what are their roles, what's the team culture like?

Example: We're a 5-person engineering team at a B2B SaaS startup. The team includes 2 frontend engineers, 2 backend engineers, and a DevOps engineer. We value clear communication and code quality."
                value={formData.teamOverview}
                onChange={(e) => handleInputChange("teamOverview", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Project Context */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5" />
              Project Context
              <Badge variant="secondary" className="text-xs">
                <Brain className="h-3 w-3 mr-1" />
                AI Context
              </Badge>
            </CardTitle>
            <CardDescription>
              Describe your current projects and their context
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="project-context">Current Projects</Label>
              <Textarea
                id="project-context"
                rows={4}
                placeholder="What projects is the team working on? What's the tech stack? What are the key features?

Example: We're building a customer analytics platform using Next.js, Convex, and TypeScript. Key features include real-time dashboards, AI-powered insights, and custom reporting."
                value={formData.projectContext}
                onChange={(e) => handleInputChange("projectContext", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Goals & Objectives */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Goals & Objectives
              <Badge variant="secondary" className="text-xs">
                <Brain className="h-3 w-3 mr-1" />
                AI Context
              </Badge>
            </CardTitle>
            <CardDescription>
              What are your team's current goals and success metrics?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="goals-objectives">Team Goals</Label>
              <Textarea
                id="goals-objectives"
                rows={4}
                placeholder="What are your short-term and long-term goals? What does success look like?

Example: Our Q1 goals are to ship the v2.0 release, improve page load times by 50%, and increase test coverage to 80%."
                value={formData.goalsObjectives}
                onChange={(e) => handleInputChange("goalsObjectives", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Skills & Expertise */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Skills & Expertise
            </CardTitle>
            <CardDescription>
              What skills and expertise does the team have?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="skills">Team Skills</Label>
              <Textarea
                id="skills"
                rows={3}
                placeholder="What are the team's key skills and areas of expertise?

Example: React, TypeScript, Node.js, PostgreSQL, AWS, Agile methodologies, API design"
                value={formData.skills}
                onChange={(e) => handleInputChange("skills", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Processes & Workflows */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <GitBranch className="h-5 w-5" />
              Processes & Workflows
            </CardTitle>
            <CardDescription>
              How does the team work together?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="processes">Development Processes</Label>
              <Textarea
                id="processes"
                rows={3}
                placeholder="What processes and workflows does the team follow?

Example: We use 2-week sprints with daily standups. All code requires PR reviews from at least 2 team members. We deploy to production every Tuesday and Thursday."
                value={formData.processes}
                onChange={(e) => handleInputChange("processes", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Tools & Technologies */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Tools & Technologies
            </CardTitle>
            <CardDescription>
              What tools and technologies does the team use?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="tools">Technology Stack</Label>
              <Textarea
                id="tools"
                rows={3}
                placeholder="What tools, services, and technologies does the team use?

Example: GitHub for version control, Linear for project management, Figma for design, Vercel for hosting, Sentry for error tracking"
                value={formData.tools}
                onChange={(e) => handleInputChange("tools", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Communication Preferences */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Communication Preferences
              <Badge variant="outline" className="text-xs text-purple-500 border-purple-500">
                AI Instructions
              </Badge>
            </CardTitle>
            <CardDescription>
              How should AI communicate with this workspace?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="communication">Communication Style</Label>
              <Textarea
                id="communication"
                rows={4}
                placeholder="How should AI communicate? Any preferences or instructions?

Example: 
- Be concise and technical
- Always include code examples when explaining concepts
- Use TypeScript for all code samples
- Follow our coding style guide (camelCase, functional components)"
                value={formData.communication}
                onChange={(e) => handleInputChange("communication", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                These preferences will influence how AI responds in this workspace.
              </p>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Preview */}
        <Card className="bg-muted/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI Context Preview
            </CardTitle>
            <CardDescription>
              This is how AI will understand your workspace
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-background p-4 rounded-lg overflow-auto max-h-64 whitespace-pre-wrap">
{`## Team Overview
${formData.teamOverview || "(Not provided)"}

## Project Context
${formData.projectContext || "(Not provided)"}

## Goals & Objectives
${formData.goalsObjectives || "(Not provided)"}

## Skills & Expertise
${formData.skills || "(Not provided)"}

## Processes & Workflows
${formData.processes || "(Not provided)"}

## Tools & Technologies
${formData.tools || "(Not provided)"}

## Communication Preferences
${formData.communication || "(Not provided)"}`}
            </pre>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
