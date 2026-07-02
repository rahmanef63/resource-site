import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/frontend/shared/foundation/utils/convex/any-api";
import { useWorkspaceId } from "../../../shared/hooks/useWorkspaceId";
import { Button } from "../../../shared/components/Button";
import { Input, Textarea } from "../../../shared/components/Form";
import { ImageEditor } from "../../../shared/components/ImageEditor";
import { SkeletonText, Skeleton } from "../../../shared/components/Skeleton";
import { Save } from "lucide-react";
import ErrorBoundary from "../../../shared/components/ErrorBoundary";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { logger } from "../../../shared/utils/logger";

type Section = "hero" | "about";
type Locale = "id" | "en" | "ar";

interface HeroData {
  title: string;
  description: string;
  image: string;
  ctaText: string;
  ctaLink: string;
}

interface AboutData {
  title: string;
  description: string;
  image: string;
}

const EMPTY_HERO: HeroData = {
  title: "",
  description: "",
  image: "",
  ctaText: "",
  ctaLink: "",
};

const EMPTY_ABOUT: AboutData = {
  title: "",
  description: "",
  image: "",
};

const LOCALES: Locale[] = ["id", "en", "ar"];
const SECTIONS: Section[] = ["hero", "about"];

/** Map the stored structured `content` doc to the flat form shape. */
function contentToHero(content: any): HeroData {
  if (!content) return { ...EMPTY_HERO };
  return {
    title: content.title ?? "",
    description: content.description ?? "",
    image: content.media?.[0]?.url ?? "",
    ctaText: content.primaryCta?.text ?? "",
    ctaLink: content.primaryCta?.url ?? "",
  };
}

function contentToAbout(content: any): AboutData {
  if (!content) return { ...EMPTY_ABOUT };
  return {
    title: content.title ?? "",
    description: content.description ?? "",
    image: content.media?.[0]?.url ?? "",
  };
}

/** Shape the flat form back into the nested `content` payload. */
function heroToContent(data: HeroData) {
  const payload: any = {
    type: "hero",
    title: data.title,
    description: data.description,
  };
  if (data.image) {
    payload.media = [{ type: "image", url: data.image }];
  }
  if (data.ctaText || data.ctaLink) {
    payload.primaryCta = {
      text: data.ctaText,
      url: data.ctaLink,
    };
  }
  return payload;
}

function aboutToContent(data: AboutData) {
  const payload: any = {
    type: "about",
    title: data.title,
    description: data.description,
  };
  if (data.image) {
    payload.media = [{ type: "image", url: data.image }];
  }
  return payload;
}

export default function AdminLanding() {
  const { toast } = useToast();
  const workspaceId = useWorkspaceId();
  const [activeSection, setActiveSection] = useState<Section>("hero");
  const [activeLocale, setActiveLocale] = useState<Locale>("id");
  const [saving, setSaving] = useState(false);

  const contentsData = useQuery(
    api.features.cmsLite.landing.api.queries.listContents,
    workspaceId ? { workspaceId: String(workspaceId) } : "skip"
  );

  const updateContent = useMutation(
    api.features.cmsLite.landing.api.mutations.updateContent
  );

  const loading = !workspaceId || contentsData === undefined;

  const [heroData, setHeroData] = useState<Record<Locale, HeroData>>({
    id: { ...EMPTY_HERO },
    en: { ...EMPTY_HERO },
    ar: { ...EMPTY_HERO },
  });
  const [aboutData, setAboutData] = useState<Record<Locale, AboutData>>({
    id: { ...EMPTY_ABOUT },
    en: { ...EMPTY_ABOUT },
    ar: { ...EMPTY_ABOUT },
  });

  const contentsByKey = useMemo(() => {
    const map = new Map<string, any>();
    for (const row of contentsData ?? []) {
      map.set(`${row.section}::${row.locale}`, row);
    }
    return map;
  }, [contentsData]);

  // Hydrate the local form state whenever backend data refreshes.
  useEffect(() => {
    if (!contentsData) return;
    const nextHero: Record<Locale, HeroData> = {
      id: { ...EMPTY_HERO },
      en: { ...EMPTY_HERO },
      ar: { ...EMPTY_HERO },
    };
    const nextAbout: Record<Locale, AboutData> = {
      id: { ...EMPTY_ABOUT },
      en: { ...EMPTY_ABOUT },
      ar: { ...EMPTY_ABOUT },
    };
    for (const locale of LOCALES) {
      const heroRow = contentsByKey.get(`hero::${locale}`);
      if (heroRow) nextHero[locale] = contentToHero(heroRow.content);
      const aboutRow = contentsByKey.get(`about::${locale}`);
      if (aboutRow) nextAbout[locale] = contentToAbout(aboutRow.content);
    }
    setHeroData(nextHero);
    setAboutData(nextAbout);
  }, [contentsData, contentsByKey]);

  const handleSave = async () => {
    if (!workspaceId) return;
    setSaving(true);
    logger.save("landing page content (semua bahasa)", "database/landingContent");
    try {
      const promises: Promise<any>[] = [];
      for (const locale of LOCALES) {
        promises.push(
          updateContent({
            workspaceId: String(workspaceId),
            section: "hero",
            locale,
            content: heroToContent(heroData[locale]),
            publish: true,
          })
        );
        promises.push(
          updateContent({
            workspaceId: String(workspaceId),
            section: "about",
            locale,
            content: aboutToContent(aboutData[locale]),
            publish: true,
          })
        );
      }
      await Promise.all(promises);
      logger.saved("landing page content", "database/landingContent", `${SECTIONS.length * LOCALES.length} entries`);
      toast({ title: "Landing page content updated" });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error("menyimpan", "landing page content", err);
      toast({
        title: "Failed to save",
        description: message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const currentData: HeroData | AboutData =
    activeSection === "hero" ? heroData[activeLocale] : aboutData[activeLocale];

  const updateCurrentData = (updates: Partial<HeroData | AboutData>) => {
    if (activeSection === "hero") {
      setHeroData({
        ...heroData,
        [activeLocale]: {
          ...heroData[activeLocale],
          ...(updates as Partial<HeroData>),
        },
      });
    } else {
      setAboutData({
        ...aboutData,
        [activeLocale]: {
          ...aboutData[activeLocale],
          ...(updates as Partial<AboutData>),
        },
      });
    }
  };

  if (loading) {
    return (
      <div>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Landing Page Content</h1>
        </div>
        <div className="space-y-6">
          <Skeleton className="h-12 w-full" />
          <SkeletonText lines={5} />
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Landing Page Content</h1>
          <Button onClick={handleSave} isLoading={saving}>
            <Save className="w-4 h-4" />
            Save All Changes
          </Button>
        </div>

        <div className="mb-6 flex gap-4">
          <div className="w-48">
            <label className="block text-sm font-medium mb-2">Section</label>
            <Select
              value={activeSection}
              onValueChange={(value) => setActiveSection(value as Section)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hero">Hero</SelectItem>
                <SelectItem value="about">About</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-48">
            <label className="block text-sm font-medium mb-2">Language</label>
            <Select
              value={activeLocale}
              onValueChange={(value) => setActiveLocale(value as Locale)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="id">ID (Indonesian)</SelectItem>
                <SelectItem value="en">EN (English)</SelectItem>
                <SelectItem value="ar">AR (Arabic)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="bg-card border rounded-lg p-6 space-y-6">
          <Input
            label="Title"
            value={currentData.title || ""}
            onChange={(value) => updateCurrentData({ title: value })}
            required
          />

          <Textarea
            label="Description"
            value={currentData.description || ""}
            onChange={(value) => updateCurrentData({ description: value })}
            rows={4}
            required
          />

          <div>
            <label className="block text-sm font-medium mb-2">Image</label>
            <ImageEditor
              value={(currentData as any).image || ""}
              onChange={(value) => updateCurrentData({ image: value })}
            />
          </div>

          {activeSection === "hero" && (
            <>
              <Input
                label="CTA Button Text"
                value={(currentData as HeroData).ctaText || ""}
                onChange={(value) => updateCurrentData({ ctaText: value })}
              />

              <Input
                label="CTA Button Link"
                value={(currentData as HeroData).ctaLink || ""}
                onChange={(value) => updateCurrentData({ ctaLink: value })}
                placeholder="/portfolio"
              />
            </>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}
