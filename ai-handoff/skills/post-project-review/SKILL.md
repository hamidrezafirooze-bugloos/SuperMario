---
name: post-project-review
description: >
  Run a post-project review that improves the skills used during the project.
  Reads skill-improvement-log.md collected during the project's feedback loops,
  classifies each entry, proposes specific changes to the affected skills, and
  applies approved changes — then re-packages the updated skills automatically.
  Use this skill at the end of any project that used the idea-to-product pipeline
  (customer-discovery → biz-idea-analyzer → pm-mode → tech-architecture →
  dev-sprint-planner → qa-plan → launch-plan). Trigger on phrases like
  "post-project review", "improve the skills", "what did we learn", "apply the
  improvements", "update the skills from this project", "skill retrospective",
  or any signal that the project is complete and the pipeline should be improved
  for the next run.
---

# Post-Project Review

You are acting as a continuous improvement engineer. Your job is to close the loop on a completed project by reviewing all the skill-level feedback that was collected during the run, deciding what's worth improving, and applying those improvements directly to the skill files — making every future project run a little smoother.

This is the difference between a pipeline that stays static and one that learns.

---

## Step 0 — Locate the improvement log

Look for `skill-improvement-log.md` in the current working directory or the project output folder. 

If the file doesn't exist or is empty:
- Tell the user: "No skill improvements were logged during this project. Either no skill-level feedback was identified, or the feedback loop wasn't triggered. You can still run this review if you have manual observations to add."
- Ask: "Do you have any observations about how a skill could be improved? If yes, describe them and I'll classify and apply them."

If the file exists and has entries, proceed.

---

## Step 1 — Parse and group the log

Read `skill-improvement-log.md`. Extract every logged entry. Group entries by skill name.

For each skill that has entries, count:
- How many High confidence improvements
- How many Medium confidence improvements
- How many entries total

Present a summary table before doing anything else:

```
Skill                  | Entries | High | Medium
-----------------------|---------|------|-------
customer-discovery     |    2    |  1   |   1
pm-mode                |    1    |  1   |   0
tech-architecture      |    3    |  2   |   1
...
```

Ask: "I found [N] potential skill improvements across [X] skills. Want me to go through them one by one, or review all and decide at the end?"

---

## Step 2 — Review each improvement

For each entry (grouped by skill, High confidence first):

Show:
```
Skill: [skill-name]
Confidence: High / Medium
Feedback received: "[exact words]"
Type: [Missing section / Wrong format / Bad default assumption / Output too generic / Other]
Proposed change: [what was logged]
```

Then show the **before/after diff** — find the relevant section in the current SKILL.md and show:

**Before (current skill instruction):**
```
[relevant excerpt from current SKILL.md — the section that would be changed]
```

**Proposed after:**
```
[the same section with the improvement applied]
```

If the proposed change is adding a new section (not modifying an existing one), show:
**New section to add:**
```
[the new section content]
```

Ask: "Apply this improvement? (yes / no / modify)"
- "yes" → mark for application
- "no" → skip, log as rejected
- "modify" → ask what to change about the proposal, update it, confirm again

---

## Step 3 — Apply approved improvements

After all entries have been reviewed:

Show a summary:
```
Approved: [N] improvements across [X] skills
Skipped: [N]
```

Ask: "Ready to apply all [N] approved improvements and re-package the affected skills?"

On confirmation:

For each affected skill:
1. Read the current SKILL.md
2. Apply the approved changes precisely — edit the specific sections, add new sections in the right place, do not touch unrelated content
3. Write the updated SKILL.md back
4. Re-package using the standard packaging approach:
   ```python
   from scripts.package_skill import package_skill
   package_skill('/path/to/skill', '/path/to/outputs')
   ```
   The skill-creator scripts are at: `/sessions/nifty-sweet-feynman/mnt/.claude/skills/skill-creator/scripts/package_skill.py`
   Skills are at: `/sessions/nifty-sweet-feynman/mnt/outputs/[skill-name]/SKILL.md`
   Output .skill files go to: `/sessions/nifty-sweet-feynman/mnt/outputs/`

5. Confirm: "✅ [skill-name] updated and re-packaged."

---

## Step 4 — Project retrospective summary

After applying improvements, produce a brief retrospective:

**Project retrospective: [project name/idea]**

**What worked well** (based on the stages that had no feedback or minimal revision):
- [Stage name]: [what went smoothly]

**What needed iteration** (stages that had multiple feedback loops):
- [Stage name]: [what required revision and why]

**Skills improved this run:**
- [skill-name]: [one-line description of what was improved]

**Skills unchanged:**
- [skill-name]: [why — either no issues found, or feedback was idea-specific]

**Recommended focus for next project:**
[One paragraph on which skills or stages to pay closest attention to next time, based on where the most friction was in this run.]

---

## Step 5 — Archive the log

After improvements are applied, rename `skill-improvement-log.md` to `skill-improvement-log-[project-name]-[date].md` so it's preserved as a record but won't be accidentally picked up by the next project run.

Confirm: "Log archived as `skill-improvement-log-[name]-[date].md`. The pipeline is ready for the next project."

---

## Output format

The before/after diffs should use code blocks so changes are visually clear. The retrospective summary should be concise prose — not a long report. The goal is to apply the improvements quickly and get back to building.

The test of a good post-project review: the skills that ran poorly this time run noticeably better next time, without the user having to give the same feedback twice.
