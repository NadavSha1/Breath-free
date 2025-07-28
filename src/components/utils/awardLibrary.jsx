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
    id: "coffee_on_me",
    name: "Coffee on Me",
    description: "Enough saved for a coffee.",
    category: "money",
    badge_icon: "coffee",
    badge_color: "yellow",
    logic: (data) => data.moneySaved >= 5,
    target_value: 5,
    progress_key: "moneySaved"
  },
  {
    id: "saved_tenner",
    name: "Saved a Tenner",
    description: "10 bucks saved — that's a coffee and a snack.",
    category: "money",
    badge_icon: "dollar-sign",
    badge_color: "yellow",
    logic: (data) => data.moneySaved >= 10,
    target_value: 10,
    progress_key: "moneySaved"
  },
  {
    id: "smokin_saver_100",
    name: "Smokin' Saver: $100",
    description: "That's $100 not lit on fire. Nice work.",
    category: "money",
    badge_icon: "dollar-sign",
    badge_color: "yellow",
    logic: (data) => data.moneySaved >= 100,
    target_value: 100,
    progress_key: "moneySaved"
  },
  {
    id: "money_boss_500",
    name: "Money Boss: $500",
    description: "Half a grand saved. Still smoke-free.",
    category: "money",
    badge_icon: "piggy-bank",
    badge_color: "gold",
    logic: (data) => data.moneySaved >= 500,
    target_value: 500,
    progress_key: "moneySaved"
  },

  // 📉 Reduced Daily Smoking - Progress Category
  {
    id: "half_cut_hero",
    name: "Half Cut Hero",
    description: "You've cut your daily smoking by 50%. Respect.",
    category: "progress",
    badge_icon: "trending-down",
    badge_color: "blue",
    logic: (data) => data.daysSinceStart >= 7 && data.reductionPercentage >= 50,
    target_value: 50,
    progress_key: "reductionPercentage"
  },
  {
    id: "deep_detox_75",
    name: "Deep Detox: -75%",
    description: "You've dropped your habit by 75%. Almost there.",
    category: "progress",
    badge_icon: "trending-down",
    badge_color: "purple",
    logic: (data) => data.daysSinceStart >= 7 && data.reductionPercentage >= 75,
    target_value: 75,
    progress_key: "reductionPercentage"
  },

  // 🔥 Streaks (Days Without Smoking) - Milestone Category
  {
    id: "one_day_wall",
    name: "1-Day Wall",
    description: "You've gone 24 hours without smoking. That's the first wall broken.",
    category: "milestone",
    badge_icon: "star",
    badge_color: "green",
    logic: (data) => data.currentStreakDays >= 1,
    target_value: 1,
    progress_key: "currentStreakDays"
  },
  {
    id: "week_warrior",
    name: "The Week Warrior",
    description: "7 days clean. That's a full circle.",
    category: "milestone",
    badge_icon: "trophy",
    badge_color: "blue",
    logic: (data) => data.currentStreakDays >= 7,
    target_value: 7,
    progress_key: "currentStreakDays"
  },
  {
    id: "unshakeable_30",
    name: "Unshakeable: 30 Days",
    description: "One full month smoke-free. That's transformation.",
    category: "milestone",
    badge_icon: "crown",
    badge_color: "gold",
    logic: (data) => data.currentStreakDays >= 30,
    target_value: 30,
    progress_key: "currentStreakDays"
  },

  // ✅ Logging Streaks - Logging & Consistency Categories
  {
    id: "getting_started",
    name: "Getting Started",
    description: "You've logged your very first cigarette. The journey begins.",
    category: "logging",
    badge_icon: "plus-circle",
    badge_color: "green",
    logic: (data) => data.totalLogs >= 1,
    target_value: 1,
    progress_key: "totalLogs"
  },
  {
    id: "daily_logger_3",
    name: "Daily Logger: 3 Days",
    description: "You've logged a cigarette 3 days in a row.",
    category: "consistency",
    badge_icon: "calendar",
    badge_color: "purple",
    logic: (data) => data.loggingStreakDays >= 3,
    target_value: 3,
    progress_key: "loggingStreakDays"
  },
  {
    id: "daily_logger_7",
    name: "Daily Logger: 7 Days",
    description: "7 days straight of tracking. That's how change begins.",
    category: "consistency",
    badge_icon: "calendar-check",
    badge_color: "purple",
    logic: (data) => data.loggingStreakDays >= 7,
    target_value: 7,
    progress_key: "loggingStreakDays"
  },
  {
    id: "habit_tracker_pro_30",
    name: "Habit Tracker Pro: 30 Days",
    description: "30 days of logs — win or lose, you're showing up.",
    category: "consistency",
    badge_icon: "clipboard-check",
    badge_color: "gold",
    logic: (data) => data.loggingStreakDays >= 30,
    target_value: 30,
    progress_key: "loggingStreakDays"
  }
];

// Helper function to get current progress for an award using unified calculations
export const getAwardProgress = (award, data) => {
  if (!award.progress_key || data[award.progress_key] === undefined) return 0;
  
  const currentValue = data[award.progress_key];
  return Math.min(currentValue, award.target_value);
};

// Helper function to check if award should be unlocked using unified calculations
export const checkAwardUnlock = (award, data) => {
  return award.logic(data);
};

// Use the unified calculation system
export const calculateAwardData = calculateUnifiedStats;