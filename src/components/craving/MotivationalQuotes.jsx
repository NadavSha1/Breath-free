
import React from 'react';
import { motion } from 'framer-motion';
import { Card } from "@/components/ui/card"; // Assuming Card component is from shadcn/ui or similar
import { MOTIVATIONAL_QUOTES } from '../utils/motivationalQuotes';

export default function MotivationalQuotes() {
  const [currentQuote, setCurrentQuote] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % MOTIVATIONAL_QUOTES.length);
    }, 4000); // Rotate quote every 4 seconds
    return () => clearInterval(interval);
  }, []); // Empty dependency array means this effect runs once on mount

  return (
    <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">Remember Why You Started</h3>
        <motion.p
          key={currentQuote} // Key change ensures re-render and animation on quote change
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.8 }}
          className="text-blue-800 italic text-sm leading-relaxed"
        >
          "{MOTIVATIONAL_QUOTES[currentQuote]}"
        </motion.p>
      </div>
    </Card>
  );
}
