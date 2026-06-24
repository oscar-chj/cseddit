# Agent Coding Guidelines: CSeddit Implementation

These guidelines are strict, binding, and must be followed by all implementing agents without exception.

---

## 1. Component Rules
* **Shadcn UI Only**: All UI elements (buttons, inputs, cards, switches, tooltips, dialogs, dropdowns, etc.) MUST be constructed using the pre-configured Shadcn components in `src/components/ui`.
* **No External Libraries**: Do not install additional styling libraries, custom icons, or competing component sets unless already configured in `package.json`.

## 2. CSS & Styling Restrictions
* **No Custom CSS for Styling**: Do not add custom style definitions, custom selectors, or custom font rules in stylesheet files. Overriding standard theme custom properties (variables) in `globals.css` is permitted to tune standard variables like `--border`, `--input`, or `--muted-foreground`.
* **No Hardcoded Custom Colors**: Do not declare custom brand colors or hex codes in stylesheets or Tailwind configs. Use standard preconfigured Tailwind classes and Shadcn theme variables (`bg-primary`, `text-muted-foreground`, etc.).
* **Aesthetic Consistency**: Component edits are restricted to layout utilities (spacing, alignments, flex/grid) and theme-aware styling utility classes.
  * **Allowed**: `p-4`, `mx-auto`, `flex`, `grid`, `items-center`, `gap-6`, `w-full`, standard theme tokens, and tuning variables in `globals.css`.
  * **Prohibited**: Writing custom class declarations like `.my-custom-btn { background: #1a73e8; }` or inline styles like `style={{ color: '#1a73e8' }}`.

## 3. Site Navigation & Structure
* **Header Only**: Implement only the top Header navigation. Do not build side navigation bars, side drawer menus, or lateral navigation panels.
* **No Footer**: Do not build a footer component. The bottom of the pages should remain clean.

## 4. Reputation Scoring UI
* **Calculation Rule**: Reputation score in the local database must follow:
  `Reputation = answers_count + likes_count - dislikes_count`
* **UI Cleanliness**: Display the final reputation score, total likes, and dislikes directly on the profile card as flat numbers (e.g. `325 Reputation` / `134 Likes` / `12 Dislikes`). Do NOT show any sub-label formula calculations (e.g., do not show "1 answer = 1 reputation" or "10 likes = 1 reputation").

## 5. UX Writing & Microcopy Rules
Agents MUST follow the UX Writing rules below:

================================================================================
THE DEFINITIVE UX WRITING & MICROCOPY RULESET
================================================================================
A comprehensive, actionable guide for designing clear, concise, and human-
centric interface text.

--------------------------------------------------------------------------------
1. THE CORE PRINCIPLES
--------------------------------------------------------------------------------

[A] Be Clear, Not Clever
    * Clear copy always beats witty copy. Interface text is a tool, not a 
      marketing campaign. If a user has to pause even for a fraction of a 
      second to decipher a metaphor, the UX has failed.
    * ❌ Bad:   "Shall we dance? [Let's go]"
    * 👉 Good:  "Connect your Spotify account. [Connect]"

[B] Be Concise (Shave the Fluff)
    * Write the message, then cut it in half. Users do not read interface text 
      line-by-line; they scan it. Every single word must earn its place.
    * ❌ Bad:   "In order to proceed with changing your password, please enter 
                 your current password below."
    * 👉 Good:  "Enter your current password."

[C] Be Useful and Actionable
    * Never leave a user stranded, especially during an error. State what 
      happened clearly, and immediately tell them how to fix it or what to 
      do next.
    * ❌ Bad:   "Invalid date format."
    * 👉 Good:  "Use the DD/MM/YYYY format."

--------------------------------------------------------------------------------
2. STRUCTURE BY UI ELEMENT
--------------------------------------------------------------------------------

[A] Buttons & Call-to-Actions (CTAs)
    * Always start with a strong, active verb that completes the user's mental 
      sentence: "I want to..."
    * Direct Action Match: The button text must directly mirror the header of 
      the action. If a modal headline is "Delete Project", the primary button 
      must say "Delete", not "OK" or "Submit".
    * Target length: 1 to 3 words max (e.g., "Save changes", "Send invite").

[B] Modals & Dialog Boxes
    * Follow a strict information hierarchy so a scanning user can make a safe, 
      fast decision without reading the body paragraph.
    * Structure template:
      - Headline: State the exact action or question.
      - Body: Explain the consequence (especially if irreversible).
      - Buttons: One explicit path forward, one obvious safe way out.
    * Example:
      Headline: Delete this folder?
      Body:     This permanently removes 14 files. You cannot undo this action.
      Buttons:  [Cancel] [Delete]

[C] Form Fields & Inputs
    * Labels: Keep them short (1-2 words) and permanently visible. Do not rely 
      solely on placeholder text, as it disappears when the user starts typing.
    * Helper Text: Place critical constraints (like password requirements) 
      BEFORE the user types, right below the input field, not inside a tooltip.

--------------------------------------------------------------------------------
3. THE BANNED WORDS CHECKLIST
--------------------------------------------------------------------------------

Avoid these classic tech-bloat words to keep your UX professional yet human:

* "Successfully"
  - Why: Redundant. If the action didn't succeed, you would show an error.
  - ❌ "Email sent successfully." -> 👉 "Email sent."

* "Failed to..."
  - Why: Aggressive, mechanical tone that subtly blames the user.
  - ❌ "Failed to connect to database." -> 👉 "Could not connect. Try again."

* "Are you sure?"
  - Why: Lazy pattern that adds friction without adding informative clarity.
  - ❌ "Are you sure?" -> 👉 "Discard your unsaved draft?"

* Jargon & System Codes
  - Why: Completely incomprehensible to non-technical human beings.
  - ❌ "Error 403: Auth token expired." -> 👉 "Session expired. Please log in again."

--------------------------------------------------------------------------------
4. MECHANICS & FORMATTING
--------------------------------------------------------------------------------

[A] Front-Load the Core Concept
    * Put the most critical information at the very beginning of the sentence 
      so scanning eyes catch it immediately.
    * ❌ Bad:   "Your download will be canceled if you log out."
    * 👉 Good:  "Logging out will cancel your download."

[B] Adopt Sentence Case
    * Capitalize only the first letter of the first word and proper nouns.
    * Sentence case is proven to be faster to read, feels less robotic than 
      Title Case, and avoids the "screaming" look of ALL CAPS.
    * ❌ Bad:   "Update Your Account Profile Settings"
    * 👉 Good:  "Update your account profile settings"

[C] Control Your Punctuation
    * Avoid exclamation points unless celebrating a major, genuine milestone 
      (e.g., "Setup complete!"). 
    * Never use exclamation points in error messages (e.g., "Wrong password!"). 
      It reads like the interface is shouting at an already frustrated user.
    * Drop periods in standalone microcopy like buttons, labels, and single-
      sentence toaster messages to keep layouts clean.

--------------------------------------------------------------------------------
5. QUICK UI TEXT AUDIT (5-POINT CHECKLIST)
--------------------------------------------------------------------------------
Use this whenever reviewing existing copy:
[ ] 1. Can a user understand this message within 1 second?
[ ] 2. If this is an error, does it provide a clear path forward?
[ ] 3. Have all redundant words ("successfully", "please", "system") been cut?
[ ] 4. Does the button text use an active verb matching the header?
[ ] 5. Is it written in clean sentence case?
================================================================================
