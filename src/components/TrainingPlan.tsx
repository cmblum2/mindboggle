
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, BarChart2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import AnimateOnScroll from '@/components/AnimateOnScroll';
import { fadeIn, fadeInRight, pulseOnHover, glowOnHover } from '@/lib/animate';
import { useState, useMemo } from 'react';
import { toast } from 'sonner';

interface TrainingPlanProps {
  memoryScore: number;
  focusScore: number;
  speedScore: number;
  isLoading: boolean;
}

// Color mapping constants - defined outside component to avoid recreation
const AREA_COLORS = {
  memory: {
    bg: 'bg-brain-purple/10',
    text: 'text-brain-purple',
    border: 'border-brain-purple/20',
    glow: 'brain-purple'
  },
  focus: {
    bg: 'bg-brain-teal/10',
    text: 'text-brain-teal',
    border: 'border-brain-teal/20',
    glow: 'brain-teal'
  },
  speed: {
    bg: 'bg-brain-coral/10',
    text: 'text-brain-coral',
    border: 'border-brain-coral/20',
    glow: 'brain-coral'
  },
  advanced: {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    border: 'border-gray-200',
    glow: 'gray-400'
  }
};

const TrainingPlan = ({ 
  memoryScore, 
  focusScore, 
  speedScore, 
  isLoading 
}: TrainingPlanProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  
  // Memoize the plan calculation to avoid recalculating on every render
  const plan = useMemo(() => {
    // Find weakest area
    const scores = {
      memory: memoryScore,
      focus: focusScore,
      speed: speedScore
    };
    
    // Determine weakest and strongest areas in one pass
    let weakestArea = 'memory';
    let weakestScore = memoryScore;
    let strongestArea = 'memory';
    let strongestScore = memoryScore;
    
    // Single loop to find both min and max
    for (const [area, score] of Object.entries(scores)) {
      if (score < weakestScore) {
        weakestArea = area;
        weakestScore = score;
      }
      if (score > strongestScore) {
        strongestArea = area;
        strongestScore = score;
      }
    }
    
    // Map game IDs and recommendations
    const areaGameMappings = {
      memory: { gameId: 'memory-match', name: 'Memory Training', recommendation: 'Recommended: Memory Match, Word Recall' },
      focus: { gameId: 'number-sequence', name: 'Focus Improvement', recommendation: 'Recommended: Number Sequence, Pattern Recognition' },
      speed: { gameId: 'reaction-test', name: 'Speed Enhancement', recommendation: 'Recommended: Reaction Test, Mental Math' }
    };
    
    // Build the plan items
    const planItems = [
      // Weakest area recommendation
      {
        area: weakestArea,
        name: areaGameMappings[weakestArea as keyof typeof areaGameMappings].name,
        recommendation: areaGameMappings[weakestArea as keyof typeof areaGameMappings].recommendation,
        gameId: areaGameMappings[weakestArea as keyof typeof areaGameMappings].gameId,
        score: scores[weakestArea as keyof typeof scores],
        color: AREA_COLORS[weakestArea as keyof typeof AREA_COLORS].bg + ' ' + AREA_COLORS[weakestArea as keyof typeof AREA_COLORS].text,
        borderColor: AREA_COLORS[weakestArea as keyof typeof AREA_COLORS].border
      },
      // Advanced practice recommendation
      {
        area: 'advanced',
        name: 'Advanced Practice',
        recommendation: 'Challenge yourself with exercises that build on your strengths',
        gameId: areaGameMappings[strongestArea as keyof typeof areaGameMappings].gameId,
        score: scores[strongestArea as keyof typeof scores],
        color: AREA_COLORS.advanced.bg + ' ' + AREA_COLORS.advanced.text,
        borderColor: AREA_COLORS.advanced.border
      }
    ];
    
    return planItems;
  }, [memoryScore, focusScore, speedScore]);
  
  const handleStartTraining = (gameId: string, areaName: string) => {
    if (!user) {
      toast.error("Please log in to start training");
      return;
    }
    
    navigate(`/game/${gameId}`);
  };
  
  // Helper to determine the glow color based on area
  const getGlowColor = (area: string) => {
    if (area === 'memory') return 'brain-purple';
    if (area === 'focus') return 'brain-teal';
    return 'brain-coral';
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
                      className={`justify-between w-full ${pulseOnHover()} ${glowOnHover(getGlowColor(item.area))}`}
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
