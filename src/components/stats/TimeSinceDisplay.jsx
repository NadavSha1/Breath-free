import React, { useState, useEffect } from 'react';

export default function TimeSinceDisplay({ timestamp }) {
  const [timeDisplay, setTimeDisplay] = useState('');

  useEffect(() => {
    if (!timestamp) {
      setTimeDisplay('Never smoked');
      return;
    }

    const updateTime = () => {
      const now = new Date();
      const last = new Date(timestamp);
      const milliseconds = now - last;
      
      const seconds = Math.floor(milliseconds / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);
      
      if (seconds < 60) {
        setTimeDisplay(`${seconds} second${seconds !== 1 ? 's' : ''}`);
      } else if (minutes < 60) {
        setTimeDisplay(`${minutes} minute${minutes !== 1 ? 's' : ''}`);
      } else if (hours < 24) {
        setTimeDisplay(`${hours} hour${hours !== 1 ? 's' : ''}`);
      } else if (days < 10) {
        const remainingHours = hours % 24;
        if (remainingHours === 0) {
          setTimeDisplay(`${days} day${days !== 1 ? 's' : ''}`);
        } else {
          setTimeDisplay(`${days} day${days !== 1 ? 's' : ''} ${remainingHours} hour${remainingHours !== 1 ? 's' : ''}`);
        }
      } else {
        setTimeDisplay(`${days} day${days !== 1 ? 's' : ''}`);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, [timestamp]);

  return <span className="font-mono">{timeDisplay}</span>;
}