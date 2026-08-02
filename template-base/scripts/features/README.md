# Feature Scripts

Scripts for managing and analyzing features in the SuperSpace app.

## 📦 Available Scripts

### 1. `analyze-feature.ts` - Feature Analyzer

A script that gathers complete information about a feature and saves it as documentation.

#### Features:
- ✅ Analyze file structure (frontend + convex)
- ✅ Detect components, hooks, stores, types
- ✅ Extract CRUD operations (queries, mutations, actions)
- ✅ List permissions & RBAC
- ✅ Show dependencies & exports
- ✅ Interactive selection with keyboard navigation
- ✅ Auto-save to `docs/features/` with a date prefix

#### Usage:

**Analyze a feature directly:**
```bash
pnpm run analyze:feature <feature-name>
```

**Interactive selection (keyboard up/down):**
```bash
pnpm run analyze:feature --list
# or
pnpm run analyze:feature -l
```

**Save the analysis to a file:**
```bash
pnpm run analyze:feature cms --save
# Output: docs/features/2025-10-27-cms.md
```

**Custom output path:**
```bash
pnpm run analyze:feature cms --save --output custom/path.md
```

**JSON output:**
```bash
pnpm run analyze:feature cms --json
```

#### Examples:

```bash
# Analyze chat feature (console only)
pnpm run analyze:feature chat

# Analyze and save to docs/features/
pnpm run analyze:feature chat --save

# Interactive selection
pnpm run analyze:feature --list

# Custom output location
pnpm run analyze:feature cms --save --output reports/cms-analysis.md
```

#### Output Format:

With `--save`, the file is written to `docs/features/` using this format:
```
docs/features/{YYYY-MM-DD}-{feature-id}.md
```

Examples:
- `docs/features/2025-10-27-cms.md`
- `docs/features/2025-10-27-chat.md`

#### Information Analyzed:

1. **Basic Information**
   - ID, Name, Description
   - Category, Status, Version

2. **Capabilities**
   - Has UI, Has Convex, Has Tests, Has Settings
   - Permissions (RBAC)

3. **Frontend Structure**
   - Total files, Components, Hooks, Stores, Types
   - Detailed list of components and hooks

4. **Convex Backend**
   - Queries (Read operations)
   - Mutations (Write operations)
   - Actions (Async operations)
   - With file locations

5. **Dependencies**
   - External packages
   - Key exports

---

### 2. `list.ts` - Feature List

List all features in the registry.

```bash
pnpm run list:features
pnpm run list:features --type optional
pnpm run list:features --category analytics
```

---

### 3. `create.ts` - Create Feature

Create a new feature with scaffolding. Now includes bundle configuration!

```bash
pnpm run create:feature <slug> [options]

# Example with bundles:
pnpm run create:feature analytics --type optional --category analytics --icon BarChart \
  --bundles-recommended startup,business-pro \
  --bundles-optional custom

# Available bundle options:
# --bundles-core        Features that cannot be disabled
# --bundles-recommended Features enabled by default (can be disabled)
# --bundles-optional    Features disabled by default (can be enabled)
```

**Available Bundle IDs:**
- Business: `startup`, `business-pro`, `sales-crm`
- Productivity: `project-management`, `knowledge-base`
- Personal: `personal-minimal`, `personal-productivity`, `family`
- Creative: `content-creator`, `digital-agency`
- Other: `education`, `community`, `custom`

---

### 4. `sync.ts` - Sync Features

Sync features with the registry and validate bundle configurations.

```bash
pnpm run sync:features
```

This script:
- Validates all feature configurations
- **Validates bundle configurations**
- Syncs DEFAULT_MENU_ITEMS
- Syncs optional features catalog
- Generates bundle coverage report

---

### 5. `validate-bundles.ts` - Validate Bundles (NEW!)

Comprehensive bundle validation script.

```bash
pnpm run validate:bundles
```

**Checks:**
- All features have bundle configuration (except system features)
- Bundle IDs are valid
- No duplicate bundles across categories
- All bundles have minimum required features
- Bundle membership is consistent with feature type

**Output includes:**
- Error report for invalid configurations
- Warning report for potential issues
- Statistics on bundle coverage
- Detailed feature breakdown per bundle

---

### 6. `test-registry.ts` - Test Registry

Test the feature registry system including bundle configuration.

```bash
pnpm run test:registry
```

---

### 7. `generate-registry.ts` - Generate Registry

Auto-generate `lib/features/registry.ts` from feature configs.

```bash
pnpm run generate:registry
```

Now includes bundle-related functions:
- `getFeaturesByBundle(bundleId, role?)`
- `getBundleCoreFeatures(bundleId)`
- `getBundleRecommendedFeatures(bundleId)`
- `getBundleOptionalFeatures(bundleId)`

---

## 🎯 Bundle System

The bundle system allows features to declare which workspace templates they belong to.

### How it works:

1. **Each feature declares its bundle membership** in `config.ts`:
   ```typescript
   bundles: {
     core: ['startup', 'business-pro'],      // Cannot be disabled
     recommended: ['project-management'],     // Enabled by default
     optional: ['sales-crm', 'custom'],       // User can enable
   }
   ```

2. **Bundles are built dynamically** from feature configs - NO HARDCODING!

3. **The OnboardingFlow** reads bundle configuration to offer workspace templates.

### Bundle Roles:

| Role | Meaning | User Control |
|------|---------|--------------|
| `core` | Essential feature | Cannot disable |
| `recommended` | Suggested feature | Can disable |
| `optional` | Available feature | Must enable |

### Running Full Sync:

```bash
pnpm run sync:all
# Runs: sync:features → generate:registry → generate:manifest → validate:bundles
```

---

## 📁 Output Structure

```
docs/
└── features/
    ├── 2025-10-27-cms.md
    ├── 2025-10-27-chat.md
    ├── 2025-10-27-database.md
    └── ...
```

## 🔧 Development

### Adding New Analysis Features

Edit `scripts/features/analyze-feature.ts`:

1. Update `FeatureAnalysis` interface
2. Add new analysis functions
3. Update `analyzeFeature()` function
4. Update `displayAnalysis()` for console output
5. Update `formatAsMarkdown()` for file output

### Testing

```bash
# Test with different features
pnpm run analyze:feature cms --save
pnpm run analyze:feature chat --save
pnpm run analyze:feature --list

# Verify output
ls docs/features/
cat docs/features/2025-10-27-cms.md

# Test bundles
pnpm run validate:bundles
pnpm run test:registry
```

## 📚 Related Documentation

- [Feature Reference](../../docs/5_FEATURE_REFERENCE.md)
- [Developer Guide](../../docs/2_DEVELOPER_GUIDE.md)
- [Architecture](../../docs/architecture/)

---

**Note:** Every script runs on the feature registry system, which auto-discovers features from `frontend/slices/*/config.ts`. Bundle configuration is 100% dynamic too - features declare their own bundle membership!
