import React, { useState, useEffect } from 'react';
import { GameState, FloatingText } from '../types';
import { formatAgeFromDays, getStageTitle, formatNumber } from '../utils/formatters';
import { Heart, Sparkles, Flame, Calendar, Coins, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CharacterStageProps {
  gameState: GameState;
  onMoneyClick: (event: React.MouseEvent<HTMLElement>) => void;
  onAgeClick: (event: React.MouseEvent<HTMLElement>) => void;
  floatingTexts: FloatingText[];
}

const GIRLFRIEND_THOUGHTS = [
  '«Ты у меня самый умный и любимый! ❤️»',
  '«Не забывай пить воду и кушать вкусняшки!»',
  '«Жду не дождусь нашей следующей встречи и поездки! ✈️»',
  '«Смотрю на тебя и каждый день влюбляюсь заново ✨»',
  '«Ты такой заботливый... Спасибо за всё, родной!»',
  '«Давай сегодня вечером включим наш сериал? 🍿»',
  '«Обнимаю тебя крепко-крепко через километры! 💌»',
  '«Ты — моё самое главное счастье с 7 сентября 2024 года!»',
];

const BOYFRIEND_PRE_THOUGHTS = [
  '«Продуктивный день, новые цели и уверенность в будущем... ☕»',
  '«Учусь, работаю, создаю надежный фундамент для жизни»',
  '«Интересно, где сейчас моя будущая любовь?.. ✨»',
  '«Спортзал, ансамбль, дела, любимая музыка — отличный настрой!»',
  '«Чувствую, скоро в моей жизни произойдет судьбоносная встреча...»',
];

export const CharacterStage: React.FC<CharacterStageProps> = ({
  gameState,
  onMoneyClick,
  onAgeClick,
  floatingTexts,
}) => {
  const hasMet = gameState.totalDays >= 10359;
  const age = formatAgeFromDays(gameState.totalDays);
  const stage = getStageTitle(gameState.totalDays);

  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [isKissing, setIsKissing] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (hasMet) {
        setCurrentQuoteIndex((prev) => (prev + 1) % GIRLFRIEND_THOUGHTS.length);
      } else {
        setCurrentQuoteIndex((prev) => (prev + 1) % BOYFRIEND_PRE_THOUGHTS.length);
      }
    }, 6000);
    return () => clearInterval(interval);
  }, [hasMet]);

  const handleAvatarClick = (e: React.MouseEvent<HTMLElement>) => {
    setIsKissing(true);
    setTimeout(() => setIsKissing(false), 400);
    onMoneyClick(e);
  };

  return (
    <div
      className={`relative w-full rounded-[32px] overflow-hidden shadow-sm transition-all duration-1000 border ${
        hasMet
          ? 'bg-white border-4 border-[#7B96AC]'
          : 'bg-white border-2 border-[#E5E1D8]'
      }`}
    >
      {/* Background Ambience Decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {hasMet ? (
          <>
            {/* Romantic Natural Warm Glow & Fairy Lights */}
            <div className="absolute -top-10 -left-10 w-72 h-72 bg-[#D48166]/10 rounded-full blur-3xl" />
            <div className="absolute top-1/2 -right-10 w-80 h-80 bg-[#7B96AC]/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-1/3 w-96 h-48 bg-[#E6AF2E]/10 rounded-full blur-2xl" />

            {/* Glowing Garland / Fairy Lights String */}
            <div className="absolute top-2 left-0 right-0 flex justify-around opacity-60">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-[#E6AF2E] shadow-[0_0_6px_#E6AF2E]"
                />
              ))}
            </div>

            {/* Memory Polaroid Frames Hanging */}
            <div className="hidden sm:flex absolute top-6 right-6 gap-3 rotate-3 opacity-90">
              <div className="bg-[#FDFBF7] p-1.5 pb-3.5 rounded-xl border border-[#E5E1D8] shadow-md w-16 text-center transform -rotate-6">
                <div className="w-13 h-11 bg-[#D48166]/15 rounded-lg flex items-center justify-center text-lg">
                  💑
                </div>
                <div className="text-[8px] text-[#4A6B82] font-semibold mt-1 font-mono">7.09.2024</div>
              </div>
              <div className="bg-[#FDFBF7] p-1.5 pb-3.5 rounded-xl border border-[#E5E1D8] shadow-md w-16 text-center transform rotate-6">
                <div className="w-13 h-11 bg-[#7B96AC]/15 rounded-lg flex items-center justify-center text-lg">
                  ✈️
                </div>
                <div className="text-[8px] text-[#4A6B82] font-semibold mt-1">Поездки</div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Pre-meeting Natural Light Ambient */}
            <div className="absolute -top-10 -left-10 w-72 h-72 bg-[#7B96AC]/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#E6AF2E]/10 rounded-full blur-3xl" />
          </>
        )}
      </div>

      {/* Floating Click Numbers */}
      <AnimatePresence>
        {floatingTexts.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 1, y: item.y, x: item.x, scale: 0.8 }}
            animate={{ opacity: 0, y: item.y - 80, scale: 1.2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
            className="absolute pointer-events-none z-50 font-extrabold text-sm sm:text-base drop-shadow select-none font-mono"
            style={{ color: item.color, left: item.x, top: item.y }}
          >
            {item.text}
          </motion.div>
        ))}
      </AnimatePresence>

      <div className="relative z-10 p-5 sm:p-7 flex flex-col items-center text-center">
        
        {/* Stage Header Info */}
        <div className="mb-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F0EDE6] border border-[#E5E1D8] text-xs text-[#4A6B82] font-medium shadow-sm">
            <span>{stage.title}</span>
            <span className="text-[#A39E93]">•</span>
            <span className="text-[#D48166] font-bold">{age.years} лет, {age.months} мес.</span>
          </div>
        </div>

        {/* Thought Bubble from Character / Girlfriend (appears after 4 years of age) */}
        {gameState.totalDays >= 1461 && (
          <motion.div
            key={currentQuoteIndex}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`max-w-md mx-auto mb-3 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-serif italic border shadow-sm ${
              hasMet
                ? 'bg-[#FDFBF7] border-[#D48166]/30 text-[#3D3D3D]'
                : 'bg-[#FDFBF7] border-[#E5E1D8] text-[#4A6B82]'
            }`}
          >
            {hasMet ? GIRLFRIEND_THOUGHTS[currentQuoteIndex] : BOYFRIEND_PRE_THOUGHTS[currentQuoteIndex]}
          </motion.div>
        )}

        {/* Central Character Visual Avatar Stage */}
        <div
          onClick={handleAvatarClick}
          className="cursor-pointer group relative my-2 select-none transform transition active:scale-95"
          title="Кликни для заработка монет и любви!"
        >
          <div
            className={`w-44 h-44 sm:w-52 sm:h-52 rounded-full flex items-center justify-center p-3 relative shadow-md transition-all duration-500 ${
              hasMet
                ? 'bg-gradient-to-tr from-[#D48166]/15 via-[#7B96AC]/20 to-[#E6AF2E]/15 ring-4 ring-[#7B96AC]/50 group-hover:ring-[#D48166]'
                : 'bg-[#F0EDE6] ring-4 ring-[#E5E1D8] group-hover:ring-[#7B96AC]'
            }`}
          >
            {/* Heartbeat pulse rings for love era */}
            {hasMet && (
              <div className="absolute inset-0 rounded-full border-2 border-[#D48166]/30 animate-ping pointer-events-none" />
            )}

            {/* Avatars Rendering */}
            {hasMet ? (
              /* Couple Together Illustration */
              <div className="relative flex items-center justify-center gap-2">
                {/* Boy Avatar */}
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#4A6B82] p-1 shadow-md flex items-center justify-center text-3xl sm:text-4xl text-white">
                    🧑
                  </div>
                  <span className="text-[10px] text-[#4A6B82] font-bold mt-1 bg-white border border-[#E5E1D8] px-2 py-0.5 rounded-full shadow-xs">
                    Коля
                  </span>
                </div>

                {/* Animated Kissing Heart in Center */}
                <motion.div
                  animate={{ scale: isKissing ? 1.5 : [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="text-2xl sm:text-3xl filter drop-shadow"
                >
                  {isKissing ? '💋' : '💖'}
                </motion.div>

                {/* Girl Avatar */}
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#D48166] p-1 shadow-md flex items-center justify-center text-3xl sm:text-4xl text-white">
                    👩‍🦰
                  </div>
                  <span className="text-[10px] text-[#D48166] font-bold mt-1 bg-white border border-[#E5E1D8] px-2 py-0.5 rounded-full shadow-xs">
                    Катя
                  </span>
                </div>
              </div>
            ) : (
              /* Solo Bachelor Illustration */
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#4A6B82] p-1 shadow-md flex items-center justify-center text-5xl sm:text-6xl text-white">
                  🧑
                </div>
                <span className="text-xs text-[#4A6B82] font-semibold mt-2 bg-white px-3 py-1 rounded-full border border-[#E5E1D8] shadow-xs">
                  Главный герой
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Combo Multiplier Streak */}
        {gameState.comboStreak > 1 && (
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6AF2E]/20 border border-[#E6AF2E]/50 text-[#3D3D3D] text-xs font-extrabold my-1 shadow-xs"
          >
            <Flame className="w-4 h-4 text-[#E6AF2E] fill-[#E6AF2E] animate-bounce" />
            <span>КОМБО x{gameState.comboStreak}! (+{gameState.comboStreak * 10}% бонус)</span>
          </motion.div>
        )}

        {/* Separate Action Buttons: Age vs Money/Love */}
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-lg">
          
          {/* Button 1: Age & Timeline Progression */}
          <button
            onClick={onAgeClick}
            className={`px-4 py-3 rounded-2xl font-bold text-xs sm:text-sm shadow-sm flex items-center justify-center gap-2 transform transition active:scale-95 cursor-pointer border ${
              hasMet
                ? 'bg-[#4A6B82] hover:bg-[#3D5A70] text-white border-[#3D5A70]'
                : 'bg-[#4A6B82] hover:bg-[#3D5A70] text-white border-[#3D5A70]'
            }`}
            title={
              hasMet
                ? 'Время нежно течет день за днем (1 дн./сек)'
                : `Перемотать время вперед (+${Number((gameState.daysPerClick || 1).toFixed(1))} дн. к возрасту)`
            }
          >
            <Clock className="w-4 h-4 text-[#E6AF2E]" />
            <div className="text-left">
              {hasMet ? (
                gameState.hasStartedTogether ? (
                  <>
                    <div>Время вместе ⏳</div>
                    <div className="text-[10px] text-white/80 font-normal font-mono">
                      Каждый день наполнен любовью ❤️
                    </div>
                  </>
                ) : (
                  <>
                    <div>Время замерло... ⏳</div>
                    <div className="text-[10px] text-white/80 font-normal font-mono">
                      Начни новую главу вдвоем ✨
                    </div>
                  </>
                )
              ) : (
                <>
                  <div>
                    Прожить время (+{Number((gameState.daysPerClick || 1).toFixed(1))} дн.) ⏳
                  </div>
                  <div className="text-[10px] text-white/80 font-normal font-mono">
                    {gameState.daysPerSec > 0
                      ? `+${gameState.daysPerSec.toFixed(1)} дн./сек авто`
                      : 'Взросление и открытие этапов'}
                  </div>
                </>
              )}
            </div>
          </button>

          {/* Button 2: Money / Work / Love Kiss */}
          <button
            onClick={(e) => {
              setIsKissing(true);
              setTimeout(() => setIsKissing(false), 400);
              onMoneyClick(e);
            }}
            className={`px-4 py-3 rounded-2xl font-bold text-xs sm:text-sm shadow-sm flex items-center justify-center gap-2 transform transition active:scale-95 cursor-pointer border ${
              hasMet
                ? 'bg-[#D48166] hover:bg-[#c27258] text-white border-[#b8674f]'
                : 'bg-[#7B96AC] hover:bg-[#688399] text-white border-[#5A748A]'
            }`}
            title={hasMet ? 'Подарить поцелуй (+❤️ +💰)' : 'Поработать (+💰)'}
          >
            {hasMet ? (
              <>
                <Heart className="w-4 h-4 fill-white shrink-0" />
                <div className="text-left">
                  <div>Поцеловать 💋</div>
                  <div className="text-[10px] text-white/80 font-normal font-mono">+❤️ любовь и +💰 доход</div>
                </div>
              </>
            ) : (
              <>
                <Coins className="w-4 h-4 shrink-0 text-[#E6AF2E]" />
                <div className="text-left">
                  <div>Доход 💰</div>
                  <div className="text-[10px] text-white/80 font-normal font-mono">+💰 заработать монеты</div>
                </div>
              </>
            )}
          </button>

        </div>

        {/* Status Mode: Active income vs Idle everyday living expenses */}
        <div className="mt-2.5 min-h-[28px] flex items-center justify-center text-center">
          {gameState.isAfk ? (
            gameState.coins > 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-3 py-1 rounded-full bg-[#D48166]/10 border border-[#D48166]/30 text-[#D48166] text-xs font-semibold flex items-center gap-1.5 shadow-xs"
              >
                <span>🛌</span>
                <span>
                  Режим отдыха: бытовые расходы <strong className="font-mono">-{formatNumber(gameState.expensePerSec)} 💰/сек</strong> (кликните действие для заработка!)
                </span>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-3 py-1 rounded-full bg-[#7A756B]/15 border border-[#7A756B]/25 text-[#5A554C] text-xs font-semibold flex items-center gap-1.5 shadow-xs animate-pulse"
              >
                <span>💤</span>
                <span>
                  <strong>Бездействие:</strong> вы не зарабатываете, пока не поактивничаете
                </span>
              </motion.div>
            )
          ) : (
            <div className="text-[11px] text-[#A39E93] flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#7B96AC] animate-ping" />
              <span>
                Активный режим: доход <strong className="text-[#4A6B82] font-mono">+{formatNumber(gameState.coinsPerSec)} 💰/сек</strong>
              </span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
