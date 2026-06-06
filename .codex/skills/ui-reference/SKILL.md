# UI Reference & Design System Skill

## When to Use
- When creating or modifying UI components to ensure visual consistency
- When reviewing design choices or proposing UI changes
- When the user asks about the project's design language, color system, or component styles
- When learning or referencing the project's aesthetic standards

## Design Reference Files
All UI references are stored in `ui-references/` at the project root:

- `ui-references/README.md` — Master design system documentation (colors, typography, spacing, animations)
- `ui-references/components/liquid-card.css` — iOS Liquid Glass card styles (SVG filter-based distortion, chromatic aberration)
- `ui-references/components/tunan-nav.css` — tunan-blog inspired floating capsule navigation, section headers, gradient text

## Design Language Summary

### Visual Identity: "Liquid Glass"
A fusion of iOS-style liquid glass effects (SVG displacement filters, chromatic aberration, multi-layer highlights) with tunan-blog's clean minimal layout (floating capsule navbar, section bars, clean backgrounds).

### Key Principles
1. **Clean backgrounds** — No heavy gradients; use `#0d1117` (dark) or `#ffffff` (light)
2. **Subtle glass effects** — Low-opacity glass with minimal blur, let content breathe
3. **Precise typography** — Inter for body, JetBrains Mono for code/labels, tight letter-spacing
4. **Animated accents** — Gradient text, wave emojis, floating particles (not overwhelming)
5. **Interactive feedback** — Hover translateX/scale, ripple clicks, sidebar toggle

### Component Catalog
| Component | Style Source | Key Properties |
|-----------|-------------|----------------|
| Navbar | tunan-blog | Floating capsule, centered, backdrop blur |
| Section Header | tunan-blog | Colored bar + mono font + "View all" link |
| Glass Card | iOS Liquid Glass | Semi-transparent bg, inner glow border, ::before distortion, ::after highlight |
| Service Link | Custom | Flex row, icon + text, hover translateX(3px) |
| Copy Button | Custom | 28px square, hover accent color, success green |
| Glass Button | iOS Liquid Glass | Capsule shape, 18% white bg, 0.5px border |
| Footer | tunan-blog | Animated gradient text, center-aligned |

### Color System
6 preset themes controlled by `data-color` attribute on `<html>`:
- purple (default), ocean, sunset, forest, lavender, sakura
- Each defines `--accent-1`, `--accent-1-light`, `--accent-2`, `--accent-2-light`

### When Modifying UI
1. Check `ui-references/README.md` for the relevant component section
2. Preserve the existing CSS variable names (`--accent-1`, `--glass-bg`, etc.)
3. Keep transitions consistent (0.3s ease standard, cubic-bezier for spring effects)
4. Test both dark and light themes
5. After changes, verify `npm run build` passes
