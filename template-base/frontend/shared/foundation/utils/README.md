# 📁 Utils Folder Structure

> **Organizational Guide for `frontend/shared/foundation/utils/`**

---

## 📊 Folder Categories

### 1. `core/` - Pure Utility Functions ✅ NEW
Helper functions tanpa dependencies ke UI atau business logic.

```
core/
├── cn.ts           # className utility (clsx + tailwind-merge)
├── dom.ts          # DOM manipulation helpers
├── format.ts       # String/number formatting
├── performance.ts  # Performance utilities (debounce, throttle, memoize)
└── index.ts
```

### 2. `data/` - Data Manipulation ✅ NEW (wrapper)
Utilities untuk transformasi dan handling data.
Re-exports dari folder asli untuk backward compatibility.

```
data/
└── index.ts        # Re-exports: converters, export, import, grouping
```

**Original folders:**
- `converters/` - Data type converters (CMS, documents)
- `export/` - Data export engines (JSON, TypeScript)
- `import/` - Data import engines
- `grouping/` - Data grouping utilities

### 3. `infra/` - Infrastructure ✅ NEW (wrapper)
Core infrastructure utilities.
Re-exports dari folder asli untuk backward compatibility.

```
infra/
└── index.ts        # Re-exports: errors, registry, validation
```

**Original folders:**
- `errors/` - Error handling
- `registry/` - Component registry
- `validation/` - Validation utilities

### 4. `features/` - Feature Modules ✅ NEW (wrapper)
Feature-based modules dengan UI components dan pages.
Re-exports dari folder asli untuk backward compatibility.

```
features/
└── index.ts        # Re-exports: archived, notifications, search, starred
```

**Original folders:**
- `archived/` - Archived items view
- `notifications/` - Notification center
- `search/` - Global search
- `starred/` - Starred items view

### 5. `system/` - System Utilities ✅ READY
Global UI elements (bukan business features).

```
system/
├── theme/          # Theme toggle (dark/light/auto)
├── profile/        # Profile & account management
├── help/           # Help center components
├── command-menu/   # Cmd+K quick actions
├── language/       # Language selector
├── feedback/       # Feedback & changelog
├── index.ts
└── README.md
```

---

## 🔗 Import Guide

```typescript
// Core utilities
import { cn } from "@/frontend/shared/foundation/utils/core"

// Data utilities
import { exportToJson } from "@/frontend/shared/foundation/utils/data"

// Infrastructure
import { handleError } from "@/frontend/shared/foundation/utils/infra"

// Features
import { NotificationsPage } from "@/frontend/shared/foundation/utils/features"

// System utilities
import { ThemeToggle, CommandMenu } from "@/frontend/shared/foundation/utils/system"

// Or from main index
import { cn, handleError, ThemeToggle } from "@/frontend/shared/foundation/utils"
```

---

## 📋 Category Decision Guide

| If the module... | Put it in... |
|------------------|--------------|
| Is a pure function (no UI) | `core/` |
| Handles data transformation | `data/` |
| Is infrastructure/foundational | `infra/` |
| Has page.tsx and is a feature | `features/` |
| Is global UI (header/sidebar) | `system/` |

---

*Last Updated: December 9, 2025*
