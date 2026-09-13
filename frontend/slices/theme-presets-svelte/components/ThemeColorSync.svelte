<script lang="ts">
  import { onMount } from "svelte";

  onMount(() => {
    const ensureMeta = (): HTMLMetaElement => {
      let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]:not([media])');
      if (!meta) {
        meta = document.createElement("meta");
        meta.name = "theme-color";
        document.head.appendChild(meta);
      }
      return meta;
    };

    const update = () => {
      try {
        if (!document.body) return;
        const bg = window.getComputedStyle(document.body).backgroundColor;
        if (!bg || bg === "rgba(0, 0, 0, 0)" || bg === "transparent") return;
        ensureMeta().setAttribute("content", bg);
      } catch {
        // Browser chrome simply keeps its current color.
      }
    };

    update();
    const observer = new MutationObserver(() => requestAnimationFrame(update));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme", "data-preset", "style"],
    });
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onSchemeChange = () => requestAnimationFrame(update);
    media.addEventListener?.("change", onSchemeChange);

    return () => {
      observer.disconnect();
      media.removeEventListener?.("change", onSchemeChange);
    };
  });
</script>
