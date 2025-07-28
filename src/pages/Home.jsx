import { useState, useEffect, useCallback, useMemo } from "react";
import { SmokingEntry, User, Achievement, GoalHistory } from "@/api/entities";
import { format, startOfDay, endOfDay, eachDayOfInterval, subDays } from "date-fns";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User as UserIcon, Plus, PenSquare, ArrowRight } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { calculateSmokeStreaks, formatStreakTime } from "@/components/utils/dataCalculations";

import TrendChart from "../components/dashboard/TrendChart";
import MotivationalCard from "../components/dashboard/MotivationalCard";
import LogCigaretteForm from "../components/dashboard/LogCigaretteForm";
import useCoffeeSupport from "../components/support/useCoffeeSupport";
import CoffeeSupportPopup from "../components/support/CoffeeSupportPopup";
import AwardUnlockPopup from "../components/awards/AwardUnlockPopup";
import useAwardNotifications from "../components/awards/useAwardNotifications";
import { AWARDS_LIBRARY, calculateAwardData, checkAwardUnlock, getAwardProgress } from "../components/utils/awardLibrary";

export default function Home() {
  const [stats, setStats] = useState({
    todayCount: 0,
    dailyLimit: null,
    lastSmoke: null,
    currentStreak: 0,
    bestStreak: 0,
    journeyStart: null,
  });
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [logFormState, setLogFormState] = useState({ isOpen: false, mode: 'detailed' });
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const {
    pendingAward,
    checkForNewAwards,
    dismissPendingAward,
    initialized
  } = useAwardNotifications();

  const {
    showPopup: showCoffeePopup,
    trackInteraction,
    handleBuyMeCoffee,
    handleMaybeLater,
    handleNeverAsk
  } = useCoffeeSupport();

  // Memoize color scheme calculation to prevent unnecessary re-renders
  const colorScheme = useMemo(() => {
    if (!stats.dailyLimit || stats.dailyLimit === 0) {
      return { card: "from-blue-50 to-indigo-100 border-blue-200", text: "text-blue-800", heading: "text-blue-900", subtext: "text-blue-700" };
    }
    const ratio = stats.todayCount / stats.dailyLimit;
    if (ratio > 1) {
      return { card: "from-red-50 to-red-100 border-red-200", text: "text-red-800", heading: "text-red-900", subtext: "text-red-700" };
    }
    if (ratio >= 0.8) {
      return { card: "from-yellow-50 to-yellow-100 border-yellow-200", text: "text-yellow-800", heading: "text-yellow-900", subtext: "text-yellow-700" };
    }
    return { card: "from-green-50 to-green-100 border-green-200", text: "text-green-800", heading: "text-green-900", subtext: "text-green-700" };
  }, [stats.todayCount, stats.dailyLimit]);

  // Memoize greeting calculation
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  // Memoize last smoked text calculation
  const lastSmokedText = useMemo(() => {
    if (!stats.lastSmoke) {
      return "No cigarettes logged yet";
    }
    return `Last smoked: ${formatStreakTime(stats.currentStreak)} ago`;
  }, [stats.lastSmoke, stats.currentStreak]);

  const loadDashboardData = useCallback(async () => {
    if (!initialized) return; // Wait for award system to initialize
    
    setLoading(true);
    setError(null);
    trackInteraction();
    
    try {
      const [allEntries, userData, existingAchievements, goalHistory] = await Promise.all([
        SmokingEntry.list('-timestamp'),
        User.me(),
        Achievement.list(),
        GoalHistory.list(),
      ]);

      if (!userData.onboarding_completed) {
        navigate(createPageUrl("Onboarding"));
        return;
      }
      
      setUser(userData);
      const journeyStart = userData.journey_start_date ? new Date(userData.journey_start_date) : new Date();
      
      const today = new Date();
      const todayStart = startOfDay(today);
      const todayEnd = endOfDay(today);

      const validEntries = allEntries.filter(e => new Date(e.timestamp) <= today);
      const todayEntries = validEntries.filter(e => new Date(e.timestamp) >= todayStart && new Date(e.timestamp) <= todayEnd);

      // Use unified calculation system for streaks
      const { currentStreak, bestStreak } = calculateSmokeStreaks(validEntries, journeyStart);

      setStats({
        todayCount: todayEntries.length,
        dailyLimit: userData.daily_limit,
        lastSmoke: validEntries.length > 0 ? validEntries[0].timestamp : null,
        currentStreak,
        bestStreak,
        journeyStart: journeyStart.toISOString(),
      });
      
      const dateRange = eachDayOfInterval({ start: subDays(today, 6), end: today });
      
      const sortedGoalHistory = goalHistory.sort((a, b) => new Date(a.date) - new Date(b.date));

      const getGoalForDate = (date) => {
        let applicableGoal = userData.daily_limit || 0;
        for (const record of sortedGoalHistory) {
          if (startOfDay(new Date(record.date)) <= startOfDay(date)) {
            applicableGoal = record.limit;
          } else {
            break;
          }
        }
        return applicableGoal;
      };

      const preparedChartData = dateRange.map(date => {
        const dayEntries = validEntries.filter(entry => format(new Date(entry.timestamp), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'));
        return { date: format(date, 'EEE'), count: dayEntries.length, goal: getGoalForDate(date) };
      });
      setChartData(preparedChartData);

      // Use unified award system
      const awardData = calculateAwardData(validEntries, userData, journeyStart);
      
      // Create or update awards based on the library
      const awardUpdates = [];
      const existingAwardMap = new Map(existingAchievements.map(a => [a.title, a]));
      
      for (const awardTemplate of AWARDS_LIBRARY) {
        const existingAward = existingAwardMap.get(awardTemplate.name);
        const currentProgress = getAwardProgress(awardTemplate, awardData);
        const shouldUnlock = checkAwardUnlock(awardTemplate, awardData);
        
        if (!existingAward) {
          // Create new award
          const newAward = {
            title: awardTemplate.name,
            description: awardTemplate.description,
            type: awardTemplate.category,
            target_value: awardTemplate.target_value,
            current_progress: currentProgress,
            is_completed: shouldUnlock,
            completed_date: shouldUnlock ? new Date().toISOString() : null,
            badge_icon: awardTemplate.badge_icon,
            badge_color: awardTemplate.badge_color,
            category: awardTemplate.category
          };
          awardUpdates.push(Achievement.create(newAward));
        } else {
          // Update existing award if needed
          const needsUpdate = 
            existingAward.current_progress !== currentProgress ||
            (!existingAward.is_completed && shouldUnlock);
          
          if (needsUpdate) {
            const updateData = {
              current_progress: currentProgress,
              is_completed: shouldUnlock || existingAward.is_completed,
              completed_date: shouldUnlock && !existingAward.is_completed ? new Date().toISOString() : existingAward.completed_date
            };
            awardUpdates.push(Achievement.update(existingAward.id, updateData));
          }
        }
      }
      
      // Process all award updates
      if (awardUpdates.length > 0) {
        await Promise.all(awardUpdates);
        
        // Reload achievements and check for new unlocks
        const updatedAchievements = await Achievement.list();
        checkForNewAwards(updatedAchievements);
      }
      
    } catch (err) {
      console.error("Error loading dashboard:", err);
      if (err.response && err.response.status === 429) {
        setError("App is busy. Please wait a moment and try again.");
      } else {
        setError("Could not load dashboard. Please refresh the page.");
      }
    } finally {
      setLoading(false);
    }
  }, [initialized, navigate, trackInteraction, checkForNewAwards]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Optimized real-time streak update effect
  useEffect(() => {
    if (!stats.journeyStart) return;

    const interval = setInterval(() => {
      setStats(prev => {
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
          currentStreak: newCurrentStreak > 0 ? newCurrentStreak : 0
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [stats.lastSmoke, stats.journeyStart]);

  const handleQuickLog = useCallback(async () => {
    trackInteraction();
    try {
      await SmokingEntry.create({ timestamp: new Date().toISOString(), quick_log: true });
      await loadDashboardData();
    } catch (error) {
      console.error('Error logging cigarette:', error);
      setError('Failed to log cigarette. Please try again.');
    }
  }, [trackInteraction, loadDashboardData]);
  
  const openLogForm = useCallback((mode) => {
    trackInteraction();
    setLogFormState({ isOpen: true, mode });
  }, [trackInteraction]);
  
  const closeLogForm = useCallback(() => {
    setLogFormState({ isOpen: false, mode: 'detailed' });
  }, []);

  const handleAccountNavigation = useCallback(() => {
    trackInteraction();
    navigate(createPageUrl("Account"));
  }, [trackInteraction, navigate]);

  const handleStatsNavigation = useCallback(() => {
    trackInteraction();
    navigate(createPageUrl("Stats"));
  }, [trackInteraction, navigate]);

  if (loading && !user) return <div className="p-8 text-center">Loading your journey...</div>;

  if (error) {
    return (
      <div className="p-8 text-center space-y-4">
        <div className="text-red-500">{error}</div>
        <Button onClick={loadDashboardData} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-8">
      <LogCigaretteForm 
        isOpen={logFormState.isOpen} 
        mode={logFormState.mode} 
        onClose={closeLogForm} 
        onSave={loadDashboardData} 
      />

      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {greeting}, {user?.full_name?.split(' ')[0]}
          </h1>
          <p className="text-sm text-slate-600">{format(new Date(), "eeee, d LLL")}</p>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleAccountNavigation}
          className="rounded-full w-12 h-12 bg-slate-100"
          aria-label="Go to account settings"
        >
          <UserIcon className="w-6 h-6" />
        </Button>
      </motion.div>

      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Activity</h2>
        <Card className={`p-4 bg-gradient-to-br ${colorScheme.card} border`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-semibold ${colorScheme.text}`} style={{ fontSize: '14px', fontWeight: 600 }}>Smoked Today</p>
              <div className="flex items-baseline gap-2">
                <span className={`text-5xl font-bold ${colorScheme.heading}`}>{stats.todayCount}</span>
                {stats.dailyLimit !== null && (
                  <span className={`text-xl font-medium ${colorScheme.subtext} opacity-70`}>
                    / {stats.dailyLimit}
                  </span>
                )}
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="lg" variant="destructive" className="rounded-full w-16 h-16 shadow-lg" disabled={loading}>
                  <Plus className="w-8 h-8 text-white" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleQuickLog} disabled={loading}>
                  <Plus className="w-4 h-4 mr-2" /> Quick Log
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => openLogForm('detailed')} disabled={loading}>
                  <PenSquare className="w-4 h-4 mr-2" /> Detailed Log
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </Card>
        
        {/* Last smoked info moved below the card */}
        <div className="mt-3 px-1">
          <p className="text-sm text-gray-600">
            {lastSmokedText}
          </p>
        </div>
      </section>

      <section>
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold text-gray-900">Trends</h2>
          <Button 
            variant="outline"
            size="sm"
            onClick={handleStatsNavigation}
            className="group"
          >
            Show More
            <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
        <Card className="p-4">
          <TrendChart data={chartData} />
        </Card>
      </section>
      
      <MotivationalCard />

      <CoffeeSupportPopup 
        isOpen={showCoffeePopup}
        onBuyMeCoffee={handleBuyMeCoffee}
        onMaybeLater={handleMaybeLater}
        onNeverAsk={handleNeverAsk}
      />

      <AwardUnlockPopup 
        award={pendingAward}
        isOpen={!!pendingAward && initialized}
        onClose={dismissPendingAward}
      />
    </div>
  );
}