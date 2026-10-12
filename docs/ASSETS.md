# Generated assets

Created with the built-in ImageGen tool from the supplied design boards. PNG alpha is preserved. These are standalone documentation assets, not screenshots of the implementation. Original references remain in screenshots/ and docs/DESIGN.md.

| File | Use |
| --- | --- |
| assets/mark.png | Standalone transparent logo and source for icon exports |
| assets/wordmark.png | README identity |
| assets/viewer-illustration.png | README concept illustration |
| assets/setup-illustration.png | Firefox setup guide |

Toolbar icons are resized from the generated mark. scripts/export-icons.cjs performs deterministic resizes; it does not regenerate the artwork. Screenshots in screenshots/viewer.png, viewer-narrow.png, and preferences.png come from real Firefox rendering of the actual scripts through the test harness.

## Exact prompts

### mark

Use case: background-extraction / logo-brand. Input image is the IMG Hub brand board, reference/edit target. Extract and faithfully recreate ONLY the standalone Primary Mark symbol from the board: cyan-to-violet rounded broken frame/corner brackets, small cardinal tick marks, white rounded inner image tile, dark charcoal mountain silhouette and dot/sun. No words. No surrounding board, panels, labels, shadows on background, app-icon outer dark square, or backdrop. Sharp polished vector-like logo, centered with narrow even padding, square image, clean antialiased edges. Palette #00C2FF #8B5CFF #0B0F17 #F8FAFC. Preserve reference geometry closely. Real transparent alpha background; do not render a checkerboard.

### wordmark

Use case: logo-brand. Reference: supplied IMG Hub brand board. Recreate the horizontal logo lockup as a standalone image with REAL transparent background. Left: cyan-to-violet broken rounded image frame and cardinal ticks with a white rounded center containing a charcoal mountain and sun. Right: exact text 'IMG Hub' in bold geometric sans serif, IMG charcoal #0B0F17, Hub cyan-to-violet gradient. Wide horizontal composition with tight clean margins and all artwork fully contained. Pristine vector-like edges, flat colors, no paper, labels, cards, backdrop, noise, cast shadow, fake checkerboard, or glow. Only logo and exact name. Faithful to Horizontal Lockup in supplied board.

### viewer-illustration

Use case: illustration-story. Reference: supplied product feature board. Recreate ONLY the Lightbox Viewer illustration as an isolated clean standalone asset with real transparent background, no surrounding board/card, heading or caption. A charcoal rounded viewer window displaying a luminous cyan-blue-violet mountain landscape with snow-white sun, a crisp close X at top right, circular left/right arrows, a tiny thumbnail strip below, and small plus/minus zoom controls. Subtle polished dimensional UI illustration faithful to reference, front-on view, charcoal #0B0F17 cyan #00C2FF violet #8B5CFF snow #F8FAFC. Keep whole window fully inside frame with narrow even transparent margin. No words, no fake checkerboard, no large background or panel, no watermark.

### setup-illustration

Use case: infographic-diagram. Reference: supplied setup guide board. Generate a standalone compact horizontal four-object illustration on real transparent alpha, recreating the board's clean cyan-violet dimensional icon style. Left to right: a cyan/violet source code document with curly braces, right arrow, a cyan/violet ZIP package, right arrow, an orange/purple generic stylized fox embracing blue browser globe, right arrow, the IMG Hub broken-frame mountain logo. Clearly separated fully contained objects with simple consistent small connecting arrows. No words or numbers. No enclosing card, labels, background board, checkerboard, watermark or cast shadow on backdrop. Purpose: Firefox setup guide header. Crisp edges, restrained color, faithful visual language.

### wordmark-dark

Use case: precise-object-edit. Edit the provided standalone transparent IMG Hub wordmark for dark backgrounds. Change ONLY the three large text letters 'IMG' on the right from dark charcoal to solid snow white #F8FAFC. Keep 'Hub' cyan-violet gradient, left mountain-frame logo, all geometry, positions, typography, proportions, and transparent alpha background unchanged. Clean sharp edges; no backdrop, panel, shadow, glow or new text. Real transparent background.