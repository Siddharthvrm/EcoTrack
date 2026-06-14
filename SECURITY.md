# EcoTrack — Security Notes

## Overview

EcoTrack is a fully static client-side application with no server,
no backend, and no user accounts. The attack surface is limited but
real threats exist in a browser-based JS app.

---

## Threat Model

| Threat                       | Risk    | Mitigation applied                         |
|------------------------------|---------|--------------------------------------------|
| XSS via localStorage         | Medium  | All dynamic values use `textContent`; `sanitizeText()` escapes HTML entities |
| XSS via user form inputs     | Low     | Inputs read as numbers (`safePositiveNumber`); never injected as HTML |
| Prototype pollution          | Low     | State merged with `Object.keys()` enumeration only; no `__proto__` access |
| JSON injection               | Low     | `lsGet` wraps `JSON.parse` in try/catch; invalid JSON returns safe fallback |
| Corrupted localStorage       | Low     | `Store.load()` validates every field type and range; returns DEFAULT on failure |
| Supply-chain (CDN)           | Low     | Chart.js and jsPDF loaded from major CDNs with pinned versions |
| Clipboard / exfiltration     | N/A     | No clipboard API usage; no analytics or tracking |

---

## XSS Prevention

### Rule: No user-controlled data ever goes into `innerHTML`

**All dynamic content is set via `textContent` or `createElement`:**

```js
byId("res-total").textContent = fmt(total);

const p = createElement("p", { textContent: userString });

element.innerHTML = userString;
```

The one exception is **static structural HTML** injected into results
and recommendation containers. These templates contain **no dynamic data**
inline — all variable content is inserted into the structure afterward
using `byId("...").textContent = value`.

---

## localStorage Safety

`utils.js` centralises all localStorage access:

```js
function lsGet(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null || raw === undefined) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    console.warn("[EcoTrack] localStorage read failed:", e.message);
    return fallback;
  }
}
```

`store.js` further validates every field of parsed data:
- Numbers validated with `parseFloat` + `Number.isFinite`
- Grade validated against allowlist `["A","B","C","D","E","~"]`
- State object keys validated against known schema keys
- Negative numbers rejected (clamped to 0)

---

## Input Validation

All numeric form inputs pass through `safePositiveNumber()` before
any arithmetic:

```js
function safePositiveNumber(val) {
  const n = parseFloat(val);
  if (!Number.isFinite(n) || n < 0) return 0;
  return n;
}
```

Additionally:
- Recycling rate is clamped to [0, 100] via `validRecyclingRate()`
- Transport efficiency defaults to 1 if 0 to prevent division by zero
- All totals are summed via `sumState()` which applies `safePositiveNumber` per key

---

## Claude API Usage

The Anthropic API call in `recommendation.js`:
- Uses only data from `Store.load()` — already validated
- Prompt is constructed from a static template + numeric/grade values
- API response text is assigned via `element.textContent` — not `innerHTML`
- Response shape is validated before accessing nested `.content[].text`
- All errors are caught; UI falls back gracefully

---

## No Stored Secrets

- No API keys are embedded in any file
- The Anthropic API call relies on the API key being handled externally
  (e.g., injected by the deployment environment or a proxy)
- The repository contains zero `.env` files, tokens, or credentials

---

## Content Security Policy (Recommended)

For production deployment, add to your hosting config or `<meta>` tag:
Content-Security-Policy:

default-src 'self';

script-src 'self' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com;

style-src 'self';

connect-src https://api.anthropic.com;

img-src 'self' data:;

---

*EcoTrack Security Review — June 2026*

