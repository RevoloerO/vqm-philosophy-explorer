/**
 * ZoomControls Component
 * Provides zoom in, zoom out, and reset buttons for the constellation map
 */

import React from 'react';

const ZoomControls = ({
    onZoomIn,
    onZoomOut,
    onReset,
    currentZoom = 1,
    minZoom = 0.3,
    maxZoom = 4,
    className = ''
}) => {
    const canZoomIn = currentZoom < maxZoom;
    const canZoomOut = currentZoom > minZoom;
    const isDefaultZoom = Math.abs(currentZoom - 1) < 0.1;

    // Format zoom percentage for display
    const zoomPercent = Math.round(currentZoom * 100);

    return (
        <div className={`zoom-controls ${className}`}>
            {/* Zoom Out Button */}
            <button
                className={`zoom-btn zoom-btn-out ${!canZoomOut ? 'disabled' : ''}`}
                onClick={onZoomOut}
                disabled={!canZoomOut}
                aria-label="Zoom out"
                title="Zoom out"
            >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35" />
                    <path d="M8 11h6" />
                </svg>
            </button>

            {/* Zoom Level Indicator */}
            <div
                className="zoom-level"
                title={`Current zoom: ${zoomPercent}%`}
            >
                {zoomPercent}%
            </div>

            {/* Zoom In Button */}
            <button
                className={`zoom-btn zoom-btn-in ${!canZoomIn ? 'disabled' : ''}`}
                onClick={onZoomIn}
                disabled={!canZoomIn}
                aria-label="Zoom in"
                title="Zoom in"
            >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35" />
                    <path d="M11 8v6" />
                    <path d="M8 11h6" />
                </svg>
            </button>

            {/* Reset Button */}
            <button
                className={`zoom-btn zoom-btn-reset ${isDefaultZoom ? 'disabled' : ''}`}
                onClick={onReset}
                disabled={isDefaultZoom}
                aria-label="Reset zoom"
                title="Reset to default view"
            >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                    <path d="M3 3v5h5" />
                </svg>
            </button>
        </div>
    );
};

export default ZoomControls;
