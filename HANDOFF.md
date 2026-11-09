# HANDOFF — Beard Quest (SuperMario repo)

Everything another AI agent (or human) needs to pick up this project and work on it the same way it was worked on in Claude Code on the web. Read this file first, then `index.html`.

---

## 1. What this project is

**Beard Quest** is a single-file HTML5 canvas platformer (Mario-style genre, original content) with a **Persian (Farsi) UI**, an online **highscore leaderboard on Supabase**, and **auto-deploy to a private server** via GitHub Actions.

- Repo: `https://github.com/hamidrezafirooze-bugloos/SuperMario`
- Owner: `hamidrezafirooze-bugloos`
- No build step, no package manager, no framework, no tests. One HTML file is the whole app.

## 2. Repository layout

```
index.html                         # the entire game: HTML + CSS + JS (~1250 lines)
supabase/migrations/0001_highscores.sql   # highscores table + RLS policies (idempotent)
.github/workflows/deploy.yml       # push → inject Supabase config → rsync to server over SSH
.github/workflows/db-migrate.yml   # manual: run the SQL migration against Supabase Postgres
HANDOFF.md                         # this file
```

## 3. Running locally

No install needed. Any static server works:

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000`. Locally the Supabase placeholders (`__SUPABASE_URL__`, `__SUPABASE_ANON_KEY__`) are **not** replaced, so the game runs fine but the leaderboard is silently disabled (by design — see commit `7f4d5e9`). To test the leaderboard locally, temporarily replace the two placeholders in `index.html` with real values — **never commit them**.

External resources loaded at runtime (need internet):
- Google Fonts: `Press Start 2P`, `Vazirmatn`
- `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2`

## 4. Game architecture (`index.html`)

All JS is in one IIFE-style `<script>` block at the bottom. Key sections, in file order (line numbers approximate):

| Section | ~Line | Notes |
|---|---|---|
| CSS tokens on `:root` | 4 | `--sky`, `--pipe`, `--gold`, etc. Retro arcade-cabinet look |
| HUD (score, coins, lives, mute) | 267 | ids `hud-score`, `hud-coins`, `hud-lives`, `muteBtn` |
| Canvas | 275 | `<canvas id="game" width="900" height="380">` |
| Overlays | 277–302 | `startOverlay`, `loseOverlay`, `winOverlay` (each loss/win overlay has name input + submit + leaderboard) |
| Touch controls | 314 | `btnLeft`, `btnRight`, `btnJump` |
| Audio (`ensureAudio`, `beep`, `sfx`) | 336 | WebAudio oscillators, no audio files |
| Input | 366 | ←/→ or A/D move, Space/↑/W jump (hold = higher, jump buffering), ↓ enters pipes |
| Level data | 406 | `groundSegments` (has a pit gap), `pipes`, `blocks` (question/brick), `stairs` pyramid, `coins`, `enemies` (patrol min/max), `flag`. `LEVEL_W = 3940`, `GROUND_Y = 300`, `TILE = 32` |
| Underground bonus room | 471 | Enter via **2nd pipe** (`pipes[1]`) by pressing ↓, exit pipe returns you on the **3rd pipe** (`pipes[2]`). `UNDER_LEVEL_W = 1400` |
| Highscores (Supabase) | 504 | `submitHighscore(name, score)`, `renderLeaderboard(el)`; client only created if config looks valid; names escaped via `escapeHtml`, trimmed to 20 chars, default `ناشناس` |
| Physics constants | 543 | `GRAVITY 0.62, MAX_FALL 15, MOVE_ACCEL 0.55, MAX_SPEED 4.4, FRICTION 0.72, JUMP_V -12.4, JUMP_CUT 0.5` |
| State | 547 | `score, coinCount, lives=3`; `state`: `ready | playing | dead | win | sliding | transition`; `world`: `main | under` |
| Update / collision | 570–810 | AABB collisions, stomp = +200, coin = +100, block bump = +100, flag slide → `finishWin()` |
| Render | ~900–1220 | All drawing is procedural canvas (no sprites/images) |

Conventions to keep:
- Stay single-file, vanilla JS, no dependencies.
- UI text is Persian; keep new UI strings in Persian (RTL).
- Original art/names only (do not copy Nintendo assets/characters/names).

## 5. Backend — Supabase

Table `public.highscores` (`supabase/migrations/0001_highscores.sql`):

```
id bigint identity PK, player_name text (1–20 chars), score int >= 0, created_at timestamptz default now()
```

RLS enabled. Policies: `anon` can **select** all and **insert** any row. (No update/delete. Note: anyone with the anon key can insert arbitrary scores — accepted tradeoff.)

To set up a fresh Supabase project:
1. Create a project at supabase.com.
2. Run the migration: either paste the SQL in the Supabase SQL editor, or set the `SUPABASE_DB_URL` secret and run the **"Run Supabase migration"** workflow (Actions tab → Run workflow).
3. Put the project URL + anon key in GitHub secrets (below).

## 6. CI/CD — GitHub Actions

### `deploy.yml` — "Deploy to server"
Triggers: push to `main` or `claude/great-euler-ecb0bw`, or manual (`workflow_dispatch`).
Steps: checkout → `sed` replaces `__SUPABASE_URL__` / `__SUPABASE_ANON_KEY__` in `index.html` → install `sshpass` → `ssh-keyscan` → `rsync -avz --delete` (excludes `.git`, `.github`) to the server over password SSH.

> ⚠️ `rsync --delete` mirrors the repo onto `DEPLOY_PATH` — anything else in that folder on the server gets deleted. `HANDOFF.md` and `supabase/` are also uploaded (harmless, but publicly readable if the web root serves them).

### `db-migrate.yml` — "Run Supabase migration"
Manual only. Installs `postgresql-client`, runs `psql "$SUPABASE_DB_URL" -f supabase/migrations/0001_highscores.sql`.

### Required GitHub repository secrets (Settings → Secrets and variables → Actions)

| Secret | Used by | Value |
|---|---|---|
| `DEPLOY_HOST` | deploy | server hostname/IP |
| `DEPLOY_PORT` | deploy | SSH port |
| `DEPLOY_USER` | deploy | SSH user |
| `DEPLOY_PASSWORD` | deploy | SSH password |
| `DEPLOY_PATH` | deploy | absolute web-root path on server |
| `SUPABASE_URL` | deploy | `https://<ref>.supabase.co` |
| `SUPABASE_ANON_KEY` | deploy | Supabase anon/public key (injected into the page) |
| `SUPABASE_KEY` | deploy (exported, currently unused) | — |
| `SUPABASE_DB_URL` | db-migrate | Postgres connection string |

Secret **values are not in this repo** and were never visible to the AI; get them from the owner.

## 7. Branches & git workflow used so far

- Remote branches: `main` (if present), `claude/great-euler-ecb0bw` (**deploy branch** — pushing here deploys live), plus several `claude/<random-name>` feature branches created per AI session.
- Each AI session was assigned one `claude/...` branch, committed there, pushed with `git push -u origin <branch>`, and opened a PR only when asked. PR #1 (`claude/sharp-edison-7bn1fm`) added highscores and was merged.
- The owner also edits directly in GitHub's web editor; those pushes auto-deploy too.
- Commit style: short imperative subject (`Add underground bonus room reached via the 2nd pipe`), body explaining why when non-trivial.

History (oldest → newest): add game → SSH/rsync deploy workflow → switch to sshpass password auth → rename to `index.html` → expose Supabase secrets → Supabase highscores → migration workflow → fix start button when Supabase config empty → underground bonus room.

## 8. How the AI environment was set up (to replicate it elsewhere)

The original work was done in **Claude Code on the web** (cloud container). What it had and how to get the equivalent:

| Capability in Claude Code | Equivalent for another agent |
|---|---|
| Fresh clone of this repo in a Linux container, bash, git | Any agent with a shell + `git clone https://github.com/hamidrezafirooze-bugloos/SuperMario` |
| GitHub access via the Claude GitHub App / GitHub MCP (PRs, Actions, issues) | A GitHub token (fine-grained PAT, repo scope: contents, pull requests, actions read/write) with `gh` CLI or the GitHub MCP server (`github/github-mcp-server`) |
| Push to assigned branch only | Instruct the agent: "work on branch X, never push to the deploy branch without permission" |
| Headless Chromium + Playwright (for screenshots/testing the canvas) | `npm i -D playwright && npx playwright install chromium` (optional) |
| Network to Google Fonts, jsDelivr, Supabase | Normal internet |
| No secrets in the container | Same — keep secrets in GitHub Actions only |

Connected but **not used** by this project: Gmail, Google Calendar, Google Drive, Figma, and various design/marketing/PM plugins. You don't need any of them.

Behaviour setting that was active: a "**ponytail**" plugin (minimal-change mode): smallest complete diff, no new dependencies, no speculative abstractions, reuse existing patterns, add a tiny check for non-trivial logic. If you want the same style from another AI, paste this as its system/project instructions:

```
- Make the smallest complete change; don't add features, options or deps nobody asked for.
- Keep index.html single-file vanilla JS; keep UI strings in Persian.
- Never commit secrets; Supabase config is injected at deploy time via __PLACEHOLDERS__.
- Work only on the branch you're given; pushing to claude/great-euler-ecb0bw or main deploys live.
- Commit with short imperative messages; open a PR only when asked.
```

### Minimum setup checklist for a new agent/tool
1. Clone the repo; read `HANDOFF.md` and `index.html`.
2. Give it GitHub write access to the repo (token or app).
3. Tell it which branch to work on.
4. Run locally with `python3 -m http.server` to test.
5. (Only if moving infra) recreate the secrets in §6 and run the migration in §5.

## 9. Known issues / ideas not done

- Leaderboard accepts any score from the client (no server validation / rate limit).
- `SUPABASE_KEY` secret is exported in deploy but unused.
- Deploy uses password SSH (`sshpass`); SSH key auth would be safer.
- `ssh-keyscan` trusts whatever key the host returns on first contact each run.
- No automated tests; verify changes by playing in the browser (or a Playwright screenshot).
