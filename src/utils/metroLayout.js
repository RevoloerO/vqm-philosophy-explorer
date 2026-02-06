/**
 * Metro Map Layout Algorithm
 * Transforms philosopher data into a transit-map style layout
 *
 * Key principles:
 * - Horizontal lines represent concept "routes"
 * - Philosophers are "stations" on these routes
 * - Multi-concept philosophers are "interchange stations"
 * - Time flows left to right
 */

import { parseYear, normalizeYear } from './yearParser.js';

/**
 * Concept line definitions with colors and vertical positions
 * Major concepts get their own "metro lines"
 */
export const METRO_LINES = {
    // Core philosophical branches
    'Metaphysics': { color: '#8b5cf6', label: 'Metaphysics Line', row: 0 },
    'Ethics': { color: '#10b981', label: 'Ethics Line', row: 1 },
    'Epistemology': { color: '#3b82f6', label: 'Knowledge Line', row: 2 },
    'PoliticalPhilosophy': { color: '#ef4444', label: 'Politics Line', row: 3 },
    'Logic': { color: '#f59e0b', label: 'Logic Line', row: 4 },

    // Schools and movements
    'Existentialism': { color: '#ec4899', label: 'Existentialism Line', row: 5 },
    'Theology': { color: '#6366f1', label: 'Theology Line', row: 6 },
};

// Secondary concepts that connect to main lines
export const SECONDARY_CONCEPTS = [
    'Rationalism', 'Empiricism', 'Idealism', 'Naturalism', 'Stoicism',
    'Dialectic', 'Phenomenology', 'Liberalism', 'Nihilism', 'Feminism',
    'Scholasticism', 'AnalyticPhilosophy', 'Utilitarianism', 'Absurdism',
    'Forms', 'FreeWill', 'MindBodyProblem', 'WillToPower', 'CategoricalImperative',
    'SocraticMethod', 'Historicism', 'Deconstruction', 'PhilosophyOfLanguage'
];

/**
 * Get the primary metro line for a philosopher
 * Based on their most significant concept
 */
const getPrimaryLine = (philosopher) => {
    const concepts = philosopher.concepts || [];

    // Priority order for assigning primary line
    const linePriority = Object.keys(METRO_LINES);

    for (const line of linePriority) {
        if (concepts.includes(line)) {
            return line;
        }
    }

    // Default to Metaphysics if no match
    return 'Metaphysics';
};

/**
 * Get all metro lines a philosopher belongs to
 */
const getPhilosopherLines = (philosopher) => {
    const concepts = philosopher.concepts || [];
    return concepts.filter(c => METRO_LINES[c]);
};

/**
 * Calculate metro station positions
 * @param {Array} philosophers - Array of philosopher objects
 * @param {Object} canvasSize - { width, height }
 * @returns {Object} { stations, lines, interchanges }
 */
export const computeMetroLayout = (philosophers, canvasSize) => {
    const { width, height } = canvasSize;
    const padding = { left: 120, right: 80, top: 100, bottom: 120 };

    const usableWidth = width - padding.left - padding.right;
    const usableHeight = height - padding.top - padding.bottom;

    const lineCount = Object.keys(METRO_LINES).length;
    const lineSpacing = usableHeight / (lineCount + 1);

    // Sort philosophers by year
    const sortedPhilosophers = [...philosophers].sort((a, b) => {
        return parseYear(a.year) - parseYear(b.year);
    });

    // Calculate X positions based on time
    const stations = sortedPhilosophers.map((philosopher) => {
        const year = parseYear(philosopher.year);
        const normalizedX = normalizeYear(year);
        const x = padding.left + normalizedX * usableWidth;

        // Get primary line for Y position
        const primaryLine = getPrimaryLine(philosopher);
        const lineConfig = METRO_LINES[primaryLine];
        const baseY = padding.top + (lineConfig.row + 1) * lineSpacing;

        // Get all lines this philosopher belongs to
        const allLines = getPhilosopherLines(philosopher);
        const isInterchange = allLines.length > 1;

        return {
            id: philosopher.id,
            philosopher,
            x,
            y: baseY,
            primaryLine,
            allLines,
            isInterchange,
            type: philosopher.type || 'major',
            era: philosopher.era,
            year
        };
    });

    // Resolve overlapping stations on the same line
    const resolvedStations = resolveOverlaps(stations, lineSpacing);

    // Build line path data
    const lines = buildLineData(resolvedStations, padding, usableWidth, lineSpacing);

    // Identify interchange connections
    const interchanges = buildInterchangeData(resolvedStations);

    return {
        stations: resolvedStations,
        lines,
        interchanges,
        lineSpacing,
        padding
    };
};

/**
 * Resolve overlapping stations
 */
const resolveOverlaps = (stations) => {
    const minDistance = 60;
    const resolved = [...stations];

    // Group by primary line
    const lineGroups = {};
    resolved.forEach(station => {
        if (!lineGroups[station.primaryLine]) {
            lineGroups[station.primaryLine] = [];
        }
        lineGroups[station.primaryLine].push(station);
    });

    // Resolve overlaps within each line
    Object.values(lineGroups).forEach(group => {
        group.sort((a, b) => a.x - b.x);

        for (let i = 1; i < group.length; i++) {
            const prev = group[i - 1];
            const curr = group[i];

            if (curr.x - prev.x < minDistance) {
                // Offset vertically
                curr.y += (i % 2 === 0 ? -1 : 1) * 25;
            }
        }
    });

    return resolved;
};

/**
 * Build metro line path data
 */
const buildLineData = (stations, padding, usableWidth, lineSpacing) => {
    const lines = {};

    Object.entries(METRO_LINES).forEach(([concept, config]) => {
        // Get stations on this line
        const lineStations = stations
            .filter(s => s.allLines.includes(concept))
            .sort((a, b) => a.x - b.x);

        if (lineStations.length === 0) {
            lines[concept] = {
                ...config,
                concept,
                stations: [],
                path: '',
                baseY: padding.top + (config.row + 1) * lineSpacing
            };
            return;
        }

        // Build SVG path through stations
        const baseY = padding.top + (config.row + 1) * lineSpacing;
        let path = '';

        // Start from left edge
        const firstStation = lineStations[0];
        path = `M ${padding.left} ${baseY}`;

        // Draw to first station
        if (firstStation.y === baseY) {
            path += ` L ${firstStation.x} ${baseY}`;
        } else {
            // Curve up or down to station
            const midX = (padding.left + firstStation.x) / 2;
            path += ` L ${midX - 20} ${baseY}`;
            path += ` Q ${midX} ${baseY}, ${midX} ${(baseY + firstStation.y) / 2}`;
            path += ` Q ${midX} ${firstStation.y}, ${midX + 20} ${firstStation.y}`;
            path += ` L ${firstStation.x} ${firstStation.y}`;
        }

        // Connect through remaining stations
        for (let i = 1; i < lineStations.length; i++) {
            const prev = lineStations[i - 1];
            const curr = lineStations[i];

            if (prev.y === curr.y) {
                // Same level - straight line
                path += ` L ${curr.x} ${curr.y}`;
            } else {
                // Different levels - smooth curve
                const midX = (prev.x + curr.x) / 2;
                path += ` L ${midX - 30} ${prev.y}`;
                path += ` C ${midX} ${prev.y}, ${midX} ${curr.y}, ${midX + 30} ${curr.y}`;
                path += ` L ${curr.x} ${curr.y}`;
            }
        }

        // Extend to right edge
        const lastStation = lineStations[lineStations.length - 1];
        if (lastStation.y !== baseY) {
            const midX = (lastStation.x + padding.left + usableWidth) / 2;
            path += ` L ${midX - 20} ${lastStation.y}`;
            path += ` Q ${midX} ${lastStation.y}, ${midX} ${(baseY + lastStation.y) / 2}`;
            path += ` Q ${midX} ${baseY}, ${midX + 20} ${baseY}`;
        }
        path += ` L ${padding.left + usableWidth + 40} ${baseY}`;

        lines[concept] = {
            ...config,
            concept,
            stations: lineStations,
            path,
            baseY
        };
    });

    return lines;
};

/**
 * Build interchange connection data
 */
const buildInterchangeData = (stations) => {
    const interchanges = [];

    stations.filter(s => s.isInterchange).forEach(station => {
        // Create connections between lines at this station
        const lines = station.allLines;

        for (let i = 0; i < lines.length - 1; i++) {
            for (let j = i + 1; j < lines.length; j++) {
                interchanges.push({
                    stationId: station.id,
                    lines: [lines[i], lines[j]],
                    x: station.x,
                    y: station.y
                });
            }
        }
    });

    return interchanges;
};

/**
 * Get era color
 */
export const getEraColor = (era) => {
    const colors = {
        'Ancient & Classical Thought': '#d4a574',
        'Medieval & Renaissance Philosophy': '#4a90d9',
        'The Age of Reason & Enlightenment': '#f5a623',
        '19th Century Philosophy': '#e74c3c',
        'Contemporary Thought': '#9b59b6'
    };
    return colors[era] || '#8b5cf6';
};

export default {
    computeMetroLayout,
    METRO_LINES,
    getEraColor
};
