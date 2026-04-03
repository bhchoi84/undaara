# Design System Document

## 1. Overview & Creative North Star
### Creative North Star: "The Modern Mystic"
This design system is a bridge between the ancient wisdom of the East and the sleek precision of modern digital interfaces. It rejects the "standard app" aesthetic in favor of a **High-End Editorial** experience that feels like opening a sacred, lacquered box. 

We break the "template" look by utilizing:
- **Intentional Asymmetry:** Layouts that breathe, moving away from rigid centered grids to evoke a sense of natural flow (Qi).
- **Tonal Depth:** Replacing harsh borders with layered surfaces that mimic the depth of deep-sea jade or twilight skies.
- **Cultural Synthesis:** Reinterpreting traditional Korean *Chang-ho* (lattice) patterns and spiritual iconography through a minimalist, vector-refined lens.

## 2. Colors
Our palette is rooted in the "Obangsaek" (traditional Korean colors) but filtered through a dark, premium digital spectrum.

### The Palette
- **Primary (`#d3bbff` / `#6f42c1`):** A celestial purple representing spiritual connection and the "third eye."
- **Secondary (`#e1c471` / `#d3b765`):** A refined gold reminiscent of traditional brassware and divine light.
- **Tertiary (`#8ad4c5`):** A misty Jade (Jadeite) used to represent healing and balance.
- **Neutral/Background (`#0c1321`):** A deep, midnight navy that provides a canvas for mystical elements to glow.

### Signature Rules
- **The "No-Line" Rule:** 1px solid borders are strictly prohibited for sectioning. Boundaries must be defined solely by color shifts (e.g., a `surface-container-low` card on a `surface` background).
- **Surface Hierarchy:** Treat the UI as physical layers. Use `surface-container-lowest` for background depths and `surface-container-highest` for active interactive elements.
- **The Glass & Gradient Rule:** For floating components like Tarot cards or modal overlays, use **Glassmorphism**. Apply a semi-transparent surface color with a `backdrop-blur` of 12px-20px to create an ethereal, "floating" effect.
- **CTA Soul:** Buttons should not be flat. Use a subtle linear gradient from `primary` to `primary_container` (at a 135-degree angle) to provide a polished, luminous finish.

## 3. Typography
Typography is our voice—authoritative yet whispering.

- **Display & Headline (`notoSerif`):** We use a high-contrast Serif to evoke the feel of traditional calligraphy and classical literature. It commands respect and sets a contemplative tone.
- **Body & Label (`manrope`):** A modern Sans-Serif chosen for its geometric clarity and exceptional readability at small scales, ensuring that complex fortunes are easy to digest.
- **Hierarchy as Identity:** 
    - Use `display-lg` for single-word thematic headers.
    - Use `headline-sm` with increased letter-spacing (0.05em) for a sophisticated, spacious feel.
    - Captions (`label-sm`) should be set in `secondary` (gold) to highlight metadata like "Lucky Color" or "Spirit Animal."

## 4. Elevation & Depth
Depth is achieved through **Tonal Layering** rather than structural lines, creating an atmosphere that feels expansive rather than boxed in.

- **The Layering Principle:** Stack `surface-container` tiers. For example, a chat bubble (`surface-container-high`) sits atop the main chat window (`surface-container-low`), creating natural separation.
- **Ambient Shadows:** Shadows are rarely used. When needed, use a shadow with a 32px blur, 4% opacity, tinted with the `primary` color. It should feel like an aura, not a drop shadow.
- **The "Ghost Border" Fallback:** If a border is required for accessibility, use the `outline_variant` at **15% opacity**. It should be barely perceptible, like a watermark.
- **Modern Lattice:** Use subtle background patterns inspired by Korean *Kkot-sal* (flower patterns) or *Gyeok-ja* (grids) at 3% opacity to add texture to large empty surfaces.

## 5. Components

### Buttons
- **Primary:** Gradient fill (`primary` to `primary_container`), roundedness `full`. No border.
- **Secondary:** Transparent background with a `secondary` (gold) Ghost Border (20% opacity).
- **Icon Buttons:** Use a circular `surface-container-highest` background with a subtle Jade (`tertiary`) icon.

### Cards & Lists
- **Rule:** Forbid divider lines. Use `spacing-8` (2rem) of vertical white space or a shift from `surface-dim` to `surface-bright` to distinguish items.
- **Tarot Cards:** Use a `surface-container-highest` base with a "Glass" overlay and a thin gold (`secondary`) inner glow.

### Spiritual Emoticons (The "Sinsun" Characters)
- **Concept:** Characters based on traditional spirits (Dokkaebi, Haetae, Samjok-o) but rendered in a "Chibi-Chic" style.
- **Style:** Clean vector lines, oversized heads, glowing eyes using the `tertiary` (Jade) color, and wearing modernized Hanbok elements. They should appear in chat bubbles to guide the user's journey.

### Input Fields
- **State:** Active inputs use a `secondary` (gold) Ghost Border.
- **Vibe:** Bottom-aligned labels that drift upward on focus, mimicking the rising of incense smoke.

## 6. Do's and Don'ts

### Do
- **Do** use generous white space (referencing the Korean concept of *Maek*).
- **Do** use the `secondary` (gold) color sparingly—only for moments of "revelation" or CTA highlights.
- **Do** treat every screen as a composition; overlap images and text to create a bespoke, editorial feel.

### Don't
- **Don't** use 100% black. The deepest dark should be our `surface` navy (`#0c1321`).
- **Don't** use standard Material Design "shadowed" cards. Stick to tonal background shifts.
- **Don't** use vibrant, neon colors. Every hue must feel "weathered" or "celestial."
- **Don't** use sharp 90-degree corners. Refer to the Roundedness Scale (`md`: 0.75rem) to maintain a soft, welcoming energy.