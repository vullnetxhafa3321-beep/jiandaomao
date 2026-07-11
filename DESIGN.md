# DESIGN.md — Coastal Block Town（捡到猫）

> Visual source: Mediterranean low-poly coastal diorama (Townscaper / voxel hotel).
> Product: 捡到猫了 — mobile H5 rescue guide.
> Stack: Vite + React + Tailwind. Tokens live in `client/src/index.css`.

## Brand essence

A sunny miniature coastal town: blocky buildings, sharp sunlight, cream façades, olive lawns, and a bold red vertical sign. The UI should feel like walking into a toy hotel by the sea — modular floors, thick window frames, hard shadows — not soft clay blobs or generic SaaS.

## Color

| Token | Hex | Role |
|-------|-----|------|
| `--sky-deep` | `#2E5BFF` | Sky / primary brand blue |
| `--sky-500` | `#4A7BFF` | Interactive sky accents |
| `--sea-400` | `#70B8E8` | Sea / secondary surface |
| `--cream-50` | `#F7EFE4` | Page canvas / card face |
| `--cream-100` | `#E8D5C0` | Building wall / secondary fill |
| `--sand-300` | `#D4C0A8` | Paths, muted panels |
| `--olive-400` | `#C7C48C` | Grass / nature accent |
| `--olive-600` | `#8A8758` | Grass shadow |
| `--sign-red` | `#E23D3D` | Primary CTA / hotel sign |
| `--sign-red-deep` | `#B82A2A` | CTA hard shadow |
| `--awning-yellow` | `#F5D76E` | Highlight / secondary CTA |
| `--ink-900` | `#2C241C` | Primary text / thick frames |
| `--ink-700` | `#4A3F35` | Body text |
| `--ink-muted` | `#8A7E72` | Captions |
| `--cloud` | `#FFFFFF` | Clouds / high contrast chips |

### Legacy aliases (keep class names working)

```
--frog-canvas → --cream-50
--frog-paper  → --cream-50
--frog-wood   → --awning-yellow
--frog-green  → --olive-400
--frog-stone  → --ink-muted
--frog-ink    → --ink-700
--frog-border → --ink-900
--coral-500   → --sign-red
--brick-600   → --sign-red-deep
--grass-500   → --olive-400
--wood-500    → --sand-300
```

## Typography

| Role | Family | Notes |
|------|--------|-------|
| Display / brand | `Fredoka` | Soft-block letterforms, hotel-sign energy |
| Body / UI | `Nunito` | Rounded geometric, readable on H5 |
| Fallback title | `ZCOOL KuaiLe` | Chinese display when Fredoka lacks glyphs |

Scale (mobile): title 1.35–1.6rem · section 0.95rem · body 0.8–0.875rem · caption 0.65–0.75rem. Touch targets ≥ 44px.

## Shape & depth

- **Radius**: 10–14px for cards (blocky, not organic blobs). Pills only for step chips.
- **Borders**: 2px solid `ink-900` at ~35–50% opacity — thick “window frames”.
- **Shadows**: Hard offset only — `4px 4px 0 rgba(44,36,28,0.18)` or colored hard shadow under CTAs. No soft multi-layer glow.
- **Elevation**: Stack like building floors — map = rooftop terrace under sky; guide = ground-floor shop.

## Components

### Cards (building floors)
Cream face, 2px frame, hard shadow. Optional top “awning” stripe (yellow/white or red) for featured blocks.

### Primary CTA (hotel sign)
`--sign-red` fill, white bold type, hard `--sign-red-deep` offset. Label energy: short, punchy (“我捡到猫了”).

### Secondary CTA
`--awning-yellow` or `--sky-500` with hard dark offset.

### Bottom nav
Cream bar, top frame line, center FAB as red hotel-sign block lifted above the bar.

### Map chrome
Keep Leaflet + Amap tiles and marker data. Style only pins/popups/legend to town tokens. Do not change marker sources or tile URL.

**Category filters** (求助 / 医院 / 救助站): tapping a chip shows only that category on the map and the nearest **3** list rows — never mix other categories while filtered.

### Icons (Neko Atsume–inspired)
Thick warm-brown outlines (`#5C4033`), bean-shaped cats, flat pastel fills, dot eyes. Source illustrations live in `client/src/components/Icon.tsx`. Map pins use the same SVG via `mapPinHtml()`. Do not swap back to emoji for nav, map chips, or action badges.

### Guide panel
Treat as ground-floor shop: section title like a storefront sign, step tabs as small balcony doors, content as interior card.

## Motion

- Press: `translateY(2px)` + collapse hard shadow (matches physical block press).
- Welcome / modal: short slide-up 280–350ms ease.
- Prefer 2–3 intentional motions; no ambient glow pulses.

## Do / Don’t

**Do**
- Sky → sea → cream vertical atmosphere on the home shell
- Modular stacked sections like hotel floors
- Red for the single most important rescue action
- Keep all API-driven map markers, hospitals, guide steps as backend provides

**Don’t**
- Soft neumorphism / clay multi-shadow
- Purple SaaS gradients
- Mixing a second brand system
- Changing map tile provider, marker APIs, or mock data shapes
