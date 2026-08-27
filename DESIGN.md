---
name: AeroPulse
description: A flight-test telemetry workbench for engine prognostics.
colors:
  cobalt-signal: "oklch(54% 0.2 256)"
  cobalt-deep: "oklch(47% 0.19 256)"
  cobalt-wash: "oklch(89% 0.055 256)"
  cool-paper: "oklch(98.5% 0.004 250)"
  raised-paper: "oklch(96.5% 0.008 250)"
  pressed-paper: "oklch(93.5% 0.011 250)"
  telemetry-rule: "oklch(86% 0.013 250)"
  cool-muted: "oklch(38% 0.018 255)"
  graphite-ink: "oklch(24% 0.02 258)"
  instrument-graphite: "oklch(17% 0.018 258)"
  dark-surface-text: "oklch(94% 0.009 250)"
  critical-red: "oklch(52% 0.18 25)"
  watch-amber: "oklch(56% 0.13 72)"
  stable-green: "oklch(43% 0.04 170)"
typography:
  display:
    fontFamily: "Space Grotesk Variable, sans-serif"
    fontSize: "2.4rem"
    fontWeight: 700
    lineHeight: 1.08
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Space Grotesk Variable, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.55
  data:
    fontFamily: "JetBrains Mono, monospace"
    fontSize: "0.82rem"
    fontWeight: 500
    lineHeight: 1.2
rounded:
  instrument: "3px"
  control: "6px"
  panel: "10px"
spacing:
  2xs: "4px"
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "40px"
  2xl: "64px"
components:
  button-primary:
    backgroundColor: "{colors.cobalt-signal}"
    textColor: "{colors.cool-paper}"
    rounded: "{rounded.control}"
    padding: "12px 16px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.cobalt-deep}"
    textColor: "{colors.cool-paper}"
  panel-dark:
    backgroundColor: "{colors.instrument-graphite}"
    textColor: "{colors.dark-surface-text}"
    rounded: "{rounded.control}"
    padding: "24px"
  filter-selected:
    backgroundColor: "{colors.cool-paper}"
    textColor: "{colors.graphite-ink}"
    rounded: "{rounded.instrument}"
    height: "44px"
---

# Design System: AeroPulse

## Overview

**Creative North Star: “The Flight-Test Ledger”**

AeroPulse looks like a clean engineering record that has become interactive. Cool instrument paper carries most content; a graphite rail and one graphite focal panel establish the operational frame. Fine rules, measured typography, and tabular figures make dense telemetry legible without turning every fact into a card.

The visual world is technical, austere, and calm. Cobalt appears only where the operator can act or where a selected state must be unmistakable. Risk colors remain semantic and always travel with text or geometry.

**Key Characteristics:**

- Cool engineered paper with one dark instrument band.
- A left-biased workbench that becomes bottom navigation on small screens.
- Hairline dividers and spec-sheet rows instead of nested containers.
- Crisp geometric SVGs grounded in the engine domain.
- Data faces for measurements; interface faces for language.

## Colors

The palette is a cobalt-tinted neutral system with one saturated interaction signal and restrained semantic risk colors.

### Primary

- **Cobalt Signal:** The active-navigation, selected-control, chart-line, and primary-action color. Its footprint remains small enough to behave as a signal.
- **Cobalt Deep:** The pressed and hover treatment for the primary action.
- **Cobalt Wash:** The selected-row and uncertainty-band surface.

### Secondary

- **Critical Red:** Service-now status and the engine hotspot under critical conditions.
- **Watch Amber:** Close-observation status.
- **Stable Green:** In-range status and the local-ready indicator.

### Neutral

- **Cool Paper:** The application field and light component surface.
- **Raised Paper:** Toolbars, skeletons, and subtle hover states.
- **Telemetry Rule:** Dividers, table lines, and quiet component boundaries.
- **Cool Muted:** Supporting copy and labels on light surfaces.
- **Graphite Ink:** Primary copy and engineering linework.
- **Instrument Graphite:** Navigation and the most urgent operational readout.
- **Dark Surface Text:** Primary copy on graphite surfaces.

### Named Rules

**The Signal Footprint Rule.** Cobalt marks selection, interaction, or a data series; it never becomes ambient decoration.

**The Risk Redundancy Rule.** Critical, watch, and stable colors always appear with a written status, icon, or marker shape.

## Typography

**Display Font:** Space Grotesk Variable (with sans-serif fallback)  
**Body Font:** Space Grotesk Variable (with sans-serif fallback)  
**Label/Mono Font:** JetBrains Mono (with monospace fallback)

**Character:** Space Grotesk keeps the application compact and engineered without making every label look like code. JetBrains Mono is reserved for measurements, engine identifiers, and aligned numeric evidence.

### Hierarchy

- **Display** (700, 2.4rem, 1.08): view titles and the primary page identity.
- **Headline** (700, 1.375rem, 1.18): analysis and ledger sections.
- **Title** (700, 1.125rem): application identity and compact component headings.
- **Body** (400, 1rem, 1.55): explanatory text with a maximum measure of 68 characters.
- **Label** (500, 0.70–0.82rem): metadata, sensor keys, IDs, and numeric readouts.

### Named Rules

**The Measurement Register Rule.** Use the mono face for values and machine identifiers, never as a costume for ordinary interface copy.

## Layout

The desktop shell reserves a 5.75rem graphite rail and gives the remaining width to the workbench. Content uses asymmetric grids: the command schematic is wider than the urgent panel, and model comparison is wider than feature importance. Major sections are separated by rules and intentionally varied spacing from the shared 4-point scale.

Below 60rem, the rail becomes a fixed bottom navigation and operational regions stack. At 40rem, the fleet ledger becomes two card-like records per row; below it each engine is one scan-friendly record. Image-bearing and chart tracks always use `minmax(0, 1fr)`, and the document clips accidental horizontal overflow.

## Elevation & Depth

The system is flat by default. Depth comes from tonal shifts and dark/light contrast. Whisper shadows appear only on selected filters and other raised controls; the graphite panel has no glow.

### Shadow Vocabulary

- **Whisper:** A compact 2px/8px ambient shadow for a selected control on paper.
- **Raised:** A restrained 12px/32px shadow reserved for an overlay or truly elevated surface.

### Named Rules

**The Flat Instrument Rule.** Use a border or a tonal shift first; shadow is state feedback, not page structure.

## Shapes

Corners remain tight: 3px for instrument details, 6px for controls and operational panels, and 10px only for larger soft loading surfaces. Dividers are 1px. Pills are limited to circular markers and do not become the default control shape. The turbofan cutaway is the recurring signature geometry.

## Components

### Buttons

- **Shape:** Tight control corners (6px) and a 44px minimum target.
- **Primary:** Cobalt signal on cool light text, with medium weight and a one-line label.
- **Hover / Focus:** Deepen the fill on fine-pointer hover; use an immediate 2px cobalt focus ring; press by one pixel.
- **Secondary:** Cool paper with a telemetry-rule border and graphite text.
- **Disabled:** Native disabled state plus reduced opacity, muted text, and a blocked cursor.

### Chips

- **Style:** Filters live on raised paper and use square-leaning 3px corners.
- **State:** Selection becomes cool paper with a whisper shadow; sensor selection uses a cobalt border and text.

### Cards / Containers

- **Corner Style:** Operational panels use 6px corners.
- **Background:** Most information stays directly on paper; only urgent or boundary content earns a filled panel.
- **Shadow Strategy:** Flat by default.
- **Border:** 1px telemetry rules organize rows and lightweight records.
- **Internal Padding:** 16px for records, 24–40px for focal panels.

### Inputs / Fields

- **Style:** Native range control on a 44px target with cobalt accent color.
- **Focus:** The shared immediate focus-visible outline.
- **Error / Disabled:** Text and semantic state accompany color; disabled controls keep their geometry.

### Navigation

The graphite side rail uses Lucide line icons and short labels. The selected destination gains a raised graphite surface; on small screens the same four destinations become a fixed bottom bar. Navigation labels remain single-line at every breakpoint.

### Engine Cutaway

The signature component is a semantic SVG: cool shell, graphite stages, cobalt flow line, and a risk-colored hotspot. Positioning and rotation are separated into nested SVG groups so the fan rotates without leaving its physical axis. Reduced-motion mode collapses the animation.

## Do's and Don'ts

### Do:

- **Do** lead a view with the decision it supports and the measured evidence behind it.
- **Do** use hairline rules, asymmetric columns, and negative space before adding containers.
- **Do** keep numerical columns tabular and align units consistently.
- **Do** preserve status wording wherever a risk color appears.
- **Do** keep all colors and font families behind root tokens.

### Don't:

- **Don't** turn the workbench into a grid of equal metric cards.
- **Don't** use gradients, glass effects, glows, or oversized rounded pills.
- **Don't** fill large regions with cobalt; the accent’s rarity is functional.
- **Don't** mix icon families or replace icons with emoji glyphs.
- **Don't** add motion that does not clarify state or physical operation.
