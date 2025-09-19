import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import '../css/HomePage.css';
import timelineEvents from './timelineEvents.json';
import philosophyConcepts from './philosophyConcepts.json';

const conceptsMap = new Map(philosophyConcepts.map(c => [c.concept, c]));

function HomePage() {
    const [eventModal, setEventModal] = useState(null);
    const [conceptModal, setConceptModal] = useState(null);
    const [focusedIndex, setFocusedIndex] = useState(null);
    const [showGoToTop, setShowGoToTop] = useState(false);
    const [vortexPath, setVortexPath] = useState('');

    const timelineRef = useRef(null);
    const itemRefs = useRef([]);
    const ctaRef = useRef(null);
    itemRefs.current = []; // Clear refs on re-render

    const addToRefs = (el) => {
        if (el && !itemRefs.current.includes(el)) {
            itemRefs.current.push(el);
        }
    };

    const drawVortexPath = () => {
        const ctaButton = ctaRef.current;
        if (!ctaButton || itemRefs.current.length === 0 || !timelineRef.current) return;

        const timelineContainerRect = timelineRef.current.getBoundingClientRect();
        
        const startPoint = ctaButton.getBoundingClientRect();
        const startX = startPoint.left + startPoint.width / 2 - timelineContainerRect.left;
        const startY = startPoint.bottom - timelineContainerRect.top;

        let pathData = `M ${startX},${startY}`;
        let lastX = startX;
        let lastY = startY;

        itemRefs.current.forEach((item) => {
            if (!item) return;
            const dot = item.querySelector('.timeline-dot');
            if(!dot) return;
            const dotRect = dot.getBoundingClientRect();
            
            const pointX = dotRect.left + dotRect.width / 2 - timelineContainerRect.left;
            const pointY = dotRect.top + dotRect.height / 2 - timelineContainerRect.top;

            const controlX1 = lastX;
            const controlY1 = lastY + (pointY - lastY) * 0.5;
            const controlX2 = pointX;
            const controlY2 = pointY - (pointY - lastY) * 0.5;
            
            pathData += ` C ${controlX1},${controlY1} ${controlX2},${controlY2} ${pointX},${pointY}`;
            lastX = pointX;
            lastY = pointY;
        });

        setVortexPath(pathData);
    };

    useLayoutEffect(() => {
        // A small timeout allows the DOM to settle before we measure element positions
        const timer = setTimeout(drawVortexPath, 100);
        window.addEventListener('resize', drawVortexPath);
        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', drawVortexPath);
        }
    }, []);

    useEffect(() => {
        let animationFrameId = null;
        const handleScroll = () => {
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
            animationFrameId = requestAnimationFrame(() => {
                const scrollY = window.scrollY;
                const windowHeight = window.innerHeight;
                setShowGoToTop(scrollY > windowHeight / 2);
                if (!timelineRef.current) return;
                if (scrollY < windowHeight * 0.5) {
                    setFocusedIndex(null);
                    return;
                }
                const viewportCenterY = windowHeight / 2;
                let closestIndex = -1;
                let minDistance = Infinity;
                itemRefs.current.forEach((item, index) => {
                    if (!item) return;
                    const itemRect = item.getBoundingClientRect();
                    const itemCenterY = itemRect.top + itemRect.height / 2;
                    const distance = Math.abs(viewportCenterY - itemCenterY);
                    if (distance < minDistance) {
                        minDistance = distance;
                        closestIndex = index;
                    }
                });
                if (closestIndex !== -1) {
                    setFocusedIndex(prev => (closestIndex !== prev ? closestIndex : prev));
                }
            });
        };
        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', handleScroll);
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
        };
    }, []);

    const openEventModal = (data) => setEventModal(data);
    const closeEventModal = () => setEventModal(null);
    const openConceptModal = (data) => setConceptModal(data);
    const closeConceptModal = () => setConceptModal(null);
    const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

    const ConceptTag = ({ concept }) => {
        const conceptData = conceptsMap.get(concept);
        if (!conceptData) return null;
        return (
            <span className="concept-tag" onClick={(e) => { e.stopPropagation(); openConceptModal(conceptData); }}>
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
                <a href="#timeline" className="hero-cta" ref={ctaRef}>Begin the Journey</a>
            </header>

            <main id="timeline" className="timeline-section" ref={timelineRef}>
                <svg className="timeline-vortex">
                    <path className="vortex-path" d={vortexPath} />
                </svg>
                <div className="timeline-items-container">
                    {timelineEvents.map((event, index) => {
                        const isFocused = index === focusedIndex;
                        return (
                            <div key={event.id} className={`timeline-item-wrapper ${isFocused ? 'focused' : ''}`} ref={addToRefs}>
                                <div className="timeline-dot"></div>
                                <div className="timeline-item-content" onClick={() => isFocused && openEventModal(event)}>
                                    <div className="content-header">
                                        <h3>{event.title}</h3>
                                        <span>{event.year}</span>
                                    </div>
                                    <p>{event.summary}</p>
                                    <div className="concepts-container">
                                        {event.concepts.map(c => <ConceptTag key={c} concept={c} />)}
                                    </div>
                                    {isFocused && <div className="event-details-prompt">Click for more details</div>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </main>

            {eventModal && (
                 <div className="modal-overlay" onClick={closeEventModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2 className="modal-title">{eventModal.title}</h2>
                        <p className="modal-year">{eventModal.fullYear}</p>
                        <p className="modal-description">{eventModal.description}</p>
                        <div className="concepts-container modal-concepts">
                            {eventModal.concepts.map(c => <ConceptTag key={c} concept={c} />)}
                        </div>
                        <button className="modal-close" onClick={closeEventModal}>Close</button>
                    </div>
                </div>
            )}

            {conceptModal && (
                 <div className="modal-overlay" onClick={closeConceptModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2 className="modal-title">#{conceptModal.concept}</h2>
                        <p className="modal-description">{conceptModal.detailed}</p>
                        <button className="modal-close" onClick={closeConceptModal}>Close</button>
                    </div>
                </div>
            )}

            <button className={`scroll-to-top ${showGoToTop ? 'visible' : ''}`} onClick={scrollToTop} aria-label="Go to top">
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

