# CMS Lite Feature

CMS Lite adalah fitur **opsional** untuk user Superspace yang ingin membuat website publik.

## Cara Menggunakan

### Admin Interface
CMS Lite admin dapat diakses melalui dashboard dynamic routing. Misalnya:
- `/dashboard/cms-admin` atau route dinamis lainnya yang dikonfigurasi

Admin interface menggunakan tab-based layout dengan sections:
- Dashboard, Products, Blog Posts, Portfolio, Services
- Landing Page, Navigation, Features, Quick Links
- AI Chatbot, AI Analytics, AI Settings
- User Management, Site Settings

### Public Website
Website publik akan tersedia di route `(cms)`:
- `/` - Home
- `/about` - About
- `/products` - Products
- `/blog` - Blog
- dll.

## Status
✅ Admin interface: Siap digunakan (memerlukan backend integration)
🚧 Public routes: Structure sudah dibuat, menunggu backend integration

## Backend Integration Diperlukan

### ✅ Backend Sudah Tersedia
CMS Lite backend sudah ada di `convex/features/cms_lite/` dengan struktur lengkap:
- Products, Posts, Portfolio, Services
- Settings, Navigation, Features, Quicklinks
- Cart, Wishlist, Comments, Storage
- User management dan Permissions

### 🔧 Yang Perlu Dilakukan
Admin pages saat ini menggunakan `useBackend()` hook yang perlu diganti dengan Convex hooks:

**Pattern yang perlu diupdate:**
```typescript
// Current (mock)
const backend = useBackend();
const data = await backend.products.list();

// Should be (Convex)
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const data = useQuery(api.features.cms_lite.products.queries.list, {
  workspaceId: currentWorkspace._id
});
```

**Files yang perlu update:**
- All files in `features/admin/pages/*.tsx`
- Replace `useBackend()` with Convex hooks
- Update all API calls to use Convex queries/mutations

## Catatan Penting
- Ini adalah **optional feature** - tidak semua user memerlukan CMS Lite
- Menggunakan dynamic imports untuk menghindari loading unnecessary code
- Admin components di-load on-demand saat tab dibuka
- Public routes menggunakan Next.js 14+ async params pattern
