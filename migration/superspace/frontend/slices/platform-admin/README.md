# Platform Admin Feature

Super Admin panel for managing features, workspaces, and system configuration.

## Overview

The Platform Admin feature provides a centralized dashboard for platform administrators (Super Admins) to:

- **Manage Custom Features**: View, enable/disable, and configure features created via Builder
- **Monitor Workspaces**: See all workspaces on the platform
- **Grant Feature Access**: Control which workspaces can access which features
- **View Analytics**: Platform-wide usage statistics

## Access Control

Platform Admin access is controlled via the `PLATFORM_ADMIN_EMAILS` environment variable:

```env
# .env.local
PLATFORM_ADMIN_EMAILS=admin@example.com

# Multiple admins (comma-separated)
PLATFORM_ADMIN_EMAILS=admin1@example.com,admin2@example.com
```

## Architecture

### Backend (Convex)

- `convex/lib/platformAdmin.ts` - Core utility functions
- `convex/features/custom/admin.ts` - Admin queries and mutations
- `convex/features/custom/schema.ts` - Database schema for custom features

### Frontend

- `frontend/slices/platform-admin/views/PlatformAdminPage.tsx` - Main dashboard
- `frontend/slices/platform-admin/hooks/usePlatformAdmin.ts` - React hooks
- `frontend/slices/platform-admin/types/index.ts` - TypeScript types

### UI Components

- `frontend/shared/ui/components/FeatureTag.tsx` - Visual tags for features (Admin, Beta, New, etc.)

## Feature Tags

Features in the sidebar can display visual tags indicating their status:

| Tag | Color | Description |
|-----|-------|-------------|
| Admin | Red | Admin-only features |
| Beta | Yellow | Features in beta testing |
| New | Green | Recently added features |
| Experimental | Purple | Experimental features |
| Deprecated | Gray | Features being phased out |

## Usage

### Check Admin Status

```tsx
import { usePlatformAdminStatus } from "@/frontend/slices/platform-admin"

function MyComponent() {
  const { isPlatformAdmin, isLoading } = usePlatformAdminStatus()
  
  if (isPlatformAdmin) {
    return <AdminPanel />
  }
  return <RegularView />
}
```

### Access Custom Features

```tsx
import { useCustomFeatures } from "@/frontend/slices/platform-admin"

function FeaturesTable() {
  const { features, isLoading } = useCustomFeatures()
  
  return (
    <Table>
      {features.map(feature => (
        <TableRow key={feature._id}>
          <TableCell>{feature.name}</TableCell>
          <TableCell>{feature.status}</TableCell>
        </TableRow>
      ))}
    </Table>
  )
}
```

## Security

- Platform admin checks are performed at the Convex backend level
- All admin queries/mutations require authenticated user with admin email
- RBAC system has been updated to check platform admin first in all access checks
- Platform admins bypass workspace membership requirements

## Configuration

### Feature Registration

The feature is registered in:
- `frontend/slices/platform-admin/config.ts` - Feature configuration
- `frontend/shared/foundation/manifest/registry.tsx` - Page manifest

### Sidebar Display

The Platform Admin item automatically appears in the sidebar's "System" section for platform admins. Non-admin users will not see this menu item.

## Development

### Running Tests

```bash
pnpm test tests/features/platform-admin
```

### Building

The feature is included in the standard build process. No additional configuration needed.

## Related Files

- `convex/features/lib/rbac.ts` - RBAC integration
- `convex/shared/auth.ts` - Auth helpers with admin bypass
- `frontend/shared/ui/layout/sidebar/primary/AppSidebar.tsx` - Sidebar integration
