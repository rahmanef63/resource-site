#!/usr/bin/env node
/**
 * Feature Analyzer Script
 *
 * Menganalisis informasi lengkap tentang suatu feature:
 * - File structure (frontend + convex)
 * - Core features & capabilities
 * - CRUD operations (Convex)
 * - Permissions & RBAC
 * - Dependencies & imports
 *
 * Usage:
 *   pnpm run analyze:feature <feature-name>  # Langsung analyze feature
 *   pnpm run analyze:feature --list          # Interactive selection
 */

import prompts from 'prompts'
import { glob } from 'glob'
import path from 'path'
import fs from 'fs'
import { getAllFeatures, getFeatureById, getFeatureSourceDir } from '../../frontend/shared/lib/features/registry.server'

interface FeatureAnalysis {
  basic: {
    id: string
    name: string
    description: string
    category: string
    status: string
    version: string
  }
  structure: {
    frontend: {
      path: string
      files: string[]
      components: string[]
      hooks: string[]
      stores: string[]
      types: string[]
    }
    convex: {
      path: string
      files: string[]
      queries: ConvexFunction[]
      mutations: ConvexFunction[]
      actions: ConvexFunction[]
    }
  }
  capabilities: {
    hasUI: boolean
    hasConvex: boolean
    hasTests: boolean
    hasSettings: boolean
    permissions: string[]
  }
  dependencies: {
    imports: string[]
    exports: string[]
  }
}

interface ConvexFunction {
  name: string
  type: 'query' | 'mutation' | 'action'
  file: string
  description?: string
  params?: string
  returns?: string
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getRelativePath(absolutePath: string): string {
  return path.relative(process.cwd(), absolutePath)
}

function analyzeFileStructure(featureId: string): FeatureAnalysis['structure'] {
  const frontendPath = path.join(process.cwd(), 'frontend', 'slices', featureId)

  // Try both convex/features/{featureId} and convex/{featureId}
  let convexPath = path.join(process.cwd(), 'convex', 'features', featureId)
  if (!fs.existsSync(convexPath)) {
    convexPath = path.join(process.cwd(), 'convex', featureId)
  }

  // Analyze frontend structure
  const frontendFiles = fs.existsSync(frontendPath)
    ? glob.sync('**/*', { cwd: frontendPath, nodir: true })
    : []

  const components = frontendFiles.filter(f =>
    (f.includes('components') || f.includes('views')) && (f.endsWith('.tsx') || f.endsWith('.jsx'))
  )
  const hooks = frontendFiles.filter(f =>
    (f.includes('hooks') || path.basename(f).startsWith('use')) && (f.endsWith('.ts') || f.endsWith('.tsx'))
  )
  const stores = frontendFiles.filter(f =>
    (f.includes('store') || f.includes('state')) && f.endsWith('.ts')
  )
  const types = frontendFiles.filter(f =>
    f.endsWith('.d.ts') || f.includes('types') || f.includes('type.ts')
  )

  // Analyze convex structure
  const convexFiles = fs.existsSync(convexPath)
    ? glob.sync('**/*.ts', { cwd: convexPath })
    : []

  const queries = analyzeConvexFunctions(convexPath, convexFiles, 'query')
  const mutations = analyzeConvexFunctions(convexPath, convexFiles, 'mutation')
  const actions = analyzeConvexFunctions(convexPath, convexFiles, 'action')

  return {
    frontend: {
      path: getRelativePath(frontendPath),
      files: frontendFiles,
      components,
      hooks,
      stores,
      types,
    },
    convex: {
      path: getRelativePath(convexPath),
      files: convexFiles,
      queries,
      mutations,
      actions,
    },
  }
}

function analyzeConvexFunctions(
  convexPath: string,
  files: string[],
  type: 'query' | 'mutation' | 'action'
): ConvexFunction[] {
  const functions: ConvexFunction[] = []

  for (const file of files) {
    const filePath = path.join(convexPath, file)
    if (!fs.existsSync(filePath)) continue

    const content = fs.readFileSync(filePath, 'utf-8')

    // Regex untuk detect export const/function dengan query/mutation/action
    const regex = new RegExp(
      `export\\s+(?:const|function)\\s+(\\w+)\\s*=\\s*${type}`,
      'g'
    )

    let match
    while ((match = regex.exec(content)) !== null) {
      const functionName = match[1]

      // Extract JSDoc description if exists
      const lines = content.slice(0, match.index).split('\n')
      let description: string | undefined
      for (let i = lines.length - 1; i >= 0; i--) {
        const line = lines[i].trim()
        if (line.startsWith('*') && !line.startsWith('*/')) {
          description = line.replace(/^\*\s*/, '').trim()
          break
        }
        if (!line.startsWith('*') && line !== '') break
      }

      functions.push({
        name: functionName,
        type,
        file: getRelativePath(filePath),
        description,
      })
    }
  }

  return functions
}

function analyzeDependencies(featureId: string): FeatureAnalysis['dependencies'] {
  const frontendPath = path.join(process.cwd(), 'frontend', 'slices', featureId)
  const imports = new Set<string>()
  const exports = new Set<string>()

  if (!fs.existsSync(frontendPath)) {
    return { imports: [], exports: [] }
  }

  const files = glob.sync('**/*.{ts,tsx}', { cwd: frontendPath })

  for (const file of files) {
    const content = fs.readFileSync(path.join(frontendPath, file), 'utf-8')

    // Extract imports
    const importRegex = /import\s+.*\s+from\s+['"](.+)['"]/g
    let match
    while ((match = importRegex.exec(content)) !== null) {
      const importPath = match[1]
      // Filter untuk external dependencies (bukan relative imports)
      if (!importPath.startsWith('.') && !importPath.startsWith('@/')) {
        imports.add(importPath.split('/')[0]) // Get package name only
      }
    }

    // Extract exports
    const exportRegex = /export\s+(?:const|function|class|type|interface)\s+(\w+)/g
    while ((match = exportRegex.exec(content)) !== null) {
      exports.add(match[1])
    }
  }

  return {
    imports: Array.from(imports).sort(),
    exports: Array.from(exports).sort(),
  }
}

function analyzeFeature(featureId: string): FeatureAnalysis | null {
  const feature = getFeatureById(featureId)
  if (!feature) {
    console.error(`❌ Feature "${featureId}" tidak ditemukan`)
    return null
  }

  const structure = analyzeFileStructure(featureId)
  const dependencies = analyzeDependencies(featureId)

  return {
    basic: {
      id: feature.id,
      name: feature.name,
      description: feature.description,
      category: feature.ui.category,
      status: feature.status.state,
      version: feature.technical.version,
    },
    structure,
    capabilities: {
      hasUI: feature.technical.hasUI,
      hasConvex: feature.technical.hasConvex,
      hasTests: feature.technical.hasTests,
      hasSettings: feature.hasSettings || false,
      permissions: feature.permissions || [],
    },
    dependencies,
  }
}

// ============================================================================
// DISPLAY FUNCTIONS
// ============================================================================

function displayAnalysis(analysis: FeatureAnalysis) {
  console.log('\n' + '='.repeat(80))
  console.log(`📦 Feature Analysis: ${analysis.basic.name}`)
  console.log('='.repeat(80) + '\n')

  // Basic Info
  console.log('📋 BASIC INFORMATION')
  console.log('─'.repeat(80))
  console.log(`   ID:          ${analysis.basic.id}`)
  console.log(`   Name:        ${analysis.basic.name}`)
  console.log(`   Description: ${analysis.basic.description}`)
  console.log(`   Category:    ${analysis.basic.category}`)
  console.log(`   Status:      ${analysis.basic.status}`)
  console.log(`   Version:     ${analysis.basic.version}\n`)

  // Capabilities
  console.log('⚡ CAPABILITIES')
  console.log('─'.repeat(80))
  console.log(`   Has UI:       ${analysis.capabilities.hasUI ? '✅' : '❌'}`)
  console.log(`   Has Convex:   ${analysis.capabilities.hasConvex ? '✅' : '❌'}`)
  console.log(`   Has Tests:    ${analysis.capabilities.hasTests ? '✅' : '❌'}`)
  console.log(`   Has Settings: ${analysis.capabilities.hasSettings ? '✅' : '❌'}`)
  if (analysis.capabilities.permissions.length > 0) {
    console.log(`   Permissions:  ${analysis.capabilities.permissions.join(', ')}`)
  }
  console.log()

  // Frontend Structure
  console.log('🎨 FRONTEND STRUCTURE')
  console.log('─'.repeat(80))
  console.log(`   Path: ${analysis.structure.frontend.path}`)
  console.log(`   Total Files: ${analysis.structure.frontend.files.length}`)
  console.log(`   Components: ${analysis.structure.frontend.components.length}`)
  console.log(`   Hooks: ${analysis.structure.frontend.hooks.length}`)
  console.log(`   Stores: ${analysis.structure.frontend.stores.length}`)
  console.log(`   Types: ${analysis.structure.frontend.types.length}\n`)

  if (analysis.structure.frontend.components.length > 0) {
    console.log('   📁 Components:')
    analysis.structure.frontend.components.forEach(c => console.log(`      - ${c}`))
    console.log()
  }

  if (analysis.structure.frontend.hooks.length > 0) {
    console.log('   🪝 Hooks:')
    analysis.structure.frontend.hooks.forEach(h => console.log(`      - ${h}`))
    console.log()
  }

  // Convex Structure
  if (analysis.capabilities.hasConvex) {
    console.log('🔧 CONVEX BACKEND')
    console.log('─'.repeat(80))
    console.log(`   Path: ${analysis.structure.convex.path}`)
    console.log(`   Total Files: ${analysis.structure.convex.files.length}`)
    console.log(`   Queries: ${analysis.structure.convex.queries.length}`)
    console.log(`   Mutations: ${analysis.structure.convex.mutations.length}`)
    console.log(`   Actions: ${analysis.structure.convex.actions.length}\n`)

    if (analysis.structure.convex.queries.length > 0) {
      console.log('   📖 Queries (Read):')
      analysis.structure.convex.queries.forEach(q => {
        console.log(`      - ${q.name}`)
        if (q.description) console.log(`        ${q.description}`)
        console.log(`        File: ${q.file}`)
      })
      console.log()
    }

    if (analysis.structure.convex.mutations.length > 0) {
      console.log('   ✏️  Mutations (Write):')
      analysis.structure.convex.mutations.forEach(m => {
        console.log(`      - ${m.name}`)
        if (m.description) console.log(`        ${m.description}`)
        console.log(`        File: ${m.file}`)
      })
      console.log()
    }

    if (analysis.structure.convex.actions.length > 0) {
      console.log('   ⚡ Actions:')
      analysis.structure.convex.actions.forEach(a => {
        console.log(`      - ${a.name}`)
        if (a.description) console.log(`        ${a.description}`)
        console.log(`        File: ${a.file}`)
      })
      console.log()
    }
  }

  // Dependencies
  if (analysis.dependencies.imports.length > 0) {
    console.log('📦 DEPENDENCIES')
    console.log('─'.repeat(80))
    console.log('   External Packages:')
    analysis.dependencies.imports.forEach(imp => console.log(`      - ${imp}`))
    console.log()
  }

  // Exports
  if (analysis.dependencies.exports.length > 0 && analysis.dependencies.exports.length <= 20) {
    console.log('📤 EXPORTS')
    console.log('─'.repeat(80))
    console.log(`   Total Exports: ${analysis.dependencies.exports.length}`)
    console.log('   Key Exports:')
    analysis.dependencies.exports.slice(0, 10).forEach(exp => console.log(`      - ${exp}`))
    if (analysis.dependencies.exports.length > 10) {
      console.log(`      ... and ${analysis.dependencies.exports.length - 10} more`)
    }
    console.log()
  }

  console.log('='.repeat(80) + '\n')
}

function formatAsMarkdown(analysis: FeatureAnalysis): string {
  const lines: string[] = []

  lines.push(`# Feature Analysis: ${analysis.basic.name}`)
  lines.push('')
  lines.push(`> Generated on ${new Date().toISOString().split('T')[0]}`)
  lines.push('')

  // Basic Information
  lines.push('## 📋 Basic Information')
  lines.push('')
  lines.push(`- **ID:** \`${analysis.basic.id}\``)
  lines.push(`- **Name:** ${analysis.basic.name}`)
  lines.push(`- **Description:** ${analysis.basic.description}`)
  lines.push(`- **Category:** ${analysis.basic.category}`)
  lines.push(`- **Status:** ${analysis.basic.status}`)
  lines.push(`- **Version:** ${analysis.basic.version}`)
  lines.push('')

  // Capabilities
  lines.push('## ⚡ Capabilities')
  lines.push('')
  lines.push(`- **Has UI:** ${analysis.capabilities.hasUI ? '✅ Yes' : '❌ No'}`)
  lines.push(`- **Has Convex:** ${analysis.capabilities.hasConvex ? '✅ Yes' : '❌ No'}`)
  lines.push(`- **Has Tests:** ${analysis.capabilities.hasTests ? '✅ Yes' : '❌ No'}`)
  lines.push(`- **Has Settings:** ${analysis.capabilities.hasSettings ? '✅ Yes' : '❌ No'}`)
  if (analysis.capabilities.permissions.length > 0) {
    lines.push(`- **Permissions:**`)
    analysis.capabilities.permissions.forEach(p => lines.push(`  - \`${p}\``))
  }
  lines.push('')

  // Frontend Structure
  lines.push('## 🎨 Frontend Structure')
  lines.push('')
  lines.push(`**Path:** \`${analysis.structure.frontend.path}\``)
  lines.push('')
  lines.push('### Statistics')
  lines.push('')
  lines.push(`- Total Files: **${analysis.structure.frontend.files.length}**`)
  lines.push(`- Components: **${analysis.structure.frontend.components.length}**`)
  lines.push(`- Hooks: **${analysis.structure.frontend.hooks.length}**`)
  lines.push(`- Stores: **${analysis.structure.frontend.stores.length}**`)
  lines.push(`- Types: **${analysis.structure.frontend.types.length}**`)
  lines.push('')

  if (analysis.structure.frontend.components.length > 0) {
    lines.push('### Components')
    lines.push('')
    analysis.structure.frontend.components.forEach(c => {
      lines.push(`- \`${c}\``)
    })
    lines.push('')
  }

  if (analysis.structure.frontend.hooks.length > 0) {
    lines.push('### Hooks')
    lines.push('')
    analysis.structure.frontend.hooks.forEach(h => {
      lines.push(`- \`${h}\``)
    })
    lines.push('')
  }

  if (analysis.structure.frontend.stores.length > 0) {
    lines.push('### State Stores')
    lines.push('')
    analysis.structure.frontend.stores.forEach(s => {
      lines.push(`- \`${s}\``)
    })
    lines.push('')
  }

  // Convex Backend
  if (analysis.capabilities.hasConvex) {
    lines.push('## 🔧 Convex Backend')
    lines.push('')
    lines.push(`**Path:** \`${analysis.structure.convex.path}\``)
    lines.push('')
    lines.push('### Statistics')
    lines.push('')
    lines.push(`- Total Files: **${analysis.structure.convex.files.length}**`)
    lines.push(`- Queries: **${analysis.structure.convex.queries.length}**`)
    lines.push(`- Mutations: **${analysis.structure.convex.mutations.length}**`)
    lines.push(`- Actions: **${analysis.structure.convex.actions.length}**`)
    lines.push('')

    if (analysis.structure.convex.queries.length > 0) {
      lines.push('### 📖 Queries (Read Operations)')
      lines.push('')
      analysis.structure.convex.queries.forEach(q => {
        lines.push(`#### \`${q.name}\``)
        if (q.description) {
          lines.push('')
          lines.push(`> ${q.description}`)
        }
        lines.push('')
        lines.push(`**File:** \`${q.file}\``)
        lines.push('')
      })
    }

    if (analysis.structure.convex.mutations.length > 0) {
      lines.push('### ✏️ Mutations (Write Operations)')
      lines.push('')
      analysis.structure.convex.mutations.forEach(m => {
        lines.push(`#### \`${m.name}\``)
        if (m.description) {
          lines.push('')
          lines.push(`> ${m.description}`)
        }
        lines.push('')
        lines.push(`**File:** \`${m.file}\``)
        lines.push('')
      })
    }

    if (analysis.structure.convex.actions.length > 0) {
      lines.push('### ⚡ Actions')
      lines.push('')
      analysis.structure.convex.actions.forEach(a => {
        lines.push(`#### \`${a.name}\``)
        if (a.description) {
          lines.push('')
          lines.push(`> ${a.description}`)
        }
        lines.push('')
        lines.push(`**File:** \`${a.file}\``)
        lines.push('')
      })
    }
  }

  // Dependencies
  if (analysis.dependencies.imports.length > 0) {
    lines.push('## 📦 Dependencies')
    lines.push('')
    lines.push('### External Packages')
    lines.push('')
    analysis.dependencies.imports.forEach(imp => {
      lines.push(`- \`${imp}\``)
    })
    lines.push('')
  }

  // Exports
  if (analysis.dependencies.exports.length > 0 && analysis.dependencies.exports.length <= 30) {
    lines.push('## 📤 Public API')
    lines.push('')
    lines.push(`Total exports: **${analysis.dependencies.exports.length}**`)
    lines.push('')
    lines.push('### Key Exports')
    lines.push('')
    analysis.dependencies.exports.slice(0, 20).forEach(exp => {
      lines.push(`- \`${exp}\``)
    })
    if (analysis.dependencies.exports.length > 20) {
      lines.push(`- ... and ${analysis.dependencies.exports.length - 20} more`)
    }
    lines.push('')
  }

  // Footer
  lines.push('---')
  lines.push('')
  lines.push(`**Generated by:** Feature Analyzer Script`)
  lines.push(`**Date:** ${new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}`)
  lines.push('')

  return lines.join('\n')
}

function saveToFile(analysis: FeatureAnalysis, outputPath?: string): string {
  const date = new Date().toISOString().split('T')[0] // YYYY-MM-DD
  const defaultPath = path.join(process.cwd(), 'docs', 'features', `${date}-${analysis.basic.id}.md`)
  const filePath = outputPath || defaultPath

  const markdown = formatAsMarkdown(analysis)

  // Ensure directory exists
  const dir = path.dirname(filePath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  fs.writeFileSync(filePath, markdown, 'utf-8')
  return filePath
}

// ============================================================================
// MAIN LOGIC
// ============================================================================

async function selectFeatureInteractive(): Promise<string | null> {
  const features = getAllFeatures()

  if (features.length === 0) {
    console.error('❌ Tidak ada feature yang ditemukan')
    return null
  }

  const choices = features.map(f => ({
    title: `${f.name} (${f.id})`,
    description: `${f.description} [${f.status.state}]`,
    value: f.id,
  }))

  const response = await prompts({
    type: 'autocomplete',
    name: 'featureId',
    message: 'Pilih feature yang ingin dianalisis:',
    choices,
    initial: 0,
  })

  if (!response.featureId) {
    console.log('\n❌ Dibatalkan')
    return null
  }

  return response.featureId
}

async function main() {
  const args = process.argv.slice(2)

  // Show help
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Feature Analyzer CLI

Usage:
  pnpm run analyze:feature <feature-name>   # Langsung analyze feature
  pnpm run analyze:feature --list           # Interactive selection (keyboard up/down)

Examples:
  pnpm run analyze:feature chat             # Analyze chat feature (console only)
  pnpm run analyze:feature chat --save      # Analyze and save to docs/features/{date}-chat.md
  pnpm run analyze:feature --list           # Pilih dari daftar features
  pnpm run analyze:feature cms --save --output custom.md  # Save to custom location

Options:
  --list, -l      Show interactive list untuk pilih feature
  --save, -s      Save analysis ke docs/features/{date}-{feature-id}.md
  --output PATH   Custom output path (requires --save)
  --json          Output sebagai JSON
  --help, -h      Show this help message

Note: By default (with --save), output akan disimpan ke docs/features/ dengan prefix tanggal.
    `)
    process.exit(0)
  }

  let featureId: string | null = null

  // Check if --list flag
  if (args.includes('--list') || args.includes('-l')) {
    featureId = await selectFeatureInteractive()
  } else if (args.length > 0 && !args[0].startsWith('--')) {
    // Direct feature name
    featureId = args[0]
  } else {
    // No args, show interactive by default
    featureId = await selectFeatureInteractive()
  }

  if (!featureId) {
    process.exit(1)
  }

  // Analyze feature
  const analysis = analyzeFeature(featureId)
  if (!analysis) {
    process.exit(1)
  }

  const shouldSave = args.includes('--save') || args.includes('-s')
  const outputIndex = args.indexOf('--output')
  const customOutput = outputIndex !== -1 && args[outputIndex + 1] ? args[outputIndex + 1] : undefined

  // Output
  if (args.includes('--json')) {
    console.log(JSON.stringify(analysis, null, 2))
  } else {
    displayAnalysis(analysis)
  }

  // Save to file if requested
  if (shouldSave) {
    const savedPath = saveToFile(analysis, customOutput)
    console.log(`\n✅ Analysis saved to: ${savedPath}`)
    console.log(`   You can view it at: docs/features/${path.basename(savedPath)}\n`)
  }
}

main().catch(console.error)
