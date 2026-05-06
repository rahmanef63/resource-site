"use client"

import { useState, useEffect } from "react"
import { useUser, useAuthClient } from "@/frontend/shared/foundation/auth"
import { useQuery, useMutation } from "convex/react"
import { api } from "@convex/_generated/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Save, Camera, ExternalLink } from "lucide-react"
import { toast } from "sonner"

/**
 * Account Settings - User profile and account management
 * Uses real data from auth (auth) and Convex (database)
 */
export function AccountSettings() {
  const { user: authUser, isLoaded: authLoaded } = useUser()
  const { openUserProfile } = useAuthClient()
  const convexUser = useQuery(api.auth.auth.loggedInUser)
  const updateProfile = useMutation(api.user.users.updateUserProfile)
  
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
  })
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Sync form data with user data
  useEffect(() => {
    if (convexUser) {
      setFormData({
        name: convexUser.name || "",
        bio: (convexUser as any).bio || "",
      })
    }
  }, [convexUser])

  // Track changes
  useEffect(() => {
    if (convexUser) {
      const originalName = convexUser.name || ""
      const originalBio = (convexUser as any).bio || ""
      setHasChanges(
        formData.name !== originalName || formData.bio !== originalBio
      )
    }
  }, [formData, convexUser])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await updateProfile({
        name: formData.name,
        bio: formData.bio,
      })
      toast.success("Profile updated successfully")
      setHasChanges(false)
    } catch (error) {
      console.error("Failed to update profile:", error)
      toast.error("Failed to update profile")
    } finally {
      setIsSaving(false)
    }
  }

  const getInitials = (): string => {
    if (authUser?.firstName && authUser?.lastName) {
      return `${authUser.firstName[0]}${authUser.lastName[0]}`.toUpperCase()
    }
    if (convexUser?.name) {
      const name = convexUser.name
      const parts = name.split(" ")
      const initials = parts.reduce((acc: string, part: string) => {
        return acc + (part.charAt(0) || "")
      }, "")
      return initials.toUpperCase().slice(0, 2)
    }
    return authUser?.primaryEmailAddress?.emailAddress?.[0]?.toUpperCase() || "U"
  }

  if (!authLoaded || convexUser === undefined) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!authUser) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Please sign in to view account settings
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            Manage your personal information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage 
                src={authUser.imageUrl} 
                alt={convexUser?.name || "Profile"} 
              />
              <AvatarFallback className="text-lg">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => openUserProfile()}
                className="gap-2"
              >
                <Camera className="h-4 w-4" />
                Change Photo
              </Button>
              <p className="text-xs text-muted-foreground">
                Manage via your account profile
              </p>
            </div>
          </div>
          
          {/* Display Name */}
          <div className="space-y-2">
            <Label htmlFor="display-name">Display Name</Label>
            <Input
              id="display-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter your name"
            />
            <p className="text-xs text-muted-foreground">
              Your name as shown to others
            </p>
          </div>
          
          {/* Email (read-only, managed by auth) */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={authUser.primaryEmailAddress?.emailAddress || ""}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              Email is managed through your account security settings
            </p>
          </div>
          
          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Tell us a bit about yourself..."
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              A short description about you
            </p>
          </div>

          {/* Save Button */}
          {hasChanges && (
            <div className="flex justify-end">
              <Button 
                onClick={handleSave} 
                disabled={isSaving}
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
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>
            Manage your account security settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            variant="outline" 
            onClick={() => openUserProfile()}
            className="gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            Manage Security Settings
          </Button>
          <p className="text-xs text-muted-foreground">
            Change password, enable two-factor authentication, and manage connected accounts
          </p>
        </CardContent>
      </Card>

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible account actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            variant="destructive" 
            onClick={() => openUserProfile()}
          >
            Manage Account
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            Account deletion is managed through your security settings
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
