/**
 * TimelineAxis Component
 * Displays a subtle timeline indicator at the bottom of the map
 * showing the historical time progression from left to right
 */

import React, { memo, useMemo } from 'react';

/**
 * Timeline markers with approximate positions
 */
const TIMELINE_MARKERS = [
    { year: '600 BC', label: '600 BCE', position: 0 },
    { year: '300 BC', label: '300 BCE', position: 0.12 },
    { year: '1 AD', label: '1 CE', position: 0.24 },
    { year: '500 AD', label: '500 CE', position: 0.36 },
    { year: '1000 AD', label: '1000 CE', position: 0.45 },
    { year: '1400 AD', label: '1400 CE', position: 0.52 },
    { year: '1600', label: '1600', position: 0.58 },
    { year: '1750', label: '1750', position: 0.68 },
    { year: '1850', label: '1850', position: 0.78 },
    { year: '1950', label: '1950', position: 0.90 },
    { year: '2000', label: 'Present', position: 1 }
];

/**
 * Era backgrounds for the timeline
 */
const ERA_SEGMENTS = [
    { start: 0, end: 0.24, color: 'rgba(212, 165, 116, 0.3)', label: 'Ancient' },
    { start: 0.24, end: 0.52, color: 'rgba(74, 144, 217, 0.3)', label: 'Medieval' },
    { start: 0.52, end: 0.75, color: 'rgba(245, 166, 35, 0.3)', label: 'Enlightenment' },
    { start: 0.75, end: 0.88, color: 'rgba(231, 76, 60, 0.3)', label: '19th Century' },
    { start: 0.88, end: 1, color: 'rgba(155, 89, 182, 0.3)', label: 'Contemporary' }
];

const TimelineAxis = memo(({ canvasSize }) => {
    // Calculate visible range based on transform
    const visibleMarkers = useMemo(() => {
        const padding = 100;
        const usableWidth = canvasSize.width - padding * 2;

        return TIMELINE_MARKERS.map(marker => ({
            ...marker,
            x: padding + marker.position * usableWidth
        }));
    }, [canvasSize.width]);

    return (
        <div className="timeline-axis">
            {/* Era color segments */}
            <div className="timeline-eras">
                {ERA_SEGMENTS.map((era, index) => (
                    <div
                        key={index}
                        className="timeline-era-segment"
                        style={{
                            left: `${era.start * 100}%`,
                            width: `${(era.end - era.start) * 100}%`,
                            background: `linear-gradient(to right, transparent, ${era.color} 20%, ${era.color} 80%, transparent)`
                        }}
                        title={era.label}
                    />
                ))}
            </div>

            {/* Timeline line */}
            <div className="timeline-line" />

            {/* Year markers */}
            <div className="timeline-markers">
                {visibleMarkers.filter((_, i) => i % 2 === 0 || window.innerWidth > 1200).map((marker) => (
                    <div
                        key={marker.year}
                        className="timeline-marker"
                        style={{ left: `${marker.position * 100}%` }}
                    >
                        <div className="marker-tick" />
                        <span className="marker-label">{marker.label}</span>
                    </div>
                ))}
            </div>

            {/* Arrow indicating direction */}
            <div className="timeline-direction">
                <span>Time</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
            </div>
        </div>
    );
});

TimelineAxis.displayName = 'TimelineAxis';

export default TimelineAxis;
