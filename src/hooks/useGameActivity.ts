
import { useState } from 'react';
import { useToast } from './use-toast';
import { useAuth } from './useAuth';

export const useGameActivity = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  
  const recordGameActivity = async (
    gameId: string, 
    score: number, 
    category: 'memory' | 'focus' | 'speed'
  ) => {
    if (!user) {
      toast({
        title: "Not logged in",
        description: "Please log in to save your progress",
        variant: "destructive"
      });
      return false;
    }
    
    setIsSubmitting(true);
    
    try {
      // In a real app with Supabase, we would do:
      // await supabase.from('game_activities').insert({
      //   user_id: user.id,
      //   game_id: gameId,
      //   score,
      //   category
      // });
      
      // For now, we'll simulate an API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      toast({
        title: "Progress saved!",
        description: `You scored ${score} points`,
      });
      
      return true;
    } catch (error) {
      console.error("Error recording game activity:", error);
      toast({
        title: "Failed to save progress",
        description: "Please try again later",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return {
    recordGameActivity,
    isSubmitting
  };
};
