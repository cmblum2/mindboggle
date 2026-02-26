import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Palette, CheckCircle, XCircle } from 'lucide-react';

interface StroopGameProps {
  onScoreChange: (score: number) => void;
  onGameEnd: () => void;
  difficulty?: 'easy' | 'medium' | 'hard';
  onTrialComplete?: (trial: { correct: boolean; rtMs: number; stimulus: string; response: string; difficulty: number }) => void;
}

const COLORS = [
  { name: 'Red', hex: '#ef4444' },
  { name: 'Blue', hex: '#3b82f6' },
  { name: 'Green', hex: '#22c55e' },
  { name: 'Yellow', hex: '#eab308' },
  { name: 'Purple', hex: '#a855f7' },
  { name: 'Orange', hex: '#f97316' },
];

interface StroopTrial {
  word: string;
  inkColor: typeof COLORS[number];
  isCongruent: boolean;
}

const StroopGame = ({ onScoreChange, onGameEnd, difficulty = 'medium', onTrialComplete }: StroopGameProps) => {
  const totalTrials = difficulty === 'easy' ? 15 : difficulty === 'medium' ? 25 : 35;
  const congruentRatio = difficulty === 'easy' ? 0.6 : difficulty === 'medium' ? 0.4 : 0.25;
  const difficultyNum = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3;

  const [started, setStarted] = useState(false);
  const [trial, setTrial] = useState<StroopTrial | null>(null);
  const [trialNum, setTrialNum] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [congruentCorrect, setCongruentCorrect] = useState(0);
  const [incongruentCorrect, setIncongruentCorrect] = useState(0);
  const [congruentRT, setCongruentRT] = useState<number[]>([]);
  const [incongruentRT, setIncongruentRT] = useState<number[]>([]);
  const trialStart = useRef(0);

  const generateTrial = (): StroopTrial => {
    const isCongruent = Math.random() < congruentRatio;
    const wordColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    let inkColor = wordColor;
    if (!isCongruent) {
      do { inkColor = COLORS[Math.floor(Math.random() * COLORS.length)]; } while (inkColor.name === wordColor.name);
    }
    return { word: wordColor.name, inkColor, isCongruent };
  };

  const nextTrial = () => {
    if (trialNum >= totalTrials) { onGameEnd(); return; }
    const t = generateTrial();
    setTrial(t);
    setFeedback(null);
    trialStart.current = performance.now();
  };

  const startGame = () => {
    setStarted(true);
    setTrialNum(0);
    setScore(0);
    setCongruentCorrect(0);
    setIncongruentCorrect(0);
    setCongruentRT([]);
    setIncongruentRT([]);
    const t = generateTrial();
    setTrial(t);
    trialStart.current = performance.now();
  };

  const handleAnswer = (colorName: string) => {
    if (!trial) return;
    const rt = performance.now() - trialStart.current;
    const correct = colorName === trial.inkColor.name;

    onTrialComplete?.({
      correct,
      rtMs: rt,
      stimulus: `${trial.word}_ink:${trial.inkColor.name}_${trial.isCongruent ? 'congruent' : 'incongruent'}`,
      response: colorName,
      difficulty: difficultyNum,
    });

    if (correct) {
      const rtBonus = Math.max(0, Math.round((2000 - rt) / 100));
      const incongruentBonus = trial.isCongruent ? 0 : 5;
      const pts = 10 + rtBonus + incongruentBonus;
      const newScore = score + pts;
      setScore(newScore);
      onScoreChange(newScore);
      if (trial.isCongruent) { setCongruentCorrect(p => p + 1); setCongruentRT(p => [...p, rt]); }
      else { setIncongruentCorrect(p => p + 1); setIncongruentRT(p => [...p, rt]); }
      setFeedback('correct');
    } else {
      setFeedback('wrong');
    }

    setTrialNum(p => p + 1);
    setTimeout(nextTrial, 500);
  };

  if (!started) {
    return (
      <div className="text-center space-y-4 py-8">
        <Palette className="w-16 h-16 mx-auto text-primary" />
        <h2 className="text-2xl font-bold">Stroop Test</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Name the <strong>ink color</strong> of the word, not what the word says. Tap the matching color button as fast as you can!
        </p>
        <Button onClick={startGame} size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">Start</Button>
      </div>
    );
  }

  const progress = Math.round((trialNum / totalTrials) * 100);
  const interferenceScore = incongruentRT.length > 0 && congruentRT.length > 0
    ? Math.round((incongruentRT.reduce((a, b) => a + b, 0) / incongruentRT.length) - (congruentRT.reduce((a, b) => a + b, 0) / congruentRT.length))
    : null;

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="w-full bg-muted rounded-full h-2">
        <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
      </div>
      <div className="text-xs text-muted-foreground">
        Trial {trialNum + 1} / {totalTrials}
        {interferenceScore !== null && ` · Interference: ${interferenceScore}ms`}
      </div>
      {trial && (
        <motion.div key={trialNum} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="relative py-8">
          <span className="text-5xl font-black select-none" style={{ color: trial.inkColor.hex }}>{trial.word.toUpperCase()}</span>
          {feedback && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="absolute -top-4 right-0">
              {feedback === 'correct' ? <CheckCircle className="w-6 h-6 text-green-500" /> : <XCircle className="w-6 h-6 text-red-500" />}
            </motion.div>
          )}
        </motion.div>
      )}
      <div className="grid grid-cols-3 gap-3 max-w-sm w-full">
        {COLORS.map(c => (
          <Button key={c.name} variant="outline" className="h-12 font-semibold text-sm border-2 hover:opacity-80" style={{ borderColor: c.hex, color: c.hex }} onClick={() => handleAnswer(c.name)}>
            {c.name}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default StroopGame;
