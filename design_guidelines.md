# SalesTrackr Design Guidelines

## Design Approach

**Selected Approach**: Design System (Material Design) with CRM References

**Justification**: SalesTrackr is a utility-focused productivity tool requiring data clarity, efficient workflows, and consistent patterns. The application prioritizes quick data entry, dashboard clarity, and mobile-first field use over visual experimentation.

**Key References**: Salesforce Mobile, HubSpot CRM, Pipedrive - emphasizing clean data visualization, quick-action interfaces, and mobile optimization for field sales representatives.

**Core Principles**:
1. **Speed First**: Minimize clicks to log visits and update client data
2. **Scan-ability**: Dense information presented clearly for dashboard views
3. **Mobile Priority**: Field reps access on-the-go; thumb-friendly interactions
4. **Data Confidence**: Clear visual feedback for all CRUD operations

---

## Typography

**Font Family**: Inter (Google Fonts) - optimized for data-dense interfaces
- Primary: Inter (400, 500, 600, 700)
- Monospace: JetBrains Mono for numerical data

**Hierarchy**:
- Dashboard Headers: text-2xl font-semibold (24px)
- Section Titles: text-lg font-medium (18px)
- Data Labels: text-sm font-medium uppercase tracking-wide (14px)
- Body Text: text-base (16px)
- Supporting Text: text-sm text-gray-600 (14px)
- Data Values: text-lg font-semibold (18px) - high contrast
- Mobile Headers: text-xl (20px) for thumb reach

---

## Layout System

**Spacing Primitives**: Tailwind units of **2, 4, 6, 8, 12, 16**
- Component padding: p-4, p-6
- Card spacing: space-y-4
- Section gaps: gap-6, gap-8
- Dashboard margins: m-8, m-12
- Mobile: Reduce to p-4, gap-4

**Grid System**:
- Desktop Dashboard: 12-column grid (grid-cols-12)
- Tablet: 8-column grid (md:grid-cols-8)
- Mobile: Single column stacking

**Container Strategy**:
- Dashboard main: max-w-7xl mx-auto
- Forms/Modals: max-w-2xl
- Data tables: Full width with horizontal scroll on mobile

---

## Component Library

### Navigation
**Desktop Sidebar** (fixed, 256px width):
- Logo at top (h-16)
- Navigation items with icons (Heroicons)
- Active state: subtle background fill
- Collapsible on tablet

**Mobile Bottom Navigation** (fixed):
- 4 primary actions: Dashboard, Clients, Add Visit, Profile
- Icon + label, active state highlighted
- Safe area padding for iOS

### Dashboard Cards
**Metric Cards** (grid-cols-1 md:grid-cols-2 lg:grid-cols-4):
- Large number display (text-3xl font-bold)
- Label beneath (text-sm uppercase)
- Trend indicator (arrow + percentage)
- Subtle border, rounded-lg

**Activity Feed**:
- Timeline design with vertical line
- Icon indicators for visit types
- Timestamp + client name + action
- Infinite scroll with "Load More"

**Quick Stats Chart**:
- Simple bar/line charts using Chart.js
- 7-day or 30-day toggle
- Responsive, aspect-ratio-video container

### Data Tables
**Client List / Visit Log**:
- Sticky header row
- Sortable columns (click header)
- Row actions on right: Edit, View, Delete icons
- Alternating row backgrounds for scan-ability
- Pagination controls at bottom
- Mobile: Card view instead of table

**Table Density**:
- Row height: h-12 (comfortable click targets)
- Cell padding: px-4 py-3

### Forms
**Visit Logging Form**:
- Single-column on mobile, two-column on desktop
- Field groups with clear labels
- Input heights: h-12 for text, h-32 for textarea
- Dropdown selects for client selection (searchable)
- Date/time pickers native HTML5
- Photo upload with preview thumbnails
- Submit button: Full width mobile, auto desktop

**Validation**:
- Inline error messages (text-sm text-red-600)
- Success states with checkmark icon
- Required field indicators (asterisk)

### Modals & Overlays
**Quick Add Modal**:
- Centered, max-w-lg
- Backdrop blur effect (backdrop-blur-sm)
- Close button top-right
- Action buttons bottom-right
- Padding: p-6

**Confirmation Dialogs**:
- Compact, max-w-sm
- Icon at top (warning/info)
- Two-button layout: Cancel (ghost) + Confirm (primary)

### Buttons & Actions
**Primary Action**: 
- Solid fill, rounded-lg
- Height: h-12 (mobile), h-10 (desktop)
- Padding: px-6
- Font: text-base font-medium

**Secondary Actions**:
- Border outline, transparent background
- Same sizing as primary

**Icon Buttons**:
- Square, w-10 h-10
- Icon size: w-5 h-5
- Rounded-md

**FAB (Floating Action Button)** - Mobile only:
- Bottom-right, fixed position
- "Add Visit" primary action
- w-14 h-14, rounded-full
- Shadow: shadow-lg

### Status Indicators
**Visit Status Badges**:
- Completed: Subtle green background
- Pending: Yellow background
- Cancelled: Gray background
- Padding: px-3 py-1, rounded-full
- Text: text-xs font-medium uppercase

---

## Images

**Dashboard Hero**: None - prioritize data visibility immediately

**Empty States**: 
- Illustration placeholders when no data exists
- 200x200px centered illustrations
- Friendly message + CTA button beneath

**Client Profiles**:
- Avatar placeholders (w-12 h-12 rounded-full)
- Initials if no photo available

**Visit Photos**:
- Grid display, 2 columns mobile, 4 desktop
- Aspect ratio: aspect-square
- Lightbox on click for full view

---

## Accessibility

- Minimum touch targets: 44x44px (Mobile)
- Focus indicators: 2px outline offset
- ARIA labels for icon-only buttons
- Semantic HTML: nav, main, article, aside
- Skip to main content link
- Form labels explicitly tied to inputs

---

## Animations

**Minimal, purposeful only**:
- Page transitions: None (instant for speed)
- Modal entry: Fade in, 200ms duration
- Success feedback: Checkmark scale animation, 300ms
- Loading states: Spinner or skeleton screens
- No scroll-triggered animations