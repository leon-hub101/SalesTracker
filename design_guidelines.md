# SalesTrackr Luxury Edition - Design Guidelines

## Design Philosophy

**Hybrid Approach**: Material Design functionality + Jo Malone London aesthetic = British luxury minimalism meets enterprise CRM efficiency.

**Core Principles**:
- Refined Efficiency: Speed without sacrificing elegance
- Breathing Room: Generous whitespace elevates data
- British Minimalism: Clean lines, serif typography, sharp corners
- Understated Luxury: Sophistication through restraint

---

## Typography

**Font Stack**:
- **Display/Headers**: Cormorant Garamond (400/500/600/700) - elegance & luxury
- **Body/Data**: Inter (400/500/600) - clarity & scanning
- **Monospace**: JetBrains Mono - numerical precision

**Hierarchy**:
```css
Page Titles: text-4xl font-light tracking-wide Cormorant (48px)
Dashboard Metrics: text-5xl font-light Cormorant (56px)
Section Headers: text-2xl font-normal Cormorant (30px)
Subsection Labels: text-lg font-medium Inter uppercase tracking-widest (18px)
Body Text: text-base Inter (16px)
Data Values: text-xl font-semibold Inter (20px)
Supporting: text-sm Inter (14px)
Micro Copy: text-xs Inter uppercase tracking-wider (12px)
```

**Treatment**: Generous tracking on uppercase (tracking-widest), leading-relaxed for body, leading-tight for display numbers.

---

## Layout & Spacing

**Spacing Scale**: 4, 8, 12, 16, 24, 32 (Tailwind units)
- Component padding: p-8, p-12
- Section gaps: gap-12, gap-16
- Page margins: mx-16, my-24 (desktop) | mx-6, p-6 (mobile)

**Grid System**:
- Dashboard: 12-column, gap-8, max-w-7xl (tables only)
- Metric Cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12
- Content: max-w-6xl (default) | max-w-xl (forms) | max-w-prose (reading)

**Whitespace Rule**: Double standard spacing between sections. Minimum p-8 on cards. Never edge-to-edge.

---

## Color System

**Primary Palette** (Jo Malone inspired):
```
Cream: #F8F6F3 (backgrounds)
Charcoal: #2C2C2C (primary text)
Gold: #B8976A (accents, CTAs)
Soft Black: #1A1A1A (headers)
Warm White: #FFFFFF (cards)
```

**Functional Colors**:
```
Success: #4A7C59 (muted green)
Warning: #C9A961 (refined gold)
Error: #9B4444 (understated red)
Info: #6B7C93 (soft blue-grey)
```

**Borders & Dividers**: 1px hairlines in rgba(44,44,44,0.1)

---

## Components

### Navigation

**Desktop Sidebar** (280px, fixed):
- Logo: py-12 generous padding
- Items: h-14 touch targets, text-sm uppercase tracking-widest
- Active: Subtle underline or fill
- Collapsible to icons (tablet)

**Mobile Bottom Nav** (fixed):
- 4 core actions, icon above label
- text-xs uppercase tracking-wide
- Active: Filled icon + indicator

### Cards & Metrics

**Hero Metrics**:
```tsx
<div className="p-12 border rounded-none">
  <p className="text-xs uppercase tracking-widest mb-4">MONTHLY REVENUE</p>
  <h2 className="text-5xl font-light font-cormorant">£142,500</h2>
  <span className="text-sm mt-2">↑ 12.3%</span>
</div>
```
- Border: 1px hairline, rounded-none
- Hover: Subtle lift (translateY -2px), shadow
- Grid: gap-12, never grid-cols-4

**Timeline**:
- Vertical line, w-4 h-4 dots left
- Content: p-6, space-y-6
- Client: Cormorant text-lg | Action: Inter text-sm
- Timestamp: text-xs uppercase tracking-wide

### Data Tables

**Structure**:
```tsx
Row: h-16, px-6 py-4
Headers: Sticky, text-xs uppercase tracking-widest
Dividers: 1px hairline (optional)
Actions: Right-aligned, w-5 h-5 icons
```
- Mobile: Transform to card view, maintain p-6
- Empty state: Centered illustration + Cormorant headline

### Forms

**Layout** (max-w-xl):
```tsx
<form className="space-y-8">
  <label className="text-sm uppercase tracking-wide">Client Name</label>
  <input className="h-14 px-6 border-2 rounded-none w-full" />
</form>
```
- Inputs: h-14, border-2, rounded-none
- Textarea: min-h-32
- Photo upload: Dashed border, grid-cols-3 gap-4 previews
- Validation: text-sm below field with icon
- Focus: Border 2px→3px transition

### Buttons

**Primary**:
```tsx
<button className="h-14 px-8 rounded-none text-sm uppercase tracking-widest font-medium">
  Save Visit
</button>
```

**Secondary**: Same + border-2, transparent background

**Icon Buttons**: w-12 h-12 square, w-6 h-6 icon

**FAB** (mobile only): w-16 h-16 rounded-full, bottom-right fixed, shadow-2xl

### Modals

```tsx
<div className="backdrop-blur-md">
  <div className="max-w-2xl p-12">
    <h2 className="text-3xl font-light font-cormorant text-center">Confirm Delete</h2>
    <div className="text-center mt-6">...</div>
    <div className="flex justify-end gap-4 mt-8">...</div>
  </div>
</div>
```
- Close: Top-right X, w-6 h-6
- Confirmations: max-w-md p-8, centered icon (w-12 h-12)

### Status Badges

```tsx
<span className="px-4 py-2 rounded-full text-xs uppercase tracking-wider font-medium">
  Completed
</span>
```
States: Completed, Scheduled, Cancelled, Follow-up, VIP, High-Value, New, At-Risk

---

## Images

**Login Hero**: Full-bleed (100vh desktop, 60vh mobile)
- Overlay: backdrop-blur-lg
- Form: p-12 max-w-md centered

**Empty States**: 240x240px line illustrations, Cormorant text-2xl headline

**Avatars**: w-16 h-16 rounded-full, 1px border, Cormorant initials fallback

**Visit Photos**: grid-cols-2 md:grid-cols-4 gap-4, aspect-square, 1px border

**Photography Style**: Clean, bright, natural light, minimal props, British sophistication. Avoid busy backgrounds.

---

## Accessibility

- **Touch Targets**: 44px minimum (mobile), 48px preferred
- **Focus**: 2px outline, 4px offset
- **ARIA**: All icon-only buttons labeled
- **Semantic HTML**: nav, main, article, section
- **Forms**: Explicit label connection, never placeholder-only
- **Contrast**: WCAG AA minimum
- **Screen Readers**: Professional descriptive text

---

## Animations

**Philosophy**: Sparingly applied, refined execution. Utility first.

```css
Modal Entrance: fade + scale, 300ms ease-out
Button Hovers: fill transition, 200ms
Card Hovers: translateY(-2px) + shadow, 250ms
Form Success: checkmark draw, 400ms
Loading: Subtle shimmer skeleton or minimalist spinner
Data Updates: Fade transitions
```

**NO**: Scroll-triggered animations (maintains professional restraint)

**Loading States**: Hairline skeleton borders with subtle shimmer OR thin circular spinner

---

## Key Dos & Don'ts

**DO**:
- ✓ Use generous spacing (double between sections)
- ✓ Apply rounded-none for sharp British aesthetic (except mobile FAB, badges)
- ✓ Maintain 1px hairline borders
- ✓ Use Cormorant for elegance, Inter for clarity
- ✓ Keep max-w-6xl for elegance (tables: max-w-7xl)
- ✓ Apply uppercase tracking-widest to labels

**DON'T**:
- ✗ Grid-cols-4 metric cards (too crowded)
- ✗ Edge-to-edge layouts without breathing room
- ✗ Playful illustrations (use refined line art)
- ✗ Aggressive animations or scroll effects
- ✗ Max-w-7xl on standard content
- ✗ Skip accessibility requirements for aesthetics

---

**This system transforms enterprise sales tracking into a premium experience: British luxury minimalism meets CRM efficiency. Every interaction feels refined while maintaining field representative speed and clarity.**