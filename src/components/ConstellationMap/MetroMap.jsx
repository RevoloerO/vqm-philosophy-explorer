/**
 * MetroMap Component
 * A transit-map inspired visualization of philosophical history
 * Concept "lines" flow horizontally, philosophers are "stations"
 */

import React, { memo, useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { computeMetroLayout, METRO_LINES } from '../../utils/metroLayout';
import PhilosopherPanel from './PhilosopherPanel';
import { buildConstellations } from '../../utils/connectionBuilder';
import timelineEvents from '../../pages/timelineEvents.json';
import philosophyConcepts from '../../pages/philosophyConcepts.json';
import '../../css/MetroMap.css';

/**
 * Metro Line - Renders a single concept "route"
 */
const MetroLine = memo(({ lineData, isHighlighted, isHovered, onHover, onLeave }) => {
    if (!lineData.path) return null;

    const opacity = isHighlighted ? 1 : isHovered ? 0.9 : 0.6;
    const strokeWidth = isHighlighted ? 8 : isHovered ? 6 : 4;

    return (
        <g className={`metro-line ${isHighlighted ? 'highlighted' : ''}`}>
            {/* Glow effect */}
            {(isHighlighted || isHovered) && (
                <path
                    d={lineData.path}
                    fill="none"
                    stroke={lineData.color}
                    strokeWidth={strokeWidth + 8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity={0.2}
                    style={{ filter: 'blur(8px)' }}
                />
            )}

            {/* Main line */}
            <path
                d={lineData.path}
                fill="none"
                stroke={lineData.color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={opacity}
                className="metro-line-path"
                onMouseEnter={() => onHover?.(lineData.concept)}
                onMouseLeave={() => onLeave?.()}
                style={{ cursor: 'pointer' }}
            />

            {/* Line label at start */}
            <g className="metro-line-label" transform={`translate(10, ${lineData.baseY})`}>
                <rect
                    x={0}
                    y={-12}
                    width={100}
                    height={24}
                    rx={12}
                    fill={lineData.color}
                    opacity={0.9}
                />
                <text
                    x={50}
                    y={5}
                    textAnchor="middle"
                    fill="white"
                    fontSize="11"
                    fontWeight="600"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                >
                    {lineData.label.replace(' Line', '')}
                </text>
            </g>
        </g>
    );
});

MetroLine.displayName = 'MetroLine';

/**
 * Metro Station - Renders a philosopher as a station marker
 */
const MetroStation = memo(({
    station,
    isSelected,
    isHovered,
    onHover,
    onLeave,
    onClick
}) => {
    const { x, y, philosopher, isInterchange, primaryLine, type } = station;
    const lineConfig = METRO_LINES[primaryLine];
    const color = lineConfig?.color || '#8b5cf6';

    const size = isSelected ? 18 : isHovered ? 14 : type === 'major' ? 12 : 8;
    const showLabel = isSelected || isHovered || type === 'major';

    return (
        <g
            className={`metro-station ${isInterchange ? 'interchange' : ''} ${isSelected ? 'selected' : ''}`}
            transform={`translate(${x}, ${y})`}
            onMouseEnter={() => onHover?.(philosopher)}
            onMouseLeave={() => onLeave?.()}
            onClick={() => onClick?.(philosopher)}
            style={{ cursor: 'pointer' }}
        >
            {/* Outer glow for selected/hovered */}
            {(isSelected || isHovered) && (
                <circle
                    r={size + 8}
                    fill={color}
                    opacity={0.2}
                    className="station-glow"
                />
            )}

            {/* Interchange indicator (larger white circle) */}
            {isInterchange && (
                <circle
                    r={size + 4}
                    fill="white"
                    stroke={color}
                    strokeWidth={3}
                    className="interchange-outer"
                />
            )}

            {/* Main station circle */}
            <circle
                r={size}
                fill={isInterchange ? 'white' : color}
                stroke={isInterchange ? color : 'white'}
                strokeWidth={isInterchange ? 3 : 2}
                className="station-marker"
            />

            {/* Inner dot for interchanges */}
            {isInterchange && (
                <circle
                    r={size * 0.4}
                    fill={color}
                    className="interchange-inner"
                />
            )}

            {/* Station name label */}
            {showLabel && (
                <g className="station-label">
                    <text
                        y={-size - 10}
                        textAnchor="middle"
                        fill="white"
                        fontSize={isSelected ? 14 : 12}
                        fontWeight={isSelected ? 700 : 500}
                        style={{
                            fontFamily: 'Inter, sans-serif',
                            textShadow: '0 2px 4px rgba(0,0,0,0.8)'
                        }}
                    >
                        {philosopher.title}
                    </text>
                    <text
                        y={-size - 10 + 16}
                        textAnchor="middle"
                        fill="rgba(255,255,255,0.6)"
                        fontSize={10}
                        style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                        {philosopher.year}
                    </text>
                </g>
            )}
        </g>
    );
});

MetroStation.displayName = 'MetroStation';

/**
 * Metro Legend - Shows all line colors and names
 */
const MetroLegend = memo(({ lines, highlightedLine, onLineHover, onLineLeave, onLineClick }) => {
    return (
        <div className="metro-legend">
            <h3 className="legend-title">Concept Routes</h3>
            <div className="legend-lines">
                {Object.entries(lines).map(([concept, lineData]) => (
                    <button
                        key={concept}
                        className={`legend-item ${highlightedLine === concept ? 'active' : ''}`}
                        style={{ '--line-color': lineData.color }}
                        onMouseEnter={() => onLineHover?.(concept)}
                        onMouseLeave={() => onLineLeave?.()}
                        onClick={() => onLineClick?.(concept)}
                    >
                        <span className="legend-color" style={{ backgroundColor: lineData.color }} />
                        <span className="legend-name">{lineData.label.replace(' Line', '')}</span>
                        <span className="legend-count">{lineData.stations?.length || 0}</span>
                    </button>
                ))}
            </div>
        </div>
    );
});

MetroLegend.displayName = 'MetroLegend';

/**
 * Time Axis for metro map
 */
const MetroTimeAxis = memo(({ width, padding }) => {
    const markers = [
        { label: '600 BCE', position: 0 },
        { label: '300 BCE', position: 0.12 },
        { label: '1 CE', position: 0.24 },
        { label: '500', position: 0.36 },
        { label: '1000', position: 0.45 },
        { label: '1400', position: 0.52 },
        { label: '1600', position: 0.58 },
        { label: '1750', position: 0.68 },
        { label: '1850', position: 0.78 },
        { label: '1950', position: 0.9 },
        { label: 'Now', position: 1 }
    ];

    const usableWidth = width - padding.left - padding.right;

    return (
        <g className="metro-time-axis">
            {/* Axis line */}
            <line
                x1={padding.left}
                y1={50}
                x2={padding.left + usableWidth + 40}
                y2={50}
                stroke="rgba(255,255,255,0.2)"
                strokeWidth={2}
            />

            {/* Time markers */}
            {markers.filter((_, i) => i % 2 === 0).map(marker => {
                const x = padding.left + marker.position * usableWidth;
                return (
                    <g key={marker.label} transform={`translate(${x}, 50)`}>
                        <line y1={-5} y2={5} stroke="rgba(255,255,255,0.3)" strokeWidth={2} />
                        <text
                            y={-15}
                            textAnchor="middle"
                            fill="rgba(255,255,255,0.5)"
                            fontSize={11}
                            style={{ fontFamily: 'Inter, sans-serif' }}
                        >
                            {marker.label}
                        </text>
                    </g>
                );
            })}

            {/* Direction arrow */}
            <g transform={`translate(${padding.left + usableWidth + 50}, 50)`}>
                <polygon
                    points="0,-6 12,0 0,6"
                    fill="rgba(255,255,255,0.3)"
                />
            </g>
        </g>
    );
});

MetroTimeAxis.displayName = 'MetroTimeAxis';

/**
 * Main MetroMap Component
 */
const MetroMap = ({ onPhilosopherSelect }) => {
    const containerRef = useRef(null);
    const [canvasSize, setCanvasSize] = useState({ width: 1600, height: 800 });
    const [isLoaded, setIsLoaded] = useState(false);

    // Interaction state
    const [hoveredStation, setHoveredStation] = useState(null);
    const [selectedStation, setSelectedStation] = useState(null);
    const [highlightedLine, setHighlightedLine] = useState(null);
    const [isPanelOpen, setIsPanelOpen] = useState(false);

    // Pan state
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const lastPanPos = useRef({ x: 0, y: 0 });

    // Compute layout
    const layout = useMemo(() => {
        return computeMetroLayout(timelineEvents, canvasSize);
    }, [canvasSize]);

    // Concepts map for panel
    const conceptsMap = useMemo(() => {
        return new Map(philosophyConcepts.map(c => [c.concept, c]));
    }, []);

    // Connections for panel
    const connections = useMemo(() => {
        return buildConstellations(timelineEvents, philosophyConcepts);
    }, []);

    // Handle resize
    useEffect(() => {
        const updateSize = () => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                setCanvasSize({
                    width: Math.max(rect.width, 1200),
                    height: Math.max(rect.height, 600)
                });
            }
        };

        updateSize();
        window.addEventListener('resize', updateSize);

        // Entrance animation
        setTimeout(() => setIsLoaded(true), 100);

        return () => window.removeEventListener('resize', updateSize);
    }, []);

    // Handlers
    const handleStationHover = useCallback((philosopher) => {
        setHoveredStation(philosopher.id);
    }, []);

    const handleStationLeave = useCallback(() => {
        setHoveredStation(null);
    }, []);

    const handleStationClick = useCallback((philosopher) => {
        setSelectedStation(philosopher);
        setIsPanelOpen(true);
        onPhilosopherSelect?.(philosopher);
    }, [onPhilosopherSelect]);

    const handleClosePanel = useCallback(() => {
        setIsPanelOpen(false);
        setTimeout(() => setSelectedStation(null), 300);
    }, []);

    const handleLineHover = useCallback((concept) => {
        setHighlightedLine(concept);
    }, []);

    const handleLineLeave = useCallback(() => {
        setHighlightedLine(null);
    }, []);

    const handleLineClick = useCallback((concept) => {
        setHighlightedLine(prev => prev === concept ? null : concept);
    }, []);

    // Pan handlers
    const handleMouseDown = useCallback((e) => {
        if (e.button === 0) {
            setIsPanning(true);
            lastPanPos.current = { x: e.clientX, y: e.clientY };
        }
    }, []);

    const handleMouseMove = useCallback((e) => {
        if (isPanning) {
            const dx = e.clientX - lastPanPos.current.x;
            const dy = e.clientY - lastPanPos.current.y;
            setPan(prev => ({
                x: prev.x + dx,
                y: prev.y + dy
            }));
            lastPanPos.current = { x: e.clientX, y: e.clientY };
        }
    }, [isPanning]);

    const handleMouseUp = useCallback(() => {
        setIsPanning(false);
    }, []);

    // Navigate to philosopher from panel
    const handleNavigateToPhilosopher = useCallback((philosopherId) => {
        const philosopher = timelineEvents.find(p => p.id === philosopherId);
        if (philosopher) {
            setSelectedStation(philosopher);
        }
    }, []);

    // Keyboard
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isPanelOpen) {
                handleClosePanel();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isPanelOpen, handleClosePanel]);

    return (
        <div
            className={`metro-map-container ${isLoaded ? 'loaded' : ''}`}
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            {/* SVG Canvas */}
            <svg
                className="metro-canvas"
                width="100%"
                height="100%"
                viewBox={`0 0 ${canvasSize.width} ${canvasSize.height}`}
                style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
            >
                <defs>
                    {/* Glow filter */}
                    <filter id="metro-glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="4" />
                    </filter>
                </defs>

                {/* Pan transform group */}
                <g transform={`translate(${pan.x}, ${pan.y})`}>
                    {/* Time axis */}
                    <MetroTimeAxis width={canvasSize.width} padding={layout.padding} />

                    {/* Metro lines (render behind stations) */}
                    <g className="metro-lines-layer">
                        {Object.entries(layout.lines).map(([concept, lineData]) => (
                            <MetroLine
                                key={concept}
                                lineData={lineData}
                                isHighlighted={highlightedLine === concept}
                                isHovered={hoveredStation && layout.stations.find(s => s.id === hoveredStation)?.allLines.includes(concept)}
                                onHover={handleLineHover}
                                onLeave={handleLineLeave}
                            />
                        ))}
                    </g>

                    {/* Stations */}
                    <g className="metro-stations-layer">
                        {layout.stations.map(station => (
                            <MetroStation
                                key={station.id}
                                station={station}
                                isSelected={selectedStation?.id === station.id}
                                isHovered={hoveredStation === station.id}
                                onHover={handleStationHover}
                                onLeave={handleStationLeave}
                                onClick={handleStationClick}
                            />
                        ))}
                    </g>
                </g>
            </svg>

            {/* Legend */}
            <MetroLegend
                lines={layout.lines}
                highlightedLine={highlightedLine}
                onLineHover={handleLineHover}
                onLineLeave={handleLineLeave}
                onLineClick={handleLineClick}
            />

            {/* Philosopher Panel */}
            <PhilosopherPanel
                philosopher={selectedStation}
                isOpen={isPanelOpen}
                onClose={handleClosePanel}
                conceptsMap={conceptsMap}
                onNavigateToPhilosopher={handleNavigateToPhilosopher}
                connections={connections}
                allPhilosophers={timelineEvents}
            />

            {/* Instructions */}
            <div className="metro-instructions">
                <span>Drag to pan • Click stations to explore • Hover lines to highlight</span>
            </div>
        </div>
    );
};

export default memo(MetroMap);
