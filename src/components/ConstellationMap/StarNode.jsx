/**
 * StarNode Component
 * Renders an individual philosopher as a star in the constellation map
 */

import React, { memo } from 'react';

/**
 * Era color mapping
 */
const ERA_COLORS = {
    ancient: '#d4a574',
    medieval: '#4a90d9',
    enlightenment: '#f5a623',
    '19th': '#e74c3c',
    contemporary: '#9b59b6'
};

/**
 * StarNode - Renders a single philosopher star
 */
const StarNode = memo(({
    position,
    philosopher,
    era,
    isHovered,
    isSelected,
    opacity = 1,
    onHover,
    onLeave,
    onClick,
    scale = 1
}) => {
    const color = ERA_COLORS[era] || '#ffffff';

    // Size based on state
    const baseSize = 8;
    const size = isSelected ? 16 : isHovered ? 12 : baseSize;
    const glowSize = size * 2.5;

    // Glow opacity based on state
    const glowOpacity = isSelected ? 1 : isHovered ? 0.8 : 0.5;

    // Calculate label font size based on zoom scale
    const labelFontSize = Math.max(10, Math.min(14, 12 / scale));
    const labelOffset = size + 16;

    return (
        <g
            className={`star-node ${isHovered ? 'hovered' : ''} ${isSelected ? 'selected' : ''}`}
            transform={`translate(${position.x}, ${position.y})`}
            style={{
                opacity,
                cursor: 'pointer',
                transition: 'opacity 0.4s ease'
            }}
            onMouseEnter={() => onHover && onHover(philosopher)}
            onMouseLeave={() => onLeave && onLeave()}
            onClick={(e) => {
                e.stopPropagation();
                onClick && onClick(philosopher);
            }}
            role="button"
            tabIndex={0}
            aria-label={`${philosopher.title} - ${philosopher.year}`}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onClick && onClick(philosopher);
                }
            }}
        >
            {/* Outer glow */}
            <circle
                className="star-glow"
                r={glowSize}
                fill={`url(#star-glow-${era})`}
                style={{
                    opacity: glowOpacity,
                    transition: 'r 0.3s ease, opacity 0.3s ease'
                }}
            />

            {/* Star core */}
            <circle
                className="star-core"
                r={size}
                fill={color}
                style={{
                    filter: 'url(#star-blur)',
                    transition: 'r 0.3s ease'
                }}
            />

            {/* Inner bright center */}
            <circle
                className="star-center"
                r={size * 0.4}
                fill="white"
                style={{
                    opacity: isSelected ? 1 : isHovered ? 0.9 : 0.7,
                    transition: 'r 0.3s ease, opacity 0.3s ease'
                }}
            />

            {/* Star rays (decorative points) */}
            <g className="star-rays" style={{ opacity: isHovered || isSelected ? 0.8 : 0.3 }}>
                {[0, 45, 90, 135].map((angle) => (
                    <line
                        key={angle}
                        x1={0}
                        y1={-size * 0.6}
                        x2={0}
                        y2={-size * 1.5}
                        stroke="white"
                        strokeWidth={1}
                        opacity={0.5}
                        transform={`rotate(${angle})`}
                        style={{
                            transition: 'opacity 0.3s ease'
                        }}
                    />
                ))}
            </g>

            {/* Label (shown on hover/select) */}
            {(isHovered || isSelected) && (
                <g className="star-label-group">
                    {/* Label background for readability */}
                    <rect
                        x={-60}
                        y={labelOffset - 4}
                        width={120}
                        height={24}
                        rx={4}
                        fill="rgba(13, 17, 23, 0.85)"
                        style={{
                            opacity: 0,
                            animation: 'fadeIn 0.2s ease forwards'
                        }}
                    />

                    {/* Philosopher name */}
                    <text
                        className="star-label"
                        y={labelOffset + 12}
                        textAnchor="middle"
                        fill={color}
                        fontSize={labelFontSize}
                        fontWeight="600"
                        style={{
                            opacity: 0,
                            animation: 'fadeIn 0.2s ease forwards',
                            textShadow: '0 1px 3px rgba(0,0,0,0.8)'
                        }}
                    >
                        {philosopher.title}
                    </text>

                    {/* Year */}
                    <text
                        className="star-year"
                        y={labelOffset + 28}
                        textAnchor="middle"
                        fill="rgba(255,255,255,0.6)"
                        fontSize={labelFontSize * 0.8}
                        style={{
                            opacity: 0,
                            animation: 'fadeIn 0.2s 0.1s ease forwards'
                        }}
                    >
                        {philosopher.year}
                    </text>
                </g>
            )}

            {/* Selection ring */}
            {isSelected && (
                <circle
                    className="star-selection-ring"
                    r={size + 8}
                    fill="none"
                    stroke={color}
                    strokeWidth={2}
                    strokeDasharray="4 2"
                    style={{
                        opacity: 0.6,
                        animation: 'rotate 10s linear infinite'
                    }}
                />
            )}
        </g>
    );
});

StarNode.displayName = 'StarNode';

/**
 * SVG Defs for star rendering (gradients, filters)
 * Include this in the parent SVG's <defs> section
 */
export const StarDefs = () => (
    <defs>
        {/* Blur filter for stars */}
        <filter id="star-blur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" />
        </filter>

        {/* Radial gradients for each era's glow */}
        {Object.entries(ERA_COLORS).map(([era, color]) => (
            <radialGradient key={era} id={`star-glow-${era}`}>
                <stop offset="0%" stopColor={color} stopOpacity="0.9" />
                <stop offset="40%" stopColor={color} stopOpacity="0.4" />
                <stop offset="100%" stopColor={color} stopOpacity="0" />
            </radialGradient>
        ))}

        {/* Discovery animation filter */}
        <filter id="star-discovery" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
            </feMerge>
        </filter>
    </defs>
);

export default StarNode;
