import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { IconBrandGithub as Github } from "@tabler/icons-react";
import { site } from "@/lib/content/site";
import { Button } from "@/components/ui/button";

export function RepoLink({
  path,
  children,
  variant = "outline",
}: {
  path?: string;
  children?: React.ReactNode;
  variant?: "default" | "outline" | "ghost";
}) {
  const href = path ? `${site.repo}/tree/main/${path}` : site.repo;
  return (
    <Button asChild variant={variant} size="sm" className="gap-2">
      <Link href={href} target="_blank" rel="noopener noreferrer">
        <Github className="size-4" />
        {children ?? "View source"}
        <ExternalLink className="size-3 opacity-60" />
      </Link>
    </Button>
  );
}
