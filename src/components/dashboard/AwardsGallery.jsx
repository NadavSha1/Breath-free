import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Award, Star, Calendar, Crown, TrendingDown, DollarSign, Package, Layers, Shield, Clock, Hourglass, CalendarDays, CalendarCheck, Coffee, Utensils, Briefcase, PiggyBank, ClipboardList, ClipboardCheck, ClipboardEdit, Database, Rocket, PlusCircle, Sparkles, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { User } from "@/api/entities";
import { useState, useEffect } from "react";
import { calculateProgressPercentage } from '../utils/calculations';

const ICON_MAP = {
  award: Award, trophy: Trophy, star: Star, crown: Crown, 'trending-down': TrendingDown, dollar: DollarSign, calendar: Calendar, package: Package, Layers: Layers, shield: Shield, clock: Clock, hourglass: Hourglass, 'calendar-days': CalendarDays, 'calendar-check': CalendarCheck, coffee: Coffee, utensils: Utensils, briefcase: Briefcase, 'piggy-bank': PiggyBank, 'clipboard-list': ClipboardList, 'clipboard-check': ClipboardCheck, 'clipboard-edit': ClipboardEdit, database: Database, rocket: Rocket, 'plus-circle': PlusCircle
};

const BADGE_COLORS = { 
  green: "from-green-400 to-green-600", 
  blue: "from-blue-400 to-blue-600", 
  purple: "from-purple-400 to-purple-600", 
  gold: "from-yellow-400 to-yellow-600" 
};

// Award progression logic
const AWARD_PROGRESSION = {
  "First One Down": ["Pack Saver"],
  "Pack Saver": ["100 Club"],
  "100 Club": ["Half a Carton"],
  "Half a Carton": ["Nicotine Ninja"],
  "Nicotine Ninja": ["1K Milestone"],
  "5 More Minutes": ["1 Hour Healthier"],
  "1 Hour Healthier": ["Day by Day"],
  "Day by Day": ["Week Reclaimed"],
  "Week Reclaimed": ["A Month Back"],
  "One Smoke-Free Day": ["3-Day Kickoff"],
  "3-Day Kickoff": ["First Week Free"],
  "First Week Free": ["Streak Starter"],
  "Streak Starter": ["Freedom Fighter"],
  "Freedom Fighter": ["90-Day Champion"],
  "90-Day Champion": ["1-Year Hero"],
  "Coffee on Me": ["Dinner Saver"],
  "Dinner Saver": ["Weekend Getaway"],
  "Weekend Getaway": ["Savings Master"]
};

// Always unlocked awards
const ALWAYS_UNLOCKED = new Set([
  "First One Down", "5 More Minutes", "One Smoke-Free Day", "Coffee on Me", 
  "Daily Tracker", "Getting Started", "First Log", "Cut in Half"
]);

// Combined icon with progress ring and lock state
const IconWithProgress = ({ Icon, badgeColor, progress, completed, locked, type }) => {
  const size = 56;
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  const categoryColors = {
    savings: "#3b82f6",
    life_gained: "#10b981",
    streak: "#10b981",
    milestone: "#8b5cf6",
    cigarettes_avoided: "#ef4444",
    reduction: "#f59e0b",
    default: "#6b7280"
  };

  const strokeColor = completed ? "#10b981" : (categoryColors[type] || categoryColors.default);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Progress ring */}
      <svg 
        width={size} 
        height={size} 
        className="absolute transform -rotate-90"
        style={{ top: 0, left: 0 }}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e0e0e0"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {!locked && (
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ strokeLinecap: "round" }}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: "easeInOut" }}
          />
        )}
      </svg>
      
      {/* Icon with background or lock */}
      <div className={`w-10 h-10 rounded-full ${locked ? 'bg-gray-400' : `bg-gradient-to-br ${badgeColor}`} shadow-sm flex items-center justify-center relative z-10`}>
        {locked ? (
          <Lock className="w-5 h-5 text-white" />
        ) : (
          <Icon className="w-5 h-5 text-white" />
        )}
      </div>
      
      {/* Completion crown */}
      {completed && !locked && (
        <motion.div 
          className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center z-20"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Crown className="w-2.5 h-2.5 text-yellow-800" />
        </motion.div>
      )}
    </div>
  );
};

export default function AwardsGallery({ awards, onAwardClick }) {
  const [currencySymbol, setCurrencySymbol] = useState('$');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await User.me();
        const symbols = { USD: '$', EUR: '€', GBP: '£', CAD: '$', AUD: '$' };
        setCurrencySymbol(symbols[user.currency] || '$');
      } catch (e) { 
        console.error(e); 
      }
    };
    fetchUser();
  }, []);

  // Determine which awards are unlocked
  const unlockedAwards = new Set(ALWAYS_UNLOCKED);
  const completedTitles = new Set(awards.filter(a => a.is_completed).map(a => a.title));
  
  // Add progression unlocks
  completedTitles.forEach(title => {
    if (AWARD_PROGRESSION[title]) {
      AWARD_PROGRESSION[title].forEach(next => unlockedAwards.add(next));
    }
  });

  // Filter and sort awards
  const visibleAwards = awards
    .filter(award => unlockedAwards.has(award.title) || completedTitles.has(award.title))
    .sort((a, b) => {
      if (a.is_completed && !b.is_completed) return 1;
      if (!a.is_completed && b.is_completed) return -1;
      return 0;
    });

  const displayLimit = isMobile ? 4 : 6;
  const displayedAwards = visibleAwards.slice(0, displayLimit);

  if (displayedAwards.length === 0) {
    return (
      <div className="text-center py-8">
        <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-600">Keep logging to unlock your first awards!</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex gap-4 overflow-x-auto pb-2 px-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {displayedAwards.map((award, index) => {
          const Icon = ICON_MAP[award.badge_icon] || Trophy;
          const badgeColor = BADGE_COLORS[award.badge_color] || BADGE_COLORS.blue;
          const progressPercent = calculateProgressPercentage(award.current_progress, award.target_value);
          const isCompleted = award.is_completed;
          const isLocked = !unlockedAwards.has(award.title) && !completedTitles.has(award.title);
          
          return (
            <motion.div 
              key={award.id} 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ delay: index * 0.05 }} 
              className="flex-shrink-0 group cursor-pointer"
              style={{ width: '120px' }}
              onClick={() => onAwardClick && onAwardClick(award)}
            >
              <div className="flex flex-col items-center space-y-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                {/* Icon with integrated progress ring */}
                <IconWithProgress 
                  Icon={Icon}
                  badgeColor={badgeColor}
                  progress={progressPercent}
                  completed={isCompleted}
                  locked={isLocked}
                  type={award.type}
                />
                
                {/* Title */}
                <div className="text-center space-y-1 w-full">
                  <h4 
                    className="font-medium text-gray-900 leading-tight text-center"
                    style={{ 
                      fontSize: '13px', 
                      fontWeight: 500,
                      lineHeight: '1.2',
                      minHeight: '32px',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {award.title}
                  </h4>
                  
                  {/* Progress text */}
                  <p 
                    className={`text-center ${isCompleted ? 'text-green-600 font-semibold' : isLocked ? 'text-gray-400' : 'text-gray-600'}`}
                    style={{ 
                      fontSize: '11px',
                      fontWeight: isCompleted ? 600 : 400
                    }}
                  >
                    {isLocked ? 'Locked' : isCompleted ? 'Complete!' : `${progressPercent}% complete`}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
        
        {/* Spacer to ensure last item is fully visible */}
        <div className="flex-shrink-0 w-4" />
      </div>
    </div>
  );
}