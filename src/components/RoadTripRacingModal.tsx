import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Play, RotateCcw, Trophy, Heart, Sparkles, Fuel, Shield, Award, ChevronLeft, ChevronRight, Volume2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { formatNumber } from '../utils/formatters';
import { playCoinSound, playFanfare, playHeartSound, playTapSound } from '../utils/audio';
import { TravelCity } from '../types';
import { coupleAvatar } from '../assets/avatars';

export interface RoadTripRacingModalProps {
  isOpen: boolean;
  onClose: () => void;
  soundEnabled: boolean;
  travelCities: TravelCity[];
  onCompleteRace: (cityId: string, earnedLove: number, earnedCoins: number, daysAdvance: number) => void;
}

interface Obstacle {
  id: string;
  lane: number; // 0, 1, 2
  y: number; // percentage down the road (0 to 100)
  type: 'cone' | 'pothole' | 'truck' | 'sign';
  icon: string;
}

interface Collectible {
  id: string;
  lane: number; // 0, 1, 2
  y: number; // percentage down the road (0 to 100)
  type: 'heart' | 'fuel' | 'coin' | 'coffee';
  icon: string;
}

export const RoadTripRacingModal: React.FC<RoadTripRacingModalProps> = ({
  isOpen,
  onClose,
  soundEnabled,
  travelCities,
  onCompleteRace,
}) => {
  const [selectedCityId, setSelectedCityId] = useState<string>(travelCities[0]?.id || 'ekb');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playerLane, setPlayerLane] = useState<number>(1); // 0 = left, 1 = mid, 2 = right
  const [distanceRemaining, setDistanceRemaining] = useState<number>(1000);
  const [fuel, setFuel] = useState<number>(100);
  const [scoreLove, setScoreLove] = useState<number>(0);
  const [scoreCoins, setScoreCoins] = useState<number>(0);
  const [hasShield, setHasShield] = useState<boolean>(false);
  const [gameResult, setGameResult] = useState<'playing' | 'won' | 'crashed'>('playing');

  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [collectibles, setCollectibles] = useState<Collectible[]>([]);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);

  const requestRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number>(Date.now());
  const spawnTimerRef = useRef<number>(0);
  const roadOffsetRef = useRef<number>(0);
  const [roadVisualOffset, setRoadVisualOffset] = useState<number>(0);

  const selectedCity = travelCities.find((c) => c.id === selectedCityId) || travelCities[0];

  const startGame = (cityId: string) => {
    setSelectedCityId(cityId);
    setPlayerLane(1);
    setDistanceRemaining(1000);
    setFuel(100);
    setScoreLove(0);
    setScoreCoins(0);
    setHasShield(false);
    setObstacles([]);
    setCollectibles([]);
    setGameResult('playing');
    setSpeedMultiplier(1);
    lastFrameTimeRef.current = Date.now();
    spawnTimerRef.current = 0;
    setIsPlaying(true);
    if (soundEnabled) playTapSound();
  };

  const moveLane = useCallback((direction: 'left' | 'right') => {
    setPlayerLane((prev) => {
      if (direction === 'left') return Math.max(0, prev - 1);
      return Math.min(2, prev + 1);
    });
    if (soundEnabled) playTapSound();
  }, [soundEnabled]);

  // Keyboard navigation
  useEffect(() => {
    if (!isPlaying || gameResult !== 'playing') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        moveLane('left');
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        moveLane('right');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, gameResult, moveLane]);

  // Game loop
  useEffect(() => {
    if (!isPlaying || gameResult !== 'playing') {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      return;
    }

    const loop = () => {
      const now = Date.now();
      const dt = Math.min(0.1, (now - lastFrameTimeRef.current) / 1000);
      lastFrameTimeRef.current = now;

      const currentSpeed = 38 * speedMultiplier; // % per second downward
      const distTraveled = currentSpeed * dt * 2.2;

      // Update road markings visual scroll
      roadOffsetRef.current = (roadOffsetRef.current + currentSpeed * dt * 1.5) % 100;
      setRoadVisualOffset(roadOffsetRef.current);

      // Decrease distance
      setDistanceRemaining((prev) => {
        const next = Math.max(0, prev - distTraveled);
        if (next <= 0) {
          // Win condition!
          setGameResult('won');
          if (soundEnabled) playFanfare();
          confetti({
            particleCount: 120,
            spread: 90,
            origin: { y: 0.6 },
            colors: ['#D48166', '#E6AF2E', '#4A6B82'],
          });
          const totalEarnedLove = selectedCity.loveReward + scoreLove;
          const totalEarnedCoins = 25000 + scoreCoins;
          onCompleteRace(selectedCity.id, totalEarnedLove, totalEarnedCoins, 15);
        }
        return next;
      });

      // Passive fuel burn
      setFuel((prev) => {
        const next = Math.max(0, prev - dt * 2.2);
        if (next <= 0) {
          setGameResult('crashed');
        }
        return next;
      });

      // Spawning obstacles & collectibles
      spawnTimerRef.current += dt;
      if (spawnTimerRef.current > 0.85) {
        spawnTimerRef.current = 0;
        const randomLane = Math.floor(Math.random() * 3);
        const roll = Math.random();

        if (roll < 0.45) {
          // Spawn Obstacle
          const obsTypes: Obstacle['type'][] = ['cone', 'pothole', 'truck', 'sign'];
          const picked = obsTypes[Math.floor(Math.random() * obsTypes.length)];
          const icons = { cone: '🚧', pothole: '🕳️', truck: '🚚', sign: '⚠️' };
          setObstacles((prev) => [
            ...prev,
            {
              id: `${now}_${Math.random()}`,
              lane: randomLane,
              y: -10,
              type: picked,
              icon: icons[picked],
            },
          ]);
        } else {
          // Spawn Collectible
          const colTypes: Collectible['type'][] = ['heart', 'heart', 'fuel', 'coin', 'coffee'];
          const picked = colTypes[Math.floor(Math.random() * colTypes.length)];
          const icons = { heart: '❤️', fuel: '⛽', coin: '💰', coffee: '☕' };
          setCollectibles((prev) => [
            ...prev,
            {
              id: `${now}_${Math.random()}`,
              lane: randomLane,
              y: -10,
              type: picked,
              icon: icons[picked],
            },
          ]);
        }
      }

      // Move and check collisions for Obstacles
      setObstacles((prev) => {
        const updated: Obstacle[] = [];
        prev.forEach((obs) => {
          const nextY = obs.y + currentSpeed * dt;
          // Collision box: player car sits at y: 80% with size ~12%
          const isColliding = obs.lane === playerLane && nextY >= 72 && nextY <= 86;

          if (isColliding) {
            if (hasShield) {
              setHasShield(false);
              if (soundEnabled) playCoinSound();
            } else {
              setFuel((f) => {
                const nextFuel = Math.max(0, f - 24);
                if (nextFuel <= 0) setGameResult('crashed');
                return nextFuel;
              });
              if (soundEnabled) playTapSound();
            }
          } else if (nextY < 105) {
            updated.push({ ...obs, y: nextY });
          }
        });
        return updated;
      });

      // Move and check collisions for Collectibles
      setCollectibles((prev) => {
        const updated: Collectible[] = [];
        prev.forEach((col) => {
          const nextY = col.y + currentSpeed * dt;
          const isColliding = col.lane === playerLane && nextY >= 72 && nextY <= 86;

          if (isColliding) {
            if (col.type === 'heart') {
              setScoreLove((s) => s + 200);
              if (soundEnabled) playHeartSound();
            } else if (col.type === 'fuel') {
              setFuel((f) => Math.min(100, f + 25));
              if (soundEnabled) playCoinSound();
            } else if (col.type === 'coin') {
              setScoreCoins((c) => c + 400);
              if (soundEnabled) playCoinSound();
            } else if (col.type === 'coffee') {
              setHasShield(true);
              setSpeedMultiplier(1.3);
              setTimeout(() => setSpeedMultiplier(1), 3500);
              if (soundEnabled) playFanfare();
            }
          } else if (nextY < 105) {
            updated.push({ ...col, y: nextY });
          }
        });
        return updated;
      });

      requestRef.current = requestAnimationFrame(loop);
    };

    requestRef.current = requestAnimationFrame(loop);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying, gameResult, playerLane, hasShield, speedMultiplier, soundEnabled, selectedCity, scoreLove, scoreCoins, onCompleteRace]);

  if (!isOpen) return null;

  const lanePositions = ['left-[17%]', 'left-[50%]', 'left-[83%]'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        className="w-full max-w-lg bg-white border-2 border-[#D48166] rounded-3xl p-4 sm:p-6 shadow-2xl relative text-[#3D3D3D] my-4"
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
          <div className="w-12 h-12 rounded-2xl bg-[#D48166]/15 text-[#D48166] border border-[#D48166]/30 flex items-center justify-center text-2xl shadow-xs">
            🚗
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase font-bold text-[#D48166] tracking-wider">
                Мини-игра: Авто-путешествие
              </span>
              <span className="text-xs bg-[#D48166]/10 text-[#D48166] font-semibold px-2 py-0.5 rounded-full font-mono">
                Гонки
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-[#3D3D3D]">
              {isPlaying ? `Трасса в ${selectedCity.name}` : 'Выбор маршрута поездки'}
            </h2>
          </div>
        </div>

        {!isPlaying ? (
          /* City Route Selector */
          <div className="space-y-4">
            <p className="text-xs text-[#7A756B]">
              Отправляйтесь в романтическую поездку на машине по живописным дорогам! Уворачивайтесь от ям, конусов и грузовиков, собирайте сердечки и бензин, чтобы добраться до города!
            </p>

            <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
              {travelCities.map((city) => {
                const isSelected = city.id === selectedCityId;
                return (
                  <button
                    key={city.id}
                    onClick={() => setSelectedCityId(city.id)}
                    className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between gap-3 cursor-pointer ${
                      isSelected
                        ? 'border-[#D48166] bg-[#D48166]/10 ring-2 ring-[#D48166]/30'
                        : 'border-[#E5E1D8] bg-[#FDFBF7] hover:border-[#D48166]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-white border border-[#E5E1D8] flex items-center justify-center text-xl shrink-0 shadow-xs">
                        {city.souvenirIcon}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-[#3D3D3D]">{city.name}</div>
                        <div className="text-[11px] text-[#7A756B] line-clamp-1">{city.quote}</div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-mono font-bold text-[#D48166] flex items-center gap-1 justify-end">
                        <Heart className="w-3.5 h-3.5 fill-[#D48166]" /> +{formatNumber(city.loveReward)}
                      </div>
                      <div className="text-[10px] text-[#7A756B]">Дистанция: 1000 м</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Start Race Button */}
            <button
              onClick={() => startGame(selectedCityId)}
              className="w-full py-3 rounded-2xl bg-[#D48166] hover:bg-[#C27056] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer transition-transform active:scale-98"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Поехать в {selectedCity.name}!</span>
            </button>
          </div>
        ) : (
          /* Racing Highway Board */
          <div className="space-y-3">
            {/* Live Stats */}
            <div className="grid grid-cols-3 gap-2 bg-[#FDFBF7] p-2.5 rounded-2xl border border-[#E5E1D8] text-center text-xs">
              <div>
                <div className="text-[10px] uppercase font-bold text-[#7A756B] flex items-center justify-center gap-1">
                  <Fuel className="w-3 h-3 text-amber-500" /> Бензин
                </div>
                <div className={`font-mono font-bold text-sm ${fuel <= 25 ? 'text-red-500 animate-pulse' : 'text-[#3D3D3D]'}`}>
                  {Math.round(fuel)}%
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-[#7A756B]">До города</div>
                <div className="font-mono font-bold text-sm text-[#4A6B82]">
                  {Math.round(distanceRemaining)} м
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-[#7A756B]">Любовь ❤️</div>
                <div className="font-mono font-bold text-sm text-[#D48166]">
                  +{formatNumber(scoreLove)}
                </div>
              </div>
            </div>

            {/* Road Canvas Simulation */}
            <div className="relative mx-auto w-full max-w-[340px] sm:max-w-[360px] h-[350px] bg-[#393E46] rounded-3xl overflow-hidden border-4 border-[#222831] shadow-2xl select-none">
              {/* Road Side Curbs */}
              <div className="absolute top-0 bottom-0 left-0 w-3.5 bg-[#4E9F3D] border-r-2 border-dashed border-white/40" />
              <div className="absolute top-0 bottom-0 right-0 w-3.5 bg-[#4E9F3D] border-l-2 border-dashed border-white/40" />

              {/* Lane Divider 1 (between lane 0 and 1) */}
              <div
                className="absolute top-0 bottom-0 left-[33%] w-1 border-r-2 border-dashed border-white/40"
                style={{ backgroundPositionY: `${roadVisualOffset}%` }}
              />
              {/* Lane Divider 2 (between lane 1 and 2) */}
              <div
                className="absolute top-0 bottom-0 left-[67%] w-1 border-r-2 border-dashed border-white/40"
                style={{ backgroundPositionY: `${roadVisualOffset}%` }}
              />

              {/* Lane Tap Zones for Mobile */}
              <div
                onClick={() => setPlayerLane(0)}
                className="absolute top-0 bottom-0 left-0 w-[33%] cursor-pointer z-10"
              />
              <div
                onClick={() => setPlayerLane(1)}
                className="absolute top-0 bottom-0 left-[33%] w-[34%] cursor-pointer z-10"
              />
              <div
                onClick={() => setPlayerLane(2)}
                className="absolute top-0 bottom-0 left-[67%] w-[33%] cursor-pointer z-10"
              />

              {/* Obstacles */}
              {obstacles.map((obs) => (
                <div
                  key={obs.id}
                  className={`absolute -translate-x-1/2 text-2xl transition-transform ${lanePositions[obs.lane]}`}
                  style={{ top: `${obs.y}%` }}
                >
                  {obs.icon}
                </div>
              ))}

              {/* Collectibles */}
              {collectibles.map((col) => (
                <div
                  key={col.id}
                  className={`absolute -translate-x-1/2 text-2xl animate-pulse ${lanePositions[col.lane]}`}
                  style={{ top: `${col.y}%` }}
                >
                  {col.icon}
                </div>
              ))}

              {/* Player Road Trip Car */}
              <motion.div
                animate={{ x: 0 }}
                className={`absolute bottom-6 -translate-x-1/2 flex flex-col items-center transition-all duration-150 z-20 ${lanePositions[playerLane]}`}
              >
                {/* Shield Aura */}
                {hasShield && (
                  <div className="absolute -inset-2 rounded-full border-2 border-cyan-400 bg-cyan-400/20 animate-ping" />
                )}

                {/* Couple Mini Portrait in Car */}
                <div className="w-8 h-8 rounded-full border-2 border-white shadow-md overflow-hidden bg-white mb-0.5 -mt-2">
                  <img
                    src={coupleAvatar}
                    alt="Коля и Катя"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Car Sprite */}
                <div className="text-3xl filter drop-shadow-md">
                  🏎️
                </div>
              </motion.div>

              {/* Victory Screen Overlay */}
              <AnimatePresence>
                {gameResult === 'won' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute inset-0 bg-white/95 rounded-2xl flex flex-col items-center justify-center p-4 text-center z-30"
                  >
                    <div className="text-4xl animate-bounce mb-1">🎉</div>
                    <div className="text-xs uppercase font-extrabold text-[#D48166] tracking-wider">
                      Приехали в {selectedCity.name}!
                    </div>
                    <h3 className="text-base font-extrabold text-[#3D3D3D] mt-0.5">
                      Отличная поездка вдвоем!
                    </h3>
                    <p className="text-xs text-[#7A756B] max-w-xs mt-1 mb-2">
                      Дорога пройдена без происшествий. Получен сувенир: {selectedCity.souvenirIcon} {selectedCity.souvenirName}!
                    </p>

                    <div className="text-xs font-mono font-bold bg-[#D48166]/10 text-[#D48166] px-3 py-1.5 rounded-xl border border-[#D48166]/20 mb-3">
                      Награда: +{formatNumber(selectedCity.loveReward + scoreLove)} ❤️ & +15 дней!
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsPlaying(false)}
                        className="px-4 py-2 rounded-xl bg-[#F0EDE6] hover:bg-[#E5E1D8] text-[#3D3D3D] text-xs font-bold cursor-pointer"
                      >
                        Список маршрутов
                      </button>
                      <button
                        onClick={() => startGame(selectedCityId)}
                        className="px-4 py-2 rounded-xl bg-[#D48166] hover:bg-[#C27056] text-white text-xs font-bold cursor-pointer flex items-center gap-1"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Поехать снова</span>
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Crash / Empty Fuel Overlay */}
                {gameResult === 'crashed' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute inset-0 bg-white/95 rounded-2xl flex flex-col items-center justify-center p-4 text-center z-30"
                  >
                    <div className="text-4xl mb-1">⛽</div>
                    <div className="text-xs uppercase font-extrabold text-rose-600 tracking-wider">
                      Бензин закончился!
                    </div>
                    <h3 className="text-base font-extrabold text-[#3D3D3D] mt-0.5">
                      Остановка на обочине
                    </h3>
                    <p className="text-xs text-[#7A756B] max-w-xs mt-1 mb-3">
                      Не удалось доехать до заправки. Собирайте канистры с бензином ⛽ и объезжайте ямы на дороге!
                    </p>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsPlaying(false)}
                        className="px-4 py-2 rounded-xl bg-[#F0EDE6] hover:bg-[#E5E1D8] text-[#3D3D3D] text-xs font-bold cursor-pointer"
                      >
                        Выбрать маршрут
                      </button>
                      <button
                        onClick={() => startGame(selectedCityId)}
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

            {/* Mobile / Screen Lane Controls */}
            <div className="flex items-center justify-between gap-3 pt-1">
              <button
                onClick={() => moveLane('left')}
                className="flex-1 py-2.5 rounded-xl bg-[#F0EDE6] hover:bg-[#E5E1D8] text-[#3D3D3D] font-bold text-xs flex items-center justify-center gap-1 cursor-pointer active:scale-95 transition-transform"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Влево (A)</span>
              </button>
              <button
                onClick={() => moveLane('right')}
                className="flex-1 py-2.5 rounded-xl bg-[#F0EDE6] hover:bg-[#E5E1D8] text-[#3D3D3D] font-bold text-xs flex items-center justify-center gap-1 cursor-pointer active:scale-95 transition-transform"
              >
                <span>Вправо (D)</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
