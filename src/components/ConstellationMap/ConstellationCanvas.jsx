/**
 * ConstellationCanvas Component
 * The main SVG rendering layer for the constellation map
 * Renders stars and handles the canvas transformations
 */

import React, { memo, forwardRef } from 'react';
import StarNode, { StarDefs } from './StarNode';

/**
 * Background stars for atmosphere
 */
const BackgroundStars = memo(({ count = 100, seed = 42 }) => {
    // Generate pseudo-random positions based on seed for consistency
    const stars = React.useMemo(() => {
        const result = [];
        for (let i = 0; i < count; i++) {
            const pseudoRandom1 = Math.abs(Math.sin(seed + i * 127.1)) % 1;
            const pseudoRandom2 = Math.abs(Math.sin(seed + i * 311.7)) % 1;
            const pseudoRandom3 = Math.abs(Math.sin(seed + i * 74.7)) % 1;

            result.push({
                id: i,
                x: pseudoRandom1 * 100,
                y: pseudoRandom2 * 100,
                size: 1 + pseudoRandom3 * 2,
                opacity: 0.2 + pseudoRandom3 * 0.4,
                delay: pseudoRandom3 * 5
            });
        }
        return result;
    }, [count, seed]);

    return (
        <g className="background-stars">
            {stars.map((star) => (
                <circle
                    key={star.id}
                    cx={`${star.x}%`}
                    cy={`${star.y}%`}
                    r={star.size}
                    fill="white"
                    opacity={star.opacity}
                    className="bg-star"
                    style={{
                        animationDelay: `${star.delay}s`
                    }}
                />
            ))}
        </g>
    );
});

BackgroundStars.displayName = 'BackgroundStars';

/**
 * Era region backgrounds (subtle colored regions)
 */
const EraRegions = memo(({ positions, canvasSize, selectedEras }) => {
    // Group positions by era
    const eraGroups = React.useMemo(() => {
        const groups = {};
        positions.forEach(pos => {
            if (!groups[pos.era]) {
                groups[pos.era] = [];
            }
            groups[pos.era].push(pos);
        });
        return groups;
    }, [positions]);

    const eraBaseColors = {
        ancient: '212, 165, 116',
        medieval: '74, 144, 217',
        enlightenment: '245, 166, 35',
        '19th': '231, 76, 60',
        contemporary: '155, 89, 182'
    };

    const getEraFill = (era) => {
        const rgb = eraBaseColors[era] || '255, 255, 255';
        const hasFilter = selectedEras && selectedEras.size > 0;
        const isSelected = selectedEras && selectedEras.has(era);

        if (!hasFilter) return `rgba(${rgb}, 0.03)`;
        if (isSelected) return `rgba(${rgb}, 0.12)`;
        return `rgba(${rgb}, 0.01)`;
    };

    return (
        <g className="era-regions">
            {Object.entries(eraGroups).map(([era, eraPositions]) => {
                if (eraPositions.length === 0) return null;

                // Calculate bounding box for this era
                const minX = Math.min(...eraPositions.map(p => p.x)) - 100;
                const maxX = Math.max(...eraPositions.map(p => p.x)) + 100;
                const centerX = (minX + maxX) / 2;
                const width = maxX - minX;

                return (
                    <ellipse
                        key={era}
                        cx={centerX}
                        cy={canvasSize.height / 2}
                        rx={width / 2}
                        ry={canvasSize.height * 0.4}
                        fill={getEraFill(era)}
                        className={`era-region era-region-${era}`}
                        style={{ transition: 'fill 0.4s ease' }}
                    />
                );
            })}
        </g>
    );
});

EraRegions.displayName = 'EraRegions';

/**
 * ConstellationCanvas - Main SVG canvas component
 */
const ConstellationCanvas = forwardRef(({
    canvasSize,
    transform,
    positions,
    hoveredStarId,
    selectedStarId,
    selectedEras,
    onStarHover,
    onStarLeave,
    onStarClick,
    onCanvasClick,
    children, // For constellation lines, search overlays, etc.
    className = '',
    isLoaded = true
}, ref) => {
    const { width, height } = canvasSize;

    return (
        <svg
            ref={ref}
            className={`constellation-canvas ${className}`}
            width="100%"
            height="100%"
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="xMidYMid meet"
            style={{
                touchAction: 'none',
                userSelect: 'none'
            }}
            onClick={(e) => {
                // Only fire if clicking on canvas background
                if (e.target === e.currentTarget || e.target.classList.contains('canvas-background')) {
                    onCanvasClick && onCanvasClick();
                }
            }}
        >
            {/* SVG Definitions (gradients, filters) */}
            <StarDefs />

            {/* Additional defs for background effects */}
            <defs>
                {/* Radial gradient for nebula effect */}
                <radialGradient id="nebula-gradient" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="rgba(124, 58, 237, 0.1)" />
                    <stop offset="100%" stopColor="transparent" />
                </radialGradient>
            </defs>

            {/* Transform group - applies zoom and pan */}
            <g
                className="transform-group"
                transform={`translate(${transform.x}, ${transform.y}) scale(${transform.scale})`}
                style={{
                    transformOrigin: '0 0'
                }}
            >
                {/* Canvas background (clickable area) */}
                <rect
                    className="canvas-background"
                    x={-width}
                    y={-height}
                    width={width * 3}
                    height={height * 3}
                    fill="transparent"
                />

                {/* Subtle nebula effect in center */}
                <ellipse
                    cx={width / 2}
                    cy={height / 2}
                    rx={width * 0.4}
                    ry={height * 0.4}
                    fill="url(#nebula-gradient)"
                    className="nebula"
                />

                {/* Background stars for atmosphere */}
                <BackgroundStars count={80} />

                {/* Era region highlights */}
                <EraRegions positions={positions} canvasSize={canvasSize} selectedEras={selectedEras} />

                {/* Constellation lines and other children go here */}
                {children}

                {/* Philosopher stars */}
                <g className={`stars-layer ${isLoaded ? 'stars-visible' : ''}`}>
                    {positions.map((pos) => (
                        <StarNode
                            key={pos.id}
                            position={pos}
                            philosopher={pos.philosopher}
                            era={pos.era}
                            type={pos.type || pos.philosopher?.type || 'major'}
                            isHovered={hoveredStarId === pos.id}
                            isSelected={selectedStarId === pos.id}
                            opacity={pos.opacity ?? 1}
                            onHover={onStarHover}
                            onLeave={onStarLeave}
                            onClick={onStarClick}
                            scale={transform.scale}
                        />
                    ))}
                </g>
            </g>
        </svg>
    );
});

ConstellationCanvas.displayName = 'ConstellationCanvas';

export default memo(ConstellationCanvas);
