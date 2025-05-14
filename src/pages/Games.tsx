
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '@/components/NavBar';
import GameCard, { Game } from '@/components/GameCard';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface GamesProps {
  navBarExtension?: React.ReactNode;
}

const Games = ({ navBarExtension }: GamesProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Load games data regardless of login status
    const loadMockGames = () => {
      // Simulate API delay
      setTimeout(() => {
        setGames([
          {
            id: 'memory-match',
            name: 'Memory Match',
            description: 'Test your memory by matching pairs of cards',
            category: 'Memory',
            difficulty: 'Easy',
            duration: '5 min',
            progress: user ? 75 : 0,
            icon: 'memory',
            brainTarget: 'Hippocampus & Temporal Lobe',
            cognitiveHealth: 'Improves memory formation and recall, potentially slowing age-related memory decline. Strengthens neural connections for better information retention.'
          },
          {
            id: 'number-sequence',
            name: 'Number Sequence',
            description: 'Remember and repeat sequences of numbers',
            category: 'Focus',
            difficulty: 'Medium',
            duration: '3 min',
            progress: user ? 30 : 0,
            icon: 'focus',
            brainTarget: 'Prefrontal Cortex',
            cognitiveHealth: 'Increases attention span and ability to filter distractions. Builds mental stamina and improves executive functions like decision-making.'
          },
          {
            id: 'word-recall',
            name: 'Word Recall',
            description: 'Memorize and recall a list of words',
            category: 'Memory',
            difficulty: 'Medium',
            duration: '4 min',
            progress: user ? 0 : 0,
            icon: 'memory',
            brainTarget: 'Hippocampus & Temporal Lobe',
            cognitiveHealth: 'Strengthens verbal memory and language processing. May help maintain cognitive function in aging adults.'
          },
          {
            id: 'reaction-test',
            name: 'Reaction Test',
            description: 'Test your reaction time and processing speed',
            category: 'Speed',
            difficulty: 'Easy',
            duration: '2 min',
            progress: user ? 0 : 0,
            icon: 'speed',
            brainTarget: 'Frontal Lobe & Motor Cortex',
            cognitiveHealth: 'Enhances processing speed and reaction time. Improves cognitive efficiency and may help maintain neural pathways.'
          },
          {
            id: 'pattern-recognition',
            name: 'Pattern Recognition',
            description: 'Identify patterns and complete sequences',
            category: 'Focus',
            difficulty: 'Hard',
            duration: '6 min',
            progress: user ? 50 : 0,
            icon: 'focus',
            brainTarget: 'Prefrontal Cortex & Parietal Lobe',
            cognitiveHealth: 'Develops pattern recognition and logical thinking skills. Enhances visual-spatial processing and working memory.'
          },
          {
            id: 'mental-math',
            name: 'Mental Math',
            description: 'Solve math problems quickly in your head',
            category: 'Speed',
            difficulty: 'Medium',
            duration: '5 min',
            progress: user ? 0 : 0,
            icon: 'speed',
            brainTarget: 'Frontal Lobe & Parietal Lobe',
            cognitiveHealth: 'Strengthens numerical processing and calculation abilities. Improves working memory and concentration.'
          }
        ]);
        setLoading(false);
      }, 800);
    };
    
    loadMockGames();
  }, [user]);
  
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar 
        isLoggedIn={!!user}
        onLogout={logout}
        onLogin={() => navigate('/')}
        extension={navBarExtension}
      />
      
      <main className="flex-1 container px-4 py-6 md:py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-1">Brain Games</h1>
          <p className="text-muted-foreground">Exercise different cognitive areas with these fun games</p>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-muted h-64 rounded-2xl"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((game) => (
              <GameCard 
                key={game.id} 
                game={game} 
                requireLogin={!user} 
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Games;
