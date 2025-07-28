import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { SmokingEntry, User } from "@/api/entities";
import { Card } from "@/components/ui/card";
import { BarChart3, TrendingUp, Sun, Flame, Brain, ChevronRight, DollarSign, Calendar, Clock, Trophy, Package } from "lucide-react";
import { motion } from "framer-motion";
import { calculateSmokeStreaks, formatStreakTime, calculateUnifiedStats } from "@/components/utils/dataCalculations";

import StatsCard from "@/components/stats/StatsCard";

export default function Stats() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState({
    avgDaily: 0,
    lastSmoke: null,
    currentStreak: 0,
    bestStreak: 0,
    moneySaved: 0,
    lifeGained: 0,
    cigarettesAvoided: 0,
    journeyStart: null,
  });
  const [loading, setLoading] = useState(true);

  const loadSummary = useCallback(async () => {
    setLoading(true);
    try {
      const [allEntries, user] = await Promise.all([
        SmokingEntry.list('-timestamp'),
        User.me()
      ]);

      if (!user) {
        setLoading(false);
        return;
      }

      const journeyStart = user.journey_start_date ? new Date(user.journey_start_date) : new Date();
      
      // Use unified calculation system
      const unifiedStats = calculateUnifiedStats(allEntries, user, journeyStart);
      
      // Calculate streaks using unified system
      const { currentStreak, bestStreak } = calculateSmokeStreaks(allEntries, journeyStart);

      const lastSmokeTimestamp = allEntries.length > 0 ? allEntries[0].timestamp : null;

      setSummary({
        avgDaily: unifiedStats.currentDailyAvg.toFixed(1),
        lastSmoke: lastSmokeTimestamp,
        currentStreak,
        bestStreak,
        moneySaved: unifiedStats.moneySaved.toFixed(2),
        lifeGained: unifiedStats.lifeRegainedMinutes,
        cigarettesAvoided: unifiedStats.cigarettesAvoided,
        journeyStart: journeyStart.toISOString(),
      });

    } catch (e) {
      console.error("Failed to load summary stats", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  // Optimized real-time streak update effect
  useEffect(() => {
    if (!summary.journeyStart) return;

    const interval = setInterval(() => {
      setSummary(prev => {
        if (!prev.journeyStart) return prev;

        const now = new Date();
        let newCurrentStreak = 0;

        if (prev.lastSmoke) {
          const lastCigaretteTime = new Date(prev.lastSmoke);
          newCurrentStreak = now.getTime() - lastCigaretteTime.getTime();
        } else {
          const journeyStartTime = new Date(prev.journeyStart);
          newCurrentStreak = now.getTime() - journeyStartTime.getTime();
        }

        // Only update if there's a significant change (1 second)
        if (Math.abs(newCurrentStreak - prev.currentStreak) < 1000) {
          return prev;
        }

        return {
          ...prev,
          currentStreak: newCurrentStreak > 0 ? newCurrentStreak : 0,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [summary.lastSmoke, summary.journeyStart]);

  // Memoize stat cards data to prevent unnecessary re-renders
  const statCards = useMemo(() => [
    {
      title: "Current Streak",
      value: formatStreakTime(summary.currentStreak),
      subtitle: "Smoke-free time",
      icon: Flame,
      color: "green"
    },
    {
      title: "Best Streak",
      value: formatStreakTime(summary.bestStreak),
      subtitle: "Personal record",
      icon: Trophy,
      color: "yellow"
    },
    {
      title: "Money Saved",
      value: `$${summary.moneySaved}`,
      subtitle: "Total savings",
      icon: DollarSign,
      color: "green"
    },
    {
      title: "Life Regained",
      value: `${Math.floor(summary.lifeGained / 60)}h ${summary.lifeGained % 60}m`,
      subtitle: "Time recovered",
      icon: Clock,
      color: "blue"
    },
    {
      title: "Cigarettes Avoided",
      value: summary.cigarettesAvoided,
      subtitle: "Not smoked",
      icon: Package,
      color: "purple"
    },
    {
      title: "Daily Average",
      value: summary.avgDaily,
      subtitle: "Current rate",
      icon: BarChart3,
      color: "blue"
    }
  ], [summary]);

  // Memoize navigation handlers
  const navigateToDetail = useCallback((statType) => {
    navigate(createPageUrl("StatDetail", { stat: statType }));
  }, [navigate]);

  if (loading) {
    return (
      <div className="p-4 max-w-4xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center mx-auto">
          <BarChart3 className="w-10 h-10 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Progress</h1>
          <p className="text-gray-600 max-w-md mx-auto">
            Track your journey and celebrate every milestone
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
          >
            <StatsCard
              title={stat.title}
              value={stat.value}
              subtitle={stat.subtitle}
              icon={stat.icon}
              color={stat.color}
              onClick={() => navigateToDetail(stat.title.toLowerCase().replace(' ', '_'))}
            />
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-100 border-green-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-green-900">Keep Going!</h3>
              <p className="text-green-700">
                You're making great progress. Every moment smoke-free is a victory.
              </p>
            </div>
            <ChevronRight 
              className="w-6 h-6 text-green-600 cursor-pointer hover:text-green-800 transition-colors"
              onClick={() => navigateToDetail('motivation')}
            />
          </div>
        </Card>
      </motion.div>
    </div>
  );
}