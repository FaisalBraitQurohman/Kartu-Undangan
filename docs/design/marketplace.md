# UndangKita — Modern Elegant Marketplace

The supplied Elegant Wedding Marketplace concept is the visual reference for the landing page and catalog. The design prioritizes invitation products, permanent template ownership and interactive browsing.

## Visual system

Ivory paper `#fffdf9`, warm ivory `#faf8f4`, champagne `#f0e3d3`, espresso `#302a25`, muted gold `#a77d50`, sage `#82917b`. Playfair Display carries the wedding stationery character; Plus Jakarta Sans handles navigation, forms and product information. Typography and spacing change for mobile screens.

The updated opening composition uses the owner's Final Cinematic Hero brief: a left aligned four-line headline over the supplied Mediterranean wedding photograph, spanning the entire viewport width. Soft ivory gradients preserve readability and the continuous architectural scene. See editorial-hero.md for the current hero composition. The catalog follows immediately, then ownership benefits, the three step process, an interactive editor demonstration, FAQ and a floral closing banner. Statistics, ratings, popularity claims and unavailable navigation destinations are omitted.

## Functional behavior

- Active, supported templates, names, categories and prices come from PostgreSQL. Curated renderer metadata supplies style labels and accent palettes; no schema migration is required.
- Search matches names, descriptions, category labels, styles and accent color names. Category, style, color and price filters combine, and empty results can be reset.
- The preview cards show actual template cover renderers. Accent swatches change cover decoration and the preview URL. The full demo accepts only a valid six digit hexadecimal accent. The chosen color can be applied later in the real editor; browsing does not save account settings.
- Purchase/use controls lead to the existing template detail and server guarded checkout flow.
- The editor showcase lets visitors change example names and accent colors. It does not save or publish invitations.
- Sticky navigation, keyboard focus, real navigation destinations and reduced motion support remain available. Mobile checks cover 320, 390, 768 and 1440 pixel widths.

## Generated floral asset

File: `public/images/wedding-floral.png`. Generated with the built-in imagegen tool for the closing banner; this is decorative imagery, not a customer photo or a template screenshot. No source image was edited. Next.js handles responsive image delivery.

Final generation prompt:

> Create a premium editorial wedding still-life photograph for a digital invitation marketplace website banner. Wide landscape 3:2 image. A warm espresso-brown softly blurred background, delicate ivory roses, tiny white baby's breath blossoms, eucalyptus, pale champagne linen and an elegant blank ivory paper invitation. Arrange realistic flowers and paper mainly at the right edge and bottom edges. The middle and left two thirds must be softly out of focus, dark warm brown with ample clean negative space for white website headline overlay. Romantic natural late afternoon window lighting, sophisticated understated Indonesian wedding stationery art direction, muted gold highlights, realistic textures, professional shallow depth of field photography. No text, no letters, no logos, no people, no devices, no rendered website UI. Save the resulting asset for use in the current project.

## Verification

Local browser checks passed for real database catalog rendering, search, empty results, style/color/price filtering, accent demo navigation, live editor changes, mobile navigation and absence of horizontal overflow at the four viewport widths. No browser runtime errors were observed. Lint, typecheck and 36 unit tests passed. Two browser regression workflows cover the marketplace filters and editor/mobile behavior in the database-backed CI suite. Hosted build and regression results are recorded in the PR checks.
