
import React from 'react';
import FloatingElement from './FloatingElement';

interface BackgroundDecorationProps {
  variant?: 'default' | 'minimal' | 'none';
}

const BackgroundDecoration: React.FC<BackgroundDecorationProps> = ({ 
  variant = 'default'
}) => {
  if (variant === 'none') return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
      {/* Gradient background */}
      <div className="absolute inset-0 gradient-background opacity-50" />
      
      {variant === 'default' && (
        <>
          {/* Top right purple blob */}
          <FloatingElement 
            className="absolute top-10 right-[10%]" 
            speed="slow"
          >
            <div className="h-64 w-64 rounded-full bg-brain-purple/5 blur-3xl" />
          </FloatingElement>
          
          {/* Bottom left teal blob */}
          <FloatingElement 
            className="absolute bottom-20 left-[5%]" 
            speed="slow"
            delay={2}
          >
            <div className="h-72 w-72 rounded-full bg-brain-teal/5 blur-3xl" />
          </FloatingElement>
          
          {/* Small moving shapes */}
          <FloatingElement className="absolute top-1/4 left-[15%]" speed="medium">
            <div className="h-4 w-4 rounded-full bg-brain-purple/10" />
          </FloatingElement>
          
          <FloatingElement className="absolute top-1/3 right-[20%]" speed="fast" delay={1}>
            <div className="h-3 w-3 rounded bg-brain-coral/10" />
          </FloatingElement>
          
          <FloatingElement className="absolute bottom-1/3 left-[30%]" speed="medium" delay={3}>
            <div className="h-6 w-6 rounded-md rotate-45 bg-brain-teal/10" />
          </FloatingElement>
        </>
      )}
      
      {variant === 'minimal' && (
        <>
          {/* Minimal decorations */}
          <FloatingElement className="absolute top-20 right-[15%]" speed="slow">
            <div className="h-48 w-48 rounded-full bg-brain-purple/3 blur-2xl" />
          </FloatingElement>
          
          <FloatingElement className="absolute bottom-20 left-[10%]" speed="slow" delay={1}>
            <div className="h-40 w-40 rounded-full bg-brain-teal/3 blur-2xl" />
          </FloatingElement>
        </>
      )}
    </div>
  );
};

export default BackgroundDecoration;
