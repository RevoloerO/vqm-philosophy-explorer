# VQM Philosophy Explorer - Map of Thought

An interactive, visual knowledge website dedicated to mapping the history of human thought.

**[Live Demo](https://revoloero.github.io/vqm-philosophy-explorer/)**

## Overview

This platform presents the history of philosophical thought as an explorable journey through time. Users can navigate through philosophical schools, thinkers, and concepts in a dynamic and intuitive way — like Google Maps for human thought.

## Features

### Dual View System

Toggle between two powerful visualization modes:

#### Timeline View (Flow of Thought)
- **Chronological Navigation**: Explore philosophy from Ancient Greece (600 BCE) to Contemporary Thought
- **River of Ideas**: An animated SVG flow path with gradient colors and floating particles connects timeline events
- **Two-Column Layout**: Year column with flow nodes alongside content cards for better visual hierarchy
- **Focus-Based Interaction**: Timeline items smoothly scale, blur, and transform based on scroll position
- **Era Quick-Jump**: Navigate instantly to any historical era with numbered navigation pills
- **Reading Progress**: Visual progress bar showing your journey through philosophical history
- **View Modes**: Toggle between Flow (expanded) and Compact view modes
- **Concept Filtering**: Click concept tags to filter timeline by philosophical themes
- **Page Transitions**: Smooth fade and scale animations when switching views

#### Constellation Map View
- **Zoomable Star Map**: Philosophers rendered as stars with era-specific colors
- **Constellation Lines**: Visual connections between philosophers sharing concepts
- **Time Slider**: Filter visible philosophers by historical period
- **Telescope Search**: Press `/` to search and zoom to any philosopher or concept
- **Smooth Zoom/Pan**: Mouse wheel zoom, drag to pan, pinch gestures on mobile
- **Concept Highlighting**: Hover over concepts to see all related connections glow

### Philosophical Content
- **44 Philosophers**: Comprehensive coverage from Thales of Miletus to Jacques Derrida
- **38 Philosophical Concepts**: Covering metaphysics, epistemology, ethics, aesthetics, logic, political philosophy, and more
- **Mini-Events**: Related developments nested within major timeline events
- **Era Organization**: Events grouped by historical periods with unique color themes:
  - Ancient & Classical Thought (Gold/Amber)
  - Medieval & Renaissance Philosophy (Blue)
  - The Age of Reason & Enlightenment (Orange/Yellow)
  - 19th Century Philosophy (Red)
  - Contemporary Thought (Purple)

### Interactive Elements
- **Philosopher Modals**: Click "Explore this moment" or stars for detailed information (rendered via React Portal for proper layering)
- **Concept Tags**: Hover for quick definitions with dynamically positioned tooltips, click for filtering or detailed panels
- **Concept Slide Panel**: In-depth concept explanations with related philosophers
- **Keyboard Navigation**: Full accessibility support (`/` search, `Esc` close, `+/-` zoom)
- **Touch Gestures**: Pinch zoom, swipe navigation on mobile devices

## Philosophers Included

### Ancient & Classical Thought
- Thales of Miletus, Pythagoras, Heraclitus, Parmenides, Socrates, Democritus, Plato, Aristotle, Epicurus, Zeno of Citium, Marcus Aurelius

### Medieval & Renaissance Philosophy
- Augustine of Hippo, Boethius, Al-Farabi, Avicenna, Maimonides, Thomas Aquinas, William of Ockham

### The Age of Reason & Enlightenment
- Rene Descartes, Baruch Spinoza, John Locke, George Berkeley, Gottfried Wilhelm Leibniz, David Hume, Jean-Jacques Rousseau, Voltaire, Immanuel Kant

### 19th Century Philosophy
- G.W.F. Hegel, Arthur Schopenhauer, Soren Kierkegaard, Karl Marx, John Stuart Mill, Charles Sanders Peirce, Friedrich Nietzsche, William James

### Contemporary Thought
- Ludwig Wittgenstein, Martin Heidegger, Albert Camus, Jean-Paul Sartre, Simone de Beauvoir, Hannah Arendt, Michel Foucault, Jacques Derrida, John Rawls

## Tech Stack

- **React 19** - Modern React with latest hooks (useState, useRef, useCallback, useMemo, createPortal)
- **React Router DOM 7** - Client-side routing
- **Vite 7** - Fast build tool and development server
- **CSS3** - Custom properties, glassmorphism, SVG animations, backdrop-filter
- **GitHub Pages** - Static site hosting

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/revoloero/vqm-philosophy-explorer.git

# Navigate to project directory
cd vqm-philosophy-explorer

# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run deploy` | Deploy to GitHub Pages |
| `npm run lint` | Run ESLint for code quality |

## Project Structure

```
src/
├── main.jsx                    # React entry point
├── App.jsx                     # Main app with view routing & transitions
├── index.css                   # Global styles & page transitions
├── context/
│   └── ConstellationContext.jsx  # Shared state provider
├── components/
│   ├── ConstellationMap/
│   │   ├── ConstellationMap.jsx   # Main constellation view
│   │   ├── ConstellationCanvas.jsx # SVG rendering layer
│   │   ├── ConstellationLines.jsx  # Concept connection lines
│   │   ├── StarNode.jsx            # Philosopher star component
│   │   ├── TimeSlider.jsx          # Time range filter
│   │   ├── TelescopeSearch.jsx     # Search with zoom-to
│   │   └── ZoomControls.jsx        # Zoom buttons
│   └── shared/
│       └── ViewToggle.jsx          # Timeline/Constellation switcher
├── hooks/
│   ├── useZoomPan.js              # Zoom/pan state management
│   └── useTimeFilter.js           # Time-based filtering
├── utils/
│   ├── yearParser.js              # Parse historical dates
│   ├── constellationLayout.js     # Star positioning algorithm
│   └── connectionBuilder.js       # Build concept connections
├── css/
│   ├── HomePage.css               # Timeline styles (era colors, animations)
│   └── ConstellationMap.css       # Constellation styles
└── pages/
    ├── HomePage.jsx               # Timeline view component
    ├── timelineEvents.json        # 44 philosophers with metadata
    └── philosophyConcepts.json    # 38 concept definitions
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `/` | Open telescope search |
| `Esc` | Close modal/search |
| `+` or `=` | Zoom in |
| `-` | Zoom out |
| `0` | Reset zoom |

## Recent Updates

### UI/UX Improvements
- Redesigned timeline flow line as a "River of Ideas" with gradient colors and animated particles
- Two-column timeline layout with dedicated year column and flow nodes
- Enhanced "Explore this moment" button with hover animations and era-specific colors
- Fixed tooltip positioning using dynamic calculations to prevent clipping
- Modal rendering via React Portal for proper z-index handling
- Improved hover states on focused timeline cards
- Page transition animations for smooth view switching

### Content Expansion
- Added 10 new philosophers including Parmenides, Democritus, Marcus Aurelius, Leibniz, Berkeley, Peirce, William James, Hannah Arendt, John Rawls, and Jacques Derrida
- Added 7 new philosophical concepts: Monism, Materialism, Theodicy, Pragmatism, Philosophy of Mind, and Semiotics

## Roadmap

### Completed
- [x] Interactive timeline with scroll-based focus
- [x] Event and concept modal system
- [x] SVG flow path visualization with animated particles
- [x] Responsive design & keyboard accessibility
- [x] Constellation Map view with zoomable star visualization
- [x] Time slider for temporal filtering
- [x] Telescope search with zoom-to animation
- [x] Constellation lines showing concept connections
- [x] View toggle between Timeline and Constellation
- [x] Two-column timeline layout with flow nodes
- [x] Era-specific theming and colors
- [x] Concept filtering system
- [x] Page transition animations

### Planned
- [ ] Compare mode (side-by-side school comparisons)
- [ ] Influence arrows showing direct philosophical lineage
- [ ] Mini-map for constellation navigation
- [ ] Expanded philosopher database (75+ thinkers)

### Stretch Goals
- [ ] AI Companion for natural language questions
- [ ] Interactive philosophical debates simulation
- [ ] 3D constellation with Three.js
- [ ] Community contributions system

## Contributing

Contributions are welcome! Whether it's adding philosophical content, improving the UI, or fixing bugs:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

**Vuong Quyen Mai** - [GitHub](https://github.com/revoloero)

---

*Explore the history of human thought, one idea at a time.*
