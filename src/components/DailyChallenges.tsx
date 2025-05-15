
import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays, BrainCircuit, Lightbulb, Zap, Trophy, Award, Star, Check } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from "sonner";
import { DailyChallenge, getDailyChallenges } from '@/lib/dashboard';
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
  const [lastRefreshDate, setLastRefreshDate] = useState<string>('');
  const [previousCompletedCount, setPreviousCompletedCount] = useState<number>(0);
  const isFirstLoad = useRef(true);
  const refreshTimeoutRef = useRef<number | null>(null);
  
  // Function to check if challenges need to reset (it's a new day)
  const shouldRefreshChallenges = () => {
    const today = new Date().toLocaleDateString();
    if (lastRefreshDate !== today) {
      setLastRefreshDate(today);
      return true;
    }
    return false;
  };
  
  // Debounced function to prevent multiple rapid challenge complete notifications
  const notifyChallengeComplete = () => {
    // Clear any existing timeout
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
    
    // Set a new timeout
    refreshTimeoutRef.current = window.setTimeout(() => {
      onChallengeComplete();
      refreshTimeoutRef.current = null;
    }, 1000); // 1 second debounce
  };
  
  useEffect(() => {
    const loadChallenges = async () => {
      try {
        setIsLoading(true);
        
        // Force refresh if it's a new day
        const forceRefresh = shouldRefreshChallenges();
        const dailyChallenges = await getDailyChallenges(userId, forceRefresh);
        
        // Store today's date after successful refresh
        setLastRefreshDate(new Date().toLocaleDateString());
        
        // Count completed challenges
        const completedCount = dailyChallenges.filter(c => c.completed).length;
        
        // Check if any new challenges were completed (but only after first load)
        if (!isFirstLoad.current && completedCount > previousCompletedCount) {
          notifyChallengeComplete();
        }
        
        // Update states
        setChallenges(dailyChallenges);
        setPreviousCompletedCount(completedCount);
        
        // After first successful load, set firstLoad to false
        isFirstLoad.current = false;
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
    
    // Check for day change when component mounts or regains focus
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && shouldRefreshChallenges()) {
        loadChallenges();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Set up periodic refresh every minute to check for auto-completed challenges
    const intervalId = setInterval(() => {
      loadChallenges();
    }, 300000); // 5 minutes
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(intervalId);
      
      // Clear any pending timeouts on unmount
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [userId, onChallengeComplete]);
  
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
                      challenge.completed ? 'bg-muted/50 border-green-300' : ''
                    } ${activeChallenge === challenge.id ? 'shadow-md transform -translate-y-0.5' : ''}`}
                    onMouseEnter={() => setActiveChallenge(challenge.id)}
                    onMouseLeave={() => setActiveChallenge(null)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="transition-transform duration-300 transform-gpu">
                        {getChallengeIcon(challenge.challengeType)}
                      </div>
                      <div className={`${challenge.completed ? 'text-muted-foreground line-through' : ''}`}>
                        {challenge.description}
                      </div>
                    </div>
                    <div className="flex items-center">
                      {challenge.completed && (
                        <div className="animate-fade-in text-xs text-green-600 font-medium mr-2 flex items-center gap-1">
                          <Check className="h-3 w-3" /> Completed
                        </div>
                      )}
                      <div className={`h-5 w-5 flex items-center justify-center rounded-full ${
                        challenge.completed ? 'bg-green-500 text-white' : 'bg-gray-200'
                      }`}>
                        {challenge.completed && <Check className="h-3 w-3" />}
                      </div>
                    </div>
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
