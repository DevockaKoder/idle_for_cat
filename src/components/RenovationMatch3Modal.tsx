import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Trophy, Star, RotateCcw, Play, CheckCircle2, ChevronRight, Volume2, Hammer } from 'lucide-react';
import confetti from 'canvas-confetti';
import { formatNumber } from '../utils/formatters';
import { playCoinSound, playFanfare, playTapSound } from '../utils/audio';

export interface RenovationMatch3ModalProps {
  isOpen: boolean;
  onClose: () => void;
  soundEnabled: boolean;
  currentUnlockedLevel: number;
  starsMap: Record<number, number>;
  onCompleteLevel: (level: number, stars: number, rewardCoins: number, rewardDays: number) => void;
}

interface TileItem {
  id: string;
  type: string;
  icon: string;
  isSpecial?: boolean;
}

interface LevelConfig {
  level: number;
  title: string;
  subtitle: string;
  description: string;
  maxMoves: number;
  targets: Record<string, number>; // type -> required count
  targetScore: number;
  rewardCoins: number;
  rewardDays: number;
}

const TILE_TYPES = [
  { type: 'toilet', icon: '🚽', name: 'Сантехника' },
  { type: 'tape', icon: '🩹', name: 'Скотч/лента' },
  { type: 'bulb', icon: '💡', name: 'Лампочка' },
  { type: 'hammer', icon: '🔨', name: 'Молоток' },
  { type: 'saw', icon: '🪚', name: 'Пила' },
  { type: 'paint', icon: '🎨', name: 'Краска' },
  { type: 'brick', icon: '🧱', name: 'Кирпич/плитка' },
];

const RENOVATION_LEVELS: LevelConfig[] = [
  {
    level: 1,
    title: 'Ур. 1: План и разметка',
    subtitle: 'Начало пути',
    description: 'Размечаем розетки, выключатели и штробы в будущей квартире',
    maxMoves: 16,
    targets: { bulb: 12, tape: 10 },
    targetScore: 1500,
    rewardCoins: 25000,
    rewardDays: 10,
  },
  {
    level: 2,
    title: 'Ур. 2: Электрика и кабели',
    subtitle: 'Свет в каждый угол',
    description: 'Тянем негорючий провод к электрощитку и проверяем каждую группу',
    maxMoves: 16,
    targets: { bulb: 15 },
    targetScore: 2800,
    rewardCoins: 35000,
    rewardDays: 12,
  },
  {
    level: 3,
    title: 'Ур. 3: Сантехническая разводка',
    subtitle: 'Водоснабжение',
    description: 'Монтируем инсталляцию, коллекторный узел и трубы со скотчем/герметиком',
    maxMoves: 16,
    targets: { toilet: 12, tape: 12 },
    targetScore: 3200,
    rewardCoins: 45000,
    rewardDays: 14,
  },
  {
    level: 4,
    title: 'Ур. 4: Демонтаж и перегородки',
    subtitle: 'Стены и блоки',
    description: 'Сносим лишнее и возводим надежные стены из пазогребня и кирпича',
    maxMoves: 17,
    targets: { hammer: 15, brick: 14 },
    targetScore: 3600,
    rewardCoins: 60000,
    rewardDays: 15,
  },
  {
    level: 5,
    title: 'Ур. 5: Полусухая стяжка',
    subtitle: 'Идеальный горизонт',
    description: 'Заливаем идеально ровный пол по лазерному уровню',
    maxMoves: 16,
    targets: { brick: 18 },
    targetScore: 4000,
    rewardCoins: 75000,
    rewardDays: 16,
  },
  {
    level: 6,
    title: 'Ур. 6: Дверные короба и распил',
    subtitle: 'Столярные работы',
    description: 'Подгоняем двери скрытого монтажа и наличники в размер',
    maxMoves: 16,
    targets: { saw: 15, hammer: 14 },
    targetScore: 4200,
    rewardCoins: 90000,
    rewardDays: 18,
  },
  {
    level: 7,
    title: 'Ур. 7: Штукатурка по маякам',
    subtitle: 'Углы 90 градусов',
    description: 'Малярный скотч, шпатели и гладкие белые стены под прожектор',
    maxMoves: 15,
    targets: { paint: 16, tape: 14 },
    targetScore: 4500,
    rewardCoins: 110000,
    rewardDays: 20,
  },
  {
    level: 8,
    title: 'Ур. 8: Керамогранит в ванной',
    subtitle: 'Плитка и санузел',
    description: 'Запил углов под 45°, эпоксидная затирка и подвесной унитаз',
    maxMoves: 16,
    targets: { toilet: 15, brick: 16 },
    targetScore: 4800,
    rewardCoins: 130000,
    rewardDays: 22,
  },
  {
    level: 9,
    title: 'Ур. 9: Теневой плинтус & свет',
    subtitle: 'Дизайнерский свет',
    description: 'Монтируем трековые светильники, споты и парящие световые линии',
    maxMoves: 16,
    targets: { bulb: 18, saw: 14 },
    targetScore: 5200,
    rewardCoins: 160000,
    rewardDays: 24,
  },
  {
    level: 10,
    title: 'Ур. 10: Покраска стен в 2 слоя',
    subtitle: 'Уютный цвет дома',
    description: 'Колеруем любимый цвет вместе с любимой и красим спальню и гостиную',
    maxMoves: 17,
    targets: { paint: 20, tape: 16 },
    targetScore: 6000,
    rewardCoins: 200000,
    rewardDays: 26,
  },
  {
    level: 11,
    title: 'Ур. 11: Сборка кухни мечты',
    subtitle: 'Фасады и техника',
    description: 'Встраиваем посудомойку, духовку, стильный остров и мойку',
    maxMoves: 18,
    targets: { hammer: 18, saw: 16, bulb: 14 },
    targetScore: 6800,
    rewardCoins: 250000,
    rewardDays: 28,
  },
  {
    level: 12,
    title: 'Ур. 12: Финальный декор и новоселье!',
    subtitle: 'Наш уютный дом',
    description: 'Генеральная уборка, закупка подушек, пледа, дивана и ключи на брелоке!',
    maxMoves: 19,
    targets: { paint: 16, bulb: 16, toilet: 14 },
    targetScore: 8000,
    rewardCoins: 350000,
    rewardDays: 30,
  },
];

const GRID_SIZE = 7;

export const RenovationMatch3Modal: React.FC<RenovationMatch3ModalProps> = ({
  isOpen,
  onClose,
  soundEnabled,
  currentUnlockedLevel = 1,
  starsMap = {},
  onCompleteLevel,
}) => {
  const [selectedLevelNum, setSelectedLevelNum] = useState<number>(currentUnlockedLevel || 1);
  const [isInGame, setIsInGame] = useState<boolean>(false);
  const [grid, setGrid] = useState<TileItem[][]>([]);
  const [selectedTile, setSelectedTile] = useState<{ r: number; c: number } | null>(null);
  const [movesLeft, setMovesLeft] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [collected, setCollected] = useState<Record<string, number>>({});
  const [gameStateStatus, setGameStateStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  const activeLevel = RENOVATION_LEVELS.find((l) => l.level === selectedLevelNum) || RENOVATION_LEVELS[0];

  const getTileTypeRandom = useCallback((): { type: string; icon: string } => {
    const item = TILE_TYPES[Math.floor(Math.random() * TILE_TYPES.length)];
    return { type: item.type, icon: item.icon };
  }, []);

  // Initialize board with no pre-existing 3-matches
  const initBoard = useCallback(() => {
    const newGrid: TileItem[][] = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      newGrid[r] = [];
      for (let c = 0; c < GRID_SIZE; c++) {
        let valid = false;
        let choice = getTileTypeRandom();
        while (!valid) {
          choice = getTileTypeRandom();
          const matchH = c >= 2 && newGrid[r][c - 1].type === choice.type && newGrid[r][c - 2].type === choice.type;
          const matchV = r >= 2 && newGrid[r - 1][c].type === choice.type && newGrid[r - 2][c].type === choice.type;
          if (!matchH && !matchV) {
            valid = true;
          }
        }
        newGrid[r][c] = {
          id: `${r}_${c}_${Date.now()}_${Math.random()}`,
          type: choice.type,
          icon: choice.icon,
        };
      }
    }
    return newGrid;
  }, [getTileTypeRandom]);

  const startLevel = (lvlNum: number) => {
    setSelectedLevelNum(lvlNum);
    const lvl = RENOVATION_LEVELS.find((l) => l.level === lvlNum) || RENOVATION_LEVELS[0];
    setMovesLeft(lvl.maxMoves);
    setScore(0);
    setCollected({});
    setGameStateStatus('playing');
    setSelectedTile(null);
    setGrid(initBoard());
    setIsInGame(true);
    if (soundEnabled) playTapSound();
  };

  const playPopSound = () => {
    if (!soundEnabled) return;
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(450, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(750, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch {
      // ignore
    }
  };

  // Find all matches on the board
  const findMatches = (board: TileItem[][]) => {
    const matchedCoords = new Set<string>();

    // Horizontal check
    for (let r = 0; r < GRID_SIZE; r++) {
      let matchCount = 1;
      for (let c = 0; c < GRID_SIZE; c++) {
        const currentType = board[r][c]?.type;
        const nextType = c + 1 < GRID_SIZE ? board[r][c + 1]?.type : null;
        if (currentType && currentType === nextType) {
          matchCount++;
        } else {
          if (matchCount >= 3) {
            for (let k = 0; k < matchCount; k++) {
              matchedCoords.add(`${r},${c - k}`);
            }
          }
          matchCount = 1;
        }
      }
    }

    // Vertical check
    for (let c = 0; c < GRID_SIZE; c++) {
      let matchCount = 1;
      for (let r = 0; r < GRID_SIZE; r++) {
        const currentType = board[r][c]?.type;
        const nextType = r + 1 < GRID_SIZE ? board[r + 1][c]?.type : null;
        if (currentType && currentType === nextType) {
          matchCount++;
        } else {
          if (matchCount >= 3) {
            for (let k = 0; k < matchCount; k++) {
              matchedCoords.add(`${r - k},${c}`);
            }
          }
          matchCount = 1;
        }
      }
    }

    return Array.from(matchedCoords).map((coord) => {
      const [r, c] = coord.split(',').map(Number);
      return { r, c };
    });
  };

  // Check victory condition
  const checkVictory = (currentScore: number, currentCollected: Record<string, number>) => {
    if (currentScore < activeLevel.targetScore) return false;
    for (const [targetType, reqCount] of Object.entries(activeLevel.targets)) {
      if ((currentCollected[targetType] || 0) < reqCount) {
        return false;
      }
    }
    return true;
  };

  // Process cascades
  const processBoardMatches = useCallback(
    async (currentBoard: TileItem[][], extraScore = 0, currentCollectedMap = collected) => {
      setIsProcessing(true);
      let board = currentBoard.map((row) => [...row]);
      let totalGainedScore = extraScore;
      let newCollected = { ...currentCollectedMap };
      let hadMatches = true;
      let cascadeCount = 0;

      while (hadMatches) {
        const matches = findMatches(board);
        if (matches.length === 0) {
          hadMatches = false;
          break;
        }

        cascadeCount++;
        playPopSound();

        // Count collected items
        matches.forEach(({ r, c }) => {
          const item = board[r][c];
          if (item) {
            newCollected[item.type] = (newCollected[item.type] || 0) + 1;
          }
        });

        const points = matches.length * 50 * cascadeCount;
        totalGainedScore += points;

        // Clear matched tiles
        matches.forEach(({ r, c }) => {
          board[r][c] = null as unknown as TileItem;
        });

        // Drop tiles down
        for (let c = 0; c < GRID_SIZE; c++) {
          let writeIndex = GRID_SIZE - 1;
          for (let r = GRID_SIZE - 1; r >= 0; r--) {
            if (board[r][c] !== null) {
              board[writeIndex][c] = board[r][c];
              if (writeIndex !== r) {
                board[r][c] = null as unknown as TileItem;
              }
              writeIndex--;
            }
          }
          // Fill new from top
          for (let r = writeIndex; r >= 0; r--) {
            const fresh = getTileTypeRandom();
            board[r][c] = {
              id: `${r}_${c}_${Date.now()}_${Math.random()}`,
              type: fresh.type,
              icon: fresh.icon,
            };
          }
        }

        // Small delay to let cascades breathe
        await new Promise((res) => setTimeout(res, 180));
      }

      setGrid(board);
      setScore((prev) => prev + totalGainedScore);
      setCollected(newCollected);

      // Check win or lose
      const isWon = checkVictory(score + totalGainedScore, newCollected);
      if (isWon) {
        setGameStateStatus('won');
        if (soundEnabled) playFanfare();
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#4A6B82', '#D48166', '#E6AF2E'],
        });

        const stars = movesLeft >= 5 ? 3 : movesLeft >= 2 ? 2 : 1;
        onCompleteLevel(activeLevel.level, stars, activeLevel.rewardCoins, activeLevel.rewardDays);
      } else if (movesLeft <= 1) {
        setGameStateStatus('lost');
      }

      setIsProcessing(false);
    },
    [activeLevel, collected, getTileTypeRandom, movesLeft, score, soundEnabled, onCompleteLevel]
  );

  const handleTileClick = async (r: number, c: number) => {
    if (isProcessing || gameStateStatus !== 'playing') return;

    if (!selectedTile) {
      setSelectedTile({ r, c });
      if (soundEnabled) playTapSound();
      return;
    }

    const { r: r1, c: c1 } = selectedTile;
    setSelectedTile(null);

    // Check if clicked the same tile
    if (r1 === r && c1 === c) return;

    // Check if adjacent
    const isAdjacent = Math.abs(r1 - r) + Math.abs(c1 - c) === 1;
    if (!isAdjacent) {
      setSelectedTile({ r, c });
      if (soundEnabled) playTapSound();
      return;
    }

    // Try swap
    const testBoard = grid.map((row) => [...row]);
    const temp = testBoard[r1][c1];
    testBoard[r1][c1] = testBoard[r][c];
    testBoard[r][c] = temp;

    const matches = findMatches(testBoard);
    if (matches.length > 0) {
      // Valid move!
      setMovesLeft((prev) => Math.max(0, prev - 1));
      setGrid(testBoard);
      await processBoardMatches(testBoard);
    } else {
      // Invalid swap - slight bounce/tap feedback
      if (soundEnabled) playTapSound();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        className="w-full max-w-xl bg-white border-2 border-[#4A6B82] rounded-3xl p-4 sm:p-6 shadow-2xl relative text-[#3D3D3D] my-4"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#F0EDE6] hover:bg-[#E5E1D8] text-[#7A756B] flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-[#4A6B82]/15 text-[#4A6B82] border border-[#4A6B82]/30 flex items-center justify-center text-2xl shadow-xs">
            🛠️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase font-bold text-[#4A6B82] tracking-wider">
                Мини-игра: Ремонт квартиры
              </span>
              <span className="text-xs bg-[#4A6B82]/10 text-[#4A6B82] font-semibold px-2 py-0.5 rounded-full font-mono">
                3 в ряд
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-[#3D3D3D]">
              {isInGame ? activeLevel.title : 'Выбор этапа ремонта'}
            </h2>
          </div>
        </div>

        {!isInGame ? (
          /* Level Selector Screen */
          <div className="space-y-4">
            <p className="text-xs text-[#7A756B]">
              Пройдите все 12 непростых этапов ремонта нашей будущей совместной квартиры! Собирайте в ряд сантехнику, скотч, лампочки, кирпичи и краску, зарабатывайте монеты и ускоряйте ход времени!
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[60vh] overflow-y-auto pr-1">
              {RENOVATION_LEVELS.map((lvl) => {
                const isUnlocked = lvl.level <= (currentUnlockedLevel || 1);
                const stars = starsMap[lvl.level] || 0;
                const isSelected = lvl.level === selectedLevelNum;

                return (
                  <button
                    key={lvl.level}
                    onClick={() => isUnlocked && setSelectedLevelNum(lvl.level)}
                    disabled={!isUnlocked}
                    className={`p-3 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                      isSelected && isUnlocked
                        ? 'border-[#4A6B82] bg-[#4A6B82]/10 ring-2 ring-[#4A6B82]/30'
                        : isUnlocked
                        ? 'border-[#E5E1D8] bg-[#FDFBF7] hover:border-[#7B96AC]'
                        : 'border-[#E5E1D8] bg-[#F0EDE6] opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-[#4A6B82]">
                          Этап {lvl.level}
                        </span>
                        {isUnlocked ? (
                          <div className="flex text-xs">
                            {[1, 2, 3].map((s) => (
                              <Star
                                key={s}
                                className={`w-3 h-3 ${
                                  s <= stars ? 'fill-[#E6AF2E] text-[#E6AF2E]' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        ) : (
                          <span className="text-[10px] text-[#A39E93]">🔒</span>
                        )}
                      </div>
                      <div className="text-xs font-bold text-[#3D3D3D] mt-1 leading-snug line-clamp-1">
                        {lvl.title.replace(/^Ур\. \d+: /, '')}
                      </div>
                      <div className="text-[10px] text-[#7A756B] mt-0.5 line-clamp-1">
                        {lvl.subtitle}
                      </div>
                    </div>

                    <div className="mt-2 pt-2 border-t border-[#E5E1D8] flex items-center justify-between text-[10px] font-mono text-[#4A6B82] font-semibold">
                      <span>+{formatNumber(lvl.rewardCoins)} 💰</span>
                      <span>+{lvl.rewardDays} дн.</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selected Level Preview Card & Launch Button */}
            <div className="p-3.5 rounded-2xl bg-[#FDFBF7] border border-[#E5E1D8] flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-[#3D3D3D]">{activeLevel.title}</div>
                <div className="text-[11px] text-[#7A756B] mt-0.5">{activeLevel.description}</div>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-[#4A6B82] font-mono">
                  <span>Ходов: <strong>{activeLevel.maxMoves}</strong></span>
                  <span>Цель: <strong>{formatNumber(activeLevel.targetScore)} очков</strong></span>
                </div>
              </div>

              <button
                onClick={() => startLevel(selectedLevelNum)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#4A6B82] hover:bg-[#3D5A70] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-transform active:scale-95 shrink-0"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Начать ремонт</span>
              </button>
            </div>
          </div>
        ) : (
          /* Active Gameplay Screen */
          <div className="space-y-3">
            {/* Top Stats Bar */}
            <div className="grid grid-cols-3 gap-2 bg-[#FDFBF7] p-2.5 rounded-2xl border border-[#E5E1D8] text-center">
              <div>
                <div className="text-[10px] uppercase font-bold text-[#7A756B]">Ходов</div>
                <div className={`text-base font-black font-mono ${movesLeft <= 3 ? 'text-red-500 animate-pulse' : 'text-[#4A6B82]'}`}>
                  {movesLeft}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-[#7A756B]">Очки</div>
                <div className="text-base font-black font-mono text-[#3D3D3D]">
                  {formatNumber(score)} <span className="text-[10px] text-[#7A756B]">/ {formatNumber(activeLevel.targetScore)}</span>
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-[#7A756B]">Награда</div>
                <div className="text-xs font-bold text-[#D48166] font-mono">
                  +{formatNumber(activeLevel.rewardCoins)} 💰
                </div>
              </div>
            </div>

            {/* Level Targets Pill Row */}
            <div className="flex flex-wrap items-center justify-center gap-2 bg-[#F0EDE6]/70 p-2 rounded-xl border border-[#E5E1D8] text-xs">
              <span className="text-[11px] font-bold text-[#7A756B]">Цели ремонта:</span>
              {Object.entries(activeLevel.targets).map(([type, reqCount]) => {
                const current = collected[type] || 0;
                const isMet = current >= reqCount;
                const tileMeta = TILE_TYPES.find((t) => t.type === type);

                return (
                  <div
                    key={type}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border font-mono font-bold text-xs ${
                      isMet
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-white text-[#3D3D3D] border-[#E5E1D8]'
                    }`}
                  >
                    <span>{tileMeta?.icon}</span>
                    <span>{current}/{reqCount}</span>
                    {isMet && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                  </div>
                );
              })}
            </div>

            {/* Match-3 Board */}
            <div className="relative mx-auto w-full max-w-[340px] sm:max-w-[380px] aspect-square bg-[#EAE6DE] p-2 rounded-2xl border-2 border-[#D8D2C5] shadow-inner grid grid-cols-7 gap-1 select-none">
              {grid.map((row, r) =>
                row.map((tile, c) => {
                  const isSelected = selectedTile?.r === r && selectedTile?.c === c;
                  return (
                    <motion.button
                      key={tile ? tile.id : `empty_${r}_${c}`}
                      onClick={() => handleTileClick(r, c)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.9 }}
                      animate={isSelected ? { scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] } : {}}
                      transition={{ repeat: isSelected ? Infinity : 0, duration: 0.8 }}
                      className={`w-full h-full rounded-xl flex items-center justify-center text-xl sm:text-2xl shadow-xs transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-white border-2 border-[#4A6B82] shadow-md ring-2 ring-[#4A6B82]/40 z-10'
                          : 'bg-[#FDFBF7] border border-[#E5E1D8] hover:border-[#7B96AC]'
                      }`}
                    >
                      {tile?.icon}
                    </motion.button>
                  );
                })
              )}

              {/* Victory Overlay */}
              <AnimatePresence>
                {gameStateStatus === 'won' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute inset-0 bg-white/95 rounded-2xl flex flex-col items-center justify-center p-4 text-center z-20"
                  >
                    <div className="text-4xl animate-bounce mb-1">🎉</div>
                    <div className="text-xs uppercase font-extrabold text-emerald-600 tracking-wider">
                      Этап успешно завершен!
                    </div>
                    <h3 className="text-base font-extrabold text-[#3D3D3D] mt-0.5">
                      {activeLevel.title}
                    </h3>
                    <div className="flex items-center gap-1.5 my-2">
                      {[1, 2, 3].map((s) => (
                        <Star key={s} className="w-5 h-5 fill-[#E6AF2E] text-[#E6AF2E]" />
                      ))}
                    </div>
                    <div className="text-xs text-[#4A6B82] font-mono font-bold bg-[#4A6B82]/10 px-3 py-1.5 rounded-xl border border-[#4A6B82]/20 mb-3">
                      Награда: +{formatNumber(activeLevel.rewardCoins)} 💰 & +{activeLevel.rewardDays} дней!
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsInGame(false)}
                        className="px-4 py-2 rounded-xl bg-[#F0EDE6] hover:bg-[#E5E1D8] text-[#3D3D3D] text-xs font-bold cursor-pointer"
                      >
                        Список этапов
                      </button>
                      {selectedLevelNum < RENOVATION_LEVELS.length && (
                        <button
                          onClick={() => startLevel(selectedLevelNum + 1)}
                          className="px-4 py-2 rounded-xl bg-[#4A6B82] hover:bg-[#3D5A70] text-white text-xs font-bold cursor-pointer flex items-center gap-1"
                        >
                          <span>Следующий этап</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Defeat Overlay */}
                {gameStateStatus === 'lost' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute inset-0 bg-white/95 rounded-2xl flex flex-col items-center justify-center p-4 text-center z-20"
                  >
                    <div className="text-4xl mb-1">⚠️</div>
                    <div className="text-xs uppercase font-extrabold text-rose-600 tracking-wider">
                      Ходы закончились!
                    </div>
                    <h3 className="text-base font-extrabold text-[#3D3D3D] mt-0.5">
                      Материалы израсходованы
                    </h3>
                    <p className="text-xs text-[#7A756B] max-w-xs mt-1 mb-3">
                      Не хватило буквально пары ходов. В ремонте главное — терпение и аккуратный расчет!
                    </p>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsInGame(false)}
                        className="px-4 py-2 rounded-xl bg-[#F0EDE6] hover:bg-[#E5E1D8] text-[#3D3D3D] text-xs font-bold cursor-pointer"
                      >
                        Список этапов
                      </button>
                      <button
                        onClick={() => startLevel(selectedLevelNum)}
                        className="px-4 py-2 rounded-xl bg-[#D48166] hover:bg-[#C27056] text-white text-xs font-bold cursor-pointer flex items-center gap-1"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Попробовать снова</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* In-game Bottom Bar */}
            <div className="flex items-center justify-between pt-1 text-xs">
              <button
                onClick={() => setIsInGame(false)}
                className="text-[#7A756B] hover:text-[#3D3D3D] font-semibold cursor-pointer"
              >
                ← Вернуться к списку
              </button>
              <button
                onClick={() => startLevel(selectedLevelNum)}
                className="text-[#4A6B82] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" /> Перезапустить этап
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
