'use client';

import { useState, useEffect } from 'react';

interface UseImageRotationOptions {
  images: string[];
  interval?: number;
  autoStart?: boolean;
}

export const useImageRotation = ({
  images,
  interval = 4000,
  autoStart = true,
}: UseImageRotationOptions) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Créer un tableau étendu avec la première image dupliquée à la fin
  const extendedImages = [...images, images[0]];

  useEffect(() => {
    if (!autoStart || images.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = prevIndex + 1;
        
        // Si on atteint la dernière image (première dupliquée)
        if (nextIndex === extendedImages.length - 1) {
          // On la montre puis on reset après la transition
          setTimeout(() => {
            setIsTransitioning(true);
            setCurrentIndex(0);
            setTimeout(() => setIsTransitioning(false), 50);
          }, 1000); // Attendre la fin de la transition
          return nextIndex;
        }
        
        return nextIndex;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [images.length, interval, autoStart, extendedImages.length]);

  const currentImage = images[currentIndex] || images[0];

  const goToNext = () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
      setTimeout(() => setIsTransitioning(false), 50);
    }, 400);
  };

  const goToPrevious = () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === 0 ? images.length - 1 : prevIndex - 1
      );
      setTimeout(() => setIsTransitioning(false), 50);
    }, 400);
  };

  const goToIndex = (index: number) => {
    if (isTransitioning || index < 0 || index >= images.length) return;
    
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(index);
      setTimeout(() => setIsTransitioning(false), 50);
    }, 400);
  };

  return {
    currentImage,
    currentIndex,
    isTransitioning,
    goToNext,
    goToPrevious,
    goToIndex,
    totalImages: images.length,
    extendedImages,
  };
};