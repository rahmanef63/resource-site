"use client"

import * as React from "react"
import Image from "next/image"
import { ResponsiveDialog } from "@/frontend/shared/ui"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, Search } from "lucide-react"

export interface GifPickerProps {
  open: boolean
  onClose: () => void
  onSelect: (gifUrl: string) => void
}

export function GifPicker({ open, onClose, onSelect }: GifPickerProps) {
  const [search, setSearch] = React.useState("")
  const [gifs, setGifs] = React.useState<Array<{ id: string; url: string; preview: string }>>([])
  const [isLoading, setIsLoading] = React.useState(false)

  // Sample trending GIFs (in production, use Giphy/Tenor API)
  const trendingGifs = React.useMemo(() => [
    { id: "1", url: "https://media.giphy.com/media/Cmr1OMJ2FN0B2/giphy.gif", preview: "https://media.giphy.com/media/Cmr1OMJ2FN0B2/200w.gif" },
    { id: "2", url: "https://media.giphy.com/media/111ebonMs90YLu/giphy.gif", preview: "https://media.giphy.com/media/111ebonMs90YLu/200w.gif" },
    { id: "3", url: "https://media.giphy.com/media/3oEdv6sy3ulljPMGdy/giphy.gif", preview: "https://media.giphy.com/media/3oEdv6sy3ulljPMGdy/200w.gif" },
    { id: "4", url: "https://media.giphy.com/media/l0HlHFRbmaZtBRhXG/giphy.gif", preview: "https://media.giphy.com/media/l0HlHFRbmaZtBRhXG/200w.gif" },
    { id: "5", url: "https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif", preview: "https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/200w.gif" },
    { id: "6", url: "https://media.giphy.com/media/l46CyJmS9KUbokzsI/giphy.gif", preview: "https://media.giphy.com/media/l46CyJmS9KUbokzsI/200w.gif" },
    { id: "7", url: "https://media.giphy.com/media/3o7TKSjRrfIPjeiVyM/giphy.gif", preview: "https://media.giphy.com/media/3o7TKSjRrfIPjeiVyM/200w.gif" },
    { id: "8", url: "https://media.giphy.com/media/xT9IgG50Fb7Mi0prBC/giphy.gif", preview: "https://media.giphy.com/media/xT9IgG50Fb7Mi0prBC/200w.gif" },
  ], [])

  React.useEffect(() => {
    if (!search) {
      setGifs(trendingGifs)
      return
    }

    setIsLoading(true)
    const timer = setTimeout(() => {
      // Simulate search - filter based on search term
      setGifs(trendingGifs.slice(0, Math.max(2, Math.floor(Math.random() * trendingGifs.length))))
      setIsLoading(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [search, trendingGifs])

  if (!open) return null

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={(o) => !o && onClose()}
      variant="modal"
      size="md"
    >
      <ResponsiveDialog.Header>
        <ResponsiveDialog.Title>Choose a GIF</ResponsiveDialog.Title>
        <ResponsiveDialog.Description>Search for the perfect reaction</ResponsiveDialog.Description>
      </ResponsiveDialog.Header>

      <ResponsiveDialog.Body className="flex flex-col gap-3 overflow-hidden px-4 py-4 sm:px-6">
        <div className="relative shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search GIFs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <ScrollArea className="flex-1 min-h-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-[200px]">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 p-1">
              {gifs.map((gif) => (
                <button
                  key={gif.id}
                  onClick={() => {
                    onSelect(gif.url)
                    onClose()
                  }}
                  className="relative aspect-video rounded-lg overflow-hidden hover:ring-2 hover:ring-primary transition-all"
                >
                  <Image
                    src={gif.preview}
                    alt="GIF"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 240px"
                  />
                </button>
              ))}
            </div>
          )}
        </ScrollArea>

        <p className="text-xs text-muted-foreground text-center shrink-0">Powered by GIPHY</p>
      </ResponsiveDialog.Body>
    </ResponsiveDialog>
  )
}
