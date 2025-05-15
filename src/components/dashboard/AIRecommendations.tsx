
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { UserStats } from '@/lib/dashboard';
import { getCategoryIcon, getCategoryColor, getStrongestArea, getWeakestArea } from './CognitiveAreaUtils';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/ui/use-toast';
import { ChevronRight, Sparkles } from 'lucide-react';

interface AIRecommendationsProps {
  stats: UserStats;
  recommendations: any[];
  isLoading: boolean;
  refreshKey?: number; // Add refreshKey prop to force re-render
}

const AIRecommendations = ({ stats, recommendations, isLoading, refreshKey }: AIRecommendationsProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Effect to log when recommendations update
  useEffect(() => {
    if (!isLoading && recommendations.length > 0) {
      console.log("AI recommendations refreshed with new data", { stats, recommendations, refreshKey });
    }
  }, [stats, recommendations, isLoading, refreshKey]);
  
  const handleGameClick = (gameId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to play this game",
        variant: "destructive"
      });
      return;
    }
    
    // Log which game is being navigated to for debugging
    console.log(`Navigating to game: ${gameId}`);
    navigate(`/game/${gameId}`);
  };

  // Generate personalized AI message based on user stats
  const generateAIMessage = () => {
    const strongestArea = getStrongestArea(stats);
    const weakestArea = getWeakestArea(stats);
    
    // Different message patterns based on user's stats
    if (stats.gamesPlayed === 0) {
      return "Let's start building your cognitive profile! Try these exercises to establish your baseline abilities.";
    } else if (stats.gamesPlayed < 5) {
      return `Based on your initial games, I'm starting to understand your cognitive profile. You seem to have natural strengths in ${strongestArea}. Let's explore more with these recommendations.`;
    } else if (stats.streak >= 3) {
      return `Impressive ${stats.streak}-day streak! You excel at ${strongestArea} tasks (${stats.gamesPlayed} games completed), but could benefit from more ${weakestArea}-building exercises to create a balanced cognitive profile.`;
    } else if (stats.progress > 30) {
      return `Your cognitive scores have improved by ${stats.progress}%! You show particular strength in ${strongestArea}, while focused training on ${weakestArea} could help balance your abilities.`;
    } else {
      return `Based on your ${stats.gamesPlayed} completed exercises, you excel at ${strongestArea} tasks but could benefit from more ${weakestArea}-building exercises. Try these personalized recommendations to improve your overall cognitive fitness.`;
    }
  };
  
  return (
    <>
      <h2 className="text-2xl font-bold mt-8 mb-4">Your AI Recommendations</h2>
      <Card className="border-brain-teal/20">
        <CardContent className="p-6">
          {isLoading ? (
            <>
              <Skeleton className="h-16 w-full mb-4" />
              <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            </>
          ) : (
            <>
              <div className="flex items-start gap-3 mb-4">
                <div className="bg-brain-purple/10 p-2 rounded-full mt-0.5">
                  <Sparkles className="h-5 w-5 text-brain-purple" />
                </div>
                <p className="italic text-muted-foreground">
                  {generateAIMessage()}
                </p>
              </div>
              
              <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
                {recommendations.map((game, index) => (
                  <div 
                    key={`${game.id}-${refreshKey || 0}-${index}`} // Add refreshKey to ensure DOM updates
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-300 hover:shadow-md 
                      ${game.isIdeal ? 'border-brain-purple/40 bg-brain-purple/5' : 'border-gray-200'}`}
                  >
                    <div className={`${getCategoryColor(game.category)} p-2 rounded-full`}>
                      {getCategoryIcon(game.category)}
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center justify-between">
                        <Button 
                          variant="link" 
                          className="h-auto p-0 font-medium text-left"
                          onClick={() => handleGameClick(game.id)}
                        >
                          {game.name}
                        </Button>
                        {game.isIdeal && (
                          <span className="bg-brain-purple/10 text-brain-purple text-xs px-2 py-0.5 rounded-full">
                            Ideal match
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mb-1">
                        {game.reasonShort}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {game.reason || (index === 0 
                          ? `Recommended to improve your ${game.category}` 
                          : 'New game for you')}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 text-xs hover:bg-brain-teal/10 hover:text-brain-teal group"
                        onClick={() => handleGameClick(game.id)}
                      >
                        Start Exercise
                        <ChevronRight className="h-3 w-3 ml-1 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default AIRecommendations;
