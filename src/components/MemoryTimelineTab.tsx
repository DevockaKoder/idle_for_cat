import React from 'react';
import { GameState } from '../types';
import { MEMORY_MILESTONES } from '../data/gameData';
import { getDaysTogether, formatAgeFromDays } from '../utils/formatters';
import { CheckCircle, Clock, Sparkles, Lock } from 'lucide-react';
import { motion } from 'motion/react';

interface MemoryTimelineTabProps {
  gameState: GameState;
  onJumpToMilestone: (day: number) => void;
}

export const MemoryTimelineTab: React.FC<MemoryTimelineTabProps> = ({
  gameState,
}) => {
  const currentDay = Math.floor(gameState.totalDays);
  const daysTogether = getDaysTogether(gameState.totalDays);
  const age = formatAgeFromDays(gameState.totalDays);
  const hasMet = gameState.totalDays >= 10359;

  // Filter: show reached milestones
  const reachedMilestones = MEMORY_MILESTONES.filter((m) => currentDay >= m.day);

  // Find the single immediate next milestone
  const nextMilestone = MEMORY_MILESTONES.find((m) => currentDay < m.day);

  return (
    <div className="space-y-6">
      {/* Top Banner: Lifetime & Together Stats */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#FDFBF7] border border-[#E5E1D8] shadow-sm">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <span className="text-xs uppercase font-bold text-[#D48166] tracking-wider">
              Альбом Памятных Дат & Вех
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-[#4A6B82]">
              {hasMet ? 'История Твоей Жизни и Нашей Любви' : 'История Твоего Взросления'}
            </h2>
            <p className="text-xs text-[#7A756B] max-w-xl">
              {hasMet
                ? 'Каждый прожитый день делает тебя сильнее, а с 7 сентября 2024 года — наполняет нас счастьем!'
                : 'По мере проживания дней и взросления в альбоме открываются важные вехи и воспоминания.'}
            </p>
          </div>

          {/* Quick Metrics Bento */}
          <div className={`grid ${hasMet ? 'grid-cols-2' : 'grid-cols-1'} gap-3 w-full md:w-auto`}>
            <div className="p-3 bg-white rounded-2xl border border-[#E5E1D8] text-center shadow-xs">
              <div className="text-[11px] text-[#7A756B]">Прожито дней</div>
              <div className="text-base sm:text-lg font-mono font-bold text-[#4A6B82]">
                {currentDay.toLocaleString('ru-RU')}
              </div>
              <div className="text-[10px] text-[#7A756B]">{age.years} лет, {age.months} мес.</div>
            </div>

            {hasMet && (
              <div className="p-3 bg-[#D48166]/10 rounded-2xl border border-[#D48166]/30 text-center shadow-xs">
                <div className="text-[11px] text-[#D48166] font-semibold">Дней вместе</div>
                <div className="text-base sm:text-lg font-mono font-bold text-[#D48166]">
                  {daysTogether}
                </div>
                <div className="text-[10px] text-[#D48166]">с 7 сент. 2024 ❤️</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Timeline Stream */}
      <div className="relative pl-6 sm:pl-10 space-y-6 sm:space-y-8 before:absolute before:left-3 sm:before:left-5 before:top-4 before:bottom-4 before:w-0.5 before:bg-[#E5E1D8]">
        {reachedMilestones.map((milestone) => {
          const isSpecial = milestone.isSpecialAnniversary;

          return (
            <motion.div
              key={milestone.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="relative"
            >
              {/* Timeline Dot */}
              <div
                className={`absolute -left-6 sm:-left-10 top-3 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all shadow-xs ${
                  isSpecial
                    ? 'bg-[#D48166] border-white text-white shadow-[#D48166]/30 scale-110'
                    : 'bg-[#7B96AC] border-white text-white'
                }`}
              >
                {isSpecial ? '❤️' : '✓'}
              </div>

              {/* Milestone Card */}
              <div
                className={`p-5 rounded-3xl border transition-all duration-300 ${
                  isSpecial
                    ? 'bg-white border-2 border-[#D48166] shadow-sm'
                    : 'bg-white border-[#E5E1D8] hover:border-[#7B96AC] shadow-xs'
                }`}
              >
                {/* Milestone Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl sm:text-2xl">{milestone.icon}</span>
                    <div>
                      <h3
                        className={`font-bold text-base sm:text-lg ${
                          isSpecial ? 'text-[#D48166]' : 'text-[#3D3D3D]'
                        }`}
                      >
                        {milestone.title}
                      </h3>
                      <div className="text-xs text-[#7A756B] font-mono flex items-center gap-2">
                        <span>{milestone.dateStr}</span>
                        <span>•</span>
                        <span className="text-[#4A6B82] font-bold">{milestone.ageStr}</span>
                      </div>
                    </div>
                  </div>

                  <span className="text-[11px] px-2.5 py-1 rounded-full bg-[#7B96AC]/20 text-[#4A6B82] border border-[#7B96AC]/30 font-semibold flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Открыто
                  </span>
                </div>

                {/* Subtitle & Description */}
                <div className="text-xs font-semibold text-[#4A6B82] mt-1">
                  {milestone.subtitle}
                </div>
                <p className="text-xs text-[#7A756B] mt-1.5 leading-relaxed">
                  {milestone.description}
                </p>
              </div>
            </motion.div>
          );
        })}

        {/* Immediate Next Mystery Milestone Teaser */}
        {nextMilestone && (
          <div className="relative">
            {/* Timeline Dot */}
            <div className="absolute -left-6 sm:-left-10 top-3 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 bg-[#F0EDE6] border-[#E5E1D8] text-[#A39E93]">
              <Lock className="w-3 h-3" />
            </div>

            <div className="p-5 rounded-3xl border border-dashed border-[#7B96AC]/50 bg-[#FDFBF7] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[#4A6B82]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#7B96AC]/15 flex items-center justify-center text-xl">
                  🔒
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#3D3D3D] flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#D48166]" />
                    Следующее памятное событие
                  </h4>
                  <div className="text-xs text-[#7A756B] mt-0.5">
                    Играй дальше, чтобы открыть новые этапы своей жизни
                  </div>
                </div>
              </div>

              <div className="text-[11px] font-mono text-[#7A756B] bg-[#F0EDE6] px-3 py-1.5 rounded-xl border border-[#E5E1D8] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#4A6B82]" />
                Таинственная страница судьбы...
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
