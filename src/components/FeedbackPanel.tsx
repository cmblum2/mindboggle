
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface FeedbackPanelProps {
  score: number;
  gameType: string;
  onClose: () => void;
}

// Mock AI feedback generator - in real app, this would call an OpenAI API
const generateFeedback = (score: number, gameType: string): Promise<string> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simple feedback generation based on score and game type
      let feedback = '';
      
      if (score > 50) {
        feedback = `Excellent work on the ${gameType.toLowerCase()} game! Your score of ${score} shows strong cognitive abilities in this area. Keep practicing to maintain these skills. You might try increasing the difficulty next time for more challenge.`;
      } else if (score > 30) {
        feedback = `Good job on the ${gameType.toLowerCase()} game! Your score of ${score} shows solid progress. To improve further, try playing this game regularly and gradually increase your speed.`;
      } else {
        feedback = `Nice effort on the ${gameType.toLowerCase()} game! Your score of ${score} gives us a baseline. Based on the Bredesen protocol, regular practice of these activities can help strengthen these cognitive pathways. Try playing again soon to build improvement.`;
      }
      
      // Add personalized tips based on game type
      if (gameType.toLowerCase().includes('memory')) {
        feedback += ' Try incorporating omega-3 rich foods in your diet to support memory function.';
      } else if (gameType.toLowerCase().includes('speed')) {
        feedback += ' Regular cardiovascular exercise has been shown to improve processing speed.';
      } else if (gameType.toLowerCase().includes('focus')) {
        feedback += ' Consider mindfulness meditation to further enhance your attention abilities.';
      }
      
      resolve(feedback);
    }, 2000); // Simulate API delay
  });
};

const FeedbackPanel = ({ score, gameType, onClose }: FeedbackPanelProps) => {
  const [feedback, setFeedback] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  
  useEffect(() => {
    const getFeedback = async () => {
      try {
        const generatedFeedback = await generateFeedback(score, gameType);
        setFeedback(generatedFeedback);
      } catch (error) {
        console.error('Error generating feedback:', error);
        setFeedback('Unable to generate personalized feedback at this time.');
      } finally {
        setLoading(false);
      }
    };
    
    getFeedback();
  }, [score, gameType]);
  
  return (
    <Card className="border-brain-teal/20">
      <CardHeader className="bg-gradient-to-r from-brain-purple/10 to-brain-teal/10">
        <CardTitle className="text-xl">Your Personalized AI Feedback</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="w-full h-4" />
            <Skeleton className="w-full h-4" />
            <Skeleton className="w-full h-4" />
            <Skeleton className="w-[80%] h-4" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Game Type</div>
              <div className="font-medium">{gameType}</div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Your Score</div>
              <div className="font-medium">{score} points</div>
            </div>
            
            <div className="border-t pt-4">
              <div className="text-sm text-muted-foreground mb-2">AI Analysis</div>
              <p className="leading-relaxed">{feedback}</p>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full bg-gradient-to-r from-brain-purple to-brain-teal hover:opacity-90 text-white"
          onClick={onClose}
        >
          Continue
        </Button>
      </CardFooter>
    </Card>
  );
};

export default FeedbackPanel;
