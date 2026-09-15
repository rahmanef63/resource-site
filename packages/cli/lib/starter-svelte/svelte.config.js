import adapter from "@sveltejs/adapter-node";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter(),
    alias: {
      "@": ".",
      "@/features/*": "frontend/slices/*",
      "@/shared/*": "lib/shared/*",
      "@/convex/*": "src/convex/*"
    }
  }
};

export default config;
