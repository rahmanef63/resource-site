/**
 * Media gallery component
 * @module shared/chat/components/MediaGallery
 */

import React from "react";
import Image from "next/image";
import type { Message, Attachment } from "../types/message";

export type MediaGalleryProps = {
  messages: Message[];
  onAttachmentClick?: (attachment: Attachment) => void;
};

/**
 * Gallery view of all media attachments
 */
export function MediaGallery({ messages, onAttachmentClick }: MediaGalleryProps) {
  const [filter, setFilter] = React.useState<Attachment["kind"] | "all">("all");

  // Extract all attachments from messages
  const allAttachments = messages.flatMap((msg) =>
    (msg.content.attachments || []).map((att) => ({
      ...att,
      messageId: msg.id,
      timestamp: msg.createdAt,
    }))
  );

  // Filter by type
  const filteredAttachments =
    filter === "all"
      ? allAttachments
      : allAttachments.filter((att) => att.kind === filter);

  // Group by type
  const groupedByType = {
    image: allAttachments.filter((a) => a.kind === "image").length,
    video: allAttachments.filter((a) => a.kind === "video").length,
    audio: allAttachments.filter((a) => a.kind === "audio").length,
    file: allAttachments.filter((a) => a.kind === "file").length,
  };

  return (
    <div className="chat-media-gallery">
      {/* Filter tabs */}
      <div className="chat-media-gallery-tabs">
        <button
          className={filter === "all" ? "active" : ""}
          onClick={() => setFilter("all")}
        >
          All ({allAttachments.length})
        </button>
        <button
          className={filter === "image" ? "active" : ""}
          onClick={() => setFilter("image")}
        >
          Images ({groupedByType.image})
        </button>
        <button
          className={filter === "video" ? "active" : ""}
          onClick={() => setFilter("video")}
        >
          Videos ({groupedByType.video})
        </button>
        <button
          className={filter === "file" ? "active" : ""}
          onClick={() => setFilter("file")}
        >
          Files ({groupedByType.file})
        </button>
      </div>

      {/* Gallery grid */}
      <div className="chat-media-gallery-grid">
        {filteredAttachments.length === 0 ? (
          <div className="chat-media-gallery-empty">No media found</div>
        ) : (
          filteredAttachments.map((att) => (
            <div
              key={att.id}
              className="chat-media-gallery-item"
              onClick={() => onAttachmentClick?.(att)}
            >
              {att.kind === "image" ? (
                <Image
                  src={att.url}
                  alt={att.name || "Image"}
                  width={320}
                  height={320}
                  className="h-full w-full object-cover"
                  sizes="320px"
                />
              ) : att.kind === "video" ? (
                <video src={att.url} />
              ) : (
                <div className="chat-media-gallery-file">
                  <span>{att.name || "File"}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
