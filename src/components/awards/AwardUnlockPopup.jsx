
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Share2, Copy, CheckCircle, Crown } from 'lucide-react';
import { motion } from 'framer-motion';

const ICON_MAP = {
  award: Trophy, trophy: Trophy, star: Trophy, crown: Crown, 'trending-down': Trophy, dollar: Trophy, calendar: Trophy, package: Trophy, layers: Trophy, shield: Trophy, clock: Trophy, hourglass: Trophy, 'calendar-days': Trophy, 'calendar-check': Trophy, coffee: Trophy, utensils: Trophy, briefcase: Trophy, 'piggy-bank': Trophy, 'clipboard-list': Trophy, 'clipboard-check': Trophy, 'clipboard-edit': Trophy, database: Trophy, rocket: Trophy, 'plus-circle': Trophy
};

const BADGE_COLORS = { 
  green: "from-green-400 to-green-600", 
  blue: "from-blue-400 to-blue-600", 
  purple: "from-purple-400 to-purple-600", 
  gold: "from-yellow-400 to-yellow-600" 
};

const GAMIFIED_MESSAGES = {
  "First One Down": "I just avoided my first cigarette with BreatheFree! Small steps, big wins 💪",
  "Pack Saver": "Just saved a whole pack of cigarettes! That's 20 reasons to celebrate 🎉",
  "100 Club": "Hit the 100 cigarettes avoided milestone! This is what willpower looks like 💥",
  "One Smoke-Free Day": "First smoke-free day complete! One day closer to freedom 🚀",
  "3-Day Kickoff": "3 days smoke-free and counting! The momentum is building 🔥",
  "First Week Free": "One week smoke-free! Seven days of pure willpower 💪",
  "Coffee on Me": "Saved enough money for a coffee by not smoking! Small wins add up ☕",
  "5 More Minutes": "Just added 5 minutes back to my life by avoiding cigarettes! Time well saved ⏰",
  "1 Hour Healthier": "One hour of life regained! Every cigarette avoided counts 🌟",
  "Cut in Half": "Cut my daily smoking in half! Progress feels amazing 📈",
  "Streak Starter": "Two weeks smoke-free! This streak is just getting started 🚀",
  "Day by Day": "Saved an entire day of life by avoiding cigarettes! That's 24 hours back 🌅",
  "Week Reclaimed": "Reclaimed a full week of life! This is what winning looks like 🏆",
  "Freedom Fighter": "One month smoke-free! Fighting for my freedom and winning 💪",
  "90-Day Champion": "90 days smoke-free! Three months of pure determination 🎯",
  "Half a Carton": "Avoided half a carton of cigarettes! That's serious progress 📦",
  "Nicotine Ninja": "500 cigarettes avoided! I'm becoming a nicotine ninja 🥷",
  "1K Milestone": "1,000 cigarettes avoided! This milestone feels incredible 🎊",
  "Weekend Getaway": "Saved enough for a weekend trip by not smoking! Money well saved 🏖️",
  "Savings Master": "$1,000 not spent on cigarettes! I'm a savings master now 💰",
  "A Month Back": "Regained a month of life by avoiding cigarettes! Time is precious ⏳",
  "1-Year Hero": "One year smoke-free! I'm officially a smoke-free hero 🦸‍♂️"
};

export default function AwardUnlockPopup({ award, isOpen, onClose }) {
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);

  if (!award || !isOpen) return null;

  const Icon = ICON_MAP[award.badge_icon] || Trophy;
  const badgeColor = BADGE_COLORS[award.badge_color] || BADGE_COLORS.blue;
  const message = GAMIFIED_MESSAGES[award.title] || `I just unlocked "${award.title}" with BreatheFree! 🎉`;

  const generateShareLink = () => {
    const baseUrl = window.location.origin;
    const shareText = `${message}\n\nJoin me on my smoke-free journey: ${baseUrl}`;
    return shareText;
  };

  const handleShare = async () => {
    setSharing(true);
    const shareText = generateShareLink();
    
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } finally {
      setSharing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold text-gray-900">
            🎉 You just unlocked an award!
          </DialogTitle>
        </DialogHeader>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="py-6 text-center"
        >
          {/* Award Badge */}
          <div className="relative mb-6">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
              className={`w-20 h-20 bg-gradient-to-br ${badgeColor} rounded-full flex items-center justify-center mx-auto shadow-lg`}
            >
              <Icon className="w-10 h-10 text-white" />
            </motion.div>
            
            {/* Celebration crown */}
            <motion.div
              initial={{ scale: 0, y: -10 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.4 }}
              className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center"
            >
              <Crown className="w-4 h-4 text-yellow-800" />
            </motion.div>
          </div>

          {/* Award Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {award.title}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              You've earned <span className="font-medium">{award.title}</span> — keep going!
            </p>
            <p className="text-xs text-gray-500">
              {award.description}
            </p>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-3"
          >
            <Button 
              onClick={handleShare}
              disabled={sharing}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium"
              size="lg"
            >
              {copied ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Copied to Clipboard!
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 mr-2" />
                  {sharing ? 'Preparing...' : 'Share Your Win'}
                </>
              )}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={onClose}
              className="w-full"
              size="lg"
            >
              Awesome!
            </Button>
          </motion.div>
        </motion.div>

        {/* Reduced confetti effect for better performance */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                opacity: 0, 
                y: -20, 
                x: Math.random() * 400 - 200,
                rotate: 0
              }}
              animate={{ 
                opacity: [0, 1, 0], 
                y: 200, 
                rotate: 180
              }}
              transition={{ 
                duration: 2, 
                delay: 0.5 + Math.random() * 1,
                ease: "easeOut"
              }}
              className="absolute w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: '10%'
              }}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
