/**
 * useZoomPan Hook
 * Manages zoom and pan state for the constellation map
 * Supports mouse wheel zoom, click-drag pan, and touch gestures
 */

import { useState, useCallback, useRef, useEffect } from 'react';

const DEFAULT_CONFIG = {
    minZoom: 0.3,
    maxZoom: 4,
    zoomSensitivity: 0.001,
    panSensitivity: 1,
    animationDuration: 300
};

/**
 * Custom hook for zoom and pan functionality
 * @param {Object} config - Configuration options
 * @returns {Object} Transform state and event handlers
 */
export const useZoomPan = (config = {}) => {
    const {
        minZoom,
        maxZoom,
        zoomSensitivity,
        panSensitivity,
        animationDuration
    } = { ...DEFAULT_CONFIG, ...config };

    // Transform state
    const [transform, setTransform] = useState({
        scale: 1,
        x: 0,
        y: 0
    });

    // Animation state
    const [isAnimating, setIsAnimating] = useState(false);

    // Refs for gesture tracking
    const containerRef = useRef(null);
    const isPanning = useRef(false);
    const lastPosition = useRef({ x: 0, y: 0 });
    const lastTouchDistance = useRef(0);
    const lastTouchCenter = useRef({ x: 0, y: 0 });
    const animationRef = useRef(null);

    /**
     * Get container bounds
     */
    const getContainerBounds = useCallback(() => {
        if (!containerRef.current) return { width: 0, height: 0, left: 0, top: 0 };
        return containerRef.current.getBoundingClientRect();
    }, []);

    /**
     * Clamp zoom level to valid range
     */
    const clampZoom = useCallback((zoom) => {
        return Math.max(minZoom, Math.min(maxZoom, zoom));
    }, [minZoom, maxZoom]);

    /**
     * Zoom at a specific point (keeps that point stationary)
     */
    const zoomAtPoint = useCallback((newScale, pointX, pointY) => {
        setTransform(prev => {
            const clampedScale = clampZoom(newScale);
            const scaleFactor = clampedScale / prev.scale;

            // Zoom toward the point
            const newX = pointX - (pointX - prev.x) * scaleFactor;
            const newY = pointY - (pointY - prev.y) * scaleFactor;

            return {
                scale: clampedScale,
                x: newX,
                y: newY
            };
        });
    }, [clampZoom]);

    /**
     * Animate transform to target values
     */
    const animateTo = useCallback((targetTransform, duration = animationDuration) => {
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
        }

        setIsAnimating(true);
        const startTransform = { ...transform };
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease out cubic
            const easeProgress = 1 - Math.pow(1 - progress, 3);

            setTransform({
                scale: startTransform.scale + (targetTransform.scale - startTransform.scale) * easeProgress,
                x: startTransform.x + (targetTransform.x - startTransform.x) * easeProgress,
                y: startTransform.y + (targetTransform.y - startTransform.y) * easeProgress
            });

            if (progress < 1) {
                animationRef.current = requestAnimationFrame(animate);
            } else {
                setIsAnimating(false);
                animationRef.current = null;
            }
        };

        animationRef.current = requestAnimationFrame(animate);
    }, [transform, animationDuration]);

    /**
     * Zoom to fit a specific point in view (center of viewport)
     */
    const zoomToPoint = useCallback((targetX, targetY, targetScale = 2, duration = 600) => {
        const bounds = getContainerBounds();
        const centerX = bounds.width / 2;
        const centerY = bounds.height / 2;

        const clampedScale = clampZoom(targetScale);

        // Calculate transform to center the point
        const newX = centerX - targetX * clampedScale;
        const newY = centerY - targetY * clampedScale;

        animateTo({ scale: clampedScale, x: newX, y: newY }, duration);
    }, [getContainerBounds, clampZoom, animateTo]);

    /**
     * Reset transform to initial state
     */
    const resetTransform = useCallback(() => {
        animateTo({ scale: 1, x: 0, y: 0 });
    }, [animateTo]);

    /**
     * Zoom in by a factor
     */
    const zoomIn = useCallback((factor = 1.5) => {
        const bounds = getContainerBounds();
        const centerX = bounds.width / 2;
        const centerY = bounds.height / 2;
        zoomAtPoint(transform.scale * factor, centerX, centerY);
    }, [transform.scale, getContainerBounds, zoomAtPoint]);

    /**
     * Zoom out by a factor
     */
    const zoomOut = useCallback((factor = 1.5) => {
        const bounds = getContainerBounds();
        const centerX = bounds.width / 2;
        const centerY = bounds.height / 2;
        zoomAtPoint(transform.scale / factor, centerX, centerY);
    }, [transform.scale, getContainerBounds, zoomAtPoint]);

    // ========== Mouse Event Handlers ==========

    const handleWheel = useCallback((e) => {
        e.preventDefault();

        const bounds = getContainerBounds();
        const pointX = e.clientX - bounds.left;
        const pointY = e.clientY - bounds.top;

        // Calculate new scale
        const delta = -e.deltaY * zoomSensitivity;
        const newScale = transform.scale * (1 + delta);

        zoomAtPoint(newScale, pointX, pointY);
    }, [transform.scale, getContainerBounds, zoomSensitivity, zoomAtPoint]);

    const handleMouseDown = useCallback((e) => {
        if (e.button !== 0) return; // Only left click

        isPanning.current = true;
        lastPosition.current = { x: e.clientX, y: e.clientY };

        // Change cursor
        if (containerRef.current) {
            containerRef.current.style.cursor = 'grabbing';
        }
    }, []);

    const handleMouseMove = useCallback((e) => {
        if (!isPanning.current) return;

        const deltaX = (e.clientX - lastPosition.current.x) * panSensitivity;
        const deltaY = (e.clientY - lastPosition.current.y) * panSensitivity;

        setTransform(prev => ({
            ...prev,
            x: prev.x + deltaX,
            y: prev.y + deltaY
        }));

        lastPosition.current = { x: e.clientX, y: e.clientY };
    }, [panSensitivity]);

    const handleMouseUp = useCallback(() => {
        isPanning.current = false;

        if (containerRef.current) {
            containerRef.current.style.cursor = 'grab';
        }
    }, []);

    // ========== Touch Event Handlers ==========

    const getTouchDistance = (touches) => {
        if (touches.length < 2) return 0;
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    };

    const getTouchCenter = (touches, bounds) => {
        if (touches.length < 2) {
            return {
                x: touches[0].clientX - bounds.left,
                y: touches[0].clientY - bounds.top
            };
        }
        return {
            x: (touches[0].clientX + touches[1].clientX) / 2 - bounds.left,
            y: (touches[0].clientY + touches[1].clientY) / 2 - bounds.top
        };
    };

    const handleTouchStart = useCallback((e) => {
        const bounds = getContainerBounds();

        if (e.touches.length === 1) {
            // Single touch - prepare for pan
            isPanning.current = true;
            lastPosition.current = {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY
            };
        } else if (e.touches.length === 2) {
            // Two touches - prepare for pinch zoom
            isPanning.current = false;
            lastTouchDistance.current = getTouchDistance(e.touches);
            lastTouchCenter.current = getTouchCenter(e.touches, bounds);
        }
    }, [getContainerBounds]);

    const handleTouchMove = useCallback((e) => {
        e.preventDefault();
        const bounds = getContainerBounds();

        if (e.touches.length === 1 && isPanning.current) {
            // Single touch pan
            const deltaX = (e.touches[0].clientX - lastPosition.current.x) * panSensitivity;
            const deltaY = (e.touches[0].clientY - lastPosition.current.y) * panSensitivity;

            setTransform(prev => ({
                ...prev,
                x: prev.x + deltaX,
                y: prev.y + deltaY
            }));

            lastPosition.current = {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY
            };
        } else if (e.touches.length === 2) {
            // Pinch zoom
            const newDistance = getTouchDistance(e.touches);
            const newCenter = getTouchCenter(e.touches, bounds);

            if (lastTouchDistance.current > 0) {
                const scaleFactor = newDistance / lastTouchDistance.current;
                const newScale = transform.scale * scaleFactor;

                zoomAtPoint(newScale, newCenter.x, newCenter.y);
            }

            lastTouchDistance.current = newDistance;
            lastTouchCenter.current = newCenter;
        }
    }, [transform.scale, getContainerBounds, panSensitivity, zoomAtPoint]);

    const handleTouchEnd = useCallback((e) => {
        if (e.touches.length === 0) {
            isPanning.current = false;
            lastTouchDistance.current = 0;
        } else if (e.touches.length === 1) {
            // Switched from pinch to pan
            isPanning.current = true;
            lastPosition.current = {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY
            };
        }
    }, []);

    // Double tap to zoom
    const lastTapTime = useRef(0);
    const handleDoubleTap = useCallback((e) => {
        const now = Date.now();
        const DOUBLE_TAP_DELAY = 300;

        if (now - lastTapTime.current < DOUBLE_TAP_DELAY) {
            // Double tap detected
            const bounds = getContainerBounds();
            const pointX = e.changedTouches[0].clientX - bounds.left;
            const pointY = e.changedTouches[0].clientY - bounds.top;

            // Toggle between zoomed and normal
            if (transform.scale > 1.5) {
                animateTo({ scale: 1, x: 0, y: 0 }, 400);
            } else {
                zoomAtPoint(2.5, pointX, pointY);
            }
        }

        lastTapTime.current = now;
    }, [transform.scale, getContainerBounds, zoomAtPoint, animateTo]);

    // Cleanup animation on unmount
    useEffect(() => {
        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, []);

    // Attach global mouse events for panning outside container
    useEffect(() => {
        const handleGlobalMouseMove = (e) => {
            if (isPanning.current) {
                handleMouseMove(e);
            }
        };

        const handleGlobalMouseUp = () => {
            handleMouseUp();
        };

        window.addEventListener('mousemove', handleGlobalMouseMove);
        window.addEventListener('mouseup', handleGlobalMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleGlobalMouseMove);
            window.removeEventListener('mouseup', handleGlobalMouseUp);
        };
    }, [handleMouseMove, handleMouseUp]);

    return {
        // Refs
        containerRef,

        // State
        transform,
        isAnimating,

        // Direct setters
        setTransform,

        // Actions
        zoomIn,
        zoomOut,
        zoomToPoint,
        zoomAtPoint,
        resetTransform,
        animateTo,

        // Event handlers to attach to container
        handlers: {
            onWheel: handleWheel,
            onMouseDown: handleMouseDown,
            onTouchStart: handleTouchStart,
            onTouchMove: handleTouchMove,
            onTouchEnd: (e) => {
                handleTouchEnd(e);
                handleDoubleTap(e);
            }
        }
    };
};

export default useZoomPan;
