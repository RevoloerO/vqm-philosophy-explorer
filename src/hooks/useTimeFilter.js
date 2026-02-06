/**
 * useTimeFilter Hook
 * Manages era-based filtering and major/minor toggle of philosophers
 * in the constellation map
 */

import { useState, useMemo, useCallback } from 'react';

// Era name to key mapping
const ERA_KEY_MAP = {
    'Ancient & Classical Thought': 'ancient',
    'Medieval & Renaissance Philosophy': 'medieval',
    'The Age of Reason & Enlightenment': 'enlightenment',
    '19th Century Philosophy': '19th',
    'Contemporary Thought': 'contemporary'
};

// Era definitions with display labels and colors
const ERA_DEFINITIONS = {
    ancient:       { label: 'Ancient',       color: '#d4a574' },
    medieval:      { label: 'Medieval',      color: '#4a90d9' },
    enlightenment: { label: 'Enlightenment', color: '#f5a623' },
    '19th':        { label: '19th Century',  color: '#e74c3c' },
    contemporary:  { label: 'Contemporary',  color: '#9b59b6' }
};

/**
 * Get era key from philosopher's era name string
 */
const getEraKey = (eraName) => ERA_KEY_MAP[eraName] || 'ancient';

/**
 * Custom hook for era-based filtering and major/minor toggle
 * @param {Array} philosophers - Array of philosopher objects
 * @returns {Object} Era filter state and methods
 */
export const useTimeFilter = (philosophers) => {
    const [selectedEras, setSelectedEras] = useState(new Set());
    const [showMinor, setShowMinor] = useState(true); // true = show all, false = major only

    // Cache philosophers with their era keys
    const philosophersWithEras = useMemo(() => {
        return philosophers.map(p => ({
            ...p,
            eraKey: getEraKey(p.era)
        }));
    }, [philosophers]);

    // Calculate visibility and opacity for each philosopher
    const filteredPhilosophers = useMemo(() => {
        const hasEraFilter = selectedEras.size > 0;

        return philosophersWithEras.map(p => {
            const passesEraFilter = !hasEraFilter || selectedEras.has(p.eraKey);
            const passesTypeFilter = showMinor || p.type !== 'minor';
            const isVisible = passesEraFilter && passesTypeFilter;

            // If hidden by type filter, fully hide (opacity 0)
            // If hidden by era filter only, dim (opacity 0.15)
            let opacity = 1;
            if (!passesTypeFilter) {
                opacity = 0;
            } else if (!passesEraFilter) {
                opacity = 0.15;
            }

            return {
                ...p,
                isVisible,
                opacity
            };
        });
    }, [philosophersWithEras, selectedEras, showMinor]);

    // Get visible philosopher count
    const visibleCount = useMemo(() => {
        return filteredPhilosophers.filter(p => p.isVisible).length;
    }, [filteredPhilosophers]);

    // Toggle an era on/off
    const toggleEra = useCallback((era) => {
        setSelectedEras(prev => {
            const next = new Set(prev);
            if (next.has(era)) {
                next.delete(era);
            } else {
                next.add(era);
            }
            return next;
        });
    }, []);

    // Clear all era selections
    const clearEras = useCallback(() => {
        setSelectedEras(new Set());
    }, []);

    // Toggle major/minor visibility
    const toggleShowMinor = useCallback(() => {
        setShowMinor(prev => !prev);
    }, []);

    const hasActiveFilter = selectedEras.size > 0 || !showMinor;

    return {
        selectedEras,
        toggleEra,
        clearEras,
        filteredPhilosophers,
        visibleCount,
        totalCount: philosophers.length,
        hasActiveFilter,
        eraDefinitions: ERA_DEFINITIONS,
        showMinor,
        toggleShowMinor
    };
};

export default useTimeFilter;
