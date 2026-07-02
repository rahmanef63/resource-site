import React, { useState } from "react";
import { Share2, Link2, Copy, Facebook, Twitter, Linkedin, MessageCircle } from "lucide-react";
import { useShare } from "../hooks/useShare";
import { Modal } from "./Modal";
import { Button } from "@/components/ui/button";

interface ShareButtonsProps {
  url: string;
  title: string;
  description?: string;
  className?: string;
  variant?: "default" | "compact";
}

export const ShareButtons: React.FC<ShareButtonsProps> = ({
  url,
  title,
  description,
  className = "",
  variant = "default",
}) => {
  const { share, copyToClipboard } = useShare();
  const [showModal, setShowModal] = useState(false);

  const fullUrl = url.startsWith("http") ? url : `${window.location.origin}${url}`;

  const shareToSocial = (platform: string) => {
    const encodedUrl = encodeURIComponent(fullUrl);
    const encodedTitle = encodeURIComponent(title);
    const encodedDesc = encodeURIComponent(description || title);

    const urls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    };

    if (urls[platform]) {
      window.open(urls[platform], "_blank", "width=600,height=400");
    }
  };

  if (variant === "compact") {
    return (
      <>
        <div className={`flex gap-2 ${className}`}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowModal(true)}
            title="Share"
          >
            <Share2 className="w-4 h-4" />
          </Button>
        </div>

        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Share" size="sm">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => shareToSocial("facebook")}
                className="flex items-center gap-2 px-4 py-3 h-auto"
              >
                <Facebook className="w-5 h-5 text-blue-600" />
                <span>Facebook</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => shareToSocial("twitter")}
                className="flex items-center gap-2 px-4 py-3 h-auto"
              >
                <Twitter className="w-5 h-5 text-sky-500" />
                <span>Twitter</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => shareToSocial("linkedin")}
                className="flex items-center gap-2 px-4 py-3 h-auto"
              >
                <Linkedin className="w-5 h-5 text-blue-700" />
                <span>LinkedIn</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => shareToSocial("whatsapp")}
                className="flex items-center gap-2 px-4 py-3 h-auto"
              >
                <MessageCircle className="w-5 h-5 text-green-600" />
                <span>WhatsApp</span>
              </Button>
            </div>
            <div className="pt-3 border-t border-border">
              <Button
                onClick={() => {
                  copyToClipboard(fullUrl, title);
                  setShowModal(false);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 h-auto"
              >
                <Copy className="w-5 h-5" />
                <span>Copy Link</span>
              </Button>
            </div>
          </div>
        </Modal>
      </>
    );
  }

  return (
    <>
      <div className={`flex gap-2 ${className}`}>
        <Button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2"
        >
          <Share2 className="w-4 h-4" />
          <span>Share</span>
        </Button>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Share" size="sm">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={() => shareToSocial("facebook")}
              className="flex items-center gap-2 px-4 py-3 h-auto"
            >
              <Facebook className="w-5 h-5 text-blue-600" />
              <span>Facebook</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => shareToSocial("twitter")}
              className="flex items-center gap-2 px-4 py-3 h-auto"
            >
              <Twitter className="w-5 h-5 text-sky-500" />
              <span>Twitter</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => shareToSocial("linkedin")}
              className="flex items-center gap-2 px-4 py-3 h-auto"
            >
              <Linkedin className="w-5 h-5 text-blue-700" />
              <span>LinkedIn</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => shareToSocial("whatsapp")}
              className="flex items-center gap-2 px-4 py-3 h-auto"
            >
              <MessageCircle className="w-5 h-5 text-green-600" />
              <span>WhatsApp</span>
            </Button>
          </div>
          <div className="pt-3 border-t border-border">
            <Button
              onClick={() => {
                copyToClipboard(fullUrl, title);
                setShowModal(false);
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 h-auto"
            >
              <Copy className="w-5 h-5" />
              <span>Copy Link</span>
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
