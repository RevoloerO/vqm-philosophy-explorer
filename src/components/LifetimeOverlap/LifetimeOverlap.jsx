/**
 * LifetimeOverlap Component
 * Gantt-chart style horizontal bars showing philosopher lifetimes
 * Highlights temporal overlaps when hovering
 */

import React, { useState, useMemo, useCallback, memo } from 'react';
import { parseBirthDeath, formatYear } from '../../utils/yearParser';
import timelineEvents from '../../pages/timelineEvents.json';
import './LifetimeOverlap.css';

const ERA_COLORS = {
    'Ancient & Classical Thought': '#d4a574',
    'Medieval & Renaissance Philosophy': '#4a90d9',
    'The Age of Reason & Enlightenment': '#f5a623',
    '19th Century Philosophy': '#e74c3c',
    'Contemporary Thought': '#9b59b6'
};

const ERA_ORDER = [
    'Ancient & Classical Thought',
    'Medieval & Renaissance Philosophy',
    'The Age of Reason & Enlightenment',
    '19th Century Philosophy',
    'Contemporary Thought'
];

const LifetimeOverlap = ({ isOpen, onClose, onPhilosopherSelect }) => {
    const [hoveredId, setHoveredId] = useState(null);
    const [selectedEra, setSelectedEra] = useState(null);

    // Parse all philosopher lifetimes
    const philosophers = useMemo(() => {
        return timelineEvents
            .map(p => {
                const { birth, death } = parseBirthDeath(p);
                return { ...p, birth, death };
            })
            .sort((a, b) => a.birth - b.birth);
    }, []);

    // Filter by era if selected
    const filtered = useMemo(() => {
        if (!selectedEra) return philosophers;
        return philosophers.filter(p => p.era === selectedEra);
    }, [philosophers, selectedEra]);

    // Compute timeline bounds
    const bounds = useMemo(() => {
        if (filtered.length === 0) return { min: -600, max: 2000 };
        const min = Math.min(...filtered.map(p => p.birth));
        const max = Math.max(...filtered.map(p => p.death));
        const padding = (max - min) * 0.05;
        return { min: min - padding, max: max + padding };
    }, [filtered]);

    const range = bounds.max - bounds.min;

    // Find overlapping philosophers when hovering
    const overlapping = useMemo(() => {
        if (hoveredId === null) return new Set();
        const hovered = filtered.find(p => p.id === hoveredId);
        if (!hovered) return new Set();
        const ids = new Set();
        filtered.forEach(p => {
            if (p.id === hoveredId) return;
            if (p.birth <= hovered.death && p.death >= hovered.birth) {
                ids.add(p.id);
            }
        });
        return ids;
    }, [hoveredId, filtered]);

    const toPercent = useCallback((year) => {
        return ((year - bounds.min) / range) * 100;
    }, [bounds, range]);

    // Generate axis ticks
    const ticks = useMemo(() => {
        const step = range > 1500 ? 500 : range > 500 ? 200 : 100;
        const start = Math.ceil(bounds.min / step) * step;
        const result = [];
        for (let y = start; y <= bounds.max; y += step) {
            result.push(y);
        }
        return result;
    }, [bounds, range]);

    if (!isOpen) return null;

    return (
        <div className="lifetime-overlay">
            <div className="lifetime-panel">
                <header className="lifetime-header">
                    <h2 className="lifetime-title">Lifetime Overlaps</h2>
                    <p className="lifetime-subtitle">Who lived at the same time?</p>
                    <button className="lifetime-close" onClick={onClose} aria-label="Close">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </button>
                </header>

                {/* Era filter chips */}
                <div className="lifetime-era-filters">
                    <button
                        className={`lifetime-era-chip ${selectedEra === null ? 'active' : ''}`}
                        onClick={() => setSelectedEra(null)}
                    >
                        All Eras
                    </button>
                    {ERA_ORDER.map(era => (
                        <button
                            key={era}
                            className={`lifetime-era-chip ${selectedEra === era ? 'active' : ''}`}
                            style={{ '--chip-color': ERA_COLORS[era] }}
                            onClick={() => setSelectedEra(selectedEra === era ? null : era)}
                        >
                            {era.split(' ')[0]}
                        </button>
                    ))}
                </div>

                {/* Gantt chart */}
                <div className="lifetime-chart">
                    {/* Axis */}
                    <div className="lifetime-axis">
                        {ticks.map(year => (
                            <div
                                key={year}
                                className="lifetime-tick"
                                style={{ left: `${toPercent(year)}%` }}
                            >
                                <span className="tick-label">{formatYear(year)}</span>
                            </div>
                        ))}
                    </div>

                    {/* Bars */}
                    <div className="lifetime-bars">
                        {filtered.map(p => {
                            const left = toPercent(p.birth);
                            const width = toPercent(p.death) - left;
                            const isHovered = p.id === hoveredId;
                            const isOverlap = overlapping.has(p.id);
                            const isDimmed = hoveredId !== null && !isHovered && !isOverlap;
                            const color = ERA_COLORS[p.era] || '#8b5cf6';

                            return (
                                <div
                                    key={p.id}
                                    className={`lifetime-row ${isHovered ? 'hovered' : ''} ${isOverlap ? 'overlap' : ''} ${isDimmed ? 'dimmed' : ''}`}
                                    onMouseEnter={() => setHoveredId(p.id)}
                                    onMouseLeave={() => setHoveredId(null)}
                                    onClick={() => onPhilosopherSelect?.(p)}
                                >
                                    <span className="lifetime-name">{p.title}</span>
                                    <div className="lifetime-bar-track">
                                        <div
                                            className="lifetime-bar"
                                            style={{
                                                left: `${left}%`,
                                                width: `${Math.max(width, 0.5)}%`,
                                                backgroundColor: color,
                                                opacity: isDimmed ? 0.2 : isHovered || isOverlap ? 1 : 0.6
                                            }}
                                        />
                                        {isHovered && (
                                            <span
                                                className="lifetime-bar-label"
                                                style={{ left: `${left + width / 2}%` }}
                                            >
                                                {formatYear(p.birth)} - {formatYear(p.death)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {hoveredId !== null && overlapping.size > 0 && (
                    <div className="lifetime-overlap-info">
                        Overlaps with {overlapping.size} philosopher{overlapping.size !== 1 ? 's' : ''}
                    </div>
                )}
            </div>
        </div>
    );
};

export default memo(LifetimeOverlap);
