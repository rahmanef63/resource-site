import { useToast } from "@/hooks/use-toast";

export const useShare = () => {
  const { toast } = useToast();

  const fallbackCopy = (url: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = url;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand("copy");
      textArea.remove();
      toast({
        title: "Link copied!",
        description: "The link has been copied to your clipboard",
      });
    } catch (error) {
      textArea.remove();
      console.error("Failed to copy link:", error);
      toast({
        title: "Copy failed",
        description: "Please copy the link manually: " + url,
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = async (url: string, title?: string) => {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(url);
        toast({
          title: "Link copied!",
          description: "The link has been copied to your clipboard",
        });
      } catch (error) {
        console.error("Clipboard API failed, using fallback:", error);
        fallbackCopy(url);
      }
    } else {
      fallbackCopy(url);
    }
  };

  const share = async (url: string, title: string, text?: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: text || title,
          url,
        });
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Share API failed:", error);
          await copyToClipboard(url, title);
        }
      }
    } else {
      await copyToClipboard(url, title);
    }
  };

  return { share, copyToClipboard };
};
