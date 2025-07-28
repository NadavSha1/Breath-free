import React, { useState, useEffect } from "react";
import { Achievement, SmokingEntry, User } from "@/api/entities";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Star, Award, Crown, Lock, Share2, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { enUS } from 'date-fns/locale';
import { AWARDS_LIBRARY, getAwardProgress, calculateAwardData } from "../components/utils/awardLibrary";

// --- TOP-LEVEL DEFINITIONS ---

const ICON_MAP = {
  award: Award, trophy: Trophy, star: Star, crown: Crown, 'trending-down': Award, dollar: Award, calendar: Award, package: Award, layers: Award, shield: Award, clock: Award, hourglass: Award, 'calendar-days': Award, 'calendar-check': Award, coffee: Award, utensils: Award, briefcase: Award, 'piggy-bank': Award, 'clipboard-list': Award, 'clipboard-check': Award, 'clipboard-edit': Award, database: Award, rocket: Award, 'plus-circle': Award
};

const BADGE_COLORS = { 
  green: "from-green-400 to-green-600", 
  blue: "from-blue-400 to-blue-600", 
  purple: "from-purple-400 to-purple-600", 
  gold: "from-yellow-400 to-yellow-600",
  yellow: "from-yellow-400 to-yellow-500",
};

// Create sequences from the library for progression logic
const AWARD_SEQUENCES = {};
AWARDS_LIBRARY.forEach(award => {
  if (award.category) {
    if (!AWARD_SEQUENCES[award.category]) {
      AWARD_SEQUENCES[award.category] = [];
    }
    AWARD_SEQUENCES[award.category].push(award.name);
  }
});

// Helper to find which sequence an award belongs to
const getAwardCategory = (title) => {
  for (const key in AWARD_SEQUENCES) {
    if (AWARD_SEQUENCES[key].includes(title)) {
      return { name: key, sequence: AWARD_SEQUENCES[key] };
    }
  }
  return { name: 'general', sequence: [title] }; // Fallback
};

// Helper to calculate progress percentage
const calculateProgressPercentage = (current, target) => {
  if (target === 0 || !target) return current > 0 ? 100 : 0;
  const percentage = (current / target) * 100;
  return Math.min(100, Math.round(percentage));
};

// --- COMPONENTS ---

const CircularProgress = ({ progress, size = 40, strokeWidth = 3, completed = false }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke="currentColor" strokeWidth={strokeWidth} fill="transparent"
          className="text-gray-200"
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke="currentColor" strokeWidth={strokeWidth} fill="transparent"
          strokeDasharray={circumference} strokeDashoffset={offset}
          className={completed ? "text-green-500" : "text-blue-500"}
          style={{ transition: "stroke-dashoffset 0.5s ease-in-out", strokeLinecap: "round" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`text-xs font-bold ${completed ? "text-green-600" : "text-blue-600"}`}>
          {Math.round(progress)}%
        </span>
      </div>
    </div>
  );
};


export default function Awards() {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAward, setSelectedAward] = useState(null);
  const [showAwardDetail, setShowAwardDetail] = useState(false);
  const [currencySymbol, setCurrencySymbol] = useState('$');
  const [dateLocale, setDateLocale] = useState(enUS);

  useEffect(() => {
    // For simplicity in standalone mode, just use en-US locale
    setDateLocale(enUS);
  }, []);

  useEffect(() => {
    const loadAndProcessAchievements = async () => {
      setLoading(true);
      setError(null);
      try {
        const [achievementsFromDB, entries, user] = await Promise.all([
          Achievement.list(),
          SmokingEntry.list('-timestamp'),
          User.me(),
        ]);

        const journeyStart = user.journey_start_date ? new Date(user.journey_start_date) : new Date();
        const unifiedStats = calculateAwardData(entries, user, journeyStart);
        
        const symbols = { USD: '$', EUR: '€', GBP: '£', CAD: '$', AUD: '$' };
        setCurrencySymbol(symbols[user.currency] || '$');

        const dbAchievementMap = new Map(achievementsFromDB.map(a => [a.title, a]));
        const completedTitles = new Set(achievementsFromDB.filter(a => a.is_completed).map(a => a.title));
        
        const liveAchievements = AWARDS_LIBRARY.map(awardTemplate => {
          const dbAchievement = dbAchievementMap.get(awardTemplate.name) || {};
          const liveProgress = getAwardProgress(awardTemplate, unifiedStats);
          
          return {
            ...dbAchievement,
            title: awardTemplate.name,
            description: awardTemplate.description,
            badge_icon: awardTemplate.badge_icon,
            badge_color: awardTemplate.badge_color,
            target_value: awardTemplate.target_value,
            category: awardTemplate.category,
            current_progress: liveProgress,
            is_completed: completedTitles.has(awardTemplate.name),
            progress_key: awardTemplate.progress_key
          };
        });

        const achievementsWithLockStatus = liveAchievements.map(achievement => {
          const category = getAwardCategory(achievement.title);
          const sequence = category.sequence;
          const currentIndex = sequence.indexOf(achievement.title);
          
          let isLocked = false;
          if (currentIndex > 0) {
            const previousAwardTitle = sequence[currentIndex - 1];
            if (!completedTitles.has(previousAwardTitle)) {
              isLocked = true;
            }
          }
          return { ...achievement, isLocked };
        });

        const sortedAchievements = achievementsWithLockStatus.sort((a, b) => {
          if (a.is_completed && !b.is_completed) return -1;
          if (!a.is_completed && b.is_completed) return 1;
          if (!a.isLocked && b.isLocked) return -1;
          if (a.isLocked && !b.isLocked) return 1;
          const aProgress = calculateProgressPercentage(a.current_progress, a.target_value);
          const bProgress = calculateProgressPercentage(b.current_progress, b.target_value);
          return bProgress - aProgress;
        });
        
        setAchievements(sortedAchievements);

      } catch (err) {
        console.error('Error processing achievements:', err);
        setError('Could not load awards. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadAndProcessAchievements();
  }, []);

  const formatProgressText = (achievement) => {
    const { progress_key, current_progress, target_value } = achievement;
    const progress = Math.round(current_progress);
    
    switch (progress_key) {
      case 'moneySaved':
        return `${currencySymbol}${progress.toFixed(2)} / ${currencySymbol}${target_value}`;
      case 'lifeRegainedMinutes':
        if (target_value >= 60) return `${(progress / 60).toFixed(1)} / ${target_value / 60} hours`;
        return `${progress} / ${target_value} min`;
      case 'loggingStreakDays':
      case 'currentStreakDays':
        return `${progress} / ${target_value} days`;
      case 'reductionPercentage':
        return `${progress}% / ${target_value}% reduction`;
      default:
        return `${progress} / ${target_value}`;
    }
  };

  const handleAwardClick = (award) => {
    if (!award.isLocked) {
      setSelectedAward(award);
      setShowAwardDetail(true);
    }
  };

  const AwardCard = ({ achievement, index }) => {
    const Icon = ICON_MAP[achievement.badge_icon] || Trophy;
    const badgeColor = BADGE_COLORS[achievement.badge_color] || BADGE_COLORS.blue;
    const progress = calculateProgressPercentage(achievement.current_progress, achievement.target_value);
    const isCompleted = achievement.is_completed;
    const isLocked = achievement.isLocked;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        whileHover={!isLocked ? { scale: 1.02 } : {}}
        className="group cursor-pointer"
        onClick={() => handleAwardClick(achievement)}
      >
        <Card className={`relative overflow-hidden transition-all duration-300 ${
          isCompleted ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-lg' 
          : isLocked ? 'bg-gray-50 border-gray-200'
          : 'bg-white hover:shadow-lg border-gray-200'
        }`}>
          <div className="p-3 space-y-3">
            <div className="flex items-start gap-3">
              <div className={`relative flex-shrink-0 p-2 rounded-lg ${isLocked ? 'bg-gray-400' : `bg-gradient-to-br ${badgeColor}`} shadow-sm`}>
                {isLocked ? <Lock className="w-5 h-5 text-gray-100" /> : <Icon className="w-5 h-5 text-white" />}
              </div>
              <div className="flex-1 min-w-0">
                 <h3 className="font-semibold text-sm text-slate-900 leading-tight mb-1">{achievement.title}</h3>
                <p className="text-xs text-slate-600 line-clamp-2">{isLocked ? "Complete the previous award to unlock." : achievement.description}</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex-1">
                {isLocked ? (
                  <div className="flex items-center gap-2"><Lock className="w-4 h-4 text-gray-400" /><span className="text-sm font-medium text-gray-500">Locked</span></div>
                ) : isCompleted ? (
                  <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /><span className="text-sm font-medium text-green-700">Complete!</span></div>
                ) : (
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-slate-700">{formatProgressText(achievement)}</div>
                  </div>
                )}
              </div>
              {!isLocked && <CircularProgress progress={progress} size={40} strokeWidth={3} completed={isCompleted} />}
            </div>
          </div>
        </Card>
      </motion.div>
    );
  };

  const completedCount = achievements.filter(a => a.is_completed).length;
  const totalCount = achievements.length;

  if (loading) return <div className="p-8 text-center">Loading awards...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Awards</h1>
          <p className="text-gray-600">Track your milestones and celebrate progress</p>
        </div>
        <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-blue-900">{completedCount} / {totalCount} Awards Completed</span>
              <span className="text-sm font-medium text-blue-700 ml-auto">{Math.round(totalCount > 0 ? (completedCount / totalCount) * 100 : 0)}%</span>
            </div>
            <div className="w-full bg-white rounded-full h-2">
              <motion.div 
                initial={{ width: 0 }} animate={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
                transition={{ duration: 1, ease: "easeOut" }} className="h-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
              />
            </div>
          </div>
        </Card>
      </motion.div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {achievements.map((achievement, index) => (
            <AwardCard key={achievement.id || achievement.title} achievement={achievement} index={index} />
          ))}
        </AnimatePresence>
      </div>

      {selectedAward && (
        <AwardDetailModal award={selectedAward} isOpen={showAwardDetail} onClose={() => setShowAwardDetail(false)} dateLocale={dateLocale} />
      )}
    </div>
  );
}

const AwardDetailModal = ({ award, isOpen, onClose, dateLocale }) => {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const shareText = `I just achieved "${award.title}" with BreatheFree! 🎉\n\nJoin me on my smoke-free journey: ${window.location.origin}`;
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const Icon = ICON_MAP[award.badge_icon] || Trophy;
  const badgeColor = BADGE_COLORS[award.badge_color] || BADGE_COLORS.blue;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle className="text-center text-xl font-bold text-gray-900">🎉 Achievement Unlocked!</DialogTitle></DialogHeader>
        <div className="py-6 text-center">
          <div className="relative inline-block mb-6">
            <div className={`w-20 h-20 bg-gradient-to-br ${badgeColor} rounded-full flex items-center justify-center mx-auto shadow-lg`}>
              <Icon className="w-10 h-10 text-white" />
            </div>
            {award.is_completed && (<div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center border-2 border-white"><Crown className="w-4 h-4 text-yellow-800" /></div>)}
          </div>
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{award.title}</h3>
            <p className="text-sm text-gray-600 mb-4">{award.description}</p>
            {award.is_completed && award.completed_date && (<p className="text-xs text-gray-500">Completed on {format(new Date(award.completed_date), 'PPPP', { locale: dateLocale })}</p>)}
            {!award.is_completed && (<p className="text-sm text-gray-500 mt-4">Keep going! You're at {Math.round(calculateProgressPercentage(award.current_progress, award.target_value))}% progress.</p>)}
          </div>
          <div className="space-y-3">
            <Button onClick={handleShare} className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium" size="lg">
              {copied ? (<><CheckCircle className="w-4 h-4 mr-2" />Copied!</>) : (<><Share2 className="w-4 h-4 mr-2" />Share Achievement</>)}
            </Button>
            <Button variant="outline" onClick={onClose} className="w-full" size="lg">Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};