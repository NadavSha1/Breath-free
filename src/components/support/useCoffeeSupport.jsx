
import { useState, useEffect } from 'react';
import { COFFEE_INTERACTION_THRESHOLD, COFFEE_LATER_THRESHOLD } from '@/components/utils/constants';

const STORAGE_KEY = 'coffee_support_data';

export default function useCoffeeSupport() {
  const [showPopup, setShowPopup] = useState(false);
  const [supportData, setSupportData] = useState({
    interactionCount: 0,
    neverAsk: false,
    laterCount: 0,
    lastShown: null
  });

  useEffect(() => {
    // Load support data from localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (savedData) {
          const parsed = JSON.parse(savedData);
          setSupportData(prev => {
            const newSupportData = { ...prev };
            // Robustly load data, ensuring types and defaulting if malformed
            if (typeof parsed.interactionCount === 'number') {
              newSupportData.interactionCount = parsed.interactionCount;
            }
            if (typeof parsed.neverAsk === 'boolean') {
              newSupportData.neverAsk = parsed.neverAsk;
            }
            if (typeof parsed.laterCount === 'number') {
              newSupportData.laterCount = parsed.laterCount;
            }
            // lastShown can be null or a string
            if (typeof parsed.lastShown === 'string' || parsed.lastShown === null) {
              newSupportData.lastShown = parsed.lastShown;
            }
            return newSupportData;
          });
        }
      } catch (error) {
        console.error('Error loading or parsing support data from localStorage:', error);
        // Potentially reset to default state or notify user if data is critical
      }
    }
  }, []);

  useEffect(() => {
    // Save support data to localStorage whenever it changes
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(supportData));
      } catch (error) {
        console.error('Error saving support data to localStorage:', error);
        // Handle potential QuotaExceededError or other localStorage errors
      }
    }
  }, [supportData]);

  useEffect(() => {
    // This effect decides when to show the popup based on the latest supportData
    if (supportData.neverAsk || showPopup) {
      return;
    }

    const { interactionCount, laterCount } = supportData;

    const shouldShow =
      interactionCount >= COFFEE_INTERACTION_THRESHOLD &&
      (laterCount === 0 || interactionCount >= laterCount + COFFEE_LATER_THRESHOLD);

    if (shouldShow) {
      setShowPopup(true);
    }
  }, [supportData, showPopup]);

  const trackInteraction = () => {
    if (supportData.neverAsk) return;

    setSupportData(prev => ({
      ...prev,
      interactionCount: prev.interactionCount + 1,
    }));
  };

  const handleBuyMeCoffee = () => {
    setSupportData(prev => ({
      ...prev,
      neverAsk: true,
      lastShown: new Date().toISOString()
    }));
    window.open('https://buymeacoffee.com/nadavsha', '_blank');
  };

  const handleMaybeLater = () => {
    setSupportData(prev => ({
      ...prev,
      laterCount: supportData.interactionCount, // Use current interactionCount for later threshold
      lastShown: new Date().toISOString()
    }));
    setShowPopup(false);
  };

  const handleNeverAsk = () => {
    setSupportData(prev => ({
      ...prev,
      neverAsk: true,
      lastShown: new Date().toISOString()
    }));
    setShowPopup(false);
  };

  return {
    showPopup,
    trackInteraction,
    handleBuyMeCoffee,
    handleMaybeLater,
    handleNeverAsk
  };
}
