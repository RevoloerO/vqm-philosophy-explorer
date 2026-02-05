/**
 * ViewToggle Component
 * Toggle button to switch between Timeline and Constellation views
 */

import React, { memo } from 'react';
import './ViewToggle.css';

/**
 * Timeline Icon
 */
const TimelineIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <line x1="3" y1="12" x2="21" y2="12" />
        <circle cx="6" cy="12" r="2" />
        <circle cx="12" cy="12" r="2" />
        <circle cx="18" cy="12" r="2" />
    </svg>
);

/**
 * Constellation Icon (stars)
 */
const ConstellationIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <circle cx="12" cy="6" r="2" />
        <circle cx="6" cy="18" r="2" />
        <circle cx="18" cy="18" r="2" />
        <line x1="12" y1="8" x2="7" y2="16" />
        <line x1="12" y1="8" x2="17" y2="16" />
        <line x1="8" y1="18" x2="16" y2="18" />
    </svg>
);

/**
 * ViewToggle - Toggle button component
 */
const ViewToggle = ({ viewMode, onToggle, isTransitioning }) => {
    return (
        <div className={`view-toggle ${isTransitioning ? 'transitioning' : ''}`}>
            <button
                className={`view-toggle-btn ${viewMode === 'timeline' ? 'active' : ''}`}
                onClick={() => onToggle('timeline')}
                disabled={isTransitioning}
                aria-label="Timeline view"
                title="Timeline View"
            >
                <TimelineIcon />
                <span className="view-toggle-label">Timeline</span>
            </button>

            <button
                className={`view-toggle-btn ${viewMode === 'constellation' ? 'active' : ''}`}
                onClick={() => onToggle('constellation')}
                disabled={isTransitioning}
                aria-label="Constellation view"
                title="Constellation View"
            >
                <ConstellationIcon />
                <span className="view-toggle-label">Constellation</span>
            </button>
        </div>
    );
};

export default memo(ViewToggle);
