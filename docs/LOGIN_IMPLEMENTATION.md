# Implementing Xsolla Login in this demo

Guide for Stage 2: adding the Xsolla Login widget to the base React + Vite + TypeScript app.

Status legend used below:
- **Confirmed**: read directly on an Xsolla docs page.
- **Unverified**: seen only in a search-result summary, or recalled from memory. Check against current docs before coding against it.

## 1. What we are building

- A "Log in" button in the header opens the Xsolla Login widget.
- After a successful login the app shows the user and a "Log out" button.
- No backend, if the token flow in section 4 allows it.

## 2. Prerequisites in Publisher Account

1. Create a Login project at https://publisher.xsolla.com. Its ID is the `projectId`. (Confirmed)
2. In the Login project's General settings, add the app URL to the callback URLs. Use `http://localhost:5173` for the dev server. (Confirmed that a callback URL setting exists; Unverified that `http://localhost` is accepted by the current Login API. The deprecated SDK README only shows an `https://localhost:9000` example.)
3. If using OAuth 2.0, create an OAuth 2.0 client and note its `clientId`, and register the redirect URI there. (Unverified where this lives: reportedly under the Login project's Security > OAuth 2.0.)

## 3. Package and widget setup

- Install: `npm install @xsolla/login-sdk`. (Confirmed that the package name is `@xsolla/login-sdk` and that `import XsollaLogin from '@xsolla/login-sdk'` is the import style.)
- Widget construction, from a search-result summary of the docs, not read directly:
  ```ts
  const widget = new XsollaLogin.Widget({
    projectId,
    clientId,
    responseType: 'code',
    state,
    redirectUri,
    scope: 'offline',
    preferredLocale: 'en_US',
  });
  widget.mount('xl_auth');
  widget.open();
  ```
  (Unverified: constructor option names, `mount`/`open`, and whether `Widget` is exposed as `XsollaLogin.Widget` or a named export. The page that documents `XsollaLogin.Api` spells the redirect option `redirectUrl` and the locale option `fullLocale`, so spelling differs between classes.)
- Keep the IDs in `.env` (git-ignored), exposed through Vite as `VITE_XSOLLA_LOGIN_PROJECT_ID` and `VITE_XSOLLA_OAUTH_CLIENT_ID`. Commit a `.env.example` with empty values.

## 4. Getting a token: the open decision

The widget docs I could read do not describe the token flow. What is known:

- With OAuth 2.0 (`responseType: 'code'`), the app receives an authorization `code` and must exchange it for a token at the Xsolla Login server. (Unverified, from search summaries.)
- With the plain JWT flow, the user is redirected to the callback URL with the token as a `token` query parameter, e.g. `https://app.example/?token=...`. It is a query parameter, not a hash fragment. (Confirmed on the SDK page for passwordless confirmation; Unverified for the widget.)
- Whether a browser-only app can do the code exchange without a client secret (public client, PKCE) is not documented in anything I could read. The OAuth 2.0 docs page returned 403.

Options, in order of preference for a demo:

| Option | Needs backend | Notes |
|---|---|---|
| A. JWT returned as `?token=` on the callback URL | No | Simplest. Requires the Login project to be configured for plain JWT (not OAuth 2.0). Read `token` from `location.search`, store it, then clean the URL. |
| B. OAuth 2.0 code exchange in the browser | No | Only if the OAuth client can be created as public (no secret). Needs the token endpoint and parameters confirmed. |
| C. OAuth 2.0 code exchange on a tiny server | Yes | Safest and most production-like; adds a Node server and scope. |

Recommendation: try A first. If the project forces OAuth 2.0, fall back to C. This replaces the earlier "client-only JWT/implicit" assumption, which the docs did not support.

## 5. App structure to add

```
src/auth/xsolla.ts           config built from VITE_ env vars
src/auth/AuthContext.tsx     token + user state, login(), logout()
src/components/LoginWidget.tsx   mounts and cleans up the widget
src/App.tsx                  wrap in provider, wire the Log in button, show user
.env.example
```

Behavior:
1. "Log in" calls `login()`, which opens the widget.
2. On return to the app, read the token (or code), validate `state` if used, store the token, remove it from the URL.
3. Decode the JWT payload to show user info. Claims reported to include user ID, email, username and groups. (Unverified: exact claim names. Log a decoded token once and use what is actually there.) No documented user-details GET endpoint was found.
4. "Log out" clears the stored token and calls `api.logout(token, 'sso')` or `'all'` to revoke server-side, and `api.clearSSO()` to clear the SSO cookie. (Confirmed: `XsollaLogin.Api` has `logout(token, session)` and `clearSSO()`, and `session` accepts `'sso'` or `'all'`.)
5. Store the token in memory plus `sessionStorage`. Avoid `localStorage` for tokens in anything beyond a demo.

## 6. Verification checklist

- `npm run build` and `npm run lint` pass.
- `npm run dev`, click Log in, complete login, see the user displayed.
- Reload the page: still logged in (token restored).
- Log out: state cleared, token no longer valid.
- Invalid or missing `state` on return is rejected (if `state` is used).

## 7. Things to confirm before coding

1. Exact `Widget` constructor options and methods (`mount`, `open`, close/destroy, events) in the current `@xsolla/login-sdk` types. After installing, read `node_modules/@xsolla/login-sdk` type definitions as the source of truth.
2. Which token flow the Login project supports (section 4) and whether localhost callbacks are allowed.
3. Where the OAuth 2.0 client ID is created.
4. Xsolla's newer SDK (https://developers.xsolla.com/sdk/) is what the deprecated `xsolla-login-js-sdk` README points to. Check whether it replaces `@xsolla/login-sdk` for new integrations.

## Sources

- Login Widget SDK API calls (Api class): https://developers.xsolla.com/authenticate-users/login/how-to/login-widget-sdk/
- Deprecated legacy SDK README: https://github.com/xsolla/xsolla-login-js-sdk
- Xsolla SDK landing page (not read): https://developers.xsolla.com/sdk/
