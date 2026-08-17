import React from 'react';
import { GameState } from '../types';
import { formatNumber, formatAgeFromDays, getCalendarDate, getDaysTogether, getStageTitle } from '../utils/formatters';
import { Coins, Heart, Volume2, VolumeX, Music, RotateCcw, Sparkles, Calendar, Cake } from 'lucide-react';

interface HeaderStatusProps {
  gameState: GameState;
  onToggleSound: () => void;
  onToggleMusic: () => void;
  onJumpToDate: (targetDays: number) => void;
  onResetGame: () => void;
}

export const HeaderStatus: React.FC<HeaderStatusProps> = ({
  gameState,
  onToggleSound,
  onToggleMusic,
  onJumpToDate,
  onResetGame,
}) => {
  const age = formatAgeFromDays(gameState.totalDays);
  const calendar = getCalendarDate(gameState.totalDays);
  const daysTogether = getDaysTogether(gameState.totalDays);
  const stage = getStageTitle(gameState.totalDays);
  const hasMet = gameState.totalDays >= 10359;

  return (
    <header className="w-full bg-white/95 backdrop-blur-md border-b border-[#E5E1D8] sticky top-0 z-30 shadow-xs text-[#3D3D3D]">
      {/* Top Banner: Status & Special Dates */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          {/* Age & Date Pillar */}
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl shadow-xs shrink-0 ${hasMet ? 'bg-[#D48166]/15 text-[#D48166] border border-[#D48166]/30' : 'bg-[#7B96AC]/15 text-[#4A6B82] border border-[#7B96AC]/30'}`}>
              {calendar.isBirthday ? '🎂' : hasMet ? '💖' : '🧑'}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#4A6B82]">
                  {stage.era}
                </span>
                <span className="text-xs text-[#A39E93]">•</span>
                <span className="text-xs text-[#7A756B] font-medium flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#A39E93]" />
                  {calendar.dateStr}
                </span>
                {calendar.isBirthday && (
                  <span className="bg-[#E6AF2E]/20 text-[#996B00] border border-[#E6AF2E]/40 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                    <Cake className="w-3 h-3" /> День рождения любимого!
                  </span>
                )}
                {calendar.isAnniversary && (
                  <span className="bg-[#D48166]/20 text-[#D48166] border border-[#D48166]/40 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                    💍 Годовщина знакомства!
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-2">
                <h1 className="text-sm sm:text-base font-bold text-[#3D3D3D] tracking-tight">
                  Возраст: <span className="text-[#D48166] font-mono">{age.text}</span>
                </h1>
              </div>
            </div>
          </div>

          {/* Days Together Counter (Strictly visible ONLY after 7 Sep 2024 / Day 10,359) */}
          {hasMet && (
            <div className="flex items-center gap-2 bg-[#D48166]/10 border border-[#D48166]/30 px-3.5 py-1.5 rounded-full shadow-xs">
              <Sparkles className="w-4 h-4 text-[#D48166]" />
              <div className="text-xs sm:text-sm font-semibold text-[#3D3D3D]">
                Мы вместе: <span className="text-[#D48166] font-extrabold text-sm sm:text-base font-mono">{daysTogether}</span> {daysTogether === 1 ? 'день' : daysTogether < 5 ? 'дня' : 'дней'} ❤️
              </div>
              <span className="hidden sm:inline text-[11px] text-[#A39E93]">(с 7 сентября 2024)</span>
            </div>
          )}

          {/* Controls: Audio & Quick Era Navigation */}
          <div className="flex items-center gap-2">
            
            {/* Quick Era Checkpoints (Only reached checkpoints visible) */}
            <div className="flex items-center gap-1 bg-[#F0EDE6] rounded-xl p-0.5 border border-[#E5E1D8] text-[11px]">
              <button
                onClick={() => onJumpToDate(0)}
                className="px-2 py-1 text-[#7A756B] hover:text-[#3D3D3D] rounded-lg hover:bg-white transition cursor-pointer"
                title="1996 год — Рождение"
              >
                1996
              </button>
              {gameState.totalDays >= 2682 && (
                <button
                  onClick={() => onJumpToDate(2682)}
                  className="px-2 py-1 text-[#7A756B] hover:text-[#3D3D3D] rounded-lg hover:bg-white transition cursor-pointer"
                  title="2003 год — Школа"
                >
                  2003
                </button>
              )}
              {hasMet && (
                <button
                  onClick={() => onJumpToDate(10359)}
                  className="px-2 py-1 text-[#D48166] hover:bg-white rounded-lg font-bold transition cursor-pointer"
                  title="7 сентября 2024 — День нашего знакомства"
                >
                  7 сен 2024 ❤️
                </button>
              )}
              {gameState.totalDays >= 11089 && (
                <button
                  onClick={() => onJumpToDate(11089)}
                  className="px-2 py-1 text-[#4A6B82] hover:bg-white rounded-lg font-bold transition cursor-pointer"
                  title="7 сентября 2026 — 2 года со дня знакомства"
                >
                  7 сен 2026 💍
                </button>
              )}
            </div>

            {/* Sound Toggles */}
            <div className="flex items-center gap-1">
              <button
                onClick={onToggleSound}
                className={`p-2 rounded-xl transition-colors border cursor-pointer ${
                  gameState.soundEnabled
                    ? 'bg-[#7B96AC]/20 text-[#4A6B82] border-[#7B96AC]/40'
                    : 'bg-[#F0EDE6] text-[#A39E93] border-[#E5E1D8]'
                }`}
                title={gameState.soundEnabled ? 'Звуковые эффекты: включены' : 'Звуковые эффекты: выключены'}
              >
                {gameState.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              <button
                onClick={onToggleMusic}
                className={`p-2 rounded-xl transition-colors border cursor-pointer ${
                  gameState.musicEnabled
                    ? 'bg-[#D48166]/20 text-[#D48166] border-[#D48166]/40'
                    : 'bg-[#F0EDE6] text-[#A39E93] border-[#E5E1D8]'
                }`}
                title={gameState.musicEnabled ? 'Романтическая музыка: включена' : 'Романтическая музыка: выключена'}
              >
                <Music className="w-4 h-4" />
              </button>

              <button
                onClick={onResetGame}
                className="p-2 rounded-xl bg-[#F0EDE6] hover:bg-white text-[#7A756B] hover:text-red-500 border border-[#E5E1D8] transition cursor-pointer"
                title="Начать заново с рождения"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Resource Counters Bar */}
        <div className={`grid ${hasMet ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-2'} gap-2.5 pt-2 mt-2 border-t border-[#E5E1D8]`}>
          
          {/* Coins */}
          <div className="flex items-center justify-between bg-white border border-[#E5E1D8] rounded-2xl px-3.5 py-2 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className={`p-1.5 rounded-xl transition-colors ${gameState.isAfk && gameState.coins > 0 ? 'bg-[#D48166]/15 text-[#D48166]' : 'bg-[#4A6B82]/15 text-[#4A6B82]'}`}>
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-[#A39E93] leading-tight">
                  {gameState.isAfk
                    ? (gameState.coins > 0 ? 'Монеты (расходы)' : 'Монеты (бездействие)')
                    : 'Монеты'}
                </div>
                <div className="text-base font-bold text-[#4A6B82] font-mono">
                  {formatNumber(gameState.coins)}
                </div>
              </div>
            </div>
            {gameState.isAfk ? (
              gameState.coins > 0 ? (
                <div
                  className="text-xs text-[#D48166] font-mono font-semibold bg-[#D48166]/10 border border-[#D48166]/20 px-2 py-0.5 rounded-md flex items-center gap-1 animate-pulse"
                  title="Режим отдыха: списываются бытовые расходы. Кликните действие, чтобы активировать доход!"
                >
                  -{formatNumber(gameState.expensePerSec)}/сек 💸
                </div>
              ) : (
                <div
                  className="text-xs text-[#7A756B] font-mono font-semibold bg-[#F0EDE6] border border-[#E5E1D8] px-2 py-0.5 rounded-md flex items-center gap-1"
                  title="Бездействие: вы не зарабатываете, пока не поактивничаете"
                >
                  0/сек ⏸️
                </div>
              )
            ) : (
              <div className="text-xs text-[#4A6B82] font-mono font-semibold bg-[#4A6B82]/10 px-2 py-0.5 rounded-md">
                +{formatNumber(gameState.coinsPerSec)}/сек
              </div>
            )}
          </div>

          {/* Love Points (Strictly appears ONLY after meeting on 7 Sep 2024) */}
          {hasMet && (
            <div className="flex items-center justify-between bg-[#D48166]/10 border border-[#D48166]/30 rounded-2xl px-3.5 py-2 shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-xl bg-[#D48166]/20 text-[#D48166]">
                  <Heart className="w-5 h-5 fill-[#D48166] text-[#D48166]" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-[#D48166] leading-tight">Очки любви</div>
                  <div className="text-base font-bold text-[#D48166] font-mono">
                    {formatNumber(gameState.lovePoints)}
                  </div>
                </div>
              </div>
              <div className="text-xs text-[#D48166] font-mono font-bold bg-[#D48166]/15 px-2 py-0.5 rounded-md">
                +{formatNumber(gameState.lovePerSec)}/сек
              </div>
            </div>
          )}

          {/* Warmth Multiplier / Click Power */}
          <div className="flex items-center justify-between bg-[#7B96AC]/15 border border-[#7B96AC]/30 rounded-2xl px-3.5 py-2 shadow-xs">
            <div>
              <div className="text-[10px] uppercase font-bold text-[#4A6B82] leading-tight">
                {hasMet ? 'Теплота отношений' : 'Сила клика'}
              </div>
              <div className="text-base font-bold text-[#4A6B82] font-mono">
                {hasMet ? `x${gameState.loveMultiplier.toFixed(2)}` : `+${formatNumber(gameState.clickPower)} 💰`}
              </div>
            </div>
            <div className="text-xs px-2.5 py-1 rounded-lg bg-white border border-[#7B96AC]/40 text-[#4A6B82] font-bold font-mono shadow-xs">
              {hasMet ? `+${(gameState.loveMultiplier * 100 - 100).toFixed(0)}% к любви` : 'кликер'}
            </div>
          </div>

        </div>
      </div>
    </header>
  );
};
