/**
 * PhilosopherPanel Component
 * A slide-in side panel that displays philosopher details
 * Includes connected thinkers, influences, quotes, and key developments
 */

import React, { memo, useMemo } from 'react';

const ERA_COLORS = {
    'Ancient & Classical Thought': '#d4a574',
    'Medieval & Renaissance Philosophy': '#4a90d9',
    'The Age of Reason & Enlightenment': '#f5a623',
    '19th Century Philosophy': '#e74c3c',
    'Contemporary Thought': '#9b59b6'
};

const PhilosopherPanel = ({
    philosopher,
    isOpen,
    onClose,
    conceptsMap,
    hoveredConcept,
    onConceptHover,
    onNavigateToPhilosopher,
    connections,
    allPhilosophers,
    onCompare
}) => {
    const eraColor = philosopher ? ERA_COLORS[philosopher.era] || '#8b5cf6' : '#8b5cf6';

    // Find connected philosophers (shared concepts)
    const connectedPhilosophers = useMemo(() => {
        if (!philosopher || !connections) return [];

        const connected = new Map();
        connections.forEach(conn => {
            if (conn.from === philosopher.id && conn.to !== philosopher.id) {
                if (!connected.has(conn.to)) {
                    connected.set(conn.to, { id: conn.to, concepts: [] });
                }
                connected.get(conn.to).concepts.push(conn.concept);
            } else if (conn.to === philosopher.id && conn.from !== philosopher.id) {
                if (!connected.has(conn.from)) {
                    connected.set(conn.from, { id: conn.from, concepts: [] });
                }
                connected.get(conn.from).concepts.push(conn.concept);
            }
        });

        return Array.from(connected.values()).map(c => {
            const phil = allPhilosophers.find(p => p.id === c.id);
            return { ...c, philosopher: phil };
        }).filter(c => c.philosopher);
    }, [philosopher, connections, allPhilosophers]);

    // Find influence relationships
    const { influencedBy, influenced } = useMemo(() => {
        if (!philosopher || !allPhilosophers) return { influencedBy: [], influenced: [] };

        const influencedBy = (philosopher.influenced_by || [])
            .map(id => allPhilosophers.find(p => p.id === id))
            .filter(Boolean);

        const influenced = allPhilosophers.filter(p =>
            (p.influenced_by || []).includes(philosopher.id)
        );

        return { influencedBy, influenced };
    }, [philosopher, allPhilosophers]);

    if (!philosopher) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className={`panel-backdrop ${isOpen ? 'open' : ''}`}
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Panel */}
            <aside
                className={`philosopher-panel ${isOpen ? 'open' : ''}`}
                style={{ '--era-color': eraColor }}
                role="dialog"
                aria-labelledby="panel-title"
                aria-modal="true"
            >
                {/* Close button */}
                <button
                    className="panel-close-btn"
                    onClick={onClose}
                    aria-label="Close panel"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                </button>

                {/* Header with era accent */}
                <header className="panel-header">
                    <div className="panel-era-indicator" style={{ backgroundColor: eraColor }} />
                    <div className="panel-type-badge" data-type={philosopher.type || 'major'}>
                        {philosopher.type === 'minor' ? 'Minor Figure' : 'Major Figure'}
                    </div>
                    <h2 id="panel-title" className="panel-title">{philosopher.title}</h2>
                    <p className="panel-year">{philosopher.fullYear || philosopher.year}</p>
                    <p className="panel-era">{philosopher.era}</p>
                    {onCompare && (
                        <button
                            className="panel-compare-btn"
                            onClick={() => onCompare(philosopher)}
                            title="Compare with another philosopher"
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width="14" height="14">
                                <path d="M16 3h5v5M8 3H3v5M16 21h5v-5M8 21H3v-5" />
                            </svg>
                            Compare
                        </button>
                    )}
                </header>

                {/* Summary quote */}
                <blockquote className="panel-summary">
                    "{philosopher.summary}"
                </blockquote>

                {/* Description */}
                <section className="panel-section">
                    <p className="panel-description">{philosopher.description}</p>
                </section>

                {/* Memorable Quotes */}
                {philosopher.quotes && philosopher.quotes.length > 0 && (
                    <section className="panel-section panel-quotes">
                        <h3 className="panel-section-title">Notable Quotes</h3>
                        <div className="panel-quotes-list">
                            {philosopher.quotes.map((quote, index) => (
                                <blockquote key={index} className="panel-quote-item" style={{ borderLeftColor: eraColor }}>
                                    <p className="quote-text">"{quote.text}"</p>
                                    {quote.source && <cite className="quote-source">— {quote.source}</cite>}
                                </blockquote>
                            ))}
                        </div>
                    </section>
                )}

                {/* Concepts */}
                <section className="panel-section">
                    <h3 className="panel-section-title">Key Concepts</h3>
                    <div className="panel-concepts">
                        {philosopher.concepts?.map(concept => {
                            const conceptData = conceptsMap?.get(concept);
                            const isHighlighted = hoveredConcept === concept;
                            return (
                                <button
                                    key={concept}
                                    className={`panel-concept-tag ${isHighlighted ? 'highlighted' : ''}`}
                                    title={conceptData?.simple}
                                    onMouseEnter={() => onConceptHover?.(concept)}
                                    onMouseLeave={() => onConceptHover?.(null)}
                                    onClick={() => onConceptHover?.(concept)}
                                >
                                    <span className="concept-dot" style={{ backgroundColor: eraColor }} />
                                    {concept.replace(/([A-Z])/g, ' $1').trim()}
                                </button>
                            );
                        })}
                    </div>
                </section>

                {/* Influenced By */}
                {influencedBy.length > 0 && (
                    <section className="panel-section">
                        <h3 className="panel-section-title">Influenced By</h3>
                        <div className="panel-connections">
                            {influencedBy.map(phil => (
                                <button
                                    key={phil.id}
                                    className="panel-connection-item panel-influence-item"
                                    onClick={() => onNavigateToPhilosopher?.(phil.id)}
                                >
                                    <svg className="influence-icon" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth={2} width="14" height="14">
                                        <path d="M12 19V5M5 12l7-7 7 7" />
                                    </svg>
                                    <span className="connection-name">{phil.title}</span>
                                    <span className="connection-concepts">{phil.era}</span>
                                    <svg className="connection-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                        <path d="M5 12h14M12 5l7 7-7 7" />
                                    </svg>
                                </button>
                            ))}
                        </div>
                    </section>
                )}

                {/* Influenced (students/followers) */}
                {influenced.length > 0 && (
                    <section className="panel-section">
                        <h3 className="panel-section-title">Influenced</h3>
                        <div className="panel-connections">
                            {influenced.slice(0, 5).map(phil => (
                                <button
                                    key={phil.id}
                                    className="panel-connection-item panel-influence-item"
                                    onClick={() => onNavigateToPhilosopher?.(phil.id)}
                                >
                                    <svg className="influence-icon" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth={2} width="14" height="14">
                                        <path d="M12 5v14M5 12l7 7 7-7" />
                                    </svg>
                                    <span className="connection-name">{phil.title}</span>
                                    <span className="connection-concepts">{phil.era}</span>
                                    <svg className="connection-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                        <path d="M5 12h14M12 5l7 7-7 7" />
                                    </svg>
                                </button>
                            ))}
                        </div>
                    </section>
                )}

                {/* Connected Philosophers (shared concepts) */}
                {connectedPhilosophers.length > 0 && (
                    <section className="panel-section">
                        <h3 className="panel-section-title">Connected Thinkers</h3>
                        <div className="panel-connections">
                            {connectedPhilosophers.slice(0, 5).map(conn => (
                                <button
                                    key={conn.id}
                                    className="panel-connection-item"
                                    onClick={() => onNavigateToPhilosopher?.(conn.id)}
                                >
                                    <span className="connection-name">{conn.philosopher.title}</span>
                                    <span className="connection-concepts">
                                        {conn.concepts.slice(0, 2).join(', ')}
                                        {conn.concepts.length > 2 && ` +${conn.concepts.length - 2}`}
                                    </span>
                                    <svg className="connection-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                        <path d="M5 12h14M12 5l7 7-7 7" />
                                    </svg>
                                </button>
                            ))}
                        </div>
                    </section>
                )}

                {/* Mini Events */}
                {philosopher.miniEvents && philosopher.miniEvents.length > 0 && (
                    <section className="panel-section panel-mini-events">
                        <h3 className="panel-section-title">Key Developments</h3>
                        <div className="panel-events-list">
                            {philosopher.miniEvents.map((mini, index) => (
                                <article key={mini.id} className="panel-event-item">
                                    <div className="event-marker">
                                        <span className="event-number">{index + 1}</span>
                                    </div>
                                    <div className="event-content">
                                        <h4 className="event-title">{mini.title}</h4>
                                        <p className="event-summary">{mini.summary}</p>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>
                )}
            </aside>
        </>
    );
};

export default memo(PhilosopherPanel);
