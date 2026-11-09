# AI Environment Handoff

Snapshot of the Claude Code (cloud) environment used by **Hamidreza Firooze** (Bugloos), taken 2026-11-09.
Purpose: let any other AI agent (or a new Claude setup) reproduce the same tools, skills, connectors and working rules with minimum setup.

> No secrets are in this file. Every credential below must be re-created by the owner (OAuth sign-in or new API key).

---

## 1. Quick start (TL;DR)

1. Clone this repo; the reusable skills are in `ai-handoff/skills/` (one folder per skill, entry file `SKILL.md`).
2. Install a runtime matching section 3 (Ubuntu 24.04 + Node 22, Python 3.13, etc.).
3. Install the plugins in section 5 and copy `ai-handoff/skills/*` into your agent's skill folder (section 6).
4. Connect the MCP servers you actually use (section 7) and sign in to each via OAuth.
5. Set env vars `GEMINI_KEY` and `ELEVEBNLABS_KEY` (section 8) if you need Gemini / ElevenLabs.
6. Apply the working rules in section 9 as your system prompt / `CLAUDE.md` / `AGENTS.md`.

---

## 2. Identity & accounts

| Item | Value |
|---|---|
| Owner | Hamidreza Firooze — hamidreza.firooze@bugloos.com |
| GitHub user | `hamidrezafirooze-bugloos` (also push access to org `Hakemam`) |
| AI platform | Claude Code on the web (claude.ai/code), cloud sessions |
| Default model | Claude Opus 5.5 (`claude-opus-5-5`) |
| Other models available | Fable 5.1 `claude-fable-5-1`, Sonnet 5.5 `claude-sonnet-5-5`, Haiku 5.5 `claude-haiku-5-5` |

### Repositories (all pushable)

| Repo | Visibility |
|---|---|
| hamidrezafirooze-bugloos/ForooheWebsite | public |
| hamidrezafirooze-bugloos/DeliShop | public |
| Hakemam/hakemam | private |
| hamidrezafirooze-bugloos/Chido | private |
| hamidrezafirooze-bugloos/HakemamWebsite | public |
| hamidrezafirooze-bugloos/SuperMario | public |

---

## 3. Runtime environment

Container: **Ubuntu 24.04.5 LTS**, x86_64, 4 vCPU, 15 GB RAM, shell `bash`, user `root`, working dir `/home/user`.

| Tool | Version |
|---|---|
| Node.js / npm | 22.23.4 / 10.9.9 (via nvm at `/opt/nvm`) |
| pnpm / yarn / bun | 10.28.0 / 1.22.22 / 1.4.4 |
| Python / pip | 3.13.18 / 24.0 |
| Ruby | 3.3.6 (via rbenv at `/opt/rbenv`) |
| Go | 1.24.7 |
| Java | OpenJDK 21.0.12 |
| Rust | 1.97.0 |
| PHP | 8.3.6 |
| Docker | 29.9.2 |
| gh (GitHub CLI) | 2.89.0 |
| gcloud / gsutil / bq | Google Cloud SDK 570.0.0 |
| Chromium + Playwright | pre-installed; `require('playwright')` works, browser at `/opt/pw-browsers/chromium` |

### Reproduce with Docker (minimal)

```dockerfile
FROM ubuntu:24.04
RUN apt-get update && apt-get install -y curl git build-essential python3 python3-pip php-cli ruby golang openjdk-21-jdk docker.io unzip \
 && curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && apt-get install -y nodejs \
 && npm i -g pnpm yarn @anthropic-ai/claude-code \
 && curl -fsSL https://bun.sh/install | bash \
 && curl https://sh.rustup.rs -sSf | sh -s -- -y \
 && npx -y playwright install --with-deps chromium
# gh: https://cli.github.com  |  gcloud: https://cloud.google.com/sdk/docs/install
WORKDIR /home/user
```

### Network

Outbound HTTPS goes through a policy proxy (`HTTPS_PROXY`) with its own CA bundle. On a new machine you don't need it; if your new host has a proxy, point `SSL_CERT_FILE`, `NODE_EXTRA_CA_CERTS`, `REQUESTS_CA_BUNDLE`, `PIP_CERT`, `GIT_SSL_CAINFO` at its CA file. Never disable TLS verification.

---

## 4. Agent harness settings

User-level settings (`~/.claude/settings.json` equivalent):

```json
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "permissions": { "allow": ["Skill"] },
  "hooks": {
    "SessionStart": [{ "matcher": "", "hooks": [{ "type": "command", "command": "~/.claude/session-start-setup-script-failure.sh" }] }],
    "Stop":         [{ "matcher": "", "hooks": [{ "type": "command", "command": "~/.claude/stop-hook-git-check.sh" }] }]
  },
  "statusLine": { "type": "command", "command": "bash \"~/.claude/ponytail-statusline.sh\"" }
}
```

- The two hook scripts are platform-provided (setup-failure notice; a Stop hook that warns about uncommitted/unpushed git work). On another platform, replace the Stop hook with "remind me to commit & push before ending".
- Mode: **auto mode** (agent acts without asking for routine work; asks before destructive / outward-facing actions).
- `statusLine` is optional (shows `[PONYTAIL]` badge).

---

## 5. Plugins

Install in Claude Code with `/plugin` (marketplace `knowledge-work-plugins` = Anthropic catalog: https://github.com/anthropics/knowledge-work-plugins).

| Plugin | Version | Source | What it gives |
|---|---|---|---|
| **ponytail** | 5.3.3 | https://github.com/DietrichGebert/ponytail | "Lazy senior dev" mode — always ON (level `full`). Skills: ponytail, -audit, -review, -debt, -gain, -help |
| design | 1.2.0 | knowledge-work-plugins | accessibility-review, design-critique, design-handoff, design-system, research-synthesis, user-research, ux-copy |
| product-management | 1.2.0 | knowledge-work-plugins | brainstorm, competitive-brief, metrics-review, product-brainstorming, roadmap-update, sprint-planning, stakeholder-update, synthesize-research, write-spec |
| marketing | 1.2.0 | knowledge-work-plugins | brand-review, campaign-plan, competitive-brief, content-creation, draft-content, email-sequence, performance-report, seo-audit |
| figma | 2.2.157 | knowledge-work-plugins (by Figma) | Figma MCP + skills (figma-use, design-to-code, generate-design, generate-library, code-connect, diagrams, FigJam, Slides, motion, shaders, SwiftUI) |
| miro | 2.0.0 | https://github.com/miroapp/miro-ai | code-explain-on-board, code-review, code-spec |
| pdf-viewer | 0.2.0 | knowledge-work-plugins | open / annotate / fill-form / sign PDFs (`npx -y @modelcontextprotocol/server-pdf --stdio`) |
| cowork-plugin-management | 0.2.2 | knowledge-work-plugins | create / customize plugins |
| arena-skill | 1.0.0 | https://github.com/Jakeschincariol/arena-skill | `/arena` — N sub-agents compete on one task, bracket + judge |

Ponytail rules (if the new agent can't install the plugin, paste this into its system prompt):

> Be a lazy senior developer: smallest complete change. Before writing, read the code and list every place the change must reach. Prefer: not building it → existing code in repo → stdlib/platform → installed dependency → one line → minimum code. No unrequested abstractions/options. Fix bugs at the root once. Non-trivial new logic gets one small test. Known limits get a `shortcut: <limit>, <when to upgrade>` comment. Never cut validation, data-loss error handling, security, accessibility, or anything the user asked for. End replies with 1–2 lines: what was skipped/unchecked and any risk.

---

## 6. Custom skills (copied into `ai-handoff/skills/`)

These are the owner's own skills — the main portable "data". Each folder has a `SKILL.md` (YAML front-matter `name` + `description`, then instructions) plus any reference files.

**Install:** Claude Code → copy each folder to `~/.claude/skills/<name>/` (user) or `<repo>/.claude/skills/<name>/` (project). Other agents → load `SKILL.md` as a prompt/tool description when its trigger matches.

### Idea-to-product pipeline (run in this order)

`customer-discovery` → `biz-idea-analyzer` → `pm-mode` → `ux-design` / `tech-architecture` → `dev-sprint-planner` → `qa-plan` → `launch-plan` → `post-project-review`

| Skill | Purpose |
|---|---|
| customer-discovery | Interview guide, target respondents, synthesis for a new idea |
| biz-idea-analyzer | Market size, business model, competitors, GTM, risks |
| project-discovery | Full discovery doc from an idea/brief |
| pm-mode | Act as PM: PRD, epics, features, roadmap |
| pm-business-logic-discovery | Build a PM-confirmed business knowledge base for an existing project, one domain at a time |
| ux-design | UX flows/screens from PM artifacts |
| tech-architecture | Technical architecture from PM artifacts |
| dev-sprint-planner | Sprint-ready tickets with points, AC, dependencies |
| qa-plan | Test strategy, cases, launch-readiness checklist |
| launch-plan | Rollout, feature flags, monitoring, runbook, rollback |
| post-project-review | Reads `skill-improvement-log.md`, proposes and applies improvements to the skills above |

### Other custom skills

| Skill | Purpose |
|---|---|
| benchmark-analysis | Competitor feature benchmark report |
| marketing-research | Positioning, copy research, audience profiling |
| gtm-campaign | Go-to-market & campaign plan |
| ui-ux-pro-max | UI/UX intelligence with local style/palette/font database (has scripts + data) |
| scientific-problem-selection | Research problem selection / ideation |
| elderly-memoir-writer | Interview transcript → biography/memoir |

### Anthropic built-in skills also enabled (not copied — public)

`docx`, `xlsx`, `pptx`, `pdf`, `skill-creator` (https://github.com/anthropics/skills), plus claude.ai examples `docs`, `google-workspace`, `import-memory`, `morning`.
Built-in Claude Code skills used: `code-review`, `simplify`, `security-review`, `init`, `loop`, `run`, `update-config`, `fewer-permission-prompts`, `claude-api`, `dataviz`, `artifact-design`.

---

## 7. Connectors / MCP servers

Re-create in Claude Code with `claude mcp add --transport http <name> <url>` (or via plugin), then sign in (OAuth) as the owner.

| Service | URL | Status at snapshot |
|---|---|---|
| Gmail | claude.ai connector | ✅ connected |
| Google Calendar | claude.ai connector | ✅ connected |
| Google Drive | claude.ai connector | ✅ connected |
| Figma | https://mcp.figma.com/mcp | ✅ connected |
| Claude Docs | claude.ai connector | ✅ connected |
| PDF | `npx -y @modelcontextprotocol/server-pdf --stdio` | ✅ |
| Miro | https://mcp.miro.com/ | needs auth |
| Notion | https://mcp.notion.com/mcp | needs auth |
| Slack | https://mcp.slack.com/mcp | needs auth |
| Linear | https://mcp.linear.app/mcp | needs auth |
| Atlassian (Jira/Confluence) | https://mcp.atlassian.com/v1/mcp | needs auth |
| Intercom | https://mcp.intercom.com/mcp | needs auth |
| Asana | https://mcp.asana.com/v2/mcp | failed (no dynamic client registration) |
| HubSpot | https://mcp.hubspot.com/anthropic | failed (no dynamic client registration) |
| Canva | https://mcp.canva.com/mcp | needs auth |
| Amplitude / EU | https://mcp.amplitude.com/mcp · https://mcp.eu.amplitude.com/mcp | needs auth |
| Ahrefs | https://api.ahrefs.com/mcp/mcp | needs auth |
| Similarweb | https://mcp.similarweb.com | needs auth |
| Klaviyo | https://mcp.klaviyo.com/mcp | needs auth |
| Supermetrics | https://mcp.supermetrics.com/mcp | needs auth |
| Monday | https://mcp.monday.com/mcp | needs auth |
| ClickUp | https://mcp.clickup.com/mcp | needs auth |
| Pendo | https://app.pendo.io/mcp/v0/shttp | needs auth |
| Fireflies | (from product-management plugin) | needs auth |

Only connect what you use; actively used set = Gmail, Calendar, Drive, Figma, Docs, PDF.

---

## 8. Environment variables / secrets

| Name | Used for | How to get |
|---|---|---|
| `GEMINI_KEY` | Google Gemini API | https://aistudio.google.com/apikey |
| `ELEVEBNLABS_KEY` (sic, keep the typo so scripts match) | ElevenLabs TTS API | https://elevenlabs.io → Profile → API keys |
| GitHub auth | push to repos above | `gh auth login` or a fine-grained PAT |

Rule: only send each key as an auth header to its own official API over HTTPS; never print, log or commit it.

---

## 9. Working rules for the agent (paste as system prompt / CLAUDE.md / AGENTS.md)

```
- Act when you have enough info; ask only for decisions that are truly the user's.
- Confirm before destructive or outward-facing actions (deleting, force-push, sending email, publishing).
- Git: work on a feature branch, never commit to the default branch directly; push with `git push -u origin <branch>`;
  retry network failures up to 4x with backoff 2s/4s/8s/16s. Don't open PRs unless asked.
- Commit/push before ending a session — cloud containers are ephemeral.
- Reference code as path:line. Report test failures honestly with output.
- Use they/them for anyone whose pronouns are unknown.
- Ponytail mode always on (see section 5).
- Reports/plans meant for others: publish as a shareable page/doc (Claude Artifacts or Google Docs), not just terminal text.
- No secrets in files, commits, or messages.
```

---

## 10. Migrating to a non-Claude agent

| Claude concept | Equivalent |
|---|---|
| `SKILL.md` skills | Custom instructions / "rules" files / Cursor `.cursor/rules`, Codex `AGENTS.md`, Gemini CLI `GEMINI.md` + extensions |
| MCP servers | Most agents (Cursor, Codex CLI, Gemini CLI, Windsurf, Continue) support MCP — reuse the URLs in section 7 |
| Hooks | Git hooks or the agent's own hook system |
| Artifacts / Claude Docs | Google Docs, Notion, or a static HTML page |
| Sub-agents / `/arena` | Agent's parallel-task feature, or run sequentially |

---

## 11. Verify the new setup

```bash
node -v && python3 --version && gh auth status
```

Then ask the agent: "list your skills", "list MCP tools", and run one skill (e.g. `qa-plan` on a sample feature) to confirm it loads.
