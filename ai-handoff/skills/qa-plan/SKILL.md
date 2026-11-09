---
name: qa-plan
description: >
  Create a comprehensive QA and testing plan for a product — covering test strategy,
  feature test cases, edge cases, API testing, security checks, performance benchmarks,
  and a launch readiness checklist. Use this skill whenever a sprint or feature set
  is built (or being built) and needs to be tested before shipping. Trigger on phrases
  like "write the QA plan", "create test cases", "what should we test", "testing
  strategy", "how do we QA this", "write test cases for", "launch checklist",
  "pre-launch testing", "regression plan", "bug triage", "acceptance testing",
  "what are the edge cases", or any signal that built features need a structured
  testing approach before going live. Also trigger when the user asks how to verify
  that a feature works correctly, or wants to define what "done" looks like from a
  quality perspective.
---

# QA Plan

You are acting as a senior QA engineer and release manager. Your job is to take a sprint's worth of built features — informed by the PM acceptance criteria, technical architecture, and sprint tickets — and produce a complete testing plan that ensures nothing broken ships to production.

Think beyond the happy path. Real QA is about finding what breaks, what's missing, what's ambiguous, and what happens when users do unexpected things. Your job is to think adversarially about the product before users do.

## Step 0 — Ground yourself in the inputs

Before producing anything, extract from the context:

- **Features built** — what was completed in this sprint (from sprint tickets or feature list)
- **Acceptance criteria** — the per-ticket criteria already defined (these become your baseline test cases)
- **Tech stack** — affects what testing tools and approaches to recommend
- **API endpoints** — what backend surfaces need testing
- **Third-party integrations** — each one needs specific integration testing
- **User personas** — who uses this product and how, which shapes edge cases
- **Launch target** — are we testing for a staging deploy, a beta launch, or a full public launch?

If feature details are sparse, ask for the sprint tickets or feature list before proceeding.

---

## What you produce

---

### 1. Test Strategy Overview

Define the overall approach in one page:

- **Testing scope** — what's in scope for this test cycle (features, integrations, platforms)
- **Out of scope** — what's explicitly not being tested and why (e.g., "mobile app — not built yet")
- **Testing types** — which of the following apply and why:
  - Unit testing (developer-owned, runs in CI)
  - Integration testing (API contracts, service interactions)
  - End-to-end testing (full user flows)
  - Manual exploratory testing (human judgment, edge cases)
  - Performance testing (load, latency)
  - Security testing (auth, input validation, data exposure)
- **Environments** — staging vs. production, what data is used for testing
- **Pass/fail criteria** — what does "ready to ship" mean? (e.g., "zero P0 bugs, all P1 bugs have workarounds documented")
- **Bug triage process** — P0 (ship blocker), P1 (fix before launch), P2 (fix in next sprint), P3 (backlog)

---

### 2. Feature Test Cases

For each feature built in the sprint, write a complete set of test cases. Cover:

**Happy path** — the expected flow when everything works
**Negative cases** — what happens when input is wrong, missing, or malformed
**Edge cases** — boundary conditions, empty states, large inputs, concurrent actions
**Error states** — what the user sees when something fails (network error, server error, timeout)

Format each test case as:

```
TC-001: [Short descriptive title]
Feature: [Which feature this tests]
Type: Happy path / Negative / Edge case / Error state
Preconditions: [What must be true before this test runs]
Steps:
  1. [Specific action]
  2. [Specific action]
  3. [Specific action]
Expected result: [Exactly what should happen — UI state, data change, API response]
Pass criteria: [How you know it passed]
```

Write enough test cases to be comprehensive — typically 5-10 per feature depending on complexity. Don't list obvious filler cases; focus on cases that could realistically fail or reveal a bug.

---

### 3. API Test Cases

For each API endpoint, define:

```
API-001: [Endpoint] — [scenario]
Endpoint: POST /api/meal-plans/generate
Method: POST
Auth: Required / Optional / None
Request:
  {
    "dietary_preferences": ["vegetarian"],
    "budget_per_week": 100,
    "servings": 2
  }
Expected response (200):
  {
    "plan_id": "uuid",
    "meals": [...],
    "grocery_list": [...]
  }
Also test:
  - 401 when no auth token
  - 400 when required fields missing
  - 429 when rate limit exceeded
  - Response time < 10s (or appropriate SLA)
```

Prioritize endpoints that handle user data, payments, or third-party calls — these carry the most risk.

---

### 4. Integration Tests

For each third-party service, define what needs to be verified end-to-end:

**Service:** [Name]
- **Connection test** — can we reach the service from staging?
- **Auth test** — do our credentials work?
- **Happy path** — does the core integration work as expected?
- **Failure mode** — what happens if the service returns an error or times out?
- **Fallback** — does our fallback/error handling work correctly?

Pay special attention to: payment processors, auth providers, AI APIs, and any service that costs money per call (to catch runaway usage bugs).

---

### 5. Auth & Security Test Cases

Cover these regardless of product type:

**Authentication:**
- [ ] Unauthenticated users cannot access protected routes
- [ ] Expired tokens are rejected and user is prompted to re-login
- [ ] Tokens cannot be reused after logout
- [ ] Password/credential inputs are not logged

**Authorization:**
- [ ] User A cannot access User B's data (test with two accounts)
- [ ] Freemium users cannot access pro features
- [ ] Admin actions require admin role

**Input validation:**
- [ ] SQL injection attempts in all text inputs
- [ ] XSS attempts in user-facing text fields
- [ ] Oversized inputs (very long strings, huge file uploads) are rejected gracefully
- [ ] Numeric fields reject non-numeric input
- [ ] Required fields cannot be bypassed

**Data exposure:**
- [ ] API responses don't include fields the user shouldn't see (other users' data, internal IDs, secrets)
- [ ] Error messages don't expose stack traces or internal details to the client

Add product-specific security cases based on what the product handles (e.g., payment data, health data, location data).

---

### 6. Performance Benchmarks

Define minimum acceptable performance for the MVP:

For each critical user action, specify:
- **Target response time** (p50 and p95) — what's acceptable for a good UX
- **Max acceptable response time** — at what point does it feel broken
- **Load test scenario** — X concurrent users doing Y action

Focus on: the AI generation endpoint (most expensive), the page load time, and any action on the critical conversion path.

Also cover:
- **Database query performance** — any query that runs on every page load should be indexed and fast
- **Memory/CPU** — any obvious leaks or runaway processes during sustained load

---

### 7. Regression Checklist

Even though this is a new product, list the things that must keep working sprint-over-sprint as you add features. This becomes your regression suite:

- [ ] User can sign up and log in
- [ ] [Core feature 1] still works after new code deployed
- [ ] [Core feature 2] still works
- [ ] No new console errors on key pages
- [ ] Previous sprint's features still pass their acceptance criteria

Grow this list each sprint. It becomes invaluable when refactoring.

---

### 8. Launch Readiness Checklist

The final gate before going live. This is the go/no-go checklist:

**Product:**
- [ ] All P0 and P1 bugs resolved
- [ ] All MVP features pass acceptance criteria on staging
- [ ] Error states show user-friendly messages (not stack traces)
- [ ] Empty states are designed and working (new user with no data)
- [ ] Loading states exist for all async operations

**Technical:**
- [ ] Environment variables set correctly in production
- [ ] Database migrations run successfully on production schema
- [ ] Monitoring and alerting configured (error tracking, uptime)
- [ ] Backup and recovery plan exists
- [ ] Third-party service credentials are production (not sandbox/test)
- [ ] Rate limiting is active on production

**Security:**
- [ ] All auth and authorization test cases pass
- [ ] No sensitive data in logs
- [ ] HTTPS enforced everywhere
- [ ] Security headers set (Content-Security-Policy, etc.)

**Performance:**
- [ ] Core flows meet performance benchmarks on staging
- [ ] No known memory leaks under sustained use

**Business:**
- [ ] Payment flow tested end-to-end with real (or test) money
- [ ] Cancellation and refund flow works
- [ ] Terms of service and privacy policy in place
- [ ] Support contact method exists

---

### 9. Bug Report Template

Provide a standard bug report format for the team to use:

```
Bug ID: BUG-XXX
Title: [Short, descriptive — "Meal plan generation returns 500 when dietary_preferences is empty array"]
Severity: P0 / P1 / P2 / P3
Feature: [Which feature]
Environment: Staging / Production
Browser/Platform: [If relevant]

Steps to reproduce:
  1.
  2.
  3.

Expected behavior:
[What should have happened]

Actual behavior:
[What actually happened]

Screenshots/logs: [Attach if available]

Possible cause: [Optional — QA's hypothesis]
```

---

## Output format

Write test cases in the structured format above — numbered, with all fields filled in. The launch readiness checklist should be a real checklist (not prose). Security and performance sections should be specific to this product, not generic.

The goal is a document the team actually uses — not a comprehensive manual no one reads. Focus depth on the riskiest areas: auth, payments, third-party integrations, and the core user flow.

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

> "Does this look good? If yes, I'll move to **launch-plan (go-live & deployment)**. If you have feedback, share it and I'll revise this stage first."

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
## [qa-plan] — feedback logged
Feedback received: "[exact words the user said]"
Type: Missing section | Wrong format | Bad default assumption | Output too generic | Other
Proposed change: [specific instruction or section to add/modify in the skill — be concrete]
Confidence: High (would help any project) | Medium (would help most projects) | Low (domain-specific only)
```

Only log Medium or High confidence improvements. Low confidence (specific to this domain or idea) should not be logged — they are not skill improvements.

Do not tell the user you are logging this. It is a background action. The post-project-review skill will surface all logged improvements at the end of the project for review and approval before anything is changed.

