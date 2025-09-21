import React, { useState, useEffect, useRef, useLayoutEffect, useMemo } from 'react';
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
    const [dotProgress, setDotProgress] = useState(0);

    const timelineRef = useRef(null);
    const itemRefs = useRef(timelineEvents.map(() => React.createRef()));
    const ctaRef = useRef(null);

    // Suggestion 1: Memoize the eventsByEra calculation
    // This ensures the reduce operation only runs once, not on every render.
    const eventsByEra = useMemo(() => {
        return timelineEvents.reduce((acc, event) => {
            const era = event.era || 'Unknown Era';
            if (!acc[era]) {
                acc[era] = [];
            }
            acc[era].push(event);
            return acc;
        }, {});
    }, []); // Empty dependency array means it runs only on the initial render.

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

        itemRefs.current.forEach((itemRef, index) => {
            const item = itemRef.current;
            if (!item) return;
            const itemRect = item.getBoundingClientRect();
            
            const pointX = itemRect.left + itemRect.width / 2 - timelineContainerRect.left;
            const pointY = itemRect.top + itemRect.height / 2 - timelineContainerRect.top;

            const curveIntensity = 80;
            const controlX1 = lastX + (index % 2 === 0 ? curveIntensity : -curveIntensity);
            const controlY1 = lastY + (pointY - lastY) * 0.5;
            const controlX2 = pointX + (index % 2 === 0 ? -curveIntensity : curveIntensity);
            const controlY2 = pointY - (pointY - lastY) * 0.5;
            
            pathData += ` C ${controlX1},${controlY1} ${controlX2},${controlY2} ${pointX},${pointY}`;
            lastX = pointX;
            lastY = pointY;
        });

        setVortexPath(pathData);
    };
    
    useLayoutEffect(() => {
        const timer = setTimeout(drawVortexPath, 100);
        window.addEventListener('resize', drawVortexPath);
        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', drawVortexPath);
        }
    }, []);

    // Suggestion 2: Use Intersection Observer for focusing items
    // This is more performant than calculating positions on every scroll event.
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const intersectingEntry = entries.find(entry => entry.isIntersecting);
                if (intersectingEntry) {
                    const target = intersectingEntry.target;
                    const itemIndex = itemRefs.current.findIndex(ref => ref.current === target);
                    
                    if (itemIndex !== -1) {
                        setFocusedIndex(itemIndex);
                        const targetProgress = (itemIndex + 1) / timelineEvents.length;
                        setDotProgress(targetProgress);
                    }
                }
            },
            {
                root: null, // observes intersections relative to the viewport
                rootMargin: "-50% 0px -50% 0px", // defines a horizontal line at the center of the viewport
                threshold: 0,
            }
        );

        itemRefs.current.forEach(ref => {
            if (ref.current) {
                observer.observe(ref.current);
            }
        });

        return () => {
            itemRefs.current.forEach(ref => {
                if (ref.current) {
                    observer.unobserve(ref.current);
                }
            });
        };
    }, []); // This effect runs only once on component mount.

    // A separate, lightweight effect for the scroll-to-top button and for clearing focus
    // when the user scrolls back to the top of the page.
    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY;
            const windowHeight = window.innerHeight;
            setShowGoToTop(scrollY > windowHeight / 2);

            // If user scrolls back to the hero section, unfocus all items
            if (scrollY < windowHeight * 0.5) {
                setFocusedIndex(null);
                setDotProgress(0);
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                closeEventModal();
                closeConceptModal();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const navigateToNextEvent = () => {
        const nextIndex = (focusedIndex === null ? 0 : focusedIndex + 1) % timelineEvents.length;
        const nextEventElement = itemRefs.current[nextIndex]?.current;

        if (nextEventElement) {
            nextEventElement.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    };

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
                <svg className="timeline-vortex" aria-hidden="true">
                    <path className="vortex-path" d={vortexPath} />
                </svg>
                <div
                  className="moving-dot"
                  style={{
                    offsetPath: vortexPath ? `path("${vortexPath}")` : 'none',
                    offsetDistance: `${dotProgress * 100}%`,
                    opacity: vortexPath ? 1 : 0
                  }}
                />
                <div className="timeline-items-container">
                    {Object.keys(eventsByEra).map(era => (
                        <React.Fragment key={era}>
                            <h2 className="era-title">{era}</h2>
                            {eventsByEra[era].map((event) => {
                                const currentIndex = timelineEvents.findIndex(e => e.id === event.id);
                                const isFocused = currentIndex === focusedIndex;
                                return (
                                    <div 
                                        key={event.id} 
                                        className={`timeline-item-wrapper ${isFocused ? 'focused' : ''}`} 
                                        ref={itemRefs.current[currentIndex]}
                                        onClick={() => isFocused && openEventModal(event)}
                                        onKeyDown={(e) => {
                                            if (isFocused && (e.key === 'Enter' || e.key === ' ')) {
                                                e.preventDefault();
                                                openEventModal(event);
                                            }
                                        }}
                                        role="button"
                                        tabIndex={isFocused ? 0 : -1}
                                        aria-label={`View details for ${event.title}`}
                                    >
                                        <div className="timeline-item-content">
                                            <div className="content-header">
                                                <h3>{event.title}</h3>
                                                <span>{event.year}</span>
                                            </div>
                                            <p>{event.summary}</p>
                                            <div className="concepts-container">
                                                {event.concepts.map(c => <ConceptTag key={c} concept={c} />)}
                                            </div>
                                            {isFocused && <div className="event-details-prompt">Click to discover more</div>}
                                        </div>
                                    </div>
                                );
                            })}
                        </React.Fragment>
                    ))}
                </div>
            </main>

            {eventModal && (
                <div className="modal-overlay" onClick={closeEventModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2 className="modal-title">{eventModal.title}</h2>
                        <p className="modal-year">{eventModal.fullYear}</p>
                        <p className="modal-description">{eventModal.description}</p>
                        <div className="concepts-container">
                             {eventModal.concepts.map(c => <ConceptTag key={c} concept={c} />)}
                        </div>
                        {eventModal.miniEvents && eventModal.miniEvents.length > 0 && (
                            <>
                                <h4 className="mini-events-title">Related Developments</h4>
                                <div className="mini-events-tray">
                                    {eventModal.miniEvents.map(miniEvent => (
                                        <div key={miniEvent.id} className="mini-event-card">
                                            <h5>{miniEvent.title}</h5>
                                            <p>{miniEvent.summary}</p>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                        <button className="modal-close" onClick={closeEventModal}>Close</button>
                    </div>
                </div>
            )}
            
            {conceptModal && (
                 <div className="modal-overlay" onClick={closeConceptModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2 className="modal-title">{conceptModal.concept}</h2>
                        <h3 className="modal-category">{conceptModal.category}</h3>
                        <p className="modal-description">{conceptModal.detailed}</p>
                        <button className="modal-close" onClick={closeConceptModal}>Close</button>
                    </div>
                </div>
            )}

            <button className="event-navigator" onClick={navigateToNextEvent} aria-label="Go to next event">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 5.25l-7.5 7.5-7.5-7.5m15 6l-7.5 7.5-7.5-7.5" />
                </svg>
            </button>

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
