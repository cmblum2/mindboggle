
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Circle, CalendarDays, BrainCircuit, Lightbulb, Zap, Trophy, Award, Star } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from "sonner";
import { DailyChallenge, getDailyChallenges, updateChallengeStatus } from '@/lib/dashboard';
import { useAuth } from '@/hooks/useAuth';
import AnimateOnScroll from '@/components/AnimateOnScroll';
import { fadeIn, fadeInLeft, pulseOnHover } from '@/lib/animate';

interface DailyChallengesProps {
  userId: string;
  onChallengeComplete: () => void;
}

const DailyChallenges = ({ userId, onChallengeComplete }: DailyChallengesProps) => {
  const [challenges, setChallenges] = useState<DailyChallenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeChallenge, setActiveChallenge] = useState<string | null>(null);
  
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
      // Optimistically update UI
      setChallenges(prev => prev.map(challenge => 
        challenge.id === challengeId 
          ? { ...challenge, completed: !currentStatus } 
          : challenge
      ));
      
      // Update in database
      await updateChallengeStatus(challengeId, !currentStatus);
      
      if (!currentStatus) {
        // If completing a challenge
        toast.success('Challenge completed! 🎉');
        onChallengeComplete();
      }
    } catch (error) {
      // Revert on error
      setChallenges(prev => prev.map(challenge => 
        challenge.id === challengeId 
          ? { ...challenge, completed: currentStatus } 
          : challenge
      ));
      toast.error('Failed to update challenge');
    }
  };
  
  const getChallengeIcon = (type: string) => {
    switch (type) {
      case 'memory':
        return <div className="h-6 w-6 rounded-full bg-brain-purple/20 flex items-center justify-center">
          <BrainCircuit className="h-4 w-4 text-brain-purple" />
        </div>;
      case 'focus':
        return <div className="h-6 w-6 rounded-full bg-brain-teal/20 flex items-center justify-center">
          <Lightbulb className="h-4 w-4 text-brain-teal" />
        </div>;
      case 'speed':
        return <div className="h-6 w-6 rounded-full bg-brain-coral/20 flex items-center justify-center">
          <Zap className="h-4 w-4 text-brain-coral" />
        </div>;
      case 'balanced':
        return <div className="h-6 w-6 rounded-full bg-brain-blue/20 flex items-center justify-center">
          <Star className="h-4 w-4 text-brain-blue" />
        </div>;
      case 'achievement':
        return <div className="h-6 w-6 rounded-full bg-amber-200 flex items-center justify-center">
          <Trophy className="h-4 w-4 text-amber-600" />
        </div>;
      case 'streak':
        return <div className="h-6 w-6 rounded-full bg-emerald-200 flex items-center justify-center">
          <Award className="h-4 w-4 text-emerald-600" />
        </div>;
      default:
        return <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center">
          <Star className="h-4 w-4 text-gray-600" />
        </div>;
    }
  };
  
  const completedChallenges = challenges.filter(c => c.completed).length;
  const totalChallenges = challenges.length;
  
  return (
    <AnimateOnScroll animation={fadeIn(100)} className="w-full">
      <Card className="border-brain-teal/20 transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-md font-medium flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-brain-teal animate-pulse-soft" />
            Daily Challenges
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            {completedChallenges}/{totalChallenges} completed
          </div>
        </CardHeader>
        <CardContent>
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
                    className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-300 ${
                      challenge.completed ? 'bg-muted/50' : ''
                    } ${activeChallenge === challenge.id ? 'shadow-md transform -translate-y-0.5' : ''}`}
                    onMouseEnter={() => setActiveChallenge(challenge.id)}
                    onMouseLeave={() => setActiveChallenge(null)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="transition-transform duration-300 transform-gpu">
                        {getChallengeIcon(challenge.challengeType)}
                      </div>
                      <div className={challenge.completed ? 'text-muted-foreground' : ''}>
                        {challenge.description}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`h-8 w-8 p-0 rounded-full ${pulseOnHover()}`}
                      onClick={() => handleToggleChallenge(challenge.id, challenge.completed)}
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
        </CardContent>
      </Card>
    </AnimateOnScroll>
  );
};

export default DailyChallenges;
