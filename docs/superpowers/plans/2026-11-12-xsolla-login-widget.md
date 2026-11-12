# Xsolla Login Widget Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Integrate the Xsolla Login widget into the demo with JWT callback sign-in, session persistence, and logout.

**Architecture:** Build widget configuration from Vite environment variables. A React auth context owns session state and callback handling; a widget component mounts the SDK and opens it on request. The existing app consumes auth state for its header.

**Tech Stack:** React, TypeScript, Vite, `@xsolla/login-sdk`.

**Spec:** `docs/LOGIN_IMPLEMENTATION.md` (recommended JWT query-token flow).

## Global Constraints

- Keep tokens in memory and `sessionStorage`, never `localStorage`.
- No backend or OAuth code exchange.
- The callback URL must be registered in the Xsolla Publisher Account.
- Preserve existing unrelated work in the project.

## Review Focus

- Missing project ID: show a clear configuration message and do not initialize the SDK.
- Invalid callback token: do not crash; clean the token from the URL.
- Reload: restore token from `sessionStorage`.
- Logout API failure: clear the local session regardless.
- React StrictMode remount: clean up widget mounts without duplicate iframe state.

### Task 1: Auth configuration and state

**Files:** Create `src/auth/xsolla.ts`, `src/auth/AuthContext.tsx`, `.env.example`; create local ignored `.env.local` using the existing project ID.

- Configure widget and API from `VITE_XSOLLA_LOGIN_PROJECT_ID` and current origin.
- Capture JWT callback query parameter, decode a display label defensively, persist in session storage, then remove token from URL.
- Expose `user`, `login()`, and `logout()`; logout revokes all sessions and clears SSO best-effort.

### Task 2: Widget and app wiring

**Files:** Create `src/components/LoginWidget.tsx`; modify `src/App.tsx`.

- Mount/unmount the SDK in an effect; use `xl.open()` for the button action.
- Wrap app in auth provider, render sign-in or user/logout controls, and display configuration errors.

### Verification

- Run `npm run build` and `npm run lint` from the project root.
- Manually confirm live Publisher Account callback configuration and end-to-end registration with the user's Xsolla project.
