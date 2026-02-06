/**
 * ConstellationLines Component
 * Renders SVG lines connecting philosophers who share concepts
 * Uses smooth bezier curves for better visual appeal
 */

import React, { memo, useMemo } from 'react';
import { getConnectionColor } from '../../utils/connectionBuilder';

/**
 * Generate a flowing quadratic bezier path
 * Simpler curve with single control point
 */
const generateFlowingPath = (x1, y1, x2, y2, curveOffset = 0.2) => {
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;

    const dx = x2 - x1;
    const dy = y2 - y1;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Perpendicular vector for curve offset
    const perpX = -dy / (distance || 1);
    const perpY = dx / (distance || 1);

    // Dynamic curve amount based on distance
    const curveAmount = Math.min(distance * curveOffset, 80);

    // Control point
    const ctrlX = midX + perpX * curveAmount;
    const ctrlY = midY + perpY * curveAmount;

    return `M ${x1} ${y1} Q ${ctrlX} ${ctrlY} ${x2} ${y2}`;
};

/**
 * Single constellation line component
 */
const ConstellationLine = memo(({
    connection,
    startPos,
    endPos,
    isHighlighted,
    isHovered,
    opacity = 1,
    index = 0
}) => {
    const color = getConnectionColor(connection.category);

    // Use index to vary the curve direction slightly for overlapping lines
    const curveDirection = index % 2 === 0 ? 0.15 : -0.15;

    // Generate smooth curved path
    const path = generateFlowingPath(
        startPos.x,
        startPos.y,
        endPos.x,
        endPos.y,
        curveDirection
    );

    const baseOpacity = isHighlighted ? 0.85 : isHovered ? 0.6 : 0.2;
    const strokeWidth = isHighlighted ? 2.5 : isHovered ? 2 : 1.5;

    return (
        <g className="constellation-line-group">
            {/* Glow effect for highlighted lines */}
            {(isHighlighted || isHovered) && (
                <path
                    d={path}
                    fill="none"
                    stroke={color}
                    strokeWidth={strokeWidth + 6}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity={0.15}
                    style={{
                        filter: 'blur(6px)'
                    }}
                />
            )}

            {/* Main line - solid for better smoothness */}
            <path
                className={`constellation-line ${isHighlighted ? 'highlighted' : ''} ${isHovered ? 'hovered' : ''}`}
                d={path}
                fill="none"
                stroke={isHighlighted || isHovered ? color : 'rgba(139, 92, 246, 0.5)'}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={baseOpacity * opacity}
                style={{
                    transition: 'stroke 0.3s ease, stroke-width 0.3s ease, opacity 0.3s ease'
                }}
            />

            {/* Small dots along the path for non-highlighted lines to create subtle pattern */}
            {!isHighlighted && !isHovered && (
                <circle
                    cx={(startPos.x + endPos.x) / 2}
                    cy={(startPos.y + endPos.y) / 2}
                    r={2}
                    fill="rgba(139, 92, 246, 0.3)"
                    opacity={opacity * 0.5}
                />
            )}

            {/* Concept label for highlighted lines */}
            {isHighlighted && (
                <g className="connection-label">
                    {/* Background for label */}
                    <rect
                        x={(startPos.x + endPos.x) / 2 - 40}
                        y={(startPos.y + endPos.y) / 2 - 22}
                        width={80}
                        height={18}
                        rx={9}
                        fill="rgba(13, 17, 23, 0.85)"
                        opacity={0.9}
                    />
                    <text
                        x={(startPos.x + endPos.x) / 2}
                        y={(startPos.y + endPos.y) / 2 - 10}
                        fill={color}
                        fontSize="10"
                        textAnchor="middle"
                        opacity={1}
                        style={{
                            pointerEvents: 'none',
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 600,
                            letterSpacing: '0.5px'
                        }}
                    >
                        {connection.concept.replace(/([A-Z])/g, ' $1').trim()}
                    </text>
                </g>
            )}
        </g>
    );
});

ConstellationLine.displayName = 'ConstellationLine';

/**
 * ConstellationLines - Renders all constellation connection lines
 */
const ConstellationLines = memo(({
    connections,
    positions,
    highlightedConcept = null,
    highlightedPhilosopherId = null,
    hoveredConcept = null,
    opacity = 1
}) => {
    // Create position lookup map
    const positionMap = useMemo(() => {
        return new Map(positions.map(p => [p.id, p]));
    }, [positions]);

    // Filter and process connections
    const processedConnections = useMemo(() => {
        return connections
            .map((connection, index) => {
                const startPos = positionMap.get(connection.from);
                const endPos = positionMap.get(connection.to);

                if (!startPos || !endPos) return null;

                // Check opacity - don't show connections for hidden philosophers
                const startOpacity = startPos.opacity ?? 1;
                const endOpacity = endPos.opacity ?? 1;
                const connectionOpacity = Math.min(startOpacity, endOpacity);

                // Skip completely hidden connections
                if (connectionOpacity < 0.1) return null;

                const isHighlighted =
                    connection.concept === highlightedConcept ||
                    connection.from === highlightedPhilosopherId ||
                    connection.to === highlightedPhilosopherId;

                const isHovered = connection.concept === hoveredConcept;

                return {
                    ...connection,
                    startPos,
                    endPos,
                    isHighlighted,
                    isHovered,
                    connectionOpacity,
                    index
                };
            })
            .filter(Boolean)
            // Sort so highlighted connections render on top
            .sort((a, b) => {
                if (a.isHighlighted && !b.isHighlighted) return 1;
                if (!a.isHighlighted && b.isHighlighted) return -1;
                if (a.isHovered && !b.isHovered) return 1;
                if (!a.isHovered && b.isHovered) return -1;
                return 0;
            });
    }, [connections, positionMap, highlightedConcept, highlightedPhilosopherId, hoveredConcept]);

    return (
        <g className="constellation-lines-layer">
            {/* SVG filter for smoother lines */}
            <defs>
                <filter id="line-glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            {processedConnections.map(conn => (
                <ConstellationLine
                    key={conn.id}
                    connection={conn}
                    startPos={conn.startPos}
                    endPos={conn.endPos}
                    isHighlighted={conn.isHighlighted}
                    isHovered={conn.isHovered}
                    opacity={opacity * conn.connectionOpacity}
                    index={conn.index}
                />
            ))}
        </g>
    );
});

ConstellationLines.displayName = 'ConstellationLines';

export default ConstellationLines;
