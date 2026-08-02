"use client"

import * as React from "react"
import {
  User,
  Settings,
  CreditCard,
  LogOut,
  Bell,
  Shield,
  Key,
  Mail,
  ChevronRight,
  Camera,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export interface UserProfile {
  id: string
  name: string
  email: string
  avatarUrl?: string
  role?: string
}

export interface ProfileDropdownProps {
  user: UserProfile
  onProfile?: () => void
  onSettings?: () => void
  onBilling?: () => void
  onSignOut?: () => void
  className?: string
}

/**
 * Profile Avatar Button
 */
export function ProfileAvatar({
  user,
  size = "default",
  className,
}: {
  user: UserProfile
  size?: "sm" | "default" | "lg"
  className?: string
}) {
  const sizeClasses = {
    sm: "h-8 w-8",
    default: "h-10 w-10",
    lg: "h-16 w-16",
  }

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      <AvatarImage src={user.avatarUrl} alt={user.name} />
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  )
}

/**
 * Profile Dropdown Menu
 */
export function ProfileDropdown({
  user,
  onProfile,
  onSettings,
  onBilling,
  onSignOut,
  className,
}: ProfileDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className={cn("relative h-10 w-10 rounded-full", className)}>
          <ProfileAvatar user={user} size="default" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={onProfile}>
            <User className="mr-2 h-4 w-4" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onSettings}>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onBilling}>
            <CreditCard className="mr-2 h-4 w-4" />
            Billing
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onSignOut} className="text-destructive focus:text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/**
 * Profile Info Card
 */
export function ProfileInfoCard({
  user,
  onEditAvatar,
  className,
}: {
  user: UserProfile
  onEditAvatar?: () => void
  className?: string
}) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Profile Information
        </CardTitle>
        <CardDescription>Update your personal information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar Section */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <ProfileAvatar user={user} size="lg" />
            {onEditAvatar && (
              <Button
                size="icon"
                variant="secondary"
                className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full"
                onClick={onEditAvatar}
              >
                <Camera className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
          <div>
            <h3 className="font-medium">{user.name}</h3>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            {user.role && (
              <p className="text-xs text-muted-foreground mt-1">{user.role}</p>
            )}
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" defaultValue={user.name} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" defaultValue={user.email} disabled />
            <p className="text-xs text-muted-foreground">
              Contact support to change your email
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Account Settings Card
 */
export function AccountSettingsCard({ className }: { className?: string }) {
  const settingsItems = [
    {
      icon: Key,
      label: "Change Password",
      description: "Update your password",
      onClick: () => {},
    },
    {
      icon: Shield,
      label: "Two-Factor Authentication",
      description: "Add extra security to your account",
      onClick: () => {},
    },
    {
      icon: Mail,
      label: "Email Preferences",
      description: "Manage your email notifications",
      onClick: () => {},
    },
    {
      icon: Bell,
      label: "Notification Settings",
      description: "Control how you receive notifications",
      onClick: () => {},
    },
  ]

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Account Settings
        </CardTitle>
        <CardDescription>Manage your account preferences</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {settingsItems.map(({ icon: Icon, label, description, onClick }) => (
            <button
              key={label}
              onClick={onClick}
              className="flex w-full items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-muted p-2">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">{label}</p>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Danger Zone Card (Delete Account)
 */
export function DangerZoneCard({
  onDeleteAccount,
  className,
}: {
  onDeleteAccount?: () => void
  className?: string
}) {
  return (
    <Card className={cn("border-destructive/50", className)}>
      <CardHeader>
        <CardTitle className="text-destructive">Danger Zone</CardTitle>
        <CardDescription>
          Irreversible and destructive actions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Delete Account</p>
            <p className="text-sm text-muted-foreground">
              Permanently delete your account and all data
            </p>
          </div>
          <Button variant="destructive" onClick={onDeleteAccount}>
            Delete Account
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
