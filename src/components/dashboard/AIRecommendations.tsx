
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { UserStats } from '@/lib/dashboard';
import { getCategoryIcon, getCategoryColor, getStrongestArea, getWeakestArea } from './CognitiveAreaUtils';

interface AIRecommendationsProps {
  stats: UserStats;
  recommendations: any[];
  isLoading: boolean;
}

const AIRecommendations = ({ stats, recommendations, isLoading }: AIRecommendationsProps) => {
  const navigate = useNavigate();
  
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
              <p className="italic text-muted-foreground mb-4">
                "Based on your recent games, we've noticed you excel at {getStrongestArea(stats)} tasks but could benefit from more {getWeakestArea(stats)}-building exercises. Try our recommended games to improve your overall cognitive fitness."
              </p>
              
              <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
                {recommendations.map((game, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg border">
                    <div className={`${getCategoryColor(game.category)} p-2 rounded-full`}>
                      {getCategoryIcon(game.category)}
                    </div>
                    <div>
                      <Button 
                        variant="link" 
                        className="h-auto p-0 font-medium text-left"
                        onClick={() => navigate(`/game/${game.id}`)}
                      >
                        {game.name}
                      </Button>
                      <div className="text-xs text-muted-foreground">
                        {index === 0 ? `Recommended to improve your ${game.category}` : 'New game for you'}
                      </div>
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
