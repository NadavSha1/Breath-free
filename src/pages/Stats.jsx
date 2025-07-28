import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { SmokingEntry, User } from "@/api/entities";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, Sun, Flame, Brain, ChevronRight, DollarSign, Calendar, Clock, Trophy, Package } from "lucide-react";
import { motion } from "framer-motion";
import { format, differenceInDays } from "date-fns";
import { calculateSmokeStreaks, formatStreakTime, calculateUnifiedStats } from "@/components/utils/dataCalculations";

import StatsCard from "../components/stats/StatsCard";

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

  useEffect(() => {
    const loadSummary = async () => {
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
    };
    loadSummary();
  }, []);

  // Real-time streak update effect using unified calculations
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

        if (Math.abs(newCurrentStreak - prev.currentStreak) >= 1000) {
          return {
            ...prev,
            currentStreak: newCurrentStreak > 0 ? newCurrentStreak : 0,
          };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [summary.lastSmoke, summary.journeyStart]);

  const formatLifeGained = (minutes) => {
    const roundedMinutes = Math.round(minutes);
    if (roundedMinutes < 60) return `${roundedMinutes} min`;
    if (roundedMinutes < 1440) return `${(roundedMinutes / 60).toFixed(1)} hours`;
    return `${(roundedMinutes / 1440).toFixed(1)} days`;
  };

  const isNewRecord = summary.currentStreak >= summary.bestStreak && summary.bestStreak > 0;

  if (loading) {
    return <div className="p-8 text-center">Loading stats...</div>
  }

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-gray-900">Statistics</h1>
        <p className="text-gray-600">Track your progress and understand your patterns</p>
      </motion.div>

      <div className="grid grid-cols-2 gap-4">
        <StatsCard 
          title="Daily Avg" 
          value={summary.avgDaily} 
          icon={BarChart3} 
          color="red"
        />
        <StatsCard 
          title="Cigarettes Avoided" 
          value={summary.cigarettesAvoided} 
          icon={Package} 
          color="green"
        />
        <StatsCard 
          title="Money Saved" 
          value={`$${summary.moneySaved}`} 
          icon={DollarSign} 
          color="blue"
        />
        <StatsCard 
          title="Life Regained" 
          value={formatLifeGained(summary.lifeGained)} 
          icon={Clock} 
          color="purple"
        />
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Streaks</h2>

        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Current Streak</h3>
              <div className="text-xl font-bold text-green-600">
                {formatStreakTime(summary.currentStreak)} {isNewRecord && '🔥'}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-yellow-50 border-yellow-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Trophy className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Your Record</h3>
              <div className="text-xl font-bold text-yellow-600">
                {formatStreakTime(summary.bestStreak)}
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Trends</h2>

        <div className="space-y-3">
          <Card onClick={() => {
            navigate(createPageUrl("StatDetail?stat=trends"));
          }} className="p-4 cursor-pointer hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Smoking Trends</h3>
                  <p className="text-sm text-gray-600">Daily counts vs historical goals</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </Card>

          <Card onClick={() => {
            navigate(createPageUrl("StatDetail?stat=heatmap"));
          }} className="p-4 cursor-pointer hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Sun className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Smoking Heat Map</h3>
                  <p className="text-sm text-gray-600">Hourly and daily patterns</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </Card>

          <Card onClick={() => {
            navigate(createPageUrl("StatDetail?stat=weekly"));
          }} className="p-4 cursor-pointer hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Flame className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Weekly Averages</h3>
                  <p className="text-sm text-gray-600">Week-over-week progress</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </Card>

          <Card onClick={() => {
            navigate(createPageUrl("StatDetail?stat=triggers"));
          }} className="p-4 cursor-pointer hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Brain className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Trigger Analysis</h3>
                  <p className="text-sm text-gray-600">Identify your top triggers</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}