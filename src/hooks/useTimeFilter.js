/**
 * useTimeFilter Hook
 * Manages time-based filtering of philosophers in the constellation map
 */

import { useState, useMemo, useCallback } from 'react';
import { parseYear, ERA_BOUNDARIES } from '../utils/yearParser';

// Default time range covering all philosophers
const DEFAULT_TIME_RANGE = {
    start: -600,  // 600 BC
    end: 1950     // 1950 AD
};

/**
 * Custom hook for time-based filtering
 * @param {Array} philosophers - Array of philosopher objects
 * @param {Object} initialRange - Initial time range { start, end }
 * @returns {Object} Time filter state and methods
 */
export const useTimeFilter = (philosophers, initialRange = DEFAULT_TIME_RANGE) => {
    const [timeRange, setTimeRange] = useState(initialRange);
    const [isAnimating, setIsAnimating] = useState(false);

    // Parse and cache philosopher years
    const philosophersWithYears = useMemo(() => {
        return philosophers.map(p => ({
            ...p,
            numericYear: parseYear(p.year)
        }));
    }, [philosophers]);

    // Calculate visibility and opacity for each philosopher
    const filteredPhilosophers = useMemo(() => {
        return philosophersWithYears.map(p => {
            const year = p.numericYear;
            const isVisible = year >= timeRange.start && year <= timeRange.end;

            // Calculate opacity based on proximity to edges
            let opacity = 1;
            if (!isVisible) {
                opacity = 0.15;
            } else {
                // Fade near edges
                const rangeSize = timeRange.end - timeRange.start;
                const fadeZone = rangeSize * 0.1; // 10% fade zone

                if (year - timeRange.start < fadeZone) {
                    opacity = 0.5 + 0.5 * ((year - timeRange.start) / fadeZone);
                } else if (timeRange.end - year < fadeZone) {
                    opacity = 0.5 + 0.5 * ((timeRange.end - year) / fadeZone);
                }
            }

            return {
                ...p,
                isVisible,
                opacity: Math.max(0.15, opacity)
            };
        });
    }, [philosophersWithYears, timeRange]);

    // Get visible philosopher count
    const visibleCount = useMemo(() => {
        return filteredPhilosophers.filter(p => p.isVisible).length;
    }, [filteredPhilosophers]);

    // Update time range with optional animation
    const updateTimeRange = useCallback((newRange, animate = false) => {
        if (animate) {
            setIsAnimating(true);
            // Animation would be handled by CSS transitions
            setTimeout(() => setIsAnimating(false), 400);
        }
        setTimeRange({
            start: Math.max(-600, newRange.start),
            end: Math.min(1950, newRange.end)
        });
    }, []);

    // Reset to full range
    const resetTimeRange = useCallback(() => {
        updateTimeRange(DEFAULT_TIME_RANGE, true);
    }, [updateTimeRange]);

    // Jump to a specific era
    const jumpToEra = useCallback((era) => {
        const eraRanges = {
            ancient: { start: -600, end: 400 },
            medieval: { start: 400, end: 1500 },
            enlightenment: { start: 1500, end: 1800 },
            '19th': { start: 1800, end: 1900 },
            contemporary: { start: 1900, end: 1950 }
        };

        const range = eraRanges[era];
        if (range) {
            updateTimeRange(range, true);
        }
    }, [updateTimeRange]);

    // Get current era(s) based on time range
    const currentEras = useMemo(() => {
        const eras = [];
        const boundaries = [
            { era: 'ancient', start: -600, end: 400 },
            { era: 'medieval', start: 400, end: 1500 },
            { era: 'enlightenment', start: 1500, end: 1800 },
            { era: '19th', start: 1800, end: 1900 },
            { era: 'contemporary', start: 1900, end: 1950 }
        ];

        boundaries.forEach(({ era, start, end }) => {
            if (timeRange.start <= end && timeRange.end >= start) {
                eras.push(era);
            }
        });

        return eras;
    }, [timeRange]);

    // Check if currently showing full range
    const isFullRange = timeRange.start === DEFAULT_TIME_RANGE.start &&
        timeRange.end === DEFAULT_TIME_RANGE.end;

    return {
        timeRange,
        setTimeRange: updateTimeRange,
        resetTimeRange,
        jumpToEra,
        filteredPhilosophers,
        visibleCount,
        totalCount: philosophers.length,
        currentEras,
        isFullRange,
        isAnimating,
        eraBoundaries: ERA_BOUNDARIES
    };
};

export default useTimeFilter;
