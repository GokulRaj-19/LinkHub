# LinkHub UI Design Guidelines

## 1. Design System & CSS Variables Architecture
LinkHub dynamically selects styles via `[data-theme]` attributes set directly on the document root element:

### The Four Themes:
1. **Sketch (Default)**
   - Canvas: `#FFFFFF`
   - Text: `#000000`
   - Action: `#000000` black buttons with white text
   - Accent: 10px repeating black/dark-grey/light-grey/white striped bar
   - Typography: Google Fonts `Architects Daughter`
   - Card Styling: `1.5px solid #000000` with comic outline shadow (`2px 2px 0px #000000`)
   - Category / Note Styling: Dashed outline borders (`1.5px dashed #000000`)

2. **Brand Light**
   - Canvas: `#F3F5FC`, Surface: `#FFFFFF`
   - Text: `#14183A`
   - Action: `#7048E0` violet pill buttons
   - Accent: Violet to blue to cyan gradient stripe (`#7048E0`, `#0070B8`, `#28A8E0`)
   - Typography: `Figtree` and `Sora`

3. **Dark**
   - Canvas: `#0E1130`, Surface: `#181C42`
   - Text: `#ECEEFF`
   - Action: `#8B6CF0`
   - Accent: Gradient stripe, navy cards with `#4A52A0` borders
   - Typography: `Figtree` and `Sora`

4. **High Contrast**
   - Canvas: `#000000`, Surface: `#000000`
   - Text: `#FFFFFF`
   - Action: `#FFE600` yellow buttons with `#000000` text
   - Accent: Yellow and black hazard diagonal stripe
   - Card Styling: `2px solid #FFFFFF` on all cards

## 2. Responsive Breakpoint Rules
- **Desktop (> 900px):** Fixed left sidebar (`var(--sidebar-width)` = `240px`)
- **Mobile (≤ 900px down to 390px):** Left sidebar is hidden, replaced with fixed bottom tab bar with 44px minimum tap targets.
