# Frontend Security Architecture & Checklist

This document details the defense-in-depth security architecture implemented for the **নিজের বলার মতো একটা গল্প** community frontend application.

---

## Security Implementation Checklist

| Category | Requirement | Implementation Detail | Status |
|---|---|---|---|
| **Headers** | Strict Content-Security-Policy | Nonce-ready CSP restricting `default-src 'self'`, fonts to Google Fonts / self, images to self and configured storage domains, `frame-ancestors 'none'`, object-src 'none'. | Verified |
| **Headers** | HSTS (Strict-Transport-Security) | `max-age=31536000; includeSubDomains; preload` | Verified |
| **Headers** | Anti-Sniff & Frame Protection | `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY` | Verified |
| **Headers** | Referrer & Permissions Policy | `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=()` | Verified |
| **Cookies** | JWT Token Storage | JWT access & refresh tokens are stored strictly in `HttpOnly`, `Secure`, `SameSite=Lax` cookies. Never readable by client JavaScript. | Verified |
| **CSRF** | State-changing BFF requests | SameSite=Lax cookies + `X-Requested-With` header requirement on all `/api/bff/*` mutations. | Verified |
| **XSS** | Content Rendering | Zero `dangerouslySetInnerHTML` on unvetted HTML. User markdown rendered via `react-markdown` + `rehype-sanitize` with strict schema. All user links stamped with `rel="noopener noreferrer ugc nofollow"`. Block `javascript:` protocols. | Verified |
| **Auth Flow** | Single-flight Token Rotation | Next.js server catches 401 or token expiration, performs single-flight refresh with Django `/accounts/token/refresh/`, updates cookies or redirects to login without infinite loops. | Verified |
| **Open Redirects** | Redirection sanitization | The `next` or `redirect` query parameter is strictly validated: only relative internal paths starting with single `/` (rejecting `//` or scheme protocols). | Verified |
| **Environment** | Boundary Enforcement | Server-only secrets protected with `import 'server-only'`. Strict `zod` validation of all environment variables on boot. | Verified |
| **BFF & SSRF** | API Proxy Guard | BFF routes exclusively communicate with the trusted internal `DJANGO_API_URL`. No client-supplied proxy URLs permitted. | Verified |
| **Privacy** | Sensitive Data Handling | Passwords and JWT tokens are stripped from server logs. Session notes are rendered only for the verified owner. | Verified |
| **Supply Chain** | Package integrity | Strict lockfile with `pnpm`, pinned exact versions, postinstall scripts isolated. | Verified |
