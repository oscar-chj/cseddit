---
goal: CSeddit High-Fidelity Technical Q&A Client-Side Prototype
version: 1.0
date_created: 2026-06-21
last_updated: 2026-06-21
owner: Antigravity
status: Completed
tags:
  - feature
  - architecture
  - frontend
---

# Introduction

![Status: Completed](https://img.shields.io/badge/status-Completed-brightgreen)

Implementation plan for **CSeddit**, a desktop-optimized, high-density technical Q&A web forum prototype styled after Stack Overflow and Reddit. The prototype runs client-side using Next.js App Router, TailwindCSS v4, and Shadcn UI, with state persistent in `localStorage`.

## 1. Requirements & Constraints

- **REQ-001**: Implement 6 routes: `/` (dashboard), `/search` (search results), `/create` (ask question), `/posts/[id]` (Q&A detail), `/profile` (user profile), `/leaderboard` (leaderboard).
- **REQ-002**: Local persistence of state via `localStorage` with a seed data set simulating active users, questions, answers, comments, and votes.
- **REQ-003**: Reputation Formula: `Reputation = answers_count + likes_count - dislikes_count`. Display raw values directly in the UI without explanation subtitles.
- **REQ-004**: Post Format Creation: Support title, tags, body, and anonymity toggle. Support draft saving. Mock the other tabs (Images, Links, Polls) visually only.
- **REQ-005**: Navigation Shell: Only build the top Header bar navigation. Do not build side navigation or footers.
- **REQ-006**: UX Writing Guidelines: Sentence case, no redundancy (no "successfully" or "failed to"), actionable error messages, active verb buttons.
- **CON-001**: Component restriction: Only use pre-configured Shadcn UI components from `src/components/ui`.
- **CON-002**: CSS restriction: Never write custom CSS styles or overrides for colors, fonts, or aesthetics in `globals.css` or elsewhere. Use Tailwind classes only for layout, spacing, flexbox, alignment, and standard themes.
- **CON-003**: No external libraries for styling or icons besides those configured in `package.json` (e.g. `@phosphor-icons/react` is allowed).

## 2. Implementation Steps

### Phase 1: Foundation, Types & Mock Database

- GOAL-001: Set up type definitions and the local database utility using `localStorage` to manage CRUD state with seed data.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-001 | Create `src/types/index.ts` to define types for `User`, `Post`, `Answer`, `Comment`, `Draft`. | ✅ | 2026-06-21 |
| TASK-002 | Create `src/lib/mockDb.ts` to implement local CRUD functions and initialize state with mock users (Chloe Tan, Alex Mercer, etc.) and posts in `localStorage`. | ✅ | 2026-06-21 |

### Phase 2: Global Shell layout and Header

- GOAL-002: Implement layout shell with the top navbar (Header) including navigation links, active user selector, settings, notifications, and search trigger.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-003 | Create `src/components/Header.tsx` implementing logo, search input, links to `/create`, `/leaderboard`, `/profile`, notification icon, user switcher. | ✅ | 2026-06-21 |
| TASK-004 | Update `src/app/layout.tsx` to wrap application in the Header shell, theme provider, and toast notifier. | ✅ | 2026-06-21 |

### Phase 3: Dashboard feed and Search Results page

- GOAL-003: Implement main feed page with featured posts, chronological discussion lists with sorting, and query-based search results route.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-005 | Update `src/app/page.tsx` for Dashboard: horizontal row cards for featured questions, and main Chronological feed list with Latest/Trending tabs and page load. | ✅ | 2026-06-21 |
| TASK-006 | Create `src/app/search/page.tsx` for Search Results: listing matching posts by query `q` with descriptive headings and empty states. | ✅ | 2026-06-21 |

### Phase 4: Create Question and Post Detail Q&A pages

- GOAL-004: Create interfaces for asking questions (including drafts and options) and detail views showing threaded discussions, answer additions, and voting mechanisms.

| TASK-007 | Create `src/app/create/page.tsx` featuring question creator (title, tags, markdown toolbar, anonymity toggle, save draft, post redirect). | ✅ | 2026-06-21 |
| TASK-008 | Create `src/app/posts/[id]/page.tsx` for detail views, displaying upvote/downvote buttons, threaded Q-comments, answer sidebar votes, A-comments, and post-answer box. | ✅ | 2026-06-21 |

### Phase 5: Profile and Leaderboard pages

- GOAL-005: Design user profile stats, settings, badges layout and the community leaderboard.

| TASK-009 | Create `src/app/profile/page.tsx` for profile cards, badges, bio, anonymity toggle settings, and user's posts list. | ✅ | 2026-06-21 |
| TASK-010 | Create `src/app/leaderboard/page.tsx` for rankings table, top badges, and ranking criteria configuration. | ✅ | 2026-06-21 |

### Phase 6: Global Integrity and Verification

- GOAL-006: Clean up, lint, typecheck, and verify full compilation.

| TASK-011 | Run typecheck, build validation, and verify routing flows, localState mutations, search, and styling rules. | ✅ | 2026-06-21 |

## 3. Alternatives

- **ALT-001**: Use a Next.js API route to simulate server delays. *Rejected* because the PRD mandates fully synchronous `localStorage` prototype logic to keep user interaction instant and setup-free.
- **ALT-002**: Implement side navigation drawer for mobile. *Rejected* because PRD explicitly restricts navigation to top header bar only.

## 4. Dependencies

- **DEP-001**: Next.js App Router (installed)
- **DEP-002**: TailwindCSS v4 and standard theme color classes (installed)
- **DEP-003**: Shadcn UI components from `@/components/ui` (installed)
- **DEP-004**: `@phosphor-icons/react` for icons (installed)

## 5. Files

- **FILE-001**: `src/types/index.ts` [NEW]
- **FILE-002**: `src/lib/mockDb.ts` [NEW]
- **FILE-003**: `src/components/Header.tsx` [NEW]
- **FILE-004**: `src/app/layout.tsx` [MODIFY]
- **FILE-005**: `src/app/page.tsx` [MODIFY]
- **FILE-006**: `src/app/search/page.tsx` [NEW]
- **FILE-007**: `src/app/create/page.tsx` [NEW]
- **FILE-008**: `src/app/posts/[id]/page.tsx` [NEW]
- **FILE-009**: `src/app/profile/page.tsx` [NEW]
- **FILE-010**: `src/app/leaderboard/page.tsx` [NEW]

## 6. Testing

- **TEST-001**: Verify storage initialization and seed validation on load.
- **TEST-002**: Verify creation and persistent updates of questions, answers, comments, and drafts.
- **TEST-003**: Verify vote casting updates state correctly and is capped (e.g. toggle upvote).
- **TEST-004**: Verify search result filtering with matching titles/bodies.
- **TEST-005**: Verify leaderboard reputation sorting and profile reputation matches user stats.

## 7. Risks & Assumptions

- **RISK-001**: LocalStorage format differences or JSON parsing errors. *Mitigation*: Wrap all localStorage calls in `try/catch` and self-heal with fresh seed data on errors.
- **RISK-002**: Hydration errors due to client-only `localStorage` rendering during SSR. *Mitigation*: Ensure components utilizing client-state mount with `useEffect` or are marked as `'use client'` and suppress client-side-only rendering elements until mounted.
- **ASSUMPTION-001**: Standard responsive layouts are required, but desktop (>=1024px) is the main design priority as stated in the PRD.

## 8. Related Specifications / Further Reading

- [prd.md](file:///d:/GitHub%20Repositories/cseddit/docs/prd.md)
- [guideline.md](file:///d:/GitHub%20Repositories/cseddit/docs/guideline.md)
