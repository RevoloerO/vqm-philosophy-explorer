/**
 * ComparePanel Component
 * Side-by-side comparison of two philosophers
 * Shows overlapping concepts, influence relationships, quotes, and timelines
 */

import React, { useState, useMemo, memo } from 'react';
import { parseBirthDeath, formatYear } from '../../utils/yearParser';
import timelineEvents from '../../pages/timelineEvents.json';
import './ComparePanel.css';

const ERA_COLORS = {
    'Ancient & Classical Thought': '#d4a574',
    'Medieval & Renaissance Philosophy': '#4a90d9',
    'The Age of Reason & Enlightenment': '#f5a623',
    '19th Century Philosophy': '#e74c3c',
    'Contemporary Thought': '#9b59b6'
};

const ComparePanel = ({ isOpen, onClose, initialPhilosopher }) => {
    const [philosopherA, setPhilosopherA] = useState(initialPhilosopher || null);
    const [philosopherB, setPhilosopherB] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Reset when initial philosopher changes
    React.useEffect(() => {
        if (initialPhilosopher) {
            setPhilosopherA(initialPhilosopher);
            setPhilosopherB(null);
        }
    }, [initialPhilosopher]);

    // Search filter for choosing philosopher B
    const searchResults = useMemo(() => {
        if (!searchQuery.trim()) return [];
        const query = searchQuery.toLowerCase();
        return timelineEvents
            .filter(p => p.id !== philosopherA?.id && p.title.toLowerCase().includes(query))
            .slice(0, 8);
    }, [searchQuery, philosopherA]);

    // Concept analysis
    const conceptAnalysis = useMemo(() => {
        if (!philosopherA || !philosopherB) return null;

        const aSet = new Set(philosopherA.concepts || []);
        const bSet = new Set(philosopherB.concepts || []);
        const shared = [...aSet].filter(c => bSet.has(c));
        const onlyA = [...aSet].filter(c => !bSet.has(c));
        const onlyB = [...bSet].filter(c => !aSet.has(c));

        return { shared, onlyA, onlyB };
    }, [philosopherA, philosopherB]);

    // Influence relationship
    const influenceRelation = useMemo(() => {
        if (!philosopherA || !philosopherB) return null;

        const aInfluencedB = (philosopherB.influenced_by || []).includes(philosopherA.id);
        const bInfluencedA = (philosopherA.influenced_by || []).includes(philosopherB.id);

        if (aInfluencedB && bInfluencedA) return 'mutual';
        if (aInfluencedB) return 'a-to-b';
        if (bInfluencedA) return 'b-to-a';
        return null;
    }, [philosopherA, philosopherB]);

    // Temporal overlap
    const temporalOverlap = useMemo(() => {
        if (!philosopherA || !philosopherB) return null;

        const a = parseBirthDeath(philosopherA);
        const b = parseBirthDeath(philosopherB);

        const overlapStart = Math.max(a.birth, b.birth);
        const overlapEnd = Math.min(a.death, b.death);
        const overlapYears = overlapEnd - overlapStart;

        return {
            a, b,
            overlap: overlapYears > 0 ? overlapYears : 0,
            overlapStart: overlapYears > 0 ? overlapStart : null,
            overlapEnd: overlapYears > 0 ? overlapEnd : null
        };
    }, [philosopherA, philosopherB]);

    if (!isOpen) return null;

    const colorA = philosopherA ? ERA_COLORS[philosopherA.era] || '#8b5cf6' : '#8b5cf6';
    const colorB = philosopherB ? ERA_COLORS[philosopherB.era] || '#8b5cf6' : '#8b5cf6';

    const renderPhilosopherColumn = (philosopher, color, label) => {
        if (!philosopher) return null;
        return (
            <div className="compare-column">
                <div className="compare-era-bar" style={{ backgroundColor: color }} />
                <span className="compare-label">{label}</span>
                <h3 className="compare-name">{philosopher.title}</h3>
                <p className="compare-year">{philosopher.fullYear || philosopher.year}</p>
                <p className="compare-era-name">{philosopher.era}</p>
                <blockquote className="compare-summary">"{philosopher.summary}"</blockquote>

                {/* Quotes */}
                {philosopher.quotes && philosopher.quotes.length > 0 && (
                    <div className="compare-quotes">
                        {philosopher.quotes.slice(0, 2).map((q, i) => (
                            <p key={i} className="compare-quote-item">"{q.text}"</p>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="compare-overlay">
            <div className="compare-panel">
                <header className="compare-header">
                    <h2>Philosopher Comparison</h2>
                    <button className="compare-close" onClick={onClose} aria-label="Close">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </button>
                </header>

                <div className="compare-body">
                    {/* Two columns */}
                    <div className="compare-columns">
                        {renderPhilosopherColumn(philosopherA, colorA, 'A')}

                        <div className="compare-divider">
                            <span className="compare-vs">VS</span>
                        </div>

                        {philosopherB ? (
                            renderPhilosopherColumn(philosopherB, colorB, 'B')
                        ) : (
                            <div className="compare-column compare-select">
                                <h3 className="compare-select-title">Choose a philosopher</h3>
                                <input
                                    className="compare-search"
                                    type="text"
                                    placeholder="Search philosophers..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    autoFocus
                                />
                                <div className="compare-search-results">
                                    {searchQuery.trim() === '' ? (
                                        timelineEvents
                                            .filter(p => p.id !== philosopherA?.id)
                                            .slice(0, 8)
                                            .map(p => (
                                                <button
                                                    key={p.id}
                                                    className="compare-search-item"
                                                    onClick={() => { setPhilosopherB(p); setSearchQuery(''); }}
                                                >
                                                    <span className="search-item-dot" style={{ backgroundColor: ERA_COLORS[p.era] || '#8b5cf6' }} />
                                                    <span>{p.title}</span>
                                                    <span className="search-item-year">{p.year}</span>
                                                </button>
                                            ))
                                    ) : (
                                        searchResults.map(p => (
                                            <button
                                                key={p.id}
                                                className="compare-search-item"
                                                onClick={() => { setPhilosopherB(p); setSearchQuery(''); }}
                                            >
                                                <span className="search-item-dot" style={{ backgroundColor: ERA_COLORS[p.era] || '#8b5cf6' }} />
                                                <span>{p.title}</span>
                                                <span className="search-item-year">{p.year}</span>
                                            </button>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Analysis section (only when both selected) */}
                    {philosopherA && philosopherB && conceptAnalysis && (
                        <div className="compare-analysis">
                            {/* Concept Venn */}
                            <div className="compare-section">
                                <h4 className="compare-section-title">Concept Overlap</h4>
                                <div className="compare-venn">
                                    <div className="venn-only" style={{ borderColor: colorA }}>
                                        <span className="venn-label" style={{ color: colorA }}>Only {philosopherA.title.split(' ')[0]}</span>
                                        {conceptAnalysis.onlyA.map(c => (
                                            <span key={c} className="venn-concept">{c.replace(/([A-Z])/g, ' $1').trim()}</span>
                                        ))}
                                        {conceptAnalysis.onlyA.length === 0 && <span className="venn-empty">None</span>}
                                    </div>

                                    <div className="venn-shared">
                                        <span className="venn-label venn-label-shared">Shared</span>
                                        {conceptAnalysis.shared.map(c => (
                                            <span key={c} className="venn-concept venn-concept-shared">{c.replace(/([A-Z])/g, ' $1').trim()}</span>
                                        ))}
                                        {conceptAnalysis.shared.length === 0 && <span className="venn-empty">No shared concepts</span>}
                                    </div>

                                    <div className="venn-only" style={{ borderColor: colorB }}>
                                        <span className="venn-label" style={{ color: colorB }}>Only {philosopherB.title.split(' ')[0]}</span>
                                        {conceptAnalysis.onlyB.map(c => (
                                            <span key={c} className="venn-concept">{c.replace(/([A-Z])/g, ' $1').trim()}</span>
                                        ))}
                                        {conceptAnalysis.onlyB.length === 0 && <span className="venn-empty">None</span>}
                                    </div>
                                </div>
                            </div>

                            {/* Influence Relationship */}
                            {influenceRelation && (
                                <div className="compare-section">
                                    <h4 className="compare-section-title">Influence Relationship</h4>
                                    <div className="compare-influence">
                                        {influenceRelation === 'a-to-b' && (
                                            <p>{philosopherA.title} <span className="influence-arrow-text">influenced</span> {philosopherB.title}</p>
                                        )}
                                        {influenceRelation === 'b-to-a' && (
                                            <p>{philosopherB.title} <span className="influence-arrow-text">influenced</span> {philosopherA.title}</p>
                                        )}
                                        {influenceRelation === 'mutual' && (
                                            <p>Mutual influence between {philosopherA.title} and {philosopherB.title}</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Temporal Overlap */}
                            {temporalOverlap && (
                                <div className="compare-section">
                                    <h4 className="compare-section-title">Timeline</h4>
                                    <div className="compare-timeline-info">
                                        {temporalOverlap.overlap > 0 ? (
                                            <p className="overlap-text">
                                                Overlapped for <strong>{temporalOverlap.overlap} years</strong>
                                                {' '}({formatYear(temporalOverlap.overlapStart)} - {formatYear(temporalOverlap.overlapEnd)})
                                            </p>
                                        ) : (
                                            <p className="overlap-text">
                                                No temporal overlap ({Math.abs(temporalOverlap.a.death - temporalOverlap.b.birth)} years apart)
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Swap button */}
                            <button
                                className="compare-swap-btn"
                                onClick={() => { setPhilosopherA(philosopherB); setPhilosopherB(philosopherA); }}
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width="16" height="16">
                                    <path d="M7 16l-4-4 4-4M17 8l4 4-4 4M3 12h18" />
                                </svg>
                                Swap
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default memo(ComparePanel);
