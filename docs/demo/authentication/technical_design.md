# Technical Design: BRD-001 — User Authentication and Registration

**Date:** 2026-03-04
**Author:** Engineering
**Input:** [BRD-001 v2](../BRD-001-business-requirements%20-%20V2.md), [Discovery Report v4](discovery_report_v4.md)
**Status:** Approved — Strategy A (Vertical Slices) selected

---

## Part 1 — Architecture Decisions

### 1.1 Authentication Mechanism

| Aspect | Decision |
|--------|----------|
| **Approach** | JWT (stateless) with short-lived access token (15 min) + long-lived refresh token (7 days) |
| **Resolves** | DP-001 (JWT over server-side sessions), AQ-005 (token lifetimes) |
| **Implications** | Need JWT library dependency; refresh endpoint must check idle time to enforce BRD's 30-min idle timeout; token denylist required for logout (max 15 min of entries at any time) |

### 1.2 Token Storage

| Aspect | Decision |
|--------|----------|
| **Approach** | `localStorage` with `Authorization: Bearer <token>` header on every request |
| **Resolves** | DP-002 (localStorage over HttpOnly cookies), AQ-006 (localStorage over sessionStorage — required by always-persist sessions), SBQ-005 (always persist, no "remember me" toggle) |
| **Implications** | Angular HTTP interceptor attaches Bearer token; CSRF protection stays disabled (no cookie auth); XSS mitigation via CSP header (`script-src 'self'`) + Angular built-in sanitization (AQ-004); tokens survive browser restart; refresh token expiry is the natural session boundary |

### 1.3 Password Hashing

| Aspect | Decision |
|--------|----------|
| **Approach** | bcrypt via Spring Security's default `BCryptPasswordEncoder` |
| **Resolves** | DP-003 (bcrypt over Argon2) |
| **Implications** | Zero additional configuration; bean auto-registered by Spring Security starter |

### 1.4 User ID Type

| Aspect | Decision |
|--------|----------|
| **Approach** | UUID primary key, consistent with `BaseEntity` pattern and existing `assignee_id` column |
| **Resolves** | DP-004 (UUID over auto-increment) |
| **Implications** | User entity extends `BaseEntity`; type-compatible with `tasks.assignee_id`; no enumeration attacks |

### 1.5 Account Lockout Strategy

| Aspect | Decision |
|--------|----------|
| **Approach** | Database-stored lockout state: `failed_attempt_count` and `locked_until` on the user record; separate `login_audit` table logs every attempt |
| **Resolves** | DP-005 (database over in-memory cache), SBQ-004 (global per-account lockout), SBQ-006 (generic message "Too many failed attempts — please try again later") |
| **Implications** | Every failed login writes to DB (acceptable — BRD mandates audit logging anyway); lockout check runs before password verification; lockout expires passively (checked on next attempt, no scheduled cleanup needed) |

### 1.6 JPA Auditing (`createdBy`)

| Aspect | Decision |
|--------|----------|
| **Approach** | `AuditorAware<String>` bean returns the authenticated user's UUID as a string; anonymous requests return `"system"` |
| **Resolves** | DP-006 (store UUID string in existing VARCHAR `created_by` column), CR-002 (existing null values handled gracefully) |
| **Implications** | No schema migration needed for `created_by` column; existing null values remain as-is; UI must handle null/empty creator gracefully (already the case — no creator is displayed in current UI) |

### 1.7 JWT Library

| Aspect | Decision |
|--------|----------|
| **Approach** | `io.jsonwebtoken:jjwt` (jjwt-api, jjwt-impl, jjwt-jackson) — de facto standard in Spring ecosystem |
| **Resolves** | DA-002 (JWT library dependency required) |
| **Implications** | Three Maven artifacts (API + impl + JSON processor); signing key stored in `application.yml` (dev) with env variable override for production |

### 1.8 Frontend Layout Restructure

| Aspect | Decision |
|--------|----------|
| **Approach** | Two layout zones: **public layout** (login, register — centered card, no sidenav) and **authenticated layout** (current shell with toolbar + sidenav). Route config determines which layout wraps each route. |
| **Resolves** | CR-005 (AppComponent layout split), CR-004 (no auth infrastructure in frontend) |
| **Implications** | `AppComponent` becomes a thin shell with `<router-outlet>`; two layout components handle the visual frame; existing dashboard/task routes nest under the authenticated layout; new `/login` and `/register` routes nest under public layout |

### 1.9 Security Config Transition

| Aspect | Decision |
|--------|----------|
| **Approach** | Replace the current permit-all `SecurityFilterChain` with: public endpoints (auth routes, Swagger, actuator) explicitly permitted; all others require authentication via a JWT filter inserted before `UsernamePasswordAuthenticationFilter` |
| **Resolves** | CR-001 (security config transition risk), CR-007 (Swagger must stay accessible), SBQ-008 (cache-control headers on authenticated responses), AQ-004 (CSP header) |
| **Headers added** | `Cache-Control: no-store`, `Pragma: no-cache` on all authenticated responses; `Content-Security-Policy: script-src 'self'` globally |

### 1.10 Migration Plan

| Concern | Strategy |
|---------|----------|
| **Legacy data ownership** (MC-001, MC-004) | Leave `created_by` null on existing records. No backfill — v1 has no authorization, so all authenticated users see all data. Revisit when v2 adds role-based access. |
| **`assignee_id` foreign key** (MC-002, CR-003) | Add FK constraint to users table with `ON DELETE SET NULL`. Safe because existing seed data has all-null `assignee_id` values. Satisfies GDPR deletion requirement from BRD. |
| **API cutover** (MC-003) | Frontend and backend auth changes deploy together. No transitional "auth optional" period. |
| **Bookmarked URLs** (MC-006) | Auth guard stores the attempted URL; after login, redirects to the saved URL (return-URL pattern). Default redirect: `/dashboard`. |
| **`created_by` column type** (MC-005) | No schema change. VARCHAR(255) accommodates UUID strings. Semantic contract change is documented. |

### 1.11 API Contract

#### Public Endpoints (no auth required)

| Method | Path | Request Body | Success Response | Error Responses |
|--------|------|-------------|-----------------|-----------------|
| `POST` | `/api/v1/auth/register` | `RegisterRequest` | `201` — `AuthResponse` | `400` — validation errors; `409` — "Unable to register with this email" |
| `POST` | `/api/v1/auth/login` | `LoginRequest` | `200` — `AuthResponse` | `401` — "Invalid email or password"; `423` — "Too many failed attempts — please try again later" |
| `POST` | `/api/v1/auth/refresh` | `RefreshRequest` | `200` — `AuthResponse` | `401` — invalid/expired refresh token |

#### Authenticated Endpoints

| Method | Path | Request Body | Success Response | Error Responses |
|--------|------|-------------|-----------------|-----------------|
| `POST` | `/api/v1/auth/logout` | `LogoutRequest` | `204` — no content | `401` — unauthenticated |
| `GET` | `/api/v1/auth/me` | — | `200` — `UserResponse` | `401` — unauthenticated |

#### DTO Shapes

**RegisterRequest**
| Field | Type | Validation | Notes |
|-------|------|-----------|-------|
| `email` | `String` | Required, valid email format, max 255 | Unique across system |
| `password` | `String` | Required, min 8, ≥1 uppercase, ≥1 lowercase, ≥1 digit | Never returned in responses |
| `confirmPassword` | `String` | Required, must match `password` | Cross-field validation |
| `fullName` | `String` | Optional, max 100 | SBQ-002, AQ-001 |

**LoginRequest**
| Field | Type | Validation |
|-------|------|-----------|
| `email` | `String` | Required, valid email format |
| `password` | `String` | Required |

**RefreshRequest**
| Field | Type | Validation |
|-------|------|-----------|
| `refreshToken` | `String` | Required |

**LogoutRequest**
| Field | Type | Validation |
|-------|------|-----------|
| `accessToken` | `String` | Required — added to denylist for remaining TTL |

**AuthResponse**
| Field | Type | Notes |
|-------|------|-------|
| `accessToken` | `String` | JWT, 15-min expiry |
| `refreshToken` | `String` | Opaque or JWT, 7-day expiry |
| `user` | `UserResponse` | Current user info |

**UserResponse**
| Field | Type | Notes |
|-------|------|-------|
| `id` | `UUID` | User's ID |
| `email` | `String` | User's email |
| `fullName` | `String?` | Null if not provided at registration |

### 1.12 Data Model

#### `users` Table (new — Flyway V4)

| Column | Type | Constraints | Notes |
|--------|------|------------|-------|
| `id` | `UUID` | PK, default `gen_random_uuid()` | BaseEntity pattern |
| `email` | `VARCHAR(255)` | NOT NULL, UNIQUE | Login identifier |
| `password_hash` | `VARCHAR(255)` | NOT NULL | bcrypt hash |
| `full_name` | `VARCHAR(100)` | nullable | SBQ-002, AQ-001 |
| `failed_attempt_count` | `INTEGER` | NOT NULL, default 0 | Lockout tracking |
| `locked_until` | `TIMESTAMPTZ` | nullable | Null = not locked |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, default `now()` | BaseEntity |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, default `now()` | BaseEntity |
| `created_by` | `VARCHAR(255)` | nullable | BaseEntity |

Indexes: `idx_users_email` (unique)

#### `refresh_tokens` Table (new — Flyway V4)

| Column | Type | Constraints | Notes |
|--------|------|------------|-------|
| `id` | `UUID` | PK | |
| `user_id` | `UUID` | NOT NULL, FK → users(id) ON DELETE CASCADE | |
| `token_hash` | `VARCHAR(255)` | NOT NULL, UNIQUE | SHA-256 hash of the refresh token |
| `expires_at` | `TIMESTAMPTZ` | NOT NULL | 7 days from issuance |
| `last_used_at` | `TIMESTAMPTZ` | NOT NULL | For idle timeout (30-min check on refresh) |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, default `now()` | |

Indexes: `idx_refresh_tokens_user_id`, `idx_refresh_tokens_token_hash` (unique)

#### `token_denylist` Table (new — Flyway V4)

| Column | Type | Constraints | Notes |
|--------|------|------------|-------|
| `id` | `UUID` | PK | |
| `token_jti` | `VARCHAR(255)` | NOT NULL, UNIQUE | JWT ID claim from the access token |
| `expires_at` | `TIMESTAMPTZ` | NOT NULL | Auto-cleanup: entries only live ≤15 min |

Index: `idx_token_denylist_jti` (unique)

#### `login_audit` Table (new — Flyway V4)

| Column | Type | Constraints | Notes |
|--------|------|------------|-------|
| `id` | `UUID` | PK | |
| `email` | `VARCHAR(255)` | NOT NULL | Looked-up email (may not match a user) |
| `success` | `BOOLEAN` | NOT NULL | |
| `failure_reason` | `VARCHAR(50)` | nullable | `INVALID_CREDENTIALS`, `ACCOUNT_LOCKED`, etc. |
| `ip_address` | `VARCHAR(45)` | nullable | IPv4/IPv6 |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, default `now()` | BRD NFR: all attempts logged with timestamp |

Index: `idx_login_audit_email_created_at`

#### FK Addition (Flyway V5 — separate migration)

```
ALTER TABLE tasks ADD CONSTRAINT fk_tasks_assignee
  FOREIGN KEY (assignee_id) REFERENCES users(id) ON DELETE SET NULL;
```

### 1.13 User Stories Traceability

| Component | User Stories Covered |
|-----------|---------------------|
| Registration endpoint + form | US-101, US-102 |
| Login endpoint + form | US-201 |
| JWT tokens + refresh + interceptor | US-202 |
| Logout endpoint + guard + state clear | US-203 |
| Account lockout (DB tracking) | US-201 (AC: 5 attempts, 15-min lockout) |
| Snackbar after registration | SBQ-001 (5s auto-dismiss on dashboard) |
| Full Name field | SBQ-002 (optional, VARCHAR 100) |
| Return-URL pattern | MC-006 (bookmark preservation) |

---

## Part 2 — Implementation Phases

### Phasing Strategy Options

#### Strategy A: Vertical Slices (Feature-Complete per Slice)

| Phase | Scope | Stable? |
|-------|-------|---------|
| 1 | **Backend auth core**: User entity, migrations, AuthService (register + login + lockout + audit), JWT service, SecurityConfig with JWT filter, all auth endpoints. No frontend changes — test via Swagger. | Yes — existing frontend works unchanged (all endpoints still accessible, JWT filter only activates on requests with tokens) |
| 2 | **Frontend auth**: Layout restructure, login + register components, auth store, HTTP interceptor, auth guard, logout. Connect to backend. | Yes — full auth flow works end-to-end |
| 3 | **Session management & hardening**: Refresh token rotation, idle timeout enforcement, token denylist (logout), `AuditorAware` bean, cache-control headers, CSP header, assignee FK migration, return-URL pattern. | Yes — complete BRD coverage |

**Trade-offs:** Backend can be reviewed/tested in isolation via Swagger before frontend work begins. Phase 1 is large but self-contained. Risk: phase 1 is heavy (~60% of total work).

#### Strategy B: Horizontal Layers (Backend Then Frontend, Finer Granularity)

| Phase | Scope | Stable? |
|-------|-------|---------|
| 1 | **Data layer**: User entity, all migrations (users, refresh_tokens, token_denylist, login_audit, assignee FK), repositories. No endpoints. | Yes — Flyway runs, existing app unchanged |
| 2 | **Auth services**: JwtService, AuthService (register, login, lockout, audit logging), `BCryptPasswordEncoder` bean, `AuditorAware` bean. Unit tested, no HTTP layer. | Yes — services exist but aren't wired to endpoints |
| 3 | **Backend HTTP layer**: AuthController (all 5 endpoints), SecurityConfig rewrite (JWT filter, public/protected routes, headers), refresh + logout + denylist logic. | Yes — full backend auth works, testable via Swagger. Existing frontend breaks here (now requires auth). |
| 4 | **Frontend auth**: Layout restructure, login + register pages, auth store, interceptor, guard, logout, snackbar, return-URL. | Yes — full end-to-end auth flow |

**Trade-offs:** Smaller phases, easier code review. But phase 3→4 transition is a breaking change — frontend stops working until phase 4 completes. Good for teams where backend and frontend are reviewed by different people.

#### Strategy C: Backend + Frontend in Parallel (Concurrent Tracks)

| Phase | Scope | Stable? |
|-------|-------|---------|
| 1a (backend) | Data layer + auth services + JWT service (no endpoints, no security config change) | Yes — no external behavior change |
| 1b (frontend, parallel) | Layout restructure + login/register components + auth store + interceptor + guard — all wired to a **mock auth service** that returns fake tokens | Yes — frontend works with mock, existing routes unaffected |
| 2 | **Integration**: AuthController + SecurityConfig rewrite on backend; swap mock for real API on frontend. Deploy together. | Yes — full end-to-end |
| 3 | **Hardening**: Token denylist, refresh rotation, idle timeout, `AuditorAware`, cache-control + CSP headers, assignee FK, return-URL, audit log. | Yes — complete BRD coverage |

**Trade-offs:** Fastest wall-clock time if backend/frontend work can happen concurrently. Requires a mock service contract upfront. Integration phase (2) is riskier — two large changesets merge at once. Best for two-developer teams.

---

### Selected: Strategy A (Vertical Slices) ✅

Strategy A minimizes context-switching and produces a testable backend before touching the frontend. The phases below follow Strategy A.

---

### Phase 1 — Backend Authentication Core

**Scope:** User entity, database migrations, auth services, JWT infrastructure, all auth endpoints, security config rewrite.

**What to Build:**

**Data Model**
- `User` entity extending `BaseEntity`: `email` (unique), `passwordHash`, `fullName` (nullable), `failedAttemptCount` (default 0), `lockedUntil` (nullable). Domain methods: `isLocked()`, `recordFailedAttempt(maxAttempts, lockoutDuration)`, `resetFailedAttempts()`, `lock(duration)`.
- `RefreshToken` entity: `userId`, `tokenHash`, `expiresAt`, `lastUsedAt`. No BaseEntity — lightweight.
- `LoginAudit` entity: `email`, `success`, `failureReason`, `ipAddress`, `createdAt`. Append-only, no updates.
- `TokenDenylistEntry` entity: `tokenJti`, `expiresAt`. Checked on every authenticated request.
- Flyway V4: Create `users`, `refresh_tokens`, `token_denylist`, `login_audit` tables with indexes.
- Flyway V5: Add FK from `tasks.assignee_id` → `users.id` with `ON DELETE SET NULL`.

**Repositories**
- `UserRepository`: `findByEmail(String)`, `existsByEmail(String)`
- `RefreshTokenRepository`: `findByTokenHash(String)`, `deleteByUserId(UUID)`, `deleteExpiredTokens(Instant)`
- `LoginAuditRepository`: standard save (append-only)
- `TokenDenylistRepository`: `existsByTokenJti(String)`, `deleteExpiredEntries(Instant)`

**Services**
- `JwtService`: Generate access token (with `jti` claim, user ID as subject, 15-min expiry). Generate refresh token (random value, hashed for storage). Parse/validate access token. Extract user ID and `jti` from token.
- `AuthService`:
  - `register(command)`: Validate email uniqueness (throw if duplicate — generic message), hash password, create User, generate token pair, log successful registration, return auth response.
  - `login(command, ipAddress)`: Find user by email, check lockout (`isLocked()`), verify password, handle failure (increment counter, lock if threshold reached, audit log), handle success (reset counter, generate tokens, audit log).
  - `refresh(refreshToken)`: Hash the incoming token, look up in DB, verify not expired, check idle timeout (if `lastUsedAt` + 30min < now → reject, force re-login), update `lastUsedAt`, generate new access token, return auth response.
  - `logout(accessToken)`: Extract `jti` and expiry from token, add to denylist with expiry. Delete associated refresh tokens for the user.
  - `getCurrentUser(userId)`: Return user data for the `/me` endpoint.
- `AuditorAware<String>` bean: Return authenticated user's UUID from the security context, or `"system"` for anonymous requests.

**Controller**
- `AuthController` at `/api/v1/auth` with all 5 endpoints from the API contract (section 1.11).

**Security Config**
- Replace permit-all with:
  - Public: `/api/v1/auth/register`, `/api/v1/auth/login`, `/api/v1/auth/refresh`, `/swagger-ui/**`, `/api-docs/**`
  - Authenticated: everything else
- JWT authentication filter: extract token from `Authorization` header, validate, check denylist, set `SecurityContext`.
- Response headers: `Cache-Control: no-store`, `Pragma: no-cache` on authenticated responses.
- `Content-Security-Policy: script-src 'self'` on all responses.
- CORS: keep existing config (localhost:4200), add `Authorization` to exposed headers.

**Exceptions**
- `EmailAlreadyExistsException` (409) — message: "Unable to register with this email"
- `InvalidCredentialsException` (401) — message: "Invalid email or password"
- `AccountLockedException` (423) — message: "Too many failed attempts — please try again later"
- `InvalidTokenException` (401) — message: "Invalid or expired token"

**Modified/New Files**
| Action | Path |
|--------|------|
| New | `model/User.java`, `model/RefreshToken.java`, `model/LoginAudit.java`, `model/TokenDenylistEntry.java` |
| New | `repository/UserRepository.java`, `repository/RefreshTokenRepository.java`, `repository/LoginAuditRepository.java`, `repository/TokenDenylistRepository.java` |
| New | `dto/RegisterRequest.java`, `dto/LoginRequest.java`, `dto/RefreshRequest.java`, `dto/LogoutRequest.java`, `dto/AuthResponse.java`, `dto/UserResponse.java` |
| New | `mapper/UserMapper.java`, `mapper/UserMapperImpl.java` |
| New | `service/JwtService.java`, `service/AuthService.java` |
| New | `controller/AuthController.java` |
| New | `security/JwtAuthenticationFilter.java`, `security/JwtAuthenticationToken.java` |
| New | `exception/EmailAlreadyExistsException.java`, `exception/InvalidCredentialsException.java`, `exception/AccountLockedException.java`, `exception/InvalidTokenException.java` |
| New | `db/migration/V4__create_auth_tables.sql`, `db/migration/V5__add_assignee_fk.sql` |
| Modified | `config/SecurityConfig.java` — rewrite filter chain |
| Modified | `config/JpaConfig.java` — register `AuditorAware` bean |
| Modified | `pom.xml` — add jjwt dependencies |
| Modified | `application.yml` — add JWT secret key + token expiry config |

**Review Checklist**
- [ ] `mvn clean verify` passes (compile + existing tests)
- [ ] Flyway migrations run without error against fresh database (`docker compose down -v && docker compose up -d`, then start backend)
- [ ] Swagger UI accessible at `/swagger-ui.html` without authentication
- [ ] `POST /api/v1/auth/register` creates user and returns tokens
- [ ] `POST /api/v1/auth/login` returns tokens for valid credentials
- [ ] `POST /api/v1/auth/login` returns 401 for invalid credentials
- [ ] 5 failed logins → 423 response; 6th attempt also 423; after 15 min → login works again
- [ ] `POST /api/v1/auth/refresh` returns new access token
- [ ] `POST /api/v1/auth/logout` denylists the access token; subsequent requests with that token return 401
- [ ] `GET /api/v1/auth/me` returns current user info
- [ ] `GET /api/v1/tasks` without token returns 401
- [ ] `GET /api/v1/tasks` with valid token returns 200 (existing data still accessible)
- [ ] Login audit table populated on both success and failure
- [ ] Duplicate email registration returns 409 with generic message

**Test Scenarios**
| Scenario | Type | What to Assert |
|----------|------|----------------|
| Register with valid data | Unit | User created, password hashed, tokens returned |
| Register with duplicate email | Unit | `EmailAlreadyExistsException` thrown |
| Register with weak password | Unit (validation) | Constraint violations returned |
| Login success | Unit | Tokens returned, audit logged, failed count reset |
| Login wrong password | Unit | `InvalidCredentialsException`, failed count incremented, audit logged |
| Login locked account | Unit | `AccountLockedException`, audit logged with `ACCOUNT_LOCKED` reason |
| Lockout after 5 failures | Unit | 5th failure triggers lock; 6th attempt rejected without password check |
| Refresh valid token | Unit | New access token returned, `lastUsedAt` updated |
| Refresh expired token | Unit | `InvalidTokenException` |
| Refresh idle timeout | Unit | Token with `lastUsedAt` > 30 min ago → rejected |
| Logout denylists token | Unit | Token `jti` added to denylist |
| JWT filter — valid token | Unit | SecurityContext populated |
| JWT filter — denylisted token | Unit | 401 returned |
| JWT filter — expired token | Unit | 401 returned |
| JWT filter — no token | Unit | Request passes through (public endpoint handling) |

**Out of Scope for Phase 1**
- All frontend changes
- Token cleanup scheduled job (expired denylist/refresh entries — negligible volume in dev)
- Rate limiting by IP
- Refresh token rotation (single-use refresh tokens)

**Interface Contract for Phase 2**
- Backend exposes 5 endpoints per section 1.11
- Tokens are JWTs with `sub` = user UUID, `jti` = unique ID, `exp` = expiry timestamp
- Access token goes in `Authorization: Bearer <token>` header
- Refresh token is an opaque string sent in request body
- All error responses use RFC 9457 ProblemDetail format (consistent with existing error handling)

---

### Phase 2 — Frontend Authentication

**Scope:** Layout restructure, login and register pages, auth store, HTTP interceptor, auth guard, logout, snackbar, return-URL pattern.

**What to Build:**

**Layout Restructure**
- `AuthLayoutComponent`: Centered card layout (no sidenav, no toolbar — or minimal branded toolbar). Wraps `/login` and `/register` routes.
- `MainLayoutComponent`: Extract current AppComponent shell (toolbar + sidenav + router-outlet). Wraps all authenticated routes (`/dashboard`, `/tasks`, etc.). Add logout button to toolbar or sidenav.
- `AppComponent`: Becomes a thin shell — just `<router-outlet>` with no layout.

**Auth Store** (NgRx Signal Store)
- State: `user: UserResponse | null`, `accessToken: string | null`, `refreshToken: string | null`, `loading: boolean`, `error: string | null`
- Computed: `isAuthenticated` (user is not null and accessToken is not null), `userDisplayName` (fullName ?? email)
- Methods:
  - `register(request)`: Call auth API, store tokens in localStorage, store user in state, navigate to `/dashboard` with snackbar flag.
  - `login(request)`: Call auth API, store tokens in localStorage, store user in state, navigate to return URL or `/dashboard`.
  - `logout()`: Call logout API (best-effort), clear localStorage, clear state, navigate to `/login`.
  - `refresh()`: Call refresh API, update tokens in localStorage and state.
  - `initializeFromStorage()`: On app startup, check localStorage for tokens; if access token exists and is not expired, populate state; if access token is expired but refresh token exists, attempt refresh; otherwise clear state.

**Auth Service** (HTTP layer)
- `AuthApiService`: Wraps API calls to `/api/v1/auth/*` endpoints. Returns Observables. No business logic.

**HTTP Interceptor**
- Reads access token from `AuthStore`.
- Attaches `Authorization: Bearer <token>` to all requests to the API base URL.
- On 401 response: attempt token refresh (once); if refresh fails, trigger logout and redirect to `/login`.
- Skip attaching token for auth endpoints (register, login, refresh).

**Auth Guard**
- `authGuard` (functional guard): If `isAuthenticated` → allow. Otherwise → store current URL as return URL, redirect to `/login`.
- `publicGuard` (functional guard): If `isAuthenticated` → redirect to `/dashboard`. Otherwise → allow. (Prevents logged-in users from seeing login/register pages.)

**Login Page**
- Route: `/login`
- Form fields: email (required, email format), password (required)
- Validation: inline errors per field
- Submit: calls `authStore.login()`
- Error display: generic error message below form (from store's error state)
- Link: "Create Account" navigates to `/register`
- No "Remember me" toggle (SBQ-005)
- Lockout message handled by the same error display

**Register Page**
- Route: `/register`
- Form fields: fullName (optional, max 100), email (required, email format), password (required, strength indicator), confirmPassword (required, must match)
- Password strength: inline guidance showing which requirements are met/unmet (US-102)
- Validation: inline errors; form preserves data except passwords on failure (US-102)
- Submit: calls `authStore.register()`
- Error display: generic error for duplicate email; specific guidance for password requirements
- Link: "Already have an account? Log in" navigates to `/login`

**Snackbar After Registration**
- On successful registration, navigate to `/dashboard` with a query param or state flag.
- `DashboardPageComponent` checks for the flag and triggers `MatSnackBar.open("Welcome to TaskForge! Your account is ready.", "Close", { duration: 5000 })` (SBQ-001, AQ-003).

**Routing Changes**
```
/login        → AuthLayout > LoginPageComponent        (publicGuard)
/register     → AuthLayout > RegisterPageComponent     (publicGuard)
/dashboard    → MainLayout > DashboardPageComponent    (authGuard)
/tasks/**     → MainLayout > ... (future)              (authGuard)
/             → redirect to /dashboard
```

**Modified/New Files**
| Action | Path |
|--------|------|
| New | `features/auth/auth.routes.ts` |
| New | `features/auth/pages/login-page.component.ts` |
| New | `features/auth/pages/register-page.component.ts` |
| New | `features/auth/services/auth-api.service.ts` |
| New | `features/auth/store/auth.store.ts` |
| New | `core/guards/auth.guard.ts` |
| New | `core/guards/public.guard.ts` |
| New | `core/interceptors/auth.interceptor.ts` |
| New | `core/layout/auth-layout.component.ts` |
| New | `core/layout/main-layout.component.ts` |
| Modified | `app.component.ts` — strip layout, keep thin shell |
| Modified | `app.routes.ts` — restructure with layouts and guards |
| Modified | `app.config.ts` — register auth interceptor |
| Modified | `features/dashboard/dashboard-page.component.ts` — add snackbar trigger |

**Review Checklist**
- [ ] `cd frontend && ng build` succeeds
- [ ] Visiting `/dashboard` while unauthenticated redirects to `/login`
- [ ] Visiting `/login` while authenticated redirects to `/dashboard`
- [ ] Registration form: all validations work (email format, password strength, confirm match, optional name)
- [ ] Successful registration → auto-login → dashboard → snackbar "Welcome to TaskForge!"
- [ ] Duplicate email registration → inline error "Unable to register with this email"
- [ ] Login with valid credentials → dashboard
- [ ] Login with invalid credentials → "Invalid email or password"
- [ ] 5 failed logins → "Too many failed attempts — please try again later"
- [ ] Logout → redirected to `/login`; browser back button does not show dashboard (SBQ-008)
- [ ] Refreshing the browser while authenticated stays authenticated (localStorage persistence)
- [ ] Closing and reopening the browser stays authenticated (SBQ-005)
- [ ] Bookmarked `/dashboard` URL → login → returns to `/dashboard` after auth (MC-006)
- [ ] Existing dashboard and task features work normally when authenticated

**Test Scenarios**
| Scenario | Type | What to Assert |
|----------|------|----------------|
| Auth guard blocks unauthenticated access | Unit | Redirects to `/login`, stores return URL |
| Public guard blocks authenticated access | Unit | Redirects to `/dashboard` |
| Interceptor attaches Bearer token | Unit | Authorization header present on API requests |
| Interceptor refreshes on 401 | Unit | Refresh called, request retried with new token |
| Interceptor logs out on refresh failure | Unit | State cleared, navigated to `/login` |
| Auth store initializes from localStorage | Unit | If valid token → authenticated; if expired → attempts refresh |
| Login form validation | Unit | Email format, required fields |
| Register form validation | Unit | Password strength rules, confirm match, optional name max length |
| Logout clears state | Unit | localStorage cleared, store reset, navigated to `/login` |

**Out of Scope for Phase 2**
- Token cleanup (scheduled backend job)
- Refresh token rotation
- User profile editing (AQ-002 — deferred)
- Onboarding flow (SBQ-003 — standard dashboard with empty state)

**Interface Contract for Phase 3**
- Auth store exposes `isAuthenticated`, `user`, `userDisplayName` signals for use by any component.
- `AuthApiService` is the single point of contact for auth HTTP calls.
- Interceptor handles token lifecycle transparently — feature components don't need to know about auth.

---

### Phase 3 — Session Management & Hardening

**Scope:** Backend security hardening (JWT filter, SecurityConfig rewrite), idle timeout enforcement, refresh token rotation, token cleanup, remaining security headers, edge cases.

**What to Build:**

**Backend Security Hardening**
- `JwtAuthenticationFilter`: New `OncePerRequestFilter` in `security/` package. Extracts `Authorization: Bearer <token>` header, validates via `JwtService.parseAccessToken()`, checks denylist via `TokenDenylistRepository.existsByTokenJti()`, populates `SecurityContext` with user ID. Skips auth endpoints (`/api/v1/auth/register`, `/api/v1/auth/login`, `/api/v1/auth/refresh`). On missing/invalid/denylisted token: do not set context (Spring Security handles 401).
- `JwtAuthenticationToken`: New `AbstractAuthenticationToken` in `security/` package. Holds `userId` (UUID) as principal. Used by the filter to set `SecurityContext`.
- `SecurityConfig` rewrite: Replace `anyRequest().permitAll()` with: public endpoints (`/api/v1/auth/register`, `/api/v1/auth/login`, `/api/v1/auth/refresh`, `/swagger-ui/**`, `/api-docs/**`) explicitly permitted; all others require authentication. Insert `JwtAuthenticationFilter` before `UsernamePasswordAuthenticationFilter`. Add `Authorization` to CORS allowed/exposed headers.
- Fix `AuthController.me()`: Change from `@RequestParam UUID userId` to extracting userId from `SecurityContext` (populated by the JWT filter). Remove the query param — this endpoint is authenticated.
- Update `AuditorAware` bean in `JpaConfig`: Read authenticated user UUID from `SecurityContext`; return `"system"` for anonymous requests.

**Idle Timeout (30-min)**
- The refresh endpoint already checks `lastUsedAt`. Frontend must proactively detect idle timeout.
- Frontend: Track last user interaction (mouse, keyboard, scroll). If idle > 25 min, show a "Session expiring" warning. If idle > 30 min, do not attempt refresh — clear state and redirect to `/login` with message "Your session has expired due to inactivity."
- Backend: Refresh endpoint rejects tokens where `lastUsedAt + 30min < now`. Return 401 with ProblemDetail explaining session expired.

**Refresh Token Rotation**
- On each refresh call, invalidate the old refresh token and issue a new one. Store new hash, update `lastUsedAt`.
- Detect reuse of an old refresh token → revoke all tokens for that user (possible token theft). Log a security event.

**Token Cleanup Job**
- Scheduled task (`@Scheduled`): delete expired entries from `token_denylist` and `refresh_tokens` tables. Run every hour.

**Remaining Headers**
- Verify `Cache-Control: no-store` and `Pragma: no-cache` are set on all authenticated responses (may already be done in Phase 1 SecurityConfig).
- Verify `Content-Security-Policy: script-src 'self'` is present.

**Edge Cases**
- Multiple tabs: Refresh token rotation means only one tab can refresh at a time. Use a localStorage-based lock or event to coordinate refresh across tabs (listen for `storage` events).
- Concurrent 401s: Interceptor must queue requests during refresh, not fire multiple refresh calls.

**Modified/New Files**
| Action | Path |
|--------|------|
| New | `backend: security/JwtAuthenticationFilter.java` — JWT validation + SecurityContext population |
| New | `backend: security/JwtAuthenticationToken.java` — Authentication token holding userId |
| Modified | `backend: config/SecurityConfig.java` — rewrite filter chain, add JWT filter, security headers, CORS update |
| Modified | `backend: controller/AuthController.java` — fix `/me` endpoint to use SecurityContext instead of query param |
| Modified | `backend: config/JpaConfig.java` — `AuditorAware` bean reads user UUID from SecurityContext |
| New | `backend: config/ScheduledTasksConfig.java` or method in existing service |
| Modified | `backend: service/AuthService.java` — refresh token rotation, reuse detection |
| Modified | `frontend: core/interceptors/auth.interceptor.ts` — request queuing during refresh |
| New | `frontend: core/services/idle.service.ts` — idle timeout tracking |
| Modified | `frontend: features/auth/store/auth.store.ts` — idle timeout integration |

**Review Checklist**
- [ ] `GET /api/v1/tasks` without token returns 401
- [ ] `GET /api/v1/tasks` with valid Bearer token returns 200
- [ ] Swagger UI accessible at `/swagger-ui.html` without authentication
- [ ] `GET /api/v1/auth/me` returns user info from JWT (no query param)
- [ ] Denylisted token (after logout) returns 401 on subsequent requests
- [ ] `created_by` field on new records contains the authenticated user's UUID
- [ ] Idle for 30+ min → session expires, redirected to login with message
- [ ] Refresh token rotation: each refresh returns a new refresh token
- [ ] Old refresh token cannot be reused (returns 401)
- [ ] Multiple browser tabs: refresh happens once, all tabs stay authenticated
- [ ] Token cleanup job removes expired entries (verify with DB query)
- [ ] `Cache-Control: no-store` present on authenticated API responses
- [ ] `Content-Security-Policy: script-src 'self'` present in response headers
- [ ] Full end-to-end: register → use app → idle timeout → re-login → return to previous page

**Test Scenarios**
| Scenario | Type | What to Assert |
|----------|------|----------------|
| JWT filter — valid token | Unit (backend) | SecurityContext populated with user ID |
| JWT filter — denylisted token | Unit (backend) | 401 returned |
| JWT filter — expired token | Unit (backend) | 401 returned |
| JWT filter — no token on protected endpoint | Unit (backend) | 401 returned |
| JWT filter — no token on public endpoint | Unit (backend) | Request passes through |
| `/me` endpoint returns user from SecurityContext | Unit (backend) | User info returned without query param |
| AuditorAware returns user UUID when authenticated | Unit (backend) | `created_by` populated with UUID |
| AuditorAware returns "system" when anonymous | Unit (backend) | `created_by` populated with "system" |
| Idle timeout triggers logout | Unit (frontend) | State cleared after 30 min idle |
| Refresh token rotation | Unit (backend) | Old token invalidated, new token issued |
| Refresh token reuse detection | Unit (backend) | All user tokens revoked |
| Concurrent refresh requests | Unit (frontend) | Only one refresh call made, others queued |
| Cleanup job deletes expired entries | Unit (backend) | Expired denylist and refresh entries removed |

**Out of Scope (future iterations)**
- Rate limiting by IP
- Login activity log UI (BRD "Could")
- User profile management (AQ-002)
- Role-based access control (BRD v2)
- Email verification, password reset (BRD v1.5)
- Social login, SSO, MFA (BRD "Won't")
