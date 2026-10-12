# UndangKita — Premium Editorial Hero

Implemented from the owner's attached Premium Editorial Hero brief and Awal yang Indah visual reference. The scope is the landing hero, its assets/styles and hero regression coverage.

## Composition and visual system

- Left 45%: exact four-line headline, Playfair Display, italic final two lines, description, two functioning CTAs and a discreet collection scroll link.
- Right 55%: one realistic phone frame containing the real Minimalist Ivory renderer, placed over a locally generated architectural photograph. The rounded arch framing, travertine pedestal, ivory fabric, florals and late afternoon lake landscape create a coherent wedding editorial set.
- Ivory `#FAF8F4`, soft sand `#EDE3D6`, muted gold `#B59A75`, espresso `#3B302B`, white `#FFFFFF`; existing Plus Jakarta Sans for body/UI.
- Tablet uses controlled type/phone sizing and two-column benefit rows. Mobile stacks the content above the scene, keeps the primary action early, and removes the side caption and scroll ornament. It does not shrink the desktop composition as a single image.
- No fabricated customer counts, ratings or testimonials. No constant movement or parallax. Hover transitions honor reduced motion.

## Implementation

`src/components/marketing/hero-section.tsx` owns content, actions and the hero benefit row. `hero-showcase.tsx` owns the local scene and the existing reusable PhoneMockup. `src/app/editorial-hero.css` scopes all new visual rules. The landing page composes HeroSection in place of its previous hero. The components are rendered on the server; no new client component or dependency is required.

The image uses Next.js Image with preload, responsive sizes and reserved scene dimensions. The actual phone remains HTML/CSS with a live template cover; it is not a baked image of a fake interface. Generated visual imagery is decorative, not a customer photo.

## Asset provenance

Local file: `public/images/editorial-wedding-stage.png`. Created with the built-in imagegen tool. No existing user image was edited. The full prompt is below.

> Create a photorealistic premium wedding editorial stage for a digital invitation website hero. Portrait 4:5 composition, front-facing camera. A tall warm sandstone architectural arch frames a serene distant lake and muted mountain landscape under pale late-afternoon sunlight. Cream travertine plinth/pedestal in the lower central foreground, flat empty top surface around 82 percent down the image, ready for a web-rendered smartphone to be placed on top. Keep the central zone from 20 to 80 percent height uncluttered so an actual live smartphone product can overlay it. Fine ivory linen drapes naturally along the right side of the arch, delicate ivory daisies and soft white flowers with restrained olive foliage only near the bottom left and bottom right edges. Warm directional sunlight from upper left, delicate believable stone shadows, sand, ivory, champagne and muted gold palette. Sophisticated luxury wedding magazine art direction, natural photographic texture, calm cinematic depth. No smartphone, no devices, no screens, no words, no letters, no logo, no people, no UI. This is a photographic backdrop, not a website mockup.

## Verification

Browser rendering and screenshots were inspected at desktop 1440px, tablet 768px and mobile 390px. Automated local checks passed at 320, 390, 768, 1024, 1440 and 1920px for no horizontal overflow or clipped headline lines. The primary CTA was within the first 844px on mobile. Checks also confirmed one H1, one live phone cover, local image loading, collection/demo links, reduced motion and zero browser runtime errors. Lint and TypeScript checks passed. Browser regression coverage is in tests/e2e/marketplace.spec.ts; hosted build and suite results appear in the PR checks.
