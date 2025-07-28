import React, { useState, useEffect } from 'react';
import { differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds } from 'date-fns';

export default function TimeSinceLast({ lastEntryTimestamp }) {
  const [timeSince, setTimeSince] = useState('');

  useEffect(() => {
    const calculateTime = () => {
      if (!lastEntryTimestamp) {
        setTimeSince('');
        return;
      }

      const now = new Date();
      const last = new Date(lastEntryTimestamp);
      
      const days = differenceInDays(now, last);
      const hours = differenceInHours(now, last) % 24;
      const minutes = differenceInMinutes(now, last) % 60;

      if (days > 0) {
        setTimeSince(`${days}d ${hours}h`);
      } else if (hours > 0) {
        setTimeSince(`${hours}h ${minutes}m`);
      } else {
        setTimeSince(`${minutes}m ago`);
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000 * 60); // Update every minute

    return () => clearInterval(interval);
  }, [lastEntryTimestamp]);

  if (!timeSince) return null;

  return <span className="text-sm text-slate-500">{timeSince}</span>;
}