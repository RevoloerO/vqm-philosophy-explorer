/**
 * ConstellationMap Component
 * Main container for the constellation map view
 * Manages zoom/pan, star selection, and coordinates child components
 */

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import ConstellationCanvas from './ConstellationCanvas';
import ConstellationLines from './ConstellationLines';
import ZoomControls from './ZoomControls';
import TimeSlider from './TimeSlider';
import TelescopeSearch from './TelescopeSearch';
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

    // Interaction state
    const [hoveredStarId, setHoveredStarId] = useState(null);
    const [selectedStarId, setSelectedStarId] = useState(
        selectedPhilosopher?.id || null
    );
    const [showModal, setShowModal] = useState(false);
    const [modalData, setModalData] = useState(null);

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

    // Time filter state
    const {
        timeRange,
        setTimeRange,
        resetTimeRange,
        filteredPhilosophers,
        visibleCount,
        totalCount,
        currentEras
    } = useTimeFilter(timelineEvents);

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

    // Handle star click
    const handleStarClick = useCallback((philosopher) => {
        setSelectedStarId(philosopher.id);
        setModalData(philosopher);
        setShowModal(true);

        // Notify parent component
        if (onPhilosopherSelect) {
            onPhilosopherSelect(philosopher);
        }
    }, [onPhilosopherSelect]);

    // Handle canvas background click (deselect)
    const handleCanvasClick = useCallback(() => {
        setSelectedStarId(null);
        setShowModal(false);
        setModalData(null);
    }, []);

    // Close modal
    const closeModal = useCallback(() => {
        setShowModal(false);
        setModalData(null);
    }, []);

    // Handle keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                if (showSearch) {
                    setShowSearch(false);
                } else {
                    closeModal();
                    setSelectedStarId(null);
                }
            }
            // / for search
            if (e.key === '/' && !showSearch && !showModal) {
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
    }, [closeModal, zoomIn, zoomOut, resetTransform, showSearch, showModal]);

    // Zoom to selected star when clicking from external source
    const handleZoomToStar = useCallback((philosopherId) => {
        const position = starPositions.find(p => p.id === philosopherId);
        if (position) {
            zoomToPoint(position.x, position.y, 2);
            setSelectedStarId(philosopherId);
        }
    }, [starPositions, zoomToPoint]);

    // Handle search selection
    const handleSearchSelectPhilosopher = useCallback((philosopher) => {
        const position = baseStarPositions.find(p => p.id === philosopher.id);
        if (position) {
            zoomToPoint(position.x, position.y, 2);
            setTimeout(() => {
                setSelectedStarId(philosopher.id);
                setModalData(philosopher);
                setShowModal(true);
            }, 600); // Wait for zoom animation
        }
    }, [baseStarPositions, zoomToPoint]);

    const handleSearchSelectConcept = useCallback((concept) => {
        setHoveredConcept(concept.concept);
        // Clear after a few seconds
        setTimeout(() => setHoveredConcept(null), 5000);
    }, []);

    return (
        <div
            className={`constellation-map-container ${isAnimating ? 'animating' : ''}`}
            ref={(el) => {
                containerRef.current = el;
                zoomContainerRef.current = el;
            }}
            {...handlers}
            style={{ cursor: 'grab' }}
        >
            {/* Main Canvas */}
            <ConstellationCanvas
                canvasSize={canvasSize}
                transform={transform}
                positions={starPositions}
                hoveredStarId={hoveredStarId}
                selectedStarId={selectedStarId}
                onStarHover={handleStarHover}
                onStarLeave={handleStarLeave}
                onStarClick={handleStarClick}
                onCanvasClick={handleCanvasClick}
            >
                {/* Constellation Lines */}
                <ConstellationLines
                    connections={connections}
                    positions={starPositions}
                    highlightedPhilosopherId={selectedStarId || hoveredStarId}
                    hoveredConcept={hoveredConcept}
                />
            </ConstellationCanvas>

            {/* Zoom Controls */}
            <ZoomControls
                onZoomIn={zoomIn}
                onZoomOut={zoomOut}
                onReset={resetTransform}
                currentZoom={transform.scale}
                className="constellation-zoom-controls"
            />

            {/* Philosopher Modal */}
            {showModal && modalData && (
                <div className="constellation-modal-overlay" onClick={closeModal}>
                    <div
                        className="constellation-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="constellation-modal-title">{modalData.title}</h2>
                        <p className="constellation-modal-year">{modalData.fullYear || modalData.year}</p>
                        <p className="constellation-modal-description">{modalData.description}</p>

                        {/* Concepts */}
                        <div className="constellation-modal-concepts">
                            {modalData.concepts?.map(concept => {
                                const conceptData = conceptsMap.get(concept);
                                return (
                                    <span
                                        key={concept}
                                        className={`concept-tag ${hoveredConcept === concept ? 'highlighted' : ''}`}
                                        title={conceptData?.simple}
                                        onMouseEnter={() => setHoveredConcept(concept)}
                                        onMouseLeave={() => setHoveredConcept(null)}
                                    >
                                        #{concept}
                                    </span>
                                );
                            })}
                        </div>

                        {/* Mini Events */}
                        {modalData.miniEvents && modalData.miniEvents.length > 0 && (
                            <div className="constellation-modal-mini-events">
                                <h4>Related Developments</h4>
                                {modalData.miniEvents.map(mini => (
                                    <div key={mini.id} className="mini-event">
                                        <h5>{mini.title}</h5>
                                        <p>{mini.summary}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        <button className="constellation-modal-close" onClick={closeModal}>
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* Time Slider */}
            <TimeSlider
                timeRange={timeRange}
                onTimeRangeChange={setTimeRange}
                onReset={resetTimeRange}
                currentEras={currentEras}
                visibleCount={visibleCount}
                totalCount={totalCount}
            />

            {/* Search Button */}
            <button
                className="search-toggle-btn"
                onClick={() => setShowSearch(true)}
                aria-label="Open search (Press /)"
                title="Search (Press /)"
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
