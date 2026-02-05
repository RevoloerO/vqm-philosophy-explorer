/**
 * TimeSlider Component
 * Horizontal time navigation slider for filtering philosophers by era
 */

import React, { useState, useCallback, useRef, useEffect, memo } from 'react';
import { formatYear, normalizeYear, denormalizeYear, ERA_BOUNDARIES } from '../../utils/yearParser';

/**
 * Era marker component
 */
const EraMarker = memo(({ era, position, isActive }) => {
    const eraLabels = {
        ancient: 'Ancient',
        medieval: 'Medieval',
        enlightenment: 'Enlightenment',
        '19th': '19th Century',
        contemporary: 'Contemporary'
    };

    const eraColors = {
        ancient: '#d4a574',
        medieval: '#4a90d9',
        enlightenment: '#f5a623',
        '19th': '#e74c3c',
        contemporary: '#9b59b6'
    };

    return (
        <div
            className={`era-marker ${isActive ? 'active' : ''}`}
            style={{
                left: `${position}%`,
                '--era-color': eraColors[era] || '#fff'
            }}
        >
            <div className="era-marker-line" />
            <span className="era-marker-label">{eraLabels[era]}</span>
        </div>
    );
});

EraMarker.displayName = 'EraMarker';

/**
 * TimeSlider - Main time navigation component
 */
const TimeSlider = ({
    timeRange,
    onTimeRangeChange,
    onReset,
    currentEras = [],
    visibleCount,
    totalCount,
    className = ''
}) => {
    const sliderRef = useRef(null);
    const [isDragging, setIsDragging] = useState(null); // 'start', 'end', or 'range'
    const [localRange, setLocalRange] = useState(timeRange);

    // Sync local range with prop
    useEffect(() => {
        setLocalRange(timeRange);
    }, [timeRange]);

    // Convert pixel position to year
    const positionToYear = useCallback((clientX) => {
        if (!sliderRef.current) return 0;
        const rect = sliderRef.current.getBoundingClientRect();
        const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        return denormalizeYear(percent);
    }, []);

    // Handle drag start
    const handleMouseDown = useCallback((e, handle) => {
        e.preventDefault();
        setIsDragging(handle);
    }, []);

    // Handle drag move
    const handleMouseMove = useCallback((e) => {
        if (!isDragging) return;

        const year = positionToYear(e.clientX);

        setLocalRange(prev => {
            if (isDragging === 'start') {
                return {
                    start: Math.min(year, prev.end - 50), // Minimum 50 year range
                    end: prev.end
                };
            } else if (isDragging === 'end') {
                return {
                    start: prev.start,
                    end: Math.max(year, prev.start + 50)
                };
            } else if (isDragging === 'range') {
                const rangeSize = prev.end - prev.start;
                const center = year;
                const newStart = Math.max(-600, center - rangeSize / 2);
                const newEnd = Math.min(1950, newStart + rangeSize);
                return {
                    start: newEnd === 1950 ? newEnd - rangeSize : newStart,
                    end: newEnd
                };
            }
            return prev;
        });
    }, [isDragging, positionToYear]);

    // Handle drag end
    const handleMouseUp = useCallback(() => {
        if (isDragging) {
            onTimeRangeChange(localRange);
            setIsDragging(null);
        }
    }, [isDragging, localRange, onTimeRangeChange]);

    // Attach global mouse events
    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            return () => {
                window.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging, handleMouseMove, handleMouseUp]);

    // Touch handlers
    const handleTouchStart = useCallback((e, handle) => {
        setIsDragging(handle);
    }, []);

    const handleTouchMove = useCallback((e) => {
        if (!isDragging || !e.touches[0]) return;
        const fakeEvent = { clientX: e.touches[0].clientX };
        handleMouseMove(fakeEvent);
    }, [isDragging, handleMouseMove]);

    const handleTouchEnd = useCallback(() => {
        handleMouseUp();
    }, [handleMouseUp]);

    // Calculate positions
    const startPercent = normalizeYear(localRange.start) * 100;
    const endPercent = normalizeYear(localRange.end) * 100;

    // Era markers positions
    const eraMarkers = [
        { era: 'ancient', year: -600 },
        { era: 'medieval', year: 500 },
        { era: 'enlightenment', year: 1600 },
        { era: '19th', year: 1850 },
        { era: 'contemporary', year: 1920 }
    ];

    const isFullRange = localRange.start === -600 && localRange.end === 1950;

    return (
        <div className={`time-slider-container ${className}`}>
            {/* Header with stats */}
            <div className="time-slider-header">
                <span className="time-slider-range">
                    {formatYear(localRange.start)} — {formatYear(localRange.end)}
                </span>
                <span className="time-slider-count">
                    {visibleCount} of {totalCount} philosophers
                </span>
                {!isFullRange && (
                    <button
                        className="time-slider-reset"
                        onClick={onReset}
                        aria-label="Reset time range"
                    >
                        Reset
                    </button>
                )}
            </div>

            {/* Slider track */}
            <div
                className="time-slider-track"
                ref={sliderRef}
            >
                {/* Era markers */}
                {eraMarkers.map(({ era, year }) => (
                    <EraMarker
                        key={era}
                        era={era}
                        position={normalizeYear(year) * 100}
                        isActive={currentEras.includes(era)}
                    />
                ))}

                {/* Selected range highlight */}
                <div
                    className="time-slider-range-fill"
                    style={{
                        left: `${startPercent}%`,
                        width: `${endPercent - startPercent}%`
                    }}
                    onMouseDown={(e) => handleMouseDown(e, 'range')}
                    onTouchStart={(e) => handleTouchStart(e, 'range')}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                />

                {/* Start handle */}
                <div
                    className={`time-slider-handle time-slider-handle-start ${isDragging === 'start' ? 'dragging' : ''}`}
                    style={{ left: `${startPercent}%` }}
                    onMouseDown={(e) => handleMouseDown(e, 'start')}
                    onTouchStart={(e) => handleTouchStart(e, 'start')}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    role="slider"
                    aria-label="Start year"
                    aria-valuenow={localRange.start}
                    aria-valuemin={-600}
                    aria-valuemax={localRange.end}
                    tabIndex={0}
                >
                    <span className="handle-tooltip">{formatYear(localRange.start)}</span>
                </div>

                {/* End handle */}
                <div
                    className={`time-slider-handle time-slider-handle-end ${isDragging === 'end' ? 'dragging' : ''}`}
                    style={{ left: `${endPercent}%` }}
                    onMouseDown={(e) => handleMouseDown(e, 'end')}
                    onTouchStart={(e) => handleTouchStart(e, 'end')}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    role="slider"
                    aria-label="End year"
                    aria-valuenow={localRange.end}
                    aria-valuemin={localRange.start}
                    aria-valuemax={1950}
                    tabIndex={0}
                >
                    <span className="handle-tooltip">{formatYear(localRange.end)}</span>
                </div>

                {/* Year labels at edges */}
                <span className="time-slider-label time-slider-label-start">600 BC</span>
                <span className="time-slider-label time-slider-label-end">1950</span>
            </div>
        </div>
    );
};

export default memo(TimeSlider);
