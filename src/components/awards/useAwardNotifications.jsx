
import { useState, useEffect } from 'react';

const SHOWN_AWARDS_KEY = 'shown_award_notifications';

export default function useAwardNotifications() {
  const [shownAwards, setShownAwards] = useState(new Set());
  const [pendingAward, setPendingAward] = useState(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Load previously shown awards from localStorage
    const savedShownAwards = localStorage.getItem(SHOWN_AWARDS_KEY);
    if (savedShownAwards) {
      try {
        const parsed = JSON.parse(savedShownAwards);
        setShownAwards(new Set(parsed));
      } catch (error) {
        console.error('Error parsing shown awards:', error);
      }
    }
    setInitialized(true);
  }, []);

  const saveShownAwards = (updatedShownAwards) => {
    try {
      localStorage.setItem(SHOWN_AWARDS_KEY, JSON.stringify([...updatedShownAwards]));
    } catch (error) {
      console.error('Error saving shown awards to localStorage:', error);
    }
  };

  const checkForNewAwards = (awards) => {
    if (!initialized) return; // Don't check until localStorage is loaded
    
    const newlyCompleted = awards.filter(award => 
      award.is_completed && 
      award.completed_date && 
      !shownAwards.has(award.id)
    );

    if (newlyCompleted.length > 0) {
      // Show the most recent one (assuming they're sorted by completion date)
      const newestAward = newlyCompleted.reduce((latest, current) => {
        const latestDate = new Date(latest.completed_date);
        const currentDate = new Date(current.completed_date);
        return currentDate > latestDate ? current : latest;
      });

      // Only show if not already pending
      if (!pendingAward || pendingAward.id !== newestAward.id) {
        setPendingAward(newestAward);
      }
    }
  };

  const markAwardAsShown = (awardId) => {
    const updatedShownAwards = new Set([...shownAwards, awardId]);
    setShownAwards(updatedShownAwards);
    saveShownAwards(updatedShownAwards);
    setPendingAward(null);
  };

  const dismissPendingAward = () => {
    if (pendingAward) {
      markAwardAsShown(pendingAward.id);
    }
  };

  return {
    pendingAward,
    checkForNewAwards,
    markAwardAsShown,
    dismissPendingAward,
    initialized
  };
}
