/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameState, UpgradeItem, LoveActivity, TravelCity, GiftItem, FloatingText } from './types';
import {
  UPGRADES_CATALOG,
  LOVE_ACTIVITIES_CATALOG,
  TRAVEL_CITIES,
  GIFTS_CATALOG,
  MEMORY_MILESTONES,
  MOVIE_GENRES,
  MOVIE_SNACKS,
  INITIAL_ENERGY,
  INITIAL_MAX_ENERGY,
} from './data/gameData';
import { formatNumber, getDaysTogether, formatAgeFromDays, getCalendarDate, MEETING_DAY, PAUSE_DAY } from './utils/formatters';
import {
  playTapSound,
  playKissSound,
  playHeartSound,
  playLevelUpSound,
  playFanfare,
  playCameraShutter,
  playTimeStepSound,
  startBackgroundMusic,
  stopBackgroundMusic,
} from './utils/audio';

import { HeaderStatus } from './components/HeaderStatus';
import { CharacterStage } from './components/CharacterStage';
import { LifeCareerTab } from './components/LifeCareerTab';
import { LoveActivitiesTab } from './components/LoveActivitiesTab';
import { TravelTab } from './components/TravelTab';
import { MemoryTimelineTab } from './components/MemoryTimelineTab';
import { MovieNightModal } from './components/MovieNightModal';
import { Pause2026Modal } from './components/Pause2026Modal';
import { MeetingCutscene } from './components/MeetingCutscene';

import { Briefcase, Heart, Plane, BookOpen } from 'lucide-react';
import confetti from 'canvas-confetti';

const STORAGE_KEY = 'love_story_idle_game_save_v7';

const DEFAULT_STATE: GameState = {
  totalDays: 0,
  simSpeed: 1,
  isPaused2026: 0,
  hasMetHer: false,
  hasStartedTogether: false,
  gameStartTimeStamp: Date.now(),
  lastSaveTimestamp: Date.now(),

  energy: INITIAL_ENERGY,
  maxEnergy: INITIAL_MAX_ENERGY,
  coins: 0,
  lovePoints: 0,
  totalKisses: 0,
  totalGiftsGiven: 0,
  totalTripsCompleted: 0,
  totalMoviesWatched: 0,

  energyPerSec: 1,
  coinsPerSec: 0,
  lovePerSec: 0,
  clickPower: 1,
  loveMultiplier: 1.0,
  comboStreak: 1,
  daysPerClick: 1,
  daysPerSec: 0.2,
  isAfk: false,
  expensePerSec: 0,

  upgrades: {},
  activities: {},
  unlockedCities: [],
  cityVisits: {},
  unlockedGifts: [],
  unlockedMemories: ['birth'],

  currentCityTrip: null,
  activeMovie: null,

  soundEnabled: true,
  musicEnabled: false,
  endlessMode: false,
};

export default function App() {
  const [gameState, setGameState] = useState<GameState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.coins > 1_000_000 && (parsed.totalDays || 0) < 9000) {
          parsed.coins = 500;
        }
        return { ...DEFAULT_STATE, ...parsed };
      }
    } catch {
      // ignore
    }
    return DEFAULT_STATE;
  });

  const [activeTab, setActiveTab] = useState<'life' | 'love' | 'travel' | 'memories'>('life');
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [isMovieOpen, setIsMovieOpen] = useState(false);
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [showMeetingCutscene, setShowMeetingCutscene] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const lastTickRef = useRef<number>(Date.now());
  const lastInteractionRef = useRef<number>(Date.now());
  const comboTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const touchActivity = () => {
    lastInteractionRef.current = Date.now();
  };

  const calculateRates = useCallback((state: GameState) => {
    let baseCoinsSec = 0;
    let baseClickPow = 1;
    let totalIncomeMult = 1.0;
    let loveSec = 0;
    let warmth = 1.0;

    let baseDaysClick = 1.0;
    let baseDaysSec = 0.2;

    UPGRADES_CATALOG.forEach((item) => {
      const lvl = state.upgrades[item.id] || 0;
      if (lvl > 0) {
        if (item.coinsPerSecBonus) baseCoinsSec += item.coinsPerSecBonus * lvl;
        if (item.clickBonus) baseClickPow += item.clickBonus * lvl;
        if (item.daysPerClickBonus) baseDaysClick += item.daysPerClickBonus * lvl;
        if (item.passiveDaysBonus) baseDaysSec += item.passiveDaysBonus * lvl;
        if (item.incomeMultiplier) {
          totalIncomeMult += (item.incomeMultiplier - 1) * (lvl / item.maxLevel);
        }
      }
    });

    GIFTS_CATALOG.forEach((gift) => {
      if (state.unlockedGifts.includes(gift.id)) {
        warmth += gift.warmthBonus;
      }
    });

    if (state.totalDays >= MEETING_DAY) {
      LOVE_ACTIVITIES_CATALOG.forEach((act) => {
        const lvl = state.activities[act.id] || 0;
        if (lvl > 0) {
          loveSec += act.lovePerSec * lvl;
          warmth += act.warmthMultiplier * lvl;
        }
      });
    }

    if (state.activeMovie) {
      loveSec *= 1.5;
      baseCoinsSec *= 1.4;
    }

    const finalCoinsSec = Math.round(baseCoinsSec * totalIncomeMult * warmth);
    const finalLoveSec = Math.round(loveSec * warmth);
    const finalClickPow = Math.max(1, Math.round(baseClickPow * totalIncomeMult * warmth + finalCoinsSec * 0.06));

    let finalDaysClick = 1.0;
    let finalDaysSec = 0.2;

    if (state.totalDays >= MEETING_DAY) {
      if (!state.hasStartedTogether) {
        finalDaysSec = 0;
        finalDaysClick = 0;
      } else {
        finalDaysSec = 1.0;
        finalDaysClick = 0;
      }
    } else {
      finalDaysClick = Math.min(25, parseFloat(baseDaysClick.toFixed(1)));
      finalDaysSec = parseFloat(baseDaysSec.toFixed(2));
    }

    return {
      energyPerSec: 1,
      coinsPerSec: finalCoinsSec,
      lovePerSec: finalLoveSec,
      clickPower: finalClickPow,
      loveMultiplier: warmth,
      daysPerClick: finalDaysClick,
      daysPerSec: finalDaysSec,
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
    } catch {
      // ignore
    }
  }, [gameState]);

  useEffect(() => {
    if (gameState.musicEnabled) {
      startBackgroundMusic();
    } else {
      stopBackgroundMusic();
    }
    return () => {
      stopBackgroundMusic();
    };
  }, [gameState.musicEnabled]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const dt = (now - lastTickRef.current) / 1000;
      lastTickRef.current = now;

      setGameState((prev) => {
        if (prev.isPaused2026 === 1 && !prev.endlessMode) {
          return prev;
        }

        const rates = calculateRates(prev);
        const dayIncrement = rates.daysPerSec * dt;
        let newTotalDays = prev.totalDays + dayIncrement;

        let newHasMet = prev.hasMetHer;
        if (newTotalDays >= MEETING_DAY) {
          newHasMet = true;
          if (!prev.hasStartedTogether) {
            newTotalDays = MEETING_DAY;
            if (!prev.hasMetHer) {
              setShowMeetingCutscene(true);
            }
          }
        }

        let pauseFlag = prev.isPaused2026;
        if (newTotalDays >= PAUSE_DAY && prev.isPaused2026 === 0 && !prev.endlessMode) {
          pauseFlag = 1;
          newTotalDays = PAUSE_DAY;
          setShowPauseModal(true);
          if (prev.soundEnabled) playFanfare();
          confetti({
            particleCount: 120,
            spread: 90,
            origin: { y: 0.5 },
            colors: ['#D48166', '#7B96AC', '#E6AF2E', '#F9F7F2'],
          });
        }

        const isIdle = (now - lastInteractionRef.current) > 6000;
        let newCoins = prev.coins;
        let currentExpenseRate = 0;

        if (isIdle) {
          const baseExpense = prev.totalDays > 8000 ? 50 : prev.totalDays > 6570 ? 15 : prev.totalDays > 2682 ? 3 : 1;
          const calculatedExpense = Math.max(1, Math.round(rates.coinsPerSec * 0.5 + baseExpense));
          currentExpenseRate = calculatedExpense;

          if (prev.coins > 0) {
            newCoins = Math.max(0, prev.coins - currentExpenseRate * dt);
          } else {
            newCoins = 0;
          }
        } else {
          newCoins = prev.coins + rates.coinsPerSec * dt;
          currentExpenseRate = 0;
        }

        const newLove = newHasMet ? prev.lovePoints + rates.lovePerSec * dt : 0;

        let updatedTrip = prev.currentCityTrip;
        let updatedUnlockedCities = [...prev.unlockedCities];
        let updatedCityVisits = { ...prev.cityVisits };
        let updatedTotalTrips = prev.totalTripsCompleted;

        if (updatedTrip) {
          const tripCity = TRAVEL_CITIES.find((c) => c.id === updatedTrip!.cityId);
          const tripDuration = updatedTrip.duration;
          const progressInc = (dt / tripDuration) * 100;
          const nextProgress = updatedTrip.progress + progressInc;

          if (nextProgress >= 100) {
            if (tripCity) {
              if (!updatedUnlockedCities.includes(tripCity.id)) {
                updatedUnlockedCities.push(tripCity.id);
              }
              updatedCityVisits[tripCity.id] = (updatedCityVisits[tripCity.id] || 0) + 1;
              updatedTotalTrips++;
              if (prev.soundEnabled) playCameraShutter();
              showToast(`📸 Поездка в ${tripCity.name} завершена! +${formatNumber(tripCity.loveReward)} ❤️ и сувенир в паспорте!`);
            }
            updatedTrip = null;
          } else {
            updatedTrip = { ...updatedTrip, progress: nextProgress };
          }
        }

        let updatedMovie = prev.activeMovie;
        let updatedMoviesCount = prev.totalMoviesWatched;
        if (updatedMovie) {
          const movieProgInc = (dt / updatedMovie.duration) * 100;
          const nextMovieProg = updatedMovie.progress + movieProgInc;
          if (nextMovieProg >= 100) {
            updatedMoviesCount++;
            if (prev.soundEnabled) playHeartSound();
            showToast(`🍿 Киновечер "${updatedMovie.title}" завершен! Вы стали еще ближе ❤️`);
            updatedMovie = null;
          } else {
            updatedMovie = { ...updatedMovie, progress: nextMovieProg };
          }
        }

        return {
          ...prev,
          totalDays: newTotalDays,
          hasMetHer: newHasMet,
          isPaused2026: pauseFlag,
          coins: newCoins,
          isAfk: isIdle,
          expensePerSec: currentExpenseRate,
          lovePoints: newLove,
          energyPerSec: rates.energyPerSec,
          coinsPerSec: rates.coinsPerSec,
          lovePerSec: rates.lovePerSec,
          clickPower: rates.clickPower,
          loveMultiplier: rates.loveMultiplier,
          daysPerClick: rates.daysPerClick,
          daysPerSec: rates.daysPerSec,
          currentCityTrip: updatedTrip,
          unlockedCities: updatedUnlockedCities,
          cityVisits: updatedCityVisits,
          totalTripsCompleted: updatedTotalTrips,
          activeMovie: updatedMovie,
          totalMoviesWatched: updatedMoviesCount,
        };
      });
    }, 100);

    return () => clearInterval(interval);
  }, [calculateRates]);

  const handleMoneyClick = (e: React.MouseEvent<HTMLElement>) => {
    touchActivity();
    const hasMet = gameState.totalDays >= MEETING_DAY;

    if (gameState.soundEnabled) {
      if (hasMet) {
        playKissSound();
      } else {
        playTapSound();
      }
    }

    if (comboTimeoutRef.current) clearTimeout(comboTimeoutRef.current);
    const newCombo = Math.min(10, gameState.comboStreak + 1);
    comboTimeoutRef.current = setTimeout(() => {
      setGameState((prev) => ({ ...prev, comboStreak: 1 }));
    }, 1800);

    const comboMult = 1 + newCombo * 0.1;
    const gainedCoins = Math.max(1, Math.floor(gameState.clickPower * comboMult));
    const gainedLove = hasMet ? Math.max(5, Math.floor(gameState.clickPower * 1.5 * gameState.loveMultiplier)) : 0;

    setGameState((prev) => ({
      ...prev,
      coins: prev.coins + gainedCoins,
      lovePoints: hasMet ? prev.lovePoints + gainedLove : prev.lovePoints,
      totalKisses: hasMet ? prev.totalKisses + 1 : prev.totalKisses,
      comboStreak: newCombo,
      isAfk: false,
    }));

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX ? e.clientX - rect.left : 100;
    const y = e.clientY ? e.clientY - rect.top : 100;

    const newParticle: FloatingText = {
      id: `${Date.now()}_${Math.random()}`,
      text: hasMet ? `+${gainedLove} ❤️ +${gainedCoins} 💰` : `+${gainedCoins} 💰`,
      x: Math.max(20, Math.min(rect.width - 100, x + (Math.random() * 40 - 20))),
      y: Math.max(20, y + (Math.random() * 20 - 10)),
      color: hasMet ? '#D48166' : '#4A6B82',
    };

    setFloatingTexts((prev) => [...prev.slice(-15), newParticle]);
    setTimeout(() => {
      setFloatingTexts((prev) => prev.filter((p) => p.id !== newParticle.id));
    }, 900);
  };

  const handleAgeClick = (e: React.MouseEvent<HTMLElement>) => {
    touchActivity();
    const hasMet = gameState.totalDays >= MEETING_DAY;

    if (hasMet) {
      if (!gameState.hasStartedTogether) {
        setShowMeetingCutscene(true);
        return;
      }
      if (gameState.soundEnabled) playKissSound();
      setGameState((prev) => ({
        ...prev,
        lovePoints: prev.lovePoints + 20,
        totalKisses: prev.totalKisses + 1,
        isAfk: false,
      }));

      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const x = e.clientX ? e.clientX - rect.left : 100;
      const y = e.clientY ? e.clientY - rect.top : 100;

      const newParticle: FloatingText = {
        id: `${Date.now()}_${Math.random()}`,
        text: '+20 ❤️ Каждый день вместе бесценен',
        x: Math.max(20, Math.min(rect.width - 140, x + (Math.random() * 40 - 20))),
        y: Math.max(20, y + (Math.random() * 20 - 10)),
        color: '#D48166',
      };

      setFloatingTexts((prev) => [...prev.slice(-15), newParticle]);
      setTimeout(() => {
        setFloatingTexts((prev) => prev.filter((p) => p.id !== newParticle.id));
      }, 900);
      return;
    }

    if (gameState.soundEnabled) {
      playTimeStepSound();
    }

    const rates = calculateRates(gameState);
    const daysToAdd = Math.max(1, rates.daysPerClick || gameState.daysPerClick || 1);

    setGameState((prev) => {
      let newTotalDays = prev.totalDays + daysToAdd;
      let newHasMet = prev.hasMetHer;
      if (!prev.hasMetHer && newTotalDays >= MEETING_DAY) {
        newHasMet = true;
        newTotalDays = MEETING_DAY;
        setShowMeetingCutscene(true);
      }

      let pauseFlag = prev.isPaused2026;
      if (newTotalDays >= PAUSE_DAY && prev.isPaused2026 === 0 && !prev.endlessMode) {
        pauseFlag = 1;
        newTotalDays = PAUSE_DAY;
        setShowPauseModal(true);
        if (prev.soundEnabled) playFanfare();
        confetti({
          particleCount: 120,
          spread: 90,
          origin: { y: 0.5 },
          colors: ['#D48166', '#7B96AC', '#E6AF2E', '#F9F7F2'],
        });
      }

      return {
        ...prev,
        totalDays: newTotalDays,
        hasMetHer: newHasMet,
        isPaused2026: pauseFlag,
        isAfk: false,
      };
    });

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX ? e.clientX - rect.left : 100;
    const y = e.clientY ? e.clientY - rect.top : 100;

    const formattedDays = Number(daysToAdd.toFixed(1));
    const newParticle: FloatingText = {
      id: `${Date.now()}_${Math.random()}`,
      text: `+${formattedDays} ${formattedDays === 1 ? 'день' : formattedDays < 5 ? 'дня' : 'дней'} ⏳`,
      x: Math.max(20, Math.min(rect.width - 100, x + (Math.random() * 40 - 20))),
      y: Math.max(20, y + (Math.random() * 20 - 10)),
      color: '#4A6B82',
    };

    setFloatingTexts((prev) => [...prev.slice(-15), newParticle]);
    setTimeout(() => {
      setFloatingTexts((prev) => prev.filter((p) => p.id !== newParticle.id));
    }, 900);
  };

  const handleBuyUpgrade = (item: UpgradeItem) => {
    touchActivity();
    if (gameState.totalDays < (item.requiredDays || 0)) {
      showToast(`🔒 Этот этап откроется в возрасте: ${item.requiredAgeStr || 'позже'}`);
      return;
    }

    const currentLvl = gameState.upgrades[item.id] || 0;
    const cost = Math.floor(item.cost * Math.pow(item.costMultiplier, currentLvl));

    if (gameState.coins < cost || currentLvl >= item.maxLevel) return;

    if (gameState.soundEnabled) playLevelUpSound();

    setGameState((prev) => ({
      ...prev,
      coins: prev.coins - cost,
      upgrades: {
        ...prev.upgrades,
        [item.id]: currentLvl + 1,
      },
    }));
  };

  const handleUpgradeActivity = (act: LoveActivity) => {
    touchActivity();
    const currentLvl = gameState.activities[act.id] || 0;
    const mult = Math.pow(1.22, currentLvl);
    const loveCost = Math.floor(act.baseLoveCost * mult);
    const coinCost = Math.floor(act.baseCoinCost * mult);

    if (gameState.lovePoints < loveCost || gameState.coins < coinCost || currentLvl >= act.maxLevel) return;

    if (gameState.soundEnabled) playHeartSound();

    setGameState((prev) => ({
      ...prev,
      lovePoints: prev.lovePoints - loveCost,
      coins: prev.coins - coinCost,
      activities: {
        ...prev.activities,
        [act.id]: currentLvl + 1,
      },
    }));
  };

  const handleBuyGift = (gift: GiftItem) => {
    touchActivity();
    if (
      gameState.coins < gift.coinCost ||
      gameState.lovePoints < gift.loveCost ||
      gameState.unlockedGifts.includes(gift.id)
    )
      return;

    if (gameState.soundEnabled) playLevelUpSound();
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });

    setGameState((prev) => ({
      ...prev,
      coins: prev.coins - gift.coinCost,
      lovePoints: prev.lovePoints - gift.loveCost,
      totalGiftsGiven: prev.totalGiftsGiven + 1,
      unlockedGifts: [...prev.unlockedGifts, gift.id],
    }));

    showToast(`🎁 Подарок вручен! ${gift.girlfriendReaction}`);
  };

  const handleStartTrip = (city: TravelCity) => {
    touchActivity();
    if (
      gameState.coins < city.unlockCostCoins ||
      gameState.lovePoints < city.unlockCostLove ||
      gameState.currentCityTrip !== null
    )
      return;

    if (gameState.soundEnabled) playFanfare();

    setGameState((prev) => ({
      ...prev,
      coins: prev.coins - city.unlockCostCoins,
      lovePoints: prev.lovePoints - city.unlockCostLove,
      currentCityTrip: {
        cityId: city.id,
        progress: 0,
        duration: city.tripDurationSec,
        startTime: Date.now(),
      },
    }));

    showToast(`✈️ Чемоданы собраны! Отправляемся в ${city.name}!`);
  };

  const handleStartMovie = (genre: typeof MOVIE_GENRES[0], snack: typeof MOVIE_SNACKS[0]) => {
    touchActivity();
    if (gameState.coins < snack.cost) return;

    if (gameState.soundEnabled) playHeartSound();

    setGameState((prev) => ({
      ...prev,
      coins: prev.coins - snack.cost,
      activeMovie: {
        title: genre.name,
        genre: genre.name,
        snack: snack.name,
        progress: 0,
        duration: 15,
      },
    }));

    showToast(`🍿 Киновечер начался! Смотрим "${genre.name}" с ${snack.name}!`);
  };

  const handleJumpToDate = (targetDays: number) => {
    touchActivity();
    const isMeetingOrAfter = targetDays >= MEETING_DAY;
    setGameState((prev) => ({
      ...prev,
      totalDays: targetDays,
      hasMetHer: isMeetingOrAfter,
      hasStartedTogether: isMeetingOrAfter,
      coins: Math.max(prev.coins, targetDays * 25),
      lovePoints: isMeetingOrAfter ? Math.max(prev.lovePoints, (targetDays - MEETING_DAY) * 40) : prev.lovePoints,
      isPaused2026: targetDays >= PAUSE_DAY ? 0 : prev.isPaused2026,
    }));
    showToast(`⏱️ Перемотка времени к ${getCalendarDate(targetDays).dateStr}`);
  };

  const handleReset = () => {
    if (window.confirm('Сбросить весь прогресс и начать историю жизни заново?')) {
      localStorage.removeItem(STORAGE_KEY);
      setGameState(DEFAULT_STATE);
      showToast('История перезапущена с начала!');
    }
  };

  const hasMet = gameState.totalDays >= MEETING_DAY;

  useEffect(() => {
    if (!hasMet && (activeTab === 'love' || activeTab === 'travel')) {
      setActiveTab('life');
    }
  }, [hasMet, activeTab]);

  return (
    <div className="min-h-screen bg-[#F9F7F2] text-[#3D3D3D] flex flex-col font-sans selection:bg-[#D48166] selection:text-white pb-16">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm bg-white border-2 border-[#D48166] text-[#3D3D3D] text-xs sm:text-sm font-semibold p-3.5 rounded-2xl shadow-xl animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* Header Status Bar */}
      <HeaderStatus
        gameState={gameState}
        onToggleSound={() => setGameState((p) => ({ ...p, soundEnabled: !p.soundEnabled }))}
        onToggleMusic={() => setGameState((p) => ({ ...p, musicEnabled: !p.musicEnabled }))}
        onJumpToDate={handleJumpToDate}
        onResetGame={handleReset}
      />

      {/* Main Content Dashboard */}
      <main className="max-w-7xl mx-auto w-full px-3 sm:px-6 pt-4 sm:pt-6 space-y-6 flex-1">
        
        {/* Central Visual Interactive Stage */}
        <CharacterStage
          gameState={gameState}
          onMoneyClick={handleMoneyClick}
          onAgeClick={handleAgeClick}
          floatingTexts={floatingTexts}
        />

        {/* Tab Navigation */}
        <div className="flex items-center justify-start sm:justify-center overflow-x-auto gap-2 p-1.5 bg-[#F0EDE6] border border-[#E5E1D8] rounded-2xl">
          
          <button
            onClick={() => {
              touchActivity();
              setActiveTab('life');
            }}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'life'
                ? 'bg-[#4A6B82] text-white shadow-xs'
                : 'text-[#7A756B] hover:text-[#3D3D3D] hover:bg-white/60'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Жизнь & Развитие</span>
          </button>

          {/* Love & Dates Tab */}
          {hasMet && (
            <button
              onClick={() => {
                touchActivity();
                setActiveTab('love');
              }}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 shrink-0 cursor-pointer animate-fade-in ${
                activeTab === 'love'
                  ? 'bg-[#D48166] text-white shadow-xs'
                  : 'text-[#D48166] hover:text-[#3D3D3D] hover:bg-white/60'
              }`}
            >
              <Heart className="w-4 h-4 fill-current" />
              <span>Любовь & Свидания ❤️</span>
            </button>
          )}

          {/* Travel Cities Tab */}
          {hasMet && (
            <button
              onClick={() => {
                touchActivity();
                setActiveTab('travel');
              }}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 shrink-0 cursor-pointer animate-fade-in ${
                activeTab === 'travel'
                  ? 'bg-[#4A6B82] text-white shadow-xs'
                  : 'text-[#7A756B] hover:text-[#3D3D3D] hover:bg-white/60'
              }`}
            >
              <Plane className="w-4 h-4" />
              <span>Поездки по городам ✈️</span>
            </button>
          )}

          <button
            onClick={() => {
              touchActivity();
              setActiveTab('memories');
            }}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'memories'
                ? 'bg-[#7B96AC] text-white shadow-xs'
                : 'text-[#7A756B] hover:text-[#3D3D3D] hover:bg-white/60'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Памятные даты & Альбом 📖</span>
          </button>
        </div>

        {/* Tab View Container */}
        <div className="bg-white border border-[#E5E1D8] rounded-3xl p-4 sm:p-6 shadow-xs">
          {activeTab === 'life' && (
            <LifeCareerTab gameState={gameState} onBuyUpgrade={handleBuyUpgrade} />
          )}

          {activeTab === 'love' && (
            <LoveActivitiesTab
              gameState={gameState}
              onUpgradeActivity={handleUpgradeActivity}
              onBuyGift={handleBuyGift}
              onOpenMovieNight={() => setIsMovieOpen(true)}
            />
          )}

          {activeTab === 'travel' && (
            <TravelTab gameState={gameState} onStartTrip={handleStartTrip} />
          )}

          {activeTab === 'memories' && (
            <MemoryTimelineTab
              gameState={gameState}
              onJumpToMilestone={(day) => handleJumpToDate(day)}
            />
          )}
        </div>

      </main>

      {/* Movie Night Modal */}
      <MovieNightModal
        isOpen={isMovieOpen}
        coins={gameState.coins}
        lovePoints={gameState.lovePoints}
        onClose={() => setIsMovieOpen(false)}
        onStartMovie={handleStartMovie}
      />

      {/* Meeting Cutscene Modal */}
      <MeetingCutscene
        isOpen={showMeetingCutscene}
        soundEnabled={gameState.soundEnabled}
        onComplete={() => {
          setShowMeetingCutscene(false);
          setGameState((prev) => ({
            ...prev,
            hasMetHer: true,
            hasStartedTogether: true,
          }));
          setActiveTab('love');
          showToast('✨ Новая глава началась! Время нежно течет день за днем (1 дн./сек) ❤️');
        }}
      />

      {/* 2026 Pause Modal */}
      <Pause2026Modal
        isOpen={showPauseModal}
        gameState={gameState}
        onContinueEndless={() => {
          setGameState((prev) => ({ ...prev, endlessMode: true, isPaused2026: 0 }));
          setShowPauseModal(false);
          showToast('Бесконечный режим любви активирован! ❤️');
        }}
        onViewAlbum={() => {
          setActiveTab('memories');
          setShowPauseModal(false);
        }}
      />
    </div>
  );
}