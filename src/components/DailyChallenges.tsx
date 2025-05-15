
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Circle, CalendarDays, Star, Trophy } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from "sonner";
import { DailyChallenge, getDailyChallenges, updateChallengeStatus } from '@/lib/dashboard';
import { useAuth } from '@/hooks/useAuth';
import AnimateOnScroll from '@/components/AnimateOnScroll';
import { fadeIn, fadeInLeft, pulseOnHover } from '@/lib/animate';
import { Progress } from '@/components/ui/progress';

interface DailyChallengesProps {
  userId: string;
  onChallengeComplete: () => void;
}

const DailyChallenges = ({ userId, onChallengeComplete }: DailyChallengesProps) => {
  const [challenges, setChallenges] = useState<DailyChallenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeChallenge, setActiveChallenge] = useState<string | null>(null);
  const [showAnimation, setShowAnimation] = useState<string | null>(null);
  
  useEffect(() => {
    const loadChallenges = async () => {
      try {
        setIsLoading(true);
        const dailyChallenges = await getDailyChallenges(userId);
        setChallenges(dailyChallenges);
      } catch (error) {
        console.error('Error loading daily challenges:', error);
        toast.error('Could not load your daily challenges');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (userId) {
      loadChallenges();
    }
  }, [userId]);
  
  const handleToggleChallenge = async (challengeId: string, currentStatus: boolean) => {
    try {
      // Only allow toggling from incomplete to complete
      if (currentStatus) return;
      
      // Optimistically update UI
      setChallenges(prev => prev.map(challenge => 
        challenge.id === challengeId 
          ? { ...challenge, completed: true } 
          : challenge
      ));
      
      // Play animation
      setShowAnimation(challengeId);
      setTimeout(() => {
        setShowAnimation(null);
      }, 1500);
      
      // Update in database
      await updateChallengeStatus(challengeId, true);
      
      // If completing a challenge
      toast.success('Challenge completed! 🎉');
      onChallengeComplete();
    } catch (error) {
      // Revert on error
      setChallenges(prev => prev.map(challenge => 
        challenge.id === challengeId 
          ? { ...challenge, completed: false } 
          : challenge
      ));
      toast.error('Failed to update challenge');
    }
  };
  
  const getChallengeIcon = (type: string) => {
    switch (type) {
      case 'memory':
        return <div className="h-7 w-7 rounded-full bg-brain-purple/20 flex items-center justify-center">
          <span className="text-brain-purple text-xs font-medium">M</span>
        </div>;
      case 'focus':
        return <div className="h-7 w-7 rounded-full bg-brain-teal/20 flex items-center justify-center">
          <span className="text-brain-teal text-xs font-medium">F</span>
        </div>;
      case 'speed':
        return <div className="h-7 w-7 rounded-full bg-brain-coral/20 flex items-center justify-center">
          <span className="text-brain-coral text-xs font-medium">S</span>
        </div>;
      case 'mixed':
        return <div className="h-7 w-7 rounded-full bg-yellow-100 flex items-center justify-center">
          <span className="text-yellow-600 text-xs font-medium">B</span>
        </div>;
      case 'achievement':
        return <div className="h-7 w-7 rounded-full bg-amber-100 flex items-center justify-center">
          <Trophy className="h-3.5 w-3.5 text-amber-600" />
        </div>;
      default:
        return <div className="h-7 w-7 rounded-full bg-gray-200 flex items-center justify-center">
          <span className="text-gray-600 text-xs font-medium">•</span>
        </div>;
    }
  };
  
  const completedChallenges = challenges.filter(c => c.completed).length;
  const totalChallenges = challenges.length;
  
  return (
    <AnimateOnScroll animation={fadeIn(100)} className="w-full">
      <Card className="border-brain-teal/20 transition-all duration-300 overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-md font-medium flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-brain-teal" />
            Daily Challenges
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="text-sm text-muted-foreground">
              {completedChallenges}/{totalChallenges} completed
            </div>
            {completedChallenges > 0 && (
              <Star className={`h-4 w-4 text-yellow-500 ${completedChallenges === totalChallenges ? 'animate-pulse' : ''}`} />
            )}
          </div>
        </CardHeader>
        
        <CardContent className="pb-4">
          {/* Challenge Completion Progress */}
          <div className="mb-4">
            <Progress 
              value={(completedChallenges / totalChallenges) * 100} 
              className="h-1.5 bg-brain-teal" 
            />
          </div>
          
          {isLoading ? (
            <>
              <Skeleton className="h-14 w-full mb-3" />
              <Skeleton className="h-14 w-full mb-3" />
              <Skeleton className="h-14 w-full" />
            </>
          ) : challenges.length > 0 ? (
            <div className="space-y-3">
              {challenges.map((challenge, index) => (
                <AnimateOnScroll
                  key={challenge.id}
                  animation={fadeInLeft(index * 100)}
                  className="w-full"
                >
                  <div 
                    className={`relative flex items-center justify-between p-3 rounded-lg border transition-all duration-300 ${
                      challenge.completed ? 'bg-green-50 border-green-200' : 'hover:bg-muted/30'
                    } ${activeChallenge === challenge.id ? 'shadow-md transform -translate-y-0.5' : ''}`}
                    onMouseEnter={() => setActiveChallenge(challenge.id)}
                    onMouseLeave={() => setActiveChallenge(null)}
                  >
                    {/* Animation overlay */}
                    {showAnimation === challenge.id && (
                      <div className="absolute inset-0 bg-green-400/20 rounded-lg z-10 pointer-events-none animate-pulse flex items-center justify-center">
                        <div className="bg-white rounded-full p-1 animate-bounce">
                          <CheckCircle className="h-6 w-6 text-green-500" />
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-3">
                      <div className={`transition-transform duration-300 transform-gpu ${activeChallenge === challenge.id ? 'scale-110' : ''}`}>
                        {getChallengeIcon(challenge.challengeType)}
                      </div>
                      <div className={challenge.completed ? 'text-green-600 font-medium' : ''}>
                        {challenge.description}
                      </div>
                    </div>
                    <Button
                      variant={challenge.completed ? "ghost" : "outline"}
                      size="sm"
                      className={`h-8 w-8 p-0 rounded-full ${pulseOnHover()} ${challenge.completed ? '' : activeChallenge === challenge.id ? 'border-brain-teal' : ''}`}
                      onClick={() => handleToggleChallenge(challenge.id, challenge.completed)}
                      disabled={challenge.completed}
                    >
                      {challenge.completed ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <Circle className={`h-5 w-5 ${activeChallenge === challenge.id ? 'text-brain-teal' : ''}`} />
                      )}
                    </Button>
                  </div>
                </AnimateOnScroll>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              No challenges available today
            </div>
          )}
          
          {completedChallenges === totalChallenges && totalChallenges > 0 && (
            <div className="mt-4 text-center py-3 bg-green-50 rounded-lg border border-green-200">
              <div className="text-green-600 font-medium">All challenges completed!</div>
              <div className="text-sm text-green-500">Come back tomorrow for new challenges</div>
            </div>
          )}
        </CardContent>
      </Card>
    </AnimateOnScroll>
  );
};

export default DailyChallenges;
