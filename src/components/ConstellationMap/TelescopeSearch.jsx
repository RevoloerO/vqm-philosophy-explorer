/**
 * TelescopeSearch Component
 * Search overlay with zoom-to-star animation for the constellation map
 */

import React, { useState, useCallback, useEffect, useRef, memo } from 'react';

/**
 * Highlight matching text in search results
 */
const HighlightText = memo(({ text, query }) => {
    if (!query.trim()) return text;

    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase()
            ? <span key={i} className="search-highlight">{part}</span>
            : part
    );
});

HighlightText.displayName = 'HighlightText';

/**
 * Search result item component
 */
const SearchResultItem = memo(({ result, query, onSelect, isSelected }) => {
    const isPhilosopher = result.type === 'philosopher';

    return (
        <div
            className={`telescope-result-item ${isSelected ? 'selected' : ''}`}
            onClick={() => onSelect(result)}
            role="option"
            aria-selected={isSelected}
        >
            <div className="telescope-result-icon">
                {isPhilosopher ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <circle cx="12" cy="12" r="3" />
                        <path d="M12 2v2m0 16v2M2 12h2m16 0h2" />
                    </svg>
                ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path d="M12 2L2 7l10 5 10-5-10-5z" />
                        <path d="M2 17l10 5 10-5" />
                        <path d="M2 12l10 5 10-5" />
                    </svg>
                )}
            </div>
            <div className="telescope-result-content">
                <div className="telescope-result-title">
                    <HighlightText text={result.title} query={query} />
                </div>
                <div className="telescope-result-subtitle">
                    {isPhilosopher ? result.year : result.category}
                </div>
            </div>
            <div className="telescope-result-type">
                {isPhilosopher ? 'Philosopher' : 'Concept'}
            </div>
        </div>
    );
});

SearchResultItem.displayName = 'SearchResultItem';

/**
 * TelescopeSearch - Main search component
 */
const TelescopeSearch = ({
    philosophers,
    concepts,
    onSelectPhilosopher,
    onSelectConcept,
    isOpen,
    onClose
}) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef(null);
    const resultsRef = useRef(null);

    // Focus input when opened
    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
            setQuery('');
            setResults([]);
            setSelectedIndex(0);
        }
    }, [isOpen]);

    // Perform search
    const performSearch = useCallback((searchQuery) => {
        if (!searchQuery.trim()) {
            setResults([]);
            return;
        }

        const lowerQuery = searchQuery.toLowerCase();
        const searchResults = [];

        // Search philosophers
        philosophers.forEach(philosopher => {
            const titleMatch = philosopher.title.toLowerCase().includes(lowerQuery);
            const descMatch = philosopher.description?.toLowerCase().includes(lowerQuery);
            const conceptMatch = philosopher.concepts?.some(c =>
                c.toLowerCase().includes(lowerQuery)
            );

            if (titleMatch || descMatch || conceptMatch) {
                searchResults.push({
                    type: 'philosopher',
                    id: philosopher.id,
                    title: philosopher.title,
                    year: philosopher.year,
                    data: philosopher,
                    score: titleMatch ? 3 : (conceptMatch ? 2 : 1)
                });
            }
        });

        // Search concepts
        concepts.forEach(concept => {
            const nameMatch = concept.concept.toLowerCase().includes(lowerQuery);
            const descMatch = concept.simple?.toLowerCase().includes(lowerQuery);

            if (nameMatch || descMatch) {
                searchResults.push({
                    type: 'concept',
                    id: concept.concept,
                    title: concept.concept,
                    category: concept.category,
                    data: concept,
                    score: nameMatch ? 3 : 1
                });
            }
        });

        // Sort by relevance score
        searchResults.sort((a, b) => b.score - a.score);

        setResults(searchResults.slice(0, 10));
        setSelectedIndex(0);
    }, [philosophers, concepts]);

    // Handle input change
    const handleInputChange = useCallback((e) => {
        const value = e.target.value;
        setQuery(value);
        performSearch(value);
    }, [performSearch]);

    // Handle result selection
    const handleSelect = useCallback((result) => {
        if (result.type === 'philosopher') {
            onSelectPhilosopher(result.data);
        } else {
            onSelectConcept(result.data);
        }
        onClose();
    }, [onSelectPhilosopher, onSelectConcept, onClose]);

    // Handle keyboard navigation
    const handleKeyDown = useCallback((e) => {
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev =>
                    prev < results.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev => prev > 0 ? prev - 1 : 0);
                break;
            case 'Enter':
                e.preventDefault();
                if (results[selectedIndex]) {
                    handleSelect(results[selectedIndex]);
                }
                break;
            case 'Escape':
                e.preventDefault();
                onClose();
                break;
            default:
                break;
        }
    }, [results, selectedIndex, handleSelect, onClose]);

    // Scroll selected item into view
    useEffect(() => {
        if (resultsRef.current && results.length > 0) {
            const selectedElement = resultsRef.current.children[selectedIndex];
            if (selectedElement) {
                selectedElement.scrollIntoView({ block: 'nearest' });
            }
        }
    }, [selectedIndex, results.length]);

    if (!isOpen) return null;

    return (
        <div className="telescope-overlay" onClick={onClose}>
            <div
                className="telescope-container"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Search header */}
                <div className="telescope-header">
                    <div className="telescope-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                            <circle cx="11" cy="11" r="8" />
                            <path d="M21 21l-4.35-4.35" />
                        </svg>
                    </div>
                    <input
                        ref={inputRef}
                        type="text"
                        className="telescope-input"
                        placeholder="Search philosophers, concepts..."
                        value={query}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        aria-label="Search"
                        aria-controls="telescope-results"
                        aria-activedescendant={
                            results[selectedIndex]
                                ? `result-${results[selectedIndex].id}`
                                : undefined
                        }
                    />
                    <div className="telescope-shortcut">
                        <kbd>ESC</kbd> to close
                    </div>
                </div>

                {/* Results */}
                {results.length > 0 && (
                    <div
                        ref={resultsRef}
                        id="telescope-results"
                        className="telescope-results"
                        role="listbox"
                    >
                        {results.map((result, index) => (
                            <SearchResultItem
                                key={`${result.type}-${result.id}`}
                                result={result}
                                query={query}
                                onSelect={handleSelect}
                                isSelected={index === selectedIndex}
                            />
                        ))}
                    </div>
                )}

                {/* No results message */}
                {query && results.length === 0 && (
                    <div className="telescope-no-results">
                        <p>No results found for "{query}"</p>
                        <p className="telescope-hint">
                            Try searching for philosopher names or concepts like "Ethics", "Metaphysics"
                        </p>
                    </div>
                )}

                {/* Initial state hint */}
                {!query && (
                    <div className="telescope-hint-container">
                        <p className="telescope-hint">
                            Start typing to search through the constellation
                        </p>
                        <div className="telescope-suggestions">
                            <span className="suggestion-label">Popular:</span>
                            {['Plato', 'Ethics', 'Kant', 'Metaphysics'].map(term => (
                                <button
                                    key={term}
                                    className="suggestion-chip"
                                    onClick={() => {
                                        setQuery(term);
                                        performSearch(term);
                                    }}
                                >
                                    {term}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default memo(TelescopeSearch);
