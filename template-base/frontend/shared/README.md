# Shared Architecture

The `frontend/shared` directory is the **Single Source of Truth (SSOT)** for all reusable code in SuperSpace. It follows a Domain-Driven Design (DDD) approach, organized by **horizontal layers** rather than atomic design levels.

## 🏗️ Architecture

The shared monolith is divided into 5 core domains:

| Domain | Path | Description |
|--------|------|-------------|
| **UI** | `@/frontend/shared/ui` | **The Design System**. Icons, atomic components (buttons, inputs), generic layouts. |
| **Foundation** | `@/frontend/shared/foundation` | **The Core Kernel**. Database, Auth, Context, Registry, Utils, Types. |
| **Settings** | `@/frontend/shared/settings` | **Feature Configuration**. Unified settings pages, feature toggles, permission mapping. |
| **Communications** | `@/frontend/shared/communications` | **Real-time Layer**. Chat, notifications, presence, AI streams. |
| **Builder** | `@/frontend/shared/builder` | **Canvas System**. The visual builder engine used by multiple features. |

## 📐 Strict SSOT Rules

1.  **No Component duplication**: If a generic component (e.g., `ColorPicker`, `IconPicker`) is needed by 2+ features, it **MUST** live in `frontend/shared/ui`.
2.  **No Logic duplication**: Utility functions must be in `foundation`.
3.  **Facades**: Always import from the domain index (e.g., `import { Button } from "@/frontend/shared/ui"`) when possible, or specific sub-paths if necessary.

## 📂 Key Subsystems

### 1. Icon System (`ui/icons`)
Dynamic icon loading system with unified picker.
- **Imports**: `import { IconPicker, DynamicIcon } from "@/frontend/shared/ui/icons"`
- **Features**: Search, Categories, Color support.

### 2. Color System (`ui/color-picker`)
Standardized color picker.
- **Imports**: `import { InlineColorPicker } from "@/frontend/shared/ui/color-picker"`

### 3. Registry Pattern (`foundation/utils/registry`)
Central registration for cross-feature capabilities.
- **Commands**: `registerCommands`
- **Creation**: `registerCreateActions`
- **Export**: `registerDataExport`

## 🛠️ Maintenance

- **Types**: Core types live in `foundation/types`.
- **Components**: Generic UI lives in `ui`.
- **Feature Logic**: Feature-specific reusable logic lives in the feature folder, NOT here. Only truly shared code goes here.

## 🔄 Deprecated Paths

The following paths are deprecated and exist only for backward compatibility. **Do not use them for new code**:

- `frontend/shared/components` (Use `ui/icons` or `ui`)
- `frontend/shared/foundation/utils/color-picker` (Use `ui/color-picker`)
- `frontend/shared/foundation/registries` (Use `foundation/utils/registry`)

> Last Updated: Dec 2025
