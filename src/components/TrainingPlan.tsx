
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, BarChart2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import AnimateOnScroll from '@/components/AnimateOnScroll';
import { fadeIn, fadeInRight, pulseOnHover, glowOnHover } from '@/lib/animate';
import { useState } from 'react';
import { toast } from 'sonner';

interface TrainingPlanProps {
  memoryScore: number;
  focusScore: number;
  speedScore: number;
  isLoading: boolean;
}

const TrainingPlan = ({ 
  memoryScore, 
  focusScore, 
  speedScore, 
  isLoading 
}: TrainingPlanProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  
  // Determine recommended training areas based on scores
  const getRecommendedPlan = () => {
    // Determine the weakest area
    let weakestArea = 'memory';
    let weakestScore = memoryScore;
    
    if (focusScore < weakestScore) {
      weakestArea = 'focus';
      weakestScore = focusScore;
    }
    
    if (speedScore < weakestScore) {
      weakestArea = 'speed';
      weakestScore = speedScore;
    }
    
    // Determine the strongest area
    let strongestArea = 'memory';
    let strongestScore = memoryScore;
    
    if (focusScore > strongestScore) {
      strongestArea = 'focus';
      strongestScore = focusScore;
    }
    
    if (speedScore > strongestScore) {
      strongestArea = 'speed';
      strongestScore = speedScore;
    }
    
    // Create a personalized plan based on scores
    const plan = [
      {
        area: weakestArea,
        name: weakestArea === 'memory' 
          ? 'Memory Training' 
          : weakestArea === 'focus' 
          ? 'Focus Improvement' 
          : 'Speed Enhancement',
        recommendation: weakestArea === 'memory'
          ? 'Recommended: Memory Match, Word Recall'
          : weakestArea === 'focus'
          ? 'Recommended: Number Sequence, Pattern Recognition'
          : 'Recommended: Reaction Test, Mental Math',
        gameId: weakestArea === 'memory'
          ? 'memory-match'
          : weakestArea === 'focus'
          ? 'number-sequence'
          : 'reaction-test',
        score: weakestArea === 'memory'
          ? memoryScore
          : weakestArea === 'focus'
          ? focusScore
          : speedScore,
        color: weakestArea === 'memory'
          ? 'bg-brain-purple/10 text-brain-purple'
          : weakestArea === 'focus'
          ? 'bg-brain-teal/10 text-brain-teal'
          : 'bg-brain-coral/10 text-brain-coral',
        borderColor: weakestArea === 'memory'
          ? 'border-brain-purple/20'
          : weakestArea === 'focus'
          ? 'border-brain-teal/20'
          : 'border-brain-coral/20'
      },
      {
        area: 'advanced',
        name: 'Advanced Practice',
        recommendation: 'Challenge yourself with exercises that build on your strengths',
        gameId: strongestArea === 'memory'
          ? 'word-recall'
          : strongestArea === 'focus'
          ? 'number-sequence'
          : 'reaction-test',
        score: strongestArea === 'memory'
          ? memoryScore
          : strongestArea === 'focus'
          ? focusScore
          : speedScore,
        color: 'bg-gray-100 text-gray-700',
        borderColor: 'border-gray-200'
      }
    ];
    
    return plan;
  };
  
  const plan = getRecommendedPlan();
  
  const handleStartTraining = (gameId: string, areaName: string) => {
    if (!user) {
      toast.error("Please log in to start training");
      return;
    }
    
    navigate(`/game/${gameId}`);
  };
  
  return (
    <AnimateOnScroll animation={fadeIn()} className="w-full">
      <Card className="border-brain-purple/20 transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-md font-medium flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-brain-purple animate-pulse-soft" />
            Personalized Training Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <>
              <Skeleton className="h-20 w-full mb-4" />
              <Skeleton className="h-20 w-full" />
            </>
          ) : (
            <div className="space-y-4">
              {plan.map((item, index) => (
                <AnimateOnScroll 
                  key={item.area}
                  animation={fadeInRight(index * 100)}
                  className="w-full"
                >
                  <div 
                    className={`flex flex-col space-y-3 p-3 rounded-lg border ${item.borderColor} transition-all duration-300 ${
                      hoveredItem === item.area ? 'shadow-lg transform -translate-y-1' : ''
                    }`}
                    onMouseEnter={() => setHoveredItem(item.area)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <div className="flex justify-between items-center">
                      <div className={`px-2 py-1 rounded text-xs ${item.color}`}>
                        {item.area.toUpperCase()}
                      </div>
                      <div className="text-sm font-medium">
                        Score: {item.score}%
                      </div>
                    </div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-muted-foreground">{item.recommendation}</div>
                    <Button
                      variant="outline"
                      size="sm"
                      className={`justify-between w-full ${pulseOnHover()} ${glowOnHover(item.area === 'memory' ? 'brain-purple' : item.area === 'focus' ? 'brain-teal' : 'brain-coral')}`}
                      onClick={() => handleStartTraining(item.gameId, item.name)}
                    >
                      <span>Start Training</span>
                      <ChevronRight className={`h-4 w-4 transition-transform duration-300 ${hoveredItem === item.area ? 'translate-x-1' : ''}`} />
                    </Button>
                  </div>
                </AnimateOnScroll>
              ))}
            </div>
          )}
          <div className="mt-4 text-xs text-muted-foreground text-center animate-pulse-soft">
            Your plan is updated automatically as you complete exercises
          </div>
        </CardContent>
      </Card>
    </AnimateOnScroll>
  );
};

export default TrainingPlan;
