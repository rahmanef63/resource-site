"use client"

import * as React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { Quote } from "lucide-react"

export interface TestimonialBlockProps {
  quote?: string
  author?: string
  role?: string
  company?: string
  avatar?: string
  rating?: number
  className?: string
}

export function TestimonialBlock({
  quote = "This product completely changed how our team works. Highly recommended!",
  author = "Sarah Johnson",
  role = "Product Lead",
  company = "Acme Corp",
  avatar,
  rating = 5,
  className,
}: TestimonialBlockProps) {
  const initials = author
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <div
      className={cn(
        "flex flex-col gap-5 rounded-2xl border bg-card p-8 shadow-sm",
        className
      )}
    >
      {/* Stars */}
      {rating > 0 && (
        <div className="flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              className={cn("text-lg", i < rating ? "text-amber-400" : "text-muted-foreground/30")}
            >
              ★
            </span>
          ))}
        </div>
      )}

      {/* Quote */}
      <blockquote className="relative">
        <Quote
          size={20}
          className="absolute -top-1 -left-1 text-primary/20 rotate-180"
          aria-hidden
        />
        <p className="text-base text-muted-foreground leading-relaxed pl-5">{quote}</p>
      </blockquote>

      {/* Author */}
      <div className="flex items-center gap-3 mt-auto">
        <Avatar className="h-10 w-10">
          <AvatarImage src={avatar} />
          <AvatarFallback className="text-sm font-medium">{initials}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-semibold">{author}</p>
          <p className="text-xs text-muted-foreground">
            {role}{company ? ` · ${company}` : ""}
          </p>
        </div>
      </div>
    </div>
  )
}
