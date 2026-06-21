# Handoff: CSeddit Q&A Prototype Implementation (Enhanced)

This handoff document summarizes the requirements elicitation, product definition, and strict implementation rules for the **CSeddit** application. A fresh agent should read this document, the updated PRD, and the strict styling guidelines to continue the work using Subagent-Driven-Development.

---

## 1. Context & Objective
* **App Name**: CSeddit (Questions/Answers/Comments forum styled after Stack Overflow).
* **Target Audience**: Students and developers looking for a high-density, peer-learning forum.
* **Goal**: Implement a fully functional client-side prototype of the 6 screens/pages using Next.js App Router, TailwindCSS v4, and Shadcn UI.
* **Persistence**: Client-side state managed entirely via `localStorage` with a robust seed data set (simulating active users, posts, answers, comments, and votes).

## 2. Key References
* **PRD**: [prd.md](file:///d:/GitHub%20Repositories/cseddit/docs/prd.md) (Contains sitemap, user stories, reputation logic, and testing decisions).
* **Strict Coding & Styling Guidelines**: [guideline.md](file:///d:/GitHub%20Repositories/cseddit/docs/guideline.md)
* **Screens / Mockups**:
  * Home/Dashboard: [screen.png](file:///d:/GitHub%20Repositories/cseddit/public/stitch_remix_of_high_fidelity_ui_refinement/search_home/screen.png)
  * Ask a Question: [screen.png](file:///d:/GitHub%20Repositories/cseddit/public/stitch_remix_of_high_fidelity_ui_refinement/create_post/screen.png)
  * Post Detail: [screen.png](file:///d:/GitHub%20Repositories/cseddit/public/stitch_remix_of_high_fidelity_ui_refinement/post_detail/screen.png)
  * Profile (Alex Mercer): [screen.png](file:///d:/GitHub%20Repositories/cseddit/public/stitch_remix_of_high_fidelity_ui_refinement/user_profile/screen.png)
  * Profile (Chloe Tan - Custom Mockup): Refer to the conversation history image showing Chloe Tan's profile layout with custom alien/heart/fire/ok-hand badges and bio.
  * Leaderboard: [screen.png](file:///d:/GitHub%20Repositories/cseddit/public/stitch_remix_of_high_fidelity_ui_refinement/leaderboard/screen.png)

## 3. Strict Design Decisions (Crucial)
* **Components & Styling**: 
  * Only use pre-configured Shadcn UI components.
  * Never write or edit custom CSS rules for colors, font families, or style customization. 
  * Edits to styling must only affect layout (spacing, grids, flexbox, alignment) using standard Tailwind utility classes.
* **Navigation & Shell**: 
  * Only build the top Header bar navigation.
  * Do NOT build any side navbars or drawer navigations.
  * Do NOT build any footer.
* **Featured Content**:
  * The home page dashboard features horizontal row cards representing **Featured Questions**, not topics.
* **Reputation Stats**:
  * Formula: `Reputation = answers_count + likes_count - dislikes_count`.
  * Do NOT display the subtitle formula explanations (e.g., "1 answer = 1 reputation") in the profile view. Only display raw values directly.
* **Post Format**:
  * Mock only the **TEXT** tab inputs for creation; the remaining tabs (Images & Videos, Link, Poll) should be visual only.
* **UX Writing & Microcopy**:
  * All UI copy, button labels, modal headers, and toaster notification messages must strictly follow the rules in [guideline.md](file:///d:/GitHub%20Repositories/cseddit/docs/guideline.md) (e.g. sentence case, no redundancy, clear actions, and avoiding tech-bloat words like "successfully" or "failed to").

## 4. Suggested Skills
The next agent should utilize the following skills from the custom skills directory (`C:\Users\haojc\.agents\skills`):
1. `create-implementation-plan`: To structure the development tasks step-by-step before code modifications.
2. `subagent-driven-development`: To execute the plan by dispatching specialized subagents for page modules (e.g., mock DB, layout, individual route pages) with spec compliance and quality reviews.
3. `verification-before-completion`: To ensure all routes, navigation links, search functionalities, and mock database updates compile and run flawlessly.

## 5. Next Steps for the Fresh Agent
1. **Explore the codebase**: Review the directory structure, TailwindCSS configuration, and pre-installed Shadcn UI components.
2. **Design Mock Database**: Create `src/lib/mockDb.ts` to manage seed data in `localStorage` for posts, answers, comments, users, and drafts.
3. **Build Route Pages**: Implement:
   * `/` (Dashboard / Feed)
   * `/search` (Search Results)
   * `/create` (Ask a Question)
   * `/posts/[id]` (Q&A detail page with question comments and answer comments)
   * `/profile` (User Profile with reputation details and Chloe Tan data)
   * `/leaderboard` (Contributor Leaderboard)
4. **Link Shell Navigation**: Verify header search routing and navbar links.
