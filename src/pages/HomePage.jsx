import React, { useState, useEffect, useRef, useLayoutEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
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
    validatedTimelineEvents = validateTimelineEvents(timelineEvents);
    validatedPhilosophyConcepts = validatePhilosophyConcepts(philosophyConcepts);
    conceptsMap = new Map(validatedPhilosophyConcepts.map(c => [c.concept, c]));
} catch (error) {
    console.error('Failed to load timeline data:', error);
}

// Calculate concept frequency across all events
const conceptFrequency = validatedTimelineEvents.reduce((acc, event) => {
    event.concepts.forEach(concept => {
        acc[concept] = (acc[concept] || 0) + 1;
    });
    return acc;
}, {});

const maxFrequency = Math.max(...Object.values(conceptFrequency), 1);

// Get events that contain a specific concept
const getEventsWithConcept = (concept) => {
    return validatedTimelineEvents.filter(event => event.concepts.includes(concept));
};

// Era mapping for styling
const eraMapping = {
    'Ancient & Classical Thought': 'ancient',
    'Medieval & Renaissance Philosophy': 'medieval',
    'The Age of Reason & Enlightenment': 'enlightenment',
    '19th Century Philosophy': '19th',
    'Contemporary Thought': 'contemporary'
};

// Get era key for CSS class
const getEraKey = (eraName) => eraMapping[eraName] || 'default';

function HomePage() {
    const [eventModal, setEventModal] = useState(null);
    const [conceptPanel, setConceptPanel] = useState(null);
    const [focusedIndex, setFocusedIndex] = useState(null);
    const [showGoToTop, setShowGoToTop] = useState(false);
    const [vortexPath, setVortexPath] = useState('');
    const [dotProgress, setDotProgress] = useState(0);
    // activeEra is derived from focusedIndex in the era selector JSX
    const [showEraSelector, setShowEraSelector] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [filterConcept, setFilterConcept] = useState(null);
    const [particles, setParticles] = useState([]);
    const [connectionLines, setConnectionLines] = useState([]);
    const [hoveredConcept, setHoveredConcept] = useState(null);
    const [miniEventPreview, setMiniEventPreview] = useState(null);
    const [parallaxOffset, setParallaxOffset] = useState(0);
    const [showSwipeHint, setShowSwipeHint] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [hoveredCard, setHoveredCard] = useState(null);
    const [viewMode, setViewMode] = useState('flow'); // 'flow' or 'compact'

    const timelineRef = useRef(null);
    const itemRefs = useRef(validatedTimelineEvents.map(() => React.createRef()));
    const eraRefs = useRef({});
    const ctaRef = useRef(null);
    const searchInputRef = useRef(null);
    const particleIdCounter = useRef(0);
    const touchStartX = useRef(0);
    const touchStartY = useRef(0);
    const focusedIndexRef = useRef(focusedIndex);

    // Keep ref in sync with state for use in scroll handler
    useEffect(() => {
        focusedIndexRef.current = focusedIndex;
    }, [focusedIndex]);

    // Memoize eventsByEra calculation
    const eventsByEra = useMemo(() => {
        return validatedTimelineEvents.reduce((acc, event) => {
            const era = event.era || 'Unknown Era';
            if (!acc[era]) {
                acc[era] = [];
            }
            acc[era].push(event);
            return acc;
        }, {});
    }, []);

    // Constellation dots for parallax background
    const constellationDots = useMemo(() => {
        const dots = [];
        for (let i = 0; i < 50; i++) {
            dots.push({
                id: i,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                delay: Math.random() * 3
            });
        }
        return dots;
    }, []);

    // Search functionality
    const handleSearch = useCallback((query) => {
        setSearchQuery(query);
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }

        const lowerQuery = query.toLowerCase();
        const results = [];

        // Search events
        validatedTimelineEvents.forEach(event => {
            if (event.title.toLowerCase().includes(lowerQuery) ||
                event.summary.toLowerCase().includes(lowerQuery) ||
                event.description.toLowerCase().includes(lowerQuery)) {
                results.push({ type: 'event', data: event });
            }
        });

        // Search concepts
        validatedPhilosophyConcepts.forEach(concept => {
            if (concept.concept.toLowerCase().includes(lowerQuery) ||
                concept.simple.toLowerCase().includes(lowerQuery)) {
                results.push({ type: 'concept', data: concept });
            }
        });

        setSearchResults(results.slice(0, 8));
    }, []);

    // Navigate to event from search
    const navigateToEvent = useCallback((event) => {
        const index = validatedTimelineEvents.findIndex(e => e.id === event.id);
        if (index !== -1 && itemRefs.current[index]?.current) {
            itemRefs.current[index].current.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
            setSearchQuery('');
            setSearchResults([]);
            setShowSearch(false);
        }
    }, []);

    // Highlight text in search results
    const highlightText = (text, query) => {
        if (!query.trim()) return text;
        const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
        return parts.map((part, i) =>
            part.toLowerCase() === query.toLowerCase()
                ? <span key={i} className="search-highlight">{part}</span>
                : part
        );
    };

    // Function to draw the SVG path connecting timeline items - River of Ideas style
    const drawVortexPath = useCallback(() => {
        const ctaButton = ctaRef.current;
        if (!ctaButton || itemRefs.current.length === 0 || !timelineRef.current) return;

        const timelineContainerRect = timelineRef.current.getBoundingClientRect();
        const containerWidth = timelineContainerRect.width;
        const centerX = containerWidth / 2;

        const startPoint = ctaButton.getBoundingClientRect();
        const startY = startPoint.bottom - timelineContainerRect.top;

        // Create a smooth flowing river path down the center
        let pathData = `M ${centerX},${startY}`;
        let lastY = startY;

        itemRefs.current.forEach((itemRef, index) => {
            const item = itemRef.current;
            if (!item) return;
            const itemRect = item.getBoundingClientRect();

            const pointY = itemRect.top + itemRect.height / 2 - timelineContainerRect.top;

            // Gentle wave pattern - flows side to side
            const waveAmplitude = 60;
            const direction = index % 2 === 0 ? 1 : -1;
            const midY = lastY + (pointY - lastY) / 2;

            // Smooth S-curve to each point
            pathData += ` Q ${centerX + (waveAmplitude * direction)},${midY} ${centerX},${pointY}`;

            lastY = pointY;
        });

        setVortexPath(pathData);
    }, []);

    // Create particle trail effect
    const createParticle = useCallback((x, y, size = 'medium') => {
        const id = particleIdCounter.current++;
        const sizes = { small: 6, medium: 10, large: 14 };
        const newParticle = {
            id,
            x,
            y,
            size: sizes[size] || 10,
            createdAt: Date.now()
        };
        setParticles(prev => [...prev.slice(-15), newParticle]);
    }, []);

    // Calculate connection lines between events with shared concepts
    const calculateConnectionLines = useCallback((concept) => {
        if (!concept || !timelineRef.current) {
            setConnectionLines([]);
            return;
        }

        const timelineRect = timelineRef.current.getBoundingClientRect();
        const eventsWithConcept = getEventsWithConcept(concept);
        const lines = [];

        for (let i = 0; i < eventsWithConcept.length - 1; i++) {
            const event1 = eventsWithConcept[i];
            const event2 = eventsWithConcept[i + 1];
            const idx1 = validatedTimelineEvents.findIndex(e => e.id === event1.id);
            const idx2 = validatedTimelineEvents.findIndex(e => e.id === event2.id);

            const ref1 = itemRefs.current[idx1]?.current;
            const ref2 = itemRefs.current[idx2]?.current;

            if (ref1 && ref2) {
                const rect1 = ref1.getBoundingClientRect();
                const rect2 = ref2.getBoundingClientRect();

                lines.push({
                    x1: rect1.left + rect1.width / 2 - timelineRect.left,
                    y1: rect1.top + rect1.height / 2 - timelineRect.top,
                    x2: rect2.left + rect2.width / 2 - timelineRect.left,
                    y2: rect2.top + rect2.height / 2 - timelineRect.top
                });
            }
        }

        setConnectionLines(lines);
    }, []);

    // Set loading to false after component mounts
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    // Draw vortex path after timeline is rendered
    useLayoutEffect(() => {
        if (isLoading) return;

        const timer = setTimeout(drawVortexPath, 100);

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
    }, [isLoading, drawVortexPath]);

    // Effect for scroll-based animations and focusing
    // Uses focusedIndexRef to avoid re-registering the listener on every focus change
    useEffect(() => {
        let animationFrameId = null;
        let lastParticleTime = 0;

        const handleScroll = () => {
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
            animationFrameId = requestAnimationFrame(() => {
                const scrollY = window.scrollY;
                const windowHeight = window.innerHeight;
                const docHeight = document.documentElement.scrollHeight - windowHeight;

                // Calculate overall scroll progress (0-100)
                const progress = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;
                setScrollProgress(progress);

                setShowGoToTop(scrollY > windowHeight / 2);
                setShowEraSelector(scrollY > windowHeight * 0.8);
                setParallaxOffset(scrollY * 0.3);

                if (!timelineRef.current) return;

                if (scrollY < windowHeight * 0.5) {
                    setFocusedIndex(null);
                    setDotProgress(0);
                    return;
                }

                const viewportCenterY = windowHeight / 2;
                let closestIndex = -1;
                let minDistance = Infinity;

                itemRefs.current.forEach((itemRef, index) => {
                    const item = itemRef.current;
                    if (!item) return;
                    const itemRect = item.getBoundingClientRect();
                    const itemCenterY = itemRect.top + itemRect.height / 2;
                    const distance = Math.abs(viewportCenterY - itemCenterY);
                    if (distance < minDistance) {
                        minDistance = distance;
                        closestIndex = index;
                    }
                });

                if (closestIndex !== -1 && closestIndex !== focusedIndexRef.current) {
                    setFocusedIndex(closestIndex);
                    const targetProgress = (closestIndex + 1) / validatedTimelineEvents.length;
                    setDotProgress(targetProgress);

                    // Create particle trail
                    const now = Date.now();
                    if (now - lastParticleTime > 100) {
                        const item = itemRefs.current[closestIndex]?.current;
                        if (item && timelineRef.current) {
                            const rect = item.getBoundingClientRect();
                            const timelineRect = timelineRef.current.getBoundingClientRect();
                            createParticle(
                                rect.left + rect.width / 2 - timelineRect.left,
                                rect.top + rect.height / 2 - timelineRect.top,
                                'small'
                            );
                        }
                        lastParticleTime = now;
                    }
                }
            });
        };

        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', handleScroll);
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
        };
    }, [createParticle]);

    // Clean up old particles
    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            setParticles(prev => prev.filter(p => now - p.createdAt < 1500));
        }, 500);
        return () => clearInterval(interval);
    }, []);

    // Effect to handle keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                closeEventModal();
                setConceptPanel(null);
                setFilterConcept(null);
                setShowSearch(false);
            }
            if (e.key === '/' && !showSearch && !eventModal && !conceptPanel) {
                e.preventDefault();
                setShowSearch(true);
                setTimeout(() => searchInputRef.current?.focus(), 100);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [showSearch, eventModal, conceptPanel]);

    const navigateToNextEvent = useCallback(() => {
        const current = focusedIndexRef.current;
        const nextIndex = (current === null ? 0 : current + 1) % validatedTimelineEvents.length;
        const nextEventElement = itemRefs.current[nextIndex]?.current;

        if (nextEventElement) {
            nextEventElement.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    }, []);

    const navigateToPrevEvent = useCallback(() => {
        const current = focusedIndexRef.current;
        const prevIndex = current === null || current === 0
            ? validatedTimelineEvents.length - 1
            : current - 1;
        const prevEventElement = itemRefs.current[prevIndex]?.current;

        if (prevEventElement) {
            prevEventElement.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    }, []);

    // Touch/swipe handlers for mobile
    useEffect(() => {
        let swipeHintTimeout;

        const handleTouchStart = (e) => {
            touchStartX.current = e.touches[0].clientX;
            touchStartY.current = e.touches[0].clientY;
        };

        const handleTouchEnd = (e) => {
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            const deltaX = touchEndX - touchStartX.current;
            const deltaY = touchEndY - touchStartY.current;

            // Only trigger horizontal swipe if horizontal movement > vertical
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
                if (deltaX > 0) {
                    // Swipe right - previous event
                    navigateToPrevEvent();
                } else {
                    // Swipe left - next event
                    navigateToNextEvent();
                }
            }
        };

        // Show swipe hint on first mobile visit
        if (window.innerWidth <= 768 && !sessionStorage.getItem('swipeHintShown')) {
            swipeHintTimeout = setTimeout(() => {
                setShowSwipeHint(true);
                sessionStorage.setItem('swipeHintShown', 'true');
                setTimeout(() => setShowSwipeHint(false), 3000);
            }, 2000);
        }

        window.addEventListener('touchstart', handleTouchStart, { passive: true });
        window.addEventListener('touchend', handleTouchEnd, { passive: true });

        return () => {
            window.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchend', handleTouchEnd);
            clearTimeout(swipeHintTimeout);
        };
    }, [navigateToNextEvent, navigateToPrevEvent]);

    const navigateToEra = (era) => {
        const eraElement = eraRefs.current[era];
        if (eraElement) {
            eraElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    };

    const openEventModal = (data) => {
        setEventModal(data);
    };
    const closeEventModal = () => {
        setEventModal(null);
    };

    const openConceptPanel = (data) => {
        setConceptPanel(data);
        calculateConnectionLines(data.concept);
    };

    const closeConceptPanel = () => {
        setConceptPanel(null);
        setConnectionLines([]);
    };

    const toggleConceptFilter = (concept) => {
        if (filterConcept === concept) {
            setFilterConcept(null);
        } else {
            setFilterConcept(concept);
        }
    };

    const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

    // Show loading state while initializing
    if (isLoading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p className="loading-text">Loading philosophy...</p>
            </div>
        );
    }

    // Show error if no events loaded
    if (validatedTimelineEvents.length === 0) {
        return (
            <div className="loading-container">
                <h2 style={{ color: '#d32f2f' }}>Error Loading Timeline</h2>
                <p className="loading-text">No timeline events found. Please check the data files.</p>
            </div>
        );
    }

    const handleMiniEventHover = (miniEvent, e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setMiniEventPreview({
            data: miniEvent,
            x: rect.left,
            y: rect.top - 10
        });
    };

    const handleMiniEventLeave = () => {
        setMiniEventPreview(null);
    };

    // Check if event should be visible based on filter
    const isEventFiltered = (event) => {
        if (!filterConcept) return false;
        return !event.concepts.includes(filterConcept);
    };

    const ConceptTag = ({ concept, inModal = false }) => {
        const conceptData = conceptsMap.get(concept);
        const tagRef = useRef(null);
        const [tooltipStyle, setTooltipStyle] = useState({});

        if (!conceptData) return null;

        const frequency = conceptFrequency[concept] || 0;
        const frequencyLevel = Math.ceil((frequency / maxFrequency) * 5);
        const isFiltering = filterConcept === concept;

        const handleMouseEnter = () => {
            setHoveredConcept(concept);
            if (tagRef.current && !inModal) {
                const rect = tagRef.current.getBoundingClientRect();
                const tooltipWidth = 320;
                let left = rect.left + rect.width / 2 - tooltipWidth / 2;

                // Keep tooltip within viewport
                if (left < 10) left = 10;
                if (left + tooltipWidth > window.innerWidth - 10) {
                    left = window.innerWidth - tooltipWidth - 10;
                }

                setTooltipStyle({
                    left: `${left}px`,
                    bottom: `${window.innerHeight - rect.top + 10}px`,
                });
            }
        };

        return (
            <span
                ref={tagRef}
                className={`concept-tag ${isFiltering ? 'filter-active' : ''}`}
                onClick={(e) => {
                    e.stopPropagation();
                    if (inModal) {
                        openConceptPanel(conceptData);
                    } else {
                        toggleConceptFilter(concept);
                    }
                }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={() => setHoveredConcept(null)}
            >
                {concept}
                <span className="concept-frequency">
                    {[...Array(5)].map((_, i) => (
                        <span
                            key={i}
                            className={`frequency-dot ${i < frequencyLevel ? 'filled' : ''}`}
                        />
                    ))}
                </span>
                {!inModal && (
                    <div className="tooltip" style={tooltipStyle}>
                        <p className="tooltip-simple">{conceptData.simple}</p>
                        <p className="tooltip-prompt">Click to filter by this concept</p>
                    </div>
                )}
            </span>
        );
    };

    // Generate branch SVG path for mini-events
    const generateBranchPath = (count) => {
        let path = 'M 15,0 L 15,';
        const totalHeight = count * 80;
        path += totalHeight;

        // Add branches to each mini-event
        for (let i = 0; i < count; i++) {
            const y = 40 + i * 80;
            path += ` M 15,${y} L 30,${y}`;
        }

        return path;
    };

    return (
        <div className={`homepage-container ${viewMode === 'compact' ? 'compact-mode' : ''}`}>
            {/* Reading Progress Bar */}
            <div className="reading-progress-container">
                <div
                    className="reading-progress-bar"
                    style={{ width: `${scrollProgress}%` }}
                />
                <div className="reading-progress-text">
                    {focusedIndex !== null ? `${focusedIndex + 1} / ${validatedTimelineEvents.length}` : ''}
                </div>
            </div>

            {/* Parallax Background */}
            <div className="parallax-container">
                <div
                    className="parallax-layer parallax-layer--back"
                    style={{ transform: `translateY(${parallaxOffset * 0.2}px)` }}
                >
                    <div className="parallax-shape parallax-shape--1" />
                    <div className="parallax-shape parallax-shape--2" />
                </div>
                <div
                    className="parallax-layer parallax-layer--mid"
                    style={{ transform: `translateY(${parallaxOffset * 0.4}px)` }}
                >
                    <div className="parallax-shape parallax-shape--3" />
                    <div className="parallax-shape parallax-shape--4" />
                </div>
                <div
                    className="parallax-layer parallax-layer--front"
                    style={{ transform: `translateY(${parallaxOffset * 0.6}px)` }}
                >
                    <div className="parallax-shape parallax-shape--5" />
                </div>
                <div className="constellation">
                    {constellationDots.map(dot => (
                        <div
                            key={dot.id}
                            className="constellation-dot"
                            style={{
                                left: dot.left,
                                top: dot.top,
                                animationDelay: `${dot.delay}s`
                            }}
                        />
                    ))}
                </div>
            </div>

            {/* Era Quick-Jump Selector with Progress */}
            <nav className={`era-selector ${showEraSelector ? 'visible' : ''}`}>
                <div className="era-selector-inner">
                    {Object.keys(eventsByEra).map((era, index) => {
                        const eraKey = getEraKey(era);
                        const eraEvents = eventsByEra[era];
                        const firstEventIndex = validatedTimelineEvents.findIndex(e => e.era === era);
                        const lastEventIndex = firstEventIndex + eraEvents.length - 1;
                        const isCurrentEra = focusedIndex !== null && focusedIndex >= firstEventIndex && focusedIndex <= lastEventIndex;
                        const isPastEra = focusedIndex !== null && focusedIndex > lastEventIndex;

                        return (
                            <button
                                key={era}
                                className={`era-pill era-pill--${eraKey} ${isCurrentEra ? 'active' : ''} ${isPastEra ? 'completed' : ''}`}
                                onClick={() => navigateToEra(era)}
                                title={era}
                            >
                                <span className="era-pill-icon">{index + 1}</span>
                                <span className="era-pill-label">{era.split(' ')[0]}</span>
                                {isPastEra && (
                                    <svg className="era-check" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* View Mode Toggle */}
                <div className="view-mode-toggle">
                    <button
                        className={`view-mode-btn ${viewMode === 'flow' ? 'active' : ''}`}
                        onClick={() => setViewMode('flow')}
                        title="Flow View"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <button
                        className={`view-mode-btn ${viewMode === 'compact' ? 'active' : ''}`}
                        onClick={() => setViewMode('compact')}
                        title="Compact View"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                        </svg>
                    </button>
                </div>
            </nav>

            {/* Search Bar */}
            <div className={`search-container ${showEraSelector ? 'visible' : ''}`}>
                <div className="search-wrapper">
                    <svg className="search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        ref={searchInputRef}
                        type="text"
                        className="search-input"
                        placeholder="Search philosophers, concepts..."
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        onFocus={() => setShowSearch(true)}
                        onBlur={() => setTimeout(() => setShowSearch(false), 200)}
                    />
                    <div className={`search-results ${searchResults.length > 0 && showSearch ? 'active' : ''}`}>
                        {searchResults.map((result) => (
                            <div
                                key={`${result.type}-${result.data.id || result.data.concept}`}
                                className={`search-result-item ${filterConcept === result.data.concept ? 'highlighted' : ''}`}
                                onClick={() => {
                                    if (result.type === 'event') {
                                        navigateToEvent(result.data);
                                    } else {
                                        openConceptPanel(result.data);
                                        setSearchQuery('');
                                        setSearchResults([]);
                                    }
                                }}
                            >
                                <div className="search-result-title">
                                    {highlightText(result.data.title || result.data.concept, searchQuery)}
                                </div>
                                <div className="search-result-type">
                                    {result.type === 'event' ? result.data.year : result.data.category}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Filter Indicator */}
            <div className={`filter-indicator ${filterConcept ? 'visible' : ''}`}>
                <span className="filter-indicator-text">Filtering: #{filterConcept}</span>
                <button className="filter-clear-btn" onClick={() => setFilterConcept(null)}>
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <header className="hero-section">
                <h1 className="hero-title">Map of Thought</h1>
                <p className="hero-subtitle">
                    Explore the history of philosophy like never before. Navigate the branching river of human thought from ancient Greece to modern day.
                </p>
                <a href="#timeline" className="hero-cta" ref={ctaRef}>Begin the Journey</a>
            </header>

            <main id="timeline" className="timeline-section" ref={timelineRef}>
                {/* Connection Web SVG */}
                <svg className="connection-web" aria-hidden="true">
                    {connectionLines.map((line, index) => (
                        <line
                            key={index}
                            className={`connection-line ${hoveredConcept || conceptPanel ? 'visible' : ''}`}
                            x1={line.x1}
                            y1={line.y1}
                            x2={line.x2}
                            y2={line.y2}
                        />
                    ))}
                </svg>

                <svg className="timeline-vortex" aria-hidden="true">
                    <defs>
                        <linearGradient id="flowGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="var(--era-ancient-primary)" stopOpacity="0.6" />
                            <stop offset="25%" stopColor="var(--era-medieval-primary)" stopOpacity="0.6" />
                            <stop offset="50%" stopColor="var(--era-enlightenment-primary)" stopOpacity="0.6" />
                            <stop offset="75%" stopColor="var(--era-19th-primary)" stopOpacity="0.6" />
                            <stop offset="100%" stopColor="var(--era-contemporary-primary)" stopOpacity="0.6" />
                        </linearGradient>
                        <filter id="flowGlow" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="4" result="blur" />
                            <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>
                    {/* Background glow path */}
                    <path className="vortex-path-glow" d={vortexPath} filter="url(#flowGlow)" />
                    {/* Main flow path */}
                    <path className="vortex-path" d={vortexPath} stroke="url(#flowGradient)" />
                    {/* Animated flow particles along path */}
                    <circle className="flow-particle flow-particle-1" r="4">
                        <animateMotion dur="8s" repeatCount="indefinite" path={vortexPath} />
                    </circle>
                    <circle className="flow-particle flow-particle-2" r="3">
                        <animateMotion dur="8s" repeatCount="indefinite" path={vortexPath} begin="2s" />
                    </circle>
                    <circle className="flow-particle flow-particle-3" r="2">
                        <animateMotion dur="8s" repeatCount="indefinite" path={vortexPath} begin="4s" />
                    </circle>
                </svg>

                {/* Particle Trail Container */}
                <div className="particle-container">
                    {focusedIndex !== null && (
                        <div
                            className="particle particle--lead"
                            style={{
                                offsetPath: vortexPath ? `path("${vortexPath}")` : 'none',
                                offsetDistance: `${dotProgress * 100}%`,
                                opacity: vortexPath ? 1 : 0
                            }}
                        />
                    )}
                    {particles.map(particle => (
                        <div
                            key={particle.id}
                            className="particle particle--trail"
                            style={{
                                left: particle.x - particle.size / 2,
                                top: particle.y - particle.size / 2,
                                width: particle.size,
                                height: particle.size
                            }}
                        />
                    ))}
                </div>

                <div className="timeline-items-container">
                    {Object.keys(eventsByEra).map(era => (
                        <React.Fragment key={era}>
                            <h2
                                className="era-title"
                                data-era={getEraKey(era)}
                                ref={el => eraRefs.current[era] = el}
                            >
                                {era}
                            </h2>
                            {eventsByEra[era].map((event) => {
                                const currentIndex = validatedTimelineEvents.findIndex(e => e.id === event.id);
                                const isFocused = currentIndex === focusedIndex;
                                const isFiltered = isEventFiltered(event);
                                const isHovered = hoveredCard === event.id;

                                return (
                                    <div
                                        key={event.id}
                                        className={`timeline-item-wrapper ${isFocused ? 'focused' : ''} ${isFiltered ? 'filtered-out' : ''} ${isHovered ? 'hovered' : ''}`}
                                        data-era={getEraKey(event.era)}
                                        data-index={currentIndex}
                                        ref={itemRefs.current[currentIndex]}
                                        onClick={() => isFocused && openEventModal(event)}
                                        onMouseEnter={() => setHoveredCard(event.id)}
                                        onMouseLeave={() => setHoveredCard(null)}
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
                                        {/* Year column with flow node */}
                                        <div className="timeline-year-column">
                                            <div className="year-display">
                                                <span className="year-text">{event.year}</span>
                                            </div>
                                            <div className={`flow-node ${isFocused ? 'active' : ''}`}>
                                                <div className="flow-node-inner" />
                                                <div className="flow-node-ring" />
                                            </div>
                                        </div>

                                        {/* Content column */}
                                        <div className="timeline-item-content">
                                            <div className="content-header">
                                                <h3>{event.title}</h3>
                                                <span className="event-index">#{currentIndex + 1}</span>
                                            </div>
                                            <p>{event.summary}</p>
                                            <div className="concepts-container">
                                                {event.concepts.map(c => <ConceptTag key={c} concept={c} />)}
                                            </div>

                                            {/* Enhanced click prompt with icon */}
                                            <button
                                                className={`event-details-prompt ${isFocused ? 'visible' : ''}`}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    openEventModal(event);
                                                }}
                                                onMouseDown={(e) => e.stopPropagation()}
                                                type="button"
                                                aria-label={`Explore ${event.title}`}
                                            >
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                </svg>
                                                <span>Explore this moment</span>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </React.Fragment>
                    ))}
                </div>
            </main>

            {/* Event Modal - using Portal to render at body level */}
            {eventModal && createPortal(
                <div className="modal-overlay" onClick={closeEventModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2 className="modal-title">{eventModal.title || 'No Title'}</h2>
                        <p className="modal-year">{eventModal.fullYear || eventModal.year || 'No Year'}</p>
                        <p className="modal-description">{eventModal.description || 'No Description'}</p>
                        <div className="concepts-container">
                            {eventModal.concepts && eventModal.concepts.map(c => <ConceptTag key={c} concept={c} inModal={true} />)}
                        </div>
                        {eventModal.miniEvents && eventModal.miniEvents.length > 0 && (
                            <>
                                <h4 className="mini-events-title">Related Developments</h4>
                                <div className="mini-events-container">
                                    <svg className="mini-events-branch" aria-hidden="true">
                                        <path
                                            className="branch-line"
                                            d={generateBranchPath(eventModal.miniEvents.length)}
                                        />
                                        {eventModal.miniEvents.map((_, i) => (
                                            <circle
                                                key={i}
                                                className="branch-node"
                                                cx="30"
                                                cy={40 + i * 80}
                                                r="4"
                                            />
                                        ))}
                                    </svg>
                                    <div className="mini-events-tray">
                                        {eventModal.miniEvents.map(miniEvent => (
                                            <div
                                                key={miniEvent.id}
                                                className="mini-event-card"
                                                onMouseEnter={(e) => handleMiniEventHover(miniEvent, e)}
                                                onMouseLeave={handleMiniEventLeave}
                                            >
                                                <h5>{miniEvent.title}</h5>
                                                <p>{miniEvent.summary}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                        <button className="modal-close" onClick={closeEventModal}>Close</button>
                    </div>
                </div>,
                document.body
            )}

            {/* Concept Slide-In Panel */}
            <div className={`concept-panel ${conceptPanel ? 'open' : ''}`}>
                {conceptPanel && (
                    <>
                        <div className="concept-panel-header">
                            <div>
                                <h2 className="concept-panel-title">{conceptPanel.concept}</h2>
                                <p className="concept-panel-category">{conceptPanel.category}</p>
                            </div>
                            <button className="concept-panel-close" onClick={closeConceptPanel}>
                                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="concept-panel-body">
                            <p className="concept-panel-description">{conceptPanel.detailed}</p>
                            <div className="concept-panel-related">
                                <h4>Related Events</h4>
                                <div className="concept-related-events">
                                    {getEventsWithConcept(conceptPanel.concept).map(event => (
                                        <div
                                            key={event.id}
                                            className="concept-related-event"
                                            onClick={() => {
                                                closeConceptPanel();
                                                navigateToEvent(event);
                                            }}
                                        >
                                            <div className="concept-related-event-title">{event.title}</div>
                                            <div className="concept-related-event-year">{event.year}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Mini-Event Preview Tooltip */}
            {miniEventPreview && (
                <div
                    className="mini-event-preview visible"
                    style={{
                        left: miniEventPreview.x,
                        bottom: window.innerHeight - miniEventPreview.y + 10
                    }}
                >
                    <h5>{miniEventPreview.data.title}</h5>
                    <p>{miniEventPreview.data.summary}</p>
                </div>
            )}

            {/* Mobile Swipe Hint */}
            <div className={`swipe-indicator ${showSwipeHint ? 'visible' : ''}`}>
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                <span>Swipe to navigate</span>
            </div>

            {/* Search Toggle Button */}
            <button
                className={`search-toggle ${showGoToTop ? 'visible' : ''}`}
                onClick={() => {
                    setShowSearch(true);
                    setTimeout(() => searchInputRef.current?.focus(), 100);
                }}
                aria-label="Open search"
            >
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </button>

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
                <p>&copy; 2026 Map of Thought. A VQM Project.</p>
            </footer>
        </div>
    );
}

export default HomePage;
