# VQM Philosophy Explorer - Map of Thought

An interactive, visual knowledge website dedicated to mapping the history of human thought.

**[Live Demo](https://revoloero.github.io/vqm-philosophy-explorer/)**

## Overview

This platform presents the history of philosophical thought as an explorable journey through time. Users can navigate through philosophical schools, thinkers, and concepts in a dynamic and intuitive way — like Google Maps for human thought.

## Features

### Dual View System

Toggle between two powerful visualization modes:

#### Timeline View
- **Chronological Navigation**: Explore philosophy from Ancient Greece (600 BCE) to Contemporary Thought
- **Visual Vortex Path**: An animated SVG path connects timeline events with a moving progress dot
- **Focus-Based Interaction**: Timeline items blur and scale based on scroll position
- **Era Quick-Jump**: Navigate instantly to any historical era

#### Constellation Map View (New!)
- **Zoomable Star Map**: Philosophers rendered as stars with era-specific colors
- **Constellation Lines**: Visual connections between philosophers sharing concepts
- **Time Slider**: Filter visible philosophers by historical period
- **Telescope Search**: Press `/` to search and zoom to any philosopher or concept
- **Smooth Zoom/Pan**: Mouse wheel zoom, drag to pan, pinch gestures on mobile
- **Concept Highlighting**: Hover over concepts to see all related connections glow

### Philosophical Content
- **14 Major Philosophers**: From Thales of Miletus to Simone de Beauvoir
- **32 Philosophical Concepts**: Covering metaphysics, epistemology, ethics, aesthetics, logic, and political philosophy
- **Mini-Events**: Related developments nested within major timeline events
- **Era Organization**: Events grouped by historical periods:
  - Ancient & Classical Thought (Gold)
  - Medieval & Renaissance Philosophy (Blue)
  - The Age of Reason & Enlightenment (Orange)
  - 19th Century Philosophy (Red)
  - Contemporary Thought (Purple)

### Interactive Elements
- **Philosopher Modals**: Click stars or timeline items for detailed information
- **Concept Tags**: Hover for quick definitions, click for in-depth explanations
- **Keyboard Navigation**: Full accessibility support (`/` search, `Esc` close, `+/-` zoom)
- **Touch Gestures**: Pinch zoom, swipe navigation on mobile devices

## Tech Stack

- **React 19** - Modern React with latest hooks and features
- **React Router DOM 7** - Client-side routing
- **Vite 7** - Fast build tool and development server
- **CSS3** - Custom properties, glassmorphism, SVG animations
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
├── App.jsx                     # Main app with view routing
├── index.css                   # Global styles
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
│   ├── HomePage.css               # Timeline styles
│   └── ConstellationMap.css       # Constellation styles
└── pages/
    ├── HomePage.jsx               # Timeline view component
    ├── timelineEvents.json        # Philosopher data
    └── philosophyConcepts.json    # Concept definitions
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `/` | Open telescope search |
| `Esc` | Close modal/search |
| `+` or `=` | Zoom in |
| `-` | Zoom out |
| `0` | Reset zoom |

## Roadmap

### Completed
- [x] Interactive timeline with scroll-based focus
- [x] Event and concept modal system
- [x] SVG vortex path visualization
- [x] Responsive design & keyboard accessibility
- [x] **Constellation Map view** with zoomable star visualization
- [x] **Time slider** for temporal filtering
- [x] **Telescope search** with zoom-to animation
- [x] **Constellation lines** showing concept connections
- [x] **View toggle** between Timeline and Constellation

### Planned
- [ ] Compare mode (side-by-side school comparisons)
- [ ] Influence arrows showing direct philosophical lineage
- [ ] Expanded philosopher database (50+ thinkers)
- [ ] Mini-map for constellation navigation

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
