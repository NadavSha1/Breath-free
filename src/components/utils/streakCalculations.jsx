
import { differenceInDays } from "date-fns";

export const calculateStreaks = (entries, journeyStart) => {
  const now = new Date();
  
  if (entries.length === 0) {
    // No cigarettes logged yet - streak is time since journey start
    const timeSinceStart = now.getTime() - journeyStart.getTime();
    return { 
      currentStreak: timeSinceStart,
      bestStreak: timeSinceStart
    };
  }

  // Sort entries by timestamp (newest first)
  const sortedEntries = [...entries].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  
  // Current streak: time since last cigarette
  const lastCigaretteTime = new Date(sortedEntries[0].timestamp);
  const currentStreak = now.getTime() - lastCigaretteTime.getTime();
  
  // Calculate best streak by finding longest gap between consecutive cigarettes
  let bestStreak = 0;
  
  // Check gaps between consecutive cigarettes (iterate from oldest to newest)
  for (let i = sortedEntries.length - 1; i > 0; i--) {
    const currentTime = new Date(sortedEntries[i].timestamp); // Older
    const nextTime = new Date(sortedEntries[i - 1].timestamp); // Newer
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
