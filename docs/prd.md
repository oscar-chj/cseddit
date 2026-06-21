# Product Requirement Document (PRD): CSeddit

## Problem Statement

Developers and technical students often lack a high-density, web-based Q&A space specifically tailored for technical courses and peer learning. Existing generic platforms feel bloated, lack clear reputation formulas, or fail to structure multi-layered Q&A conversations (Questions, Answers, and Nested Comments) clearly. CSeddit addresses this by providing a lightweight, desktop-optimized technical exchange system.

## Solution

**CSeddit** is a technical Q&A prototype styled after Stack Overflow and Reddit. It is designed to run completely client-side as a high-fidelity prototype, utilizing `localStorage` to persist simulated interactions.

### Key Focus Areas:
1. **Stack Overflow Core**: Centered around Questions, Answers, and threaded comments on both the posts and answers.
2. **Information Density & Blue Aesthetic**: Desktop-first layout utilizing a professional blue primary accent color (`#2563eb`) for actions, links, navigation indicators, and active states.
3. **No Side Navigation**: Only use a top header for primary navigation. Side navbars are strictly excluded.
4. **No Footer**: The layout has no footer component.
5. **Gamified Reputation System**: Dynamic reputation scoring mapped clearly on user profiles and leaderboard screens.
6. **Local Prototype Mode**: Fully interactive features (creating questions, posting answers, commenting, voting) persisted via `localStorage` with a pre-populated set of mock users and questions.

---

## Sitemap & Information Architecture

```
                                +-------------------+
                                |     CSeddit       |
                                |  Header Layout    |
                                +---------+---------+
                                          |
        +------------------+--------------+-------------+--------------------+
        |                  |                            |                    |
+-------v-------+  +-------v-------+            +-------v-------+    +-------v-------+
|  Dashboard    |  | Ask Question  |            |  Leaderboard  |    | User Profile  |
|  (Home Feed)  |  |   (/create)   |            | (/leaderboard)|    |  (/profile)   |
+-------+-------+  +---------------+            +---------------+    +-------+-------+
        |                                                                    |
        v (Click search button / Enter key)                                  v
+-------v-------+                                                    +-------v-------+
| Search Results|                                                    | Edit Anonymity|
|   (/search)   |                                                    | Toggle Option |
+-------+-------+                                                    +---------------+
        |
        v (Click question link)
+-------v-------+
|Post Detail/Q&A|
|  (/posts/[id])|
+---------------+
```

### 1. Global Shell (Layout)
* **Header**: Contains the CSeddit brand title, global search bar, navigation links (Leaderboard, Ask Question, Profile), notifications bell, settings cog, and active user avatar.
* **Side Navigation / Footer**: None. The layout is strictly header-only.

### 2. Dashboard Page (`/`)
* **Featured Questions**: Horizontal row of 3 cards highlighting featured technical questions (e.g., System Design, Frontend Frameworks, Data Visualization questions).
* **Recent Discussions**: Main chronological or trending feed of posted questions.
  * Tab filter: **Latest** (sort by timestamp) vs. **Trending** (sort by upvotes/replies count).
  * Post Cards: Displays votes count, reply/answers count, author avatar and name, time elapsed, title, post body preview snippet, tag pill, and "Load More" pagination.

### 3. Search Results Page (`/search?q=...`)
* Lists all questions whose titles or body texts match the query parameter `q`.
* Displays a clear "Search Results for '{query}'" heading.
* Renders matching post cards using the same format as the Dashboard feed.
* Includes an empty state for queries with no results.

### 4. Ask a Question Page (`/create`)
* **Title Input**: Text field for the question title (required).
* **Tags Input**: Custom multi-select component for adding tag pills (e.g., `React`, `SQL`, `Python`, `Architecture`, `Security`).
* **Text Body Input**: Rich-text markdown editor (mocked toolbar with Bold, Italic, Underline, Bullet list, Numbered list). Text post format is implemented, other tabs (Images & Videos, Link, Poll) are visually present but disabled (text-only focus).
* **Anonymity Option**: Toggle switch for "Anonymous : On" to publish the question anonymously.
* **Actions**: "POST" to submit and redirect to the new question, and "SAVE DRAFT" to store details locally.

### 5. Post Detail / Q&A Page (`/posts/[id]`)
* **Question Container**:
  * Displays title, author metadata (username, timestamp, tag), full text, and upvote/downvote action buttons.
  * **Post Comments**: Threaded, flat list of comments specifically about the question. Contains an "Add Comment" inline text link/form.
* **Answers List**:
  * Header showing count of answers (e.g., "Comments/Answers (3)") with a filter dropdown (e.g., "Top Comments").
  * Individual Answer Cards:
    * Sidebar with vertical vote controls (Up arrow, net score, Down arrow).
    * Main answer container showing author avatar, name, role badge (e.g., "Senior Engineer"), timestamp, and answer body.
    * **Answer Comments**: Inline threaded comments replying to that specific answer.
    * "Reply" and "Share" options.
* **Add Answer Section**:
  * Bottom-anchored rich-text input box with a "Post Answer" button.

### 6. User Profile Page (`/profile`)
* **Profile Info Card**:
  * Left: User profile avatar (e.g., mock users Chloe Tan or Alex Mercer).
  * Badges shelf (under avatar): Displaying specific emoji badges: 👾 (alien/monster), ❤️ (heart), 🔥 (fire), and 👌 (ok-hand).
  * Right: User name, title, bio text, and "Anonymous : On/Off" toggle option in the bottom right corner (acting as a default state toggle).
  * Stats counters (Display values directly without formula subtitles in the UI):
    * **Reputation** (Star icon): Calculated via the dynamic reputation formula.
    * **Total Likes** (Thumbs up icon): Total likes received.
    * **Dislikes** (Thumbs down icon): Total dislikes received.

### 7. Leaderboard Page (`/leaderboard`)
* Displays ranked listing of top community contributors.
* Columns: Rank number (1-6+), Avatar, Name, Title/Role, and Reputation score.
* The first-place user displays a distinct "Top Contributor" badge.
* "Filter" button to configure ranking preferences.

---

## User Stories

### A. Core Q&A and Commenting
1. As a developer, I want to post a question with a title, body, and tags, so that I can seek help on technical issues.
2. As an expert, I want to write answers directly below a question post, so that I can share my solutions.
3. As a user, I want to leave comments on the question post itself, so that I can ask for clarification or details.
4. As a user, I want to write comments on specific answers, so that I can discuss or refine the suggested solutions.
5. As a community member, I want to upvote or downvote questions and answers, so that the best technical content surfaces to the top.

### B. Navigation & Search
6. As a student, I want to search for questions using keywords in the header search bar, so that I can see if someone has already solved my problem.
7. As a visitor, I want to view my profile page and see my badges, bio, and custom settings, so that I can check my community standing.
8. As a competitor, I want to view the Leaderboard, so that I can see the ranked standings of top experts based on reputation.

### C. Prototype Customizations
9. As a user, I want all my posts, drafts, comments, and votes to persist in `localStorage`, so that my interactive sessions work correctly during demonstrations.
10. As a writer, I want to toggle anonymity when posting a question, so that I can submit queries without revealing my identity.

---

## Implementation Decisions

### Technical Stack & Styling Rules
* **Frontend**: Next.js App Router (using routes like `/`, `/create`, `/search`, `/posts/[id]`, `/profile`, `/leaderboard`).
* **Styling**: TailwindCSS v4 with professional blue styling tokens.
* **Component Restriction**: Developers MUST only use Shadcn UI components. Writing custom CSS files or editing Tailwind config files for custom colors and styling is strictly prohibited. Customization is restricted to styling layout (spacing, alignment, grids) using standard Tailwind classes and Shadcn parameters. Refer to [guideline.md](file:///d:/GitHub%20Repositories/cseddit/docs/guideline.md).
* **Database / State**: A local utility file `src/lib/mockDb.ts` that initializes standard seed data in `localStorage` if empty, and manages reads/writes.

### Reputation Formula
Reputation points are calculated dynamically in the mockup database:
`Reputation = answers_count + likes_count - dislikes_count`
No division or scaling by 10 is applied. The formula explanation details are hidden in the user interface.

---

## Testing Decisions

- **Seed Data Validation**: Ensure that initial localStorage data contains the mock posts and profiles (like Chloe Tan's profile and bio) so the application displays rich content on first load.
- **Q&A Threading Verification**: Confirm that posting a comment on a question, posting an answer, and writing a comment on an answer all link to the correct parent ID and update the visual thread.
- **Search Verification**: Test query matching by routing to `/search?q=React` and confirming only relevant posts are shown.

---

## Out of Scope
- Server-side Postgres/MySQL databases.
- Multi-user authentication (active user is simulated/switchable).
- Live WebSocket messaging.
- Side navbars and footers.
