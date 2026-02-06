/**
 * EraFilterBar Component
 * Horizontal button bar for filtering philosophers by era
 * Supports multi-select, clear, and major/minor toggle
 */

import React, { memo } from 'react';

const EraFilterBar = ({
    selectedEras,
    onToggleEra,
    onClear,
    visibleCount,
    totalCount,
    hasActiveFilter,
    eraDefinitions,
    showMinor,
    onToggleShowMinor
}) => {
    return (
        <div className="era-filter-bar">
            <div className="era-filter-buttons">
                {Object.entries(eraDefinitions).map(([eraKey, eraDef]) => {
                    const isSelected = selectedEras.has(eraKey);
                    return (
                        <button
                            key={eraKey}
                            className={`era-filter-btn ${isSelected ? 'selected' : ''}`}
                            style={{
                                '--era-color': eraDef.color,
                                backgroundColor: isSelected ? eraDef.color : undefined,
                                borderColor: isSelected ? eraDef.color : undefined,
                                color: isSelected ? '#fff' : undefined
                            }}
                            onClick={() => onToggleEra(eraKey)}
                            aria-pressed={isSelected}
                            aria-label={`Filter ${eraDef.label} era`}
                        >
                            {eraDef.label}
                        </button>
                    );
                })}
            </div>

            <div className="era-filter-meta">
                {/* Major/Minor toggle */}
                <button
                    className={`era-filter-toggle ${!showMinor ? 'active' : ''}`}
                    onClick={onToggleShowMinor}
                    aria-pressed={!showMinor}
                    aria-label={showMinor ? 'Show major philosophers only' : 'Show all philosophers'}
                >
                    {showMinor ? 'All' : 'Major Only'}
                </button>

                <span className="era-filter-count">
                    {visibleCount} of {totalCount} philosophers
                </span>
                {hasActiveFilter && (
                    <button
                        className="era-filter-clear"
                        onClick={onClear}
                        aria-label="Clear era filter"
                    >
                        Clear
                    </button>
                )}
            </div>
        </div>
    );
};

export default memo(EraFilterBar);
