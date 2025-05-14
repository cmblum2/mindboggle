
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface FeedbackPanelProps {
  score: number;
  gameType: string;
  onClose: () => void;
}

// Enhanced AI feedback generator
const generateFeedback = (score: number, gameType: string): Promise<{
  generalFeedback: string;
  brainInsight: string;
  motivationalTip: string;
}> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const gameTypeLower = gameType.toLowerCase();
      let generalFeedback = '';
      let brainInsight = '';
      let motivationalTip = '';
      
      // Generate score-based general feedback
      if (score > 50) {
        generalFeedback = `Excellent work on the ${gameTypeLower} game! Your score of ${score} shows strong cognitive abilities in this area. Keep practicing to maintain these neural pathways.`;
      } else if (score > 30) {
        generalFeedback = `Good job on the ${gameTypeLower} game! Your score of ${score} shows solid progress. Regular practice will strengthen these neural connections over time.`;
      } else {
        generalFeedback = `Nice effort on the ${gameTypeLower} game! Your score of ${score} gives us a baseline. Based on the Bredesen protocol, consistent engagement with these activities can help strengthen these cognitive pathways.`;
      }
      
      // Generate insights based on game type - much more detailed brain information
      if (gameTypeLower.includes('memory')) {
        brainInsight = `This game primarily engages your hippocampus and temporal lobe, critical structures for memory formation and retrieval. The hippocampus acts as a sorter, determining which memories to store long-term and which to discard. When you exercise these areas through memory games, you're creating and reinforcing neural pathways that help with both short-term recall and long-term memory consolidation. Research suggests that regular memory training can increase hippocampal volume and improve connectivity between brain regions involved in memory processing.`;
        motivationalTip = `Try incorporating omega-3 rich foods like fatty fish, walnuts and flaxseeds in your diet to support memory function. Studies show that these essential fatty acids are critical for maintaining the integrity of brain cell membranes and facilitating neural communication. Consider setting aside 10 minutes each day for a memory exercise – consistency is more important than duration when it comes to cognitive training.`;
      } else if (gameTypeLower.includes('focus')) {
        brainInsight = `This game targets your prefrontal cortex – the brain's command center for attention, executive function, and working memory. When you engage in focused activities, you're strengthening the neural networks that filter distractions and maintain attention on relevant information. The prefrontal cortex works in conjunction with the anterior cingulate cortex to monitor conflicts between competing stimuli and resolve them. By training these areas, you're enhancing your brain's ability to sustain attention and resist distraction – skills that transfer to many daily activities.`;
        motivationalTip = `Consider practicing mindfulness meditation, which has been shown to physically alter the structure and function of the prefrontal cortex over time. Even 5 minutes daily can yield measurable improvements in attention control. When working on focused tasks, try the Pomodoro technique – 25 minutes of focused work followed by a 5-minute break – to optimize your brain's natural attention cycles and prevent cognitive fatigue.`;
      } else if (gameTypeLower.includes('speed')) {
        brainInsight = `This game engages your brain's white matter pathways, particularly those involving the thalamus, basal ganglia, and motor cortex. Processing speed depends on efficient neural transmission, which relies on healthy myelin sheaths – the protective coating around nerve fibers that speeds up electrical impulses. By repeatedly practicing quick-response tasks, you're optimizing these pathways and potentially enhancing myelination. Improved processing speed has widespread benefits, from faster decision-making to more efficient learning and information retrieval.`;
        motivationalTip = `Regular cardiovascular exercise has been shown to improve processing speed by increasing blood flow to the brain and promoting the release of BDNF (Brain-Derived Neurotrophic Factor), which supports the growth and maintenance of neural connections. Try incorporating interval training into your fitness routine – alternating between high and moderate intensity – to maximize these cognitive benefits. Additionally, ensure adequate sleep, as even minor sleep deprivation can significantly impact processing speed and reaction time.`;
      } else {
        brainInsight = `This cognitive activity engages multiple brain regions, creating a comprehensive workout for your neural networks. By regularly challenging yourself with diverse cognitive tasks, you're building what neuroscientists call 'cognitive reserve' – extra neural capacity that provides resilience against age-related decline or brain injury. Each new skill you develop creates fresh neural pathways, while practice strengthens existing ones.`;
        motivationalTip = `The brain follows the 'use it or lose it' principle. Regular cognitive challenges across different domains (memory, attention, speed, problem-solving) provide the most comprehensive brain training. Try to incorporate novelty into your routine – learning new skills or solving unfamiliar problems creates the most robust neural growth. Remember that cognitive improvement is gradual; consistent practice over time yields the most significant results.`;
      }
      
      resolve({ 
        generalFeedback, 
        brainInsight, 
        motivationalTip 
      });
    }, 2000); // Simulate API delay
  });
};

const FeedbackPanel = ({ score, gameType, onClose }: FeedbackPanelProps) => {
  const [feedback, setFeedback] = useState<{
    generalFeedback: string;
    brainInsight: string;
    motivationalTip: string;
  } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  useEffect(() => {
    const getFeedback = async () => {
      try {
        const generatedFeedback = await generateFeedback(score, gameType);
        setFeedback(generatedFeedback);
      } catch (error) {
        console.error('Error generating feedback:', error);
        setFeedback({
          generalFeedback: 'Unable to generate personalized feedback at this time.',
          brainInsight: '',
          motivationalTip: ''
        });
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
            <Skeleton className="w-full h-20 mt-4" />
            <Skeleton className="w-full h-16 mt-4" />
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
              <div className="text-sm text-muted-foreground mb-2">Performance Assessment</div>
              <p className="leading-relaxed mb-4">{feedback?.generalFeedback}</p>
              
              <div className="text-sm font-medium text-brain-purple mb-2">Brain Science Insight</div>
              <p className="leading-relaxed mb-4 text-sm bg-brain-purple/5 p-3 rounded-md">
                {feedback?.brainInsight}
              </p>
              
              <div className="text-sm font-medium text-brain-teal mb-2">Personalized Improvement Tip</div>
              <p className="leading-relaxed text-sm bg-brain-teal/5 p-3 rounded-md">
                {feedback?.motivationalTip}
              </p>
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
