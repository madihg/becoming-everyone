'use client';

import { useState, useEffect, useCallback } from 'react';

// ARSON: Full-screen image gallery, click to navigate

export default function Modal5Content() {
  const [images, setImages] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Load images from public/arson/
  useEffect(() => {
    const loadImages = async () => {
      const foundImages: string[] = [];
      for (let i = 1; i <= 30; i++) {
        const formats = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
        for (const format of formats) {
          const path = `/arson/${i}.${format}`;
          try {
            const res = await fetch(path, { method: 'HEAD' });
            if (res.ok) {
              foundImages.push(path);
              break;
            }
          } catch {
            // Continue
          }
        }
      }
      setImages(foundImages);
      setIsLoading(false);
    };
    loadImages();
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        nextImage();
      } else if (e.key === 'ArrowLeft') {
        prevImage();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [images.length]);

  const nextImage = useCallback(() => {
    if (images.length > 0) {
      setCurrentIndex(prev => (prev + 1) % images.length);
    }
  }, [images.length]);

  const prevImage = useCallback(() => {
    if (images.length > 0) {
      setCurrentIndex(prev => prev === 0 ? images.length - 1 : prev - 1);
    }
  }, [images.length]);

  if (isLoading) {
    return (
      <div className="h-[70vh] flex items-center justify-center text-gray-500">
        Loading images...
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="h-[70vh] flex items-center justify-center text-gray-500">
        <div className="text-center">
          <div className="text-lg mb-2">No images found</div>
          <div className="text-sm">Drop images (1.jpg, 2.jpg, etc.) in public/arson/</div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="h-[70vh] relative cursor-pointer select-none"
      onClick={nextImage}
    >
      {/* Full-screen image */}
      <div className="absolute inset-0 flex items-center justify-center bg-black">
        <img
          src={images[currentIndex]}
          alt={`Arson ${currentIndex + 1}`}
          className="max-w-full max-h-full object-contain"
        />
      </div>
      
      {/* Navigation hints */}
      <button
        onClick={(e) => { e.stopPropagation(); prevImage(); }}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-[#FFE600] text-5xl transition-colors"
      >
        ‹
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); nextImage(); }}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-[#FFE600] text-5xl transition-colors"
      >
        ›
      </button>
      
      {/* Counter */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-gray-500 font-mono text-sm bg-black/70 px-3 py-1 rounded">
        {currentIndex + 1} / {images.length}
      </div>
      
      {/* Hint */}
      <div className="absolute bottom-4 right-4 text-gray-600 text-xs font-mono">
        click or → to advance
      </div>
    </div>
  );
}
