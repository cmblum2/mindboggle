import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Brain, GamepadIcon, Star } from 'lucide-react';
import NavBar from '@/components/NavBar';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Shell } from '@/components/Shell';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { ModeToggle } from '@/components/mode-toggle';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { CalendarIcon } from "@radix-ui/react-icons"
import { format } from "date-fns"
import { enUS } from "date-fns/locale"
import { DateRange } from "react-day-picker"
import { Button as button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  HoverCard,
  HoverCardContent,
  HoverCardDescription,
  HoverCardHeader,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { ProgressDemo } from '@/components/ProgressDemo';
import { Skeleton } from "@/components/ui/skeleton"
import { useTheme } from "@/components/theme-provider"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Badge } from "@/components/ui/badge"
import { InputWithButton } from '@/components/input-with-button';
import { AuthModal } from '@/components/AuthModal';

interface GamesProps {
  navBarExtension?: React.ReactNode;
}

interface Game {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  difficulty: string;
  timeToComplete: string;
}

const gamesData: Game[] = [
  {
    id: '1',
    title: 'Memory Match',
    description: 'Test your memory by matching pairs of cards.',
    icon: <Brain className="h-6 w-6" />,
    category: 'Memory',
    difficulty: 'Easy',
    timeToComplete: '5-10 minutes',
  },
  {
    id: '2',
    title: 'Number Crunch',
    description: 'Sharpen your math skills with quick calculations.',
    icon: <GamepadIcon className="h-6 w-6" />,
    category: 'Math',
    difficulty: 'Medium',
    timeToComplete: '7-12 minutes',
  },
  {
    id: '3',
    title: 'Word Scramble',
    description: 'Unscramble letters to form valid words.',
    icon: <Star className="h-6 w-6" />,
    category: 'Verbal',
    difficulty: 'Hard',
    timeToComplete: '10-15 minutes',
  },
];

interface GameCardProps {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  difficulty: string;
  timeToComplete: string;
  name: string;
  duration: string;
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
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleGameClick = () => {
    if (user) {
      navigate(`/game/${id}`);
    } else {
      setShowAuthModal(true);
    }
  };

  return (
    <Card className="bg-card text-card-foreground shadow-md hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          {icon}
          <span>{title}</span>
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2">
          <div className="flex items-center space-x-2">
            <Label className="text-sm font-medium">Category:</Label>
            <span className="text-muted-foreground">{category}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Label className="text-sm font-medium">Difficulty:</Label>
            <span className="text-muted-foreground">{difficulty}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Label className="text-sm font-medium">Time:</Label>
            <span className="text-muted-foreground">{timeToComplete}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={handleGameClick}>
          {user ? 'Play Game' : 'Login to Play'}
        </Button>
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

const Games = ({ navBarExtension }: GamesProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [games, setGames] = useState(gamesData);

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    }
  };

  const handleButtonClick = (path: string) => {
    if (user) {
      navigate(path);
    } else {
      // Show toast notification that login is required
      toast({
        title: "Login Required",
        description: "Please login or create an account to access this feature.",
        variant: "default",
      });
      
      // This will trigger the auth modal through the NavBar component
      const getStartedButton = document.querySelector('[data-get-started]') as HTMLButtonElement;
      if (getStartedButton) {
        getStartedButton.click();
      }
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar 
        isLoggedIn={!!user}
        onLogout={logout}
        extension={navBarExtension}
      />
      
      <main className="flex-1 py-12 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-serif">
              Explore Our Games
            </h1>
            <p className="max-w-[700px] text-muted-foreground md:text-xl mx-auto">
              Challenge your brain with our curated selection of games designed to improve cognitive functions.
            </p>
          </div>
          
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {games.map((game) => (
              <GameCard
                key={game.id}
                id={game.id}
                title={game.title}
                description={game.description}
                icon={game.icon}
                category={game.category}
                difficulty={game.difficulty}
                timeToComplete={game.timeToComplete}
                name={game.title} // Add name property
                duration={game.timeToComplete} // Use timeToComplete as duration
                progress={0} // Default progress value
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Games;
