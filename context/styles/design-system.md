# Design System — Context for Claude Code

## Fonts
- **Body**: `'Nunito', system-ui, -apple-system, sans-serif` — weight 400 default
- **Display**: `'Bricolage Grotesque', system-ui, sans-serif` — weight 700, used for headings and stat numbers
- Apply display font via `.font-display` class or inline

## CSS Variables (port from existing globals.css exactly)

```css
:root {
  /* Backgrounds */
  --bg: #F6F4F0;
  --bg-warm: #FBF9F6;
  --surface: #FFFFFF;
  --card: #FFFFFF;

  /* Borders */
  --border: #EBE8E2;
  --border-hover: #D9D4CB;

  /* Text */
  --text: #1C1917;
  --text-secondary: #57534E;
  --text-muted: #A8A29E;
  --text-dim: #D6D3D1;

  /* Accent (violet) */
  --accent: #7C3AED;
  --accent-light: #A78BFA;
  --accent-softer: #EDE9FE;
  --accent-text: #5B21B6;

  /* Warm (streaks, momentum) */
  --warm: #F97316;
  --warm-light: #FB923C;
  --warm-softer: #FFF7ED;

  /* Success */
  --success: #10B981;
  --success-light: #34D399;
  --success-softer: #D1FAE5;

  /* Danger */
  --danger: #EF4444;
  --danger-light: #FCA5A5;
  --danger-softer: #FEE2E2;

  /* Progress */
  --slider-bg: #E7E5E4;

  /* Shadows */
  --shadow-sm: 0 1px 3px rgba(28,25,23,0.04), 0 1px 2px rgba(28,25,23,0.03);
  --shadow: 0 4px 12px rgba(28,25,23,0.06), 0 1px 3px rgba(28,25,23,0.04);
  --shadow-md: 0 8px 24px rgba(28,25,23,0.08), 0 2px 8px rgba(28,25,23,0.04);
  --shadow-lg: 0 20px 60px rgba(28,25,23,0.10), 0 4px 16px rgba(28,25,23,0.06);
  --shadow-accent: 0 4px 16px rgba(124,58,237,0.15), 0 1px 4px rgba(124,58,237,0.08);
  --shadow-warm: 0 4px 16px rgba(249,115,22,0.12);

  /* Radii */
  --r-sm: 10px;
  --r-md: 14px;
  --r-lg: 18px;
  --r-xl: 22px;
  --r-2xl: 28px;
  --r-full: 9999px;

  /* Ease */
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
}
```

## Pillar Default Colors
Each pillar gets a distinct color. These are the defaults suggested during onboarding:

| Pillar | Color | Hex |
|--------|-------|-----|
| Health | Emerald | #10B981 |
| Career | Blue | #3B82F6 |
| Knowledge | Violet | #7C3AED |
| Relationships | Rose | #F43F5E |
| Finance | Amber | #F59E0B |
| Creative | Cyan | #06B6D4 |

## Styling Pattern
Use Tailwind for layout, CSS variables for design tokens:

```tsx
// CORRECT
<div className="flex items-center gap-3 px-4 py-3 rounded-[var(--r-lg)]"
     style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>

// WRONG — don't use Tailwind color classes for our custom palette
<div className="bg-white border-gray-200">
```

## Animations
Port these keyframes from existing globals.css:
- `slideUp`: opacity 0→1, translateY 12→0. 250ms ease-out.
- `scaleIn`: opacity 0→1, scale 0.96→1. 200ms ease-out.
- `modalIn`: opacity 0→1, scale 0.97→1 + translateY 8→0. 250ms ease-out.
- `shimmer`: background-position animation for skeleton loaders.

## Card Pattern
All cards (goal cards, pillar cards, action cards) share:
- Background: `var(--card)`
- Border: `1px solid var(--border)`
- Border radius: `var(--r-xl)` (22px)
- Hover: border color → `var(--accent-light)`, translateY(-3px), shadow → `var(--shadow-md)`
- Transition: `all 0.25s var(--ease-out)`
