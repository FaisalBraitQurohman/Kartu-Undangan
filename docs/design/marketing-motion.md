# UndangKita marketing motion

Motion complements the existing ivory, champagne and espresso editorial design. The installed `motion` package remains pinned at 14.1.0; no additional runtime dependency was introduced.

## Direction

- Hero: a single opening sequence reveals the eyebrow, headline lines, description, actions and ownership statement with 65ms stagger, 16px travel and 700ms easing. The supplied photograph stays still and full width.
- Collection heading, editor window and closing copy: one reveal when each first enters the viewport. Other sections remain still.
- Catalog: a scoped shared indicator follows the selected style. Remaining cards animate their position after filtering; changed results briefly crossfade. Filtering removes unavailable results immediately, retaining real links and native controls.
- Buttons and swatches: short press feedback; phone previews respond to hover only on devices with a fine pointer. Accent colors transition without remounting editable content.
- FAQ: native details/summary semantics remain. Supporting browsers interpolate the open content height; other browsers retain instant native disclosure.

## Boundaries

Server content is visible before hydration and without JavaScript. `LandingMotion` receives rendered children, keeping database access and static content on the server. Effects and observers are scoped to the landing page and cleaned up on unmount. Animations use transform/opacity except the FAQ disclosure height. No scrolling interception, continuous parallax or automatic movement of editable fields is added.

`usePrefersReducedMotion` subscribes to the media query through React's external store API, including changes while the page is open. Reduced motion cancels reveals, disables catalog layout movement and removes CSS movement. The existing global reduced-motion rule also disables transitions.

## Skill and reference

The community Motion skill from `hairyf/skills` is installed in the owner's Codex skill directory, outside the application repository. Its examples were checked against the installed package and official documentation:

- https://motion.dev/docs/react-use-animate
- https://motion.dev/docs/react-layout-animations
- https://motion.dev/docs/react-accessibility

## Visual evidence

Local desktop 1440x900 and mobile 390x844 captures, catalog filtering, editor accent selection and FAQ disclosure were inspected. Browser capture reported no runtime errors, no horizontal overflow at 390px and zero running animations after enabling reduced motion. Capture artifacts remain in the ignored `.local/visual-motion/` directory. Static checks and hosted build results are recorded in the PR.
