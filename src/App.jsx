import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ErrorBoundary from './components/ErrorBoundary';
import { ConstellationProvider, useConstellationContext } from './context/ConstellationContext';
import ConstellationMap from './components/ConstellationMap';
import ViewToggle from './components/shared/ViewToggle';

/**
 * MainView - Handles the toggle between Timeline and Constellation views
 */
function MainView() {
  const {
    viewMode,
    setViewMode,
    isTransitioning,
    selectedPhilosopher,
    setSelectedPhilosopher
  } = useConstellationContext();

  return (
    <div className={`main-view ${isTransitioning ? 'transitioning' : ''}`} data-view={viewMode}>
      {/* Transition Overlay */}
      <div className="view-transition-overlay" />

      {/* View Toggle Button */}
      <ViewToggle
        viewMode={viewMode}
        onToggle={setViewMode}
        isTransitioning={isTransitioning}
      />

      {/* View Container */}
      <div className="view-container">
        {viewMode === 'timeline' ? (
          <HomePage
            selectedPhilosopher={selectedPhilosopher}
            onPhilosopherSelect={setSelectedPhilosopher}
          />
        ) : (
          <ConstellationMap
            selectedPhilosopher={selectedPhilosopher}
            onPhilosopherSelect={setSelectedPhilosopher}
          />
        )}
      </div>
    </div>
  );
}

/**
 * App - Main application component
 */
function App() {
  return (
    <ErrorBoundary>
      <ConstellationProvider>
        <Routes>
          <Route path="/" element={<MainView />} />
          <Route path="/vqm-philosophy-explorer/" element={<MainView />} />
        </Routes>
      </ConstellationProvider>
    </ErrorBoundary>
  );
}

export default App;
