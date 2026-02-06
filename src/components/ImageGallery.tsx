import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ProjectImage, getSortedImages, Project } from '@/types/project';
import { useLongPress } from '@/hooks/useLongPress';
import luxuryWatch from '@/assets/luxury-watch.jpg';

interface ImageGalleryProps {
  project: Project;
  size: number;
  onOpenGalleryManager: () => void;
  onImageChange?: (imageUrl: string) => void;
}

const ImageGallery = ({ project, size, onOpenGalleryManager, onImageChange }: ImageGalleryProps) => {
  // Memoize sorted images to prevent recalculation on every render
  const sortedImages = useMemo(() => getSortedImages(project), [project.images]);
  const hasMultipleImages = sortedImages.length > 1;
  const hasImages = sortedImages.length > 0;
  
  // Find the favorite image index or default to 0
  const favoriteIndex = useMemo(() => {
    return sortedImages.findIndex(img => img.isFavorite);
  }, [sortedImages]);
  const initialIndex = favoriteIndex >= 0 ? favoriteIndex : 0;
  
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [direction, setDirection] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Force layout ready after initial mount
  useEffect(() => {
    // Small delay to ensure DOM is fully ready
    const timer = requestAnimationFrame(() => {
      setIsReady(true);
    });
    return () => cancelAnimationFrame(timer);
  }, []);

  // Reset index when project changes
  useEffect(() => {
    const newFavoriteIndex = sortedImages.findIndex(img => img.isFavorite);
    setCurrentIndex(newFavoriteIndex >= 0 ? newFavoriteIndex : 0);
  }, [project.id, sortedImages]);

  // Long press handler for thumbnail
  const { isPressed, progress, handlers } = useLongPress({
    onLongPress: onOpenGalleryManager,
    delay: 2000,
  });

  // Get current image URL - always return a valid URL
  const currentImageUrl = useMemo((): string => {
    if (sortedImages.length > 0 && sortedImages[currentIndex]) {
      return sortedImages[currentIndex].url;
    }
    return project.imageUrl || luxuryWatch;
  }, [sortedImages, currentIndex, project.imageUrl]);

  // Notify parent of image changes for color extraction
  useEffect(() => {
    if (isReady) {
      onImageChange?.(currentImageUrl);
    }
  }, [currentImageUrl, onImageChange, isReady]);

  // Get next thumbnail URL (always returns something for display)
  const thumbnailUrl = useMemo((): string => {
    if (sortedImages.length > 1) {
      const nextIndex = (currentIndex + 1) % sortedImages.length;
      return sortedImages[nextIndex]?.url || luxuryWatch;
    }
    // Show current image if only one, or default
    return sortedImages[0]?.url || project.imageUrl || luxuryWatch;
  }, [sortedImages, currentIndex, project.imageUrl]);

  const handleSwipe = (info: PanInfo) => {
    if (!hasMultipleImages) return;
    
    const threshold = 50;
    if (info.offset.x < -threshold) {
      // Swipe left - next image
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % sortedImages.length);
    } else if (info.offset.x > threshold) {
      // Swipe right - previous image
      setDirection(-1);
      setCurrentIndex((prev) => (prev - 1 + sortedImages.length) % sortedImages.length);
    }
  };

  const goToNext = () => {
    if (!hasMultipleImages) return;
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % sortedImages.length);
  };

  const goToPrev = () => {
    if (!hasMultipleImages) return;
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + sortedImages.length) % sortedImages.length);
  };

  const handleThumbnailClick = () => {
    if (hasMultipleImages) {
      goToNext();
    }
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -100 : 100,
      opacity: 0,
    }),
  };

  // Don't render until ready to prevent layout glitch
  if (!isReady) {
    return (
      <div 
        className="rounded-full overflow-hidden bg-card/20"
        style={{ width: size, height: size }}
      >
        <img
          src={currentImageUrl}
          alt={project.name}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div className="relative" ref={containerRef}>
      {/* Extended swipe zone - covers the entire glow area */}
      <motion.div
        className="absolute inset-0 z-10 cursor-grab active:cursor-grabbing"
        style={{ 
          width: size + 80, 
          height: size + 80,
          left: -40,
          top: -40,
        }}
        drag={hasMultipleImages ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={(_, info) => handleSwipe(info)}
      />

      {/* Navigation arrows for desktop */}
      {hasMultipleImages && (
        <>
          <button
            onClick={goToPrev}
            className="absolute left-[-40px] top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-4 h-4 text-foreground" strokeWidth={1.5} />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-[-40px] top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300"
            aria-label="Next image"
          >
            <ChevronRight className="w-4 h-4 text-foreground" strokeWidth={1.5} />
          </button>
        </>
      )}

      {/* Image display (visual only, drag handled by extended zone) */}
      <div
        className="hero-image-overlay rounded-full overflow-hidden"
        style={{ width: size, height: size }}
      >
        <AnimatePresence mode="wait" custom={direction}>
          <motion.img
            key={currentIndex}
            src={currentImageUrl}
            alt={project.name}
            className="w-full h-full object-cover"
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            draggable={false}
          />
        </AnimatePresence>
      </div>

      {/* Image counter dots */}
      {hasMultipleImages && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
          {sortedImages.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setDirection(index > currentIndex ? 1 : -1);
                setCurrentIndex(index);
              }}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-foreground w-3'
                  : 'bg-foreground/40'
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Thumbnail Preview - Bottom Left */}
      <motion.div
        className="absolute z-20"
        style={{ bottom: '-25px', left: '-25px' }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <button
          onClick={hasMultipleImages ? handleThumbnailClick : onOpenGalleryManager}
          {...handlers}
          className="relative rounded-full overflow-hidden transition-all duration-300 hover:scale-105"
          style={{ 
            width: 88, 
            height: 88,
            border: '2px solid #888888',
            boxShadow: '0 4px 20px rgba(255, 255, 255, 0.1)'
          }}
          aria-label={hasMultipleImages ? "View next image. Long press to manage gallery." : "Long press to add images"}
        >
          <img
            src={thumbnailUrl}
            alt="Gallery preview"
            className="w-full h-full object-cover"
          />
          
          {/* Long press progress ring */}
          {isPressed && (
            <svg
              className="absolute inset-0 w-full h-full -rotate-90"
              viewBox="0 0 100 100"
            >
              <circle
                cx="50"
                cy="50"
                r="48"
                fill="none"
                stroke="hsl(var(--accent-color))"
                strokeWidth="4"
                strokeDasharray={`${progress * 3.01} 301`}
                className="transition-all duration-50"
              />
            </svg>
          )}
        </button>
      </motion.div>
    </div>
  );
};

export default ImageGallery;
