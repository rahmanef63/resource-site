# 🔧 System Utilities

> **System Utilities = global UI elements, not features**
> 
> This folder holds the utility components used across the whole app as part of the UI system, rather than as business features.

---

## 📁 Folder Structure

```
system/
├── settings/           # General, workspace, profile settings
├── notifications/      # Notification center, inbox, updates
├── search/            # Global search, command palette
├── theme/             # Dark/light/auto theme toggle
├── profile/           # Avatar, personal info, logout
├── help/              # Help center, tutorials, docs
├── command-menu/      # Ctrl+K / Cmd+K quick actions
├── language/          # Language selector (i18n)
├── feedback/          # Feedback form, changelog
└── index.ts           # Central exports
```

---

## 🎯 System Utilities List

### 1. Settings
- General settings
- Workspace settings  
- Profile settings
- **Status:** ✅ Already exists at `frontend/shared/settings`

### 2. Notifications
- Notification center
- Inbox events
- Updates
- **Status:** ✅ Already exists at `utils/notifications`

### 3. Search
- Global search
- Command palette
- Quick find
- **Status:** ✅ Already exists at `utils/search`

### 4. Theme Toggle
- Dark/Light/Auto mode
- System theme preference
- **Status:** ✅ Implemented

### 5. Profile & Account
- Avatar
- Personal info
- Logout
- Billing
- **Status:** ✅ Implemented

### 6. Help / Support
- Help center
- Tutorials
- Documentation
- Live chat
- **Status:** ✅ Implemented

### 7. Command Menu (Optional)
- Ctrl+K / Cmd+K
- Quick actions
- Similar to Notion & Linear
- **Status:** ✅ Implemented

### 8. Language Selector (Optional)
- i18n support
- Language switching
- **Status:** ✅ Implemented

### 9. Feedback / Changelog (Optional)
- User feedback form
- App changelog
- **Status:** ✅ Implemented

---

## 📊 Implementation Status

| Utility | Status | Location |
|---------|--------|----------|
| Settings | ✅ Ready | `frontend/shared/settings` |
| Notifications | ✅ Ready | `utils/notifications` |
| Search | ✅ Ready | `utils/search` |
| Theme | ✅ Ready | `system/theme` |
| Profile | ✅ Ready | `system/profile` |
| Help | ✅ Ready | `system/help` |
| Command Menu | ✅ Ready | `system/command-menu` |
| Language | ✅ Ready | `system/language` |
| Feedback | ✅ Ready | `system/feedback` |

---

## 🔗 How This Differs from Features

| Aspect | System Utilities | Features |
|--------|-----------------|----------|
| Scope | Global UI elements | Business functionality |
| Usage | Present on every page | Active depending on context |
| Examples | Theme, Search, Notifications | CRM, Projects, CMS |
| Navigation | Header/Sidebar | Main content area |

---

*Last Updated: December 9, 2025*
