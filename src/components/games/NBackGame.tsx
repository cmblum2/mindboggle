import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, CheckCircle, XCircle } from 'lucide-react';

interface NBackGameProps {
  onScoreChange: (score: number) => void;
  onGameEnd: () => void;
  difficulty?: 'easy' | 'medium' | 'hard';
  onTrialComplete?: (trial: { correct: boolean; rtMs: number; stimulus: string; response: string; difficulty: number }) => void;
}

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const NBackGame = ({ onScoreChange, onGameEnd, difficulty = 'medium', onTrialComplete }: NBackGameProps) => {
  const nLevel = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3;
  const totalTrials = difficulty === 'easy' ? 20 : difficulty === 'medium' ? 25 : 30;
  const matchProbability = 0.3;

  const [started, setStarted] = useState(false);
  const [sequence, setSequence] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [score, setScore] = useState(0);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [falseAlarms, setFalseAlarms] = useState(0);
  const [responded, setResponded] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [showStimulus, setShowStimulus] = useState(false);
  const trialTimer = useRef<number | null>(null);
  const stimulusTimer = useRef<number | null>(null);
  const trialStartTime = useRef(0);

  const generateSequence = useCallback(() => {
    const seq: string[] = [];
    for (let i = 0; i < totalTrials; i++) {
      if (i >= nLevel && Math.random() < matchProbability) {
        seq.push(seq[i - nLevel]);
      } else {
        let letter;
        do {
          letter = LETTERS[Math.floor(Math.random() * 8)];
        } while (i >= nLevel && letter === seq[i - nLevel]);
        seq.push(letter);
      }
    }
    return seq;
  }, [nLevel, totalTrials]);

  const startGame = () => {
    const seq = generateSequence();
    setSequence(seq);
    setCurrentIndex(-1);
    setScore(0);
    setHits(0);
    setMisses(0);
    setFalseAlarms(0);
    setStarted(true);
  };

  useEffect(() => {
    if (!started || currentIndex >= totalTrials - 1) return;

    const advance = () => {
      setResponded(false);
      setFeedback(null);
      setCurrentIndex(prev => {
        const next = prev + 1;
        if (next >= totalTrials) {
          setTimeout(onGameEnd, 500);
          return prev;
        }
        return next;
      });
      setShowStimulus(true);
      trialStartTime.current = performance.now();
      stimulusTimer.current = window.setTimeout(() => setShowStimulus(false), 1500);
    };

    if (currentIndex >= nLevel && !responded) {
      const isMatch = sequence[currentIndex] === sequence[currentIndex - nLevel];
      if (isMatch) {
        setMisses(prev => prev + 1);
        // Log omission as a trial
        onTrialComplete?.({
          correct: false,
          rtMs: 2500,
          stimulus: sequence[currentIndex],
          response: 'omission',
          difficulty: nLevel,
        });
      }
    }

    trialTimer.current = window.setTimeout(advance, currentIndex === -1 ? 500 : 2500);
    return () => {
      if (trialTimer.current) clearTimeout(trialTimer.current);
      if (stimulusTimer.current) clearTimeout(stimulusTimer.current);
    };
  }, [started, currentIndex, totalTrials, sequence, nLevel, onGameEnd]);

  const handleResponse = (isMatch: boolean) => {
    if (responded || currentIndex < nLevel) return;
    setResponded(true);
    const rt = performance.now() - trialStartTime.current;

    const actualMatch = sequence[currentIndex] === sequence[currentIndex - nLevel];
    const correct = isMatch === actualMatch;

    onTrialComplete?.({
      correct,
      rtMs: rt,
      stimulus: sequence[currentIndex],
      response: isMatch ? 'match' : 'no_match',
      difficulty: nLevel,
    });

    if (correct) {
      const newScore = score + (actualMatch ? 15 : 5);
      setScore(newScore);
      onScoreChange(newScore);
      if (actualMatch) setHits(prev => prev + 1);
      setFeedback('correct');
    } else {
      if (isMatch && !actualMatch) setFalseAlarms(prev => prev + 1);
      setFeedback('wrong');
    }
    setTimeout(() => setFeedback(null), 600);
  };

  if (!started) {
    return (
      <div className="text-center space-y-4 py-8">
        <Brain className="w-16 h-16 mx-auto text-primary" />
        <h2 className="text-2xl font-bold">N-Back (N={nLevel})</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Press "Match" when the current letter is the same as the one shown <strong>{nLevel} step{nLevel > 1 ? 's' : ''} ago</strong>. Press "No Match" otherwise.
        </p>
        <Button onClick={startGame} size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
          Start
        </Button>
      </div>
    );
  }

  const progress = Math.round(((currentIndex + 1) / totalTrials) * 100);

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="w-full bg-muted rounded-full h-2">
        <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
      </div>
      <div className="text-xs text-muted-foreground">
        Trial {currentIndex + 1} / {totalTrials} · Hits: {hits} · False alarms: {falseAlarms}
      </div>
      <div className="relative w-32 h-32 flex items-center justify-center rounded-2xl border-2 border-border bg-muted/30">
        <AnimatePresence mode="wait">
          {showStimulus && currentIndex >= 0 && (
            <motion.span key={currentIndex} initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="text-5xl font-bold text-foreground">
              {sequence[currentIndex]}
            </motion.span>
          )}
        </AnimatePresence>
        {feedback && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`absolute inset-0 rounded-2xl flex items-center justify-center ${feedback === 'correct' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
            {feedback === 'correct' ? <CheckCircle className="w-10 h-10 text-green-500" /> : <XCircle className="w-10 h-10 text-red-500" />}
          </motion.div>
        )}
      </div>
      <div className="flex gap-4">
        <Button size="lg" variant="outline" onClick={() => handleResponse(false)} disabled={responded || currentIndex < nLevel} className="min-w-[120px]">No Match</Button>
        <Button size="lg" onClick={() => handleResponse(true)} disabled={responded || currentIndex < nLevel} className="min-w-[120px] bg-primary text-primary-foreground">Match!</Button>
      </div>
      {currentIndex >= 0 && currentIndex < nLevel && (
        <p className="text-xs text-muted-foreground animate-pulse">Memorize… responding starts after {nLevel} letters</p>
      )}
    </div>
  );
};

export default NBackGame;
