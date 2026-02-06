/**
 * ConstellationMap Component
 * Main container for the constellation map view
 * Manages zoom/pan, star selection, and coordinates child components
 */

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import ConstellationCanvas from './ConstellationCanvas';
import ConstellationLines from './ConstellationLines';
import ZoomControls from './ZoomControls';
import EraFilterBar from './EraFilterBar';
import TelescopeSearch from './TelescopeSearch';
import PhilosopherPanel from './PhilosopherPanel';
import TimelineAxis from './TimelineAxis';
import { useZoomPan } from '../../hooks/useZoomPan';
import { useTimeFilter } from '../../hooks/useTimeFilter';
import { computeStarPositions } from '../../utils/constellationLayout';
import { buildConstellations } from '../../utils/connectionBuilder';
import timelineEvents from '../../pages/timelineEvents.json';
import philosophyConcepts from '../../pages/philosophyConcepts.json';
import '../../css/ConstellationMap.css';

// Default canvas size (will be responsive)
const DEFAULT_CANVAS_SIZE = { width: 1600, height: 900 };

/**
 * ConstellationMap - Main constellation view component
 */
const ConstellationMap = ({ onPhilosopherSelect, selectedPhilosopher }) => {
    // Canvas size state
    const [canvasSize, setCanvasSize] = useState(DEFAULT_CANVAS_SIZE);
    const containerRef = useRef(null);

    // Loading and entrance animation state
    const [isLoaded, setIsLoaded] = useState(false);
    const [showContent, setShowContent] = useState(false);

    // Interaction state
    const [hoveredStarId, setHoveredStarId] = useState(null);
    const [selectedStarId, setSelectedStarId] = useState(
        selectedPhilosopher?.id || null
    );
    const [panelData, setPanelData] = useState(null);
    const [isPanelOpen, setIsPanelOpen] = useState(false);

    // Zoom/pan state from custom hook
    const {
        containerRef: zoomContainerRef,
        transform,
        handlers,
        zoomIn,
        zoomOut,
        resetTransform,
        zoomToPoint,
        isAnimating
    } = useZoomPan({
        minZoom: 0.3,
        maxZoom: 4
    });

    // Era filter state
    const {
        selectedEras,
        toggleEra,
        clearEras,
        filteredPhilosophers,
        visibleCount,
        totalCount,
        hasActiveFilter,
        eraDefinitions,
        showMinor,
        toggleShowMinor
    } = useTimeFilter(timelineEvents);

    // Compute star positions based on canvas size
    const baseStarPositions = useMemo(() => {
        return computeStarPositions(timelineEvents, canvasSize);
    }, [canvasSize]);

    // Merge star positions with time filter opacity
    const starPositions = useMemo(() => {
        return baseStarPositions.map(pos => {
            const filtered = filteredPhilosophers.find(p => p.id === pos.id);
            return {
                ...pos,
                opacity: filtered?.opacity ?? 1,
                isVisible: filtered?.isVisible ?? true
            };
        });
    }, [baseStarPositions, filteredPhilosophers]);

    // Create concept map for showing connections
    const conceptsMap = useMemo(() => {
        return new Map(philosophyConcepts.map(c => [c.concept, c]));
    }, []);

    // Build constellation connections
    const connections = useMemo(() => {
        return buildConstellations(timelineEvents, philosophyConcepts);
    }, []);

    // Track hovered concept for highlighting connections
    const [hoveredConcept, setHoveredConcept] = useState(null);

    // Search state
    const [showSearch, setShowSearch] = useState(false);

    // Entrance animation
    useEffect(() => {
        const loadTimer = setTimeout(() => setIsLoaded(true), 100);
        const contentTimer = setTimeout(() => setShowContent(true), 400);
        return () => {
            clearTimeout(loadTimer);
            clearTimeout(contentTimer);
        };
    }, []);

    // Update canvas size on container resize
    useEffect(() => {
        const updateSize = () => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                // Use container dimensions but maintain minimum size
                const width = Math.max(rect.width, 800);
                const height = Math.max(rect.height, 500);
                setCanvasSize({ width, height });
            }
        };

        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    // Sync selected philosopher from prop
    useEffect(() => {
        if (selectedPhilosopher) {
            setSelectedStarId(selectedPhilosopher.id);
        }
    }, [selectedPhilosopher]);

    // Handle star hover
    const handleStarHover = useCallback((philosopher) => {
        setHoveredStarId(philosopher.id);
    }, []);

    // Handle star leave
    const handleStarLeave = useCallback(() => {
        setHoveredStarId(null);
    }, []);

    // Handle star click - open side panel
    const handleStarClick = useCallback((philosopher) => {
        setSelectedStarId(philosopher.id);
        setPanelData(philosopher);
        setIsPanelOpen(true);

        // Notify parent component
        if (onPhilosopherSelect) {
            onPhilosopherSelect(philosopher);
        }
    }, [onPhilosopherSelect]);

    // Handle canvas background click (deselect)
    const handleCanvasClick = useCallback(() => {
        setSelectedStarId(null);
        setIsPanelOpen(false);
    }, []);

    // Close panel
    const closePanel = useCallback(() => {
        setIsPanelOpen(false);
        // Delay clearing data for exit animation
        setTimeout(() => {
            if (!isPanelOpen) {
                setPanelData(null);
                setSelectedStarId(null);
            }
        }, 300);
    }, [isPanelOpen]);

    // Handle keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                if (showSearch) {
                    setShowSearch(false);
                } else if (isPanelOpen) {
                    closePanel();
                }
            }
            // / or Cmd+K for search
            if ((e.key === '/' || (e.key === 'k' && (e.metaKey || e.ctrlKey))) && !showSearch && !isPanelOpen) {
                e.preventDefault();
                setShowSearch(true);
            }
            // + for zoom in
            if ((e.key === '+' || e.key === '=') && !showSearch) {
                e.preventDefault();
                zoomIn();
            }
            // - for zoom out
            if (e.key === '-' && !showSearch) {
                e.preventDefault();
                zoomOut();
            }
            // 0 for reset
            if (e.key === '0' && !showSearch) {
                e.preventDefault();
                resetTransform();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [closePanel, zoomIn, zoomOut, resetTransform, showSearch, isPanelOpen]);

    // Handle search selection
    const handleSearchSelectPhilosopher = useCallback((philosopher) => {
        const position = baseStarPositions.find(p => p.id === philosopher.id);
        if (position) {
            zoomToPoint(position.x, position.y, 2);
            setTimeout(() => {
                setSelectedStarId(philosopher.id);
                setPanelData(philosopher);
                setIsPanelOpen(true);
            }, 600); // Wait for zoom animation
        }
    }, [baseStarPositions, zoomToPoint]);

    const handleSearchSelectConcept = useCallback((concept) => {
        setHoveredConcept(concept.concept);
        // Clear after a few seconds
        setTimeout(() => setHoveredConcept(null), 5000);
    }, []);

    // Navigate to connected philosopher from panel
    const handleNavigateToPhilosopher = useCallback((philosopherId) => {
        const philosopher = timelineEvents.find(p => p.id === philosopherId);
        const position = baseStarPositions.find(p => p.id === philosopherId);
        if (philosopher && position) {
            zoomToPoint(position.x, position.y, 2);
            setTimeout(() => {
                setSelectedStarId(philosopherId);
                setPanelData(philosopher);
            }, 400);
        }
    }, [baseStarPositions, zoomToPoint]);

    return (
        <div
            className={`constellation-map-container ${isAnimating ? 'animating' : ''} ${isLoaded ? 'loaded' : ''} ${showContent ? 'content-visible' : ''}`}
            ref={(el) => {
                containerRef.current = el;
                zoomContainerRef.current = el;
            }}
            {...handlers}
        >
            {/* Main Canvas */}
            <ConstellationCanvas
                canvasSize={canvasSize}
                transform={transform}
                positions={starPositions}
                hoveredStarId={hoveredStarId}
                selectedStarId={selectedStarId}
                selectedEras={selectedEras}
                onStarHover={handleStarHover}
                onStarLeave={handleStarLeave}
                onStarClick={handleStarClick}
                onCanvasClick={handleCanvasClick}
                isLoaded={showContent}
            >
                {/* Constellation Lines */}
                <ConstellationLines
                    connections={connections}
                    positions={starPositions}
                    highlightedPhilosopherId={selectedStarId || hoveredStarId}
                    hoveredConcept={hoveredConcept}
                />
            </ConstellationCanvas>

            {/* Timeline Axis */}
            <TimelineAxis canvasSize={canvasSize} transform={transform} />

            {/* Zoom Controls */}
            <ZoomControls
                onZoomIn={zoomIn}
                onZoomOut={zoomOut}
                onReset={resetTransform}
                currentZoom={transform.scale}
                className="constellation-zoom-controls"
            />

            {/* Philosopher Side Panel */}
            <PhilosopherPanel
                philosopher={panelData}
                isOpen={isPanelOpen}
                onClose={closePanel}
                conceptsMap={conceptsMap}
                hoveredConcept={hoveredConcept}
                onConceptHover={setHoveredConcept}
                onNavigateToPhilosopher={handleNavigateToPhilosopher}
                connections={connections}
                allPhilosophers={timelineEvents}
            />

            {/* Era Filter Bar */}
            <EraFilterBar
                selectedEras={selectedEras}
                onToggleEra={toggleEra}
                onClear={() => { clearEras(); if (!showMinor) toggleShowMinor(); }}
                visibleCount={visibleCount}
                totalCount={totalCount}
                hasActiveFilter={hasActiveFilter}
                eraDefinitions={eraDefinitions}
                showMinor={showMinor}
                onToggleShowMinor={toggleShowMinor}
            />

            {/* Search Button */}
            <button
                className="search-toggle-btn"
                onClick={() => setShowSearch(true)}
                aria-label="Open search (Press /)"
                title="Search (/ or Cmd+K)"
            >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35" />
                </svg>
            </button>

            {/* Telescope Search */}
            <TelescopeSearch
                philosophers={timelineEvents}
                concepts={philosophyConcepts}
                onSelectPhilosopher={handleSearchSelectPhilosopher}
                onSelectConcept={handleSearchSelectConcept}
                isOpen={showSearch}
                onClose={() => setShowSearch(false)}
            />

            {/* Instructions overlay (shows briefly on first load) */}
            <div className="constellation-instructions">
                <span>Scroll to zoom • Drag to pan • Click stars to explore • Press / to search</span>
            </div>
        </div>
    );
};

export default ConstellationMap;
