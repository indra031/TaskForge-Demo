# Discovery Report: BRD-001 — User Authentication and Registration (v4)

**Date:** 2026-03-03
**Author:** Engineering
**Input:** [BRD-001 v2](../BRD-001-business-requirements%20-%20V2.md)
**Baseline:** [Discovery Report v3](discovery_report_v3.md)
**Purpose:** Identify ambiguities, technical decisions, risks, dependencies, and migration concerns before writing the Technical Requirements Document.

---

## Resolution Log

| ID | Section | Resolved By | Resolution Summary |
|---|---|---|---|
| SBQ-001 | Scope Boundary Questions | PdM | Snackbar notification, auto-dismiss after 5 seconds |
| SBQ-002 | Scope Boundary Questions | PdM | Optional "Full Name" field; fallback to email when absent |
| SBQ-003 | Scope Boundary Questions | PdM | Standard dashboard with empty-state message; no onboarding for v1 |
| SBQ-004 | Scope Boundary Questions | PdM | Global lockout (per-account, all devices); 15-minute window |
| SBQ-005 | Scope Boundary Questions | PdM | Always persist sessions, no toggle; deferred to future |
| SBQ-006 | Scope Boundary Questions | PdM | Generic safe message, no countdown or exact time |
| SBQ-007 | Scope Boundary Questions | PdM | Unlimited concurrent sessions; no invalidation on new login |
| SBQ-008 | Scope Boundary Questions | PdM | Client-side auth state clear + Cache-Control: no-store and Pragma: no-cache headers |
| DP-001 | Decision Points | Engineering | JWT (stateless) with short-lived access token + long-lived refresh token |
| DP-002 | Decision Points | Engineering | localStorage/sessionStorage with Authorization header pattern |
| DP-003 | Decision Points | Engineering | bcrypt — Spring Security default, zero additional configuration |
| DP-004 | Decision Points | Engineering | UUID — consistency with existing codebase is non-negotiable |
| DP-005 | Decision Points | Engineering | Database — lockout state stored alongside login audit data |
| DP-006 | Decision Points | Engineering | Store UUID as string in `created_by` column |
| AQ-001 | Additional Questions | PdM | VARCHAR 100 for Full Name field |
| AQ-002 | Additional Questions | PdM | Defer profile editing; name set only during registration for v1 |
| AQ-003 | Additional Questions | PdM | Snackbar shown on dashboard after redirect |
| AQ-004 | Additional Questions | Engineering | Angular built-in XSS protections + CSP header restricting scripts to 'self' |
| AQ-005 | Additional Questions | Engineering | 15-minute access token, 7-day refresh token |
| AQ-006 | Additional Questions | Engineering | localStorage — only option consistent with SBQ-005 (always persist sessions) |

---

## 1. Scope Boundary Questions

### SBQ-001: What constitutes "in-app confirmation" after registration?

The BRD says the user receives an "in-app confirmation that registration was successful" and specifies the message "Welcome to TaskForge! Your account is ready." It's unclear whether this is a temporary toast/snackbar that auto-dismisses, a persistent banner on the dashboard, or a one-time modal dialog.

**Recommendation:** Use a temporary snackbar notification (auto-dismisses after a few seconds) — this is the standard pattern users expect from modern web apps and doesn't block them from starting work immediately.

> **✅ Resolved (PdM):** Snackbar notification, auto-dismiss after 5 seconds. Standard Material Design pattern.

---

### SBQ-002: Should the registration form include a display name field?

The BRD specifies registration with "email and password" only. However, once users appear as task assignees, the system will need something human-readable to display. Without a name, the only identifier shown to other users would be the email address.

**Recommendation:** Add an optional "Full Name" field to the registration form — it gives the system something friendlier than an email address to display on task cards and assignments, and keeping it optional avoids adding friction to sign-up.

> **✅ Resolved (PdM):** Yes, add optional "Full Name" field. System falls back to email when no name is provided.

---

### SBQ-003: What does "dashboard" mean for a newly registered user with no tasks?

The BRD says users are "redirected to their dashboard" after registration and login. Today's dashboard shows task statistics, recent tasks, and overdue tasks. A brand-new user will have zero data across all of these. The BRD doesn't specify whether the empty state should include onboarding guidance, a prompt to create a first task, or just show zeroes.

**Recommendation:** Show the standard dashboard with an empty-state message like "No tasks yet — create your first task to get started" — this keeps the experience consistent and avoids building a separate onboarding flow for v1.

> **✅ Resolved (PdM):** Standard dashboard with empty-state message. No onboarding flow for v1.

---

### SBQ-004: Does account lockout apply per-device or per-account?

The BRD states "Account is temporarily locked after 5 consecutive failed attempts (15-minute lockout)." It's unclear whether the lockout is tied to the account globally (no one can log in, even on a different device) or only to the device/IP that triggered the failures. Global lockout is more secure but creates a denial-of-service vector where anyone can lock any account by guessing passwords.

**Recommendation:** Lock the account globally (all devices) — this is simpler to implement and more secure; the denial-of-service risk is acceptable for v1 given the 15-minute window, and rate limiting at the IP level can be added later if abuse occurs.

> **✅ Resolved (PdM):** Global lockout (per-account, all devices). 15-minute window accepted.

---

### SBQ-005: Should the "remember me" behavior be the only option, or should users be able to opt out?

The BRD says "Login state persists across browser sessions (remember me by default)" and the MoSCoW table lists a "Remember me toggle" as a "Could." It's ambiguous whether v1 should always persist sessions (no toggle) or whether the toggle should be included.

**Recommendation:** Always persist sessions in v1 with no toggle — the BRD says "by default" and the toggle is explicitly a "Could," so omitting it simplifies the login form and reduces scope.

> **✅ Resolved (PdM):** Always persist sessions, no toggle. Toggle is "Could" in BRD — defer.

---

### SBQ-006: What happens when a locked-out user tries to log in?

The BRD specifies a 15-minute lockout after 5 failed attempts but doesn't describe the user experience during the lockout period. Should the system show a specific message ("Account temporarily locked, try again in X minutes"), a countdown timer, or the same generic "Invalid email or password" message used for normal failures?

**Recommendation:** Show a specific but safe message like "Too many failed attempts — please try again later" without revealing the exact remaining time — this tells the user what happened without giving an attacker precise timing information.

> **✅ Resolved (PdM):** Generic safe message: "Too many failed attempts — please try again later." No countdown, no exact remaining time.

---

### SBQ-007: Should the system allow multiple concurrent sessions?

The BRD describes session management (8-hour active, 30-minute idle timeout) but doesn't specify whether a user can be logged in from multiple browsers or devices simultaneously. Some systems invalidate previous sessions on new login; others allow unlimited concurrent sessions.

**Recommendation:** Allow multiple concurrent sessions — most modern productivity tools permit this, and restricting it would frustrate users who work across devices (laptop, phone, tablet) without adding meaningful security for v1.

> **✅ Resolved (PdM):** Allow unlimited concurrent sessions. No invalidation on new login.

---

### SBQ-008: Does "pressing the browser back button does not show authenticated content" require server-side enforcement?

The BRD says that after logout, pressing the browser back button should not show authenticated content. This could mean simply clearing the local auth state (so the frontend redirects to login) or ensuring that cached pages are also invalidated via cache-control headers. The distinction matters because cached content could briefly flash before redirect.

**Recommendation:** Clear the auth state and set proper no-cache headers on authenticated pages — this prevents both the content flash and any lingering cached data, which is the standard approach users expect.

> **✅ Resolved (PdM):** Clear auth state on logout (client-side) + set `Cache-Control: no-store` and `Pragma: no-cache` headers on authenticated responses (server-side).

---

## 2. Decision Points

### DP-001: Authentication mechanism — JWT (stateless) vs. server-side sessions (stateful)

The BRD requires session persistence across browser sessions, idle timeout after 30 minutes, and the ability to log out. Both approaches can satisfy these requirements but have different trade-offs.

| | Option A: JWT (stateless) | Option B: Server-side sessions |
|---|---|---|
| **Approach** | Issue signed tokens stored client-side; short-lived access token + long-lived refresh token | Store session state in server memory or database; session ID sent via cookie |
| **Pros** | No server-side session storage; scales horizontally without shared state; aligns with the REST endpoint spec's mention of "JWT Bearer token in Authorization header" | Simpler idle timeout and logout (just invalidate server-side); native Spring Security session support; no token refresh complexity |
| **Cons** | True logout requires a token denylist (adds server state anyway); idle timeout is harder to implement; refresh token rotation adds complexity | Requires shared session store for horizontal scaling; not aligned with API-first/stateless REST philosophy |

**Recommendation:** Option A (JWT) — it aligns with the existing API design spec which already references JWT Bearer tokens, supports future mobile/API clients without rework, and the project's use of virtual threads makes it well-suited for stateless request handling.

> **✅ Resolved (Engineering):** Option A (JWT). Short-lived access token + long-lived refresh token. Aligns with existing API design spec and supports future mobile/API clients.

---

### DP-002: JWT storage on the client — HttpOnly cookie vs. localStorage/sessionStorage

If JWT is chosen, the tokens need to be stored client-side. This decision affects security posture and CORS configuration.

| | Option A: HttpOnly secure cookie | Option B: localStorage / sessionStorage |
|---|---|---|
| **Approach** | Server sets tokens via Set-Cookie with HttpOnly, Secure, SameSite flags | Frontend stores tokens in browser storage and attaches via Authorization header |
| **Pros** | Immune to XSS token theft; automatic inclusion on requests; standard for web apps | Simpler CORS setup; easier to debug; works naturally with Authorization header pattern |
| **Cons** | Requires CSRF protection (SameSite helps but isn't sufficient alone); more complex CORS setup for cross-origin | Vulnerable to XSS — any script injection can steal tokens; requires manual token attachment via interceptor |

**Recommendation:** Option A (HttpOnly cookie) — security should be the default posture; XSS protection is more critical than implementation convenience, and the BRD's security requirements ("must not help attackers") favor the safer storage mechanism.

> **✅ Resolved (Engineering):** Option B (localStorage/sessionStorage). Tokens stored in browser storage and attached via Authorization header. Simpler CORS setup and works naturally with the JWT Bearer token pattern from the API spec. *Note: This deviates from the recommendation — see AQ-004 for the required XSS mitigation strategy.*

---

### DP-003: Password hashing algorithm — bcrypt vs. Argon2

The BRD requires that credentials "must be stored securely (never in plain text)." Spring Security supports multiple password encoders.

| | Option A: bcrypt | Option B: Argon2 |
|---|---|---|
| **Approach** | Industry-standard adaptive hash function; Spring Security's default | Memory-hard hash function; winner of the Password Hashing Competition |
| **Pros** | Battle-tested; Spring Security default (zero configuration); widely understood | More resistant to GPU/ASIC attacks; considered state-of-the-art; also supported by Spring Security |
| **Cons** | Vulnerable to GPU-accelerated brute force compared to Argon2 | Less common; slightly more complex to tune; higher memory requirements on server |

**Recommendation:** Option A (bcrypt) — it is Spring Security's default encoder, proven for decades, requires zero additional configuration, and is more than sufficient for v1's security requirements.

> **✅ Resolved (Engineering):** Option A (bcrypt). Spring Security default encoder, zero additional configuration required.

---

### DP-004: User ID format for the new User entity — UUID vs. auto-increment

The existing entities (Task, Project) all use UUID primary keys. The existing `assignee_id` column on the tasks table is already a UUID. However, auto-increment IDs are simpler for some use cases.

| | Option A: UUID | Option B: Auto-increment (Long) |
|---|---|---|
| **Pros** | Consistent with all existing entities; compatible with existing `assignee_id` column; no enumeration attacks | Simpler; smaller storage footprint; human-readable |
| **Cons** | Larger index size; slightly slower joins | Inconsistent with codebase; would require changing `assignee_id` type; enables account enumeration |

**Recommendation:** Option A (UUID) — consistency with the existing codebase is non-negotiable; the `assignee_id` column is already a UUID, and all entities follow the same BaseEntity pattern with UUID keys.

> **✅ Resolved (Engineering):** Option A (UUID). Consistency with the existing codebase is non-negotiable. Compatible with existing `assignee_id` column and BaseEntity pattern.

---

### DP-005: Where to store account lockout state — database vs. in-memory cache

The BRD requires temporary account lockout after 5 failed attempts with a 15-minute window. This state needs to be tracked and expire automatically.

| | Option A: Database table/column | Option B: In-memory cache (e.g., Caffeine) |
|---|---|---|
| **Approach** | Store failed attempt count and lockout timestamp on the user record or a separate audit table | Use an in-memory time-expiring cache keyed by user email |
| **Pros** | Survives server restarts; works across multiple instances; provides audit trail | Faster; no database writes on every failed login; auto-expiration built-in; simpler |
| **Cons** | Requires database writes on every failed attempt; needs a cleanup mechanism for expired lockouts | Lost on server restart (lockout resets); doesn't work across multiple instances without shared cache |

**Recommendation:** Option A (database) — the BRD requires that "all login attempts (success/failure) must be logged with timestamp," which already mandates database writes; storing lockout state alongside that audit data is natural and ensures lockout survives restarts.

> **✅ Resolved (Engineering):** Option A (database). Lockout state stored alongside login audit data. Consistent with BRD requirement that all login attempts must be logged with timestamps.

---

### DP-006: JPA auditing — how to populate `createdBy` after auth is implemented

The existing BaseEntity uses Spring Data's `@CreatedBy` annotation, which requires an `AuditorAware` bean to supply the current user. Today this field is not meaningfully populated. After auth is added, a decision is needed on what value to store.

| | Option A: Store the user's UUID | Option B: Store the user's email |
|---|---|---|
| **Pros** | Immutable identifier; consistent with `assignee_id` pattern; supports email changes in the future | Human-readable in the database; no join needed to see who created a record |
| **Cons** | Requires a join to display the creator's name/email; the column is currently VARCHAR (would store UUID as string) | Becomes stale if email changes; inconsistent with UUID-based references elsewhere |

**Recommendation:** Option A (store UUID as string) — the `createdBy` column is already VARCHAR so it can hold a UUID string; this is consistent with how `assignee_id` works and remains correct even if a user changes their email later.

> **✅ Resolved (Engineering):** Option A (store UUID as string). Consistent with `assignee_id` pattern. The existing VARCHAR column accommodates UUID strings without schema change.

---

## 3. Codebase Risks

### CR-001: Spring Security is included but configured to permit all requests

Spring Security is already a dependency and has a `SecurityConfig` class that explicitly disables CSRF and permits all requests. When the auth implementation tightens these rules, every existing endpoint will suddenly require authentication. Any misconfiguration during the transition could break the entire API. The existing CORS configuration (allowing `localhost:4200`) is also embedded within `SecurityConfig` and will need to coexist with the new auth filter chain.

*Cross-ref: SBQ-008 resolution confirms that `Cache-Control: no-store` and `Pragma: no-cache` headers must be set on authenticated responses — this will be part of the SecurityConfig changes. DP-001 resolution (JWT) means the filter chain will include a JWT authentication filter. DP-002 resolution (localStorage) means CSRF protection remains disabled (no cookie-based auth), simplifying the SecurityConfig transition. AQ-004 resolution confirms a `Content-Security-Policy` header restricting scripts to `'self'` must also be added to the security configuration.*

---

### CR-002: The `createdBy` audit field has no consistent value today

The `BaseEntity` uses `@CreatedBy` from Spring Data JPA Auditing, but there is no `AuditorAware` bean providing a meaningful value. Existing records in the database likely have null or empty `created_by` values. Once authentication populates this field with real user identifiers, there will be a mismatch between old records (null/empty) and new records (user ID). Any UI or query that relies on `created_by` will need to handle this gracefully.

*Cross-ref: DP-006 resolution confirms UUID as string will be stored. See also MC-005.*

---

### CR-003: The `assignee_id` column has no foreign key constraint

The tasks table has an `assignee_id` UUID column with an index but no foreign key constraint to any user table. This was intentional (no user table existed), but once a users table is created, a decision must be made about whether to add a FK constraint. Adding one retroactively could fail if existing data contains orphaned UUIDs — though the current seed data has all null values, any manually inserted test data could cause issues.

*Cross-ref: DP-004 resolution confirms UUID for the User entity, which is type-compatible with the existing `assignee_id` column. See also MC-002.*

---

### CR-004: The frontend has no authentication infrastructure

The Angular frontend currently has no auth guard, no HTTP interceptor for attaching credentials, no login/registration components, and no concept of an authenticated vs. unauthenticated route. The app's routing immediately redirects to the dashboard. Adding auth requires restructuring the routing to differentiate public routes (login, register) from protected routes (dashboard, tasks), which touches the core application layout and navigation.

*Cross-ref: SBQ-001 resolution (snackbar after registration) and SBQ-002 resolution (optional Full Name field) define concrete UI requirements for the registration component. SBQ-003 resolution (empty-state dashboard) confirms the post-registration redirect target behavior. DP-002 resolution (localStorage) means the frontend must implement an HTTP interceptor to attach the JWT Bearer token from localStorage to every API request via the Authorization header. AQ-001 resolution (VARCHAR 100) sets the frontend validation max-length for the Full Name field. AQ-003 resolution (snackbar on dashboard after redirect) confirms the snackbar timing. AQ-006 resolution (localStorage) confirms the specific storage mechanism for the HTTP interceptor.*

---

### CR-005: The main application layout is embedded in AppComponent

The toolbar, sidenav, and navigation are all defined directly in `AppComponent`. When authentication is added, unauthenticated pages (login, register) should not show the sidebar navigation or the full toolbar. This means the layout needs to be split into an "authenticated layout" (with sidenav) and a "public layout" (minimal, centered forms). Refactoring AppComponent to support this dual layout without breaking the existing dashboard view is a moderate risk.

---

### CR-006: No test coverage for existing security configuration

There is only one backend test file (`TaskServiceTest.java`) and zero frontend tests. The security configuration transition from "permit all" to "authenticated" is high-risk to do without integration tests that verify which endpoints are protected and which are public. There is no safety net to catch regressions.

---

### CR-007: The OpenAPI/Swagger UI endpoint needs to remain accessible

The Swagger UI at `/swagger-ui.html` and the API docs at `/api-docs` are currently unprotected. When authentication is added, these paths must be explicitly excluded from the security filter, or developers will lose access to the API documentation during development.

---

## 4. Dependency Analysis

### DA-001: Spring Security — already present, needs configuration

Spring Boot Starter Security (`spring-boot-starter-security`) is already in the Maven dependencies. The current `SecurityConfig` permits all requests. No new dependency is needed for core authentication, password encoding (bcrypt), or filter chain configuration — all of this is included in the existing starter.

*Note: SBQ-004 resolution (global lockout) and SBQ-006 resolution (lockout message) confirm lockout behavior that will be implemented within the Spring Security filter chain. SBQ-008 resolution (cache-control headers) will also be configured here. DP-001 resolution (JWT) confirms a JWT authentication filter will be added to the chain. DP-003 resolution (bcrypt) confirms the default `BCryptPasswordEncoder` — no additional configuration needed. AQ-004 resolution (CSP header) adds a `Content-Security-Policy: script-src 'self'` header to the security configuration.*

---

### DA-002: JWT library — new dependency required ✅ Confirmed

~~No JWT library exists in the project today. If JWT-based authentication is chosen (see DP-001), a library is needed for token creation, signing, and validation.~~ DP-001 is now resolved: JWT is confirmed. A JWT library must be added to `pom.xml`. The main options are `io.jsonwebtoken:jjwt` (most popular in Spring ecosystem) and `com.auth0:java-jwt`. Either is suitable.

*Note: DP-001 resolution (JWT) confirms this dependency is required. AQ-005 resolution (15-minute access token, 7-day refresh token) defines the token lifetimes that the JWT library must support — both are standard capabilities of any JWT library. The library choice remains a minor implementation detail — `jjwt` is the de facto standard in the Spring ecosystem.*

---

### DA-003: Spring Data JPA and Flyway — already present

The persistence layer is fully established. A new Flyway migration will be needed for the users table (and a login audit table for lockout tracking). No new dependencies are required. The migration versioning currently ends at V3; new migrations would continue from V4.

*Note: SBQ-002 resolution (optional Full Name field) confirms the users table must include a nullable `full_name` column. AQ-001 resolution (VARCHAR 100) sets the column definition to `VARCHAR(100)`. DP-004 resolution (UUID) confirms the primary key type. DP-005 resolution (database) confirms that login audit / lockout state requires its own table or columns, shaping the migration schema further.*

---

### DA-004: Jakarta Validation — already present

Input validation for registration and login request DTOs can use the existing Jakarta Bean Validation dependency (`spring-boot-starter-validation`). Custom validators (e.g., password strength) can be built on top of the existing infrastructure.

*Note: SBQ-002 resolution (optional Full Name) means the registration DTO's name field should not have a `@NotBlank` constraint — only email and password are required. AQ-001 resolution (VARCHAR 100) means the name field should have a `@Size(max = 100)` constraint if provided.*

---

### DA-005: Angular Material — already present, sufficient for auth UI

The frontend already uses Angular Material extensively (toolbar, sidenav, cards, chips, buttons, icons, forms). Login and registration forms can be built entirely with existing Material components (`mat-form-field`, `mat-input`, `mat-button`, `mat-card`, `mat-snackbar`). No new frontend dependencies are needed for the auth UI.

*Note: SBQ-001 resolution (snackbar, 5-second auto-dismiss) confirms `MatSnackBar` usage with a configured duration. SBQ-002 resolution (optional Full Name) adds one additional `mat-form-field` to the registration form. AQ-001 resolution (VARCHAR 100) sets the `maxlength` attribute on the name input to 100. AQ-003 resolution (snackbar on dashboard after redirect) confirms the snackbar is triggered from the dashboard component after navigation completes.*

---

### DA-006: NgRx Signal Store — already present, suitable for auth state

The frontend state management library is already in use for dashboard and task state. An auth store can follow the same pattern for managing current user state, login status, and loading/error states.

*Note: SBQ-005 resolution (always persist sessions) means the auth store must initialize from persisted credentials on app startup. AQ-006 resolution (localStorage) confirms the store will check for a valid token in `localStorage` specifically (not `sessionStorage`) on initialization and, if present, treat the user as authenticated. SBQ-007 resolution (unlimited concurrent sessions) means the store does not need to handle session conflict scenarios. AQ-005 resolution (15-minute access token, 7-day refresh token) means the store must implement a token refresh mechanism — when the access token expires, the store should use the refresh token to obtain a new access token transparently.*

---

### DA-007: In-memory cache library — not needed ✅ Confirmed

~~If lockout state or token denylist is stored in-memory (see DP-005), a cache library like Caffeine may be needed.~~ DP-005 resolution (database) eliminates the need for an in-memory cache for lockout state. AQ-005 resolution (15-minute access token) keeps the token denylist manageable — at most 15 minutes of revoked tokens to track at any given time. A database-backed denylist is sufficient for this volume, and no in-memory cache dependency is needed.

*Note: If performance profiling later reveals that the denylist lookup is a bottleneck (unlikely given the short token lifetime), an in-memory cache can be introduced as an optimization without architectural changes.*

---

## 5. Migration Concerns

### MC-001: Existing tasks have no owner — who "owns" pre-auth data?

All existing tasks and projects were created without user identity. Once authentication is live, every new task will have a `created_by` user reference, but existing records will have null or empty creator fields. The system needs a strategy: either assign all legacy data to a system/admin account created during migration, leave the creator fields null and handle this in the UI, or backfill with a designated "legacy" user. This affects how the dashboard and task lists display creator information.

*Cross-ref: SBQ-003 resolution (empty-state dashboard) addresses the new-user experience but does not resolve the legacy data ownership question. DP-006 resolution (UUID as string) confirms the format of future `created_by` values but does not address existing nulls.*

---

### MC-002: The `assignee_id` column may need a foreign key to the new users table

Currently, `assignee_id` is a bare UUID with no referential integrity. Once a users table exists, adding a FK constraint would enforce data consistency going forward. However, this raises questions: should existing null values remain allowed? If a user is deleted later (GDPR), should assigned tasks have their assignee set to null (ON DELETE SET NULL) or should deletion be blocked? The BRD mentions GDPR compliance, so this cascade behavior must be decided.

*Cross-ref: DP-004 resolution confirms UUID for the User entity, which is type-compatible with `assignee_id`. The FK constraint can now be added without a type mismatch.*

---

### MC-003: Existing API consumers will break when authentication is enforced

Today, all API endpoints are unauthenticated. Any existing integrations, scripts, or frontend code that calls the API without credentials will immediately fail when security is enabled. The migration needs a coordinated cutover: either deploy frontend auth changes simultaneously with backend security enforcement, or introduce a transitional period where auth is optional (not recommended for security reasons).

*Cross-ref: DP-002 resolution (localStorage with Authorization header) means the frontend must include an HTTP interceptor that attaches the Bearer token before any API call will succeed after the cutover. AQ-006 resolution (localStorage) confirms the specific storage API the interceptor reads from.*

---

### MC-004: The seed data migration (V3) creates data with no user context

The existing seed migration inserts demo projects and tasks without any user references. If the system requires a logged-in user to view or manage tasks, these seed records could become inaccessible orphans (depending on how authorization is scoped in future versions). For v1, where there is no role-based access control and all authenticated users see all data, this is not an immediate problem — but it becomes one in v2 when visibility rules are introduced.

---

### MC-005: The `created_by` column type may need consideration

The `created_by` field in BaseEntity is a `String` populated by `@CreatedBy`. If the decision is to store UUIDs (see DP-006), the column type (VARCHAR 255) is compatible but semantically misleading. No schema change is needed, but the implicit contract changes from "could be anything" to "always a UUID string for records created after auth is enabled." Future queries joining on this field will need to cast or treat it as a UUID string.

*Cross-ref: DP-006 resolution confirms UUID as string. The existing VARCHAR column is sufficient — no migration needed for this column.*

---

### MC-006: Frontend routing restructure — avoid breaking bookmarked URLs

The current routing sends all traffic to `/dashboard`. Adding login and registration routes is additive (new paths), but adding auth guards will redirect unauthenticated users away from `/dashboard` to `/login`. If users have bookmarked `/dashboard`, they should be redirected to login and then returned to their intended destination after successful authentication (return URL pattern). Without this, bookmarks and shared links break.

*Cross-ref: SBQ-005 resolution (always persist sessions) reduces the frequency of this redirect since sessions are long-lived, but the return URL pattern is still needed for expired sessions. AQ-005 resolution (7-day refresh token) means sessions persist for up to 7 days before the user must re-authenticate, further reducing redirect frequency. AQ-006 resolution (localStorage) means session persistence survives browser restarts, consistent with SBQ-005.*

---

## 6. Additional Questions Raised by Resolutions

### AQ-001: What is the maximum length for the "Full Name" field?

SBQ-002 resolved that an optional Full Name field should be added to the registration form. The database column needs a defined maximum length (e.g., VARCHAR 100, VARCHAR 255). This affects both the Flyway migration schema and frontend validation.

**Recommendation:** VARCHAR 100 — sufficient for virtually all real names while preventing abuse; matches common industry practice.

> **✅ Resolved (PdM):** VARCHAR 100. Sufficient for virtually all real names while preventing abuse; matches common industry practice.

---

### AQ-002: Should the Full Name field be editable after registration?

SBQ-002 defines the field at registration time, but the BRD does not mention a profile editing feature. If Full Name cannot be changed after registration, users who skip it initially (since it's optional) have no way to add it later without a profile page.

**Recommendation:** Defer profile editing to a future iteration — for v1, the name can only be set during registration. This is acceptable because the system falls back to email when no name is provided.

> **✅ Resolved (PdM):** Defer profile editing to a future iteration. For v1, the name can only be set during registration. Acceptable because the system falls back to email when no name is provided.

---

### AQ-003: Should the snackbar confirmation block navigation or appear on the dashboard?

SBQ-001 resolved that a snackbar auto-dismisses after 5 seconds, and SBQ-003 resolved that the user is redirected to the dashboard after registration. The snackbar could appear *before* redirect (on the registration page) or *after* redirect (on the dashboard). Showing it after redirect is the standard pattern, but the timing of redirect vs. snackbar display needs to be coordinated.

**Recommendation:** Show the snackbar on the dashboard after redirect — this is the standard pattern where the navigation completes first, then the confirmation appears as a non-blocking overlay.

> **✅ Resolved (PdM):** Show the snackbar on the dashboard after redirect. Navigation completes first, then the confirmation appears as a non-blocking overlay.

---

### AQ-004: What XSS mitigation strategy is required given localStorage token storage?

DP-002 resolved in favor of localStorage over HttpOnly cookies, which means JWT tokens are accessible to JavaScript and therefore vulnerable to XSS attacks. The BRD's security requirements state that the system "must not help attackers," making XSS mitigation a critical concern. The implementation must define what safeguards are in place to compensate for the less secure storage choice: strict Content Security Policy (CSP) headers, Angular's built-in sanitization (which covers template injection but not all vectors), input validation on all user-generated content, and avoidance of `innerHTML` / `bypassSecurityTrust*` patterns.

**Recommendation:** Rely on Angular's built-in XSS protections (template sanitization, strict contextual escaping) as the primary defense, and add a `Content-Security-Policy` header that restricts script sources to `'self'` only (no inline scripts, no `eval`). These two layers together make XSS exploitation significantly harder. Document this as a security trade-off that should be revisited if the application ever renders third-party or user-generated HTML content.

> **✅ Resolved (Engineering):** Rely on Angular's built-in XSS protections (template sanitization, strict contextual escaping) as the primary defense, and add a `Content-Security-Policy` header restricting script sources to `'self'` only (no inline scripts, no `eval`). Document as a security trade-off to revisit if the application renders third-party or user-generated HTML content.

---

### AQ-005: What are the JWT access token and refresh token lifetimes?

DP-001 resolved that the system will use short-lived access tokens and long-lived refresh tokens, but specific lifetimes were not defined. The access token lifetime directly affects the token denylist strategy (see DA-007): shorter lifetimes mean the denylist stays small and may not need a cache layer, while longer lifetimes increase the window of vulnerability after logout. The refresh token lifetime determines how long a user can stay "remembered" (see SBQ-005 resolution: always persist sessions) before being forced to re-authenticate.

**Recommendation:** 15-minute access token, 7-day refresh token. The 15-minute access token keeps the denylist manageable (at most 15 minutes of revoked tokens to track) and aligns with the BRD's 30-minute idle timeout (the refresh endpoint can check idle time). The 7-day refresh token provides a good balance between session persistence and security.

> **✅ Resolved (Engineering):** 15-minute access token, 7-day refresh token. The 15-minute access token keeps the denylist manageable and aligns with the BRD's 30-minute idle timeout (the refresh endpoint can check idle time). The 7-day refresh token balances session persistence with security.

---

### AQ-006: Should localStorage or sessionStorage be used for token persistence?

DP-002 resolved in favor of "localStorage/sessionStorage" but did not specify which one. This distinction matters: `localStorage` persists across browser sessions (tab close, browser restart) while `sessionStorage` is cleared when the tab closes. SBQ-005 resolved that sessions should always persist across browser sessions ("remember me by default"), which implies `localStorage` is the correct choice. However, this should be explicitly confirmed since it affects the security exposure window — tokens in `localStorage` persist indefinitely until explicitly removed or expired.

**Recommendation:** Use `localStorage` — this is the only option consistent with SBQ-005 (always persist sessions). The refresh token's expiry provides the natural session boundary.

> **✅ Resolved (Engineering):** Use `localStorage`. This is the only option consistent with SBQ-005 (always persist sessions). The refresh token's 7-day expiry (per AQ-005) provides the natural session boundary.

---

## Status Summary

| Section | Total Items | Resolved | Open |
|---|---|---|---|
| Scope Boundary Questions (SBQ) | 8 | 8 | 0 |
| Decision Points (DP) | 6 | 6 | 0 |
| Codebase Risks (CR) | 7 | — | 7 (informational) |
| Dependency Analysis (DA) | 7 | — | 7 (informational, updated with cross-refs) |
| Migration Concerns (MC) | 6 | — | 6 (informational) |
| Additional Questions (AQ) | 6 | 6 | 0 |
| **Totals** | **40** | **20** | **20** |

**Overall progress:** 20 of 20 actionable items resolved (SBQs + DPs + AQs). All Scope Boundary Questions, all Decision Points, and all Additional Questions are now resolved. No open actionable items remain. The 20 informational items (Codebase Risks, Dependency Analysis, Migration Concerns) have been updated with cross-references to the relevant resolutions and require no further decisions — they serve as implementation guidance for the Technical Requirements Document.
