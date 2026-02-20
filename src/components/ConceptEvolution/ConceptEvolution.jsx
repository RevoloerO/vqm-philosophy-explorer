/**
 * ConceptEvolution Component
 * Shows how a concept evolved through philosophers over time
 * Horizontal timeline with philosopher nodes along the concept's history
 */

import React, { useState, useMemo, memo } from 'react';
import { parseYear, formatYear } from '../../utils/yearParser';
import timelineEvents from '../../pages/timelineEvents.json';
import philosophyConcepts from '../../pages/philosophyConcepts.json';
import './ConceptEvolution.css';

const ERA_COLORS = {
    'Ancient & Classical Thought': '#d4a574',
    'Medieval & Renaissance Philosophy': '#4a90d9',
    'The Age of Reason & Enlightenment': '#f5a623',
    '19th Century Philosophy': '#e74c3c',
    'Contemporary Thought': '#9b59b6'
};

const CATEGORY_COLORS = {
    'Core Branches': '#8b5cf6',
    'Metaphysical Concepts': '#d4a574',
    'Epistemological Concepts': '#4a90d9',
    'Ethical Concepts': '#f5a623',
    'Political & Social Concepts': '#e74c3c',
    'Methodologies & Schools': '#9b59b6'
};

const ConceptEvolution = ({ isOpen, onClose, initialConcept, onPhilosopherSelect }) => {
    const [selectedConcept, setSelectedConcept] = useState(initialConcept || null);
    const [hoveredPhilosopher, setHoveredPhilosopher] = useState(null);

    React.useEffect(() => {
        if (initialConcept) setSelectedConcept(initialConcept);
    }, [initialConcept]);

    // Build concept -> philosophers map
    const conceptPhilosophers = useMemo(() => {
        const map = new Map();
        philosophyConcepts.forEach(c => {
            const philosophers = timelineEvents
                .filter(p => (p.concepts || []).includes(c.concept))
                .sort((a, b) => parseYear(a.year) - parseYear(b.year));
            if (philosophers.length > 0) {
                map.set(c.concept, { ...c, philosophers });
            }
        });
        return map;
    }, []);

    // All concepts sorted by number of philosophers
    const allConcepts = useMemo(() => {
        return [...conceptPhilosophers.entries()]
            .map(([name, data]) => ({ name, ...data }))
            .sort((a, b) => b.philosophers.length - a.philosophers.length);
    }, [conceptPhilosophers]);

    // Selected concept data
    const conceptData = selectedConcept ? conceptPhilosophers.get(selectedConcept) : null;

    // Timeline bounds for selected concept
    const bounds = useMemo(() => {
        if (!conceptData) return { min: -600, max: 2000 };
        const years = conceptData.philosophers.map(p => parseYear(p.year));
        const min = Math.min(...years);
        const max = Math.max(...years);
        const padding = Math.max((max - min) * 0.15, 50);
        return { min: min - padding, max: max + padding };
    }, [conceptData]);

    const toPercent = (year) => {
        const range = bounds.max - bounds.min;
        return ((year - bounds.min) / range) * 100;
    };

    if (!isOpen) return null;

    return (
        <div className="concept-evo-overlay">
            <div className="concept-evo-panel">
                <header className="concept-evo-header">
                    <h2>Concept Evolution</h2>
                    <p className="concept-evo-subtitle">Trace how ideas evolved through thinkers over time</p>
                    <button className="concept-evo-close" onClick={onClose} aria-label="Close">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </button>
                </header>

                <div className="concept-evo-body">
                    {/* Concept selector */}
                    <div className="concept-evo-selector">
                        {allConcepts.map(c => {
                            const color = CATEGORY_COLORS[c.category] || '#8b5cf6';
                            const isActive = selectedConcept === c.name;
                            return (
                                <button
                                    key={c.name}
                                    className={`concept-chip ${isActive ? 'active' : ''}`}
                                    style={{ '--chip-color': color }}
                                    onClick={() => setSelectedConcept(c.name)}
                                >
                                    <span className="chip-dot" style={{ backgroundColor: color }} />
                                    {c.name.replace(/([A-Z])/g, ' $1').trim()}
                                    <span className="chip-count">{c.philosophers.length}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Evolution timeline */}
                    {conceptData && (
                        <div className="concept-evo-timeline">
                            <div className="evo-concept-info">
                                <h3>{selectedConcept.replace(/([A-Z])/g, ' $1').trim()}</h3>
                                <p className="evo-concept-desc">{conceptData.simple || conceptData.detailed}</p>
                                <span className="evo-concept-category">{conceptData.category}</span>
                            </div>

                            <div className="evo-timeline-track">
                                {/* Timeline line */}
                                <div className="evo-line" />

                                {/* Philosopher nodes */}
                                {conceptData.philosophers.map((philosopher, index) => {
                                    const year = parseYear(philosopher.year);
                                    const left = toPercent(year);
                                    const color = ERA_COLORS[philosopher.era] || '#8b5cf6';
                                    const isHovered = hoveredPhilosopher === philosopher.id;

                                    return (
                                        <div
                                            key={philosopher.id}
                                            className={`evo-node ${isHovered ? 'hovered' : ''}`}
                                            style={{ left: `${left}%` }}
                                            onMouseEnter={() => setHoveredPhilosopher(philosopher.id)}
                                            onMouseLeave={() => setHoveredPhilosopher(null)}
                                            onClick={() => {
                                                onPhilosopherSelect?.(philosopher);
                                                onClose();
                                            }}
                                        >
                                            <div
                                                className="evo-node-dot"
                                                style={{ backgroundColor: color, borderColor: color }}
                                            />
                                            <div className={`evo-node-label ${index % 2 === 0 ? 'above' : 'below'}`}>
                                                <span className="evo-node-name">{philosopher.title}</span>
                                                <span className="evo-node-year">{philosopher.year}</span>
                                            </div>

                                            {/* Hover detail */}
                                            {isHovered && (
                                                <div className="evo-node-detail">
                                                    <strong>{philosopher.title}</strong>
                                                    <span>{philosopher.year}</span>
                                                    <p>{philosopher.summary}</p>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {!conceptData && (
                        <div className="concept-evo-empty">
                            Select a concept above to see its evolution
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default memo(ConceptEvolution);
