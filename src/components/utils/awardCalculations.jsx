import { differenceInDays, startOfDay } from "date-fns";

export const calculateCigarettesAvoided = (entries, userData, journeyStart) => {
    if (!userData.cigarettes_per_day_before) return 0;
    const daysInJourney = Math.max(1, differenceInDays(new Date(), journeyStart) + 1);
    const baselineCigarettes = userData.cigarettes_per_day_before * daysInJourney;
    const actualCigarettes = entries.filter(e => new Date(e.timestamp) >= journeyStart).length;
    return Math.max(0, baselineCigarettes - actualCigarettes);
};

export const calculateTotalSavings = (cigarettesAvoided, userData) => {
    if (!userData.cost_per_pack || !userData.cigarettes_per_pack) return 0;
    return cigarettesAvoided * (userData.cost_per_pack / userData.cigarettes_per_pack);
};

export const calculateSmokeFreeStreak = (entries, journeyStart) => {
    if (entries.length === 0) {
        // No cigarettes logged - streak is time since journey start
        return differenceInDays(new Date(), journeyStart);
    }
  
    const lastSmokeDate = startOfDay(new Date(entries[0].timestamp));
    const today = startOfDay(new Date());
    
    if (lastSmokeDate < today) {
        return differenceInDays(today, lastSmokeDate);
    }
    
    return 0; // Smoked today
};

export const calculateLoggingStreak = (entries) => {
    if (entries.length === 0) return 0;
    
    const today = startOfDay(new Date());
    let streak = 0;
    
    // Check consecutive days with logs, starting from today and going backwards
    for (let i = 0; i >= -30; i--) { // Check last 30 days max
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() + i);
        
        const hasLogOnDate = entries.some(entry => {
            const entryDate = startOfDay(new Date(entry.timestamp));
            return entryDate.getTime() === checkDate.getTime();
        });
        
        if (hasLogOnDate) {
            streak++;
        } else if (i < 0) {
            // If we're checking past days and find a gap, stop
            break;
        }
    }
    
    return streak;
};

export const calculateReductionPercentage = (entries, userData, journeyStart) => {
    if (!userData.cigarettes_per_day_before) return 0;
    const daysInJourney = Math.max(1, differenceInDays(new Date(), journeyStart) + 1);
    const journeyEntries = entries.filter(entry => new Date(entry.timestamp) >= journeyStart);
    const actualDailyAverage = journeyEntries.length / daysInJourney;
    return Math.max(0, ((userData.cigarettes_per_day_before - actualDailyAverage) / userData.cigarettes_per_day_before) * 100);
};

export const calculateProgress = (achievement, entries, userData, journeyStart) => {
    const cigarettesAvoided = calculateCigarettesAvoided(entries, userData, journeyStart);
    
    switch (achievement.type) {
      case 'cigarettes_avoided': 
        return cigarettesAvoided;
      case 'life_gained': 
        return cigarettesAvoided * 5; // 5 minutes per cigarette avoided
      case 'streak': 
        return calculateSmokeFreeStreak(entries, journeyStart);
      case 'savings': 
        return calculateTotalSavings(cigarettesAvoided, userData);
      case 'reduction': 
        return calculateReductionPercentage(entries, userData, journeyStart);
      case 'logging_streak':
        return calculateLoggingStreak(entries);
      case 'milestone':
        if (achievement.title === 'Getting Started') return 1; // Always completed after onboarding
        if (achievement.title === 'First Log') return entries.length > 0 ? 1 : 0;
        return 0;
      default: 
        return achievement.current_progress || 0;
    }
};