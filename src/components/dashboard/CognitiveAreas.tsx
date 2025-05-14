
import React from 'react';
import { Brain, Check, GamepadIcon } from 'lucide-react';
import CognitiveAreaCard from './CognitiveAreaCard';

interface CognitiveAreasProps {
  memoryScore: number;
  focusScore: number;
  speedScore: number;
  isLoading: boolean;
}

const CognitiveAreas = ({ 
  memoryScore, 
  focusScore, 
  speedScore, 
  isLoading 
}: CognitiveAreasProps) => {
  return (
    <>
      <h2 className="text-2xl font-bold mb-4">Cognitive Areas</h2>
      <div className="grid gap-4 mb-8">
        <CognitiveAreaCard 
          title="Memory" 
          score={memoryScore} 
          icon={<Brain className="h-4 w-4 text-brain-purple" />}
          description="Based on memory games performance"
          isLoading={isLoading}
        />
        
        <CognitiveAreaCard 
          title="Focus" 
          score={focusScore} 
          icon={<Check className="h-4 w-4 text-brain-teal" />}
          description="Based on attention games performance"
          isLoading={isLoading}
        />
        
        <CognitiveAreaCard 
          title="Processing Speed" 
          score={speedScore} 
          icon={<GamepadIcon className="h-4 w-4 text-brain-coral" />}
          description="Based on reaction games performance"
          isLoading={isLoading}
        />
      </div>
    </>
  );
};

export default CognitiveAreas;
