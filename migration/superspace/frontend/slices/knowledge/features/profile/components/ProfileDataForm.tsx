"use client"

import { useState, useEffect } from "react";
import { Save, User, Brain, Briefcase, Sparkles, MessageSquare, Clock, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useCurrentUser, useUpdateProfile } from "@/frontend/slices/knowledge/features/profile/api";

interface ProfileMetadata {
  bio?: string;
  role?: string;
  skills?: string;
  interests?: string;
  expertise?: string;
  workingStyle?: string;
  communicationPreferences?: string;
  timezone?: string;
  availability?: string;
  aiAccessEnabled?: boolean;
  includeInAIContext?: boolean;
}

/**
 * ProfileDataForm - User profile data for AI context
 * 
 * This component manages user profile information that can be used
 * by AI for personalization and context understanding.
 */
export function ProfileDataForm() {
  const currentUser = useCurrentUser();
  const updateProfile = useUpdateProfile();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    // AI Context Fields
    bio: "",
    role: "",
    skills: "",
    interests: "",
    expertise: "",
    workingStyle: "",
    communicationPreferences: "",
    timezone: "",
    availability: "",
  });

  const [aiSettings, setAiSettings] = useState({
    aiAccessEnabled: true,
    includeInAIContext: true,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (currentUser) {
      const metadata = (currentUser.metadata || {}) as ProfileMetadata;
      setFormData({
        name: currentUser.name || "",
        email: currentUser.email || "",
        bio: metadata.bio || "",
        role: metadata.role || "",
        skills: metadata.skills || "",
        interests: metadata.interests || "",
        expertise: metadata.expertise || "",
        workingStyle: metadata.workingStyle || "",
        communicationPreferences: metadata.communicationPreferences || "",
        timezone: metadata.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        availability: metadata.availability || "",
      });
      setAiSettings({
        aiAccessEnabled: metadata.aiAccessEnabled !== false,
        includeInAIContext: metadata.includeInAIContext !== false,
      });
      setHasChanges(false);
    }
  }, [currentUser]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleAiSettingChange = (field: keyof typeof aiSettings, value: boolean) => {
    setAiSettings(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await updateProfile({
        name: formData.name,
        bio: formData.bio,
        metadata: {
          role: formData.role,
          skills: formData.skills,
          interests: formData.interests,
          expertise: formData.expertise,
          workingStyle: formData.workingStyle,
          communicationPreferences: formData.communicationPreferences,
          timezone: formData.timezone,
          availability: formData.availability,
          aiAccessEnabled: aiSettings.aiAccessEnabled,
          includeInAIContext: aiSettings.includeInAIContext,
        },
      });
      toast.success("Profile saved successfully");
      setHasChanges(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex-col justify-center items-center mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <User className="w-6 h-6" />
            Profile Data
          </h1>
          <p className="text-muted-foreground">
            Manage your profile information for AI context and personalization
          </p>
        </div>
        <Button 
          onClick={handleSubmit} 
          disabled={isSaving || !hasChanges}
          className="gap-2"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save Changes
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* AI Settings Card */}
        <Card className="border-purple-200 bg-purple-50/50 dark:border-purple-900 dark:bg-purple-950/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-500" />
              AI Access Settings
            </CardTitle>
            <CardDescription>
              Control how AI uses your profile data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="ai-accessible">Allow AI Access</Label>
                <p className="text-xs text-muted-foreground">
                  Let AI use your profile for personalization
                </p>
              </div>
              <Switch
                id="ai-accessible"
                checked={aiSettings.aiAccessEnabled}
                onCheckedChange={(checked) => handleAiSettingChange("aiAccessEnabled", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="include-context">Include in AI Context</Label>
                <p className="text-xs text-muted-foreground">
                  Add profile to AI conversation context
                </p>
              </div>
              <Switch
                id="include-context"
                checked={aiSettings.includeInAIContext}
                onCheckedChange={(checked) => handleAiSettingChange("includeInAIContext", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" value={formData.email} disabled />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                rows={3}
                placeholder="Tell us about yourself..."
                value={formData.bio}
                onChange={(e) => handleInputChange("bio", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Professional Context */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Professional Context
              <Badge variant="secondary" className="text-xs">
                <Brain className="h-3 w-3 mr-1" />
                AI Context
              </Badge>
            </CardTitle>
            <CardDescription>
              Help AI understand your professional background
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role">Role / Title</Label>
              <Input
                id="role"
                placeholder="e.g., Senior Software Engineer, Product Manager"
                value={formData.role}
                onChange={(e) => handleInputChange("role", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expertise">Areas of Expertise</Label>
              <Textarea
                id="expertise"
                rows={2}
                placeholder="What are you an expert in? e.g., Backend development, System design, UX research"
                value={formData.expertise}
                onChange={(e) => handleInputChange("expertise", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="skills">Technical Skills</Label>
              <Textarea
                id="skills"
                rows={2}
                placeholder="e.g., TypeScript, React, Node.js, PostgreSQL, AWS"
                value={formData.skills}
                onChange={(e) => handleInputChange("skills", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Separate skills with commas
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Working Style */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Working Style
              <Badge variant="secondary" className="text-xs">
                <Brain className="h-3 w-3 mr-1" />
                AI Context
              </Badge>
            </CardTitle>
            <CardDescription>
              Help AI adapt to your preferred way of working
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="workingStyle">How You Work</Label>
              <Textarea
                id="workingStyle"
                rows={3}
                placeholder="Describe your working style. e.g., I prefer detailed explanations with examples. I like to understand the 'why' behind decisions. I work best with structured plans."
                value={formData.workingStyle}
                onChange={(e) => handleInputChange("workingStyle", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="interests">Interests & Learning Goals</Label>
              <Textarea
                id="interests"
                rows={2}
                placeholder="e.g., AI/ML, System Architecture, Leadership, Open Source"
                value={formData.interests}
                onChange={(e) => handleInputChange("interests", e.target.value)}
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
              Tell AI how you prefer to communicate
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="communicationPreferences">Communication Style</Label>
              <Textarea
                id="communicationPreferences"
                rows={4}
                placeholder="How should AI communicate with you? e.g.,
- Be concise and direct
- Use code examples when explaining
- Explain trade-offs for decisions
- Ask clarifying questions when needed"
                value={formData.communicationPreferences}
                onChange={(e) => handleInputChange("communicationPreferences", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Availability */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Availability
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Input
                id="timezone"
                placeholder="e.g., America/New_York, Europe/London"
                value={formData.timezone}
                onChange={(e) => handleInputChange("timezone", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="availability">Working Hours / Availability</Label>
              <Input
                id="availability"
                placeholder="e.g., Mon-Fri 9am-6pm, Available for async collaboration"
                value={formData.availability}
                onChange={(e) => handleInputChange("availability", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Preview */}
        <Card className="bg-muted/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI Profile Preview
            </CardTitle>
            <CardDescription>
              This is how AI will understand your profile
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-background p-4 rounded-lg overflow-auto max-h-64 whitespace-pre-wrap">
{`## ${formData.name || "(Name not set)"}
${formData.role || "(Role not set)"}

## Bio
${formData.bio || "(Not provided)"}

## Expertise
${formData.expertise || "(Not provided)"}

## Skills
${formData.skills || "(Not provided)"}

## Working Style
${formData.workingStyle || "(Not provided)"}

## Interests
${formData.interests || "(Not provided)"}

## Communication Preferences
${formData.communicationPreferences || "(Not provided)"}

## Availability
Timezone: ${formData.timezone || "(Not set)"}
Hours: ${formData.availability || "(Not set)"}`}
            </pre>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
