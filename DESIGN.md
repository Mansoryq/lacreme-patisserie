# La Crème visual system

## Direction

La Crème is a contemporary French pâtisserie viewed as a composed garden: calm axial rhythm, refined restraint, and seasonal colour. The interface gives real dessert imagery the role of a carefully placed specimen, never a background decoration. Lavender from the supplied mark is the signature accent; dark plum provides contrast and authority.

## Experience

- **Mode:** Persuade on storefront routes; operate on ordering and admin routes.
- **First impression:** understand the boutique, see real products, and reach the catalogue within one viewport.
- **Rhythm:** generous editorial titles, rule-based sections, then dense product selection; no repeating soft cards or generic icon grids.

## Tokens

| Role | Value |
| --- | --- |
| Canvas | `#f7f4ee` |
| Warm product surface | `#ede8df` |
| Ink | `#211c25` |
| Deep plum | `#382841` |
| Brand violet | `#5a467f` |
| Lavender | `#d8cde7` |
| Display | DM Serif Display |
| Body | DM Sans |

## Components

- `site-shell`: fluid centered page frame with a 20–72 px inline gutter.
- `display-type`: editorial headlines with compact tracking and controlled scale.
- `button-primary` / `button-secondary`: square-edged, clear action controls with a short lift on hover.
- `photo-stage` / `product-photo`: warm matte background and `object-contain` presentation, protecting product framing from the source crop.
- Product lists use hairline rules and varied image proportions, not uniform floating cards.

## Motion and accessibility

Transitions are short and functional: an image may softly scale on hover, primary actions lift by two pixels, and reduced-motion preferences neutralize animation. Focus rings remain visible. Controls use semantic links and buttons, text contrast is held against the selected surface, and mobile layouts collapse to a single deliberate reading column.
