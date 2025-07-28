import { differenceInDays, startOfDay, format } from "date-fns";

// Centralized calculation functions to ensure consistency across awards and stats
export const calculateUnifiedStats = (entries, userData, journeyStart) => {
  const now = new Date();
  const journeyStartDate = journeyStart ? new Date(journeyStart) : now;
  
  // Filter entries to only include those from onboarding date onwards
  const validEntries = entries.filter(e => {
    const entryDate = new Date(e.timestamp);
    return entryDate >= journeyStartDate && entryDate <= now;
  });
  
  // Calculate total days since onboarding (including today)
  const daysSinceOnboarding = Math.max(1, differenceInDays(now, journeyStartDate) + 1);
  
  // Get user's baseline smoking data
  const baselineCigarettesPerDay = userData.cigarettes_per_day_before || 0;
  const costPerPack = userData.cost_per_pack || 0;
  const cigarettesPerPack = userData.cigarettes_per_pack || 20;
  
  // Calculate cigarettes avoided
  const expectedCigarettes = baselineCigarettesPerDay * daysSinceOnboarding;
  const actualCigarettes = validEntries.length;
  const cigarettesAvoided = Math.max(0, expectedCigarettes - actualCigarettes);
  
  // Calculate money saved
  const pricePerCigarette = cigarettesPerPack > 0 ? costPerPack / cigarettesPerPack : 0;
  const moneySaved = cigarettesAvoided * pricePerCigarette;
  
  // Calculate life regained (5 minutes per cigarette avoided)
  const lifeRegainedMinutes = cigarettesAvoided * 5;
  
  // Calculate current daily average
  const currentDailyAvg = actualCigarettes / daysSinceOnboarding;
  
  // Calculate reduction percentage
  const reductionPercentage = baselineCigarettesPerDay > 0 
    ? Math.max(0, ((baselineCigarettesPerDay - currentDailyAvg) / baselineCigarettesPerDay) * 100)
    : 0;
  
  // Calculate smoke-free streak
  const currentStreakDays = validEntries.length === 0 
    ? daysSinceOnboarding // If no cigarettes logged, streak is from journey start
    : Math.max(0, differenceInDays(now, new Date(validEntries[0].timestamp)));
  
  // Calculate logging streak (consecutive days with logs)
  const loggingStreakDays = calculateLoggingStreak(validEntries);
  
  return {
    daysSinceOnboarding,
    cigarettesAvoided,
    moneySaved,
    lifeRegainedMinutes,
    currentDailyAvg,
    reductionPercentage,
    currentStreakDays,
    loggingStreakDays,
    totalLogs: validEntries.length,
    baselineCigarettesPerDay,
    validEntries // Return filtered entries for other calculations
  };
};

// Calculate logging streak (consecutive days with entries)
export const calculateLoggingStreak = (entries) => {
  if (entries.length === 0) return 0;
  
  // Get unique dates with logs
  const logDates = [...new Set(entries.map(entry => 
    format(new Date(entry.timestamp), 'yyyy-MM-dd')
  ))].sort().reverse(); // Most recent first
  
  if (logDates.length === 0) return 0;
  
  let streak = 1; // Start with 1 for the most recent day
  const today = format(new Date(), 'yyyy-MM-dd');
  const yesterday = format(new Date(Date.now() - 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
  
  // If no log today or yesterday, streak is 0
  if (logDates[0] !== today && logDates[0] !== yesterday) {
    return 0;
  }
  
  // Check consecutive days backwards from the most recent log
  for (let i = 1; i < logDates.length; i++) {
    const currentDate = new Date(logDates[i - 1]);
    const nextDate = new Date(logDates[i]);
    const daysDiff = differenceInDays(currentDate, nextDate);
    
    if (daysDiff === 1) {
      streak++;
    } else {
      break; // Gap found, stop counting
    }
  }
  
  return streak;
};

// Calculate streaks for smoke-free periods
export const calculateSmokeStreaks = (entries, journeyStart) => {
  const now = new Date();
  const journeyStartDate = journeyStart ? new Date(journeyStart) : now;
  
  // Filter entries to only include those from onboarding onwards
  const validEntries = entries.filter(e => {
    const entryDate = new Date(e.timestamp);
    return entryDate >= journeyStartDate && entryDate <= now;
  });
  
  if (validEntries.length === 0) {
    // No cigarettes logged yet - streak is time since journey start
    const timeSinceStart = now.getTime() - journeyStartDate.getTime();
    return { 
      currentStreak: timeSinceStart,
      bestStreak: timeSinceStart
    };
  }

  // Sort entries by timestamp (newest first)
  const sortedEntries = [...validEntries].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  
  // Current streak: time since last cigarette
  const lastCigaretteTime = new Date(sortedEntries[0].timestamp);
  const currentStreak = now.getTime() - lastCigaretteTime.getTime();
  
  // Calculate best streak by finding longest gap between consecutive cigarettes
  let bestStreak = 0;
  
  // Check gap from journey start to first cigarette
  if (sortedEntries.length > 0) {
    const firstCigaretteTime = new Date(sortedEntries[sortedEntries.length - 1].timestamp);
    const initialGap = firstCigaretteTime.getTime() - journeyStartDate.getTime();
    if (initialGap > bestStreak) {
      bestStreak = initialGap;
    }
  }
  
  // Check gaps between consecutive cigarettes
  for (let i = sortedEntries.length - 1; i > 0; i--) {
    const currentTime = new Date(sortedEntries[i].timestamp);
    const nextTime = new Date(sortedEntries[i - 1].timestamp);
    const gap = nextTime.getTime() - currentTime.getTime();
    if (gap > bestStreak) {
      bestStreak = gap;
    }
  }
  
  // Current streak might be the best streak
  if (currentStreak > bestStreak) {
    bestStreak = currentStreak;
  }
  
  return { currentStreak, bestStreak };
};

// Format time duration consistently
export const formatStreakTime = (milliseconds) => {
  if (milliseconds < 0) return "N/A";

  const totalSeconds = Math.floor(milliseconds / 1000);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const totalHours = Math.floor(totalMinutes / 60);
  const days = Math.floor(totalHours / 24);

  if (totalSeconds < 60) {
    return `${totalSeconds} second${totalSeconds !== 1 ? 's' : ''}`;
  }
  if (totalMinutes < 60) {
    const seconds = totalSeconds % 60;
    return `${totalMinutes} minute${totalMinutes !== 1 ? 's' : ''}${seconds > 0 ? ` ${seconds} second${seconds !== 1 ? 's' : ''}` : ''}`;
  }
  if (totalHours < 24) {
    const minutes = totalMinutes % 60;
    return `${totalHours} hour${totalHours !== 1 ? 's' : ''}${minutes > 0 ? ` ${minutes} minute${minutes !== 1 ? 's' : ''}` : ''}`;
  }
  
  const hours = totalHours % 24;
  if (days < 10) {
    if (hours === 0) {
      return `${days} day${days !== 1 ? 's' : ''}`;
    }
    return `${days} day${days !== 1 ? 's' : ''} ${hours} hour${hours !== 1 ? 's' : ''}`;
  }
  
  return `${days} day${days !== 1 ? 's' : ''}`;
};