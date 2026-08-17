import React, { useState } from 'react';
import { MOVIE_GENRES, MOVIE_SNACKS } from '../data/gameData';
import { formatNumber } from '../utils/formatters';
import { Film, Popcorn, X, Play, Heart, Sparkles, Check } from 'lucide-react';
import { motion } from 'motion/react';

interface MovieNightModalProps {
  coins: number;
  lovePoints: number;
  isOpen: boolean;
  onClose: () => void;
  onStartMovie: (genre: typeof MOVIE_GENRES[0], snack: typeof MOVIE_SNACKS[0]) => void;
}

export const MovieNightModal: React.FC<MovieNightModalProps> = ({
  coins,
  lovePoints,
  isOpen,
  onClose,
  onStartMovie,
}) => {
  const [selectedGenre, setSelectedGenre] = useState(MOVIE_GENRES[0]);
  const [selectedSnack, setSelectedSnack] = useState(MOVIE_SNACKS[0]);

  if (!isOpen) return null;

  const canAfford = coins >= selectedSnack.cost;

  const handleStart = () => {
    if (!canAfford) return;
    onStartMovie(selectedGenre, selectedSnack);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-lg bg-white border-2 border-[#D48166] rounded-3xl p-5 sm:p-6 shadow-2xl relative text-[#3D3D3D]"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-[#F0EDE6] text-[#7A756B] hover:text-[#3D3D3D] hover:bg-[#E5E1D8] transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-[#D48166]/15 border border-[#D48166]/30 flex items-center justify-center text-2xl">
            🍿
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-[#4A6B82]">Уютный Киновечер Вдвоем</h3>
            <p className="text-xs text-[#7A756B]">
              Включаем фильм одновременно, укрываемся пледом и наслаждаемся вечером!
            </p>
          </div>
        </div>

        {/* Step 1: Select Genre */}
        <div className="space-y-2 mb-4">
          <label className="text-xs font-bold text-[#4A6B82] uppercase tracking-wider flex items-center gap-1.5">
            <Film className="w-3.5 h-3.5 text-[#D48166]" /> 1. Выберите жанр кино:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {MOVIE_GENRES.map((genre) => (
              <button
                key={genre.id}
                onClick={() => setSelectedGenre(genre)}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  selectedGenre.id === genre.id
                    ? 'bg-[#D48166]/15 border-[#D48166] text-[#3D3D3D] shadow-xs ring-1 ring-[#D48166]'
                    : 'bg-[#FDFBF7] border-[#E5E1D8] text-[#7A756B] hover:bg-[#F0EDE6]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{genre.icon}</span>
                  <div>
                    <div className="text-xs font-bold text-[#3D3D3D]">{genre.name}</div>
                    <div className="text-[10px] text-[#D48166] font-medium">{genre.buff}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Select Snacks */}
        <div className="space-y-2 mb-5">
          <label className="text-xs font-bold text-[#4A6B82] uppercase tracking-wider flex items-center gap-1.5">
            <Popcorn className="w-3.5 h-3.5 text-[#E6AF2E]" /> 2. Вкусняшки к фильму:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {MOVIE_SNACKS.map((snack) => (
              <button
                key={snack.id}
                onClick={() => setSelectedSnack(snack)}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  selectedSnack.id === snack.id
                    ? 'bg-[#E6AF2E]/20 border-[#E6AF2E] text-[#3D3D3D] shadow-xs ring-1 ring-[#E6AF2E]'
                    : 'bg-[#FDFBF7] border-[#E5E1D8] text-[#7A756B] hover:bg-[#F0EDE6]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{snack.icon}</span>
                    <span className="text-xs font-medium text-[#3D3D3D]">{snack.name}</span>
                  </div>
                  <span className="text-[11px] font-mono text-[#4A6B82] font-bold">
                    {formatNumber(snack.cost)} 💰
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Quote / Vibe Box */}
        <div className="p-3 rounded-2xl bg-[#FDFBF7] border border-[#D48166]/30 text-xs text-[#3D3D3D] font-serif italic text-center mb-5">
          {selectedGenre.quote}
        </div>

        {/* Action Button */}
        <button
          onClick={handleStart}
          disabled={!canAfford}
          className={`w-full py-3 rounded-2xl font-bold text-sm sm:text-base transition-all flex items-center justify-center gap-2 shadow-xs ${
            canAfford
              ? 'bg-[#D48166] hover:bg-[#c27258] text-white cursor-pointer active:scale-95'
              : 'bg-[#F0EDE6] text-[#A39E93] border border-[#E5E1D8] cursor-not-allowed'
          }`}
        >
          <Play className="w-5 h-5 fill-current" />
          <span>Начать совместный просмотр ({formatNumber(selectedSnack.cost)} 💰)</span>
        </button>
      </motion.div>
    </div>
  );
};
