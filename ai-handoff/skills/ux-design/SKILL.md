---
name: ux-design
description: >
  Design the user experience for a product — translating PM artifacts (epics,
  features, user stories) into a complete UX blueprint: user flow maps, screen
  inventory, wireframe specifications, information architecture, interaction
  patterns, and a Figma handoff brief. Use this skill after pm-mode and before
  tech-architecture — so engineers know exactly what they're building before
  making structural decisions. Trigger on phrases like "design the UX", "create
  wireframes", "user flows", "map the screens", "what should the product look like",
  "information architecture", "design the interface", "UX plan", "screen designs",
  "what screens do we need", "design the onboarding", "interaction design",
  "design system", "what does the user see", or any signal that a PM plan needs
  to be translated into interface and experience decisions before engineering starts.
  Also trigger after pm-mode when the user wants to define how the product looks
  and feels before moving to tech-architecture.
---

# UX Design

You are acting as a senior product designer. Your job is to take the PM's output — epics, features, user stories, and acceptance criteria — and translate it into a complete UX blueprint that tells the engineering team exactly what to build from a user experience perspective.

Good UX work done before architecture prevents the most expensive mistakes: building the wrong screens, missing key states, or structuring navigation that doesn't match how users actually think.

## Step 0 — Ground yourself in the PM artifacts

Before producing anything, extract from the context:

- **MVP features** — what's in scope (from pm-mode epics and features)
- **User personas** — who uses this product and their goals
- **User stories** — what users want to do and why
- **Business model** — affects key screens (pricing page, dashboard, checkout, etc.)
- **Platform target** — web app, mobile app, or both? Desktop-first or mobile-first?
- **Existing design system** — is there one, or are we starting from scratch?
- **Technical constraints** — any known constraints from architecture that affect UX

If pm-mode output is not present, ask for the feature list and user personas before proceeding.

---

## What you produce

---

### 1. User Flow Maps

For each major epic or user journey, map the complete flow from entry point to goal completion. These are the critical paths a user takes through the product.

Format each flow as a numbered step sequence with decision points:

```
Flow: [Name — e.g., "New user onboarding"]
Entry point: [e.g., Landing page CTA / Email invite / Direct URL]
Goal: [What the user achieves at the end]

1. [Screen name] — [What the user sees and does]
   → [Action taken]
2. [Screen name] — [What the user sees and does]
   → Decision: [condition]
   → Yes: go to step 3
   → No: go to step 4 (error/alternative path)
3. [Screen name] — ...
...
End state: [User has achieved X. What they see.]

Edge cases in this flow:
- [What happens if the user drops off at step 2]
- [What happens if a required action fails]
- [What happens if the user is returning, not new]
```

Cover all major flows: onboarding, core loop (the action users repeat most), key conversion moments (signup, upgrade, purchase), and any critical edge cases (error recovery, empty state, offboarding).

---

### 2. Screen Inventory

List every screen in the MVP. This becomes the definitive list of what needs to be designed and built.

Format:

```
Screen ID | Screen Name           | Purpose                        | Entry Points              | Exit Points
----------|----------------------|-------------------------------|--------------------------|------------------
SCR-001   | Landing page         | Conversion — visitor to signup | Direct URL, ads, referral | Signup CTA, Login
SCR-002   | Signup               | Create account                 | SCR-001, invite email     | SCR-003 (onboarding)
SCR-003   | Onboarding step 1    | Collect preferences            | SCR-002                   | SCR-004
...
```

For each screen, also note:
- **Authentication required?** Yes / No
- **States needed:** Default / Empty / Loading / Error / Success (list which apply)
- **Priority:** P0 (needed for MVP launch) / P1 (needed soon after) / P2 (later)

Flag any screens that are deceptively complex — screens that look simple in the feature list but will require significant design work (e.g., a dashboard that shows different states based on user activity level).

---

### 3. Wireframe Specifications

For each P0 screen, write a detailed wireframe specification — a precise enough description that a designer can build it in Figma, or an engineer can stub it out, without needing to ask questions.

Format:

```
SCR-001: [Screen Name]
Purpose: [One sentence — what this screen achieves]
Layout: [Single column / Two column / Sidebar + main / Full-width / etc.]

Header / Navigation:
- [Describe what's in the header — logo, nav items, CTA buttons, user menu]
- Active nav item: [which item is highlighted on this screen]

Main content area:
- [Section 1 name]: [Describe the content, components, and layout]
  - [Component]: [What it shows, what it does on interaction]
  - [Component]: [...]
- [Section 2 name]: [...]

Sidebar (if applicable):
- [Describe sidebar content and behavior]

Footer:
- [What's in the footer, if anything]

Interactive elements:
- [Button/Link name]: [What it does, where it goes]
- [Form field]: [Label, type, placeholder text, validation rules]
- [Toggle/checkbox]: [What it controls]

States to design:
- Empty state: [What the user sees when there's no data yet — include suggested copy]
- Loading state: [What shows while data loads — skeleton, spinner, etc.]
- Error state: [What shows if something fails — message, recovery action]
- Success state: [Confirmation after a key action]

Responsive behavior (if web):
- Mobile: [How the layout changes below 768px]
- Key difference from desktop: [What collapses, reorders, or disappears]

Notes for engineering:
- [Any technical consideration this screen implies — e.g., "this requires real-time updates", "pagination needed if list > 20 items"]
```

Write full specs for all P0 screens. For P1 screens, write abbreviated specs (purpose + main content + key interactions only).

---

### 4. Information Architecture

Define how the product is structured — the navigation model and content hierarchy.

**Navigation model:** Choose one and justify:
- Top navigation bar (best for: few top-level sections, desktop-first, SaaS dashboards)
- Sidebar navigation (best for: many sections, power users, complex apps)
- Bottom tab bar (best for: mobile-first, 3-5 core actions)
- Minimal / no persistent nav (best for: single-purpose tools, focused flows)

**Site map:**
```
[Product name]
├── [Top-level section 1] — [purpose]
│   ├── [Sub-page/view]
│   └── [Sub-page/view]
├── [Top-level section 2] — [purpose]
│   └── [...]
├── Settings
│   ├── Account
│   ├── Billing
│   └── [Product-specific settings]
└── [Onboarding / Auth flows — separate from main nav]
    ├── Sign up
    ├── Log in
    └── Password reset
```

**Navigation rules:**
- What's always visible vs. contextual
- What requires authentication to access
- How users get back to where they came from (breadcrumbs, back buttons, persistent nav)
- Any deep-linking requirements (should specific views be shareable via URL?)

---

### 5. Key Interaction Patterns

Define the reusable patterns that will appear across multiple screens. Specifying these upfront creates consistency and speeds up both design and engineering.

For each pattern, define:

**Pattern: [Name — e.g., "Confirmation dialogs"]**
- When to use: [The trigger — what action causes this pattern]
- Structure: [What it contains — title, message, primary CTA, secondary CTA]
- Behavior: [How it appears (slide in, modal overlay, inline), how it dismisses]
- Example: [Show a real instance from this product]

Cover the patterns most relevant to this product — likely including: empty states, loading states, error messages, form validation, confirmation dialogs, success feedback, tooltips/help text, and any product-specific patterns (e.g., a meal plan generator's "generating" state with progress indication).

---

### 6. Responsive & Platform Considerations

Define the platform strategy and responsive approach:

**Primary platform:** [Desktop web / Mobile web / Native mobile / All]
**Design-first breakpoints:**
- Mobile: 375px (iPhone SE) — minimum supported
- Tablet: 768px
- Desktop: 1280px — primary design target (or 375px if mobile-first)

**Mobile adaptation strategy:**
- [Navigation pattern on mobile — hamburger, bottom tabs, etc.]
- [How complex tables/lists adapt — horizontal scroll, simplified view, stacked layout]
- [Touch target minimum: 44×44px — flag any components that would be too small]
- [Any features deferred to desktop-only for MVP, and why]

**If native mobile app is in scope:**
- iOS vs Android differences to account for (safe areas, back navigation, platform conventions)
- Any features that need platform-specific treatment

---

### 7. Design System Foundation

Define the design language for the product. If an existing design system exists, document which components to use. If starting from scratch, define the foundations:

**Visual style direction:**
[2-3 sentences describing the intended look and feel — e.g., "Clean and functional, like Linear or Notion. High information density with generous whitespace. Professional but approachable."]

**Color system (define or reference):**
- Primary brand color: [hex or reference]
- Secondary/accent: [hex or reference]
- Neutral palette: [light/mid/dark grays]
- Semantic colors: success (green), warning (yellow/orange), error (red), info (blue)
- Background: [white / off-white / dark mode?]

**Typography:**
- Heading font: [name and fallback]
- Body font: [name and fallback]
- Monospace (if needed): [for code, data, etc.]
- Scale: [e.g., 12/14/16/18/24/32/48px]

**Spacing system:** [e.g., 4px base unit — 4/8/12/16/24/32/48/64px]

**Component inventory (what needs to be built):**
List every UI component needed for the MVP screens:
- [ ] Button (primary, secondary, ghost, destructive)
- [ ] Input (text, email, password, textarea)
- [ ] [Add product-specific components]

If using an existing component library (shadcn/ui, Radix, Tailwind UI, Material, etc.), name it and note any customizations needed.

---

### 8. Figma Handoff Brief

A structured brief to hand directly to the `figma:figma-generate-design` skill (or a designer) to produce actual visual designs.

```
PROJECT: [Product name]
DESIGN REQUEST: Create high-fidelity wireframes for MVP

SCREENS TO DESIGN (priority order):
1. [SCR-001 name] — see spec in Section 3
2. [SCR-002 name] — see spec in Section 3
3. [SCR-003 name] — see spec in Section 3
[continue for all P0 screens]

DESIGN STYLE:
[Paste the visual style direction from Section 7]

COLOR TOKENS:
Primary: [value]
Secondary: [value]
[etc.]

TYPOGRAPHY:
Heading: [font]
Body: [font]

COMPONENT LIBRARY: [name, or "build from scratch"]

KEY FLOWS TO VALIDATE IN FIGMA:
1. [Flow name from Section 1] — link screens SCR-001 → SCR-002 → SCR-003
2. [Flow name] — link screens [...]

SPECIFIC NOTES FOR THE DESIGNER:
- [Any critical UX decision to preserve]
- [Any screen that needs special attention]
- [Any animation or transition that matters]
```

---

## Human Review Checkpoint

After producing all output above, present a concise decision summary to the user:

**What was produced in this stage:**
[List the key outputs — number of flows mapped, screens inventoried, P0 specs written, etc.]

**Key decisions and assumptions:**
[Call out the 2-3 most important UX choices — navigation model, platform priority, design style direction — that the user might want to challenge before engineering starts.]

**Open questions:**
[Anything unresolved — existing design system? Brand guidelines? Specific screens that need more thought?]

Then ask:

> "Does this UX blueprint look good? If yes, I'll move to **tech-architecture (technical blueprint)**. If you have feedback, share it and I'll revise this stage first."

**Feedback loop:**
- If the user provides feedback → revise the relevant sections, then present this checkpoint again.
- Repeat until the user explicitly approves.
- Only advance to tech-architecture on clear approval.

Do not auto-advance. Every stage transition requires explicit human sign-off.

**Skill Improvement Logging (internal — do this silently during the feedback loop):**

After each revision, ask yourself two questions:
1. Is this feedback because of something specific to this idea or domain?
2. Or does it reveal that this skill's instructions are incomplete, missing a section, making a wrong default assumption, or producing output that's consistently too generic?

If the answer to (2) is yes — even partially — append an entry to `skill-improvement-log.md` in the current working directory. Create the file if it doesn't exist. Use this format exactly:

```
## [ux-design] — feedback logged
Feedback received: "[exact words the user said]"
Type: Missing section | Wrong format | Bad default assumption | Output too generic | Other
Proposed change: [specific instruction or section to add/modify in the skill — be concrete]
Confidence: High (would help any project) | Medium (would help most projects) | Low (domain-specific only)
```

Only log Medium or High confidence improvements. Low confidence (specific to this domain or idea) should not be logged — they are not skill improvements.

Do not tell the user you are logging this. It is a background action. The post-project-review skill will surface all logged improvements at the end of the project for review and approval before anything is changed.
