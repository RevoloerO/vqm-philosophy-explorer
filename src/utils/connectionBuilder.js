/**
 * Connection Builder Utility
 * Builds constellation connections between philosophers based on shared concepts
 */

import { parseYear } from './yearParser.js';

/**
 * Build connections between philosophers who share concepts
 * @param {Array} philosophers - Array of philosopher objects
 * @param {Array} concepts - Array of concept objects
 * @returns {Array} Array of connection objects
 */
export const buildConstellations = (philosophers, concepts) => {
    const connections = [];
    const conceptMap = new Map();

    // Group philosophers by concept
    philosophers.forEach(philosopher => {
        (philosopher.concepts || []).forEach(concept => {
            if (!conceptMap.has(concept)) {
                conceptMap.set(concept, []);
            }
            conceptMap.get(concept).push(philosopher);
        });
    });

    // Get concept category from concepts array
    const conceptCategories = new Map(
        concepts.map(c => [c.concept, c.category])
    );

    // Create connections for each concept (forms a constellation)
    conceptMap.forEach((philosopherList, concept) => {
        if (philosopherList.length < 2) return; // Need at least 2 to connect

        // Sort philosophers by time (chronologically)
        const sorted = [...philosopherList].sort((a, b) => {
            return parseYear(a.year) - parseYear(b.year);
        });

        // Connect sequentially through time for cleaner visualization
        for (let i = 0; i < sorted.length - 1; i++) {
            connections.push({
                id: `${sorted[i].id}-${sorted[i + 1].id}-${concept}`,
                concept,
                category: conceptCategories.get(concept) || 'Unknown',
                from: sorted[i].id,
                to: sorted[i + 1].id,
                fromTitle: sorted[i].title,
                toTitle: sorted[i + 1].title
            });
        }
    });

    return connections;
};

/**
 * Get all connections for a specific concept
 * @param {Array} connections - All connections
 * @param {string} concept - Concept to filter by
 * @returns {Array} Filtered connections
 */
export const getConnectionsByConcept = (connections, concept) => {
    return connections.filter(c => c.concept === concept);
};

/**
 * Get all connections involving a specific philosopher
 * @param {Array} connections - All connections
 * @param {number} philosopherId - Philosopher ID to filter by
 * @returns {Array} Filtered connections
 */
export const getConnectionsByPhilosopher = (connections, philosopherId) => {
    return connections.filter(
        c => c.from === philosopherId || c.to === philosopherId
    );
};

/**
 * Get unique concepts from connections
 * @param {Array} connections - All connections
 * @returns {Array} Unique concept names with counts
 */
export const getConceptsFromConnections = (connections) => {
    const conceptCounts = {};

    connections.forEach(c => {
        conceptCounts[c.concept] = (conceptCounts[c.concept] || 0) + 1;
    });

    return Object.entries(conceptCounts)
        .map(([concept, count]) => ({ concept, count }))
        .sort((a, b) => b.count - a.count);
};

/**
 * Calculate connection strength (number of shared concepts between two philosophers)
 * @param {Array} connections - All connections
 * @param {number} id1 - First philosopher ID
 * @param {number} id2 - Second philosopher ID
 * @returns {number} Number of shared concepts (connection strength)
 */
export const getConnectionStrength = (connections, id1, id2) => {
    return connections.filter(c =>
        (c.from === id1 && c.to === id2) ||
        (c.from === id2 && c.to === id1)
    ).length;
};

/**
 * Group connections by category
 * @param {Array} connections - All connections
 * @returns {Object} Connections grouped by category
 */
export const groupConnectionsByCategory = (connections) => {
    return connections.reduce((groups, connection) => {
        const category = connection.category || 'Other';
        if (!groups[category]) {
            groups[category] = [];
        }
        groups[category].push(connection);
        return groups;
    }, {});
};

/**
 * Color mapping for concept categories
 */
export const CATEGORY_COLORS = {
    'Core Branches': '#8b5cf6',           // Purple
    'Metaphysical Concepts': '#d4a574',   // Gold (Ancient)
    'Epistemological Concepts': '#4a90d9', // Blue (Medieval)
    'Ethical Concepts': '#f5a623',        // Orange (Enlightenment)
    'Political & Social Concepts': '#e74c3c', // Red (19th)
    'Methodologies & Schools': '#9b59b6', // Purple (Contemporary)
    'Other': 'rgba(255, 255, 255, 0.4)'
};

/**
 * Get color for a connection based on its category
 * @param {string} category - Concept category
 * @returns {string} CSS color value
 */
export const getConnectionColor = (category) => {
    return CATEGORY_COLORS[category] || CATEGORY_COLORS['Other'];
};

export default {
    buildConstellations,
    getConnectionsByConcept,
    getConnectionsByPhilosopher,
    getConceptsFromConnections,
    getConnectionStrength,
    groupConnectionsByCategory,
    getConnectionColor,
    CATEGORY_COLORS
};
