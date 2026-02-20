# Implementation Plan: 6 New Features for VQM Philosophy Explorer

## Pre-requisite: Fix existing bug
**PhilosopherPanel field name mismatch** — `conn.source`/`conn.target` should be `conn.from`/`conn.to` (lines 42-51 of PhilosopherPanel.jsx). This silently breaks the "Connected Thinkers" section.

---

## Implementation Order

### Phase 0 — Data Schema Enrichment (`timelineEvents.json`)
Add new fields to all 44 philosophers:
- `birth_year` (string, e.g. "c. 624 BC") — extracted from existing `fullYear`
- `death_year` (string, e.g. "c. 546 BC") — extracted from existing `fullYear`
- `influenced_by` (array of philosopher IDs, e.g. `["thales"]`)
- `quotes` (array of `{text, source}` objects, 1-3 per philosopher)

### Phase 1 — Activate Metro Map View (Feature #1)
**Goal**: Wire the already-built MetroMap as a 3rd view mode.

Files to modify:
1. **`ConstellationContext.jsx`** — Allow viewMode `'metro'` in addition to `'timeline'`/`'constellation'`
2. **`ViewToggle.jsx` + `ViewToggle.css`** — Add a third "Metro" button with a metro/train icon
3. **`App.jsx`** — Add MetroMap import and a third conditional branch in MainView
4. **`index.css`** — Add `.main-view[data-view="metro"]` hide rules for timeline/constellation-specific UI

### Phase 2 — Influence Arrows / Lineage (Feature #5)
**Goal**: Show directed teacher→student influence arrows in Constellation view.

Files to modify/create:
1. **`connectionBuilder.js`** — Add `buildInfluenceConnections(events)` that reads `influenced_by[]` and produces `{id, from, to, fromTitle, toTitle, type: 'influence'}` connections
2. **`ConstellationLines.jsx`** — Render influence connections as dashed lines with arrowhead markers (SVG `<marker>` + `marker-end`). Different color/style from concept connections.
3. **`ConstellationMap.jsx`** — Add toggle button to show/hide influence lines. Pass influence connections to ConstellationLines.
4. **`PhilosopherPanel.jsx`** — Fix `conn.source`/`conn.target` → `conn.from`/`conn.to`. Add "Influenced by" and "Influenced" sections showing teacher/student relationships.

### Phase 3 — Memorable Quotes (Feature #14)
**Goal**: Display philosopher quotes in PhilosopherPanel and as hover tooltips.

Files to modify:
1. **`PhilosopherPanel.jsx`** — Add "Notable Quotes" section after the summary blockquote. Render each quote with attribution.
2. **`PhilosopherPanel.css`** (in ConstellationMap styles) — Style quote cards with era-colored left border.
3. **`HomePage.jsx`** — Show a random quote in the timeline card tooltip on hover.

### Phase 4 — Lifetime Overlap Visualization (Feature #7)
**Goal**: Gantt-chart style horizontal bars showing philosopher lifetimes.

Files to create:
1. **`src/components/LifetimeOverlap/LifetimeOverlap.jsx`** — New component: horizontal bars on a year axis. Each philosopher = colored bar (birth→death). Highlight overlaps on hover. Filter by era. Click navigates to philosopher.
2. **`src/components/LifetimeOverlap/LifetimeOverlap.css`** — Styles for the Gantt chart.
3. **`yearParser.js`** — Add `parseBirthDeath(fullYear)` utility to extract birth/death from strings like "c. 624 – c. 546 BC".

Integration:
- Add as an expandable panel/drawer accessible from Timeline view (not a separate view mode, to keep ViewToggle at 3 buttons)
- Button in the era-selector area or a floating action button

### Phase 5 — Philosopher Compare Mode (Feature #6)
**Goal**: Select two philosophers and view side-by-side comparison.

Files to create:
1. **`src/components/ComparePanel/ComparePanel.jsx`** — Full-screen overlay with two columns. Shows: name, era, lifetime, concepts (with shared ones highlighted), quotes, influence relationships, Venn diagram of shared concepts.
2. **`src/components/ComparePanel/ComparePanel.css`** — Split layout with animated transitions.

Integration:
- **`ConstellationContext.jsx`** — Add `compareMode`, `comparePhilosophers[]` state
- **`PhilosopherPanel.jsx`** — Add "Compare" button that enters compare mode and sets first philosopher
- **`ConstellationMap.jsx`** / **`HomePage.jsx`** — When in compare mode, clicking a second philosopher opens ComparePanel
- **`StarNode.jsx`** — Visual indicator when in compare mode (pulsing outline on selectable stars)

### Phase 6 — Concept Evolution Timeline (Feature #8)
**Goal**: Concept-centric view showing how a concept evolved through philosophers over time.

Files to create:
1. **`src/components/ConceptEvolution/ConceptEvolution.jsx`** — Horizontal timeline per concept. Select a concept → shows all philosophers who contributed to it, in chronological order, with description excerpts. Connected by a flowing line.
2. **`src/components/ConceptEvolution/ConceptEvolution.css`** — Horizontal scroll layout with philosopher nodes along the concept's timeline.

Integration:
- Accessible from concept tags in PhilosopherPanel (click concept → "View Evolution")
- Also accessible from a concept browser/selector (new small component or dropdown)
- Opens as a modal/overlay, not a separate view mode

---

## Summary of all files touched

| File | Changes |
|------|---------|
| `timelineEvents.json` | Add birth_year, death_year, influenced_by, quotes to all 44 entries |
| `ConstellationContext.jsx` | Add 'metro' viewMode, compareMode state, comparePhilosophers state |
| `ViewToggle.jsx` + `.css` | 3-button toggle with Metro icon |
| `App.jsx` | Import MetroMap, add third view branch |
| `index.css` | Metro view hide rules |
| `connectionBuilder.js` | Add buildInfluenceConnections() |
| `ConstellationLines.jsx` | Render influence arrows with arrowheads |
| `ConstellationMap.jsx` | Influence toggle, compare mode handling |
| `PhilosopherPanel.jsx` | Fix from/to bug, add influences section, quotes section, compare button, concept evolution link |
| `HomePage.jsx` | Quote tooltip, compare mode handling, lifetime overlap button |
| `yearParser.js` | Add parseBirthDeath() |
| **NEW** `LifetimeOverlap/` | Gantt chart component + CSS |
| **NEW** `ComparePanel/` | Side-by-side comparison component + CSS |
| **NEW** `ConceptEvolution/` | Concept timeline component + CSS |

---

## Estimated scope
- ~15 files modified, ~6 new files created
- Data enrichment is the largest single effort (44 entries x 4 new fields)
- Each phase is independently testable
