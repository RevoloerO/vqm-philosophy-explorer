/**
 * PhilosopherPanel Component
 * A slide-in side panel that displays philosopher details
 * Replaces the centered modal for better UX
 */

import React, { memo, useMemo } from 'react';

/**
 * Era color mapping for styling
 */
const ERA_COLORS = {
    'Ancient & Classical Thought': '#d4a574',
    'Medieval & Renaissance Philosophy': '#4a90d9',
    'The Age of Reason & Enlightenment': '#f5a623',
    '19th Century Philosophy': '#e74c3c',
    'Contemporary Thought': '#9b59b6'
};

/**
 * PhilosopherPanel - Slide-in panel for philosopher details
 */
const PhilosopherPanel = ({
    philosopher,
    isOpen,
    onClose,
    conceptsMap,
    hoveredConcept,
    onConceptHover,
    onNavigateToPhilosopher,
    connections,
    allPhilosophers
}) => {
    const eraColor = philosopher ? ERA_COLORS[philosopher.era] || '#8b5cf6' : '#8b5cf6';

    // Find connected philosophers
    const connectedPhilosophers = useMemo(() => {
        if (!philosopher || !connections) return [];

        const connected = new Map();
        connections.forEach(conn => {
            if (conn.source === philosopher.id && conn.target !== philosopher.id) {
                if (!connected.has(conn.target)) {
                    connected.set(conn.target, { id: conn.target, concepts: [] });
                }
                connected.get(conn.target).concepts.push(conn.concept);
            } else if (conn.target === philosopher.id && conn.source !== philosopher.id) {
                if (!connected.has(conn.source)) {
                    connected.set(conn.source, { id: conn.source, concepts: [] });
                }
                connected.get(conn.source).concepts.push(conn.concept);
            }
        });

        return Array.from(connected.values()).map(c => {
            const phil = allPhilosophers.find(p => p.id === c.id);
            return { ...c, philosopher: phil };
        }).filter(c => c.philosopher);
    }, [philosopher, connections, allPhilosophers]);

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
                </header>

                {/* Summary quote */}
                <blockquote className="panel-summary">
                    "{philosopher.summary}"
                </blockquote>

                {/* Description */}
                <section className="panel-section">
                    <p className="panel-description">{philosopher.description}</p>
                </section>

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

                {/* Connected Philosophers */}
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
