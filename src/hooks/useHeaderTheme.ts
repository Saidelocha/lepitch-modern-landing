import { useEffect, useState, useRef, useCallback } from 'react';

export type HeaderTheme = 'hero' | 'white' | 'transparent';

export const useHeaderTheme = () => {
  const [headerTheme, setHeaderTheme] = useState<HeaderTheme>('hero');
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Scroll-based fallback for when intersection observer fails
  const handleScrollFallback = useCallback(() => {
    const heroSection = document.querySelector('[data-hero-section]');
    const heroHeight = heroSection ? heroSection.clientHeight : window.innerHeight;
    const scrollY = window.scrollY;
    
    let theme: HeaderTheme;
    if (scrollY < heroHeight * 0.8) {
      theme = 'hero';
    } else {
      theme = 'white'; // Default to white for main content
    }
    
    setHeaderTheme(theme);
  }, []);

  useEffect(() => {
    const headerHeight = 80;
    const rootMargin = `-${headerHeight}px 0px 0px 0px`;

    // Initial scroll check - force hero theme at start
    setTimeout(() => {
      handleScrollFallback();
    }, 50);

    // Set up intersection observer
    const setupObserver = () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      observerRef.current = new IntersectionObserver(
        (entries) => {
          const heroSection = document.querySelector('[data-hero-section]');
          const heroHeight = heroSection ? heroSection.clientHeight : window.innerHeight;
          const scrollY = window.scrollY;
          
          let theme: HeaderTheme;
          
          if (scrollY < heroHeight * 0.8) {
            theme = 'hero';
          } else {
            let hasWhiteSection = false;
            
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                const element = entry.target as HTMLElement;
                const bgColor = window.getComputedStyle(element).backgroundColor;
                
                // Check if the section has white background
                if (
                  element.hasAttribute('data-white-section') ||
                  bgColor === 'rgb(255, 255, 255)' ||
                  bgColor === 'rgba(255, 255, 255, 1)' ||
                  element.classList.contains('bg-white')
                ) {
                  hasWhiteSection = true;
                }
              }
            });
            
            theme = hasWhiteSection ? 'white' : 'transparent';
          }

          setHeaderTheme(theme);
        },
        {
          root: null,
          rootMargin,
          threshold: 0.1
        }
      );

      // Wait for DOM to be ready and observe elements
      const observeElements = () => {
        const sectionsToObserve = document.querySelectorAll(
          'main, main section, [data-white-section], .bg-white, [data-hero-section]'
        );

        sectionsToObserve.forEach((section) => {
          if (observerRef.current) {
            observerRef.current.observe(section);
          }
        });
      };

      // Observe immediately and also after a short delay to catch dynamic content
      observeElements();
      setTimeout(observeElements, 100);
    };

    // Set up observer after DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', setupObserver);
    } else {
      setupObserver();
    }

    // Add scroll listener as fallback
    window.addEventListener('scroll', handleScrollFallback, { passive: true });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      window.removeEventListener('scroll', handleScrollFallback);
      document.removeEventListener('DOMContentLoaded', setupObserver);
    };
  }, [handleScrollFallback]);

  return { headerTheme };
};