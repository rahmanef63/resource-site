import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from './Button';

interface LightboxProps {
  images: string[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
  captions?: string[];
}

export function Lightbox({ images, initialIndex = 0, isOpen, onClose, captions }: LightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setScale(1);
  }, [initialIndex, isOpen]);

  const handlePrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    setScale(1);
  }, [images.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    setScale(1);
  }, [images.length]);

  const handleZoomIn = useCallback(() => {
    setScale((prev) => Math.min(prev + 0.25, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale((prev) => Math.max(prev - 0.25, 0.5));
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          handlePrevious();
          break;
        case 'ArrowRight':
          handleNext();
          break;
        case '+':
        case '=':
          handleZoomIn();
          break;
        case '-':
          handleZoomOut();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, handlePrevious, handleNext, handleZoomIn, handleZoomOut]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Image gallery"
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-white/80 transition-colors z-10"
        aria-label="Close lightbox"
      >
        <X className="w-8 h-8" />
      </button>

      <div className="absolute top-4 left-4 text-white text-sm z-10">
        {currentIndex + 1} / {images.length}
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        <Button
          size="sm"
          variant="ghost"
          onClick={(e?: React.MouseEvent<HTMLButtonElement>) => {
            e?.stopPropagation();
            handleZoomOut();
          }}
          className="bg-black/50 hover:bg-black/70 text-white"
          aria-label="Zoom out"
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={(e?: React.MouseEvent<HTMLButtonElement>) => {
            e?.stopPropagation();
            handleZoomIn();
          }}
          className="bg-black/50 hover:bg-black/70 text-white"
          aria-label="Zoom in"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
      </div>

      {images.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrevious();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-white/80 transition-colors p-2 bg-black/50 rounded-full"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-white/80 transition-colors p-2 bg-black/50 rounded-full"
            aria-label="Next image"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </>
      )}

      <div
        className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={images[currentIndex]}
          alt={captions?.[currentIndex] || `Image ${currentIndex + 1}`}
          width={1600}
          height={900}
          className="max-w-full max-h-[90vh] object-contain transition-transform duration-200"
          style={{ transform: `scale(${scale})` }}
          sizes="90vw"
        />
        {captions?.[currentIndex] && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-4 text-center">
            {captions[currentIndex]}
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(index);
                setScale(1);
              }}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex ? 'bg-white w-8' : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface ImageWithLightboxProps {
  src: string;
  alt: string;
  className?: string;
  images?: string[];
  captions?: string[];
}

export function ImageWithLightbox({ src, alt, className, images, captions }: ImageWithLightboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const allImages = images || [src];
  const initialIndex = images ? images.indexOf(src) : 0;

  return (
    <>
      <Image
        src={src}
        alt={alt}
        width={800}
        height={600}
        className={`cursor-pointer hover:opacity-90 transition-opacity ${className || ''}`}
        onClick={() => setIsOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(true);
          }
        }}
        sizes="100vw"
      />
      <Lightbox
        images={allImages}
        initialIndex={initialIndex}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        captions={captions}
      />
    </>
  );
}
