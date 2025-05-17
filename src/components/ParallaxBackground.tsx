
import React from 'react';
import ParallaxElement from './ParallaxElement';

const ParallaxBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Deep background layer - slowest moving */}
      <ParallaxElement speed={0.05} direction="up" className="absolute inset-0">
        <div className="absolute top-20 right-[10%] w-96 h-96 rounded-full bg-brain-purple/5 blur-3xl"></div>
        <div className="absolute bottom-40 left-[5%] w-80 h-80 rounded-full bg-brain-teal/5 blur-3xl"></div>
      </ParallaxElement>
      
      {/* Middle layer - medium speed */}
      <ParallaxElement speed={0.1} direction="down" className="absolute inset-0">
        <div className="absolute top-60 left-[20%] w-64 h-64 rounded-full bg-brain-coral/5 blur-2xl"></div>
        <div className="absolute right-[15%] bottom-80 w-72 h-72 rounded-full bg-brain-purple/5 blur-2xl"></div>
      </ParallaxElement>
      
      {/* Foreground layer - fastest moving small elements */}
      <ParallaxElement speed={0.2} direction="up" className="absolute inset-0">
        <div className="absolute top-[30%] left-[25%] w-8 h-8 rounded-full bg-brain-teal/10 blur-sm"></div>
        <div className="absolute top-[15%] right-[35%] w-6 h-6 rounded bg-brain-purple/10 blur-sm"></div>
        <div className="absolute bottom-[20%] right-[20%] w-10 h-10 rounded-md rotate-45 bg-brain-coral/10 blur-sm"></div>
      </ParallaxElement>
      
      <ParallaxElement speed={0.15} direction="left" className="absolute inset-0">
        <div className="absolute top-[45%] right-[18%] w-4 h-4 rounded-full bg-brain-yellow/15 blur-sm"></div>
        <div className="absolute bottom-[35%] left-[22%] w-5 h-5 rounded-full bg-brain-purple/10 blur-sm"></div>
      </ParallaxElement>
    </div>
  );
};

export default ParallaxBackground;
