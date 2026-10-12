# UndangKita — Final Cinematic Hero

Implemented from the owner's Final Cinematic Hero brief using the supplied Mediterranean wedding photograph. The scope is the landing hero, its assets/styles and hero regression coverage.

## Composition and visual system

- One continuous photograph spans the entire viewport width immediately below the existing sticky navbar. The content container constrains only the text and benefit row.
- Left aligned, four-line Playfair Display headline; final two lines are italic. Plus Jakarta Sans handles the description, functioning collection/demo CTAs and ownership statement.
- A soft horizontal ivory gradient protects desktop text while retaining the warm wall, botanical shadows, arch and lake. A bottom fade blends the hero into the catalog.
- Desktop hero height is approximately 780px. Tablet uses smaller typography and two-column benefits. Mobile uses the same photograph with a 62% horizontal crop and a stronger vertical overlay; actions remain early in the page.
- Ivory `#FAF8F4`, soft sand `#EDE3D6`, muted gold `#B59A75` and espresso `#3B302B` preserve the existing brand palette.
- No hero phone mockups, floating cards, invented statistics or testimonials. Shared phone previews remain in the catalog and editor showcase. CTA transitions honor reduced motion.

## Implementation

`src/components/marketing/hero-section.tsx` owns content, actions, the full-section background and benefit row. `src/app/editorial-hero.css` scopes layout and responsive image treatment. The component is server rendered, with no new dependency or client component.

Next.js Image uses `fill`, `preload` and `sizes="100vw"`. The reserved hero dimensions prevent image-driven layout shifts. An empty alt and hidden decorative wrapper keep the atmospheric photograph out of the accessibility tree. The former isolated scene component, generated backdrop and unused legacy hero styles were removed.

## Asset provenance

Local file: `public/images/hero-mediterranean.png`. Supplied by the owner; used without generating or replacing imagery. It contains Mediterranean architecture, ivory curtains, white florals and a sunset lake landscape.

## Verification

Screenshots were captured and visually inspected at desktop 1440x900, mobile 390x844 and tablet 768x900. Local browser checks passed at 320, 390, 768, 1024, 1440 and 1920px for full-width background coverage, placement directly below the navbar, no horizontal overflow, unclipped headline lines and early CTA visibility. Checks confirmed one H1, no hero phone, image loading, collection/demo navigation, mobile menu behavior, reduced motion and zero browser runtime errors.

Lint and TypeScript checks passed locally. Permanent browser regression coverage lives in `tests/e2e/marketplace.spec.ts`; current hosted production build and suite results are recorded in the PR checks.
