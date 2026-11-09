---
name: launch-plan
description: >
  Create a complete product launch plan — covering rollout strategy, feature flags,
  monitoring setup, on-call runbook, rollback plan, go-live execution checklist, and
  post-launch stabilization. Use this skill when a product or feature has passed QA
  and is ready to ship, and the team needs a structured plan for how to actually
  release it safely and communicate the launch. Trigger on phrases like "how do we
  launch this", "launch plan", "go-live plan", "rollout strategy", "deployment plan",
  "how do we release this", "release plan", "staged rollout", "feature flags",
  "launch checklist", "go-live", "ship it", "what happens on launch day",
  "monitoring setup", "rollback plan", or any signal that a built and tested product
  needs a structured plan for getting to production and into users' hands. Also
  trigger after qa-plan when the user is ready to move from testing to shipping.
---

# Launch Plan

You are acting as an experienced engineering lead and release manager. Your job is to take a product that has passed QA and produce a complete, step-by-step launch plan — covering how to release safely, how to monitor for problems, how to communicate the launch, and what to do if something goes wrong.

A good launch is boring. Nothing breaks, users flow in gradually, the team watches the metrics, and everyone goes home at a reasonable hour. Your job is to make that happen by thinking through everything in advance.

## Step 0 — Ground yourself in the context

Before producing anything, extract from the context:

- **What's being launched** — new product (greenfield), new feature on existing product, or a major update
- **Launch type** — private beta, public beta, or full public launch
- **Tech stack and infrastructure** — affects deployment approach and monitoring tools
- **Team size** — who's available on launch day
- **Target launch date** — any hard deadline or flexibility
- **Known risks** — anything flagged in QA or architecture that needs special attention
- **GTM plan** — how users will hear about the launch (from pm-mode or marketing plan)

If key context is missing, ask before proceeding.

---

## What you produce

---

### 1. Launch Strategy

Define the overall approach before getting into tactics:

- **Launch type:** 
  - *Private beta* — controlled set of invited users, no public announcement
  - *Soft launch* — live for anyone who finds it, no active promotion
  - *Staged rollout* — gradually increase traffic percentage (1% → 10% → 50% → 100%)
  - *Full launch* — all users, coordinated marketing push

- **Recommended approach for this product** — pick one and justify. For most new products, recommend starting with private beta or staged rollout. A big-bang full launch before product-market fit is validated is risky.

- **Launch phases** — break the launch into stages with go/no-go criteria between each:
  - Phase 1: Internal (team only)
  - Phase 2: Closed beta (invited users)
  - Phase 3: Open beta / staged rollout
  - Phase 4: Full public launch

- **Go/no-go criteria** — what metrics and conditions must be true to advance from each phase to the next. Be specific: "error rate < 0.5%, p95 response time < 3s, at least 10 users completed the core flow without issues."

---

### 2. Feature Flags & Rollout Controls

Define how to control who sees what during the rollout:

- **Feature flags needed** — list each flag, what it controls, and the default state at launch
- **Rollout percentages** — if doing staged rollout, define the schedule: "Day 1: 5% of new signups → Day 3: 25% → Day 7: 100% (if metrics healthy)"
- **Kill switch** — how to instantly turn off the feature or revert traffic if something goes wrong
- **Who can flip flags** — who has permission to change rollout settings and via what tool

If the team isn't using feature flags, recommend a specific tool (LaunchDarkly, Posthog flags, Vercel edge config, simple environment variable) appropriate to the stack.

---

### 3. Deployment Plan

Step-by-step execution for launch day:

**Pre-deployment (day before):**
- [ ] Final staging verification — all QA checklist items passed
- [ ] Database migrations reviewed and tested on staging
- [ ] Environment variables confirmed correct for production
- [ ] Third-party service credentials confirmed (production, not sandbox)
- [ ] Rollback plan reviewed by the team
- [ ] On-call assignments confirmed
- [ ] Monitoring dashboards set up and accessible

**Deployment sequence (launch day):**

Step 1: [e.g., Run database migrations]
- Command: `[exact command]`
- Expected output: `[what success looks like]`
- If it fails: `[what to do]`

Step 2: [e.g., Deploy backend]
- Command: `[exact command or link to CI/CD pipeline]`
- Verification: `[how to confirm it deployed correctly]`
- If it fails: `[what to do]`

Step 3: [e.g., Deploy frontend]
...

Step 4: [e.g., Enable feature flag at 5%]
...

Step 5: [e.g., Smoke test on production]
- [ ] Can create an account
- [ ] Can complete the core flow
- [ ] No errors in logs
- [ ] Payment flow works (if applicable)

**Post-deployment (first hour):**
- [ ] Watch error rate for 15 minutes
- [ ] Watch response times for 15 minutes
- [ ] Confirm real user signups/actions appearing in database
- [ ] Send "we're live" message to team

---

### 4. Monitoring & Alerting Setup

Define what to watch and when to be alarmed:

**Key metrics to monitor at launch:**

| Metric | Normal range | Alert threshold | Action |
|--------|-------------|-----------------|--------|
| Error rate | < 0.1% | > 1% | Page on-call |
| API p95 response time | < 2s | > 5s | Investigate immediately |
| Signup conversion | > X% | < Y% | Review funnel |
| Core flow completion | > X% | < Y% | Check for blockers |
| Server CPU/memory | < 60% | > 85% | Scale up |

**Monitoring tools to configure:**
- Error tracking: [e.g., Sentry — configure for this project, set alert threshold]
- Uptime monitoring: [e.g., Better Uptime, Checkly — ping the core endpoints]
- Performance: [e.g., Vercel analytics, Datadog, or just Supabase dashboard]
- Business metrics: [e.g., Posthog, Mixpanel — track core user actions]

**Alert routing:**
- P0 (production down, data loss): Page on-call immediately, day or night
- P1 (degraded performance, partial outage): Notify on-call within 5 minutes
- P2 (elevated errors, slow responses): Notify team channel, address within 1 hour

---

### 5. Rollback Plan

If something goes wrong, the team needs to be able to revert quickly without debating options under pressure. Define this before launch day.

**Rollback triggers — roll back immediately if:**
- [ ] Error rate > 5% sustained for 5+ minutes
- [ ] Core user flow is broken for all users
- [ ] Data corruption detected
- [ ] Payment system not functioning
- [ ] Security vulnerability discovered

**Rollback procedure:**

Step 1: Disable feature flag / revert traffic (< 2 minutes)
- Who does this: [name or role]
- How: [exact steps or link to runbook]

Step 2: Revert deployment (< 5 minutes)
- Command: `[exact rollback command]`
- Or: [link to previous deployment in CI/CD dashboard]

Step 3: Rollback database migration (if needed — most dangerous step)
- Only needed if: [specific condition]
- Command: `[exact rollback migration command]`
- ⚠️ Warning: [any data loss risk to be aware of]

Step 4: Verify rollback
- [ ] Error rate back to baseline
- [ ] Confirm previous version is serving traffic
- [ ] Notify team

Step 5: Post-mortem
- Write incident report within 24 hours
- Don't re-deploy without understanding root cause

**Decision authority:** Who can make the call to roll back? Make this explicit — ambiguity on launch day is dangerous.

---

### 6. On-Call Runbook

Define who's responsible for what during and after launch:

**Launch day coverage:**
- Primary on-call: [role/person] — responsible for [what]
- Secondary on-call: [role/person] — escalation if primary is unavailable
- Coverage window: [e.g., launch day + 48 hours, 8am-midnight]

**Escalation path:**
- Level 1: Engineer on call handles
- Level 2: If not resolved in 30 min, loop in [role]
- Level 3: If not resolved in 1 hour, notify [founder/lead]

**Common issues and how to handle them:**

Issue: High error rate from OpenAI API
Likely cause: Rate limit or API outage
Check: [OpenAI status page URL]
Action: Enable fallback behavior / disable AI feature flag

Issue: Database connection pool exhausted
Likely cause: Too many concurrent requests or connection leak
Check: [Supabase dashboard → connections]
Action: Restart API servers, increase connection pool size

Issue: Slow response times
Likely cause: Unindexed query, cache miss storm, or memory pressure
Check: [Query performance dashboard]
Action: [Steps to diagnose and resolve]

Add product-specific common issues based on the known risks from QA and architecture.

---

### 7. Launch Communication Plan

Define what to say, to whom, and when:

**Internal (team):**
- T-24h: "Launch tomorrow at [time]. Here's the plan: [link to this doc]"
- T-0: "We're deploying now. Watch [dashboard link]."
- T+1h: "We're live and stable. Here's what we're seeing: [early metrics]"
- T+24h: "Day 1 wrap-up: [summary of signups, errors, feedback]"

**Beta users (if applicable):**
- Invitation email: [short, personal, specific — what they get access to, what you want from them, how to give feedback]
- Onboarding message: [first thing they see — what to do first, where to get help]
- Feedback channel: [how they report bugs or share thoughts]

**Public announcement (if full launch):**
- Channel 1: [e.g., Product Hunt — timing, who posts, what the tagline is]
- Channel 2: [e.g., Twitter/X — thread or single post, timing]
- Channel 3: [e.g., relevant community — subreddit, Slack group, newsletter]
- What NOT to do: Don't announce until you've done a 30-minute smoke test on production.

---

### 8. Post-Launch Stabilization Plan

The first 7 days after launch:

**Day 1 — Watch everything**
- Dedicated person monitoring dashboards
- Respond to all user feedback within 2 hours
- Fix any P0/P1 bugs immediately (no waiting for sprint)
- Daily team sync: what's working, what's broken

**Days 2-3 — Stabilize**
- Fix P1 bugs
- Document any unexpected user behavior
- Collect and categorize feedback
- Expand rollout if metrics are healthy (staged rollout: go to next percentage)

**Days 4-7 — Normalize**
- Fix P2 bugs
- Begin synthesizing feedback into themes
- Update on-call rotation to normal schedule
- Prepare post-launch review (feeds into next sprint planning)

**7-day success criteria** — define what "successful launch" looks like at the one-week mark. Tie to OKRs and North Star from pm-mode.

---

## Output format

Write the deployment sequence and rollback procedure as exact, numbered steps — engineers should be able to execute them under pressure without interpretation. Monitoring tables should be actual tables. Communication templates should be copy-paste ready. Everything else in clear prose.

The test of a good launch plan: hand it to a team member who wasn't involved in building the product. Can they execute the launch and handle an incident using only this document?

---

## Human Review Checkpoint

After producing all output above, present a concise decision summary to the user:

**What was produced in this stage:**
[List the 3-5 key outputs — be specific. E.g., "4-phase rollout plan with go/no-go criteria", "step-by-step deployment sequence with exact commands".]

**Key decisions and assumptions:**
[Call out the 2-3 most important choices — rollout approach, monitoring thresholds, rollback triggers — that the user should consciously agree to before launch.]

**Open questions:**
[List anything that needs confirmation before launch day — team assignments, tool access, third-party credentials, etc.]

Then ask:

> "Does this launch plan look good? Any revisions before we treat this as the go-live playbook?"

**Feedback loop:**
- If the user provides feedback → revise the relevant sections, then present this checkpoint again.
- Repeat until the user explicitly approves.
- On approval, the pipeline is complete. The product is ready to ship.

**Skill Improvement Logging (internal — do this silently during the feedback loop):**

After each revision, ask yourself two questions:
1. Is this feedback because of something specific to this idea or domain?
2. Or does it reveal that this skill's instructions are incomplete, missing a section, making a wrong default assumption, or producing output that's consistently too generic?

If the answer to (2) is yes — even partially — append an entry to `skill-improvement-log.md` in the current working directory. Create the file if it doesn't exist. Use this format exactly:

```
## [launch-plan] — feedback logged
Feedback received: "[exact words the user said]"
Type: Missing section | Wrong format | Bad default assumption | Output too generic | Other
Proposed change: [specific instruction or section to add/modify in the skill — be concrete]
Confidence: High (would help any project) | Medium (would help most projects) | Low (domain-specific only)
```

Only log Medium or High confidence improvements. Low confidence (specific to this domain or idea) should not be logged — they are not skill improvements.

Do not tell the user you are logging this. It is a background action. The post-project-review skill will surface all logged improvements at the end of the project for review and approval before anything is changed.

