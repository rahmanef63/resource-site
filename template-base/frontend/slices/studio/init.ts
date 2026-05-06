/**
 * Studio Feature Initialization
 */

import { registerStudioComponents, registerStudioLibraryTabs } from './registry';
import { registerFeatureSettings } from "@/frontend/shared/settings";
import { Layers3 } from "lucide-react";
import { AutomationSettings } from "./settings/AutomationSettings";
import { BuilderSettings } from "./settings/BuilderSettings";
import { StudioLLMSettings } from "./settings/StudioLLMSettings";
import { registerStudioAgent } from "./agent";
import { Cpu } from "lucide-react";

registerFeatureSettings("studio", () => [
    {
        id: "studio-builder",
        label: "Builder",
        icon: Layers3,
        order: 100,
        component: BuilderSettings,
    },
    {
        id: "studio-automation",
        label: "Automation",
        icon: Layers3,
        order: 101,
        component: AutomationSettings,
    },
    {
        id: "studio-llm",
        label: "AI Builder",
        icon: Cpu,
        order: 102,
        component: StudioLLMSettings,
    },
]);

registerStudioAgent();

export function initStudio(registry: {
    registerComponent: (config: any) => void;
    registerFeatureTabs: (feature: string, tabs: any[]) => void;
}): void {
    registerStudioComponents(registry.registerComponent);
    registerStudioLibraryTabs(registry.registerFeatureTabs);
}

export default initStudio;
