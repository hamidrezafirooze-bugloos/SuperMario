---
name: pm-business-logic-discovery
description: Builds a PM-confirmed business knowledge base for an existing project, one small business domain at a time, guiding the PM step by step. For each domain it audits the code, documents the rules and the decisions behind them, logs every question and answer (including "I don't know"), and works on one domain at a time (finishing it, or pausing it when the PM chooses, before moving on). Also captures the project's main goal and reads existing documents as evidence. Use when a PM wants to understand or document what a project actually does, when business rules or decisions are undocumented or live only in the code, or when onboarding people or AI agents. Never invents business rules or reasons; anything not confirmed by a person stays labeled as unconfirmed.
---

# PM Business Logic Discovery

## Goal
Produce a project knowledge base that explains the business behind this codebase: who uses it, what they can do, what they see, how the main processes flow, for every rule why it exists, why the project exists (its main goal), and which key decisions were made along the way and why. Every statement is either confirmed by a person or clearly marked as not yet confirmed. At the end, the AI must be able to explain the whole business back to the PM and be told it got it right.

The work is done **one small business domain at a time**. Each domain is finished (approved, or explicitly parked with its open items logged) before the next one starts, and the PM is guided step by step through it.

The core idea: **code shows what the system does, not what the business wants.** Documentation written from code alone freezes bugs and leftovers into "how the business works". This skill closes that gap by making the AI state what it understood, then having the PM confirm or correct it.

The knowledge base is written for any later reader (new developers, other PMs, AI agents). What they do with it is out of scope for this skill.

## Principles
1. **Code is evidence, not truth.** Everything you derive from code starts as `Inferred`. Only a person can move it to `Confirmed`.
2. **Never guess a business rule.** If the code doesn't make it clear, contradicts itself, or you can't tell intent from leftover, ask. Do not pick the most likely reading and move on.
3. **Never ask the PM technical questions.** No class names, frameworks, or "should this be a Redis cache?". Use business language: users, actions, money, limits, states, messages. File and line references stay in the docs for developers, not in the questions.
4. **Show your understanding, then ask.** Don't open with a blank question. Say "From the code I understand that X. Is that right?" and let the PM answer yes / no / partly.
5. **Ask for concrete examples.** For every calculation or limit, ask for 2 to 3 real examples with numbers. They make the rule unambiguous for every later reader.
6. **Separate built vs wanted.** If the code does something different from what the PM says the business wants, that is a code-vs-business gap. Record it; do not silently pick a side.
7. **Talk to the PM in the language they write in** (e.g. Persian). Write the docs in the team's agreed language (default English; ask once if unknown). Keep IDs and technical identifiers in English.
8. **Read-only on the code.** This skill changes documentation only. Never change source code, tests, or configs.
9. **Ground every claim.** Every rule cites `path:line`. No evidence means the status is `Unknown`, not a plausible guess. Describe what the system does and what the business wants; never suggest refactors or fixes (those are separate tickets). Recover the *what and why*, not a line-by-line transcription of the *how*.
10. **Behavior first, from the user's perspective.** Describe what users can do, what they see, and how the system reacts. The rule text never contains framework, architecture, class, or function names; technical references live only in the `Evidence` line. Every behavior also needs a reason: ask the PM what business problem it solves. If the PM doesn't know, follow "When the answer is 'I don't know'" below; never invent a reason.
11. **Understand the whole, not just the parts.** Also capture how rules combine into end-to-end journeys, how domains affect each other, and what the product deliberately does not do.
12. **Existing documentation is evidence, not truth.** Read every document that already exists (README files, docs folders, wiki or Confluence/Notion exports, ADRs, changelogs, specs, tickets). Treat what they say as `Inferred` until the PM confirms it is still current, cross-check it against the code, and record conflicts as `Contradiction`. Never edit, move, or delete existing documents; list and link them.
13. **Decisions need a source, and reasons need an owner.** A choice visible in the code (a limit, a removed feature, a flag) is only an `Inferred` decision until a person says it was decided and why. If the PM doesn't know the history, record who might (a person or role) and keep it `Unknown`.
14. **One active domain at a time, small steps.** Never audit, interview, and write the whole project in one pass. Work on one domain at a time and aim to finish it before opening the next. The PM may pause a domain and switch to another (see "Pausing and switching domains"); you never switch on your own. Inside a domain, finish one round of questions before starting the next.
15. **Log everything, including what nobody knows.** Every question and every answer is recorded with who answered and when. "I don't know" is an answer and gets logged, with an owner and a next step. Nothing is silently dropped, and nothing is filled in by you.
16. **Always say where we are.** Start every message to the PM with the current position and end it with exactly what you need next (see "Guiding the PM").

## Status labels (use exactly these)
| Status | Meaning |
|---|---|
| `Confirmed` | A person explicitly confirmed it (name and date recorded) |
| `Confirmed, why unknown` | The PM confirms the behavior is still wanted but can't say why; the missing reason is logged as a gap with an owner |
| `Inferred` | Derived from code or documents, not yet confirmed |
| `Contradiction` | Code and PM disagree, or two parts of the code or docs disagree; needs a decision |
| `Unknown` | Can't tell what the code intends, or nobody knows yet |
| `Legacy / Dead` | PM confirmed it's unused or obsolete |
| `Wanted-not-built` | PM wants it, code doesn't do it |

Only `Confirmed` content is reliable business knowledge. Everything else is on the open-questions list.

## How the work is split: domains
A **domain** is one business capability with its own user actions, rules, and screens (for example orders, billing, catalog). Choose domains by business meaning, not by code folders.

- **Size:** aim for a domain a PM can finish in a few sessions (roughly up to 25 rules). If a domain grows beyond that, split it into sub-domains (`domains/orders/refunds/`); never nest deeper than two levels.
- **Names and IDs:** folder names in kebab-case; each domain has a 3 to 4 letter code (`ORD`, `BIL`, `CAT`). All IDs carry the domain code and are never reused: `BR-ORD-003` (rule), `D-ORD-001` (decision), `Q-ORD-014` (question). Project-wide items use `PRJ`.
- **No duplication:** refer to other files by ID instead of copying text.

## Output structure
Create under `docs/business-logic/` (reuse the repo's existing docs folder if there is one):

```
docs/business-logic/
  business-summary.md      # the one document anyone can read to understand what the project does, why it exists, and which key decisions shaped it (written last, PM-approved)
  README.md                # product purpose and main goal, how success is measured, users/roles, domain map with dependency diagram and approval status, how to read these docs
  glossary.md              # business term -> PM's meaning -> name in code (grows with every domain)
  journeys.md              # end-to-end flows across domains, from a user's point of view
  scope.md                 # what the product explicitly does NOT do, manual processes outside the system
  decisions.md             # project-level decisions (PRJ) and an index of every domain's decisions
  existing-docs.md         # register of documents that existed before: what they cover, how current they are, what conflicts with the code
  _progress.md             # per domain: status and current step, plus "next action" so work can resume in a new session
  _open-questions.md       # index of every open or parked question across domains, grouped by owner
  domains/
    <domain>/
      overview.md          # purpose, in/out of scope, users and actions, Depends on / Affects, status
      rules.md             # business rules (BR-...)
      decisions.md         # decisions behind this domain (D-...)
      questions.md         # every question and answer for this domain, with who and when (Q-...)
      _audit.md            # raw code inventory for this domain (temporary, removed when the domain is closed)
```

## Workflow
Stage A and B happen once. Stage C repeats for each domain. Stage D happens once at the end.

### Stage A: Orient (once)
- Detect the stack, entry points, and top-level structure. Read README, package manifests, and existing docs.
- Tell the PM in one or two sentences how the work will go (map the domains, then one domain at a time: audit, draft, two rounds of questions, approval) and get a go-ahead on the scope: the whole project or specific parts.
- **Inventory existing documents.** Search the repo and anything the PM points you to: README files, `docs/` folders, ADRs, changelogs, specs, wiki or Confluence/Notion exports, onboarding notes, tickets. List each in `existing-docs.md` with location, what it covers, when it was last updated, and how far you trust it (`Current`, `Partly current`, `Outdated`, or `Unchecked`; only the PM can mark a document `Current`). Read them before the code as hints about intent, then cross-check each claim against the code; every conflict becomes a `Contradiction`.
- **Project-level questions (at most 3 per message):** What is the main goal of this project, and who was it built for? How does the business know it works (the numbers or signals it watches)? Where does other documentation live, and who knows the project's history? What changed since the beginning, and what were the biggest turning points? Which language should the docs be in? Record the answers in `README.md` and `decisions.md` (PRJ).
- Create the output folder, `README.md` skeleton, `_progress.md`, and `_open-questions.md`.

### Stage B: Map the domains (once)
Do a quick, shallow scan: user actions, routes and screens, modules, existing docs. Propose a list of domains (name, code, one sentence each) and a suggested order. Start with domains that others depend on, or with the ones the PM says matter most or are least understood. If the repo is large (roughly 100+ files), make sure every file belongs to exactly one domain.

Ask the PM to confirm the names, merge or split anything, and agree on the order. Then record the domain table in `_progress.md` and the domain map in `README.md`. Do not draft any rules yet.

### Stage C: The domain cycle (repeat per domain, one domain at a time)
Only one domain is **active** at a time. Normally you open the next domain once the current one is closed (approved, or closed with open items). If the PM wants to switch earlier, pause the current one first (see "Pausing and switching domains"). The six steps:

**C1. Scope the domain.** In 3 lines, tell the PM what you think is in and out of this domain and list the user actions it contains. Get a yes or a correction. Create the domain folder and `overview.md`.

**C2. Audit (silent).** Build `domains/<domain>/_audit.md`: what you found and where (`path:line`). Audits of different domains may run in parallel agents (read-only), but the interviews stay one domain at a time. If you use parallel agents, give each one a single small unit (one module, screen, or endpoint) with explicit boundaries. Look specifically for:
- **User actions and what they see (start here):** for every action, who can do it (role), under which state and conditions, what they see afterward, and what changes. Everything else hangs off this list.
- **Entry points:** routes, pages, screens, API endpoints, CLI commands, cron/queue jobs, webhooks.
- **Data state:** seed and fixture data, migrations, enum values; they show which states actually occur, including legacy values no current code path creates. If the PM can share real data samples, use them.
- **Entities, states, and lifecycles:** models, schemas, status fields, state machines, transitions, who may trigger each.
- **Rules:** validations, guards, `if` conditions that block or allow an action, limits, thresholds, hard-coded numbers and strings.
- **Calculations:** totals, taxes, discounts, rounding, currency, date and timezone handling, sorting.
- **Permissions:** roles, ownership checks, feature flags, plan or tier gating.
- **Side effects:** emails, notifications, exports, generated files, external calls, payments.
- **UI behavior that is business logic:** what is shown, hidden, disabled, or required, and the exact user-facing messages (error texts often state the rule in the PM's words). Record these in the rules' `Outcome`, not as a separate design document.
- **Cross-domain links:** where this domain triggers or depends on another. These fill `Depends on / Affects` and later become journeys.
- **History and decisions:** git history (commit messages, PR descriptions, merged and abandoned branches), the issue tracker, changelogs, removed features, flags, comments explaining a choice. Each is a candidate decision; note its source (commit, ticket, document).
- **Intent hints:** existing tests, TODO/FIXME/HACK comments, commented-out code, unused functions, half-built screens, duplicated logic that disagrees.
- **Things you could not understand:** list them explicitly. An honest "I couldn't tell" is more valuable than a confident guess.

**C3. Draft (still no PM).** Write the domain's files, everything `Inferred` or `Unknown`:
- `overview.md` header:
```markdown
# Orders (ORD)
- **Purpose of this domain:** (PM's words, filled in during the interview)
- **In scope / out of scope:** ...
- **Users and main actions:** `[Customer]` places, pays, cancels
- **Depends on:** Catalog (price and stock: BR-CAT-001), Billing (payment result: BR-BIL-001)
- **Affects:** Billing (order total and Pending payment: BR-ORD-002)
- **Status:** Drafted
```
`Depends on` is what this domain needs from others; `Affects` is what others get from it. If domain A lists B under `Affects`, B must list A under `Depends on` (update the neighbor's file, or ask the PM when unclear).

- `rules.md`, one entry per rule:
```markdown
### BR-ORD-003: Orders above the limit are rejected
- **Status:** Inferred
- **Rule (plain language):** WHEN a customer places an order, IF it has more than 50 items, THEN it is rejected.
- **Who/when:** `[Customer]`, at checkout.
- **Outcome:** Order is blocked; message "Maximum 50 items per order" is shown.
- **Purpose (why):** Unknown. To ask: Q-ORD-006.
- **STATE / NEXT (if applicable):** STATE: cart unchanged. NEXT: customer removes items and tries again.
- **Evidence:** `src/orders/validate.ts:42`, message in `locales/en.json:118`
- **Edge cases noticed:** Exactly 50? (code uses `>`, so 50 is allowed)
- **Examples (to confirm):** 50 items -> allowed; 51 items -> rejected
```
When confirmed, the status line records the source: `Confirmed (Q-ORD-006; Sara, 2026-10-12)`.

- `decisions.md`: candidate decisions found in the audit. The reason is never filled in by you:
```markdown
### D-ORD-002: One order may hold at most 50 items
- **Status:** Inferred
- **Decision:** An order is limited to 50 items.
- **Why:** Unknown. To ask: Q-ORD-006.
- **Alternatives considered:** Unknown.
- **Decided by / when:** Unknown. The limit first appears in commit `3f9a1c2` (2025-03-14); the author has left the team.
- **Still valid?:** Unknown
- **Source:** git history, `src/orders/validate.ts:42`
- **Affects:** BR-ORD-003
```
- `questions.md`: create it and log every question you are about to ask (format below).

Rules for writing rules: IDs are stable (if a rule goes away, mark it `Legacy / Dead` or `Superseded by BR-...`). One rule per entry. Use precise phrasing (`WHEN` / `IF` / `WHILE` / `THEN`, `NEXT` for what follows, `STATE` for a state change, `[ROLE]` for the actor) and avoid vague words ("quickly", "appropriate") unless the PM gives a number. Keep the rule text in business language; technical references only in `Evidence`. Always note boundary behavior (`>` vs `>=`, empty, zero, negative, max, null, duplicate, timezone). Document behavior you can't explain as its own entry with status `Unknown`; never drop it.

**C4. Interview in two rounds.** Finish a round before starting the next. At the end of each round, show what you recorded in 3 or 4 lines and ask "anything to correct?"
- **Round 1: Rules.** Purpose (what business problem it solves, per rule); actors and roles; lifecycle and states; numbers (ask 2 to 3 worked examples with real numbers); boundaries; failure and refusal; time (deadlines, expiry, timezones); side effects; data (kept, deleted, hidden); exceptions (special customers, legacy data, manual processes); leftovers ("the code has X but nothing seems to use it, still needed?"); wanted vs built.
- **Round 2: Decisions and neighbors.** For each candidate decision: "Was this a deliberate choice? Why was it decided, by whom, roughly when? What else was considered? Is it still valid?" Then confirm this domain's `Depends on / Affects` list, one link at a time, and the typical user story across domains.

How to ask:
- At most **3 questions per message**. Wait for the answers before continuing.
- Prefer closed questions with options ("A) rejected, B) allowed with a warning, C) other"). One decision per question.
- Lead with your understanding in plain language, then ask for confirmation.
- Rank by impact. Ask first the questions where a wrong guess would put a wrong rule into the knowledge base. Skip nit-picks unless the PM wants full coverage. Each question says what happens if it stays unanswered ("until you confirm, I'll keep this as `Unknown`").
- Repeat back any important answer in one sentence and get a yes before recording it as `Confirmed`.
- If the PM's answer contradicts the code: mark `Contradiction`, record both, and ask whether the code is wrong (bug), the business changed (update), or both are valid in different cases.
- Quality check before sending: Could the PM answer this without knowing how the code works? Is there a concrete example or options? Is it one decision, not three bundled together?

**C5. Review and approve the domain.**
1. **Coverage check:** every entry in the domain's `_audit.md` maps to a rule, a decision, `Legacy / Dead`, or an open question.
2. **Review pass**, ideally by a fresh agent or fresh context. It checks that: every rule has real `path:line` evidence; no rule or reason was invented; no status is more confident than its evidence (nothing `Confirmed` without a recorded answer in `questions.md`); no current bug was written down as intended behavior; every rule has a purpose or a logged gap; every decision has a source and its reason came from a person; `Depends on / Affects` is reciprocal; and a new team member could understand the domain from the docs alone.
3. **Domain summary to the PM** in 5 to 10 lines of business language: what the domain does, the key rules and why, how many are confirmed, contradictions, unknowns, and what is still open.
4. **Approval:** ask explicitly: "Do you approve <domain> as written? (yes / no, with changes / yes, but park the open items)". Record `Approved by <PM>, <date>` only after a clear yes. Silence, "ok" to another question, or "looks fine" without having seen the summary doesn't count. Anything other than a clear yes is feedback: fix it and ask again.

**C6. Close the domain.**
- Set the domain to `Closed` or `Closed with open items` in `_progress.md`, and write the **next action** there (which domain is next, which step).
- Update the cross-cutting files: new terms in `glossary.md`, the domain map and diagram in `README.md`, the neighbors' `Depends on / Affects`, the index in `decisions.md`, and `_open-questions.md`.
- Delete the domain's `_audit.md` (or keep it if the team wants the evidence trail).
- Tell the PM what is done and propose the next domain. The PM can stop here; `_progress.md` lets any later session resume.

### Stage D: Wrap up (once, after the domains)
1. **`journeys.md`:** the main end-to-end flows as short numbered stories from the user's point of view, each step linking rule IDs from several domains. Mark a journey `Confirmed` only after the PM has read it. Draft journeys as soon as the domains they cross are closed.
2. **`scope.md`:** what the product does not do, manual processes outside the system, and `Wanted-not-built` items.
3. **`decisions.md` (root):** project-level decisions (PRJ), plus the index of every domain's decisions.
4. **`README.md`:** final domain map with a Mermaid diagram of dependencies (explicit colors that work in light and dark themes), approval status per domain, and the "how to use" notes below.
5. **`existing-docs.md`:** finish the register: what is still true (confirmed), what is outdated, what conflicts with the code, and where that information now lives.
6. **Business summary and teach-back.** Write `business-summary.md`: the one document anyone (PM, new team member, stakeholder) can read to understand what the project does, why it exists, and which key decisions shaped it, in the PM's language, about 2 pages. It contains:
   - (a) what the product is, the business problem it solves, and its main goal (with how success is measured, if the PM said);
   - (b) who uses it and what each role can do;
   - (c) the main journeys, a few sentences each;
   - (d) the domains, one or two sentences each, with a link;
   - (e) the most important rules per domain (3 to 5, with IDs and their purpose);
   - (f) how the domains connect (the dependency diagram);
   - (g) what the product does not do;
   - (h) the key decisions and why (5 to 8, linked; only decisions whose reason a person gave);
   - (i) a clearly separated "Not yet confirmed" section: the open and parked questions and `Contradiction`s that matter most, with who could answer them.

   Use only content that already exists in the detailed docs (it summarizes and never adds facts), no technical terms or code references, mark anything not `Confirmed` visibly, and state the date and who approved it. Then do the **teach-back**: ask the PM to read it and correct anything wrong, update the domain docs and the summary with every correction, and repeat until the PM says it matches their understanding. This is the final test that the AI actually understands the business.

## Guiding the PM (step by step)
Start every message to the PM with the position, and end with exactly what you need:

> **Domain 2 of 5: Billing · Step 4 of 6: Interview, round 1 (rules)**
> Done so far: Catalog is closed; Billing is audited and drafted.
> **I need from you now:** answers to Q-BIL-004 and Q-BIL-005.

- Never ask for something from a later step. If the PM jumps ahead ("what about refunds?"), log it as a question in the right domain and return to the current step, unless the PM asks to switch domains; then follow "Pausing and switching domains".
- Keep each message short. Long drafts live in the files; show the PM only what they need to react to.
- If the PM wants to stop, save the state in `_progress.md` (current domain, step, next action) before ending.

## Pausing and switching domains
The PM may stop a domain partway and move to another (missing information, someone unavailable, changed priorities). That is fine, as long as it is the PM's choice and nothing is lost:
1. **Offer a clean stopping point.** If a round of questions is half done, offer to finish just that round first (usually 1 to 3 questions). If the PM still wants to switch, switch.
2. **Pause the current domain.** In `_progress.md` and in its `overview.md`, set `Status: Paused at step N` and write the exact next action (for example "Round 1: ask Q-BIL-012 and Q-BIL-013"). Everything already drafted stays as it is: unconfirmed items keep `Inferred` or `Unknown`, and their questions stay `Open` in `questions.md` and `_open-questions.md`.
3. **Never approve or close a paused domain**, and don't treat its unconfirmed rules as facts elsewhere: links to it in other domains' `Depends on / Affects` and in journeys stay `Inferred` until it is closed.
4. **Start or resume the other domain** from its own step in `_progress.md`.
5. **Remind, don't nag.** At the start of each session and whenever a domain closes, list the paused domains in one line ("Paused: Billing at step 4") and ask which to continue. If more than two domains are paused at once, point out that keeping them consistent gets harder and suggest finishing one; the PM still decides.
6. **Before the wrap-up (Stage D)**, every domain is either closed or explicitly left paused, and the business summary lists paused domains and their open items under "Not yet confirmed".

## Logging questions and answers
Every question lives in its domain's `questions.md` from the moment you plan to ask it. Format:

```markdown
### Q-ORD-019: Unpaid orders: 24 or 48 hours?
- **Status:** Open | Answered | Parked | Dropped
- **Asked:** 2026-10-12, about BR-ORD-006 / D-ORD-003
- **Question:** The code cancels unpaid orders after 24 hours. Is that what you want?
- **Answer:** "No, 48 hours: customers often pay the next day."
- **Answered by / when:** Sara (PM), 2026-10-12
- **Effect:** BR-ORD-006 -> `Contradiction`; the code needs a decision (bug or intended).
- **Owner to resolve:** PM
- **Next step:** Confirm with the tech lead which value is live.
```
- When an answer arrives, update the question, then the rule or decision it affects, then `_open-questions.md`. Keep history: if an answer changes, add "Previously: ...".
- `_open-questions.md` is an index only (ID, domain, short question, affects, owner, since when), grouped by owner (PM, business stakeholder, tech lead, finance/legal, unknown). Rebuild it whenever a domain closes.

## When the answer is "I don't know" (or "I don't know why it is like this")
This happens constantly and is a valid, useful answer. Do not push, do not guess, do not let it vanish.
1. Ask at most one follow-up: "Who might know, or where might it be written down (a ticket, a chat, an old doc, the person who wrote it)?"
2. Log it in `questions.md`: status `Parked`, the answer "PM doesn't know" with date, the **owner to ask** (person, role, or team), and the **next step** (for example "ask Finance", "check the commit author").
3. In the rule: `Purpose (why): Unknown (PM doesn't know, 2026-10-12; Q-ORD-021)`. If the behavior is a past choice, keep or create the decision entry with `Why: Unknown`, `Decided by: Unknown`, and the source where you saw it (commit, file, document), so its origin is traceable.
4. Then ask once whether the behavior is still wanted. If yes: `Confirmed, why unknown` (the reason stays an open gap). If no or unsure: `Unknown`, or `Legacy / Dead` if the PM says it's obsolete.
5. Add it to `_open-questions.md` under its owner, and carry it into the "Not yet confirmed" section of the business summary.
6. When the owner later answers, update everything in step 2 to 5 and keep the history.

## How to use and maintain the knowledge base (put this at the top of README.md)
- Start with `business-summary.md` for the big picture, then open a domain folder for detail.
- Treat only `Confirmed` and approved content as reliable. `Inferred`, `Unknown`, and `Contradiction` items are open questions, not facts. `Confirmed, why unknown` means the behavior is wanted but the reason is a known gap.
- If the code disagrees with a confirmed rule, that is a bug or a code-vs-business gap; don't edit the rule to match the code. Raise it with the PM.
- When the business changes: update the docs first (new ID, or mark the old one `Superseded by ...`), then change the code. Record the decision and its reason in the domain's `decisions.md`, and refresh `business-summary.md` and the dependency diagram.

## Anti-patterns (don't do these)
- Working on the whole project at once, switching domains on your own, or leaving a domain without pausing it in `_progress.md`.
- Starting a message without saying where we are, or ending it without saying what you need.
- Treating what the code currently does as what the business intends.
- Marking something `Confirmed` because the code is clear and "obviously right".
- Asking the PM a technical question or pasting code at them.
- Asking more than 3 questions at once, or asking open-ended "tell me everything about X".
- Silently resolving a contradiction.
- Letting "I don't know" disappear: not logging it, not naming an owner, or filling in a reason yourself.
- Inventing the reason behind a decision, or presenting a guess about the past as history.
- Dropping behavior you didn't understand, or silently excluding dead code or workarounds; only the PM can mark something `Legacy / Dead`.
- Writing a current bug down as intended behavior.
- Suggesting refactors or fixes inside the business docs (open a separate ticket instead).
- Putting framework, class, or function names in the rule text.
- Ignoring the project's existing documents, trusting them without checking them against the code and the PM, or editing or deleting them.
- Treating silence or a vague "ok" as approval.
- Copying the same text into several files instead of linking by ID.
- Changing source code or tests during this process.
