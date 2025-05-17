
import React, { useEffect, useRef, ReactNode } from 'react';

interface ParallaxElementProps {
  children: ReactNode;
  speed?: number; // Speed multiplier for parallax effect
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right';
}

const ParallaxElement: React.FC<ParallaxElementProps> = ({ 
  children, 
  speed = 0.2, 
  className = "",
  direction = 'up'
}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    
    // Skip parallax effects if user prefers reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    
    let startPosition = 0;
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (!element) return;
          
          const scrollPosition = window.scrollY;
          const elementPosition = element.offsetTop;
          const viewportHeight = window.innerHeight;
          
          // Only apply parallax when element is in viewport or close to it
          if (elementPosition < scrollPosition + viewportHeight && 
              elementPosition + element.offsetHeight > scrollPosition) {
            
            // Calculate the offset based on how far the element is into the viewport
            const scrollOffset = (scrollPosition + viewportHeight - elementPosition) * speed;
            
            // Apply transform based on specified direction
            let transform = '';
            switch(direction) {
              case 'up':
                transform = `translateY(-${scrollOffset}px)`;
                break;
              case 'down':
                transform = `translateY(${scrollOffset}px)`;
                break;
              case 'left':
                transform = `translateX(-${scrollOffset}px)`;
                break;
              case 'right':
                transform = `translateX(${scrollOffset}px)`;
                break;
            }
            
            element.style.transform = transform;
          }
          
          ticking = false;
        });
        
        ticking = true;
      }
    };
    
    // Initial position
    handleScroll();
    
    // Add scroll listener
    window.addEventListener('scroll', handleScroll);
    
    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [speed, direction]);
  
  return (
    <div ref={elementRef} className={className}>
      {children}
    </div>
  );
};

export default ParallaxElement;
