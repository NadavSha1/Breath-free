import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format, eachDayOfInterval, subDays } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOUR_BLOCKS = ['12-4am', '4-8am', '8-12pm', '12-4pm', '4-8pm', '8-12am'];

export default function HeatMap({ data }) {
  const [view, setView] = useState('week');
  const [selectedInfo, setSelectedInfo] = useState(null);

  if (!data || Object.keys(data).length === 0) {
    return (
      <Card className="p-6 text-center text-gray-500">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Smoking Heat Map</h3>
        <p>Need at least a week of detailed logging to show patterns.</p>
      </Card>
    );
  }

  const today = new Date();
  const dateRange = view === 'week' 
    ? eachDayOfInterval({ start: subDays(today, 6), end: today })
    : eachDayOfInterval({ start: subDays(today, 29), end: today });

  const getIntensity = (count) => {
    if (count === 0) return 0; if (count <= 2) return 1; if (count <= 4) return 2; if (count <= 7) return 3; return 4;
  };

  const getColor = (intensity) => ['bg-gray-100', 'bg-red-100', 'bg-red-300', 'bg-red-500', 'bg-red-700'][intensity];

  const renderWeekView = () => (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-full">
        <div className="flex mb-2">
          <div className="w-12 shrink-0"></div>
          {HOUR_BLOCKS.map(block => (
            <div key={block} className="flex-1 text-xs text-center text-gray-500">{block}</div>
          ))}
        </div>
        {dateRange.map(date => (
          <div key={format(date, 'yyyy-MM-dd')} className="flex items-center mb-1">
            <div className="w-12 text-xs text-gray-600 pr-2 shrink-0">{format(date, 'EEE')}</div>
            {Array.from({ length: 6 }).map((_, blockIndex) => {
              const startHour = blockIndex * 4;
              const dayData = data[format(date, 'yyyy-MM-dd')] || {};
              const count = [0, 1, 2, 3].reduce((sum, h) => sum + (dayData[startHour + h] || 0), 0);
              const intensity = getIntensity(count);
              const tooltipText = `${count} cigarette${count !== 1 ? 's' : ''}`;

              return (
                <Tooltip key={blockIndex}>
                  <TooltipTrigger asChild>
                    <div onClick={() => setSelectedInfo({ date, block: HOUR_BLOCKS[blockIndex], count })} className={`flex-1 h-8 mr-0.5 rounded-sm cursor-pointer ${getColor(intensity)}`}></div>
                  </TooltipTrigger>
                  <TooltipContent><p>{`${format(date, 'MMM d')} (${HOUR_BLOCKS[blockIndex]}) - ${tooltipText}`}</p></TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );

  const renderMonthView = () => { /* ... same as before ... */ return ( <div className="space-y-1"> <div className="grid grid-cols-7 gap-1 mb-2"> {DAYS_OF_WEEK.map(day => ( <div key={day} className="text-xs text-center text-gray-500 font-medium">{day}</div> ))} </div> {(() => { const weeks = []; let currentWeek = Array(dateRange[0].getDay()).fill(null); dateRange.forEach(date => { if (currentWeek.length === 7) { weeks.push(currentWeek); currentWeek = []; } const dayTotal = Object.values(data[format(date, 'yyyy-MM-dd')] || {}).reduce((sum, count) => sum + count, 0); currentWeek.push({ date, count: dayTotal }); }); while (currentWeek.length < 7) currentWeek.push(null); weeks.push(currentWeek); return weeks.map((week, weekIndex) => ( <div key={weekIndex} className="grid grid-cols-7 gap-1"> {week.map((day, dayIndex) => { if (!day) return <div key={dayIndex} className="aspect-square"></div>; const intensity = getIntensity(day.count); const tooltipText = `${day.count} cigarette${day.count !== 1 ? 's' : ''}`; return ( <Tooltip key={dayIndex}> <TooltipTrigger asChild> <div onClick={() => setSelectedInfo({ date: day.date, block: 'All Day', count: day.count })} className={`aspect-square rounded-sm cursor-pointer ${getColor(intensity)} flex items-center justify-center`}> <span className="text-xs font-medium text-gray-700">{format(day.date, 'd')}</span> </div> </TooltipTrigger> <TooltipContent><p>{`${format(day.date, 'MMM d')} - ${tooltipText}`}</p></TooltipContent> </Tooltip> ); })} </div> )); })()} </div> ); };

  return (
    <Card className="p-6">
      <TooltipProvider>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Smoking Heat Map</h3>
              <p className="text-sm text-gray-600">
                {view === 'week' ? 'Daily patterns by 4-hour blocks' : 'Daily totals (last 30 days)'}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant={view === 'week' ? 'default' : 'outline'} size="sm" onClick={() => setView('week')}>Week</Button>
              <Button variant={view === 'month' ? 'default' : 'outline'} size="sm" onClick={() => setView('month')}>Month</Button>
            </div>
          </div>
          {view === 'week' ? renderWeekView() : renderMonthView()}
          {selectedInfo && <div className="text-center p-2 bg-blue-50 rounded-lg text-blue-800 font-medium mt-4">Selected: {format(selectedInfo.date, 'MMM d')} ({selectedInfo.block}) - {selectedInfo.count} cigarettes</div>}
          <div className="flex items-center justify-between text-xs text-gray-500 pt-2">
            <span>Less</span>
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4].map(i => <div key={i} className={`w-3 h-3 rounded-sm ${getColor(i)}`}></div>)}
            </div>
            <span>More</span>
          </div>
        </div>
      </TooltipProvider>
    </Card>
  );
}