/**
 * ViewToggle Component
 * Toggle button to switch between Timeline, Constellation, and Metro views
 */

import React, { memo } from 'react';
import './ViewToggle.css';

const TimelineIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <line x1="3" y1="12" x2="21" y2="12" />
        <circle cx="6" cy="12" r="2" />
        <circle cx="12" cy="12" r="2" />
        <circle cx="18" cy="12" r="2" />
    </svg>
);

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

const MetroIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M4 8h16" />
        <path d="M4 14h16" />
        <circle cx="8" cy="8" r="2" fill="currentColor" />
        <circle cx="14" cy="14" r="2" fill="currentColor" />
        <circle cx="18" cy="8" r="2" fill="currentColor" />
        <circle cx="10" cy="14" r="2" fill="currentColor" />
    </svg>
);

const VIEW_MODES = [
    { key: 'timeline', label: 'Timeline', Icon: TimelineIcon },
    { key: 'constellation', label: 'Stars', Icon: ConstellationIcon },
    { key: 'metro', label: 'Metro', Icon: MetroIcon },
];

const ViewToggle = ({ viewMode, onToggle, isTransitioning }) => {
    return (
        <div className={`view-toggle ${isTransitioning ? 'transitioning' : ''}`}>
            {VIEW_MODES.map(({ key, label, Icon }) => (
                <button
                    key={key}
                    className={`view-toggle-btn ${viewMode === key ? 'active' : ''}`}
                    onClick={() => onToggle(key)}
                    disabled={isTransitioning}
                    aria-label={`${label} view`}
                    title={`${label} View`}
                >
                    <Icon />
                    <span className="view-toggle-label">{label}</span>
                </button>
            ))}
        </div>
    );
};

export default memo(ViewToggle);
