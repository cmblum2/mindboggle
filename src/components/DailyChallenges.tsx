
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
  const [todayDateKey, setTodayDateKey] = useState<string>(new Date().toLocaleDateString());
  const previousCompletedCountRef = useRef<number>(0);
  const challengesFetched = useRef<boolean>(false);
  const notificationDebounceRef = useRef<number | null>(null);
  
  // Load challenges only once on mount or when date changes
  useEffect(() => {
    // Check if today's date is different from what we have stored
    const today = new Date().toLocaleDateString();
    const isNewDay = today !== todayDateKey;
    
    // Only load challenges if:
    // 1. We haven't fetched them yet OR
    // 2. It's a new day
    if (!challengesFetched.current || isNewDay) {
      const loadChallenges = async () => {
        try {
          setIsLoading(true);
          
          // Force refresh if it's a new day
          const dailyChallenges = await getDailyChallenges(userId, isNewDay);
          
          // Update date key if it's a new day
          if (isNewDay) {
            setTodayDateKey(today);
          }
          
          // Count completed challenges
          const completedCount = dailyChallenges.filter(c => c.completed).length;
          
          // Store the completed count for reference
          previousCompletedCountRef.current = completedCount;
          
          // Update challenges
          setChallenges(dailyChallenges);
          
          // Mark that we've fetched challenges
          challengesFetched.current = true;
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
    }
  }, [userId, todayDateKey]);
  
  // Check for day change and completed challenges periodically
  useEffect(() => {
    // Handler for document visibility changes (tab focus)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Check if it's a new day
        const today = new Date().toLocaleDateString();
        if (today !== todayDateKey) {
          // Reset the fetched flag to trigger a reload on new day
          challengesFetched.current = false;
          setTodayDateKey(today);
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Periodically check for challenge completion, but not too frequently (once per minute)
    const completionCheckInterval = setInterval(() => {
      // Only check if:
      // 1. Document is visible
      // 2. We're not loading
      // 3. We have challenges loaded
      if (document.visibilityState === 'visible' && !isLoading && challenges.length > 0) {
        checkForCompletedChallenges();
      }
    }, 60000); // Check once per minute
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(completionCheckInterval);
      
      // Clear any pending debounced notifications
      if (notificationDebounceRef.current) {
        clearTimeout(notificationDebounceRef.current);
      }
    };
  }, [challenges, isLoading, todayDateKey, userId]);
  
  // Function to check for completed challenges
  const checkForCompletedChallenges = async () => {
    try {
      // Get updated challenges without forcing refresh
      const updatedChallenges = await getDailyChallenges(userId, false);
      
      // Count newly completed challenges
      const newCompletedCount = updatedChallenges.filter(c => c.completed).length;
      
      // Only update and notify if completion status changed
      if (newCompletedCount > previousCompletedCountRef.current) {
        // Update state with new challenges
        setChallenges(updatedChallenges);
        // Update reference count
        previousCompletedCountRef.current = newCompletedCount;
        
        // Debounce notification to prevent multiple rapid notifications
        if (notificationDebounceRef.current) {
          clearTimeout(notificationDebounceRef.current);
        }
        
        notificationDebounceRef.current = window.setTimeout(() => {
          onChallengeComplete();
          notificationDebounceRef.current = null;
        }, 2000);
      }
    } catch (error) {
      console.error('Error checking challenge completion:', error);
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
      case 'mixed':
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
                  key={`${challenge.id}`}
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
