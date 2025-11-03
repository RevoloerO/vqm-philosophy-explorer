import React, { useState, useEffect, useRef, useLayoutEffect, useMemo } from 'react';
import '../css/HomePage.css';
import timelineEvents from './timelineEvents.json';
import philosophyConcepts from './philosophyConcepts.json';

// Data validation
const validateTimelineEvents = (events) => {
    if (!Array.isArray(events)) {
        console.error('Timeline events must be an array');
        return [];
    }
    return events.filter(event => {
        const isValid = event.id && event.title && event.year && event.summary && Array.isArray(event.concepts);
        if (!isValid) {
            console.warn('Invalid timeline event:', event);
        }
        return isValid;
    });
};

const validatePhilosophyConcepts = (concepts) => {
    if (!Array.isArray(concepts)) {
        console.error('Philosophy concepts must be an array');
        return [];
    }
    return concepts.filter(concept => {
        const isValid = concept.concept && concept.category && concept.simple && concept.detailed;
        if (!isValid) {
            console.warn('Invalid philosophy concept:', concept);
        }
        return isValid;
    });
};

// Safely validate data with error handling
let validatedTimelineEvents = [];
let validatedPhilosophyConcepts = [];
let conceptsMap = new Map();

try {
    console.log('Raw timeline events:', timelineEvents?.length);
    console.log('Raw philosophy concepts:', philosophyConcepts?.length);

    validatedTimelineEvents = validateTimelineEvents(timelineEvents);
    validatedPhilosophyConcepts = validatePhilosophyConcepts(philosophyConcepts);
    conceptsMap = new Map(validatedPhilosophyConcepts.map(c => [c.concept, c]));

    console.log('Validated timeline events:', validatedTimelineEvents.length);
    console.log('Validated philosophy concepts:', validatedPhilosophyConcepts.length);
} catch (error) {
    console.error('Failed to load timeline data:', error);
}

// ConceptTag component extracted and memoized to prevent unnecessary re-renders
const ConceptTag = React.memo(({ concept, conceptsMap, onOpenModal }) => {
    const conceptData = conceptsMap.get(concept);
    if (!conceptData) return null;
    return (
        <span
            className="concept-tag"
            onClick={(e) => {
                e.stopPropagation();
                onOpenModal(conceptData);
            }}
        >
            {concept}
            <div className="tooltip">
                <p className="tooltip-simple">{conceptData.simple}</p>
                <p className="tooltip-prompt">Click for more details</p>
            </div>
        </span>
    );
});

// Focus trap hook for modal accessibility
const useFocusTrap = (isActive) => {
    const trapRef = useRef(null);

    useEffect(() => {
        if (!isActive || !trapRef.current) return;

        const focusableElements = trapRef.current.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        // Store previously focused element to restore later
        const previouslyFocused = document.activeElement;

        // Focus first element when modal opens
        firstElement?.focus();

        const handleTabKey = (e) => {
            if (e.key !== 'Tab') return;

            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement?.focus();
                }
            } else {
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement?.focus();
                }
            }
        };

        document.addEventListener('keydown', handleTabKey);

        return () => {
            document.removeEventListener('keydown', handleTabKey);
            // Restore focus when modal closes
            previouslyFocused?.focus();
        };
    }, [isActive]);

    return trapRef;
};

function HomePage() {
    console.log('HomePage rendering');

    const [eventModal, setEventModal] = useState(null);
    const [conceptModal, setConceptModal] = useState(null);
    const [focusedIndex, setFocusedIndex] = useState(null);
    const [showGoToTop, setShowGoToTop] = useState(false);
    const [vortexPath, setVortexPath] = useState('');
    const [dotProgress, setDotProgress] = useState(0);
    const [targetProgress, setTargetProgress] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    console.log('Loading state:', isLoading);
    console.log('Validated events count:', validatedTimelineEvents.length);

    const timelineRef = useRef(null);
    const itemRefs = useRef(validatedTimelineEvents.map(() => React.createRef()));
    const ctaRef = useRef(null);

    // Focus trap refs for modals
    const eventModalRef = useFocusTrap(!!eventModal);
    const conceptModalRef = useFocusTrap(!!conceptModal);

    // Suggestion 1: Memoize the eventsByEra calculation
    // This ensures the reduce operation only runs once, not on every render.
    const eventsByEra = useMemo(() => {
        return validatedTimelineEvents.reduce((acc, event) => {
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
        console.log('drawVortexPath called:', {
            ctaButton: !!ctaButton,
            itemRefsLength: itemRefs.current.length,
            timelineRef: !!timelineRef.current
        });

        if (!ctaButton || itemRefs.current.length === 0 || !timelineRef.current) {
            console.log('drawVortexPath returning early - refs not ready');
            return;
        }

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

    // Set loading to false after a short delay to let the component mount
    useEffect(() => {
        const timer = setTimeout(() => {
            console.log('Setting isLoading to false');
            setIsLoading(false);
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    // Draw vortex path after timeline is rendered (when isLoading becomes false)
    useLayoutEffect(() => {
        if (isLoading) return; // Don't run while loading

        console.log('Drawing vortex path after timeline rendered');
        const timer = setTimeout(() => {
            drawVortexPath();
        }, 100);

        let resizeTimer;
        const debouncedResize = () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(drawVortexPath, 150);
        };

        window.addEventListener('resize', debouncedResize);
        return () => {
            clearTimeout(timer);
            clearTimeout(resizeTimer);
            window.removeEventListener('resize', debouncedResize);
        };
    }, [isLoading]); // Re-run when isLoading changes

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
                        setTargetProgress((itemIndex + 1) / validatedTimelineEvents.length);
                    }
                }
            },
            {
                root: null, // observes intersections relative to the viewport
                rootMargin: "-50% 0px -50% 0px", // defines a horizontal line at the center of the viewport
                threshold: [0, 0.25, 0.5, 0.75, 1], // Multiple thresholds for better detection
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

    // Smooth animation for dot progress using interpolation
    // Fixed to prevent infinite loop by only depending on targetProgress
    useEffect(() => {
        let animationId;

        const animate = () => {
            setDotProgress(prev => {
                const diff = targetProgress - prev;
                if (Math.abs(diff) > 0.001) {
                    animationId = requestAnimationFrame(animate);
                    return prev + diff * 0.1;
                }
                return targetProgress;
            });
        };

        animate();

        return () => {
            if (animationId) cancelAnimationFrame(animationId);
        };
    }, [targetProgress]);

    // A separate, lightweight effect for the scroll-to-top button and for clearing focus
    // when the user scrolls back to the top of the page.
    // Uses requestAnimationFrame to throttle updates and prevent excessive re-renders.
    useEffect(() => {
        let ticking = false;

        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const scrollY = window.scrollY;
                    const windowHeight = window.innerHeight;
                    setShowGoToTop(scrollY > windowHeight / 2);

                    // If user scrolls back to the hero section, unfocus all items
                    if (scrollY < windowHeight * 0.5) {
                        setFocusedIndex(null);
                        setTargetProgress(0);
                        setDotProgress(0);
                    }
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const handleKeyDown = (e) => {
            // Handle escape key for modals
            if (e.key === 'Escape') {
                closeEventModal();
                closeConceptModal();
                return;
            }

            // Don't interfere with arrow keys when modals are open
            if (eventModal || conceptModal) {
                return;
            }

            // Arrow key navigation for timeline events
            if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
                e.preventDefault();
                navigateToNextEvent();
            } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
                e.preventDefault();
                navigateToPreviousEvent();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [focusedIndex, eventModal, conceptModal]);

    const navigateToNextEvent = () => {
        const nextIndex = (focusedIndex === null ? 0 : focusedIndex + 1) % validatedTimelineEvents.length;
        const nextEventElement = itemRefs.current[nextIndex]?.current;

        if (nextEventElement) {
            nextEventElement.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    };

    const navigateToPreviousEvent = () => {
        const prevIndex = focusedIndex === null
            ? validatedTimelineEvents.length - 1
            : (focusedIndex - 1 + validatedTimelineEvents.length) % validatedTimelineEvents.length;

        const prevEventElement = itemRefs.current[prevIndex]?.current;

        if (prevEventElement) {
            prevEventElement.scrollIntoView({
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

    // Show loading state while initializing
    if (isLoading) {
        console.log('Showing loading screen');
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p className="loading-text">Loading philosophy...</p>
            </div>
        );
    }

    // Show error if no events loaded
    if (validatedTimelineEvents.length === 0) {
        console.error('No timeline events loaded!');
        return (
            <div className="loading-container">
                <h2 style={{ color: '#d32f2f' }}>Error Loading Timeline</h2>
                <p className="loading-text">No timeline events found. Please check the data files.</p>
            </div>
        );
    }

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
                                const currentIndex = validatedTimelineEvents.findIndex(e => e.id === event.id);
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
                                                {event.concepts.map(c => (
                                                    <ConceptTag
                                                        key={c}
                                                        concept={c}
                                                        conceptsMap={conceptsMap}
                                                        onOpenModal={openConceptModal}
                                                    />
                                                ))}
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
                <div
                    className="modal-overlay"
                    onClick={closeEventModal}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="event-modal-title"
                >
                    <div
                        className="modal-content"
                        onClick={(e) => e.stopPropagation()}
                        ref={eventModalRef}
                    >
                        <h2 id="event-modal-title" className="modal-title">{eventModal.title}</h2>
                        <p className="modal-year">{eventModal.fullYear}</p>
                        <p className="modal-description">{eventModal.description}</p>
                        <div className="concepts-container">
                             {eventModal.concepts.map(c => (
                                <ConceptTag
                                    key={c}
                                    concept={c}
                                    conceptsMap={conceptsMap}
                                    onOpenModal={openConceptModal}
                                />
                             ))}
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
                        <button className="modal-close" onClick={closeEventModal} aria-label="Close event modal">Close</button>
                    </div>
                </div>
            )}
            
            {conceptModal && (
                 <div
                    className="modal-overlay"
                    onClick={closeConceptModal}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="concept-modal-title"
                >
                    <div
                        className="modal-content"
                        onClick={(e) => e.stopPropagation()}
                        ref={conceptModalRef}
                    >
                        <h2 id="concept-modal-title" className="modal-title">{conceptModal.concept}</h2>
                        <h3 className="modal-category">{conceptModal.category}</h3>
                        <p className="modal-description">{conceptModal.detailed}</p>
                        <button className="modal-close" onClick={closeConceptModal} aria-label="Close concept modal">Close</button>
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
