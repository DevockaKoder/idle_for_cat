import React, { useState } from 'react';
import { GameState } from '../types';
import { formatAgeFromDays, getDaysTogether, formatNumber } from '../utils/formatters';
import { Heart, Sparkles, Lock, Gift, Crown, Award, Play, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';

interface Pause2026ModalProps {
  isOpen: boolean;
  gameState: GameState;
  onContinueEndless: () => void;
  onViewAlbum: () => void;
}

export const Pause2026Modal: React.FC<Pause2026ModalProps> = ({
  isOpen,
  gameState,
  onContinueEndless,
  onViewAlbum,
}) => {
  const [tab, setTab] = useState<'letter' | 'stats'>('letter');

  if (!isOpen) return null;

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#D48166', '#7B96AC', '#E6AF2E', '#4A6B82'],
    });
  };

  const daysTogether = getDaysTogether(gameState.totalDays);
  const age = formatAgeFromDays(gameState.totalDays);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full max-w-2xl bg-white border-2 border-[#D48166] rounded-3xl p-6 sm:p-8 shadow-2xl relative text-[#3D3D3D] my-8"
      >
        {/* Jubilee Crown Ornament */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#D48166]/20 text-3xl shadow-xs mb-2 animate-bounce">
            💍
          </div>
          <div className="text-xs uppercase font-extrabold text-[#D48166] tracking-widest">
            Символичный Финал Игры • 7 Сентября 2026 года
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#4A6B82] mt-1">
            2 года со дня нашего знакомства! ❤️
          </h2>
          <div className="text-sm font-semibold text-[#D48166]">
            Тебе 30 лет, 4 месяца и 10 дней • 2 года (730 дней) рука об руку!
          </div>
        </div>

        {/* The Key Pause Banner */}
        <div className="p-4 rounded-2xl bg-[#D48166]/10 border-2 border-[#D48166]/40 text-center shadow-xs my-4">
          <div className="flex items-center justify-center gap-2 text-[#D48166] text-xs font-bold uppercase tracking-wider mb-1">
            <Lock className="w-4 h-4 text-[#D48166]" />
            <span>Игра приостановлена</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-[#3D3D3D] text-balance">
            «Необходимо разблокировать следующие уровни в реальности ❤️»
          </h3>
          <p className="text-xs text-[#7A756B] mt-1">
            Ты прошел виртуальный путь. Настоящие приключения только начинаются!
          </p>
        </div>

        {/* Milestone Statistics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 my-4">
          <div className="p-3 rounded-2xl bg-[#FDFBF7] border border-[#E5E1D8] text-center">
            <div className="text-[11px] text-[#7A756B]">Прожито дней</div>
            <div className="text-base sm:text-lg font-mono font-bold text-[#4A6B82]">
              11 089 дн.
            </div>
            <div className="text-[10px] text-[#7A756B]">30 лет, 4 мес, 10 дн</div>
          </div>

          <div className="p-3 rounded-2xl bg-[#D48166]/10 border border-[#D48166]/30 text-center">
            <div className="text-[11px] text-[#D48166] font-semibold">Дней вместе</div>
            <div className="text-base sm:text-lg font-mono font-bold text-[#D48166]">
              730 дней ❤️
            </div>
            <div className="text-[10px] text-[#D48166]">Ровно 2 года счастья</div>
          </div>

          <div className="col-span-2 sm:col-span-1 p-3 rounded-2xl bg-[#FDFBF7] border border-[#E5E1D8] text-center">
            <div className="text-[11px] text-[#7A756B]">Дата встречи</div>
            <div className="text-sm font-bold text-[#4A6B82]">7 сентября 2024</div>
            <div className="text-[10px] text-[#7A756B]">День, изменивший всё</div>
          </div>
        </div>

        {/* Letter from Girlfriend */}
        <div className="p-5 rounded-2xl bg-[#FDFBF7] border border-[#D48166]/30 text-xs sm:text-sm text-[#3D3D3D] leading-relaxed space-y-3 font-serif shadow-inner max-h-60 overflow-y-auto">
          <p className="font-bold text-[#D48166] text-sm sm:text-base font-sans">
            Мой самый любимый, дорогой и родной человек!
          </p>
          <p>
            Сегодня тебе исполняется <strong>30 лет, 4 месяца и 10 дней</strong> (11 089 дней со дня твоего рождения). И ровно <strong>2 года назад — 7 сентября 2024 года</strong> — ты встретил меня, а я встретила тебя.
          </p>
          <p>
            Этот день разделил мою жизнь на «до» и «после». Мы пока не живем вместе, но наши ночные разговоры, сотни милых голосовых, совместные фильмы, подарки и потрясающие поездки в разные города доказали мне, что расстояние — ничто перед настоящей любовью.
          </p>
          <p className="text-[#4A6B82] font-semibold">
            Эта игра заканчивается здесь, 7 сентября 2026 года, потому что все следующие уровни — наш совместный дом, новые страны, тысячи утренних чашек кофе и бесконечное счастье — мы должны прожить в реальности рука об руку.
          </p>
          <p className="text-right font-bold text-[#D48166]">
            Бесконечно люблю тебя! Твоя девушка ❤️
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => {
              triggerConfetti();
              onViewAlbum();
            }}
            className="flex-1 py-3 px-4 rounded-2xl bg-[#F0EDE6] hover:bg-[#E5E1D8] border border-[#E5E1D8] text-[#4A6B82] font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <Award className="w-4 h-4 text-[#E6AF2E]" />
            <span>Открыть Памятный Альбом</span>
          </button>

          <button
            onClick={() => {
              triggerConfetti();
              onContinueEndless();
            }}
            className="flex-1 py-3 px-4 rounded-2xl bg-[#D48166] hover:bg-[#c27258] text-white font-bold text-xs sm:text-sm shadow-xs transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Продолжить в бесконечном режиме ❤️</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
