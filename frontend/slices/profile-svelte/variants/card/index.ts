export { default as AboutProfile } from "./app.svelte";
export { default as FaqList } from "./components/FaqList.svelte";
export { aboutProfileConfig, type AboutProfileConfig } from "./config";
export {
  configureAbout,
  initials,
  readAboutProfile,
  type AboutFaq,
  type AboutLink,
  type AboutProfile as AboutProfileData,
} from "@/features/profile/lib/core";
