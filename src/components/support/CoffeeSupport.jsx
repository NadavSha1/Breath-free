import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Coffee, Heart, X } from 'lucide-react';
import { motion } from 'framer-motion';

const INTERACTION_THRESHOLD = 50;
const LATER_THRESHOLD = 100;
const STORAGE_KEY = 'coffee_support_data';

export default function CoffeeSupport() {
  const [showPopup, setShowPopup] = useState(false);
  const [supportData, setSupportData] = useState({
    interactionCount: 0,
    neverAsk: false,
    laterCount: 0,
    lastShown: null
  });

  useEffect(() => {
    // Load support data from localStorage
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setSupportData(parsed);
      } catch (error) {
        console.error('Error parsing support data:', error);
      }
    }
  }, []);

  useEffect(() => {
    // Save support data to localStorage whenever it changes
    localStorage.setItem(STORAGE_KEY, JSON.stringify(supportData));
  }, [supportData]);

  const trackInteraction = () => {
    if (supportData.neverAsk) return;

    const newCount = supportData.interactionCount + 1;
    const newSupportData = {
      ...supportData,
      interactionCount: newCount
    };

    setSupportData(newSupportData);

    // Check if we should show the popup
    const shouldShow = newCount >= INTERACTION_THRESHOLD && 
                      (supportData.laterCount === 0 || newCount >= supportData.laterCount + LATER_THRESHOLD);

    if (shouldShow && !showPopup) {
      setShowPopup(true);
    }
  };

  const handleBuyMeCoffee = () => {
    // Track that user clicked buy me coffee
    setSupportData(prev => ({
      ...prev,
      neverAsk: true, // Don't ask again after they've clicked
      lastShown: new Date().toISOString()
    }));
    
    // Open Buy Me a Coffee link
    window.open('https://buymeacoffee.com/nadavsha', '_blank');
    setShowPopup(false);
  };

  const handleMaybeLater = () => {
    setSupportData(prev => ({
      ...prev,
      laterCount: prev.interactionCount,
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

  // Return the tracking function and popup component
  return {
    trackInteraction,
    popup: (
      <Dialog open={showPopup} onOpenChange={setShowPopup}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center text-lg font-semibold text-gray-900 flex items-center justify-center gap-2">
              Support BreatheFree <Coffee className="w-5 h-5 text-amber-600" />
            </DialogTitle>
          </DialogHeader>
          
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-4 text-center"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-white" />
            </div>
            
            <p className="text-gray-700 mb-6 leading-relaxed">
              If this app helps you, consider buying me a coffee. Your support keeps it free for everyone and helps others on their journey too.
            </p>
            
            <div className="space-y-3">
              <Button 
                onClick={handleBuyMeCoffee}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-medium"
                size="lg"
              >
                <Coffee className="w-4 h-4 mr-2" />
                Buy Me a Coffee
              </Button>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={handleMaybeLater}
                  className="flex-1"
                >
                  Maybe Later
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={handleNeverAsk}
                  className="flex-1 text-gray-500 hover:text-gray-700"
                >
                  Never Ask Again
                </Button>
              </div>
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>
    )
  };
}