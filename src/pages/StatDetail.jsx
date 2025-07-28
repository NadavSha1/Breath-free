
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { SmokingEntry, User } from "@/api/entities";
import { eachDayOfInterval, format, startOfWeek, subDays, getDay, getHours, differenceInDays } from "date-fns";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, TrendingUp, Sun, Flame, Brain, Info } from "lucide-react";
import { calculateUnifiedStats } from "@/components/utils/dataCalculations";

const STAT_CONFIG = {
  trends: { title: "Smoking Trends", icon: TrendingUp, color: "blue" },
  heatmap: { title: "Smoking Heatmap", icon: Sun, color: "orange" },
  weekly: { title: "Weekly Averages", icon: Flame, color: "red" },
  triggers: { title: "Trigger Analysis", icon: Brain, color: "purple" },
};

const HeatmapCell = ({ count, max, day, time, onSelect }) => {
  const intensity = max > 0 ? count / max : 0;
  const bgColor = `rgba(239, 68, 68, ${intensity})`;
  
  return (
    <div 
      className="w-full h-8 border border-gray-200 rounded-sm cursor-pointer"
      style={{ backgroundColor: bgColor }}
      onClick={() => onSelect(`${day}, ${time}: ${count} smokes`)}
    />
  );
};

const IndicativeMessage = ({ children }) => (
  <div className="flex flex-col items-center justify-center text-center p-8 bg-gray-50 rounded-lg h-64">
    <Info className="w-8 h-8 text-gray-400 mb-4" />
    <p className="text-gray-600 font-medium">{children}</p>
  </div>
);

export default function StatDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const [chartType, setChartType] = useState("trends");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [heatmapData, setHeatmapData] = useState({ grid: [], peak: '', max: 0 });
  const [selectedCell, setSelectedCell] = useState(null);
  const [canShowTriggers, setCanShowTriggers] = useState(false);
  const [canShowWeekly, setCanShowWeekly] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const statType = params.get("stat") || "trends";
    setChartType(statType);

    const fetchData = async () => {
      setLoading(true);
      try {
        const [user, entries] = await Promise.all([
          User.me(),
          SmokingEntry.list('-timestamp'),
        ]);

        const journeyStart = user.journey_start_date ? new Date(user.journey_start_date) : new Date();
        const unifiedStats = calculateUnifiedStats(entries, user, journeyStart);
        
        // Determine eligibility for reports
        const detailedLogs = unifiedStats.validEntries.filter(e => e.trigger);
        const showTriggers = detailedLogs.length >= 10;
        setCanShowTriggers(showTriggers);

        const showWeekly = unifiedStats.daysSinceOnboarding >= 14;
        setCanShowWeekly(showWeekly);

        const now = new Date();

        switch (statType) {
          case "trends":
            // Show all days since journey start (up to 30 days for readability)
            const totalDaysSinceStart = unifiedStats.daysSinceOnboarding;
            
            // If user has been on journey for more than 30 days, show last 30 days
            // Otherwise, show from journey start
            let startDate;
            if (totalDaysSinceStart > 30) {
              startDate = subDays(now, 29); // Last 30 days
            } else {
              startDate = journeyStart; // From journey start
            }
            
            const dateRange = eachDayOfInterval({ start: startDate, end: now });
            
            setData(dateRange.map(date => ({
              date: format(date, 'MMM d'),
              smoked: unifiedStats.validEntries.filter(e => 
                format(new Date(e.timestamp), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
              ).length
            })));
            break;

          case "heatmap":
            const grid = Array(8).fill(0).map(() => Array(7).fill(0));
            let maxSmokes = 0;
            let peakInfo = { count: 0, day: -1, block: -1 };

            const weekStart = startOfWeek(now, { weekStartsOn: 0 });
            const weekEntries = unifiedStats.validEntries.filter(e => new Date(e.timestamp) >= weekStart);

            weekEntries.forEach(entry => {
              const entryDate = new Date(entry.timestamp);
              const dayIndex = getDay(entryDate); // Sun=0
              const hour = getHours(entryDate);
              const timeBlockIndex = Math.floor(hour / 3);
              
              grid[timeBlockIndex][dayIndex]++;
              const currentCount = grid[timeBlockIndex][dayIndex];
              if(currentCount > maxSmokes) maxSmokes = currentCount;
              if(currentCount > peakInfo.count) peakInfo = { count: currentCount, day: dayIndex, block: timeBlockIndex };
            });

            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const blocks = ['0-3', '3-6', '6-9', '9-12', '12-15', '15-18', '18-21', '21-24'];
            const peakText = peakInfo.count > 0 ? `Most smokes on: ${days[peakInfo.day]} ${blocks[peakInfo.block]}h` : "No smokes logged this week!";
            
            setHeatmapData({ grid, max: maxSmokes, peak: peakText });
            break;
            
          case "weekly":
            if (showWeekly) {
              const weeks = Math.min(8, Math.floor(unifiedStats.daysSinceOnboarding / 7));
              const weeklyData = [];
              
              for (let i = weeks - 1; i >= 0; i--) {
                const weekStart = subDays(now, (i + 1) * 7);
                const weekEnd = subDays(now, i * 7);
                const weekEntries = unifiedStats.validEntries.filter(e => {
                  const entryDate = new Date(e.timestamp);
                  return entryDate >= weekStart && entryDate < weekEnd;
                });
                
                weeklyData.push({
                  week: `Week ${weeks - i}`,
                  average: (weekEntries.length / 7).toFixed(1),
                  total: weekEntries.length
                });
              }
              
              setData(weeklyData);
            }
            break;

          case "triggers":
            if (showTriggers) {
              const triggerCounts = {};
              unifiedStats.validEntries.forEach(entry => {
                if (entry.trigger) {
                  triggerCounts[entry.trigger] = (triggerCounts[entry.trigger] || 0) + 1;
                }
              });
              
              const triggerData = Object.entries(triggerCounts)
                .map(([trigger, count]) => ({ trigger, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 6);
              
              setData(triggerData);
            }
            break;
        }

      } catch(e) {
        console.error("Error fetching data for stats", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [location.search]);

  const currentStat = STAT_CONFIG[chartType];

  if (loading) {
    return (
      <div className="p-4 md:p-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="icon" onClick={() => navigate(createPageUrl("Stats"))}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold">Loading...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" onClick={() => navigate(createPageUrl("Stats"))}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-2xl font-bold">{currentStat.title}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <currentStat.icon className={`w-6 h-6 text-${currentStat.color}-500`} />
            {currentStat.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {chartType === "trends" && (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="smoked" stroke="#ef4444" name="Smoked" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {chartType === "heatmap" && (
            <div className="space-y-4">
              <div className="grid grid-cols-8 gap-1">
                <div></div>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-xs text-center font-medium text-gray-600">{day}</div>
                ))}
                {['0-3', '3-6', '6-9', '9-12', '12-15', '15-18', '18-21', '21-24'].map((time, timeIndex) => (
                  <React.Fragment key={time}>
                    <div className="text-xs text-right font-medium text-gray-600 pr-2">{time}</div>
                    {[0, 1, 2, 3, 4, 5, 6].map(dayIndex => (
                      <HeatmapCell
                        key={`${timeIndex}-${dayIndex}`}
                        count={heatmapData.grid[timeIndex]?.[dayIndex] || 0}
                        max={heatmapData.max}
                        day={['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayIndex]}
                        time={time}
                        onSelect={setSelectedCell}
                      />
                    ))}
                  </React.Fragment>
                ))}
              </div>
              <p className="text-sm text-gray-600 text-center">{heatmapData.peak}</p>
              {selectedCell && (
                <div className="text-sm text-blue-600 text-center">{selectedCell}</div>
              )}
            </div>
          )}

          {chartType === "weekly" && (
            canShowWeekly ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="average" fill="#ef4444" name="Daily Average" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <IndicativeMessage>
                Log data for at least two weeks to see your weekly averages.
              </IndicativeMessage>
            )
          )}

          {chartType === "triggers" && (
            canShowTriggers ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="trigger" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#8b5cf6" name="Count" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <IndicativeMessage>
                Log at least 10 detailed entries with triggers to see this analysis.
              </IndicativeMessage>
            )
          )}
        </CardContent>
      </Card>
    </div>
  );
}
