# 🎨 MediKiosk — Design System

> **Version:** 1.0
> **Date:** 2026-09-04
> **Design Philosophy:** Crafted, not generated. Every pixel is intentional.
> **Target Feel:** "A calm, trusted hospital assistant" — not a tech startup, not a government form.

---

## 1. Design Identity

### 1.1 The Problem with AI-Generated UI

| AI-Generated Tell | How We Avoid It |
| :--- | :--- |
| Stock emojis (🤕🫁🦴) as icons | Custom SVG icon system — consistent style, unique to MediKiosk |
| Default shadcn/Tailwind look | Customized component library with our own border radius, shadows, spacing |
| Generic blue (#3B82F6) everywhere | Crafted government-grade palette with warm accents |
| No personality — could be any app | Distinct visual identity: rounded, warm, medical-trustworthy |
| Flat, lifeless cards | Subtle depth via soft shadows, gentle borders, and deliberate whitespace |
| No motion design | Purposeful micro-interactions (not decorative — functional feedback) |
| Same font size hierarchy everywhere | Carefully crafted type scale with optical adjustments |
| Cookie-cutter layouts | Custom grid with golden-ratio-inspired spacing |

### 1.2 Brand Personality

MediKiosk is NOT a flashy tech app. It is NOT a cold government portal. It is:

> **A calm, patient, trustworthy hospital assistant that speaks your language.**

| Trait | Visual Expression |
| :--- | :--- |
| **Trustworthy** | Government blue palette, clean lines, professional typography, Ministry of Ayush emblem |
| **Warm** | Rounded corners (16px), soft shadows, warm neutral backgrounds (#FAFAF8 not pure white) |
| **Simple** | Generous whitespace, single-column layouts, no visual clutter |
| **Inclusive** | Gender-neutral illustrations, Indian skin tones, culturally appropriate visuals |
| **Calm** | No aggressive reds for non-emergency states, no pulsing animations, no urgency-inducing timers |

---

## 2. Color System

### 2.1 Primary Palette

NOT generic Tailwind colors. Carefully selected for:
- Government authority (blue)
- Medical trust (teal accent)
- Hospital readability under fluorescent lighting
- WCAG AAA contrast on warm white backgrounds

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  PRIMARY BLUE          TEAL ACCENT          WARM WHITE           │
│  ┌──────────┐          ┌──────────┐         ┌──────────┐        │
│  │          │          │          │         │          │        │
│  │ #1A5276  │          │ #148F77  │         │ #FAFAF8  │        │
│  │          │          │          │         │          │        │
│  └──────────┘          └──────────┘         └──────────┘        │
│  Trust, authority       Health, Ayush,       Background,         │
│  Headers, primary       nature, healing      surfaces             │
│  buttons                                                         │
│                                                                  │
│  SAFE GREEN            ATTENTION AMBER      ALERT CORAL          │
│  ┌──────────┐          ┌──────────┐         ┌──────────┐        │
│  │          │          │          │         │          │        │
│  │ #27AE60  │          │ #E67E22  │         │ #E74C3C  │        │
│  │          │          │          │         │          │        │
│  └──────────┘          └──────────┘         └──────────┘        │
│  Success, done,         Warning, flagged     Emergency only       │
│  confirmed              values, review       (red-flag triage)    │
│                                                                  │
│  TEXT DARK             TEXT MUTED            BORDER               │
│  ┌──────────┐          ┌──────────┐         ┌──────────┐        │
│  │          │          │          │         │          │        │
│  │ #1C2833  │          │ #7F8C8D  │         │ #E5E7EB  │        │
│  │          │          │          │         │          │        │
│  └──────────┘          └──────────┘         └──────────┘        │
│  Headings, labels       Secondary text,      Card borders,        │
│                         captions             dividers             │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### 2.2 Semantic Color Usage

| Context | Color | Hex | Usage |
| :--- | :--- | :--- | :--- |
| Primary action button | Blue | `#1A5276` | "Next", "Submit", main CTA |
| Primary button hover | Dark Blue | `#154360` | Hover/pressed state |
| Secondary action | Teal | `#148F77` | "Scan", "Add More", secondary actions |
| Success / Confirmed | Green | `#27AE60` | Completed steps, confirmed answers, "Done" |
| Warning / Attention | Amber | `#E67E22` | Flagged lab values, "review needed" |
| Emergency / Alert | Coral Red | `#E74C3C` | Red-flag triage ONLY. Never used casually. |
| Background | Warm White | `#FAFAF8` | Page background — warmer than pure #FFF |
| Card Background | Pure White | `#FFFFFF` | Cards sit on warm white bg, creating subtle depth |
| Disabled | Light Gray | `#D5DBDB` | Disabled buttons, inactive states |
| Progress bar track | Light Gray | `#EAEDED` | Unfilled progress |
| Progress bar fill | Teal gradient | `#148F77 → #1ABC9C` | Filled progress — feels alive, not static |

### 2.3 Color Rules

1. **Red is ONLY for emergencies.** Never for validation errors (use amber), never for "delete" buttons (use gray with confirmation), never for required field markers (use text).
2. **No gradients on surfaces.** Only allowed on progress bar fill and the primary CTA button (very subtle, 5% lighter at top).
3. **No pure black (#000000).** All dark text is `#1C2833` (warm dark blue-gray). Pure black feels harsh under fluorescent hospital lighting.
4. **No pure white (#FFFFFF) as page background.** Use `#FAFAF8` (warm white). Pure white causes eye fatigue on large kiosk screens.

---

## 3. Custom Medical Icon System

### 3.1 Icon Design Principles

We design our own SVG icons. NOT stock emojis. NOT Font Awesome. NOT generic icon libraries.

**Why custom icons matter:**
- Stock emojis render differently on Android, iOS, Windows — inconsistent UX
- Generic icon libraries (Lucide, Heroicons) are designed for tech apps, not healthcare
- Our patients include illiterate users who must understand icons WITHOUT text
- Custom icons = professional identity = judges notice the craftsmanship

### 3.2 Icon Style Specification

```
MediKiosk Icon Style:
├── Style: Filled with subtle line details (NOT outlined, NOT flat)
├── Corner radius: 2px on internal shapes (slightly rounded, not sharp)
├── Stroke: No visible strokes — shapes are filled with color
├── Colors per icon: Maximum 3 (primary color + 1 accent + white/negative space)
├── Grid: 24×24 base grid, exported at 48px and 96px
├── Padding: 2px safe area inside the grid (icon fills 20×20 of the 24×24)
├── Metaphor: Realistic enough to be instantly recognizable,
│   simple enough to work at 48px
├── Cultural sensitivity: Indian skin tones (#C68642, #8D5524, #F1C27D),
│   Indian clothing patterns where relevant
├── Gender: Neutral where possible, balanced representation where gendered
└── Accessibility: Each icon must pass the "silhouette test" —
    recognizable as a solid black shape
```

### 3.3 Icon Inventory — Complete Set Required

#### Chief Complaint Icons (Patient-Facing)

| Icon Name | Visual Description | Colors |
| :--- | :--- | :--- |
| `ic_headache` | Side profile of a head with concentric pain circles emanating from temple area. Face shows mild discomfort (furrowed brow, slight frown). | Blue head, coral pain indicators |
| `ic_chest_pain` | Front-facing torso with a hand placed on chest. Subtle radiating lines from heart area. | Blue torso, coral heart area |
| `ic_stomach_pain` | Front-facing torso with both hands on belly. Stomach area highlighted with gentle wave pattern (indicating unease). | Blue torso, amber stomach highlight |
| `ic_joint_pain` | Bent knee joint with visible bone outlines and pain indicator at joint. Anatomically simple but recognizable. | Blue limb, coral at joint |
| `ic_breathing` | Side profile of head/chest with visible airflow lines at nose/mouth. Lungs partially visible in chest area with distress indicator. | Blue profile, teal lungs, amber distress |
| `ic_fever` | Face with thermometer in mouth. Forehead has heat waves rising. Cheeks slightly flushed. | Blue face, coral thermometer, amber heat waves |
| `ic_cough` | Side profile with open mouth, visible airflow/cough particles. Hand covering mouth. | Blue profile, amber cough particles |
| `ic_skin_rash` | Forearm with visible spots/patches pattern on skin. Magnified view circle showing texture detail. | Blue arm, coral spots |
| `ic_eye_pain` | Face in three-quarter view with one eye highlighted. Tear drop and redness indicator. | Blue face, coral eye area |
| `ic_ear_pain` | Side profile with ear highlighted. Sound/pain waves near ear canal. | Blue profile, coral ear, amber waves |
| `ic_back_pain` | Rear view of upper body, person's hand reaching to lower back. Pain radiates from lumbar area. | Blue body, coral lumbar area |
| `ic_nausea` | Face with queasy expression (greenish tinge on cheeks), hand near mouth. NOT graphic — suggestive, not literal. | Blue face, green-amber tinge |
| `ic_fatigue` | Person sitting, head drooped, low-energy posture. Battery icon with low charge nearby. | Blue figure, amber battery |
| `ic_urinary` | Simplified kidney/bladder outline (medical diagram style). NOT a toilet icon — dignified medical illustration. | Blue outline, teal kidney |
| `ic_anxiety` | Face with worried expression, thought clouds with scribble (representing mental chaos). Gentle, not scary. | Blue face, light gray clouds |
| `ic_other` | Speech bubble with three dots (...) — "tell us more." Plus sign (+) in corner. | Blue bubble, teal plus |

#### AYUSH / Dashavidha Pariksha Icons

| Icon Name | Visual Description | Colors |
| :--- | :--- | :--- |
| `ic_prakriti` | Three overlapping circles (representing Vata, Pitta, Kapha) with distinct patterns — wind lines, fire, water drops. | Teal (Vata wind), Amber (Pitta fire), Blue (Kapha water) |
| `ic_agni` | Stylized digestive fire — NOT a campfire. A stomach outline with a clean flame inside it. Medical, not camping. | Amber flame on blue stomach |
| `ic_koshtha` | Simplified intestinal path — a gentle curved tube. Clean, anatomical, dignified. | Blue path with teal flow |
| `ic_ahara` | Indian thali plate (round plate with small bowls). Recognizable as Indian food, not Western fork/knife. | Blue plate, teal bowls, amber food |
| `ic_vihara` | Sun and moon cycle (half sun, half moon) — representing daily routine / lifestyle. | Amber sun, blue moon |
| `ic_nidra` | Sleeping face with ZZZ — but styled consistently with our icon set, not cartoony. Peaceful expression. | Blue face, teal ZZZ |
| `ic_vyayama` | Figure in yoga pose (simple Tadasana/standing) — NOT a gym dumbbell. Indian-appropriate fitness. | Blue figure, teal mat |
| `ic_bala` | Stylized arm showing muscle/strength — but medical illustration style, not bodybuilder. Three levels: weak/medium/strong. | Blue arm with teal strength indicator |

#### Navigation / Action Icons

| Icon Name | Visual Description | Colors |
| :--- | :--- | :--- |
| `ic_mic` | Microphone with subtle sound wave arcs. When active: waves animate gently. | Blue mic, teal waves |
| `ic_mic_active` | Same mic but with colored sound waves and a gentle pulse ring. | Teal mic, green waves |
| `ic_camera` | Camera outline with lens — simple, clean. For document scanning. | Blue camera |
| `ic_scan_doc` | Document page with a scanning line across it (like a barcode scanner beam). | Blue page, teal scan line |
| `ic_back_arrow` | Left-pointing chevron with "Peeche" label. Chunky, unmissable. | Blue on white |
| `ic_next_arrow` | Right-pointing chevron with "Aage" label. Chunky, filled background. | White on blue bg |
| `ic_skip` | Right-pointing double chevron (>>). Smaller, secondary style. | Muted gray |
| `ic_speaker` | Speaker with sound waves — for replaying audio prompt. | Blue speaker, teal waves |
| `ic_check` | Rounded checkmark in a circle. For completed items. | Green check on white |
| `ic_cross` | Rounded X in a circle. For "no" or "none of these." | Muted gray, NOT red |
| `ic_help` | Question mark in a circle. Friendly, inviting. | Teal on white |
| `ic_language` | Globe with "अ" (Devanagari) and "A" (Latin) overlapping. Represents multilingual. | Blue globe, teal letters |
| `ic_abha` | ABHA logo (official) — or a health card icon with QR code pattern. | Official ABHA colors |

#### Pain Scale Icons (Replacing Wong-Baker Emoji Faces)

| Icon Name | Expression | Visual |
| :--- | :--- | :--- |
| `ic_pain_0` | No pain | Circular face, relaxed smile, open eyes. Calm blue outline. |
| `ic_pain_2` | Mild | Slight downturn of mouth, relaxed brow. Blue outline, minimal amber. |
| `ic_pain_4` | Moderate | Straight mouth, slightly furrowed brow. Blue outline, amber fill starting. |
| `ic_pain_6` | Moderate-Severe | Frown, creased forehead, eyes slightly squeezed. Amber-dominant fill. |
| `ic_pain_8` | Severe | Deep frown, tears forming, eyes squeezed shut. Coral-amber fill. |
| `ic_pain_10` | Worst | Crying, full tears, mouth open in distress. Coral fill. |

**Style note:** These are NOT cartoon smiley faces. They are simplified, dignified medical illustration faces with consistent line weight, drawn in our icon style. Same border radius, same color palette, same grid.

#### Body Part Selector Regions

The body outline is NOT a stock SVG from the internet. It is a custom illustration:

```
Design Specification — Body Outline:
├── Style: Simple, gender-neutral human silhouette
├── Proportions: Slightly stylized (not hyper-realistic, not stick figure)
├── Skin color: Neutral medium tone (#D4A574) — not white, not dark
├── Outline: 2px stroke in #1A5276 (primary blue)
├── Tap regions: 8 zones with distinct boundaries
│   ├── Head (above neck)
│   ├── Neck/Throat (narrow band)
│   ├── Chest (above diaphragm)
│   ├── Stomach/Abdomen (below diaphragm to pelvis)
│   ├── Left Arm (including hand)
│   ├── Right Arm (including hand)
│   ├── Left Leg (including foot)
│   └── Right Leg (including foot)
├── Hover/Tap state: Region fills with semi-transparent teal (#148F77 at 30% opacity)
├── Selected state: Region fills with teal at 60% + white check badge
└── Multiple selection: Yes — patient can tap multiple regions
```

### 3.4 Icon Production Pipeline

```
Design (Figma)                  Export                    Code
┌──────────────┐    ┌──────────────────────┐    ┌──────────────────────┐
│ Design icon  │───▶│ Export SVG per icon  │───▶│ React component via │
│ on 24×24 grid│    │ Optimize with SVGO   │    │ SVGR (auto-import)  │
│ in Figma     │    │ at 48px and 96px     │    │                     │
│              │    │ Name: ic_{name}.svg  │    │ <HeadacheIcon       │
│              │    │                      │    │   size={72}          │
│              │    │                      │    │   color="primary" /> │
└──────────────┘    └──────────────────────┘    └──────────────────────┘

For hackathon speed:
├── Phase 1: Hand-draw 20 critical icons in Figma (2-3 hours)
├── Phase 2: Generate remaining with AI image gen, then hand-refine in Figma
└── Phase 3: All icons pass the silhouette test and style consistency review
```

---

## 4. Typography

### 4.1 Font Selection

```
Primary Font:    "Noto Sans" (Google Fonts)
├── Why: Best Indic script support (Devanagari, Tamil, Telugu, etc.)
├── Weights: 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold)
├── Rendered via: Google Fonts API with swap display
└── Fallback: system-ui, -apple-system, sans-serif

Secondary Font:  "Noto Sans Devanagari" (for Hindi-heavy UI)
├── Auto-loaded when language = Hindi
└── Ensures proper conjunct rendering and ligatures
```

**Why NOT Inter / Poppins / Montserrat:**
- Inter: Excellent for tech, but lacks Indic script variants
- Poppins: Overused in Indian tech — looks like every other startup
- Montserrat: Too decorative for a medical interface
- Noto Sans: Purpose-built by Google for global language coverage, includes medical-appropriate weights, and is already used by multiple government platforms

### 4.2 Type Scale

NOT a generic 1.25 ratio. Designed specifically for arm's-length kiosk readability and compact mobile:

| Token | Kiosk (px) | Mobile (px) | Doctor (px) | Usage |
| :--- | :--- | :--- | :--- | :--- |
| `--text-xs` | 16 | 12 | 12 | Captions, timestamps, confidence % |
| `--text-sm` | 20 | 14 | 13 | Secondary labels, meta info |
| `--text-base` | 24 | 16 | 14 | Body text, option labels |
| `--text-lg` | 28 | 18 | 16 | Sub-headings, section titles |
| `--text-xl` | 32 | 22 | 18 | Question prompts — the main text patient reads |
| `--text-2xl` | 40 | 28 | 24 | Primary action buttons, token number |
| `--text-3xl` | 56 | 36 | 32 | Hero numbers (Token #47), completion messages |

### 4.3 Typography Rules

1. **Maximum 2 font weights per screen.** Regular (400) for body, SemiBold (600) for emphasis. No light (300), no black (900).
2. **Line height: 1.5 for body, 1.3 for headings.** Generous leading for readability.
3. **Letter spacing: 0 for body, +0.02em for ALL CAPS labels.** Slight tracking on uppercase prevents cramped look.
4. **No italic text anywhere in patient-facing UI.** Italic is hard to read for low-literacy users.
5. **No underlined text except links.** Underline = clickable. Nowhere else.

---

## 5. Component Design Tokens

### 5.1 Spacing Scale

Based on 8px base unit (not 4px — 8px creates more breathing room on touch interfaces):

```
--space-1:   4px    (micro — icon internal padding)
--space-2:   8px    (tight — between icon and label within a card)
--space-3:   12px   (compact — between text elements)
--space-4:   16px   (standard — between cards in a list)
--space-5:   24px   (comfortable — section padding)
--space-6:   32px   (generous — between major sections)
--space-7:   48px   (spacious — page margins on kiosk)
--space-8:   64px   (expansive — hero section padding)
```

### 5.2 Border Radius

```
--radius-sm:   8px    (small elements — badges, chips)
--radius-md:   12px   (standard — input fields, secondary buttons)
--radius-lg:   16px   (cards — all card components)
--radius-xl:   20px   (large cards — chief complaint options)
--radius-full: 9999px (pills — progress bar, avatar)
```

**Not 4px.** Not 6px. Our corners are **deliberately rounded** — 12px minimum for any tappable element. This creates the "warm, approachable" feel that distinguishes us from sharp-cornered government forms.

### 5.3 Shadows

```
--shadow-sm:    0 1px 3px rgba(28, 40, 51, 0.06)
                (Subtle lift — cards resting on background)

--shadow-md:    0 4px 12px rgba(28, 40, 51, 0.08)
                (Interactive — card on hover/focus)

--shadow-lg:    0 8px 24px rgba(28, 40, 51, 0.12)
                (Prominent — modal overlays, active card)

--shadow-inner: inset 0 2px 4px rgba(28, 40, 51, 0.04)
                (Pressed — button pressed state)
```

**Shadow color is warm blue-gray, NOT pure black.** `rgba(28, 40, 51, ...)` not `rgba(0, 0, 0, ...)`. Pure black shadows look harsh and artificial.

### 5.4 Transitions

```
--transition-fast:   150ms ease-out  (micro-interactions — button press)
--transition-normal: 250ms ease-out  (standard — card hover, focus ring)
--transition-slow:   400ms ease-out  (major — page transitions, modals)
```

**No bouncing. No elastic. No spring physics.** This is a medical application, not a social media app. `ease-out` only — things settle calmly into place.

---

## 6. Component Specifications

### 6.1 IconCard (Chief Complaint / Option Selection)

The most-used component in the patient UI. Must look tappable, feel responsive, and communicate meaning through the icon alone.

```
┌─ IconCard ──────────────────────────────────────┐
│                                                  │
│  ┌─────────────────────────────────────────────┐ │
│  │                                             │ │
│  │  Border: 2px solid #E5E7EB (default)        │ │
│  │  Border: 2px solid #1A5276 (selected)       │ │
│  │  Background: #FFFFFF (default)              │ │
│  │  Background: #EBF5FB (selected — soft blue) │ │
│  │  Border-radius: 20px                        │ │
│  │  Shadow: --shadow-sm (default)              │ │
│  │  Shadow: --shadow-md (hover/press)          │ │
│  │  Padding: 20px                              │ │
│  │  Min-height: 120px (kiosk)                  │ │
│  │                                             │ │
│  │      ┌──────────┐                           │ │
│  │      │  Custom   │  72×72px (kiosk)         │ │
│  │      │  SVG Icon │  56×56px (mobile)        │ │
│  │      └──────────┘                           │ │
│  │                                             │ │
│  │      Label Text                             │ │
│  │      (Noto Sans SemiBold, --text-base)      │ │
│  │      Bilingual: "Sir Dard"                  │ │
│  │      (Headache)                             │ │
│  │                                             │ │
│  └─────────────────────────────────────────────┘ │
│                                                  │
│  States:                                         │
│  ├── Default: gray border, white bg, sm shadow   │
│  ├── Hover: blue border, slight bg tint, md shadow│
│  ├── Pressed: blue border, inner shadow, scale(0.98)│
│  ├── Selected: blue border, soft blue bg, ✓ badge│
│  └── Disabled: gray bg, 50% opacity, no shadow   │
│                                                  │
└──────────────────────────────────────────────────┘
```

### 6.2 BigButton (Primary Action)

```
┌─ BigButton ─────────────────────────────────────┐
│                                                  │
│  ┌─────────────────────────────────────────────┐ │
│  │                                             │ │
│  │  Height: 64px (kiosk) / 52px (mobile)       │ │
│  │  Width: 100% (full width of content area)   │ │
│  │  Background: #1A5276 (primary blue)         │ │
│  │  Text: #FFFFFF, Noto Sans Bold, --text-2xl  │ │
│  │  Border-radius: 16px                        │ │
│  │  Shadow: --shadow-md                        │ │
│  │                                             │ │
│  │         ✅ Aage (Next)                       │ │
│  │                                             │ │
│  │  Pressed: darken 10%, scale(0.98), inner-shadow│
│  │  Disabled: #D5DBDB bg, no shadow            │ │
│  │                                             │ │
│  └─────────────────────────────────────────────┘ │
│                                                  │
│  Position: ALWAYS bottom of screen               │
│  Margin-bottom: safe-area-inset + 24px           │
│                                                  │
└──────────────────────────────────────────────────┘
```

### 6.3 VoicePill (Microphone Input)

```
┌─ VoicePill ─────────────────────────────────────┐
│                                                  │
│  ┌─────────────────────────────────────────────┐ │
│  │                                             │ │
│  │  Height: 56px (kiosk) / 48px (mobile)       │ │
│  │  Width: 100%                                │ │
│  │  Background: #F0F9F4 (soft green-white)     │ │
│  │  Border: 2px solid #27AE60                  │ │
│  │  Border-radius: 9999px (full pill)          │ │
│  │                                             │ │
│  │  🎤 Bol kar batayein    ████░░░░            │ │
│  │     (Speak)            [waveform]           │ │
│  │                                             │ │
│  │  Active state:                              │ │
│  │  Border pulses gently (green glow)          │ │
│  │  Waveform animates based on audio input     │ │
│  │  Background: #E8F8F0                        │ │
│  │                                             │ │
│  └─────────────────────────────────────────────┘ │
│                                                  │
│  The mic icon is our custom SVG, NOT the stock   │
│  browser mic. Matches our icon style.            │
│                                                  │
└──────────────────────────────────────────────────┘
```

### 6.4 ProgressBar (Top of Every Screen)

```
┌─ ProgressBar ───────────────────────────────────┐
│                                                  │
│  Position: Top of screen, below status bar       │
│  Height: 8px (kiosk) / 6px (mobile)             │
│  Border-radius: 9999px                           │
│  Track: #EAEDED (light gray)                     │
│  Fill: Linear gradient #148F77 → #1ABC9C (teal)  │
│  Transition: width 400ms ease-out                │
│                                                  │
│  ▬▬▬▬▬▬▬▬▬▬▬▬▬▬░░░░░░░░░░░░░░░░  45%           │
│                                                  │
│  Below bar: "Step 4 of 9" in --text-xs, muted    │
│  On completion: bar turns green, brief confetti   │
│  animation (subtle — 3 dots rising, not a party)  │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

## 7. Micro-Interactions & Motion Design

### 7.1 Purposeful Animations Only

Every animation must answer: **"What user uncertainty does this eliminate?"**

| Animation | Duration | Purpose | NOT for |
| :--- | :--- | :--- | :--- |
| Button press scale(0.98) | 150ms | Confirms the tap registered | Decoration |
| Card selection border + bg | 250ms | Shows which option was picked | Showing off |
| Progress bar fill | 400ms | Shows forward movement | Anxiety |
| Mic waveform | Real-time | Confirms the system is listening | Eye candy |
| Check mark on section complete | 300ms | Celebrates progress, reassures | Delaying the user |
| Page transition (slide left) | 300ms | Spatial continuity — "moving forward" | Flashiness |
| Error shake (horizontal 3x) | 300ms | Draws attention to an issue | Punishing the user |
| Triage alert pulse (red ring) | 1000ms loop | URGENT — demands staff attention | Normal UI states |

### 7.2 Animations We NEVER Use

- ❌ Bouncing / elastic / spring (feels playful — we're medical)
- ❌ Parallax scrolling (disorienting for elderly/low-vision)
- ❌ Loading skeleton shimmer (too "tech startup")
- ❌ Confetti / particle explosions (inappropriate for a hospital)
- ❌ Auto-scrolling carousels (inaccessible, proven to cause user frustration)
- ❌ Fade-in on scroll (patient might miss content)

---

## 8. Layout Grid

### 8.1 Kiosk Layout (Landscape, 1024px–1440px)

```
┌──────────────────────────────────────────────────────────────────┐
│  [Progress Bar — full width, 8px height]                         │
│  Step 4 of 9                                                     │
├──────────────────────────────────────────────────────────────────┤
│  ← Peeche                                          Skip ⏭      │
│                                                                  │
│  ┌─ Content Area (max-width: 640px, centered) ─────────────────┐ │
│  │                                                              │ │
│  │     Question Prompt (--text-xl, SemiBold)                    │ │
│  │     Audio speaker icon 🔊                                    │ │
│  │                                                              │ │
│  │     ┌────────────┐  ┌────────────┐  ┌────────────┐          │ │
│  │     │  Option 1  │  │  Option 2  │  │  Option 3  │          │ │
│  │     │  [Icon]    │  │  [Icon]    │  │  [Icon]    │          │ │
│  │     │  Label     │  │  Label     │  │  Label     │          │ │
│  │     └────────────┘  └────────────┘  └────────────┘          │ │
│  │                                                              │ │
│  │     ┌─────────────────────────────────────────────────┐     │ │
│  │     │  🎤  Bol kar batayein        [waveform]        │     │ │
│  │     └─────────────────────────────────────────────────┘     │ │
│  │                                                              │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │                    Aage (Next) →                              │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘

Content area is CENTERED with generous margins.
Even on a 1440px kiosk screen, content is 640px wide.
This prevents the UI from feeling "stretched" on large screens.
```

### 8.2 Mobile Layout (Portrait, 320px–428px)

```
┌────────────────────────────┐
│ [Progress 6px]             │
│ ← Peeche        Skip ⏭   │
│                            │
│  Question Prompt           │
│  (--text-xl, SemiBold)     │
│  🔊                        │
│                            │
│  ┌──────────┐ ┌──────────┐│
│  │ Option 1 │ │ Option 2 ││
│  │ [Icon]   │ │ [Icon]   ││
│  │ Label    │ │ Label    ││
│  └──────────┘ └──────────┘│
│  ┌──────────┐ ┌──────────┐│
│  │ Option 3 │ │ Option 4 ││
│  │ [Icon]   │ │ [Icon]   ││
│  │ Label    │ │ Label    ││
│  └──────────┘ └──────────┘│
│                            │
│  ┌──────────────────────┐  │
│  │  🎤  Speak [wave]   │  │
│  └──────────────────────┘  │
│                            │
│  ┌──────────────────────┐  │
│  │    Aage (Next) →     │  │
│  └──────────────────────┘  │
│                            │
└────────────────────────────┘

2-column grid for options (2×2).
Full-width mic pill and primary button.
16px page padding.
```

---

## 9. Implementation Tokens (Tailwind Config)

```javascript
// tailwind.config.ts — MediKiosk Design System

const config = {
  theme: {
    colors: {
      primary:    { DEFAULT: '#1A5276', dark: '#154360', light: '#EBF5FB' },
      teal:       { DEFAULT: '#148F77', light: '#E8F8F0', bright: '#1ABC9C' },
      success:    { DEFAULT: '#27AE60', light: '#EAFAF1' },
      warning:    { DEFAULT: '#E67E22', light: '#FEF5E7' },
      alert:      { DEFAULT: '#E74C3C', light: '#FDEDEC' },
      surface:    { DEFAULT: '#FAFAF8', card: '#FFFFFF' },
      text:       { DEFAULT: '#1C2833', muted: '#7F8C8D' },
      border:     { DEFAULT: '#E5E7EB' },
      disabled:   { DEFAULT: '#D5DBDB' },
    },
    borderRadius: {
      sm:   '8px',
      md:   '12px',
      lg:   '16px',
      xl:   '20px',
      full: '9999px',
    },
    fontFamily: {
      sans: ['Noto Sans', 'Noto Sans Devanagari', 'system-ui', 'sans-serif'],
    },
    // Font sizes defined per mode in CSS custom properties
    boxShadow: {
      sm:    '0 1px 3px rgba(28, 40, 51, 0.06)',
      md:    '0 4px 12px rgba(28, 40, 51, 0.08)',
      lg:    '0 8px 24px rgba(28, 40, 51, 0.12)',
      inner: 'inset 0 2px 4px rgba(28, 40, 51, 0.04)',
    },
  },
}
```

---

## 10. Quality Checklist — "Does This Look Senior-Built?"

Before any screen ships, it must pass ALL of these:

- [ ] **No stock emojis visible.** Every icon is our custom SVG.
- [ ] **No default Tailwind blue.** All colors from our palette.
- [ ] **No sharp corners on any tappable element.** Minimum 12px radius.
- [ ] **Shadows use warm blue-gray**, not pure black rgba.
- [ ] **Background is #FAFAF8**, not #FFFFFF or #F9FAFB.
- [ ] **Font is Noto Sans**, not Inter/Poppins/system default.
- [ ] **No more than 2 font weights on any single screen.**
- [ ] **No italic text in patient-facing UI.**
- [ ] **Touch targets are 72px minimum** (kiosk) / 56px (mobile).
- [ ] **Maximum 4 tappable options** visible without scrolling.
- [ ] **Progress bar is teal gradient**, not flat blue.
- [ ] **Button press has scale(0.98) feedback** — feels physical.
- [ ] **Every screen has audio prompt** — verified by QA.
- [ ] **Error states use amber**, never red (red = emergency ONLY).
- [ ] **No loading spinners.** Use skeleton states with our warm gray, or instant optimistic UI.
- [ ] **The screen passes the silhouette test** — if all colors were removed, the layout hierarchy is still clear.
- [ ] **The screen passes the 5th-grader test** — a child knows what to do in 5 seconds.
