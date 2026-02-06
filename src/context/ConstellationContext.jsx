/**
 * ConstellationContext
 * Provides shared state between Timeline and Constellation views
 */

import React, { createContext, useContext, useState, useCallback } from 'react';

// Create context
const ConstellationContext = createContext(null);

/**
 * ConstellationProvider - Provides shared state to child components
 */
export const ConstellationProvider = ({ children }) => {
    // View mode: 'timeline' or 'constellation'
    const [viewMode, setViewMode] = useState('constellation');

    // Selected philosopher (shared between views)
    const [selectedPhilosopher, setSelectedPhilosopher] = useState(null);

    // Selected concept (shared between views)
    const [selectedConcept, setSelectedConcept] = useState(null);

    // Transition state for smooth view switching
    const [isTransitioning, setIsTransitioning] = useState(false);

    /**
     * Switch view with transition animation
     */
    const switchView = useCallback((newMode) => {
        if (newMode === viewMode) return;

        setIsTransitioning(true);

        // Allow CSS transition to start
        setTimeout(() => {
            setViewMode(newMode);

            // Complete transition
            setTimeout(() => {
                setIsTransitioning(false);
            }, 50);
        }, 300);
    }, [viewMode]);

    /**
     * Toggle between views
     */
    const toggleView = useCallback(() => {
        switchView(viewMode === 'timeline' ? 'constellation' : 'timeline');
    }, [viewMode, switchView]);

    /**
     * Select a philosopher (from either view)
     */
    const selectPhilosopher = useCallback((philosopher) => {
        setSelectedPhilosopher(philosopher);
        setSelectedConcept(null); // Clear concept selection
    }, []);

    /**
     * Select a concept (from either view)
     */
    const selectConcept = useCallback((concept) => {
        setSelectedConcept(concept);
    }, []);

    /**
     * Clear all selections
     */
    const clearSelection = useCallback(() => {
        setSelectedPhilosopher(null);
        setSelectedConcept(null);
    }, []);

    const value = {
        // View state
        viewMode,
        setViewMode: switchView,
        toggleView,
        isTransitioning,

        // Selection state
        selectedPhilosopher,
        setSelectedPhilosopher: selectPhilosopher,
        selectedConcept,
        setSelectedConcept: selectConcept,
        clearSelection
    };

    return (
        <ConstellationContext.Provider value={value}>
            {children}
        </ConstellationContext.Provider>
    );
};

/**
 * Custom hook to use constellation context
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useConstellationContext = () => {
    const context = useContext(ConstellationContext);
    if (!context) {
        throw new Error('useConstellationContext must be used within a ConstellationProvider');
    }
    return context;
};

export default ConstellationContext;
