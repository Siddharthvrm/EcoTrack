# EcoTrack — Manual Testing & Verification Guide

## Overview

EcoTrack is a static HTML + Vanilla JS application.
This document defines the complete manual test suite and
documents the independently-testable utility functions
that provide business logic isolation.

---

## 1. Testable Utility Functions (`utils.js`)

All functions below are pure or near-pure and can be verified
directly in the browser console or any JS runtime.

### 1.1 `sanitizeText(value)`

| Input                         | Expected Output                           |
|-------------------------------|-------------------------------------------|
| `"hello"`                     | `"hello"`                                 |
| `"<script>alert(1)</script>"` | `"&lt;script&gt;alert(1)&lt;/script&gt;"` |
| `null`                        | `""`                                      |
| `undefined`                   | `""`                                      |
| `123`                         | `"123"`                                   |

**Verify in console:**
```js
sanitizeText("<img src=x onerror=alert(1)>")
```

---

### 1.2 `safePositiveNumber(val)`

| Input     | Expected |
|-----------|----------|
| `"42"`    | `42`     |
| `"-5"`    | `0`      |
| `"abc"`   | `0`      |
| `null`    | `0`      |
| `Infinity`| `0`      |
| `NaN`     | `0`      |
| `0`       | `0`      |
| `3.7`     | `3.7`    |

---

### 1.3 `clamp(n, min, max)`

| Input              | Expected |
|--------------------|----------|
| `clamp(50, 0, 100)` | `50`   |
| `clamp(-10, 0, 100)` | `0`  |
| `clamp(150, 0, 100)` | `100`|
| `clamp(NaN, 0, 100)` | `0`  |

---

### 1.4 `calcGrade(score)`

| Score | Grade |
|-------|-------|
| 100   | A     |
| 80    | A     |
| 79    | B     |
| 60    | B     |
| 59    | C     |
| 40    | C     |
| 39    | D     |
| 20    | D     |
| 19    | E     |
| 0     | E     |

---

### 1.5 `calcScore(total)`

| Monthly total (kg CO₂e) | Expected score |
|--------------------------|----------------|
| `0`                      | `100`          |
| `500`                    | `90`           |
| `2500`                   | `50`           |
| `5000`                   | `0`            |
| `6000`                   | `0` (clamped)  |

---

### 1.6 `getTopContributor(state)`

| Input state                                     | Expected   |
|-------------------------------------------------|------------|
| `{ transport: 200, food: 100, energy: 50 }`     | `"transport"` |
| `{ transport: 0, food: 0 }`                     | `"None"`   |
| `{}`                                            | `"None"`   |
| `null`                                          | `"None"`   |

---

### 1.7 `sumState(state)`

| Input                                    | Expected |
|------------------------------------------|----------|
| `{ a: 10, b: 20, c: 30 }`               | `60`     |
| `{ a: -5, b: "bad", c: null }`          | `0`      |
| `{}`                                     | `0`      |
| `null`                                   | `0`      |

---

### 1.8 `pct(part, total)`

| Input              | Expected |
|--------------------|----------|
| `pct(25, 100)`     | `25`     |
| `pct(0, 100)`      | `0`      |
| `pct(100, 0)`      | `0`      |
| `pct(200, 100)`    | `100` (clamped) |

---

### 1.9 `calcTransportEmissions(td, EF)`

```js
const td = {
  petrol: { distance: 1000, efficiency: 10 }
};
calcTransportEmissions(td, EF);
```

```js
const td = {
  electric: { distance: 500 }
};
calcTransportEmissions(td, EF);
```

```js
calcTransportEmissions({}, EF);
```

---

### 1.10 `lsSet` / `lsGet` / `lsRemove`

```js
lsSet("test_key", { value: 42 });
lsGet("test_key");

lsRemove("test_key");
lsGet("test_key", "fallback");
```

---

## 2. Store Module Tests (`store.js`)

### 2.1 Load — empty state

```js
localStorage.clear();
const data = Store.load();
```

### 2.2 Save and reload

```js
Store.save({ state: { transport: 100 }, total: 100, yearly: 1200,
             score: 98, grade: "A", topContributor: "transport" });
const reloaded = Store.load();
```

### 2.3 Reset

```js
Store.reset();
const after = Store.load();
```

### 2.4 Subscribe / unsubscribe

```js
let called = false;
const unsub = Store.subscribe(data => { called = true; });
Store.save({ total: 999, state: {}, yearly: 0, score: 0, grade: "E", topContributor: "None" });

called = false;
unsub();
Store.save({ total: 1, state: {}, yearly: 0, score: 0, grade: "A", topContributor: "None" });
```

### 2.5 Corrupted localStorage

```js
localStorage.setItem("ecotrack_v2", "NOT_JSON{{{{");
const data = Store.load();
```

---

## 3. Calculator — End-to-End Manual Tests

### TC-CAL-01: Calculate with all categories

**Steps:**
1. Open `calculator.html`
2. Select Petrol vehicle, enter 1200 km, 15 km/L → Save
3. Enter 450 kWh electricity, 25 m³ gas → Save
4. Select Mixed diet, 5 kg food waste → Save
5. Enter 20 kg waste, 50% recycling → Save
6. Enter 3 clothing, 1 electronics → Save
7. Enter 6000 litres water → Save
8. Enter 8 hours laptop, 5 devices → Save
9. Enter 2 short flights, 1 long flight → Save
10. Click **Calculate Footprint**

**Expected:**
- Result card appears with non-zero values
- Grade shown (A–E)
- Score shown (0–100)
- Dashboard button becomes visible
- Data stored in `localStorage["ecotrack_v2"]`

---

### TC-CAL-02: Reset clears everything

**Steps:**
1. Complete TC-CAL-01
2. Click **Reset All** → confirm

**Expected:**
- All inputs cleared
- All tiles un-completed (no green checkmarks)
- Result card hidden
- Dashboard button hidden
- `localStorage["ecotrack_v2"]` is null

---

### TC-CAL-03: Recycling rate clamped to 100

**Steps:**
1. Enter 999 in recycling rate field
2. Click Calculate

**Expected:**
- Waste emissions use 100% recycling (not 999%)
- No negative or NaN values in result

---

### TC-CAL-04: Zero inputs produce zero result

**Steps:**
1. Do not fill any tiles
2. Click Calculate

**Expected:**
- Total = 0.0 kg
- Score = 100
- Grade = A

---

### TC-CAL-05: Transport with efficiency 0

**Steps:**
1. Enter 1200 km, efficiency = 0
2. Save and calculate

**Expected:**
- No division by zero error
- Transport emission calculated with efficiency defaulting to 1

---

## 4. Dashboard — Manual Tests

### TC-DASH-01: Dashboard reflects calculator data

**Steps:**
1. Complete TC-CAL-01
2. Navigate to `dashboard.html`

**Expected:**
- KPI cards show matching values from calculation
- Bar chart has 8 bars
- Doughnut chart shows proportional segments
- Insight text names the top contributor

---

### TC-DASH-02: Dashboard before calculation

**Steps:**
1. Clear localStorage
2. Open `dashboard.html`

**Expected:**
- Monthly: 0.0
- Yearly: 0
- Score: 0
- Grade: ~
- "No data yet" banner visible

---

### TC-DASH-03: PDF download

**Steps:**
1. Complete TC-CAL-01
2. Navigate to dashboard
3. Click **Download PDF Report**

**Expected:**
- File `EcoTrack_Report.pdf` downloads
- PDF contains: header, summary, breakdown table, recommendations, footer

---

### TC-DASH-04: Reset from dashboard

**Steps:**
1. Complete TC-CAL-01
2. Navigate to dashboard
3. Click **Reset All Data** → confirm

**Expected:**
- Redirected to calculator.html
- All data cleared

---

## 5. AI Recommendations — Manual Tests

### TC-REC-01: No data state

**Steps:**
1. Clear localStorage
2. Open `recommendation.html`

**Expected:**
- Message: "No footprint data found. Please complete the calculator first."
- Link to calculator visible

---

### TC-REC-02: Renders rule-based insights

**Steps:**
1. Complete TC-CAL-01
2. Open `recommendation.html`

**Expected:**
- Top Impact Area shown
- At least 2 insight bullet points
- Footprint summary section visible
- "Get Claude AI Advice" button present

---

### TC-REC-03: Claude API fallback

**Steps:**
1. Disable internet connection
2. Complete TC-CAL-01
3. Open recommendation page
4. Click **Get Claude AI Advice**

**Expected:**
- Loading spinner appears briefly
- Falls back to rule-based display
- No crash or unhandled error

---

## 6. Activities Explorer — Manual Tests

### TC-ACT-01: Modal opens on click

**Steps:**
1. Open `activities.html`
2. Click "🚗 Petrol Vehicle" tile

**Expected:**
- Modal opens with title, emission badge, description, sources, impact
- Close button visible

---

### TC-ACT-02: Modal closes correctly

| Method               | Expected behaviour          |
|----------------------|-----------------------------|
| Click ✕ button       | Modal removed from DOM      |
| Click backdrop       | Modal removed from DOM      |
| Press Escape key     | Modal removed from DOM      |

---

### TC-ACT-03: Keyboard navigation

**Steps:**
1. Tab to any activity tile
2. Press Enter or Space

**Expected:**
- Modal opens
- Focus moves to close button
- Escape closes modal

---

## 7. Security Tests

### TC-SEC-01: XSS via localStorage

**Steps:**
1. Open browser console
2. Run:
```js
localStorage.setItem("ecotrack_v2", JSON.stringify({
  state: { transport: "<script>alert('xss')</script>" },
  total: 100, yearly: 1200, score: 90,
  grade: "A", topContributor: "<img src=x onerror=alert(1)>",
  time: Date.now()
}));
```
3. Navigate to dashboard.html

**Expected:**
- No alert dialogs appear
- Raw HTML is not injected into the page
- topContributor text is shown as a literal string (escaped)

---

### TC-SEC-02: Malformed localStorage

**Steps:**
1. Run: `localStorage.setItem("ecotrack_v2", "{{broken json")`
2. Reload any page

**Expected:**
- Page loads normally
- No uncaught exceptions in console
- Defaults shown (0.0, ~)

---

### TC-SEC-03: Negative input values

**Steps:**
1. Enter -500 in any number field
2. Click Calculate

**Expected:**
- Negative value treated as 0
- No negative emission values in result

---

## 8. Accessibility Tests

### TC-A11Y-01: Keyboard-only navigation

**Steps:**
1. Open calculator.html
2. Use Tab only to navigate
3. Open each tile (Enter/Space)
4. Fill inputs using keyboard only
5. Click Calculate using Enter

**Expected:**
- All interactive elements reachable
- Focus visible on all elements
- No keyboard traps

---

### TC-A11Y-02: Screen reader test (NVDA / VoiceOver)

**Expected announcements:**
- Nav: announces "Main navigation"
- Progress bar: announces "0 / 8 Categories Completed"
- Results: announced via `aria-live="polite"` when result renders
- KPI cards: read as figure elements with labels

---

### TC-A11Y-03: Contrast check

Use browser DevTools Accessibility panel or https://webaim.org/resources/contrastchecker/

**Expected:** All text meets WCAG AA (4.5:1 for normal text, 3:1 for large text)

---

## 9. Responsive Design Tests

| Viewport          | Page to check       | Expected behaviour                          |
|-------------------|---------------------|---------------------------------------------|
| 375px (mobile)    | calculator.html     | 2-column tile grid, hamburger nav           |
| 375px (mobile)    | dashboard.html      | 2-column KPI grid, single-column charts     |
| 768px (tablet)    | activities.html     | 3-column activity grid                      |
| 1280px (desktop)  | all pages           | Full 4-col tiles, side-by-side charts       |

---

## 10. Cross-Tab Sync Test

**Steps:**
1. Open calculator.html in Tab A
2. Open dashboard.html in Tab B
3. In Tab A: complete and calculate
4. Switch to Tab B

**Expected:**
- Dashboard in Tab B updates automatically (no manual refresh needed)
- KPIs, charts, and insight reflect new calculation

---

## 11. Deployment Checklist

- [ ] No server-side dependencies (pure static files)
- [ ] All script `src` paths are relative
- [ ] All CSS `href` paths are relative
- [ ] CDN links use versioned URLs (Chart.js 4.4.2, jsPDF 2.5.1)
- [ ] No `.env` files or secrets in repository
- [ ] Works at `file://` protocol (open index.html locally)
- [ ] Works on GitHub Pages (push to `gh-pages` branch or `/docs` folder)
- [ ] Works on Vercel (static output, no build step required)

---

*Last updated: EcoTrack v2 refactor — June 2026*