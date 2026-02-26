import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Shuffle, CheckCircle, XCircle } from 'lucide-react';

interface TaskSwitchGameProps {
  onScoreChange: (score: number) => void;
  onGameEnd: () => void;
  difficulty?: 'easy' | 'medium' | 'hard';
}

type Rule = 'parity' | 'magnitude';

const TaskSwitchGame = ({ onScoreChange, onGameEnd, difficulty = 'medium' }: TaskSwitchGameProps) => {
  const totalTrials = difficulty === 'easy' ? 20 : difficulty === 'medium' ? 30 : 40;
  const switchRate = difficulty === 'easy' ? 0.25 : difficulty === 'medium' ? 0.4 : 0.55;

  const [started, setStarted] = useState(false);
  const [number, setNumber] = useState(0);
  const [rule, setRule] = useState<Rule>('parity');
  const [trialNum, setTrialNum] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [isSwitch, setIsSwitch] = useState(false);
  const trialStart = useRef(0);

  const generateTrial = (prevRule: Rule) => {
    const shouldSwitch = Math.random() < switchRate;
    const newRule: Rule = shouldSwitch ? (prevRule === 'parity' ? 'magnitude' : 'parity') : prevRule;
    const num = Math.floor(Math.random() * 9) + 1; // 1-9
    return { number: num, rule: newRule, isSwitch: shouldSwitch };
  };

  const startGame = () => {
    const t = generateTrial('parity');
    setNumber(t.number);
    setRule(t.rule);
    setIsSwitch(false);
    setTrialNum(0);
    setScore(0);
    setStarted(true);
    trialStart.current = performance.now();
  };

  const handleAnswer = (answer: 'left' | 'right') => {
    const rt = performance.now() - trialStart.current;
    let correct = false;

    if (rule === 'parity') {
      // Left = Even, Right = Odd
      correct = answer === 'left' ? number % 2 === 0 : number % 2 !== 0;
    } else {
      // Left = < 5, Right = > 5
      correct = answer === 'left' ? number < 5 : number > 5;
    }

    // number === 5 in magnitude: always wrong (edge case), skip
    if (rule === 'magnitude' && number === 5) correct = true; // neutral

    if (correct) {
      const rtBonus = Math.max(0, Math.round((1500 - rt) / 100));
      const switchBonus = isSwitch ? 10 : 0;
      const pts = 10 + rtBonus + switchBonus;
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
      if (next >= totalTrials) {
        onGameEnd();
        return;
      }
      const t = generateTrial(rule);
      setNumber(t.number);
      setRule(t.rule);
      setIsSwitch(t.isSwitch);
      setFeedback(null);
      trialStart.current = performance.now();
    }, 400);
  };

  if (!started) {
    return (
      <div className="text-center space-y-4 py-8">
        <Shuffle className="w-16 h-16 mx-auto text-primary" />
        <h2 className="text-2xl font-bold">Task Switch</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          The rule alternates between <strong>Odd/Even</strong> and <strong>Low/High</strong> (vs 5). Follow the active rule and respond as fast as you can!
        </p>
        <Button onClick={startGame} size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">Start</Button>
      </div>
    );
  }

  const progress = Math.round((trialNum / totalTrials) * 100);

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="w-full bg-muted rounded-full h-2">
        <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
      </div>

      <div className="text-xs text-muted-foreground">
        Trial {trialNum + 1} / {totalTrials} {isSwitch && '· 🔀 Switch!'}
      </div>

      {/* Rule indicator */}
      <div className={`px-4 py-2 rounded-lg text-sm font-semibold border-2 ${rule === 'parity' ? 'border-blue-500 text-blue-400 bg-blue-500/10' : 'border-amber-500 text-amber-400 bg-amber-500/10'}`}>
        {rule === 'parity' ? '⚡ ODD or EVEN?' : '📏 LOW (< 5) or HIGH (> 5)?'}
      </div>

      {/* Stimulus */}
      <motion.div
        key={`${trialNum}-${number}`}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-28 h-28 flex items-center justify-center rounded-2xl border-2 border-border bg-muted/30"
      >
        <span className="text-5xl font-bold text-foreground">{number}</span>
        {feedback && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute -top-3 -right-3">
            {feedback === 'correct' ? <CheckCircle className="w-7 h-7 text-green-500" /> : <XCircle className="w-7 h-7 text-red-500" />}
          </motion.div>
        )}
      </motion.div>

      {/* Response buttons */}
      <div className="flex gap-4 w-full max-w-sm">
        <Button size="lg" variant="outline" className="flex-1 h-14" onClick={() => handleAnswer('left')}>
          {rule === 'parity' ? 'Even' : 'Low (< 5)'}
        </Button>
        <Button size="lg" variant="outline" className="flex-1 h-14" onClick={() => handleAnswer('right')}>
          {rule === 'parity' ? 'Odd' : 'High (> 5)'}
        </Button>
      </div>
    </div>
  );
};

export default TaskSwitchGame;
