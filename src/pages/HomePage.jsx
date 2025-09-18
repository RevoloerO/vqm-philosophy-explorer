import React, { useState, useEffect, useRef } from 'react';
import '../css/HomePage.css';
import timelineEvents from './timelineEvents.json';
import philosophyConcepts from './philosophyConcepts.json';

// Helper to convert array to a Map for quick lookups
const conceptsMap = new Map(philosophyConcepts.map(c => [c.concept, c]));

function HomePage() {
    const [eventModal, setEventModal] = useState(null);
    const [conceptModal, setConceptModal] = useState(null);
    const [focusedIndex, setFocusedIndex] = useState(0); // State for the single focused item
    const [showGoToTop, setShowGoToTop] = useState(false);
    const timelineRef = useRef(null);
    const progressRef = useRef(null);
    const itemRefs = useRef([]);

    // --- Modal Logic ---
    const openEventModal = (eventData) => setEventModal(eventData);
    const closeEventModal = () => setEventModal(null);
    const openConceptModal = (conceptData) => setConceptModal(conceptData);
    const closeConceptModal = () => setConceptModal(null);

    // --- Scroll To Top ---
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    // --- Scroll Animation Logic ---
    useEffect(() => {
        const handleScroll = () => {
            // Go to top button visibility
            if (window.scrollY > window.innerHeight / 2) {
                setShowGoToTop(true);
            } else {
                setShowGoToTop(false);
            }

            const timeline = timelineRef.current;
            const progress = progressRef.current;
            if (!timeline || !progress) return;

            // Animate progress line
            const timelineRect = timeline.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            const scrollPercent = -timelineRect.top / (timelineRect.height - windowHeight);
            const progressHeight = Math.min(Math.max(scrollPercent, 0), 1) * timelineRect.height;
            progress.style.height = `${progressHeight}px`;

            // Determine which item is most central in the viewport
            let closestIndex = -1;
            let minDistance = Infinity;
            const viewportCenter = windowHeight / 2;

            itemRefs.current.forEach((item, index) => {
                if (!item) return;
                const itemRect = item.getBoundingClientRect();
                const itemCenter = itemRect.top + itemRect.height / 2;
                const distance = Math.abs(viewportCenter - itemCenter);
                if (distance < minDistance) {
                    minDistance = distance;
                    closestIndex = index;
                }
            });

            if (closestIndex !== -1) {
                setFocusedIndex(closestIndex);
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Component for individual concept tags
    const ConceptTag = ({ concept }) => {
        const conceptData = conceptsMap.get(concept);
        if (!conceptData) return null;

        const handleClick = (e) => {
            e.stopPropagation();
            openConceptModal(conceptData);
        };

        return (
            <span className="concept-tag" onClick={handleClick}>
                {concept}
                <div className="tooltip">
                    <p className="tooltip-simple">{conceptData.simple}</p>
                    <p className="tooltip-prompt">Click for more details</p>
                </div>
            </span>
        );
    };


    return (
        <div className="homepage-container">
            <header className="hero-section">
                <h1 className="hero-title">Map of Thought</h1>
                <p className="hero-subtitle">
                    Explore the history of philosophy like never before. Navigate the branching river of human thought from ancient Greece to modern day.
                </p>
                <a href="#timeline" className="hero-cta">
                    Begin the Journey
                </a>
            </header>

            <main id="timeline" className="timeline-section" ref={timelineRef}>
                <div className="timeline-line"></div>
                <div className="timeline-progress" ref={progressRef}></div>
                <div className="timeline-items-container">
                    {timelineEvents.map((event, index) => {
                        const isFocused = index === focusedIndex;
                        return (
                            <div
                                key={event.id}
                                className={`timeline-item-wrapper align-${event.align} ${isFocused ? 'focused' : 'blurred'}`}
                                ref={el => itemRefs.current[index] = el}
                            >
                                <div className="timeline-item-content" onClick={() => isFocused && openEventModal(event)}>
                                    <div className="content-header">
                                        <h3>{event.title}</h3>
                                        <span>{event.year}</span>
                                    </div>
                                    <p>{event.summary}</p>
                                    <div className="concepts-container">
                                        {event.concepts.map(concept => (
                                            <ConceptTag key={concept} concept={concept} />
                                        ))}
                                    </div>
                                    {isFocused && (
                                        <div className="event-details-prompt">Click for more details</div>
                                    )}
                                </div>
                                <div className="timeline-dot"></div>
                            </div>
                        );
                    })}
                </div>
            </main>

            {/* Event Details Modal */}
            {eventModal && (
                 <div className="modal-overlay" onClick={closeEventModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2 className="modal-title">{eventModal.title}</h2>
                        <p className="modal-year">{eventModal.fullYear}</p>
                        <p className="modal-description">{eventModal.description}</p>
                        <div className="concepts-container modal-concepts">
                            {eventModal.concepts.map(concept => (
                                <ConceptTag key={concept} concept={concept} />
                            ))}
                        </div>
                        <button className="modal-close" onClick={closeEventModal}>Close</button>
                    </div>
                </div>
            )}

            {/* Concept Details Modal */}
            {conceptModal && (
                 <div className="modal-overlay" onClick={closeConceptModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2 className="modal-title">{conceptModal.concept}</h2>
                        <p className="modal-description">{conceptModal.detailed}</p>
                        <button className="modal-close" onClick={closeConceptModal}>Close</button>
                    </div>
                </div>
            )}

            <button
                className={`scroll-to-top ${showGoToTop ? 'visible' : ''}`}
                onClick={scrollToTop}
                aria-label="Go to top"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                </svg>
            </button>

            <footer className="footer">
                <p>&copy; 2025 Map of Thought. A VQM Project.</p>
            </footer>
        </div>
    );
}

export default HomePage;

