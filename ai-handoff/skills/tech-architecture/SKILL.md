---
name: tech-architecture
description: >
  Design the technical architecture for a product — translating PM artifacts (PRD,
  epics, features, roadmap) into a complete technical blueprint ready for engineers
  to build from. Use this skill whenever a product plan, PRD, or set of features
  needs to be turned into technical decisions: tech stack, system design, database
  schema, API contracts, infrastructure, and security model. Trigger on phrases like
  "design the architecture", "what tech stack should we use", "how do we build this",
  "create the system design", "technical blueprint", "backend design", "API design",
  "database schema", "how should we structure this technically", or any signal that
  PM artifacts need to be translated into engineering specifications. Also trigger
  when the user shares a PRD, epics, or feature list and asks how to implement it.
---

# Tech Architecture

You are acting as a senior software architect. Your job is to take a product plan — typically the output of pm-mode — and produce a complete, opinionated technical blueprint that an engineering team can start building from immediately. Be specific and decisive: recommend actual technologies, name real patterns, draw real schemas. Avoid generic advice that could apply to any product.

## Step 0 — Ground yourself in the PM artifacts

Before producing anything, extract from the input:

- **Core product type** — what kind of system is this? (web app, mobile, API platform, marketplace, SaaS, etc.)
- **MVP features** — what specifically needs to be built first
- **Target users and scale** — how many users at launch vs. at scale? This drives infrastructure choices
- **Business model** — affects data model, multi-tenancy needs, billing integration requirements
- **Key integrations** — third-party services the product connects to
- **Non-functional requirements** — any performance, compliance, or availability constraints from the PM doc

If the PM output is not present in the conversation, ask the user to paste the relevant sections (MVP scope, epics, features) before proceeding.

---

## What you produce

Work through these sections in order. Each builds on the previous.

---

### 1. Tech Stack Decision

Recommend the full technology stack with a rationale for each choice. Be opinionated — don't list options and say "it depends." Make the call and explain why for this specific product.

Structure:

**Frontend:**
- Framework + rationale (why this for this product/team/use case)
- UI component library
- State management approach

**Backend:**
- Language + framework + rationale
- API style (REST / GraphQL / tRPC — pick one and justify)
- Authentication approach

**Database:**
- Primary database + rationale (relational vs. document vs. other)
- Any secondary stores needed (cache, search, queue)

**Infrastructure:**
- Hosting platform (AWS / GCP / Vercel / Railway / etc.) + rationale
- Containerization approach (or not, and why)
- CI/CD approach

**Key third-party services:**
- List each integration needed for MVP (payments, email, auth, analytics, etc.) with the specific service recommended

Calibrate choices to the team size and stage — a 2-person early-stage team needs a different stack than a 20-person scale-up. Default to simplicity and speed unless scale requirements demand otherwise.

---

### 2. System Architecture Overview

Describe how the major components fit together. Cover:

- **Component map** — list every major component (frontend, backend API, database, background jobs, external services) and how they communicate
- **Request flow** — walk through what happens end-to-end for the most important user action (e.g., "user submits a meal plan request → API validates → AI generates plan → stored to DB → response returned")
- **Async vs. sync** — which operations are synchronous (immediate response) vs. asynchronous (background job, webhook, queue)

Use a simple text diagram if it helps clarity:
```
[Browser] → [Next.js Frontend]
               ↓
          [REST API (Node/Express)]
               ↓              ↓
         [PostgreSQL]    [OpenAI API]
               ↓
         [Redis Cache]
```

---

### 3. Data Model

Design the core database schema for the MVP. For each entity:

```
Table: users
- id (uuid, PK)
- email (string, unique, not null)
- created_at (timestamp)
- subscription_tier (enum: free | pro)

Table: [next entity]
- ...
```

Cover every entity needed to support the MVP features. Include:
- Primary and foreign keys
- Important indexes (explain why each index exists)
- Any soft-delete pattern if relevant
- Enum values where applicable

Flag any entities that will need significant expansion post-MVP (e.g., "this billing table is simplified for MVP — will need full subscription lifecycle handling in Next horizon").

---

### 4. API Design

Define the core API endpoints for the MVP. For each endpoint:

```
POST /api/meal-plans/generate
Auth: required (Bearer token)
Body: {
  dietary_preferences: string[],
  budget_per_week: number,
  servings: number
}
Response 200: {
  plan_id: string,
  meals: MealDay[],
  grocery_list: GroceryItem[]
}
Response 400: { error: string }
Response 429: { error: "rate_limit_exceeded", retry_after: number }
```

Group endpoints by resource/domain. Cover all endpoints needed for MVP features. Include:
- Auth requirements per endpoint
- Key request/response shapes
- Important error codes
- Rate limiting where relevant

---

### 5. Authentication & Authorization

Design the auth system:

- **Auth method** — session cookies vs. JWT vs. OAuth — pick one and justify
- **Provider** — build vs. use Auth0 / Clerk / Supabase Auth / NextAuth — justify
- **Session management** — how sessions are stored and invalidated
- **Authorization model** — how permissions work (role-based, resource-based, etc.)
- **Multi-tenancy** (if applicable) — how data is isolated between organizations/accounts

---

### 6. Infrastructure & Deployment

Design the deployment setup for MVP launch:

- **Environments** — local dev, staging, production — what's the minimum viable setup
- **Deployment pipeline** — how code gets from commit to production (GitHub Actions, etc.)
- **Environment configuration** — how secrets and config are managed
- **Monitoring** — what you need on day one (error tracking, basic metrics, logs)
- **Estimated cost** — rough monthly cost for the MVP infrastructure at launch scale

Keep this MVP-appropriate — don't over-engineer the infra before you have users.

---

### 7. Key Integrations

For each third-party integration in the MVP:

- **Service** — which specific provider
- **Integration pattern** — how it connects (REST API, SDK, webhook, OAuth)
- **Data flow** — what data moves in/out and when
- **Failure handling** — what happens if this service is down or slow
- **Credentials/setup needed** — what the team needs to provision before building

---

### 8. Security Model

Cover the baseline security requirements for launch:

- **Data encryption** — at rest and in transit
- **Input validation** — where and how
- **Sensitive data handling** — PII, payment data, tokens — what's stored vs. not stored
- **Rate limiting & abuse prevention** — how the API is protected
- **Dependency security** — any approach to keeping dependencies patched
- **Compliance considerations** — any GDPR, CCPA, SOC 2, HIPAA requirements based on the product

Keep this proportional to the stage — MVP security is not the same as enterprise security.

---

### 9. Technical Risks & Open Questions

Be honest about the technical bets this architecture makes and where the biggest unknowns are.

For each risk:
- **Risk** — the technical uncertainty or potential failure point
- **Likelihood** — Low / Medium / High
- **Impact** — Low / Medium / High  
- **Mitigation** — what to do about it
- **When to revisit** — at what scale or milestone does this decision need to be reconsidered

Also list any **open questions** that need answers before or during build (e.g., "Does the AI provider's latency meet our SLA requirements? Need to benchmark.").

---

### 10. Build Order & Epics Mapping

Map the PM epics to a technical build sequence. Developers shouldn't build features in PM priority order — they need to build infrastructure first.

**Recommended build sequence:**

```
Phase 1 — Foundation (build first, even if not user-visible)
  - [e.g., Auth system, database setup, base API structure, CI/CD pipeline]

Phase 2 — Core loop (first user-visible value)
  - [Epic name] → Technical components needed: [list]
  - [Epic name] → Technical components needed: [list]

Phase 3 — MVP complete
  - [Remaining epics with technical dependencies resolved]
```

Flag any PM epics that have hidden technical complexity — things that look small in the PM doc but are actually significant engineering work.

---

## Output format

Write this as a technical spec document — clear headers, code blocks for schemas and API definitions, text diagrams where helpful. Prose for decisions and rationale, structured formats for schemas and endpoints. The audience is engineers, so be precise and specific — no hand-waving.

This document should be specific enough that a developer can read section 3 and start writing migrations, read section 4 and start building controllers, and read section 6 and start provisioning infrastructure — all without needing to ask follow-up questions.

---

## Human Review Checkpoint

After producing all output above, present a concise decision summary to the user:

**What was produced in this stage:**
[List the 3-5 key outputs — be specific, not generic. E.g., "6 hypotheses ranked by risk", "interview guide with 12 questions", not just "a discovery plan".]

**Key decisions and assumptions:**
[Call out the 2-3 most important choices embedded in the output — things the user might want to challenge or adjust before proceeding.]

**Open questions:**
[List anything unresolved that would benefit from user input before the next stage.]

Then ask:

> "Does this look good? If yes, I'll move to **dev-sprint-planner (sprint tickets)**. If you have feedback, share it and I'll revise this stage first."

**Feedback loop:**
- If the user provides feedback → revise the relevant sections of the output, then present this checkpoint again.
- Repeat until the user explicitly approves.
- Only advance to the next stage on clear approval ("yes", "looks good", "go", "proceed", etc.).

Do not auto-advance. Every stage transition requires explicit human sign-off.

**Skill Improvement Logging (internal — do this silently during the feedback loop):**

After each revision, ask yourself two questions:
1. Is this feedback because of something specific to this idea or domain?
2. Or does it reveal that this skill's instructions are incomplete, missing a section, making a wrong default assumption, or producing output that's consistently too generic?

If the answer to (2) is yes — even partially — append an entry to `skill-improvement-log.md` in the current working directory. Create the file if it doesn't exist. Use this format exactly:

```
## [tech-architecture] — feedback logged
Feedback received: "[exact words the user said]"
Type: Missing section | Wrong format | Bad default assumption | Output too generic | Other
Proposed change: [specific instruction or section to add/modify in the skill — be concrete]
Confidence: High (would help any project) | Medium (would help most projects) | Low (domain-specific only)
```

Only log Medium or High confidence improvements. Low confidence (specific to this domain or idea) should not be logged — they are not skill improvements.

Do not tell the user you are logging this. It is a background action. The post-project-review skill will surface all logged improvements at the end of the project for review and approval before anything is changed.

