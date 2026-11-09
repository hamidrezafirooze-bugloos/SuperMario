---
name: elderly-memoir-writer
description: >
  Use this skill whenever the user wants to convert an interview transcript with an elderly person
  into a biographical book or memoir chapter in Persian. Trigger on phrases like: "ترانسکریپت مصاحبه را به بیوگرافی تبدیل کن",
  "از این مصاحبه کتاب بساز", "خاطرات این سالمند را بنویس", "بیوگرافی بنویس", "زندگینامه بساز",
  "متن مصاحبه را ادبی کن", or any situation where a raw interview, voice transcript, or collection
  of personal stories from an elderly person needs to become a polished Persian memoir or biography
  as a Word document. Also trigger when the user provides notes from a conversation with an elder
  and wants it shaped into a readable narrative.
---

# Elderly Memoir Writer

This skill takes a raw interview transcript with an elderly person and transforms it into a
beautifully written Persian biography, delivered as a formatted Word (.docx) file.

## Your role

You are both a literary editor and a ghostwriter. Your job is to honor the elder's authentic voice
while elevating the raw, conversational transcript into prose that reads like a published memoir —
warm, dignified, and emotionally resonant.

Think of yourself as the bridge between a person's spoken memory and the written page. The words
belong to them; the craft belongs to you.

---

## Step 1: Analyze the transcript

Before writing anything, read the full transcript carefully and extract:

- **Key life periods** — childhood, youth, marriage/family, work, old age, etc.
- **Pivotal events** — moments that clearly shaped the person's life
- **Important people** — family members, mentors, friends, and their relationships
- **Place and time** — locations, historical periods, seasons mentioned
- **Emotional themes** — what does this person carry? Loss, resilience, joy, longing?
- **Distinctive phrases** — any expressions, sayings, or metaphors the person uses naturally that should be preserved

If the transcript is incomplete or certain periods are missing, note those gaps — you can acknowledge them gracefully in the text rather than fabricating content.

---

## Step 2: Design the chapter structure

Organize the material into **4 to 7 chapters**, each covering a distinct life period or theme.
Give each chapter a literary Persian title — not "فصل اول: کودکی" but something evocative like:
**"خاک آشنا"** (familiar soil) for a childhood chapter, or **"دست‌های پینه‌بسته"** (calloused hands) for a chapter about hard work.

Typical structure (adapt as needed):
1. پیشگفتار — a brief framing paragraph introducing who this person is and why their story matters
2. Chapters in roughly chronological order
3. اپیلوگ یا پایان‌بندی — a closing reflection, written with warmth

---

## Step 3: Write the Persian biography

### Style guidelines

Write in **third-person narrative** unless the transcript is strongly first-person, in which case
first-person can work better. The key principle: the prose should feel like it was *written for* this
person, not extracted from them.

**Tone**: Warm, unhurried, literary — like a long letter to grandchildren. Never clinical or journalistic.

**Language level**: Elevated Persian prose, but not archaic. Use فارسی معیار with natural rhythm.
Avoid overly colloquial language unless preserving a specific quote from the elder.

**Sentences**: Vary length. Long, flowing sentences for reflective moments. Short ones for impact.

**Sensory detail**: When the transcript mentions a place, smell, sound, or season — expand it slightly.
A brief mention of "خانه‌ی قدیمی" can become "خانه‌ای که بوی نان تازه و دود اجاق از دیوارهایش
بیرون می‌زد" — if such detail is plausible from context.

**Quotes**: Preserve 1-3 short, authentic quotes from the elder per chapter (introduced naturally),
clearly drawn from the transcript. These anchors of real voice give the memoir authenticity.

**What NOT to do**:
- Do not invent facts, names, or events not present in the transcript
- Do not over-dramatize or sensationalize
- Do not translate colloquial speech word-for-word into stiff formal prose — find the literary middle ground

---

## Step 4: Create the Word document

Use the `docx` npm library (already installed — `require('docx')` directly, do not run npm install).

Write a Node.js script to generate the `.docx` file with this structure:

### Document formatting
- **Page size**: A4
- **Fonts**: For Persian text, use "B Nazanin" or "Tahoma" — set as the default font
- **Text direction**: RTL (right-to-left) — set `bidi: true` on paragraphs and the document
- **Body text**: 14pt, line spacing 1.5x, paragraph spacing 6pt after
- **Chapter titles**: 18pt bold, centered, with 24pt space before and 12pt after
- **Book title / cover**: 24pt bold, centered
- **Margins**: 3cm top/bottom, 2.5cm left/right (convert to DXA: 1cm ≈ 567 DXA)

### Document structure
1. **Cover page**: Book title (زندگینامه + person's name), subtitle if any, page break
2. **فهرست مطالب** (Table of Contents) — manual list of chapter titles with page numbers is fine if TOC field is complex
3. **پیشگفتار** section
4. **Chapters** — each starting with its title, then body paragraphs
5. **اپیلوگ** section

### RTL / Persian docx gotchas
- Set `bidi: true` in `SectionProperties` for the whole document
- Each `Paragraph` that is Persian text must have `bidirectional: true` in its `ParagraphFormat`
- Each `TextRun` must set `rightToLeftText: true`
- Do not use `\n` — use separate `Paragraph` elements
- Use `PageBreak` inside a `Paragraph` to start chapters on new pages

### Sample script skeleton

```javascript
const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, PageBreak } = require('docx');
const fs = require('fs');

const doc = new Document({
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 }, // A4 in DXA
        margin: { top: 1701, bottom: 1701, left: 1418, right: 1418 }
      }
    },
    children: [
      // your paragraphs here
    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync('biography.docx', buffer);
  console.log('Done');
});
```

After creating the file, verify it renders correctly:
```bash
python scripts/office/soffice.py --headless --convert-to pdf biography.docx
pdftoppm -jpeg -r 100 biography.pdf page
# Then Read the resulting page-*.jpg images to verify layout and RTL text
```

---

## Step 5: Save and deliver

Save the `.docx` file to the user's workspace folder. Then present it using `mcp__cowork__present_files`.

Also briefly tell the user:
- How many chapters the book has
- Approximate page count
- Any gaps or missing information you noticed in the transcript that they may want to fill in later

---

## Edge cases

**Very short transcript (under 500 words)**: Still structure into chapters, but they will be brief.
Note to the user that richer source material will produce a fuller book.

**Multiple interview sessions**: If the user provides transcripts from several sessions, treat them
as one combined source. Merge and deduplicate before structuring.

**Mixed Persian/non-Persian transcript**: Translate non-Persian portions naturally into Persian prose.

**Names and places**: Preserve original Persian names exactly. For non-Persian names (e.g., foreign
cities, foreign people), transliterate using standard Persian convention.

**Sensitive content**: If the transcript contains content the elder seems hesitant about (expressed
with phrases like "نمی‌دانم باید بگویم یا نه..."), handle with care — include it gently or flag it
to the user rather than omitting silently.
