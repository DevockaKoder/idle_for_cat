import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Sparkles, Stars, Calendar, Volume2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playHeartbeatSound, playFanfare, playHeartSound } from '../utils/audio';

interface MeetingCutsceneProps {
  isOpen: boolean;
  soundEnabled: boolean;
  onComplete: () => void;
}

export const MeetingCutscene: React.FC<MeetingCutsceneProps> = ({
  isOpen,
  soundEnabled,
  onComplete,
}) => {
  // Stages of cutscene:
  // 0: Time Freezes (0-2.5s) - Clock ticking stops, screen dims slightly, glowing aura
  // 1: Heartbeats (2.5-6.5s) - Pulsing glowing heart with realistic heartbeat sound
  // 2: Meeting & Unlocking (6.5-10s) - Together on screen, romantic sparkle text, fanfare + confetti
  const [cutsceneStage, setCutsceneStage] = useState<number>(0);

  useEffect(() => {
    if (!isOpen) {
      setCutsceneStage(0);
      return;
    }

    // Step 0: Time stops immediately
    setCutsceneStage(0);

    // Step 1: Heartbeats begin after 2s
    const timer1 = setTimeout(() => {
      setCutsceneStage(1);
      if (soundEnabled) {
        playHeartbeatSound();
      }
    }, 2000);

    // Additional heartbeat beats in stage 1
    const timerHb2 = setTimeout(() => {
      if (soundEnabled) playHeartbeatSound();
    }, 3200);

    const timerHb3 = setTimeout(() => {
      if (soundEnabled) playHeartbeatSound();
    }, 4500);

    const timerHb4 = setTimeout(() => {
      if (soundEnabled) playHeartbeatSound();
    }, 5800);

    // Step 2: Revelation together on screen (6.8s)
    const timer2 = setTimeout(() => {
      setCutsceneStage(2);
      if (soundEnabled) {
        playFanfare();
        playHeartSound();
      }
      confetti({
        particleCount: 120,
        spread: 100,
        origin: { y: 0.5 },
        colors: ['#D48166', '#7B96AC', '#E6AF2E', '#FDFBF7', '#FF6B6B'],
      });
    }, 6800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timerHb2);
      clearTimeout(timerHb3);
      clearTimeout(timerHb4);
      clearTimeout(timer2);
    };
  }, [isOpen, soundEnabled]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in select-none">
      <div className="relative max-w-lg w-full bg-[#FDFBF7] border-2 border-[#D48166]/40 rounded-[36px] p-6 sm:p-8 text-center shadow-2xl overflow-hidden">
        
        {/* Ambient Glowing Orbs */}
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-[#D48166]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-[#7B96AC]/20 rounded-full blur-3xl pointer-events-none" />

        <AnimatePresence mode="wait">
          {/* Phase 0: Time Freezes */}
          {cutsceneStage === 0 && (
            <motion.div
              key="phase-0"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.5 }}
              className="py-6 flex flex-col items-center"
            >
              <motion.div
                animate={{ rotate: [0, 360], scale: [1, 1.1, 1] }}
                transition={{ duration: 3, ease: 'easeInOut' }}
                className="w-20 h-20 rounded-full bg-[#4A6B82]/15 border-2 border-[#4A6B82]/30 flex items-center justify-center text-4xl mb-4"
              >
                ⏳
              </motion.div>
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#4A6B82]/10 text-[#4A6B82] text-xs font-mono font-bold uppercase tracking-wider mb-2">
                <Calendar className="w-3.5 h-3.5" /> 7 Сентября 2024 года
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#3D3D3D] mt-1">
                Время замерло...
              </h2>
              <p className="text-sm text-[#7A756B] mt-2 max-w-xs leading-relaxed">
                28 лет пути привели к этому единственному мгновению. Стрелки часов остановились.
              </p>
            </motion.div>
          )}

          {/* Phase 1: Heartbeat Animation */}
          {cutsceneStage === 1 && (
            <motion.div
              key="phase-1"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 0.4 }}
              className="py-6 flex flex-col items-center"
            >
              {/* Pulsing Heart with Glow Waves */}
              <div className="relative my-4 flex items-center justify-center">
                <motion.div
                  animate={{ scale: [1, 1.4, 1.1, 1.5, 1], opacity: [0.7, 1, 0.8, 1, 0.7] }}
                  transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
                  className="w-32 h-32 rounded-full bg-gradient-to-tr from-[#D48166] to-[#E6AF2E] flex items-center justify-center shadow-[0_0_50px_rgba(212,129,102,0.6)]"
                >
                  <Heart className="w-16 h-16 text-white fill-white drop-shadow-md" />
                </motion.div>
                <div className="absolute inset-0 rounded-full border-4 border-[#D48166]/40 animate-ping pointer-events-none" />
                <div className="absolute -inset-4 rounded-full border-2 border-[#E6AF2E]/30 animate-pulse pointer-events-none" />
              </div>

              <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#3D3D3D] mt-2">
                Тук-тук... Тук-тук...
              </h2>
              <p className="text-xs sm:text-sm text-[#D48166] font-semibold mt-1 italic">
                Сердце забилось сильнее. Ты почувствовал, что судьба уже рядом...
              </p>
            </motion.div>
          )}

          {/* Phase 2: Together & Unlocked! */}
          {cutsceneStage === 2 && (
            <motion.div
              key="phase-2"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="py-2 flex flex-col items-center"
            >
              {/* Couple Avatar Unit */}
              <div className="flex items-center justify-center gap-3 my-3">
                <motion.div
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1, duration: 0.4 }}
                  className="flex flex-col items-center"
                >
                  <div className="w-20 h-20 rounded-full bg-[#4A6B82] p-1.5 shadow-md flex items-center justify-center text-4xl text-white">
                    🧑
                  </div>
                  <span className="text-[11px] text-[#4A6B82] font-bold mt-1 bg-white border border-[#E5E1D8] px-2.5 py-0.5 rounded-full shadow-xs">
                    Коля
                  </span>
                </motion.div>

                {/* Sparkling Kiss Heart */}
                <motion.div
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ repeat: Infinity, duration: 1.3 }}
                  className="text-4xl"
                >
                  💖
                </motion.div>

                <motion.div
                  initial={{ x: 30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1, duration: 0.4 }}
                  className="flex flex-col items-center"
                >
                  <div className="w-20 h-20 rounded-full bg-[#D48166] p-1.5 shadow-md flex items-center justify-center text-4xl text-white">
                    👩‍🦰
                  </div>
                  <span className="text-[11px] text-[#D48166] font-bold mt-1 bg-white border border-[#E5E1D8] px-2.5 py-0.5 rounded-full shadow-xs">
                    Катя
                  </span>
                </motion.div>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D48166]/15 text-[#D48166] text-xs font-bold my-1">
                <Sparkles className="w-3.5 h-3.5" /> Встреча состоялась!
              </div>

              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#3D3D3D] mt-1">
                «Я нашла тебя, а ты меня... ❤️»
              </h2>

              <p className="text-xs sm:text-sm text-[#7A756B] mt-2 leading-relaxed max-w-sm">
                С 7 сентября 2024 года ваша жизнь наполнилась безграничной любовью, совместными поездками, киновечерами и уютом!
              </p>

              {/* Unlocked Features Highlights */}
              <div className="grid grid-cols-3 gap-2 w-full mt-4 text-[11px] font-semibold text-[#4A6B82]">
                <div className="p-2.5 rounded-xl bg-white border border-[#E5E1D8] shadow-xs flex flex-col items-center">
                  <span className="text-lg mb-0.5">❤️</span>
                  <span>Очки Любви</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-[#E5E1D8] shadow-xs flex flex-col items-center">
                  <span className="text-lg mb-0.5">✈️</span>
                  <span>Путешествия</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-[#E5E1D8] shadow-xs flex flex-col items-center">
                  <span className="text-lg mb-0.5">🍿</span>
                  <span>Киновечера</span>
                </div>
              </div>

              {/* Enter Button */}
              <button
                onClick={onComplete}
                className="mt-6 w-full py-3.5 rounded-2xl bg-[#D48166] hover:bg-[#c27258] text-white font-bold text-sm shadow-md transition-all transform active:scale-98 cursor-pointer flex items-center justify-center gap-2"
              >
                <Heart className="w-4 h-4 fill-white" />
                <span>Начать новую главу вдвоем! ✨</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};
