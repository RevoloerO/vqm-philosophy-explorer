/**
 * Year Parser Utility
 * Parses historical year strings into numeric values for positioning
 *
 * Examples:
 * "c. 600 BC" → -600
 * "c. 387 BC" → -387
 * "1637" → 1637
 * "c. 400 AD" → 400
 * "c. 1020 AD" → 1020
 */

/**
 * Parse a year string to a numeric value
 * BC years are negative, AD years are positive
 * @param {string} yearStr - Year string like "c. 600 BC" or "1637"
 * @returns {number} Numeric year value
 */
export const parseYear = (yearStr) => {
    if (!yearStr || typeof yearStr !== 'string') return 0;

    // Remove common prefixes like "c." (circa)
    const cleaned = yearStr.replace(/c\.\s*/i, '').trim();

    // Match patterns: "600 BC", "400 AD", "1637", etc.
    const match = cleaned.match(/(\d+)\s*(BC|AD|BCE|CE)?/i);

    if (!match) return 0;

    const num = parseInt(match[1], 10);
    const era = match[2]?.toUpperCase();

    // BC/BCE years are negative
    if (era === 'BC' || era === 'BCE') {
        return -num;
    }

    return num;
};

/**
 * Normalize a year to a 0-1 range based on min/max bounds
 * @param {number} year - Numeric year
 * @param {number} minYear - Minimum year (default: -600 for 600 BC)
 * @param {number} maxYear - Maximum year (default: 1950)
 * @returns {number} Normalized value between 0 and 1
 */
export const normalizeYear = (year, minYear = -600, maxYear = 1950) => {
    const range = maxYear - minYear;
    if (range === 0) return 0.5;
    return (year - minYear) / range;
};

/**
 * Convert a normalized position back to a year
 * @param {number} normalized - Value between 0 and 1
 * @param {number} minYear - Minimum year
 * @param {number} maxYear - Maximum year
 * @returns {number} Year value
 */
export const denormalizeYear = (normalized, minYear = -600, maxYear = 1950) => {
    const range = maxYear - minYear;
    return Math.round(minYear + normalized * range);
};

/**
 * Format a numeric year for display
 * @param {number} year - Numeric year (negative for BC)
 * @returns {string} Formatted year string like "600 BC" or "1637 AD"
 */
export const formatYear = (year) => {
    if (year < 0) {
        return `${Math.abs(year)} BC`;
    } else if (year < 500) {
        return `${year} AD`;
    }
    return `${year}`;
};

/**
 * Get era name from year
 * @param {number} year - Numeric year
 * @returns {string} Era key for styling
 */
export const getEraFromYear = (year) => {
    if (year < 500) return 'ancient';
    if (year < 1500) return 'medieval';
    if (year < 1800) return 'enlightenment';
    if (year < 1900) return '19th';
    return 'contemporary';
};

/**
 * Era boundaries for the time slider markers
 */
export const ERA_BOUNDARIES = [
    { year: -600, label: '600 BC', era: 'ancient' },
    { year: 0, label: '0', era: 'ancient' },
    { year: 500, label: '500', era: 'medieval' },
    { year: 1500, label: '1500', era: 'enlightenment' },
    { year: 1800, label: '1800', era: '19th' },
    { year: 1900, label: '1900', era: 'contemporary' },
    { year: 1950, label: '1950', era: 'contemporary' }
];

export default {
    parseYear,
    normalizeYear,
    denormalizeYear,
    formatYear,
    getEraFromYear,
    ERA_BOUNDARIES
};
