import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Hash, CheckCircle, XCircle } from 'lucide-react';

interface SymbolDigitGameProps {
  onScoreChange: (score: number) => void;
  onGameEnd: () => void;
  difficulty?: 'easy' | 'medium' | 'hard';
  onTrialComplete?: (trial: { correct: boolean; rtMs: number; stimulus: string; response: string; difficulty: number }) => void;
}

const SYMBOLS = ['☀', '♣', '♦', '♥', '♠', '✿', '★', '♬', '⬟'];

const SymbolDigitGame = ({ onScoreChange, onGameEnd, difficulty = 'medium', onTrialComplete }: SymbolDigitGameProps) => {
  const totalTrials = difficulty === 'easy' ? 20 : difficulty === 'medium' ? 30 : 45;
  const keySize = difficulty === 'easy' ? 6 : difficulty === 'medium' ? 7 : 9;
  const difficultyNum = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3;

  const [started, setStarted] = useState(false);
  const [key, setKey] = useState<{ symbol: string; digit: number }[]>([]);
  const [currentSymbol, setCurrentSymbol] = useState('');
  const [correctDigit, setCorrectDigit] = useState(0);
  const [trialNum, setTrialNum] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const trialStart = useRef(0);

  const startGame = () => {
    const shuffledSymbols = [...SYMBOLS].sort(() => Math.random() - 0.5).slice(0, keySize);
    const newKey = shuffledSymbols.map((s, i) => ({ symbol: s, digit: i + 1 }));
    setKey(newKey);
    setTrialNum(0);
    setScore(0);
    setStarted(true);
    const entry = newKey[Math.floor(Math.random() * newKey.length)];
    setCurrentSymbol(entry.symbol);
    setCorrectDigit(entry.digit);
    trialStart.current = performance.now();
  };

  const handleAnswer = (digit: number) => {
    if (feedback) return;
    const rt = performance.now() - trialStart.current;
    const correct = digit === correctDigit;

    onTrialComplete?.({
      correct,
      rtMs: rt,
      stimulus: currentSymbol,
      response: String(digit),
      difficulty: difficultyNum,
    });

    if (correct) {
      const rtBonus = Math.max(0, Math.round((2000 - rt) / 100));
      const pts = 10 + rtBonus;
      const newScore = score + pts;
      setScore(newScore);
      onScoreChange(newScore);
      setFeedback('correct');
    } else {
      setFeedback('wrong');
    }

    const next = trialNum + 1;
    setTrialNum(next);

    setTimeout(() => {
      if (next >= totalTrials) { onGameEnd(); return; }
      const entry = key[Math.floor(Math.random() * key.length)];
      setCurrentSymbol(entry.symbol);
      setCorrectDigit(entry.digit);
      setFeedback(null);
      trialStart.current = performance.now();
    }, 350);
  };

  if (!started) {
    return (
      <div className="text-center space-y-4 py-8">
        <Hash className="w-16 h-16 mx-auto text-primary" />
        <h2 className="text-2xl font-bold">Symbol Digit</h2>
        <p className="text-muted-foreground max-w-md mx-auto">Use the key to match each symbol to its digit as fast as possible. Speed and accuracy both matter!</p>
        <Button onClick={startGame} size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">Start</Button>
      </div>
    );
  }

  const progress = Math.round((trialNum / totalTrials) * 100);

  return (
    <div className="flex flex-col items-center space-y-5">
      <div className="w-full bg-muted rounded-full h-2">
        <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
      </div>
      <div className="text-xs text-muted-foreground">Trial {trialNum + 1} / {totalTrials}</div>
      <div className="flex flex-wrap justify-center gap-2 px-2 py-3 rounded-lg bg-muted/30 border border-border w-full max-w-md">
        {key.map(k => (
          <div key={k.digit} className="flex flex-col items-center px-2 py-1">
            <span className="text-xl">{k.symbol}</span>
            <span className="text-xs font-mono font-bold text-muted-foreground">{k.digit}</span>
          </div>
        ))}
      </div>
      <motion.div key={trialNum} initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} className="relative w-24 h-24 flex items-center justify-center rounded-2xl border-2 border-border bg-muted/20">
        <span className="text-5xl">{currentSymbol}</span>
        {feedback && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute -top-3 -right-3">
            {feedback === 'correct' ? <CheckCircle className="w-7 h-7 text-green-500" /> : <XCircle className="w-7 h-7 text-red-500" />}
          </motion.div>
        )}
      </motion.div>
      <div className="grid grid-cols-5 gap-2 max-w-xs">
        {Array.from({ length: keySize }, (_, i) => i + 1).map(d => (
          <Button key={d} variant="outline" className="h-12 w-12 text-lg font-bold" onClick={() => handleAnswer(d)} disabled={!!feedback}>
            {d}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default SymbolDigitGame;
