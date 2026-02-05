/**
 * ConstellationLines Component
 * Renders SVG lines connecting philosophers who share concepts
 */

import React, { memo, useMemo } from 'react';
import { getConnectionColor } from '../../utils/connectionBuilder';

/**
 * Generate a curved path between two points
 * Creates a subtle curve for visual appeal
 */
const generateCurvedPath = (x1, y1, x2, y2, curvature = 0.2) => {
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;

    // Calculate perpendicular offset for curve
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.sqrt(dx * dx + dy * dy);

    // Perpendicular vector
    const perpX = -dy / length;
    const perpY = dx / length;

    // Control point offset
    const offset = length * curvature;
    const ctrlX = midX + perpX * offset;
    const ctrlY = midY + perpY * offset;

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
    opacity = 1
}) => {
    const color = getConnectionColor(connection.category);

    // Use curved path for better visual appeal
    const path = generateCurvedPath(
        startPos.x,
        startPos.y,
        endPos.x,
        endPos.y,
        0.15 // Subtle curve
    );

    const baseOpacity = isHighlighted ? 0.8 : isHovered ? 0.5 : 0.15;
    const strokeWidth = isHighlighted ? 2 : isHovered ? 1.5 : 1;

    return (
        <g className="constellation-line-group">
            {/* Glow effect for highlighted lines */}
            {(isHighlighted || isHovered) && (
                <path
                    d={path}
                    fill="none"
                    stroke={color}
                    strokeWidth={strokeWidth + 4}
                    strokeLinecap="round"
                    opacity={0.2}
                    style={{
                        filter: 'blur(4px)'
                    }}
                />
            )}

            {/* Main line */}
            <path
                className={`constellation-line ${isHighlighted ? 'highlighted' : ''} ${isHovered ? 'hovered' : ''}`}
                d={path}
                fill="none"
                stroke={isHighlighted ? color : 'rgba(255, 255, 255, 0.4)'}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={isHighlighted ? 'none' : '4 4'}
                opacity={baseOpacity * opacity}
                style={{
                    transition: 'stroke 0.3s ease, stroke-width 0.3s ease, opacity 0.3s ease'
                }}
            />

            {/* Concept label for highlighted lines */}
            {isHighlighted && (
                <text
                    x={(startPos.x + endPos.x) / 2}
                    y={(startPos.y + endPos.y) / 2 - 10}
                    fill={color}
                    fontSize="10"
                    textAnchor="middle"
                    opacity={0.8}
                    style={{
                        pointerEvents: 'none',
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 500
                    }}
                >
                    #{connection.concept}
                </text>
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
            .map(connection => {
                const startPos = positionMap.get(connection.from);
                const endPos = positionMap.get(connection.to);

                if (!startPos || !endPos) return null;

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
                    isHovered
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
            {processedConnections.map(conn => (
                <ConstellationLine
                    key={conn.id}
                    connection={conn}
                    startPos={conn.startPos}
                    endPos={conn.endPos}
                    isHighlighted={conn.isHighlighted}
                    isHovered={conn.isHovered}
                    opacity={opacity}
                />
            ))}
        </g>
    );
});

ConstellationLines.displayName = 'ConstellationLines';

export default ConstellationLines;
