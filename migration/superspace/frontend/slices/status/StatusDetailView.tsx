import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Play, Pause, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/frontend/shared/communications";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

interface StatusDetailViewProps {
  statusId?: string;
}

// Type for status detail
interface StatusMedia {
  id: string;
  url: string;
  type: 'photo' | 'video';
}

interface StatusDetail {
  name: string;
  avatar: string;
  time: string;
  mediaType: string;
  media: StatusMedia[];
}

// Hook to fetch status detail from Convex
const useStatusDetail = (statusId?: string) => {
  const rawStatus = useQuery(
    api.features.status.queries.getStatus,
    statusId ? { statusId: statusId as Id<"statuses"> } : "skip"
  );

  if (!rawStatus) {
    return { status: null as StatusDetail | null, isLoading: statusId !== undefined && rawStatus === undefined };
  }

  const status: StatusDetail = {
    name: rawStatus.user?.name ?? "User",
    avatar: rawStatus.user?.image ?? "",
    time: new Date(rawStatus.createdAt).toLocaleTimeString(),
    mediaType: rawStatus.type,
    media: rawStatus.storageId
      ? [{ id: rawStatus._id, url: rawStatus.content, type: rawStatus.type === "video" ? "video" : "photo" }]
      : [],
  };

  return { status, isLoading: false };
};

export function StatusDetailView({ statusId }: StatusDetailViewProps) {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const { status, isLoading } = useStatusDetail(statusId);

  // Empty state - no status selected
  if (!statusId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <ImageIcon className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-xl font-medium text-foreground mb-2">
            Status updates
          </h2>
          <p className="text-muted-foreground text-sm">
            Select a status to view photos and videos
          </p>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading status...</div>
      </div>
    );
  }

  // No status found
  if (!status) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
            <ImageIcon className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-medium text-foreground mb-2">
            Status not found
          </h2>
          <p className="text-muted-foreground text-sm">
            This status may have expired or been deleted.
          </p>
        </div>
      </div>
    );
  }

  const currentMedia = status.media[currentMediaIndex];

  const handlePrevious = () => {
    setCurrentMediaIndex((prev) =>
      prev > 0 ? prev - 1 : status.media.length - 1
    );
  };

  const handleNext = () => {
    setCurrentMediaIndex((prev) =>
      prev < status.media.length - 1 ? prev + 1 : 0
    );
  };

  return (
    <div className="flex-1 flex flex-col bg-black relative">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/70 to-transparent p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getInitials(status.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium text-white">{status.name}</h3>
            <p className="text-sm text-white/70">{status.time}</p>
          </div>
        </div>
      </div>

      {/* Progress bars */}
      <div className="absolute top-16 left-4 right-4 z-10 flex gap-1">
        {status.media.map((_, index) => (
          <div
            key={index}
            className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden"
          >
            <div
              className={`h-full bg-white rounded-full transition-all duration-300 ${index === currentMediaIndex ? 'w-full' : index < currentMediaIndex ? 'w-full' : 'w-0'
                }`}
            />
          </div>
        ))}
      </div>

      {/* Media Content */}
      <div className="flex-1 flex items-center justify-center relative">
        {currentMedia.type === 'photo' ? (
          <Image
            src={currentMedia.url}
            alt="Status"
            fill
            className="object-contain"
            sizes="100vw"
          />
        ) : (
          <div className="relative">
            <video
              src={currentMedia.url}
              className="max-w-full max-h-full object-contain"
              controls={false}
              autoPlay={isPlaying}
            />
            <Button aria-label="Pause"
              variant="ghost"
              size="icon"
              className="absolute inset-0 m-auto w-16 h-16 bg-black/50 text-white hover:bg-black/70"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
            </Button>
          </div>
        )}

        {/* Navigation arrows */}
        {status.media.length > 1 && (
          <>
            <Button aria-label="Previous"
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
              onClick={handlePrevious}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button aria-label="Next"
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
              onClick={handleNext}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
