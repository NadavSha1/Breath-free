// Award Library - Updated to use unified calculations
import { calculateUnifiedStats } from './dataCalculations';

export const AWARD_CATEGORIES = {
  progress: { name: "Progress", color: "blue", icon: "trending-up" },
  health: { name: "Health", color: "green", icon: "heart" },
  consistency: { name: "Consistency", color: "purple", icon: "calendar" },
  money: { name: "Money", color: "yellow", icon: "dollar-sign" },
  logging: { name: "Logging", color: "gray", icon: "edit" },
  milestone: { name: "Milestone", color: "gold", icon: "trophy" }
};

export const AWARDS_LIBRARY = [
  // 💨 Cigarettes Avoided - Progress Category
  {
    id: "first_five",
    name: "The First Five",
    description: "You've avoided 5 cigarettes. Every one counts.",
    category: "progress",
    badge_icon: "award",
    badge_color: "blue",
    logic: (data) => data.cigarettesAvoided >= 5,
    target_value: 5,
    progress_key: "cigarettesAvoided"
  },
  {
    id: "pack_saver",
    name: "Pack Saver",
    description: "You've saved an entire pack!",
    category: "progress",
    badge_icon: "package",
    badge_color: "green",
    logic: (data) => data.cigarettesAvoided >= 20,
    target_value: 20,
    progress_key: "cigarettesAvoided"
  },
  {
    id: "avoider_50",
    name: "Avoider: 50 Club",
    description: "You've dodged 50 cigarettes. That's strength.",
    category: "progress",
    badge_icon: "shield",
    badge_color: "blue",
    logic: (data) => data.cigarettesAvoided >= 50,
    target_value: 50,
    progress_key: "cigarettesAvoided"
  },
  {
    id: "avoider_elite_100",
    name: "Avoider Elite: 100",
    description: "100 cigarettes not smoked. Your lungs love you.",
    category: "progress",
    badge_icon: "trophy",
    badge_color: "purple",
    logic: (data) => data.cigarettesAvoided >= 100,
    target_value: 100,
    progress_key: "cigarettesAvoided"
  },
  {
    id: "avoider_champion_500",
    name: "Avoider Champion: 500",
    description: "500 cigarettes dodged. You're becoming unstoppable.",
    category: "progress",
    badge_icon: "crown",
    badge_color: "gold",
    logic: (data) => data.cigarettesAvoided >= 500,
    target_value: 500,
    progress_key: "cigarettesAvoided"
  },

  // ⏳ Life Regained - Health Category
   {
    id: "one_hour_healthier",
    name: "1 Hour Healthier",
    description: "An hour of life regained through better choices.",
    category: "health",
    badge_icon: "clock",
    badge_color: "green",
    logic: (data) => data.lifeRegainedMinutes >= 60,
    target_value: 60,
    progress_key: "lifeRegainedMinutes"
  },
  {
    id: "half_day_back",
    name: "Half a Day Back",
    description: "12 hours of life regained. Not bad at all.",
    category: "health",
    badge_icon: "hourglass",
    badge_color: "green",
    logic: (data) => data.lifeRegainedMinutes >= 720,
    target_value: 720,
    progress_key: "lifeRegainedMinutes"
  },
  {
    id: "full_day_bonus",
    name: "Full Day Bonus",
    description: "You just gained back an entire day of life.",
    category: "health",
    badge_icon: "calendar",
    badge_color: "purple",
    logic: (data) => data.lifeRegainedMinutes >= 1440,
    target_value: 1440,
    progress_key: "lifeRegainedMinutes"
  },

  // 💰 Money Saved - Money Category
  {
    id: "first_dollar_saved",
    name: "First Dollar Saved",
    description: "Your first dollar saved! Many more to come.",
    category: "money",
    badge_icon: "dollar-sign",
    badge_color: "yellow",
    logic: (data) => data.moneySaved >= 1,
    target_value: 1,
    progress_key: "moneySaved"
  },
  {
    id: "twenty_dollar_saver",
    name: "$20 Saver",
    description: "You've saved $20! That's a nice meal out.",
    category: "money",
    badge_icon: "banknote",
    badge_color: "yellow",
    logic: (data) => data.moneySaved >= 20,
    target_value: 20,
    progress_key: "moneySaved"
  },

  // 📊 Consistency - Logging Category
  {
    id: "consistent_logger",
    name: "Consistent Logger",
    description: "3 days of consistent logging. Building good habits!",
    category: "logging",
    badge_icon: "edit",
    badge_color: "gray",
    logic: (data) => data.loggingStreakDays >= 3,
    target_value: 3,
    progress_key: "loggingStreakDays"
  },
  {
    id: "week_logger",
    name: "Week Logger",
    description: "A full week of logging. You're committed!",
    category: "logging",
    badge_icon: "calendar-check",
    badge_color: "purple",
    logic: (data) => data.loggingStreakDays >= 7,
    target_value: 7,
    progress_key: "loggingStreakDays"
  }
];

// Memoized calculation function
let calculationCache = new Map();
let cacheExpiry = 0;
const CACHE_DURATION = 5000; // 5 seconds

export const calculateAwardData = (entries, userData, journeyStart) => {
  const now = Date.now();
  const cacheKey = `${entries.length}-${userData.id}-${journeyStart}`;
  
  // Check if we have valid cached data
  if (now < cacheExpiry && calculationCache.has(cacheKey)) {
    return calculationCache.get(cacheKey);
  }
  
  // Calculate fresh data
  const data = calculateUnifiedStats(entries, userData, journeyStart);
  
  // Update cache
  calculationCache.clear(); // Clear old cache
  calculationCache.set(cacheKey, data);
  cacheExpiry = now + CACHE_DURATION;
  
  return data;
};

export const getAwardProgress = (awardTemplate, awardData) => {
  const progressKey = awardTemplate.progress_key;
  return awardData[progressKey] || 0;
};

export const checkAwardUnlock = (awardTemplate, awardData) => {
  try {
    return awardTemplate.logic(awardData);
  } catch (error) {
    console.error(`Error checking award unlock for ${awardTemplate.name}:`, error);
    return false;
  }
};

// Batch process awards for better performance
export const processBatchAwards = (entries, userData, journeyStart) => {
  const awardData = calculateAwardData(entries, userData, journeyStart);
  
  return AWARDS_LIBRARY.map(template => ({
    template,
    progress: getAwardProgress(template, awardData),
    unlocked: checkAwardUnlock(template, awardData),
    data: awardData
  }));
};