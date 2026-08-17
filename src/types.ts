export interface GameState {
  // Timeline & Age
  totalDays: number; // Starts from 0 (or pre-accelerated) up to 11089+
  simSpeed: number; // 1x, 2x, 5x, 10x, 50x
  isPaused2026: number; // 0 = no, 1 = triggered pause on 7 Sep 2026
  hasMetHer: boolean; // true if totalDays >= 10359
  gameStartTimeStamp: number;
  lastSaveTimestamp: number;

  // Resources
  energy: number;
  maxEnergy: number;
  coins: number;
  lovePoints: number;
  totalKisses: number;
  totalGiftsGiven: number;
  totalTripsCompleted: number;
  totalMoviesWatched: number;

  // Multipliers & Prestige
  energyPerSec: number;
  coinsPerSec: number;
  lovePerSec: number;
  clickPower: number;
  loveMultiplier: number;
  comboStreak: number;
  daysPerClick: number; // dynamically computed days per manual time step
  daysPerSec: number; // dynamically computed passive days advancement per second
  isAfk: boolean; // whether the player is currently inactive (expenses mode)
  expensePerSec: number; // current expenses deducted per second when idle

  // Purchased Upgrades
  upgrades: Record<string, number>; // upgradeId -> level
  activities: Record<string, number>; // activityId -> level
  unlockedCities: string[]; // city IDs unlocked/visited
  cityVisits: Record<string, number>; // cityId -> count
  unlockedGifts: string[]; // gift IDs purchased
  unlockedMemories: string[]; // memory milestone IDs unlocked

  // Current Active Mini-Event
  currentCityTrip: {
    cityId: string;
    progress: number;
    duration: number;
    startTime: number;
  } | null;

  activeMovie: {
    title: string;
    genre: string;
    snack: string;
    progress: number;
    duration: number;
  } | null;

  // Settings
  soundEnabled: boolean;
  musicEnabled: boolean;
  endlessMode: boolean; // after 2026 unlocked
  hasStartedTogether: boolean; // true after user clicks "Начать новую главу вдвоем!"
}

export interface UpgradeItem {
  id: string;
  name: string;
  category: 'life' | 'career' | 'comfort' | 'tech' | 'routine' | 'study';
  description: string;
  quote?: string;
  cost: number;
  costMultiplier: number;
  icon: string;
  energyPerSecBonus?: number;
  coinsPerSecBonus?: number;
  clickBonus?: number;
  incomeMultiplier?: number;
  daysPerClickBonus?: number;
  passiveDaysBonus?: number;
  maxLevel: number;
  requiredDays?: number;
  requiredAgeStr?: string;
}

export interface LoveActivity {
  id: string;
  name: string;
  description: string;
  baseLoveCost: number;
  baseCoinCost: number;
  lovePerSec: number;
  warmthMultiplier: number;
  icon: string;
  cooldownSec: number;
  level: number;
  maxLevel: number;
}

export interface TravelCity {
  id: string;
  name: string;
  country: string;
  imageTag: string;
  description: string;
  unlockCostCoins: number;
  unlockCostLove: number;
  tripDurationSec: number;
  loveReward: number;
  souvenirName: string;
  souvenirIcon: string;
  quote: string;
  coordinates: { x: number; y: number }; // percentage on map
  tags: string[];
}

export interface GiftItem {
  id: string;
  name: string;
  description: string;
  coinCost: number;
  loveCost: number;
  icon: string;
  girlfriendReaction: string;
  warmthBonus: number;
}

export interface MemoryMilestone {
  id: string;
  day: number;
  dateStr: string;
  ageStr: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  isSpecialAnniversary?: boolean;
  romanticNote?: string;
  unlockedByDefault?: boolean;
}

export interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  icon?: string;
}
