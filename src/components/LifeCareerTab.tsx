import React, { useState } from 'react';
import { GameState, UpgradeItem } from '../types';
import { UPGRADES_CATALOG } from '../data/gameData';
import { formatNumber, formatAgeFromDays } from '../utils/formatters';
import { Coins, ArrowUpCircle, CheckCircle2, TrendingUp, Sparkles, Clock, ChevronDown, ChevronUp } from 'lucide-react';

interface LifeCareerTabProps {
  gameState: GameState;
  onBuyUpgrade: (upgrade: UpgradeItem) => void;
}

export const LifeCareerTab: React.FC<LifeCareerTabProps> = ({ gameState, onBuyUpgrade }) => {
  const [showCompletedArchive, setShowCompletedArchive] = useState(false);

  const getUpgradeCost = (item: UpgradeItem, currentLevel: number) => {
    return Math.floor(item.cost * Math.pow(item.costMultiplier, currentLevel));
  };

  const currentAge = formatAgeFromDays(gameState.totalDays);

  // Available upgrades unlocked so far by age
  const availableUpgrades = UPGRADES_CATALOG.filter(
    (item) => gameState.totalDays >= (item.requiredDays || 0)
  );

  // Active upgrades to show in the main grid:
  // 1. Keep if not maxed (even if old, player still needs to finish it)
  // 2. If maxed, hide once newer age-tier upgrades have appeared
  const activeUpgrades = availableUpgrades.filter((item) => {
    const level = gameState.upgrades[item.id] || 0;
    const isMax = level >= item.maxLevel;
    if (!isMax) return true;

    const hasNewerAvailable = availableUpgrades.some(
      (other) => (other.requiredDays || 0) > (item.requiredDays || 0)
    );
    return !hasNewerAvailable;
  });

  const completedArchivedUpgrades = availableUpgrades.filter(
    (item) => !activeUpgrades.includes(item)
  );

  const hasLockedUpgrades = UPGRADES_CATALOG.some(
    (item) => gameState.totalDays < (item.requiredDays || 0)
  );

  const renderUpgradeCard = (item: UpgradeItem, isArchived = false) => {
    const level = gameState.upgrades[item.id] || 0;
    const isMax = level >= item.maxLevel;
    const cost = getUpgradeCost(item, level);
    const canAfford = gameState.coins >= cost && !isMax;

    return (
      <div
        key={item.id}
        className={`p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden ${
          isMax
            ? 'bg-[#FDFBF7] border-[#7B96AC]/40 shadow-xs'
            : canAfford
            ? 'bg-white border-[#E5E1D8] hover:border-[#7B96AC] hover:shadow-xs'
            : 'bg-[#F9F7F2] border-[#E5E1D8] opacity-85'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 w-full">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-xs shrink-0 border bg-[#F0EDE6] border-[#E5E1D8]">
              {item.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <h3 className="font-bold text-sm sm:text-base text-[#3D3D3D]">{item.name}</h3>
                <span
                  className={`text-[11px] font-mono px-2 py-0.5 rounded-full border font-semibold ${
                    level > 0
                      ? 'bg-[#7B96AC]/20 text-[#4A6B82] border-[#7B96AC]/30'
                      : 'bg-[#F0EDE6] text-[#7A756B] border-[#E5E1D8]'
                  }`}
                >
                  Ур. {level}/{item.maxLevel}
                </span>
              </div>
              <p className="text-xs text-[#7A756B] mt-1 leading-relaxed">{item.description}</p>

              {/* Special Warm Quotes */}
              {item.quote && (
                <div className="mt-2 p-2.5 rounded-xl bg-[#F0EDE6]/80 border border-[#E5E1D8] text-[11px] text-[#4A6B82] italic font-medium leading-relaxed">
                  💬 {item.quote}
                </div>
              )}

              {/* Bonuses breakdown */}
              <div className="flex flex-wrap gap-2 mt-2 text-[11px]">
                {item.coinsPerSecBonus && (
                  <span className="text-[#4A6B82] bg-[#4A6B82]/10 px-2 py-0.5 rounded-md flex items-center gap-1 font-mono font-semibold">
                    <Coins className="w-3 h-3" /> +{formatNumber(item.coinsPerSecBonus * Math.max(1, level))}/с
                  </span>
                )}
                {item.incomeMultiplier && (
                  <span className="text-[#D48166] bg-[#D48166]/15 px-2 py-0.5 rounded-md flex items-center gap-1 font-mono font-bold">
                    <TrendingUp className="w-3 h-3" /> x{item.incomeMultiplier} к общему доходу!
                  </span>
                )}
                {item.clickBonus && (
                  <span className="text-[#7B96AC] bg-[#7B96AC]/10 px-2 py-0.5 rounded-md font-mono font-semibold">
                    +{item.clickBonus * Math.max(1, level)} к клику
                  </span>
                )}
                {item.daysPerClickBonus && (
                  <span className="text-[#7A756B] bg-[#F0EDE6] px-2 py-0.5 rounded-md flex items-center gap-1 font-mono font-semibold">
                    <Clock className="w-3 h-3 text-[#4A6B82]" /> +{(item.daysPerClickBonus * Math.max(1, level)).toFixed(1)} дн./клик
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Purchase Footer */}
        <div className="mt-3 pt-3 border-t border-[#E5E1D8] flex items-center justify-between">
          <div className="text-xs font-mono">
            {isMax ? (
              <span className="text-[#4A6B82] font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#4A6B82]" /> Завершено (Макс. уровень)
              </span>
            ) : (
              <span className={canAfford ? 'text-[#4A6B82] font-bold' : 'text-[#A39E93]'}>
                Стоимость: {formatNumber(cost)} 💰
              </span>
            )}
          </div>

          {!isMax && (
            <button
              onClick={() => onBuyUpgrade(item)}
              disabled={!canAfford}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                canAfford
                  ? 'bg-[#4A6B82] hover:bg-[#3D5A70] text-white shadow-xs cursor-pointer active:scale-95'
                  : 'bg-[#F0EDE6] text-[#A39E93] border border-[#E5E1D8] cursor-not-allowed'
              }`}
            >
              <ArrowUpCircle className="w-3.5 h-3.5" />
              <span>{level === 0 ? 'Открыть' : 'Улучшить'}</span>
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-[#4A6B82] flex items-center gap-2">
            <span>💼</span> Жизнь, Обучение & Развитие
          </h2>
          <p className="text-xs text-[#7A756B]">
            Новые этапы жизни и возможности открываются по мере твоего реального взросления!
          </p>
        </div>
        <div className="bg-[#F0EDE6] border border-[#E5E1D8] px-3 py-1 rounded-xl text-xs text-[#4A6B82] font-semibold">
          Возраст: <span className="font-mono text-[#D48166]">{currentAge.years} лет, {currentAge.months} мес.</span>
        </div>
      </div>

      {/* Active Upgrades Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {activeUpgrades.map((item) => renderUpgradeCard(item))}
      </div>

      {/* Completed Archived Upgrades Accordion */}
      {completedArchivedUpgrades.length > 0 && (
        <div className="pt-2">
          <button
            onClick={() => setShowCompletedArchive((prev) => !prev)}
            className="w-full py-2.5 px-4 rounded-2xl bg-[#F0EDE6]/60 hover:bg-[#F0EDE6] border border-[#E5E1D8] text-xs font-semibold text-[#7A756B] flex items-center justify-between transition cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#7B96AC]" />
              Завершенные пройденные этапы ({completedArchivedUpgrades.length})
            </span>
            {showCompletedArchive ? (
              <ChevronUp className="w-4 h-4 text-[#7A756B]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[#7A756B]" />
            )}
          </button>

          {showCompletedArchive && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mt-3 animate-fade-in">
              {completedArchivedUpgrades.map((item) => renderUpgradeCard(item, true))}
            </div>
          )}
        </div>
      )}

      {/* Spoiler-free mystery teaser */}
      {hasLockedUpgrades && (
        <div className="mt-4 p-4 rounded-2xl border border-dashed border-[#7B96AC]/40 bg-[#FDFBF7] flex items-center justify-between gap-3 text-xs text-[#4A6B82]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#7B96AC]/15 flex items-center justify-center text-base">
              ✨
            </div>
            <div>
              <div className="font-bold text-[#3D3D3D]">
                Новые этапы жизни впереди
              </div>
              <div className="text-[11px] text-[#7A756B]">
                Играй дальше, чтобы открыть новые этапы своей жизни
              </div>
            </div>
          </div>
          <div className="text-[11px] font-mono text-[#7A756B] bg-[#F0EDE6] px-3 py-1 rounded-xl border border-[#E5E1D8] flex items-center gap-1 shrink-0">
            <Clock className="w-3 h-3 text-[#4A6B82]" />
            <span>Время идет вперед...</span>
          </div>
        </div>
      )}
    </div>
  );
};
