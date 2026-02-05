/**
 * Constellation Layout Algorithm
 * Computes star positions for the constellation map view
 *
 * X-axis: Based on historical time (earlier left, later right)
 * Y-axis: Based on conceptual clustering (shared concepts pull stars closer)
 */

import { parseYear, normalizeYear } from './yearParser.js';

/**
 * Era mapping for color/styling
 */
const ERA_MAPPING = {
    'Ancient & Classical Thought': 'ancient',
    'Medieval & Renaissance Philosophy': 'medieval',
    'The Age of Reason & Enlightenment': 'enlightenment',
    '19th Century Philosophy': '19th',
    'Contemporary Thought': 'contemporary'
};

/**
 * Get era key from era name
 */
export const getEraKey = (eraName) => ERA_MAPPING[eraName] || 'ancient';

/**
 * Compute initial star positions based on time
 * @param {Array} philosophers - Array of philosopher objects from timelineEvents
 * @param {Object} canvasSize - { width, height }
 * @returns {Array} Array of position objects { id, x, y, philosopher, era }
 */
export const computeInitialPositions = (philosophers, canvasSize) => {
    const { width, height } = canvasSize;
    const padding = 100; // Edge padding

    return philosophers.map((philosopher, index) => {
        const year = parseYear(philosopher.year);
        const normalizedX = normalizeYear(year);

        // X position based on time
        const x = padding + normalizedX * (width - padding * 2);

        // Initial Y position: staggered to avoid overlap, with some randomness
        // Use a seeded "random" based on id for consistency
        const seed = philosopher.id * 137.5;
        const pseudoRandom = (Math.sin(seed) + 1) / 2; // 0-1 range
        const baseY = height * 0.2 + pseudoRandom * height * 0.6;

        return {
            id: philosopher.id,
            x,
            y: baseY,
            philosopher,
            era: getEraKey(philosopher.era),
            year,
            concepts: philosopher.concepts || []
        };
    });
};

/**
 * Build a map of concepts to philosopher IDs
 * @param {Array} philosophers - Array of philosopher objects
 * @returns {Map} Map of concept -> [philosopherId, ...]
 */
export const buildConceptMap = (philosophers) => {
    const conceptMap = new Map();

    philosophers.forEach(p => {
        (p.concepts || []).forEach(concept => {
            if (!conceptMap.has(concept)) {
                conceptMap.set(concept, []);
            }
            conceptMap.get(concept).push(p.id);
        });
    });

    return conceptMap;
};

/**
 * Apply concept gravity - pull philosophers with shared concepts closer on Y-axis
 * @param {Array} positions - Current positions array
 * @param {Map} conceptMap - Map of concept -> philosopherIds
 * @param {number} strength - Gravity strength (0-1)
 * @returns {Array} Updated positions
 */
const applyConceptGravity = (positions, conceptMap, strength = 0.1) => {
    const positionMap = new Map(positions.map(p => [p.id, p]));

    return positions.map(pos => {
        // Find all philosophers that share concepts with this one
        const sharedWith = new Set();
        pos.concepts.forEach(concept => {
            const others = conceptMap.get(concept) || [];
            others.forEach(id => {
                if (id !== pos.id) sharedWith.add(id);
            });
        });

        if (sharedWith.size === 0) return pos;

        // Calculate average Y of connected philosophers
        let sumY = 0;
        let count = 0;
        sharedWith.forEach(id => {
            const other = positionMap.get(id);
            if (other) {
                sumY += other.y;
                count++;
            }
        });

        if (count === 0) return pos;

        const avgY = sumY / count;
        // Pull toward average Y
        const newY = pos.y + (avgY - pos.y) * strength;

        return { ...pos, y: newY };
    });
};

/**
 * Apply repulsion between nearby stars to prevent overlap
 * @param {Array} positions - Current positions array
 * @param {number} minDistance - Minimum distance between stars
 * @param {number} strength - Repulsion strength
 * @returns {Array} Updated positions
 */
const applyRepulsion = (positions, minDistance = 80, strength = 0.5) => {
    return positions.map((pos, i) => {
        let dx = 0;
        let dy = 0;

        positions.forEach((other, j) => {
            if (i === j) return;

            const distX = pos.x - other.x;
            const distY = pos.y - other.y;
            const distance = Math.sqrt(distX * distX + distY * distY);

            if (distance < minDistance && distance > 0) {
                // Push away
                const force = (minDistance - distance) / minDistance * strength;
                dx += (distX / distance) * force * minDistance;
                dy += (distY / distance) * force * minDistance;
            }
        });

        return {
            ...pos,
            x: pos.x + dx * 0.1,
            y: pos.y + dy
        };
    });
};

/**
 * Apply boundary constraints to keep stars within canvas
 * @param {Array} positions - Current positions array
 * @param {Object} canvasSize - { width, height }
 * @param {number} padding - Edge padding
 * @returns {Array} Updated positions with boundary constraints
 */
const applyBoundaryConstraints = (positions, canvasSize, padding = 60) => {
    const { width, height } = canvasSize;

    return positions.map(pos => ({
        ...pos,
        x: Math.max(padding, Math.min(width - padding, pos.x)),
        y: Math.max(padding, Math.min(height - padding, pos.y))
    }));
};

/**
 * Main function: Compute final star positions with clustering
 * @param {Array} philosophers - Array of philosopher objects from timelineEvents
 * @param {Object} canvasSize - { width, height }
 * @param {number} iterations - Number of simulation iterations
 * @returns {Array} Final position objects
 */
export const computeStarPositions = (philosophers, canvasSize, iterations = 15) => {
    if (!philosophers || philosophers.length === 0) {
        return [];
    }

    // Start with time-based positions
    let positions = computeInitialPositions(philosophers, canvasSize);

    // Build concept relationship map
    const conceptMap = buildConceptMap(philosophers);

    // Run simulation iterations
    for (let i = 0; i < iterations; i++) {
        // Apply forces with decreasing strength over iterations
        const iterationProgress = i / iterations;
        const gravityStrength = 0.15 * (1 - iterationProgress * 0.5);
        const repulsionStrength = 0.3 * (1 - iterationProgress * 0.3);

        positions = applyConceptGravity(positions, conceptMap, gravityStrength);
        positions = applyRepulsion(positions, 80, repulsionStrength);
        positions = applyBoundaryConstraints(positions, canvasSize);
    }

    return positions;
};

/**
 * Recompute positions when canvas size changes
 * Maintains relative positions while scaling
 * @param {Array} currentPositions - Current position array
 * @param {Object} oldSize - Previous canvas size
 * @param {Object} newSize - New canvas size
 * @returns {Array} Scaled positions
 */
export const scalePositions = (currentPositions, oldSize, newSize) => {
    const scaleX = newSize.width / oldSize.width;
    const scaleY = newSize.height / oldSize.height;

    return currentPositions.map(pos => ({
        ...pos,
        x: pos.x * scaleX,
        y: pos.y * scaleY
    }));
};

export default {
    computeStarPositions,
    computeInitialPositions,
    buildConceptMap,
    scalePositions,
    getEraKey
};
