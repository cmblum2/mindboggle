import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Search, CheckCircle, XCircle } from 'lucide-react';

interface VisualSearchGameProps {
  onScoreChange: (score: number) => void;
  onGameEnd: () => void;
  difficulty?: 'easy' | 'medium' | 'hard';
  onTrialComplete?: (trial: { correct: boolean; rtMs: number; stimulus: string; response: string; difficulty: number }) => void;
}

interface SearchItem {
  id: number;
  shape: string;
  color: string;
  rotation: number;
  isTarget: boolean;
  x: number;
  y: number;
}

const SHAPES = ['▲', '■', '●', '◆', '★'];
const ITEM_COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#a855f7'];

const VisualSearchGame = ({ onScoreChange, onGameEnd, difficulty = 'medium', onTrialComplete }: VisualSearchGameProps) => {
  const totalTrials = difficulty === 'easy' ? 12 : difficulty === 'medium' ? 18 : 24;
  const baseSetSize = difficulty === 'easy' ? 8 : difficulty === 'medium' ? 16 : 24;
  const difficultyNum = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3;

  const [started, setStarted] = useState(false);
  const [items, setItems] = useState<SearchItem[]>([]);
  const [targetShape, setTargetShape] = useState('');
  const [targetColor, setTargetColor] = useState('');
  const [trialNum, setTrialNum] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [hasTarget, setHasTarget] = useState(true);
  const trialStart = useRef(0);

  const generateTrial = () => {
    const tShape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    const tColor = ITEM_COLORS[Math.floor(Math.random() * ITEM_COLORS.length)];
    const targetPresent = Math.random() < 0.6;
    const setSize = baseSetSize + Math.floor(Math.random() * 4);
    const newItems: SearchItem[] = [];
    const positions = new Set<string>();

    const getPos = () => {
      let x, y, key;
      do { x = Math.floor(Math.random() * 90) + 5; y = Math.floor(Math.random() * 85) + 5; key = `${Math.round(x / 8)}-${Math.round(y / 8)}`; } while (positions.has(key));
      positions.add(key);
      return { x, y };
    };

    for (let i = 0; i < setSize; i++) {
      let shape, color;
      do { shape = SHAPES[Math.floor(Math.random() * SHAPES.length)]; color = ITEM_COLORS[Math.floor(Math.random() * ITEM_COLORS.length)]; } while (shape === tShape && color === tColor);
      const pos = getPos();
      newItems.push({ id: i, shape, color, rotation: Math.floor(Math.random() * 360), isTarget: false, x: pos.x, y: pos.y });
    }

    if (targetPresent) {
      const pos = getPos();
      newItems.push({ id: setSize, shape: tShape, color: tColor, rotation: 0, isTarget: true, x: pos.x, y: pos.y });
    }

    setTargetShape(tShape);
    setTargetColor(tColor);
    setHasTarget(targetPresent);
    setItems(newItems.sort(() => Math.random() - 0.5));
    setFeedback(null);
    trialStart.current = performance.now();
  };

  const startGame = () => {
    setStarted(true);
    setTrialNum(0);
    setScore(0);
    generateTrial();
  };

  const handleItemClick = (item: SearchItem) => {
    if (feedback) return;
    const rt = performance.now() - trialStart.current;
    const correct = item.isTarget;

    onTrialComplete?.({
      correct,
      rtMs: rt,
      stimulus: `${targetShape}_${targetColor}_setSize:${items.length}`,
      response: correct ? 'found_target' : 'wrong_item',
      difficulty: difficultyNum,
    });

    if (correct) {
      const rtBonus = Math.max(0, Math.round((3000 - rt) / 150));
      const pts = 15 + rtBonus;
      const newScore = score + pts;
      setScore(newScore);
      onScoreChange(newScore);
      setFeedback('correct');
    } else {
      setFeedback('wrong');
    }
    advance();
  };

  const handleAbsent = () => {
    if (feedback) return;
    const rt = performance.now() - trialStart.current;
    const correct = !hasTarget;

    onTrialComplete?.({
      correct,
      rtMs: rt,
      stimulus: `${targetShape}_${targetColor}_setSize:${items.length}_absent`,
      response: 'not_present',
      difficulty: difficultyNum,
    });

    if (correct) {
      const rtBonus = Math.max(0, Math.round((4000 - rt) / 200));
      const pts = 15 + rtBonus;
      const newScore = score + pts;
      setScore(newScore);
      onScoreChange(newScore);
      setFeedback('correct');
    } else {
      setFeedback('wrong');
    }
    advance();
  };

  const advance = () => {
    const next = trialNum + 1;
    setTrialNum(next);
    setTimeout(() => {
      if (next >= totalTrials) { onGameEnd(); return; }
      generateTrial();
    }, 500);
  };

  if (!started) {
    return (
      <div className="text-center space-y-4 py-8">
        <Search className="w-16 h-16 mx-auto text-primary" />
        <h2 className="text-2xl font-bold">Visual Search</h2>
        <p className="text-muted-foreground max-w-md mx-auto">Find the target shape among distractors as quickly as possible. If the target is absent, click "Not Present."</p>
        <Button onClick={startGame} size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">Start</Button>
      </div>
    );
  }

  const progress = Math.round((trialNum / totalTrials) * 100);

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="w-full bg-muted rounded-full h-2">
        <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
      </div>
      <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-muted/50 border border-border">
        <span className="text-sm text-muted-foreground">Find:</span>
        <span className="text-3xl" style={{ color: targetColor }}>{targetShape}</span>
      </div>
      <div className="relative w-full aspect-square max-w-md rounded-xl border-2 border-border bg-muted/10 overflow-hidden">
        {items.map(item => (
          <motion.button key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute text-xl cursor-pointer hover:scale-125 transition-transform"
            style={{ left: `${item.x}%`, top: `${item.y}%`, color: item.color, transform: `rotate(${item.rotation}deg)` }}
            onClick={() => handleItemClick(item)}>
            {item.shape}
          </motion.button>
        ))}
        {feedback && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 flex items-center justify-center bg-background/50">
            {feedback === 'correct' ? <CheckCircle className="w-16 h-16 text-green-500" /> : <XCircle className="w-16 h-16 text-red-500" />}
          </motion.div>
        )}
      </div>
      <Button variant="outline" onClick={handleAbsent} disabled={!!feedback}>Not Present</Button>
    </div>
  );
};

export default VisualSearchGame;
