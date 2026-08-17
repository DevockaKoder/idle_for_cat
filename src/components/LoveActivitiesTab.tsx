import React from 'react';
import { GameState, LoveActivity, GiftItem } from '../types';
import { LOVE_ACTIVITIES_CATALOG, GIFTS_CATALOG } from '../data/gameData';
import { formatNumber } from '../utils/formatters';
import { Heart, Sparkles, Gift, Film, PhoneCall, Check, Lock, Flame } from 'lucide-react';

interface LoveActivitiesTabProps {
  gameState: GameState;
  onUpgradeActivity: (activity: LoveActivity) => void;
  onBuyGift: (gift: GiftItem) => void;
  onOpenMovieNight: () => void;
}

export const LoveActivitiesTab: React.FC<LoveActivitiesTabProps> = ({
  gameState,
  onUpgradeActivity,
  onBuyGift,
  onOpenMovieNight,
}) => {
  const hasMet = gameState.totalDays >= 10359;

  const getActivityCost = (activity: LoveActivity, currentLevel: number) => {
    const mult = Math.pow(1.22, currentLevel);
    return {
      love: Math.floor(activity.baseLoveCost * mult),
      coins: Math.floor(activity.baseCoinCost * mult),
    };
  };

  if (!hasMet) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-[#E5E1D8] shadow-sm">
        <div className="w-16 h-16 rounded-full bg-[#D48166]/15 border border-[#D48166]/30 flex items-center justify-center text-3xl mx-auto mb-3 animate-pulse">
          🔒
        </div>
        <h3 className="text-lg font-bold text-[#3D3D3D]">Любовный раздел заблокирован</h3>
        <p className="text-xs text-[#7A756B] max-w-md mx-auto mt-1">
          Этот раздел откроется в день вашей судьбоносной встречи — <span className="text-[#D48166] font-bold">7 сентября 2024 года</span> (в возрасте 28 лет, 4 месяца, 10 дней)!
        </p>
        <div className="mt-4 text-xs text-[#4A6B82] font-mono font-semibold">
          Осталось прожить: {Math.max(0, Math.floor(10359 - gameState.totalDays))} дней
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner with Cozy Movie Button */}
      <div className="bg-[#D48166]/10 border border-[#D48166]/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">💖</span>
            <h2 className="text-lg sm:text-xl font-extrabold text-[#4A6B82]">Активности с Любимой</h2>
          </div>
          <p className="text-xs text-[#7A756B] mt-1 max-w-xl">
            Мы пока не живем вместе, но согреваем друг друга звонками, поцелуями, приятными подарками и совместными вечерами!
          </p>
        </div>

        <button
          onClick={onOpenMovieNight}
          className="px-4 py-2.5 rounded-xl bg-[#D48166] hover:bg-[#c27258] text-white font-bold text-xs sm:text-sm shadow-xs flex items-center gap-2 transition transform active:scale-95 cursor-pointer shrink-0"
        >
          <Film className="w-4 h-4" />
          <span>Устроить киновечер 🍿</span>
        </button>
      </div>

      {/* Love Activities List */}
      <div>
        <h3 className="text-sm font-bold text-[#4A6B82] uppercase tracking-wider mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#D48166]" /> Совместные привычки и нежность
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {LOVE_ACTIVITIES_CATALOG.map((activity) => {
            const level = gameState.activities[activity.id] || 0;
            const isMax = level >= activity.maxLevel;
            const cost = getActivityCost(activity, level);
            const canAfford =
              gameState.lovePoints >= cost.love && gameState.coins >= cost.coins && !isMax;

            return (
              <div
                key={activity.id}
                className={`p-4 rounded-2xl border transition-all duration-300 ${
                  isMax
                    ? 'bg-[#FDFBF7] border-[#E5E1D8]'
                    : canAfford
                    ? 'bg-white border-[#E5E1D8] hover:border-[#D48166]/50 shadow-xs'
                    : 'bg-[#F9F7F2] border-[#E5E1D8] opacity-70'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#D48166]/15 border border-[#D48166]/30 flex items-center justify-center text-2xl shrink-0 shadow-xs">
                    {activity.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm sm:text-base text-[#3D3D3D]">{activity.name}</h4>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#F0EDE6] border border-[#E5E1D8] text-[#4A6B82] font-semibold">
                        Ур. {level}/{activity.maxLevel}
                      </span>
                    </div>
                    <p className="text-xs text-[#7A756B] mt-0.5">{activity.description}</p>

                    <div className="flex flex-wrap gap-2 mt-2 text-[11px]">
                      <span className="text-[#D48166] font-mono font-semibold flex items-center gap-1">
                        <Heart className="w-3 h-3 fill-[#D48166]" /> +{formatNumber(activity.lovePerSec * (level || 1))}/с
                      </span>
                      <span className="text-[#4A6B82] font-mono font-semibold">
                        +{(activity.warmthMultiplier * 100 * (level || 1)).toFixed(0)}% к теплу
                      </span>
                    </div>
                  </div>
                </div>

                {/* Upgrade Button */}
                <div className="mt-3 pt-2.5 border-t border-[#E5E1D8] flex items-center justify-between">
                  <div className="text-xs font-mono flex items-center gap-2">
                    {isMax ? (
                      <span className="text-[#D48166] flex items-center gap-1 font-semibold">
                        <Check className="w-3.5 h-3.5 text-[#4A6B82]" /> Максимум любви!
                      </span>
                    ) : (
                      <div className="flex items-center gap-2 text-[11px]">
                        {cost.love > 0 && (
                          <span className={gameState.lovePoints >= cost.love ? 'text-[#D48166] font-bold font-mono' : 'text-[#A39E93]'}>
                            {formatNumber(cost.love)} ❤️
                          </span>
                        )}
                        {cost.coins > 0 && (
                          <span className={gameState.coins >= cost.coins ? 'text-[#4A6B82] font-bold font-mono' : 'text-[#A39E93]'}>
                            {formatNumber(cost.coins)} 💰
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {!isMax && (
                    <button
                      onClick={() => onUpgradeActivity(activity)}
                      disabled={!canAfford}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                        canAfford
                          ? 'bg-[#D48166] hover:bg-[#c27258] text-white shadow-xs cursor-pointer active:scale-95'
                          : 'bg-[#F0EDE6] text-[#A39E93] border border-[#E5E1D8] cursor-not-allowed'
                      }`}
                    >
                      <Heart className="w-3.5 h-3.5 fill-current" />
                      <span>Прокачать</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Gifts & Surprises Showcase */}
      <div>
        <h3 className="text-sm font-bold text-[#4A6B82] uppercase tracking-wider mb-3 flex items-center gap-2">
          <Gift className="w-4 h-4 text-[#E6AF2E]" /> Подарки & Романтические Сюрпризы
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {GIFTS_CATALOG.map((gift) => {
            const isPurchased = gameState.unlockedGifts.includes(gift.id);
            const canAfford =
              gameState.coins >= gift.coinCost && gameState.lovePoints >= gift.loveCost && !isPurchased;

            return (
              <div
                key={gift.id}
                className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between ${
                  isPurchased
                    ? 'bg-[#FDFBF7] border-[#7B96AC]/50 shadow-xs'
                    : canAfford
                    ? 'bg-white border-[#E5E1D8] hover:border-[#D48166]'
                    : 'bg-[#F9F7F2] border-[#E5E1D8] opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl">{gift.icon}</span>
                    {isPurchased ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#7B96AC]/20 text-[#4A6B82] border border-[#7B96AC]/30 font-bold">
                        Подарено ❤️
                      </span>
                    ) : (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#E6AF2E]/15 text-[#3D3D3D] font-mono font-semibold">
                        +{(gift.warmthBonus * 100).toFixed(0)}% множитель
                      </span>
                    )}
                  </div>

                  <h4 className="font-bold text-sm text-[#3D3D3D] mt-2">{gift.name}</h4>
                  <p className="text-xs text-[#7A756B] mt-1 leading-snug">{gift.description}</p>

                  {isPurchased && (
                    <div className="mt-2 p-2 rounded-xl bg-[#F0EDE6] border border-[#E5E1D8] text-[11px] text-[#4A6B82] font-serif italic">
                      {gift.girlfriendReaction}
                    </div>
                  )}
                </div>

                <div className="mt-3 pt-2 border-t border-[#E5E1D8]">
                  {isPurchased ? (
                    <div className="text-xs text-[#4A6B82] text-center font-medium flex items-center justify-center gap-1">
                      <Check className="w-3.5 h-3.5 text-[#4A6B82]" /> В коллекции воспоминаний
                    </div>
                  ) : (
                    <button
                      onClick={() => onBuyGift(gift)}
                      disabled={!canAfford}
                      className={`w-full py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                        canAfford
                          ? 'bg-[#D48166] hover:bg-[#c27258] text-white shadow-xs cursor-pointer active:scale-95'
                          : 'bg-[#F0EDE6] text-[#A39E93] border border-[#E5E1D8] cursor-not-allowed'
                      }`}
                    >
                      <span>Подарить:</span>
                      <span className="font-mono">{formatNumber(gift.coinCost)} 💰</span>
                      <span className="font-mono">({formatNumber(gift.loveCost)} ❤️)</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
