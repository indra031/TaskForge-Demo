# BRD-001: User Authentication and Registration (v1 — Rescoped)

**Date:** 2025-06-18 (updated 2025-06-19)
**Author:** Product Management
**Status:** Final Draft
**Source:** [MR-001](./MR-001-market-requirement.md)
**Supersedes:** [BRD-001 (initial draft)](./BRD-001-business-requirements.md)
**Priority:** P0 — Critical Path

> **What changed:** PdM reviewed the initial BRD and moved all email-dependent features
> (email verification, password reset, registration confirmation email) to v1.5. This
> eliminates the email delivery service as a v1 dependency, allowing v1 to ship faster.
> See the [change summary](#what-changed-from-brd-001) at the bottom of this document.

## 1. Overview

This document defines the business requirements for adding user authentication to TaskForge.
It covers user registration, login, and session management.

**The primary goal is to establish user identity so that:**
- Tasks can be **created by** a known user (ownership)
- Tasks can be **assigned to** a known user (accountability)
- The system knows **who is logged in** at all times (identity)
- Future iterations can **restrict what users see and do** based on roles (access control)

Authentication is not a standalone feature — it is the *prerequisite* for making TaskForge's
core task management workflows meaningful.

## 2. Epics and User Stories

### Epic 1: User Registration

**US-101: Self-service registration**
> As a new user, I want to create an account with my email and a password, so that I have
> an identity in TaskForge and tasks I create or am assigned to are linked to me.

Acceptance Criteria:
- [ ] User can register with email address and password
- [ ] Email must be unique across the system (no duplicate accounts)
- [ ] Password must meet minimum strength requirements (min 8 chars, at least one uppercase,
      one lowercase, one digit)
- [ ] User receives an in-app confirmation that registration was successful
- [ ] After registration, user is automatically logged in and redirected to their dashboard
- [ ] No email is sent at registration (email-based flows are deferred to v1.5)

**US-102: Registration validation and error handling**
> As a new user, I want clear feedback if my registration fails, so that I can correct the
> issue and try again.

Acceptance Criteria:
- [ ] If email is already registered, show a clear message (use generic messaging like
      "Unable to register with this email")
- [ ] If password doesn't meet requirements, show specific guidance on what's missing
- [ ] All validation errors are shown inline, not as page-level alerts
- [ ] Form preserves entered data (except password) on validation failure

### Epic 2: User Login

**US-201: Email and password login**
> As a registered user, I want to log in with my email and password, so that the system
> knows who I am and can show me tasks assigned to me and tasks I created.

Acceptance Criteria:
- [ ] User can log in with email and password
- [ ] Successful login redirects to the user's dashboard
- [ ] Failed login shows a generic error message ("Invalid email or password") — no hints
      about which field is wrong
- [ ] Account is temporarily locked after 5 consecutive failed attempts (15-minute lockout)
- [ ] Login state persists across browser sessions (remember me by default)

**US-202: Session management**
> As a logged-in user, I want my session to remain active for a reasonable time, so that
> I don't have to log in repeatedly during my workday.

Acceptance Criteria:
- [ ] Active sessions last at least 8 hours without requiring re-login
- [ ] Idle sessions expire after 30 minutes of inactivity
- [ ] When a session expires, user is redirected to login with a message
- [ ] User can manually log out from any page

**US-203: Logout**
> As a logged-in user, I want to log out securely, so that no one else can access my
> account on a shared device.

Acceptance Criteria:
- [ ] Logout option is accessible from the main navigation on every page
- [ ] After logout, user is redirected to the login page
- [ ] After logout, pressing the browser back button does not show authenticated content

## 3. Scope Boundaries

### In Scope (v1)

- Email + password registration (with in-app confirmation only)
- Email + password login
- Password strength validation
- Session management (login persistence, expiry, logout)
- Account lockout on repeated failures
- Responsive design (mobile and desktop)

### v1.5 — Fast Follow (email-dependent features)

*These features are deferred until the email delivery service is set up.
They are fully specified and ready to build — just not in the first cut.*

- Email verification (US-103) — verify user owns the registered email address
- Password reset / forgot password (US-301) — self-service password recovery via email
- Registration confirmation email — welcome email after successful registration

*Rationale for deferral: All three features depend on an email delivery service. Removing
them from v1 eliminates that external infrastructure dependency entirely, allowing v1 to
ship faster with zero external service dependencies.*

### Out of Scope (future iterations)

*Note: Role-based access control is the natural next step after v1 authentication.
v1 establishes identity; v2 uses that identity to enforce permissions.*

- Role-based access control (admin, member, viewer) — **planned for v2**
- Restricting task visibility by project membership — **planned for v2**
- Social login (Google, GitHub, Microsoft)
- Single Sign-On (SSO / SAML / OIDC) for enterprise
- Multi-factor authentication (MFA / 2FA)
- User profile management (name, avatar, preferences)
- Team/organization accounts
- API key authentication for integrations
- "Remember this device" trust management

## 4. Prioritization (MoSCoW)

| Priority     | Items                                                                  |
| ------------ | ---------------------------------------------------------------------- |
| **Must**     | Registration, login, logout, password validation, session management   |
| **Should**   | Account lockout                                                        |
| **Could**    | "Remember me" toggle, login activity log                               |
| **Won't v1** | Email verification, password reset, registration email (moved to v1.5) |
| **Won't**    | SSO, MFA, social login, role-based access (deferred to v2+)           |

## 5. User Experience Expectations

**Registration flow:**
1. User lands on TaskForge -> sees a landing/login page (not the dashboard)
2. Clicks "Create Account" -> registration form (email, password, confirm password)
3. Submits -> account created -> auto-logged-in -> redirected to dashboard
4. In-app success message: "Welcome to TaskForge! Your account is ready."

**Login flow:**
1. User navigates to TaskForge -> login page (email + password)
2. Submits valid credentials -> redirected to dashboard
3. Submits invalid credentials -> generic error, can retry (up to 5 times)

**Logout flow:**
1. User clicks "Logout" in the navigation bar
2. Session is terminated -> redirected to login page
3. Browser back button does not restore authenticated content

## 6. Non-Functional Requirements

| Category         | Requirement                                                          |
| ---------------- | -------------------------------------------------------------------- |
| **Performance**  | Login must respond within 500ms under normal load                    |
| **Security**     | User credentials must be stored securely (never in plain text)       |
| **Security**     | The authentication flow must not help attackers guess valid accounts  |
| **Availability** | Auth services must have 99.9% uptime                                |
| **Scalability**  | Must support up to 10,000 concurrent authenticated users in v1      |
| **Compliance**   | Must support GDPR account deletion requests                         |
| **Audit**        | All login attempts (success/failure) must be logged with timestamp   |

## 7. Dependencies and Assumptions

**Dependencies (v1):**
- None. v1 has no external service dependencies.

**Dependencies (v1.5):**
- Email delivery service for verification and password reset emails

**Assumptions:**
- Email is the sole identifier for v1 (no usernames)
- One account per email address
- No admin-created accounts in v1 — self-service registration only
- Existing data must remain accessible after the change (migration strategy is R&D's
  decision)
- v1 establishes identity only; restricting access based on roles is deferred to v2

---

## What Changed from BRD-001

| Section          | BRD-001 (initial draft)                           | BRD-001 v2 (rescoped)                             |
| ---------------- | ------------------------------------------------- | ------------------------------------------------- |
| **Epics**        | 3 epics, 7 user stories                          | 2 epics, 5 user stories (2 stories moved to v1.5) |
| **Scope**        | Included email verification, password reset       | v1.5 section created for email-dependent features |
| **MoSCoW**       | Email features in "Should"                        | Email features in "Won't v1"                      |
| **UX flows**     | Included email verification + password reset flows | Removed; added logout flow instead               |
| **Dependencies** | Email delivery service required                   | v1: zero dependencies. v1.5: email service        |
| **NFRs**         | Unchanged                                         | Unchanged                                         |
