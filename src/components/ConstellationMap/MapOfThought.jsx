/**
 * MapOfThought Component
 * Wrapper component that allows switching between visualization modes:
 * - Constellation Mode: Original starfield view
 * - Metro Mode: Transit-map style view
 */

import React, { useState, useCallback, memo } from 'react';
import ConstellationMap from './ConstellationMap';
import MetroMap from './MetroMap';
import '../../css/MetroMap.css';

/**
 * View Mode Toggle Button
 */
const ViewModeToggle = memo(({ mode, onToggle }) => {
    return (
        <div className="view-mode-toggle">
            <button
                className={`toggle-btn ${mode === 'constellation' ? 'active' : ''}`}
                onClick={() => onToggle('constellation')}
                title="Constellation View"
            >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <circle cx="12" cy="12" r="2" />
                    <circle cx="6" cy="6" r="1.5" />
                    <circle cx="18" cy="8" r="1.5" />
                    <circle cx="8" cy="18" r="1.5" />
                    <circle cx="17" cy="17" r="1.5" />
                    <path d="M6 6l6 6m0 0l6-4m-6 4l-4 6m4-6l5 5" opacity="0.5" />
                </svg>
                <span>Stars</span>
            </button>
            <button
                className={`toggle-btn ${mode === 'metro' ? 'active' : ''}`}
                onClick={() => onToggle('metro')}
                title="Metro Map View"
            >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M4 8h16" />
                    <path d="M4 12h16" />
                    <path d="M4 16h16" />
                    <circle cx="8" cy="8" r="2" fill="currentColor" />
                    <circle cx="14" cy="12" r="2" fill="currentColor" />
                    <circle cx="10" cy="16" r="2" fill="currentColor" />
                    <circle cx="18" cy="16" r="2" fill="currentColor" />
                </svg>
                <span>Metro</span>
            </button>
        </div>
    );
});

ViewModeToggle.displayName = 'ViewModeToggle';

/**
 * MapOfThought - Main component with view switching
 */
const MapOfThought = ({ onPhilosopherSelect, selectedPhilosopher }) => {
    const [viewMode, setViewMode] = useState('metro'); // Default to metro view

    const handleViewToggle = useCallback((mode) => {
        setViewMode(mode);
    }, []);

    return (
        <div className="map-of-thought">
            {/* View Mode Toggle */}
            <ViewModeToggle mode={viewMode} onToggle={handleViewToggle} />

            {/* Render active view */}
            {viewMode === 'constellation' ? (
                <ConstellationMap
                    onPhilosopherSelect={onPhilosopherSelect}
                    selectedPhilosopher={selectedPhilosopher}
                />
            ) : (
                <MetroMap
                    onPhilosopherSelect={onPhilosopherSelect}
                />
            )}
        </div>
    );
};

export default memo(MapOfThought);
