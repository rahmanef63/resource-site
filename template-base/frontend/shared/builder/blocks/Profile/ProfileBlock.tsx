/**
 * Profile Block
 * 
 * Standard entity header for Users, Contacts, etc.
 */

"use client"

import * as React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BlockCard } from "../shared"
import Image from "next/image"
import { Mail, Phone, MapPin, Link as LinkIcon } from "lucide-react"

// ============================================================================
// Types
// ============================================================================

export interface ProfileAction {
    label: string
    onClick?: () => void
    variant?: "default" | "outline" | "secondary" | "ghost" | "destructive"
    icon?: React.ComponentType<any>
}

export interface ProfileBlockProps {
    name: string
    role?: string
    avatar?: string
    initials?: string
    email?: string
    phone?: string
    location?: string
    website?: string
    tags?: string[]
    actions?: ProfileAction[]
    className?: string
    coverImage?: string
}

// ============================================================================
// Profile Block
// ============================================================================

export function ProfileBlock({
    name,
    role,
    avatar,
    initials,
    email,
    phone,
    location,
    website,
    tags,
    actions,
    className,
    coverImage,
}: ProfileBlockProps) {
    return (
        <BlockCard className={className} noPadding>
            {coverImage && (
                <div className="h-32 w-full bg-muted border-b overflow-hidden relative">
                    <Image src={coverImage} alt="Cover" fill className="object-cover" unoptimized />
                </div>
            )}
            <div className="p-6">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                    <Avatar className={`h-24 w-24 border-4 border-background shadow-sm ${coverImage ? '-mt-16' : ''}`}>
                        <AvatarImage src={avatar} />
                        <AvatarFallback className="text-xl">{initials || name.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1 space-y-4 w-full">
                        <div className="flex flex-col md:flex-row justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-bold">{name}</h2>
                                {role && <p className="text-muted-foreground">{role}</p>}
                                {tags && tags.length > 0 && (
                                    <div className="flex gap-2 mt-3 flex-wrap">
                                        {tags.map((tag) => (
                                            <Badge key={tag} variant="secondary" className="text-xs font-normal">{tag}</Badge>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        {actions && actions.length > 0 && (
                            <div className="flex gap-2">
                                {actions.map((action, i) => {
                                    const Icon = action.icon
                                    return (
                                        <Button key={i} variant={action.variant || "outline"} onClick={action.onClick} size="sm">
                                            {Icon && <Icon className="mr-2 h-4 w-4" />}
                                            {action.label}
                                        </Button>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
                    {email && (
                        <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <a href={`mailto:${email}`} className="hover:underline">{email}</a>
                        </div>
                    )}
                    {phone && (
                        <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <a href={`tel:${phone}`} className="hover:underline">{phone}</a>
                        </div>
                    )}
                    {location && (
                        <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>{location}</span>
                        </div>
                    )}
                    {website && (
                        <div className="flex items-center gap-2 text-sm">
                            <LinkIcon className="h-4 w-4 text-muted-foreground" />
                            <a href={website} target="_blank" rel="noopener noreferrer" className="hover:underline max-w-[150px] truncate">{website}</a>
                        </div>
                    )}
                </div>
            </div>
        </BlockCard >
    )
}
