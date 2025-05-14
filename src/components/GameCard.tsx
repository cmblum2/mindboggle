import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gamepad2, Clock, Puzzle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import AuthModal from './AuthModal';
import { useAuth } from '@/hooks/useAuth';

interface GameCardProps {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeToComplete: number;
  name: string;
  duration: number;
  progress: number;
}

const GameCard: React.FC<GameCardProps> = ({
  id,
  title,
  description,
  icon,
  category,
  difficulty,
  timeToComplete,
  name,
  duration,
  progress,
}) => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user } = useAuth();

  const handlePlayClick = () => {
    if (!user) {
      setShowAuthModal(true);
    }
  };

  return (
    <Card className="bg-card shadow-md hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {title}
          {icon}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex items-center">
          <Gamepad2 className="mr-2 h-4 w-4 opacity-70" />
          Category: {category}
        </div>
        <div className="flex items-center">
          <Puzzle className="mr-2 h-4 w-4 opacity-70" />
          Difficulty: <Badge variant="secondary">{difficulty}</Badge>
        </div>
        <div className="flex items-center">
          <Clock className="mr-2 h-4 w-4 opacity-70" />
          Duration: {timeToComplete} minutes
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <Link to={`/game/${id}`}>
          <Button onClick={handlePlayClick}>
            Play Now
          </Button>
        </Link>
      </CardFooter>
      
      {showAuthModal && (
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)}
        />
      )}
    </Card>
  );
};

export default GameCard;
