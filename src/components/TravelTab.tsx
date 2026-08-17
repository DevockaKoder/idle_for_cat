import React from 'react';
import { GameState, TravelCity } from '../types';
import { TRAVEL_CITIES } from '../data/gameData';
import { formatNumber } from '../utils/formatters';
import { Plane, MapPin, Compass, Award, Clock, Sparkles, Check, Heart } from 'lucide-react';
import { motion } from 'motion/react';

interface TravelTabProps {
  gameState: GameState;
  onStartTrip: (city: TravelCity) => void;
}

export const TravelTab: React.FC<TravelTabProps> = ({ gameState, onStartTrip }) => {
  const hasMet = gameState.totalDays >= 10359;
  const isCurrentlyTraveling = gameState.currentCityTrip !== null;
  const activeTrip = gameState.currentCityTrip;
  const activeCity = activeTrip ? TRAVEL_CITIES.find((c) => c.id === activeTrip.cityId) : null;

  if (!hasMet) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-[#E5E1D8] shadow-sm">
        <div className="w-16 h-16 rounded-full bg-[#7B96AC]/15 border border-[#7B96AC]/30 flex items-center justify-center text-3xl mx-auto mb-3">
          ✈️
        </div>
        <h3 className="text-lg font-bold text-[#3D3D3D]">Путешествия откроются после встречи</h3>
        <p className="text-xs text-[#7A756B] max-w-md mx-auto mt-1">
          Совместные поездки в разные города станут доступны с <span className="text-[#D48166] font-bold">7 сентября 2024 года</span>, когда вы начнете писать свою историю любви!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Active Trip Banner */}
      {isCurrentlyTraveling && activeCity && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-3xl bg-[#4A6B82] text-white border-2 border-[#7B96AC] shadow-md relative overflow-hidden"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center text-3xl animate-bounce">
                ✈️
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase font-bold text-[#E6AF2E] tracking-wider">
                    В пути прямо сейчас!
                  </span>
                  <span className="text-xs text-white/50">•</span>
                  <span className="text-xs text-white/80">{activeCity.country}</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white">{activeCity.name}</h3>
                <p className="text-xs text-white/80 italic font-serif mt-0.5">{activeCity.quote}</p>
              </div>
            </div>

            {/* Live Trip Progress Bar */}
            <div className="w-full md:w-64 space-y-1.5">
              <div className="flex justify-between text-xs font-mono text-white/90">
                <span>Прогресс поездки:</span>
                <span className="font-bold">{Math.floor(activeTrip.progress)}%</span>
              </div>
              <div className="w-full h-3 rounded-full bg-black/20 border border-white/10 overflow-hidden">
                <div
                  className="h-full bg-[#E6AF2E] transition-all duration-300 rounded-full"
                  style={{ width: `${Math.min(100, activeTrip.progress)}%` }}
                />
              </div>
              <div className="text-[10px] text-white/70 text-right">
                Награда: +{formatNumber(activeCity.loveReward)} ❤️
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Travel Header & Passport Stats */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#E5E1D8] shadow-sm">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-[#4A6B82] flex items-center gap-2">
            <Compass className="w-5 h-5 text-[#4A6B82]" /> Путешествия по Городам
          </h2>
          <p className="text-xs text-[#7A756B]">
            Мы пока живем отдельно, но каждый совместный отпуск в новом городе — это сокровище в копилку воспоминаний!
          </p>
        </div>

        {/* Passport Badge */}
        <div className="flex items-center gap-2 bg-[#F0EDE6] px-3.5 py-1.5 rounded-xl border border-[#E5E1D8] text-xs">
          <Award className="w-4 h-4 text-[#E6AF2E]" />
          <span className="text-[#3D3D3D]">
            Посещено городов: <strong className="text-[#4A6B82] font-mono">{gameState.unlockedCities.length}/{TRAVEL_CITIES.length}</strong>
          </span>
        </div>
      </div>

      {/* Cities Catalog */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {TRAVEL_CITIES.map((city) => {
          const isVisited = gameState.unlockedCities.includes(city.id);
          const visitCount = gameState.cityVisits[city.id] || 0;
          const canAfford =
            gameState.coins >= city.unlockCostCoins &&
            gameState.lovePoints >= city.unlockCostLove &&
            !isCurrentlyTraveling;

          return (
            <div
              key={city.id}
              className={`rounded-3xl border overflow-hidden flex flex-col justify-between transition-all duration-300 ${
                isVisited
                  ? 'bg-white border-[#7B96AC] shadow-sm'
                  : canAfford
                  ? 'bg-white border-[#E5E1D8] hover:border-[#4A6B82] shadow-xs'
                  : 'bg-[#F9F7F2] border-[#E5E1D8] opacity-70'
              }`}
            >
              {/* Card Header & Decorative Banner */}
              <div className="p-4 bg-[#FDFBF7] border-b border-[#E5E1D8] relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#D48166]" />
                    <span className="text-xs font-semibold text-[#7A756B]">{city.country}</span>
                  </div>
                  {isVisited ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#7B96AC]/20 text-[#4A6B82] border border-[#7B96AC]/40 font-bold flex items-center gap-1">
                      <Check className="w-3 h-3" /> Посетили ({visitCount}x)
                    </span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F0EDE6] text-[#A39E93] border border-[#E5E1D8]">
                      Новый маршрут
                    </span>
                  )}
                </div>

                <h3 className="text-base sm:text-lg font-bold text-[#3D3D3D] mt-1">{city.name}</h3>

                <div className="flex flex-wrap gap-1.5 mt-2">
                  {city.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-[#F0EDE6] text-[#4A6B82] font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <p className="text-xs text-[#7A756B] leading-relaxed">{city.description}</p>

                {/* Romantic Quote */}
                <div className="p-2.5 rounded-xl bg-[#FDFBF7] border border-[#E5E1D8] text-[11px] text-[#3D3D3D] font-serif italic">
                  {city.quote}
                </div>

                {/* Souvenir Badge */}
                <div className="flex items-center gap-2 p-2 rounded-xl bg-[#E6AF2E]/15 border border-[#E6AF2E]/30 text-xs text-[#3D3D3D]">
                  <span className="text-lg">{city.souvenirIcon}</span>
                  <div className="leading-tight">
                    <div className="text-[10px] text-[#E6AF2E] font-bold uppercase">Сувенир поездки:</div>
                    <div className="font-semibold">{city.souvenirName}</div>
                  </div>
                </div>

                {/* Trip Stats */}
                <div className="flex items-center justify-between text-xs text-[#7A756B] pt-1 border-t border-[#E5E1D8]">
                  <span className="flex items-center gap-1 font-mono">
                    <Clock className="w-3.5 h-3.5 text-[#4A6B82]" /> {city.tripDurationSec} сек.
                  </span>
                  <span className="flex items-center gap-1 text-[#D48166] font-mono font-bold">
                    <Heart className="w-3.5 h-3.5 fill-[#D48166]" /> +{formatNumber(city.loveReward)} ❤️
                  </span>
                </div>
              </div>

              {/* Card Footer / Action */}
              <div className="p-4 pt-0">
                <button
                  onClick={() => onStartTrip(city)}
                  disabled={!canAfford || isCurrentlyTraveling}
                  className={`w-full py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-xs ${
                    isCurrentlyTraveling
                      ? 'bg-[#F0EDE6] text-[#A39E93] border border-[#E5E1D8] cursor-not-allowed'
                      : canAfford
                      ? 'bg-[#4A6B82] hover:bg-[#3D5A70] text-white cursor-pointer active:scale-95'
                      : 'bg-[#F0EDE6] text-[#A39E93] border border-[#E5E1D8] cursor-not-allowed'
                  }`}
                >
                  <Plane className="w-4 h-4" />
                  <span>Поехать вдвоем:</span>
                  <span className="font-mono">{formatNumber(city.unlockCostCoins)} 💰</span>
                  <span className="font-mono">({formatNumber(city.unlockCostLove)} ❤️)</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
