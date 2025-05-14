import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gamepad2, Search } from 'lucide-react';
import NavBar from '@/components/NavBar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface GamesProps {
  navBarExtension?: React.ReactNode;
}

const Games = ({ navBarExtension }: GamesProps) => {
  const navigate = useNavigate();

  const handleGameClick = (gameId: string) => {
    navigate(`/game/${gameId}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar 
        isLoggedIn={boolean}
        onLogout={() => {}}
        extension={navBarExtension}
      />
      
      <main className="container py-12 flex-1">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Explore Games</h1>
          <div className="flex items-center space-x-2">
            <Label htmlFor="search">
              <Search className="h-4 w-4 mr-2" />
            </Label>
            <Input id="search" placeholder="Search games..." className="md:w-64" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Example Game Cards - Replace with actual game data */}
          <Card className="interactive-card">
            <CardHeader>
              <CardTitle>Memory Match</CardTitle>
              <CardDescription>Test your memory skills</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Match pairs of cards with increasing difficulty.</p>
              <Button variant="secondary" className="mt-4" onClick={() => handleGameClick('memory-match')}>
                Play Now <Gamepad2 className="ml-2" />
              </Button>
            </CardContent>
          </Card>

          <Card className="interactive-card">
            <CardHeader>
              <CardTitle>Number Sequence</CardTitle>
              <CardDescription>Identify the next number in the sequence</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Improve your logical thinking with number patterns.</p>
              <Button variant="secondary" className="mt-4" onClick={() => handleGameClick('number-sequence')}>
                Play Now <Gamepad2 className="ml-2" />
              </Button>
            </CardContent>
          </Card>

          <Card className="interactive-card">
            <CardHeader>
              <CardTitle>Word Scramble</CardTitle>
              <CardDescription>Unscramble the letters to form a word</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Enhance your vocabulary and word recognition skills.</p>
              <Button variant="secondary" className="mt-4" onClick={() => handleGameClick('word-scramble')}>
                Play Now <Gamepad2 className="ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* Add more game cards here */}
          <Card className="interactive-card">
            <CardHeader>
              <CardTitle>Spatial Reasoning</CardTitle>
              <CardDescription>Solve spatial puzzles</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Develop your spatial awareness and problem-solving abilities.</p>
              <Button variant="secondary" className="mt-4" onClick={() => handleGameClick('spatial-reasoning')}>
                Play Now <Gamepad2 className="ml-2" />
              </Button>
            </CardContent>
          </Card>

          <Card className="interactive-card">
            <CardHeader>
              <CardTitle>Pattern Recognition</CardTitle>
              <CardDescription>Identify patterns in a sequence</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Improve your pattern recognition and analytical skills.</p>
              <Button variant="secondary" className="mt-4" onClick={() => handleGameClick('pattern-recognition')}>
                Play Now <Gamepad2 className="ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Games;
