# Auth, sessions, roles & capabilities

Slug: `auth-access-rbac` · Coverage verdict: **partial** (core covered by 3 existing rr slices; security-hardening layer is net-new harvest gold).

Two reference projects model auth in **completely different architectures**:

- **Instatic** — *server-managed* token-cookie sessions on a Bun server, with Convex as a pure data layer. Crypto (Argon2id passwords, SHA-256 token hashes, AES-GCM TOTP seeds) stays in the Bun process; Convex only persists rows. Capability-enum access model, MFA/TOTP, step-up auth, per-account lockout, login-attempt audit trail. **NOT `@convex-dev/auth`.**
- **personal-brand-os (PBO)** — `@convex-dev/auth` Password provider, *derived* roles (earliest account = owner, else editor) plus an `adminRoles` mapping table for owner/admin/editor/viewer. Zero-config first-claim onboarding (`ADMIN_SIGNUP_KEY`). This is essentially the same shape rr's baseline already ships.

rr's baseline (`convex-auth` + `rbac-roles` + `user-management`) already matches PBO and exceeds it. The genuinely *missing* surface — and the only thing worth harvesting — is Instatic's **security-hardening layer**: TOTP MFA, step-up auth, account lockout with exponential backoff, login-attempt audit, and a multi-device session-management panel. None of that exists in rr today.

---

## What it does (flow)

### Instatic (server-managed sessions)
Every state-changing CMS request goes through one auth funnel: parse cookie → hash → look up live session + hydrate user → check required **capability**.

```
POST /admin/api/cms/auth/login {email,password}
  → loginRateLimit (per-email + per-IP) → Argon2id verify against users.password_hash
  → fail: loginAttempts.record + users.recordFailedLoginAttempt → lockout.evaluateFailedAttempt (exp backoff)
  → ok: sessions.createSession → row {id_hash = SHA256(rawToken), user_id, expires_at,
         pending_mfa = mfa_enabled, step_up_expires_at = null}
  → Set-Cookie instatic_admin_session=<rawToken>; HttpOnly; Secure; SameSite=Lax; Path=/admin
If MFA enrolled → session is pending_mfa:
POST /auth/mfa/verify {code}
  → evaluateLockState (reject locked BEFORE checking code) → mfaRateLimit (per-IP)
  → decrypt TOTP seed (AES-GCM, INSTATIC_SECRET_KEY) + verifyTotpCode, or matchRecoveryCode
  → fail: recordFailedLoginAttempt (same lockout budget as password)
  → ok: sessions.rotate + markMfaPassed → session ACTIVE

Every request:
  cookie → hashSessionToken → sessions.findUserRowBySessionHash(idHash, now, idleCutoff)
  → live predicate (revoked_at null, expires_at > now, last_seen_at > idleCutoff)
  → user active + not deleted → hydrate AuthUser{id,email,capabilities[],stepUpAuthMode,...}
  → last_seen_at touch debounced ~30s

Sensitive action (delete user, revoke device, sign-out-all, schema mutation, replace-import):
  requireCapability(req,'users.manage') → requireStepUp(req, user)
  → stepUpAuthMode disabled? proceed. else sessions.step_up_expires_at > now? proceed : 401 {step_up_required}
  → client pops StepUp dialog → POST /auth/step-up {password} → set step_up_expires_at = now + window
```

Key invariant: **handlers gate on capability, never on role**. Roles are just named *sets* of capabilities. `AuthUser.capabilities` is the flattened grant list.

### PBO (@convex-dev/auth)
`convexAuth({ providers:[Password({...})] })`. `profile()` guards `JWT_PRIVATE_KEY` present + checks `ADMIN_SIGNUP_KEY`. `createOrUpdateUser()` dedupes by email and enforces first-claim-only when no key configured. Role is derived at read time (`users.ts:currentUser` → earliest `_creationTime` = owner). `adminPanel_users.ts` layers a real `adminRoles` table (owner/admin/editor/viewer) on top, with audit-logged `changeRole`/`revoke`. Client `<AdminGate>` gates the dashboard.

---

## Where it lives

| Concern | Instatic | personal-brand-os |
|---|---|---|
| Auth guards | `server/auth/authz.ts` (`requireAuthenticatedUser`/`requireCapability`/`requireAnyCapability`/`requireStepUp`/`userHasCapability`) | `convex/_shared/auth.ts` (`requireUser`/`optionalUser` via `getAuthUserId`) |
| Capability source of truth | `src/core/capabilities.ts` — `CORE_CAPABILITIES` (39 strings) + `CoreCapability` type | n/a (no capability enum) |
| System roles | `server/auth/capabilities.ts` — `SYSTEM_ROLES` (owner/admin/client/member), `FORCE_SYNC_ROLE_IDS`, `normalizeCapabilities`, `roleHasCapability` | derived in `convex/users.ts`; mapping in `convex/adminPanel_users.ts` |
| Sign-in / providers | `server/auth/sessions.ts` (Bun crypto write-side), `server/handlers/cms/auth.ts` | `convex/auth.ts` (`convexAuth`+Password), `convex/auth.config.ts` (JWKS) |
| Session data ops (Convex) | `convex/sessions.ts` — list/revoke + lifecycle (createSession, findUserRowBySessionHash, rotate, touchLastSeen, markMfaPassed, getStepUpExpiresAt) | `@convex-dev/auth` `authSessions` (library-owned) |
| Users data ops (Convex) | `convex/users.ts` — hydrate join, create/update, MFA enable/disable, lockout counters | `convex/users.ts`, `convex/adminPanel_users.ts` |
| Roles data ops (Convex) | `convex/roles.ts` — list/createCustom/update/deleteCustom/sync | `adminRoles` table only |
| Login audit / lockout | `convex/loginAttempts.ts` (record/listForUser/listForIp/activity), `server/auth/lockout.ts` (exp backoff), `server/auth/rateLimit.ts` (3 limiters) | none |
| MFA / TOTP | `server/auth/mfa.ts` (RFC 6238 TOTP + recovery codes), `server/auth/totpSecrets.ts` (AES-GCM encrypt seeds) | none |
| Step-up policy | `server/auth/stepUpPolicy.ts`, `src/admin/shared/StepUp/` `<StepUpProvider>` | none |
| CSRF / CORS / IP | `server/auth/security.ts` (`originAllowed`, `configurePublicOrigins`, `DEV_ORIGIN_ALLOWLIST`, trusted-proxy IP), `server/auth/tokens.ts` (`SESSION_COOKIE_NAME`, `hashSessionToken`), `server/auth/deviceLabel.ts` | n/a (Next 16 host) |
| Admin gate UI | `src/admin/...` (in-house router) | `components/admin-gate.tsx`, `components/admin-reset.tsx` |

Feature doc (excellent, read it): `Instatic-convex/docs/features/auth-and-access.md`.

---

## Data model

### Instatic Convex tables (`convex/schema.ts` L25-118) — nanoid string PKs via `by_app_id`, never `_id`
- **`roles`**: `id, slug, name, description, is_system, capabilities_json (string), created_at, updated_at` · idx `by_app_id`, `by_slug`.
- **`users`**: `id, email, email_normalized, display_name, password_hash, status('active'|'suspended'), role_id, last_login_at, failed_login_count, locked_until, password_updated_at, mfa_enabled, mfa_enabled_at, mfa_totp_secret_ciphertext, mfa_totp_secret_iv, mfa_totp_secret_key_fingerprint, mfa_recovery_code_hashes_json, created_at, updated_at, deleted_at, avatar_media_id, step_up_auth_mode('required'|'disabled'), step_up_window_minutes(5|15|30|60)` · idx `by_app_id`, `by_email_normalized`, `by_role_id`.
- **`sessions`**: `id_hash (SHA256 of cookie token), user_id, created_at, last_seen_at, expires_at, revoked_at, ip_address, user_agent, device_label, mfa_passed_at, step_up_expires_at` · idx `by_id_hash`, `by_user_last_seen`, `by_user_expires`.
- **`login_attempts`**: `id, attempted_at, email_norm, ip_address, user_agent, user_id, result('success'|'bad_password'|'no_user'|'account_disabled'|'locked'|'rate_limited'|'mfa_failed')` · idx `by_app_id`, `by_ip_attempted`, `by_email_attempted`, `by_user_attempted`.
- **`user_preferences`**: `user_id, key, value_json, updated_at` · idx `by_user_key`, `by_user`.

`*_json` columns stay opaque `v.string()`, parsed in app code. MFA secret travels base64; the AES master key never enters Convex's V8 runtime.

### PBO tables
- `@convex-dev/auth` library tables (`users`, `authAccounts`, `authSessions`, `authVerifiers`, ...).
- `adminRoles`: `userId (Id<"users">), role('owner'|'admin'|'editor'|'viewer')` · idx `by_userId`.

### rr existing tables (for the coverage map)
- `auth_*` (convex-auth slice): `auth_users/auth_accounts/auth_sessions/auth_verifiers`.
- `rbac_roles` (rbac-roles slice): `tenantId, name, slug, permissions[] (wildcard strings), color, level, isSystem, isDefault, ...` · idx `by_tenant`, `by_tenant_slug`.
- `um_members/um_invites/um_teams/um_team_members/um_tenant_links` (user-management slice).

---

## Public API

### Instatic Convex functions (all args + returns validated)
- `sessions.ts`: `listForUser`, `revokeByHashForUser`, `revokeAllOther`, `findUserRowBySessionHash`, `createSession`, `touchLastSeen`, `revokeByHash`, `getStepUpExpiresAt`, `rotate`, `markMfaPassed`.
- `users.ts`: `list`, `findById`, `findByEmail`, `countActiveOwners`, `create`, `update`, `setAvatarMediaId`, `updatePasswordHash`, `enableTotpMfa`, `disableTotpMfa`, `replaceRecoveryCodeHashes`, `updateStepUpPolicy`, `consumeRecoveryCodeHash`, `softDelete`, `markLoggedIn`, `recordFailedLoginAttempt`.
- `roles.ts`: `list`, `createCustom`, `update`, `deleteCustom`, `sync` (boot-time idempotent force-sync of owner/admin).
- `loginAttempts.ts`: `record`, `listForUser`, `listActivityForUser`, `listForIp`.
- Server REST (Bun handlers): `POST /admin/api/cms/auth/{login,logout,mfa/verify,step-up}`, `GET /me`, `/me/sessions`, `users`, `roles`, `setup`.

### Server guards (the only auth surface a handler calls)
`requireAuthenticatedUser(req)`, `requireCapability(req, cap)`, `requireAnyCapability(req, caps)`, `requireStepUp(req, user, {policy})`, `userHasCapability(user, cap)`, `userHasAnyCapability(user, caps)`.

### PBO
`convex/auth.ts`: `auth, signIn, signOut, store, isAuthenticated`, `loggedInUser`. `users.ts`: `currentUser`, `listAdmins`. `adminPanel_users.ts`: `get`, `changeRole`, `revoke`.

---

## UI surface

- **Instatic**: account/security page (MFA enroll QR + recovery codes, step-up window picker 5/15/30/60), sessions/devices panel (list live devices, revoke one / revoke all others — step-up gated), users + roles admin (capability-picker dialog grouped by `CAPABILITY_GROUPS`), `<StepUpProvider>` dialog mounted app-wide. All CSS Modules + pixel-art-icons + in-house router.
- **PBO**: `components/admin-gate.tsx` (login + signup/first-claim + reset + onboarding wizard handoff), `components/admin-reset.tsx`. shadcn primitives + lucide.
- **rr today**: `convex-auth` `SignInPage`/`AuthCard` (props-driven), `rbac-roles` role editor, `user-management` member list/invites.

---

## Dependencies

- **Instatic**: Bun runtime, `nanoid`, `convex`, WebCrypto/Node crypto (Argon2id, AES-GCM, HMAC-SHA1 for TOTP), TypeBox. No auth library.
- **PBO**: `@convex-dev/auth`, `@auth/core`, `convex`, shadcn, lucide.
- **rr slice deps if enhancing**: `@convex-dev/auth@^0.0.92`, `@auth/core`, `convex`, shadcn (`button card input label tabs alert input-otp dialog`), and for TOTP an `otpauth`/`@otplib`-style lib OR hand-rolled WebCrypto HMAC (rr prefers WebCrypto, see convex-auth's PBKDF2 choice). rr-slice deps: builds on `convex-auth` (sessions/sign-in) + `rbac-roles` (roles) + `user-management` (membership) + `rate-limit`.

---

## rr coverage — **partial**

| Feature dimension | Covered by | Status |
|---|---|---|
| Sign-in / password / OAuth / magic-link | `convex-auth` slice (Password PBKDF2-100k, Google, Anonymous, Resend) | ✅ covered |
| Sessions | `@convex-dev/auth` `authSessions` (library-managed) | ✅ covered (library-owned; no device labels) |
| Roles | `rbac-roles` (6 system roles, wildcard `permissions[]`, immutable presets, `requirePermission`) | ✅ covered |
| Capabilities / permission checks | `rbac-roles` `matchPermission` wildcard (`*`, `members.*`) + `requirePermission(ctx,tenant,perm)` | ✅ covered (different model: wildcard strings vs Instatic's fixed enum — rr's is more flexible, do NOT replace it) |
| Membership / invites / teams / superadmin | `user-management` (`um_members/invites/teams`) + `PLATFORM_ADMIN_EMAILS` bypass | ✅ covered |
| First-claim / zero-config onboarding | `onboarding-wizard` + convex-auth setup pattern (matches PBO) | ✅ covered |
| Per-account lockout + exp backoff | — (rr `rate-limit` = limiter only, not per-account lockout) | ⚠️ **gap** |
| Login-attempt audit trail | — (rr `audit-log` is generic, not auth-specific feed by email/ip/user) | ⚠️ **gap** |
| **MFA / TOTP + recovery codes** | — | ❌ **net-new** |
| **Step-up auth** (re-auth window for sensitive actions) | — | ❌ **net-new** |
| **Device session management** (list/label/revoke devices, revoke-all-others) | — | ❌ **net-new** |

Verdict: the named feature's **core (auth + sessions + roles + capabilities) is already covered** by the `convex-auth` + `rbac-roles` + `user-management` trio. What's missing is the **security-hardening tier**. So this is **partial**, and the right move is **enhance**, not build a competing mega-slice.

---

## Slice plan

**Action: enhance** (do NOT build a monolithic `auth-access-rbac` slice — it would duplicate/overlap the existing trio and violate rr's "compose, don't accumulate" + the no-monolith backend rule). Existing slugs the feature maps to: `convex-auth` (auth+sessions), `rbac-roles` (roles+caps), `user-management` (membership).

**Laziest correct path (ponytail):** ship ONE new focused companion slice — proposed slug **`auth-hardening`** — that layers the four missing pieces on top of `@convex-dev/auth`, instead of re-architecting Instatic's Bun session engine (which fundamentally cannot be lifted: see blockers). It owns its own tables keyed by `userId` (you cannot extend the library's `authSessions` schema), and exposes guard helpers that consumers call alongside `requireUser`.

Net-new slice contents:
1. **MFA/TOTP** — `auth_mfa` table `{ userId, enabled, secretCiphertext, secretIv, recoveryHashes[], enabledAt }`. Mutations `beginEnroll` (return `otpauth://` URI for QR) / `confirmEnroll(code)` / `disable` / `verify(code)` / `consumeRecoveryCode`. TOTP via WebCrypto HMAC-SHA1 (RFC 6238, no Node-only dep — same reason convex-auth uses PBKDF2). Seed encrypted with an env master key (`AUTH_MFA_KEY`). Port the algorithm from `server/auth/mfa.ts` + `totpSecrets.ts`.
2. **Step-up** — `auth_stepup` grant table `{ userId, sessionId?, expiresAt }` (or a short-lived token), `requireStepUp(ctx, {windowMinutes})` guard returning a typed `step_up_required` error; React `<StepUpDialog>` (shadcn `ResponsiveDialog` + password field). Port `server/auth/stepUpPolicy.ts` + `authz.ts:requireStepUp`.
3. **Lockout + login audit** — `login_attempts` table (port Instatic schema verbatim: `email_norm/ip/user_id/result` + the 4 indexes), `recordAttempt` mutation, `evaluateLockState`/`evaluateFailedAttempt` pure helpers (exp backoff, threshold 5, cap 24h) wired into the Password provider's `verifySecret`/sign-in path. Port `server/auth/lockout.ts`. Pairs with existing `rate-limit` slice.
4. **Device session panel** — since `@convex-dev/auth` owns `authSessions`, either read it (join device label from UA stored in a companion `auth_session_meta` table written on sign-in) and expose `listDevices`/`revokeDevice`/`revokeOthers`. Port the predicate + `isCurrent` logic from `convex/sessions.ts`.

**Portability blockers to strip (why Instatic's code can't be lifted as-is):**
- **Bun server + `Bun.serve` + repository pass-through** — entire auth write-side lives outside Convex; rr is Next 16 + Convex-native, no Bun process.
- **Crypto stays Bun-side**: Argon2id passwords + raw cookie token + SHA-256 `id_hash`. rr cannot run Argon2id in Convex's V8 — must use WebCrypto PBKDF2 (already the convex-auth choice) and let `@convex-dev/auth` own the session cookie. Server-managed cookie sessions (`instatic_admin_session`, `hashSessionToken`) are incompatible with the library model — drop them, keep only the MFA/step-up/lockout/device logic that hangs *beside* sessions.
- **Hardcoded 39-capability enum** (`CORE_CAPABILITIES`) + baked `SYSTEM_ROLES` server constants + `FORCE_SYNC_ROLE_IDS` boot resync — rr's model is wildcard permission strings (`rbac_roles.permissions[]`), props/tenant-driven. Do NOT import the enum; do NOT replace `rbac-roles`.
- **Env coupling**: `INSTATIC_SECRET_KEY`, `SESSION_COOKIE_NAME` (Path=/admin), `PUBLIC_ORIGIN`/`RENDER_EXTERNAL_URL`/`RAILWAY_PUBLIC_DOMAIN` auto-detect, `TRUSTED_PROXY_CIDRS`, Caddy same-origin/CSRF `originAllowed`. Next 16 handles CSRF/origin at the host — drop `security.ts` wholesale; parametrize the MFA key as a slice env var.
- **nanoid `by_app_id` string-PK pattern** — Instatic-specific; rr/@convex-dev/auth uses native `_id`. New tables use `_id` + `userId: v.id("users")`.
- **UI stack**: CSS Modules + pixel-art-icons + in-house router + TypeBox. Rebuild UI on shadcn + Tailwind tokens + lucide + Next 16 `proxy.ts`.

**Effort: M** — the algorithms (TOTP, lockout backoff, step-up window, device predicate) port cleanly as pure functions; the work is re-seating them onto `@convex-dev/auth` (4 small tables keyed by userId, guard helpers, 3-4 shadcn dialogs/panels) and wiring lockout into the Password provider. No re-architecture of the covered core.

**Proposed `slice.json` shape (companion slice, not a rewrite of the trio):**
```json
{
  "slug": "auth-hardening",
  "category": "auth",
  "title": "Auth Hardening — MFA, step-up, lockout & device sessions",
  "description": "Layers TOTP MFA (+recovery codes), step-up re-auth for sensitive actions, per-account lockout with exponential backoff + login-attempt audit, and a device-session panel on top of @convex-dev/auth. Composes with convex-auth + rbac-roles.",
  "namespace": "@/features/auth-hardening",
  "convex": { "tablesExport": "authHardeningTables",
              "schemaPath": "convex/features/auth-hardening/_schema.ts",
              "rootPaths": ["convex/features/auth-hardening"] },
  "frontend": { "slicePath": "frontend/slices/auth-hardening" },
  "deps": {
    "npm": ["@convex-dev/auth@^0.0.92", "convex"],
    "shadcn": ["button","input","input-otp","dialog","card","alert","badge","table"],
    "env": [{ "name": "AUTH_MFA_KEY", "scope": "convex",
              "description": "Master key to AES-GCM encrypt persisted TOTP seeds at rest." }],
    "peers": ["convex-auth", "rbac-roles", "rate-limit"]
  },
  "contract": {
    "requires": { "auth": "convex",
                  "convex": { "tables": ["auth_users","auth_sessions"] } },
    "provides": {
      "tables": ["auth_mfa","auth_stepup","login_attempts","auth_session_meta"],
      "components": ["MfaEnrollCard","StepUpDialog","DeviceSessionsPanel","LoginActivityFeed"],
      "hooks": ["useStepUp","useMfaEnroll"],
      "helpers": ["requireStepUp","evaluateLockState","evaluateFailedAttempt","verifyTotpCode","generateRecoveryCodes"]
    },
    "generalization": { "level": "portable" }
  }
}
```
Backend lives at `convex/features/auth-hardening/` (`_schema.ts` exporting `authHardeningTables`, `mutation.ts`, `query.ts`, `lib/{totp,lockout,stepup}.ts`); UI at `frontend/slices/auth-hardening/`. Standard trio: `slice.json` + `slice.manifest.json` (version SSOT pair) + catalog entry in `lib/content/slices.ts`. Keep files <=200 lines, validate every public arg, index every filter, server-side guard in every mutation.
