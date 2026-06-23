# CSeddit Usability Design Principles

This document explains how **CSeddit** implements and satisfies five of **Jakob Nielsen's 10 Usability Heuristics for User Interface Design**.

---

## 1. Visibility of System Status (Heuristic #1)
*The design should always keep users informed about what is going on, through appropriate feedback within a reasonable time.*
- **Implementation in CSeddit**:
  - When users submit a new question, post an answer, or publish a comment, the application disables form controls and displays an in-button loading indicator (`Spinner`) for a simulated `500ms`.
  - Upon successful completion, a confirmation toast notification (`toast.success`) appears in the bottom-right corner to notify the user of the successful outcome before redirecting or updating the view.
  - Skeletons are rendered on page load/redirect to indicate that data is being loaded from the database.

## 2. Match Between System and the Real World (Heuristic #2)
*The design should speak the users' language. Use words, phrases, and concepts familiar to the user, rather than internal jargon.*
- **Implementation in CSeddit**:
  - CSeddit is modeled around academic campus concepts. Rather than exposing database primary keys or system-level fields, the user interface features terms like "Department", "Year of Study" (e.g., "2nd Year", "4th Year"), and course names (e.g., "B.Sc. Computer Science").
  - Posts explicitly carry author tags indicating their department and year, reflecting how real students identify themselves in academic groups.

## 3. User Control and Freedom (Heuristic #3)
*Users often choose system functions by mistake and will need a marked "emergency exit" to leave the unwanted action without having to go through an extended process.*
- **Implementation in CSeddit**:
  - Explicit **"Back to Discussions"** navigation links are located at the top of the dynamic `/posts/[id]` details view and user profile screens, offering a clear escape hatch to return home without having to rely on the browser's back button history.
  - Inline comment input panels have a dedicated **"Cancel"** action to close the inline editor immediately without saving changes.
  - The Ask Question workspace includes a Drafts sidebar, allowing users to discard/delete a draft (`TrashIcon`) at any time if they change their minds.

## 4. Consistency and Standards (Heuristic #4)
*Users should not have to wonder whether different words, situations, or actions mean the same thing. Follow platform and industry conventions.*
- **Implementation in CSeddit**:
  - The design system strictly enforces a **flat, sharp-corners styling policy** (`rounded-none` on all inputs, select filters, dropdown panels, skeletons, badges, and toaster frames), establishing a coherent monospace-themed standard.
  - Phosphor Icon conventions are maintained uniformly (e.g. `ArrowUpIcon` / `ArrowDownIcon` for voting, `ArrowLeftIcon` for back actions, and standard icons representing post types).
  - Common naming layouts and metadata structures are kept consistent across feed views, search pages, profile lists, and details.

## 5. Error Prevention (Heuristic #5)
*Even better than good error messages is a careful design which prevents a problem from occurring in the first place.*
- **Implementation in CSeddit**:
  - All submission forms (new questions, answers, and comments) dynamically inspect inputs and **disable the submit button** until all required text validation checks are satisfied.
  - If a user inputs empty spaces or leaves fields blank, the system prevents submission before it occurs rather than allowing a bad API request or throwing a validation alert *after* clicking.
  - Required inputs display immediate outline changes (red borders via `border-destructive`) and micro-copy helper error text explaining the input constraint.
