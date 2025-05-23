
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Sparkles, Lightbulb, Brain, Brush, Palette } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// Types for the creative challenges
interface Challenge {
  id: string;
  type: 'association' | 'divergent' | 'visual' | 'reversal';
  prompt: string;
  options?: string[];
  correctAnswers?: string[];
  presetAnswers?: string[]; // For divergent/reversal questions
  timeLimit: number;
  points: number;
}

interface CreativeSparkGameProps {
  onScoreChange: (score: number) => void;
  onGameEnd: () => void;
  difficulty: 'easy' | 'medium' | 'hard';
}

// Generate challenges based on difficulty
const getCreativeChallenges = (difficulty: 'easy' | 'medium' | 'hard'): Challenge[] => {
  const challenges: Challenge[] = [
    {
      id: 'association1',
      type: 'association',
      prompt: 'Which word connects: BLUE, CAKE, COTTAGE',
      options: ['Cheese', 'House', 'Sky', 'Water'],
      correctAnswers: ['Cheese'],
      timeLimit: difficulty === 'easy' ? 20 : difficulty === 'medium' ? 15 : 10,
      points: 5
    },
    {
      id: 'divergent1',
      type: 'divergent',
      prompt: 'Select an uncommon use for a paperclip',
      presetAnswers: [
        'Bookmark', 
        'Earring', 
        'Lock pick', 
        'Cable organizer',
        'Zipper pull',
        'Reset button tool'
      ],
      timeLimit: difficulty === 'easy' ? 25 : difficulty === 'medium' ? 20 : 15,
      points: 10
    },
    {
      id: 'visual1',
      type: 'visual',
      prompt: 'Imagine a red triangle, blue circle, and yellow square arranged to create a face. Which shape would be the mouth?',
      options: ['Triangle', 'Circle', 'Square', 'None of them'],
      correctAnswers: ['Square', 'Circle'], // Multiple valid creative answers
      timeLimit: difficulty === 'easy' ? 20 : difficulty === 'medium' ? 15 : 10,
      points: 5
    },
    {
      id: 'association2',
      type: 'association',
      prompt: 'Connect these: MAGIC, BLACK, FORTUNE',
      options: ['Cards', 'Power', 'Money', 'Night'],
      correctAnswers: ['Cards'],
      timeLimit: difficulty === 'easy' ? 20 : difficulty === 'medium' ? 15 : 10,
      points: 5
    },
    {
      id: 'reversal1',
      type: 'reversal',
      prompt: 'What would happen if gravity reversed for 5 seconds every hour?',
      presetAnswers: [
        'Objects would float to the ceiling briefly',
        'People would need to secure items regularly',
        'Buildings would need special anchors',
        'New sports would be invented',
        'Special gravity-proof containers would be needed',
        'We would have scheduled "gravity breaks"'
      ],
      timeLimit: difficulty === 'easy' ? 30 : difficulty === 'medium' ? 25 : 20,
      points: 15
    },
    {
      id: 'divergent2',
      type: 'divergent',
      prompt: 'Select an innovative way to reuse plastic bottles',
      presetAnswers: [
        'Vertical garden planters',
        'Solar water purifier',
        'Homemade sprinkler system',
        'Bird feeder',
        'Desk organizer',
        'Lamp shade'
      ],
      timeLimit: difficulty === 'easy' ? 25 : difficulty === 'medium' ? 20 : 15,
      points: 10
    },
  ];

  // Add more challenging questions for medium/hard
  if (difficulty === 'medium' || difficulty === 'hard') {
    challenges.push(
      {
        id: 'association3',
        type: 'association',
        prompt: 'Find the connection: TERMINAL, BREEZE, HARVEST',
        options: ['Moon', 'Sea', 'Wind', 'Plant'],
        correctAnswers: ['Wind'],
        timeLimit: difficulty === 'medium' ? 15 : 10,
        points: 10
      },
      {
        id: 'reversal2',
        type: 'reversal',
        prompt: 'What if humans had photosynthetic skin?',
        presetAnswers: [
          'People would spend more time outdoors',
          'Clothing styles would prioritize skin exposure',
          'Food consumption would decrease',
          'Sleep patterns would align with sunlight hours',
          'Green-tinted skin would become attractive',
          'Architecture would include more windows and skylights'
        ],
        timeLimit: difficulty === 'medium' ? 25 : 20,
        points: 15
      }
    );
  }

  // Add the most challenging questions for hard only
  if (difficulty === 'hard') {
    challenges.push(
      {
        id: 'visual2',
        type: 'visual',
        prompt: 'If emotions were shapes, what shape would represent "anticipation"?',
        options: ['Spiral', 'Arrow', 'Wave', 'Zigzag'],
        correctAnswers: ['Arrow', 'Spiral', 'Wave'], // Multiple valid creative answers
        timeLimit: 15,
        points: 15
      },
      {
        id: 'divergent3',
        type: 'divergent',
        prompt: 'Select a new holiday idea and its main tradition',
        presetAnswers: [
          'Digital Detox Day - Everyone disconnects from technology',
          'Gratitude Day - Write thank you notes to strangers',
          'Skill Swap Day - Teach others something you know',
          'Global Fusion Day - Everyone cooks a dish from another culture',
          'Pay It Forward Day - Do random acts of kindness',
          'Innovation Day - Create solutions to everyday problems'
        ],
        timeLimit: 25,
        points: 20
      }
    );
  }

  return challenges;
};

const CreativeSparkGame: React.FC<CreativeSparkGameProps> = ({ 
  onScoreChange, 
  onGameEnd, 
  difficulty 
}) => {
  const [score, setScore] = useState<number>(0);
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState<number>(0);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    show: boolean;
    isCorrect: boolean;
    message: string;
  }>({ show: false, isCorrect: false, message: '' });
  const [streak, setStreak] = useState<number>(0);
  const [showStreak, setShowStreak] = useState<boolean>(false);
  const [showBonus, setShowBonus] = useState<{show: boolean, amount: number}>({show: false, amount: 0});
  const [creativityTips, setCreativityTips] = useState<string[]>([
    "Think outside the box",
    "Connect unrelated ideas",
    "Question assumptions",
    "Consider multiple perspectives",
    "Use metaphors and analogies",
    "Reverse your thinking"
  ]);
  const [currentTipIndex, setCurrentTipIndex] = useState<number>(0);
  
  // Background colors for different challenge types
  const getBgColor = (type: string) => {
    switch(type) {
      case 'association': return 'bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-indigo-950 dark:to-purple-900';
      case 'divergent': return 'bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-950 dark:to-orange-900';
      case 'visual': return 'bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-emerald-950 dark:to-teal-900';
      case 'reversal': return 'bg-gradient-to-br from-rose-50 to-pink-100 dark:from-rose-950 dark:to-pink-900';
      default: return 'bg-gradient-to-br from-gray-50 to-slate-100 dark:from-gray-950 dark:to-slate-900';
    }
  };
  
  // Icon for challenge type
  const getChallengeIcon = (type: string) => {
    switch(type) {
      case 'association': return <Brain className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />;
      case 'divergent': return <Lightbulb className="h-6 w-6 text-amber-600 dark:text-amber-400" />;
      case 'visual': return <Palette className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />;
      case 'reversal': return <Brush className="h-6 w-6 text-rose-600 dark:text-rose-400" />;
      default: return <Sparkles className="h-6 w-6 text-gray-600 dark:text-gray-400" />;
    }
  };

  // Initialize challenges
  useEffect(() => {
    setChallenges(getCreativeChallenges(difficulty));
  }, [difficulty]);

  // Set up current challenge
  useEffect(() => {
    if (challenges.length > 0 && currentChallengeIndex < challenges.length) {
      setTimeRemaining(challenges[currentChallengeIndex].timeLimit);
      setSelectedOption(null);
      setFeedback({ show: false, isCorrect: false, message: '' });
    }
  }, [currentChallengeIndex, challenges]);

  // Timer effect
  useEffect(() => {
    if (challenges.length === 0 || feedback.show || currentChallengeIndex >= challenges.length) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [challenges, currentChallengeIndex, feedback.show]);

  // Handle timeout
  const handleTimeout = () => {
    setFeedback({ 
      show: true, 
      isCorrect: false, 
      message: "Time's up! Let's try another challenge." 
    });
    setStreak(0);
    
    // Move to next challenge after delay
    setTimeout(() => {
      if (currentChallengeIndex < challenges.length - 1) {
        setCurrentChallengeIndex(prev => prev + 1);
      } else {
        onGameEnd();
      }
    }, 2000);
  };

  // Creativity tip rotation
  useEffect(() => {
    const tipInterval = setInterval(() => {
      setCurrentTipIndex(prev => (prev + 1) % creativityTips.length);
    }, 8000);
    
    return () => clearInterval(tipInterval);
  }, [creativityTips.length]);

  // Handle option selection for all challenge types
  const handleOptionSelect = (option: string) => {
    const currentChallenge = challenges[currentChallengeIndex];
    setSelectedOption(option);
    
    // For association and visual challenges, check if answer is correct
    // For divergent and reversal, all answers are considered "correct" but with varying creativity scores
    const isAssociationOrVisual = currentChallenge.type === 'association' || currentChallenge.type === 'visual';
    const isCorrect = isAssociationOrVisual 
      ? (currentChallenge.correctAnswers?.includes(option) || false)
      : true;
    
    // Calculate points based on time remaining and difficulty
    let earnedPoints = currentChallenge.points;
    
    if (isCorrect) {
      // Time bonus
      const timeBonus = Math.floor(timeRemaining / 2);
      earnedPoints += timeBonus;
      
      // Streak bonus
      const newStreak = streak + 1;
      setStreak(newStreak);
      
      if (newStreak >= 3) {
        const streakBonus = Math.floor(newStreak / 3) * 5;
        earnedPoints += streakBonus;
        setShowBonus({show: true, amount: streakBonus});
        setTimeout(() => setShowBonus({show: false, amount: 0}), 1500);
      }
      
      if (newStreak >= 3) {
        setShowStreak(true);
        setTimeout(() => setShowStreak(false), 1500);
      }
      
      // For divergent and reversal challenges, randomize the "creativeness" score a bit
      // to simulate the feeling of some answers being more creative than others
      if (!isAssociationOrVisual) {
        // Randomize creativity score but make it feel deliberate
        const randomFactor = Math.floor(Math.random() * 3); // 0, 1, or 2
        
        if (randomFactor === 0) {
          // Less creative answer
          earnedPoints = Math.floor(earnedPoints * 0.7);
          setFeedback({ 
            show: true, 
            isCorrect: true, 
            message: `Good answer! +${earnedPoints} points` 
          });
        } else if (randomFactor === 1) {
          // Standard creative answer
          setFeedback({ 
            show: true, 
            isCorrect: true, 
            message: `Creative response! +${earnedPoints} points` 
          });
        } else {
          // Highly creative answer
          earnedPoints = Math.floor(earnedPoints * 1.3);
          setFeedback({ 
            show: true, 
            isCorrect: true, 
            message: `Brilliant thinking! +${earnedPoints} points` 
          });
        }
      } else {
        setFeedback({ 
          show: true, 
          isCorrect: true, 
          message: `Great thinking! +${earnedPoints} points` 
        });
      }
      
      // Update score
      setScore(prev => {
        const newScore = prev + earnedPoints;
        onScoreChange(newScore);
        return newScore;
      });
    } else {
      setStreak(0);
      setFeedback({ 
        show: true, 
        isCorrect: false, 
        message: "That's not quite it. Creative thinking is about exploring multiple possibilities." 
      });
    }
    
    // Move to next challenge after delay
    setTimeout(() => {
      if (currentChallengeIndex < challenges.length - 1) {
        setCurrentChallengeIndex(prev => prev + 1);
      } else {
        onGameEnd();
      }
    }, 2000);
  };

  // No challenges yet
  if (challenges.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 p-4">
        <Sparkles className="h-12 w-12 text-amber-500 animate-pulse" />
        <p className="text-lg mt-4">Loading your creative challenges...</p>
      </div>
    );
  }

  const currentChallenge = challenges[currentChallengeIndex];

  return (
    <div className="w-full p-2">
      {/* Progress bar */}
      <div className="w-full h-2 bg-gray-200 rounded-full mb-6">
        <div 
          className="h-2 bg-gradient-to-r from-purple-600 to-pink-500 rounded-full transition-all duration-300"
          style={{ width: `${((currentChallengeIndex) / challenges.length) * 100}%` }}
        />
      </div>
      
      {/* Challenge card */}
      <Card className={cn(
        "overflow-hidden shadow-lg transition-all duration-300", 
        getBgColor(currentChallenge.type),
        feedback.show && (feedback.isCorrect ? "ring-2 ring-green-500" : "ring-2 ring-red-500")
      )}>
        <CardContent className="p-6">
          {/* Challenge type badge */}
          <div className="flex items-center mb-4">
            <div className="flex items-center bg-white dark:bg-gray-800 rounded-full px-3 py-1 text-sm font-medium">
              {getChallengeIcon(currentChallenge.type)}
              <span className="ml-2 capitalize">{currentChallenge.type} Thinking</span>
            </div>
            <div className="ml-auto flex items-center gap-1 bg-white dark:bg-gray-800 rounded-full px-3 py-1">
              <span className="text-sm font-medium">{timeRemaining}s</span>
            </div>
          </div>
          
          {/* Challenge prompt */}
          <motion.div 
            key={currentChallenge.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-6"
          >
            <h3 className="text-xl font-bold mb-4">{currentChallenge.prompt}</h3>
            
            {/* Different UI based on challenge type */}
            <AnimatePresence mode="wait">
              {feedback.show ? (
                <motion.div
                  key="feedback"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={cn(
                    "p-4 rounded-lg text-center",
                    feedback.isCorrect ? "bg-green-100 dark:bg-green-900" : "bg-red-100 dark:bg-red-900"
                  )}
                >
                  <div className="flex justify-center mb-2">
                    {feedback.isCorrect ? (
                      <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
                    ) : (
                      <X className="h-8 w-8 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                  <p className="font-medium">{feedback.message}</p>
                  {!feedback.isCorrect && currentChallenge.type === 'association' && (
                    <p className="mt-2 text-sm">
                      The correct answer was: {currentChallenge.correctAnswers?.[0]}
                    </p>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="options"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={cn(
                    "grid gap-3",
                    currentChallenge.type === 'association' || currentChallenge.type === 'visual' 
                      ? "grid-cols-1 sm:grid-cols-2" 
                      : "grid-cols-1"
                  )}
                >
                  {/* Display options based on challenge type */}
                  {(currentChallenge.type === 'association' || currentChallenge.type === 'visual') && 
                    currentChallenge.options?.map((option) => (
                      <Button
                        key={option}
                        variant="outline"
                        onClick={() => handleOptionSelect(option)}
                        disabled={feedback.show}
                        className={cn(
                          "h-auto py-3 text-left justify-start",
                          selectedOption === option ? "border-2 border-purple-500 dark:border-purple-400" : "",
                        )}
                      >
                        {option}
                      </Button>
                    ))
                  }
                  
                  {/* For divergent and reversal thinking, show preset answers */}
                  {(currentChallenge.type === 'divergent' || currentChallenge.type === 'reversal') && 
                    currentChallenge.presetAnswers?.map((answer) => (
                      <Button
                        key={answer}
                        variant="outline"
                        onClick={() => handleOptionSelect(answer)}
                        disabled={feedback.show}
                        className={cn(
                          "h-auto py-3 text-left justify-start",
                          selectedOption === answer ? "border-2 border-purple-500 dark:border-purple-400" : "",
                        )}
                      >
                        {answer}
                      </Button>
                    ))
                  }
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </CardContent>
      </Card>
      
      {/* Creativity tip */}
      <motion.div 
        key={currentTipIndex}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="mt-4 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-sm"
      >
        <div className="flex items-center">
          <Lightbulb className="h-4 w-4 text-amber-400 mr-2" />
          <span>Creativity Tip: {creativityTips[currentTipIndex]}</span>
        </div>
      </motion.div>
      
      {/* Score section */}
      <div className="mt-4 flex justify-between items-center">
        <div className="font-bold">Score: {score}</div>
        <div className="flex items-center">
          <span className="font-medium">Streak: </span>
          <span className="ml-2 font-bold">{streak}</span>
        </div>
      </div>
      
      {/* Animations for streaks and bonuses */}
      <AnimatePresence>
        {showStreak && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 1.5, opacity: 0, y: -20 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
          >
            <div className="bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold py-4 px-6 rounded-lg text-2xl">
              {streak} Streak!
            </div>
          </motion.div>
        )}
        
        {showBonus.show && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 1.5, opacity: 0, y: -20 }}
            className="fixed top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
          >
            <div className="bg-gradient-to-r from-amber-500 to-yellow-300 text-white font-bold py-3 px-5 rounded-lg text-xl">
              +{showBonus.amount} Bonus!
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CreativeSparkGame;
