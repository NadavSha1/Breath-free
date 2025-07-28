import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { MOTIVATIONAL_QUOTES } from '../utils/motivationalQuotes';

export default function MotivationalCard() {
  const [quote, setQuote] = useState(MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]);

  const getNewQuote = () => {
    let newQuote;
    do {
      newQuote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
    } while (newQuote === quote);
    setQuote(newQuote);
  };

  return (
    <Card className="relative p-6 border-blue-200/50 overflow-hidden" style={{ background: 'linear-gradient(135deg, #e1f0ff, #f5faff)' }}>
      <div className="flex items-start gap-4">
        <div className="p-2 bg-white rounded-full shadow-sm">
          <Heart className="w-5 h-5 text-blue-600" />
        </div>
        <div className="pr-8">
          <h3 className="font-semibold text-slate-900 mb-2">Motivation Boost</h3>
          <motion.p
            key={quote}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
            className="text-slate-700 italic"
            style={{ fontSize: '13px', lineHeight: '1.4' }}
          >
            {quote}
          </motion.p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={getNewQuote}
        className="absolute top-3 right-3 text-slate-500 hover:bg-slate-200/50 hover:text-slate-700"
        aria-label="Get new motivational quote"
      >
        <RefreshCw className="w-4 h-4" />
      </Button>
    </Card>
  );
}