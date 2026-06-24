# UI/UX Audit Report

This document presents a comprehensive UI/UX audit of the **CSeddit** web application, based on the project's styling choices, general accessibility standards, and the Vercel Web Interface Guidelines.

---

## 1. Design Theme & Style Selection

### Sharp Corners (`rounded-none`) & Monospace Typography (`font-mono`)
CSeddit utilizes a **Neo-Brutalist** or **Retro-Technical** design theme. The entire application uses sharp 90-degree corners (`rounded-none` on cards, buttons, tabs, input fields, and badges) and a monospaced font family (`font-mono` on `html`).

* **Why square instead of rounded circles?**
  * **Semantic Alignment:** "CSeddit" is a Computer Science focused social forum. Monospace typography and square container grids directly mimic terminal shells, retro computers, and code editors (like VS Code or Vim).
  * **Stylistic Contrast:** It departs from typical consumer social apps that use organic, soft rounded curves, making it immediately feel technical, structured, and developer-oriented.
  * **Visual Polish:** Within Brutalist constraints, the spacing (using standard 8px incremental grids) keeps the interface highly organized and aligned with the "technical documentation" aesthetic.

---

## 2. Color Palette & User Friendliness

### Overall Palette Assessment
The application uses a **neutral monochrome base** (`oklch` grays, whites, and blacks) with a **vibrant blue accent** (`oklch(0.205 0 0)` or Tailwind `blue-600`/`blue-700`).

* **User Friendliness:**
  * **Blue Accents:** Excellent for links, primary call-to-actions (e.g., "Ask Question"), and active tab states. Blue is universally recognized as the interactive standard, providing great discoverability.
  * **Semantic Grouping:**
    * **Upvotes/Downvotes:** Blue is used for positive/upvoted states, and red is used for downvotes/negative states. This is standard and intuitive.
    * **Categorization Badges:** Department tags (blue) and Year of Study tags (purple) are visually separated, helping users scan metadata easily.
  * **Dark Mode Visual Inconsistency:**
    * Badges like `<Badge className="bg-blue-50 text-blue-700">` and `<Badge className="bg-purple-50 text-purple-700">` use hardcoded light-theme colors. In dark mode, they render as highly luminous blocks, creating visual noise and breaking the dark mode aesthetic.
    * Avatar fallbacks (`bg-blue-100 text-blue-800`) are also hardcoded and do not adapt to dark mode.

---

## 3. Contrast & Readability

### Text Contrast Readability
* **Primary Text (`--foreground`):**
  * **Light Mode:** `oklch(0.145 0 0)` on white background. Contrast is **~17.5:1** (Exceeds WCAG AAA).
  * **Dark Mode:** `oklch(0.985 0 0)` on dark gray `oklch(0.145 0 0)`. Contrast is **~14.8:1** (Exceeds WCAG AAA).
* **Muted/Secondary Text (`--muted-foreground`):**
  * **Light Mode (Issue):** `oklch(0.556 0 0)` on white. Contrast is **~3.7:1**, which is **below the WCAG AA requirement of 4.5:1** for normal text. This affects timestamps, author usernames, stats subtitles, and placeholders, making them difficult to read.
  * **Dark Mode:** `oklch(0.708 0 0)` on dark gray. Contrast is **~6.9:1** (Exceeds WCAG AA).
* **Active Vote Colors in Dark Mode (Issue):**
  * In dark mode, voting buttons use standard Tailwind `text-blue-600` and `text-red-600` on a dark card background (`oklch(0.205 0 0)`). 
    * `blue-600` on dark card yields a low **~2.2:1** contrast.
    * `red-600` on dark card yields a low **~3.1:1** contrast.
    * Active vote states are very hard to read in dark mode.

---

## 4. Accessibility (Web Interface Guidelines Compliance)

### Critical Findings
1. **Icon-only Buttons Lack `aria-label`:** Several buttons in the dashboard, header, and detail page are completely icon-only (e.g. upvote/downvote arrows, delete draft bin) and contain no `aria-label` or screen-reader descriptions.
2. **Unlabeled Form Inputs:** The main search bar in the header has a placeholder but lacks an associated `<label>` or `aria-label`, failing WCAG validation.
3. **Typography Ellipsis Rules:** Standard triple-dot `...` is used across all loading screens, redirect messages, and placeholders instead of the proper single typographic ellipsis character `…`.

---

## 5. File-Specific Audit Findings

Below is a detailed list of compliance issues mapped directly to code locations:

| File and Line | Issue Category | Description |
| :--- | :--- | :--- |
| [globals.css#L62](file:///src/app/globals.css#L62) | Contrast | `--muted-foreground: oklch(0.556 0 0)` on white has low contrast (~3.7:1); violates WCAG AA. |
| [page.tsx#L201-L242](file:///src/app/page.tsx#L201-L242) | Accessibility | Desktop upvote/downvote buttons are icon-only and lack `aria-label`. |
| [page.tsx#L324-L371](file:///src/app/page.tsx#L324-L371) | Accessibility | Mobile upvote/downvote buttons are icon-only and lack `aria-label`. |
| [page.tsx#L129](file:///src/app/page.tsx#L129) | Dark Mode | Badge uses hardcoded `bg-blue-50 text-blue-700` in both themes; fails to invert in dark mode. |
| [page.tsx#L299-L311](file:///src/app/page.tsx#L299-L311) | Dark Mode | Department and Year badges use hardcoded light-theme colors, causing high-luminance blocks in dark mode. |
| [Header.tsx#L112-L118](file:///src/components/Header.tsx#L112-L118) | Accessibility | Search input has no `<label>` or `aria-label`. |
| [Header.tsx#L140-L148](file:///src/components/Header.tsx#L140-L148) | Accessibility | Mobile leaderboard button is icon-only and lacks `aria-label`. |
| [Header.tsx#L114](file:///src/components/Header.tsx#L114) | Typography | Placeholder ends with straight `...` instead of typographical ellipsis `…`. |
| [create/page.tsx#L477](file:///src/app/create/page.tsx#L477) | Typography | Textarea placeholder uses straight `...` instead of `…`. |
| [create/page.tsx#L512](file:///src/app/create/page.tsx#L512) | Typography | Textarea placeholder uses straight `...` instead of `…`. |
| [create/page.tsx#L547](file:///src/app/create/page.tsx#L547) | Typography | Textarea placeholder uses straight `...` instead of `…`. |
| [create/page.tsx#L627](file:///src/app/create/page.tsx#L627) | Typography | Textarea placeholder uses straight `...` instead of `…`. |
| [create/page.tsx#L797-L800](file:///src/app/create/page.tsx#L797-L800) | Accessibility | Draft delete button is icon-only and lacks `aria-label`. |
| [posts/[id]/page.tsx#L149](file:///src/app/posts/[id]/page.tsx#L149) | Typography | Input placeholder uses straight `...` instead of `…`. |
| [posts/[id]/page.tsx#L359-L390](file:///src/app/posts/[id]/page.tsx#L359-L390) | Accessibility | Question upvote/downvote buttons are icon-only and lack `aria-label`. |
| [posts/[id]/page.tsx#L629-L666](file:///src/app/posts/[id]/page.tsx#L629-L666) | Accessibility | Answer upvote/downvote buttons are icon-only and lack `aria-label`. |
| [posts/[id]/page.tsx#L723](file:///src/app/posts/[id]/page.tsx#L723) | Typography | Textarea placeholder uses straight `...` instead of `…`. |
| [profile/page.tsx#L18](file:///src/app/profile/page.tsx#L18) | Typography | Redirect message ends with straight `...` instead of `…`. |

---

## 6. Recommendations for Improvement

### A. Fix Contrast Ratios
1. In `src/app/globals.css`, adjust light mode `--muted-foreground` to a darker value, such as `oklch(0.45 0 0)` (Contrast ratio ~5.6:1), to ensure AA compliance.
2. In dark mode, style the active states of vote buttons using theme-aware colors rather than hardcoded `text-blue-600` or `text-red-600`. Use desaturated or lighter variants (e.g. `dark:text-blue-400` / `dark:text-red-400`) which meet the 4.5:1 contrast requirement.

### B. Make Badges/Avatars Theme-Aware
1. Replace hardcoded classes like `bg-blue-50 text-blue-700` on badges with semantic variables or use Tailwind's theme utility (e.g., `bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300`).

### C. Solve Accessibility Violations
1. Add `aria-label` attributes to all icon-only buttons (e.g., `aria-label="Upvote"`, `aria-label="Downvote"`, `aria-label="Delete draft"`).
2. Add `aria-label="Search discussions"` or a hidden screen-reader label to the header's global search input.

### D. Standardize Typography micro-details
1. Replace straight triple-dots `...` with the proper ellipsis character `…` in placeholders and loading/redirect texts.
