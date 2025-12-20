
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { 
  Hourglass, 
  Sparkles,
  Zap,
  Brain,
  Puzzle,
  Info,
  Star
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useState } from 'react';
import AuthModal from '@/components/AuthModal';
import { useAuth } from '@/hooks/useAuth';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export interface Game {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  duration: string;
  progress: number;
  icon: 'memory' | 'speed' | 'focus' | 'puzzle';
  brainTarget?: string;
  cognitiveHealth?: string;
}

interface GameCardProps {
  game: Game;
  requireLogin?: boolean;
}

const GameCard = ({ game, requireLogin = false }: GameCardProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  const getGameIcon = () => {
    const iconClass = "h-5 w-5";
    switch (game.icon) {
      case 'memory':
        return <Brain className={`${iconClass} text-brain-yellow`} />;
      case 'puzzle':
        return <Puzzle className={`${iconClass} text-brain-blue`} />;
      case 'speed':
        return <Zap className={`${iconClass} text-brain-teal`} />;
      case 'focus':
        return <Sparkles className={`${iconClass} text-brain-coral`} />;
      default:
        return <Star className={`${iconClass} text-primary`} />;
    }
  };
  
  const getDifficultyBadge = () => {
    switch (game.difficulty) {
      case 'Easy':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'Medium':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'Hard':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };
  
  const getIconBgClass = () => {
    switch (game.icon) {
      case 'memory':
        return 'bg-brain-yellow/10 dark:bg-brain-yellow/20';
      case 'puzzle':
        return 'bg-brain-blue/10 dark:bg-brain-blue/20';
      case 'speed':
        return 'bg-brain-teal/10 dark:bg-brain-teal/20';
      case 'focus':
        return 'bg-brain-coral/10 dark:bg-brain-coral/20';
      default:
        return 'bg-primary/10 dark:bg-primary/20';
    }
  };
  
  const handleGameAction = () => {
    if (requireLogin && !user) {
      setShowAuthModal(true);
    } else {
      navigate(`/game/${game.id}`);
    }
  };
  
  const getBrainInfo = () => {
    const category = game.category.toLowerCase();
    const brainTarget = game.brainTarget || getBrainTarget(category);
    const cognitiveHealth = game.cognitiveHealth || getCognitiveHealth(category);
    const brainRegions = getBrainRegions(category);
    const neuroTransmitters = getNeuroTransmitters(category);
    const cognitiveSkills = getCognitiveSkills(category);
    
    return {
      brainTarget,
      cognitiveHealth,
      brainRegions,
      neuroTransmitters,
      cognitiveSkills
    };
  };
  
  const brainInfo = getBrainInfo();
  
  return (
    <div className="game-container group">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2.5 rounded-xl ${getIconBgClass()} transition-transform group-hover:scale-110`}>
          {getGameIcon()}
        </div>
        <div className={`text-xs font-medium px-2.5 py-1 rounded-full border ${getDifficultyBadge()}`}>
          {game.difficulty}
        </div>
      </div>
      
      <h3 className="text-lg font-semibold mb-2 text-foreground">{game.name}</h3>
      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{game.description}</p>
      
      <Accordion type="single" collapsible className="mb-4">
        <AccordionItem value="brain-details" className="border-none">
          <AccordionTrigger className="py-2 text-xs font-medium text-primary hover:no-underline hover:text-primary/80">
            <span className="flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5" />
              Brain Science Details
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="bg-muted/50 dark:bg-muted/30 p-4 rounded-xl text-xs space-y-3 border border-border/50">
              <div>
                <h4 className="font-medium text-primary mb-1">Brain Target</h4>
                <p className="text-muted-foreground">{brainInfo.brainTarget}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-primary mb-1">Brain Regions</h4>
                <p className="text-muted-foreground">{brainInfo.brainRegions}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-brain-teal mb-1">Neurotransmitters Involved</h4>
                <p className="text-muted-foreground">{brainInfo.neuroTransmitters}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-brain-coral mb-1">Cognitive Skills Enhanced</h4>
                <p className="text-muted-foreground">{brainInfo.cognitiveSkills}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-brain-blue mb-1">Health Benefits</h4>
                <p className="text-muted-foreground">{brainInfo.cognitiveHealth}</p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
        <span className="px-2 py-1 rounded-md bg-muted/50">{game.category}</span>
        <span className="flex items-center gap-1.5">
          <Hourglass className="h-3.5 w-3.5" /> {game.duration}
        </span>
      </div>
      
      {game.progress > 0 && (
        <div className="mb-4">
          <div className="flex justify-between items-center text-xs mb-2">
            <span className="font-medium text-foreground">Progress</span>
            <span className="text-muted-foreground">{game.progress}%</span>
          </div>
          <Progress value={game.progress} className="h-1.5" />
        </div>
      )}
      
      <Button 
        className="w-full rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground shadow-md hover:shadow-lg transition-all"
        onClick={handleGameAction}
      >
        {requireLogin && !user ? "Sign In to Play" : game.progress > 0 ? "Continue" : "Start"} Game
      </Button>
      
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
};

// Helper functions
const getBrainTarget = (category: string) => {
  switch (category.toLowerCase()) {
    case 'memory':
      return 'Hippocampus & Temporal Lobe';
    case 'focus':
      return 'Prefrontal Cortex & Anterior Cingulate';
    case 'speed':
      return 'Frontal Lobe & Motor Cortex';
    case 'logic':
    case 'puzzle':
      return 'Prefrontal Cortex & Parietal Lobe';
    case 'creative':
      return 'Default Mode Network & Right Hemisphere';
    default:
      return 'Multiple Brain Regions';
  }
};

const getBrainRegions = (category: string) => {
  switch (category.toLowerCase()) {
    case 'memory':
      return 'The hippocampus is critical for forming new memories and spatial navigation. The temporal lobe processes sensory input to form long-term memories, while the prefrontal cortex helps with working memory manipulation.';
    case 'focus':
      return 'The anterior cingulate cortex monitors errors and resolves conflicts, while the prefrontal cortex maintains attention and filters distractions. The reticular activating system regulates arousal and attention.';
    case 'speed':
      return 'The motor cortex controls movement execution, the basal ganglia enhance speed and efficiency, and the cerebellum coordinates precise timing. White matter connections allow for rapid information transmission.';
    case 'logic':
    case 'puzzle':
      return 'The dorsolateral prefrontal cortex performs complex reasoning and problem-solving. The parietal lobes integrate spatial information and mathematical processing, while Broca\'s area assists in logical language formulation.';
    case 'creative':
      return 'The default mode network activates during daydreaming and divergent thinking. The right hemisphere excels at holistic, creative associations. The precuneus helps with perspective-taking and imagination.';
    default:
      return 'Multiple brain networks including the executive control network, salience network, and default mode network that coordinate cognitive functions across regions.';
  }
};

const getNeuroTransmitters = (category: string) => {
  switch (category.toLowerCase()) {
    case 'memory':
      return 'Acetylcholine is essential for memory formation and learning. Glutamate strengthens neural connections through long-term potentiation. Norepinephrine enhances attention to memory-relevant details.';
    case 'focus':
      return 'Dopamine regulates attention and motivation. Norepinephrine increases alertness and attentional focus. Low GABA levels help maintain a vigilant state of concentration.';
    case 'speed':
      return 'Dopamine optimizes the speed and efficiency of neural processing. Glutamate enables quick signal transmission between neurons. Acetylcholine facilitates rapid muscle response.';
    case 'logic':
    case 'puzzle':
      return 'Glutamate facilitates logical processing and rapid thinking. GABA modulates neural activity for clear reasoning. Dopamine rewards successful problem-solving, reinforcing effective strategies.';
    case 'creative':
      return 'Lower dopamine filtering allows more ideas to emerge. GABA reduction enables more associations between concepts. Increased serotonin promotes open thinking and cognitive flexibility.';
    default:
      return 'A balanced interaction of multiple neurotransmitters including dopamine, serotonin, acetylcholine, glutamate, and GABA that coordinate different aspects of cognition.';
  }
};

const getCognitiveSkills = (category: string) => {
  switch (category.toLowerCase()) {
    case 'memory':
      return 'Encoding new information, consolidating short-term to long-term memory, visual-spatial memory, working memory capacity, pattern recognition, and associative learning.';
    case 'focus':
      return 'Sustained attention, selective attention, divided attention, cognitive inhibition, task switching, mental endurance, and resistance to distraction.';
    case 'speed':
      return 'Information processing speed, reaction time, decision-making efficiency, psychomotor speed, attention shifting, and cognitive throughput capacity.';
    case 'logic':
    case 'puzzle':
      return 'Deductive reasoning, inductive reasoning, spatial reasoning, pattern recognition, sequencing ability, hypothesis testing, and abstract thinking.';
    case 'creative':
      return 'Divergent thinking, cognitive flexibility, remote association ability, abstract thinking, perspective-taking, and insight generation.';
    default:
      return 'A comprehensive range of skills including attention, memory, executive function, processing speed, and cognitive flexibility that support overall cognitive health.';
  }
};

const getCognitiveHealth = (category: string) => {
  switch (category.toLowerCase()) {
    case 'memory':
      return 'Regular memory training has been shown to increase hippocampal volume and create stronger neural connections. This may delay age-related memory decline and improve both short and long-term recall abilities.';
    case 'focus':
      return 'Enhancing attentional control can improve performance in daily tasks, reduce stress from information overload, and strengthen neural pathways related to concentration. This may help prevent attention-related cognitive decline.';
    case 'speed':
      return 'Processing speed training can lead to more efficient neural transmission through improved myelination. Faster cognitive processing has widespread benefits for learning, decision-making, and overall cognitive performance.';
    case 'logic':
    case 'puzzle':
      return 'Logical reasoning training strengthens neural connections in the prefrontal cortex, potentially improving executive function, decision-making, and problem-solving skills that transfer to real-world challenges.';
    case 'creative':
      return 'Creative thinking exercises strengthen connections between typically unconnected brain regions, promoting cognitive flexibility and innovative thinking. This builds cognitive reserve and adaptability.';
    default:
      return 'Comprehensive cognitive training creates a stronger neural scaffold (cognitive reserve) that can help maintain function despite age-related changes or minor brain injuries.';
  }
};

export default GameCard;
