import { useEffect, useRef, useState } from "react";
import "./OptimizedImage.css";

// ============================================================================
// TYPES
// ============================================================================

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  onLoad?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
}

// ============================================================================
// CONSTANTS
// ============================================================================

// Tiny 1x1 transparent placeholder
const PLACEHOLDER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3C/svg%3E";

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * OptimizedImage Component
 *
 * High-performance image component with:
 * - Intersection Observer for lazy loading
 * - Placeholder image while loading
 * - Fade-in animation on load
 * - Error handling with fallback
 *
 * @param src - Image URL
 * @param alt - Alt text for accessibility
 * @param className - Additional CSS classes
 * @param width - Image width (optional)
 * @param height - Image height (optional)
 * @param onLoad - Callback when image loads
 */
export const OptimizedImage = ({
  src,
  alt,
  className = "",
  width,
  height,
  onLoad,
}: OptimizedImageProps) => {
  // ----------------------------------------------------------------------------
  // STATE
  // ----------------------------------------------------------------------------

  const [isInView, setIsInView] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // ----------------------------------------------------------------------------
  // REFS
  // ----------------------------------------------------------------------------

  const imgRef = useRef<HTMLImageElement>(null);

  // ----------------------------------------------------------------------------
  // EFFECTS
  // ----------------------------------------------------------------------------

  /**
   * Set up Intersection Observer to detect when image enters viewport
   */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        // Start loading when image is 200px away from viewport
        rootMargin: "200px",
        threshold: 0.01,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  // ----------------------------------------------------------------------------
  // HANDLERS
  // ----------------------------------------------------------------------------

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setIsLoaded(true);
    onLoad?.(e);
  };

  const handleError = () => {
    setHasError(true);
    console.error(`Failed to load image: ${src}`);
  };

  // ----------------------------------------------------------------------------
  // RENDER
  // ----------------------------------------------------------------------------

  return (
    <img
      ref={imgRef}
      src={isInView ? src : PLACEHOLDER_IMAGE}
      alt={alt}
      className={`optimized-image ${className} ${isLoaded ? "loaded" : ""} ${
        hasError ? "error" : ""
      }`}
      width={width}
      height={height}
      loading="lazy"
      decoding="async"
      onLoad={handleLoad}
      onError={handleError}
    />
  );
};
