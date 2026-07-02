import { registerNotificationsAgent } from "./agent"

// ponytail: settings for "notifications" are registered by the legacy
// frontend/shared/foundation/utils/notifications/init.ts (4 tabs, the set actually
// shown). A stub registration here only duplicated the slug → "already registered,
// overwriting" warning. Migrate those 4 tabs into this slice if/when consolidating.

registerNotificationsAgent()
