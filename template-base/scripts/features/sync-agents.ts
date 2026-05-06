import { existsSync, writeFileSync } from "fs"
import { join, relative } from "path"
import { getAllFeatures } from "../../frontend/shared/lib/features/registry.server"

const rootDir = process.cwd()

function syncAgents() {
    console.log("🤖 Syncing Agent Registries...")

    const features = getAllFeatures()
    const agents = features.filter(f => f.agent)

    console.log(`   Found ${agents.length} features with agent definitions.`)

    const backendBindingsRegistryDir = join(rootDir, "convex", "bindings", "ai")
    const backendBindingsRegistryPath = join(backendBindingsRegistryDir, "backend-agent-registry.generated.ts")
    const backendSharedRegistryDir = join(rootDir, "convex", "shared", "ai")
    const backendSharedRegistryPath = join(backendSharedRegistryDir, "registry.ts")
    const backendFeatureRegistryDir = join(rootDir, "convex", "features", "ai")
    const backendFeatureRegistryPath = join(backendFeatureRegistryDir, "registry.ts")
    const backendImports: string[] = []
    const backendEntries: string[] = []

    const frontendBindingsRegistryDir = join(rootDir, "frontend", "shared", "bindings", "ai")
    const frontendBindingsRegistryPath = join(frontendBindingsRegistryDir, "frontend-agent-registry.generated.ts")
    const frontendSharedRegistryDir = join(rootDir, "frontend", "shared", "ai")
    const frontendSharedRegistryPath = join(frontendSharedRegistryDir, "registry.ts")
    const frontendFeatureRegistryDir = join(rootDir, "frontend", "slices", "ai")
    const frontendFeatureRegistryPath = join(frontendFeatureRegistryDir, "registry.ts")
    const frontendImports: string[] = []
    const frontendEntries: string[] = []

    agents.forEach(feature => {
        if (!feature.agent?.definitionPath) {
            return
        }

        const fullDefPath = join(rootDir, feature.agent.definitionPath)
        if (!existsSync(fullDefPath)) {
            console.warn(`   ⚠️  [${feature.id}] Backend definition not found at: ${feature.agent.definitionPath}`)
        } else {
            let backendRel = relative(backendBindingsRegistryDir, fullDefPath).replace(/\\/g, "/").replace(/\.ts$/, "")
            if (!backendRel.startsWith(".")) backendRel = "./" + backendRel

            const importName = `${feature.id.replace(/-/g, "_")}Agent`
            backendImports.push(`import { agent as ${importName} } from "${backendRel}";`)
            backendEntries.push(`  "${feature.id}": ${importName},`)
        }

        const frontendAgentDir = join(rootDir, "frontend", "slices", feature.id, "agent")
        const frontendAgentIndex = join(frontendAgentDir, "index.ts")
        if (!existsSync(frontendAgentIndex)) {
            return
        }

        let frontendRel = relative(frontendBindingsRegistryDir, frontendAgentIndex).replace(/\\/g, "/").replace(/\.ts$/, "")
        if (!frontendRel.startsWith(".")) frontendRel = "./" + frontendRel

        const importName = `${feature.id.replace(/-/g, "_")}Frontend`
        frontendImports.push(`import { agent as ${importName} } from "${frontendRel}";`)
        frontendEntries.push(`  "${feature.id}": ${importName},`)
    })

    const backendContent = `// AUTO-GENERATED - DO NOT EDIT
// Run 'pnpm run syncagent:all' to update

import { FeatureAgent } from "../../platform/ai/lib/types";
${backendImports.join("\n")}

export const featureAgentRegistry: Record<string, FeatureAgent> = {
${backendEntries.join("\n")}
};
`

    if (!existsSync(backendBindingsRegistryDir) || !existsSync(backendFeatureRegistryDir) || !existsSync(backendSharedRegistryDir)) {
        console.error("❌ Backend AI directories not found")
        process.exit(1)
    }

    writeFileSync(backendBindingsRegistryPath, backendContent)
    writeFileSync(
        backendFeatureRegistryPath,
        `/**\n * Feature shell compatibility barrel.\n */\n\nexport * from "../../bindings/ai/backend-agent-registry.generated";\n`,
    )
    writeFileSync(
        backendSharedRegistryPath,
        `/**\n * Compatibility barrel.\n * Generated application bindings now live in \`convex/bindings/ai/*\`.\n */\n\nexport * from "../../bindings/ai/backend-agent-registry.generated";\n`,
    )
    console.log("   ✓ Backend registry generated at: convex/bindings/ai/backend-agent-registry.generated.ts")
    console.log("   ✓ Backend shared compatibility barrel updated at: convex/shared/ai/registry.ts")
    console.log("   ✓ Backend feature shell updated at: convex/features/ai/registry.ts")

    const frontendContent = `// AUTO-GENERATED - DO NOT EDIT
// Run 'pnpm run syncagent:all' to update

// Defines the frontend metadata for agents
export interface AgentFallback {
    name: string;
    description: string;
    icon: string;
    prompts?: any;
}

${frontendImports.join("\n")}

export const frontendAgentRegistry: Record<string, any> = {
${frontendEntries.join("\n")}
};
`

    if (!existsSync(frontendBindingsRegistryDir) || !existsSync(frontendSharedRegistryDir)) {
        console.warn("⚠️  Frontend AI directories not found")
        return
    }

    writeFileSync(frontendBindingsRegistryPath, frontendContent)
    writeFileSync(
        frontendFeatureRegistryPath,
        `/**\n * Feature shell compatibility barrel.\n */\n\nexport * from "../../shared/bindings/ai/frontend-agent-registry.generated";\n`,
    )
    writeFileSync(
        frontendSharedRegistryPath,
        `/**\n * Generated application bindings live in \`frontend/shared/bindings/ai/*\`.\n */\n\nexport type { AgentFallback } from "@/frontend/shared/bindings/ai/frontend-agent-registry.generated";\nexport { frontendAgentRegistry } from "@/frontend/shared/bindings/ai/frontend-agent-registry.generated";\n`,
    )
    console.log("   ✓ Frontend registry generated at: frontend/shared/bindings/ai/frontend-agent-registry.generated.ts")
    console.log("   ✓ Frontend shared compatibility barrel updated at: frontend/shared/ai/registry.ts")
    console.log("   ✓ Frontend feature shell updated at: frontend/slices/ai/registry.ts")
}

syncAgents()
