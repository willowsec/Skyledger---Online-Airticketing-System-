# ✈️ SkyLedger Design System
> **Version:** 1.0 | **Status:** Production-Ready | **Target:** Web & Mobile-Responsive

---

## 1. 🧭 Brand Identity & Philosophy

| Aspect | Specification |
|--------|---------------|
| **Name** | SkyLedger |
| **Etymology** | `Sky` (Aviation, Freedom, Exploration) + `Ledger` (Precision, Trust, Financial Clarity) |
| **Core Promise** | *“Book flights smarter with transparent pricing and zero friction.”* |
| **Personality** | Clean, Fast, Trustworthy, Premium yet Accessible |
| **Design Ethos** | Less clutter, more clarity. Every pixel should serve a purpose. |
| **Target Audience** | Modern travelers, business commuters, budget-conscious flyers, tech-savvy users |
| **Voice & Tone** | Direct, reassuring, professional, slightly conversational |

---

## 2. 🎨 Color System & Semantic Tokens

### 🟦 Base Palette
| Token | Name | Hex | Usage |
|-------|------|-----|-------|
| `--sl-color-primary` | Deep Sky | `#1E3A8A` | Primary actions, headers, active states |
| `--sl-color-accent` | Electric Sky | `#2563EB` | Hover, links, secondary highlights |
| `--sl-color-bg` | Soft Cloud | `#F8FAFC` | Page background, canvas |
| `--sl-color-surface` | Pure White | `#FFFFFF` | Cards, modals, inputs |
| `--sl-color-text-primary` | Dark Slate | `#0F172A` | Body text, headings, labels |
| `--sl-color-text-secondary` | Muted | `#64748B` | Captions, placeholders, disabled text |

### 🟢 Semantic & State Colors
| Token | Name | Hex | WCAG Contrast (on `#FFFFFF`) |
|-------|------|-----|------------------------------|
| `--sl-color-success` | Emerald | `#16A34A` | ✅ 4.6:1 |
| `--sl-color-warning` | Amber | `#F59E0B` | ✅ 3.2:1 (use on dark for AA) |
| `--sl-color-error` | Crimson | `#DC2626` | ✅ 4.8:1 |
| `--sl-color-info` | Sky Info | `#0EA5E9` | ✅ 4.2:1 |

### 🌈 Gradients & Effects
```css
:root {
  --sl-gradient-hero: linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%);
  --sl-gradient-btn-hover: linear-gradient(135deg, #1D4ED8 0%, #3B82F6 100%);
  --sl-shadow-soft: 0 10px 25px rgba(0, 0, 0, 0.05);
  --sl-shadow-hover: 0 14px 32px rgba(0, 0, 0, 0.08);
  --glow-primary: 0 0 0 3px rgba(37, 99, 235, 0.25);
}

font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

3. 🔤 Typography & Text Hierarchy
📐 Font Stack
css
1
Fallback: System UI ensures instant rendering and native feel.
📏 Type Scale & Metrics
Role
Size
Line-Height
Weight
Letter-Spacing
Usage
h1-hero
42px
1.15
700
-0.02em
Landing headlines
h2-section
28px
1.25
600
-0.01em
Page titles, section headers
h3-card
20px
1.3
600
0
Card titles, sub-headers
body-base
16px
1.5
400
0
Paragraphs, descriptions
body-sm
14px
1.4
400
0
Metadata, secondary info
label
12px
1.2
500
0.04em
Form labels, badges, captions
button-text
14px
1
600
0.02em
CTA, navigation

Spacing 
--sl-space-xs: 4px;
--sl-space-sm: 8px;
--sl-space-md: 16px;
--sl-space-lg: 24px;
--sl-space-xl: 32px;
--sl-space-2xl: 48px;
--sl-space-3xl: 64px;

6. 📄 Page Templates & Layout Strategy
Page
Layout Structure
Key Components
SearchPage
Full-bleed hero gradient → centered glassmorphic search card → recent deals grid
Hero title, swap button, date picker, passenger selector, price preview
Login/Register
50/50 split (left: illustration, right: form) → centered card on mobile
Email/password, OAuth buttons, link to forgot password, validation hints
SeatSelectPage
Top: legend & price → Center: aircraft grid (SVG/CSS) → Bottom: confirm CTA
Interactive cells, hover tooltip, selected state, disabled/booked overlay
BookingConfirm
2-column (Left: itinerary, Right: payment summary) → mobile stacks
Flight timeline, price breakdown, terms checkbox, pay button
BookingSuccess
Centered success modal → big green check → ticket preview → CTAs
Confetti (optional), ticket PDF download, dashboard redirect
User Dashboard
Sidebar (optional) or top tabs → booking cards grid → filter bar
Tabs: Upcoming/Completed/Cancelled, status badges, quick actions
Admin Panel
Dark sidebar (#0F172A) + light content (#F8FAFC) → data tables, stats cards
KPI cards, CRUD tables, export buttons, role-based routing