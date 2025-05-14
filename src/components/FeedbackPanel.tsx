
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';

interface FeedbackPanelProps {
  score: number;
  gameType: string;
  onClose: () => void;
}

// Enhanced AI feedback generator with more varied tips
const generateFeedback = (score: number, gameType: string): Promise<{
  generalFeedback: string;
  brainInsight: string;
  motivationalTip: string;
  involvedAreas?: string[];
}> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const gameTypeLower = gameType.toLowerCase();
      let generalFeedback = '';
      let brainInsight = '';
      let motivationalTip = '';
      let involvedAreas: string[] = [];
      
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
        involvedAreas = ['hippocampus', 'temporal lobe', 'prefrontal cortex'];
        
        // Create array of varied memory-specific tips
        const memoryTips = [
          `Try incorporating omega-3 rich foods like fatty fish, walnuts and flaxseeds in your diet to support memory function. Studies show that these essential fatty acids are critical for maintaining the integrity of brain cell membranes. For best results, practice memory exercises for 10-15 minutes daily right before bedtime when memory consolidation is most effective.`,
          `Consider using the "method of loci" technique, where you associate items to remember with specific locations in a familiar place. This spatial memory hack has been used by memory champions for centuries and engages multiple brain regions simultaneously. Combine this with regular aerobic exercise, which has been shown to increase BDNF, a protein that supports memory formation.`,
          `Research indicates that learning a musical instrument can significantly boost memory function by creating new neural pathways. Even just 30 minutes of instrument practice 3 times weekly can yield measurable improvements. Also, try alternating between different types of memory exercises (visual, verbal, numerical) to develop a more comprehensive memory framework.`,
          `Sleep plays a crucial role in memory consolidation. Aim for 7-9 hours of quality sleep, particularly focusing on increasing deep sleep phases where memories are processed. During the day, try the "spaced repetition" technique - reviewing information at increasing intervals - which research shows can dramatically improve retention rates compared to cramming.`,
          `Challenge yourself with dual-task memory exercises where you recall information while performing another cognitive task. This builds cognitive flexibility and strengthens connections between brain regions. Also consider adding rosemary essential oil to your environment, as studies have linked its aroma to improved memory performance.`
        ];
        
        // Select a random tip based on the current time to ensure variety
        const tipIndex = Math.floor(Date.now() % memoryTips.length);
        motivationalTip = memoryTips[tipIndex];
      } else if (gameTypeLower.includes('focus')) {
        brainInsight = `This game targets your prefrontal cortex – the brain's command center for attention, executive function, and working memory. When you engage in focused activities, you're strengthening the neural networks that filter distractions and maintain attention on relevant information. The prefrontal cortex works in conjunction with the anterior cingulate cortex to monitor conflicts between competing stimuli and resolve them. By training these areas, you're enhancing your brain's ability to sustain attention and resist distraction – skills that transfer to many daily activities.`;
        involvedAreas = ['prefrontal cortex', 'anterior cingulate cortex', 'parietal lobe'];
        
        // Create array of varied focus-specific tips
        const focusTips = [
          `Consider practicing mindfulness meditation, which has been shown to physically alter the structure and function of the prefrontal cortex over time. Even 5 minutes daily can yield measurable improvements in attention control. For maximum focus benefits, try the "52/17 rule" - 52 minutes of focused work followed by a 17-minute break - which research has shown optimizes sustained attention.`,
          `Limit digital distractions by using the "20-20-20 rule" when using screens: every 20 minutes, look at something 20 feet away for at least 20 seconds. This reduces eye strain and mental fatigue. Additionally, incorporate foods rich in antioxidants like blueberries and dark chocolate, which studies show can enhance blood flow to brain regions involved in focus.`,
          `Try "attention chunking" - breaking focus sessions into smaller, more manageable periods (starting with just 10 minutes) and gradually extending them as your focus muscles strengthen. Combining this with breathing exercises where you inhale for 4 counts and exhale for 6 can activate your parasympathetic nervous system, creating an optimal state for sustained attention.`,
          `Research shows that ambient noise at around 70 decibels (like coffee shop chatter) can actually improve creative focus compared to complete silence. Experiment with background noise apps that mimic this environment. Also consider "contrast showers" - alternating between hot and cold water - which has been shown to increase alertness and focus by stimulating your nervous system.`,
          `The "Pomodoro Technique" can be modified for your specific focus needs - try experimenting with different intervals to find your optimal focus duration. Also, studies show that chewing gum can increase blood flow to the brain by up to 40%, potentially enhancing focus and attention. For best results, choose sugar-free varieties with mint flavors.`
        ];
        
        // Select a random tip based on the score to ensure variety
        const tipIndex = Math.floor((score * Date.now()) % focusTips.length);
        motivationalTip = focusTips[tipIndex];
      } else if (gameTypeLower.includes('speed')) {
        brainInsight = `This game engages your brain's white matter pathways, particularly those involving the thalamus, basal ganglia, and motor cortex. Processing speed depends on efficient neural transmission, which relies on healthy myelin sheaths – the protective coating around nerve fibers that speeds up electrical impulses. By repeatedly practicing quick-response tasks, you're optimizing these pathways and potentially enhancing myelination. Improved processing speed has widespread benefits, from faster decision-making to more efficient learning and information retrieval.`;
        involvedAreas = ['thalamus', 'basal ganglia', 'motor cortex', 'white matter tracts'];
        
        // Create array of varied speed-specific tips
        const speedTips = [
          `Regular cardiovascular exercise has been shown to improve processing speed by increasing blood flow to the brain. Try incorporating interval training into your fitness routine – alternating between high and moderate intensity for just 20 minutes, 3 times weekly can produce significant cognitive improvements within 4 weeks.`,
          `Research indicates that certain video games requiring quick reactions can improve processing speed in everyday tasks. Dedicate 15-20 minutes to action games that require rapid decision-making. Additionally, ensure adequate hydration - even mild dehydration can slow neural transmission by up to 30%.`,
          `Try "dual n-back" training games that require you to remember sequences while simultaneously processing new information. This challenging exercise has been shown to improve both working memory and processing speed. Pair this with foods rich in vitamin E like nuts and seeds, which research suggests can protect the myelin sheaths critical for fast neural transmission.`,
          `Visual tracking exercises, where you follow objects moving at increasing speeds, can significantly enhance processing speed. Practice by following a moving object with your eyes for 5 minutes daily, gradually increasing the speed. Also consider supplementing with Vitamin B12, which plays a crucial role in maintaining myelin integrity and neural efficiency.`,
          `Challenge yourself with cross-body coordination exercises like alternately touching your right hand to your left knee and vice versa at increasing speeds. This strengthens connections between brain hemispheres and improves processing efficiency. Also, research shows that learning to touch type can enhance overall processing speed by reducing cognitive load during information input tasks.`
        ];
        
        // Select a varied tip using multiple factors
        const tipIndex = Math.floor(((score + gameTypeLower.length) * new Date().getMinutes()) % speedTips.length);
        motivationalTip = speedTips[tipIndex];
      } else if (gameTypeLower.includes('balanced') || gameTypeLower.includes('mixed') || gameTypeLower.includes('daily')) {
        brainInsight = `Today's balanced training exercise activated multiple cognitive systems simultaneously. Your prefrontal cortex coordinated the shifting between different cognitive tasks, while your hippocampus handled memory components and your cerebellum coordinated timing and precision. This type of comprehensive training is particularly valuable because it creates connections between different brain regions, promoting what neuroscientists call "cognitive integration." Research shows that activities engaging multiple cognitive domains simultaneously can be more effective at building cognitive reserve than single-domain exercises.`;
        involvedAreas = ['prefrontal cortex', 'hippocampus', 'cerebellum', 'parietal lobe', 'basal ganglia', 'temporal lobe'];
        
        // Create array of varied balanced-specific tips
        const balancedTips = [
          `For balanced cognitive development, consider the "cognitive rotation" approach where you deliberately engage in activities that target different brain functions throughout your week. This comprehensive strategy ensures more uniform development across all cognitive domains and creates stronger connections between brain regions.`,
          `The Japanese concept of "shikaku" – engaging in diverse mental challenges daily – has been linked to maintaining cognitive health into very old age. Try incorporating novel activities that combine memory, focus, and speed skills like learning new dance steps, speaking a foreign language while cooking, or playing strategy games with time constraints.`,
          `Research from the ACTIVE study shows that cognitive training benefits can last up to 10 years with proper reinforcement. To maximize benefits, try "cross-training" your brain by switching between memory, focus, and speed exercises within a single session, which promotes stronger interconnections between neural networks.`,
          `Neuroscientists have found that "neuroplasticity" – your brain's ability to reorganize itself – is enhanced when you engage in activities that are novel, challenging, and meaningful. Look for ways to increase the challenge level of everyday activities by adding time constraints, memory components, or focus challenges to routine tasks.`,
          `The "cognitive enrichment hypothesis" suggests that engaging in a variety of mentally stimulating activities throughout life builds cognitive reserve, providing resilience against age-related cognitive decline. Maximize this effect by combining physical exercise with cognitive challenges – try solving mental math problems while walking or reciting memorized information while doing balance exercises.`
        ];
        
        // Select a varied balanced tip
        const today = new Date();
        const dailySeed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
        const tipIndex = dailySeed % balancedTips.length;
        motivationalTip = balancedTips[tipIndex];
      } else {
        brainInsight = `This cognitive activity engages multiple brain regions, creating a comprehensive workout for your neural networks. By regularly challenging yourself with diverse cognitive tasks, you're building what neuroscientists call 'cognitive reserve' – extra neural capacity that provides resilience against age-related decline or brain injury. Each new skill you develop creates fresh neural pathways, while practice strengthens existing ones.`;
        involvedAreas = ['multiple brain regions'];
        
        // Create array of varied general cognitive tips
        const generalTips = [
          `The brain follows the 'use it or lose it' principle. Try incorporating novelty into your daily routine - take a different route home, use your non-dominant hand for simple tasks, or learn 2-3 new words daily. These small changes create new neural connections and build cognitive flexibility.`,
          `Research from the FINGER study shows that combining cognitive training with social engagement yields greater benefits than either alone. Try joining a book club, language exchange, or group puzzle-solving activities to maximize your cognitive gains while building social connections.`,
          `Consider the "cognitive rotation" approach - alternating between different types of mental challenges throughout the week (memory on Monday, speed on Tuesday, etc.). This comprehensive approach ensures development across all cognitive domains rather than specializing in just one area.`,
          `The "spacing effect" demonstrates that distributing learning over time is more effective than concentrated practice. Try shorter, more frequent cognitive training sessions (10-15 minutes daily) rather than longer, less frequent ones for optimal neural growth and maintenance.`,
          `Consider trying neurobics - exercises that engage all your senses in novel ways. For example, try showering with your eyes closed, identifying spices by smell alone, or having conversations without using specific common words. These unusual challenges create new neural pathways and strengthen overall cognitive flexibility.`
        ];
        
        // Select a varied general tip
        const tipIndex = Math.floor(Math.random() * generalTips.length);
        motivationalTip = generalTips[tipIndex];
      }
      
      resolve({ 
        generalFeedback, 
        brainInsight, 
        motivationalTip,
        involvedAreas
      });
    }, 2000); // Simulate API delay
  });
};

const FeedbackPanel = ({ score, gameType, onClose }: FeedbackPanelProps) => {
  const [feedback, setFeedback] = useState<{
    generalFeedback: string;
    brainInsight: string;
    motivationalTip: string;
    involvedAreas?: string[];
  } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();
  
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
        toast({
          title: "Feedback error",
          description: "Could not generate personalized feedback",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    getFeedback();
  }, [score, gameType, toast]);
  
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
            
            {feedback?.involvedAreas && feedback.involvedAreas.length > 0 && 
              (gameType.toLowerCase().includes('balanced') || 
               gameType.toLowerCase().includes('mixed') || 
               gameType.toLowerCase().includes('daily')) && (
              <div className="border-t pt-4">
                <div className="text-sm font-medium text-brain-purple mb-2">Brain Areas Involved</div>
                <div className="flex flex-wrap gap-2">
                  {feedback.involvedAreas.map((area, index) => (
                    <span 
                      key={index}
                      className={`text-xs px-2 py-1 rounded-full ${
                        index % 3 === 0 ? 'bg-brain-purple/10 text-brain-purple' : 
                        index % 3 === 1 ? 'bg-brain-teal/10 text-brain-teal' : 
                        'bg-brain-coral/10 text-brain-coral'
                      }`}
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
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
