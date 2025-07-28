
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Heart, Wind, Brain, Trophy, Music } from "lucide-react";

import BreathingLinks from "@/components/craving/BreathingLinks";
import MeditationLinks from "@/components/craving/MeditationLinks";
import MotivationalQuotes from "@/components/craving/MotivationalQuotes";
import MusicStrategy from "@/components/craving/MusicStrategy";

const COPING_CATEGORIES = [
  {
    id: 'breathing',
    title: 'Deep Breathing',
    description: 'Follow a guided breathing exercise',
    icon: Wind,
    color: 'blue'
  },
  {
    id: 'meditation',
    title: 'Quick Meditation',
    description: 'Find your center with a short meditation',
    icon: Brain,
    color: 'purple'
  },
  {
    id: 'motivation',
    title: 'Motivation Boost',
    description: 'Remember why you started this journey',
    icon: Trophy,
    color: 'yellow'
  },
  {
    id: 'music',
    title: 'Relax with Music',
    description: 'Calm your mind with a relaxing song',
    icon: Music,
    color: 'green'
  }
];

const STRATEGY_COMPONENTS = {
  breathing: ({ onBack }) => <BreathingLinks onBack={onBack} />,
  meditation: ({ onBack }) => <MeditationLinks onBack={onBack} />,
  motivation: ({ onBack }) => (
    <div className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg shadow-md space-y-4 text-center">
      <h2 className="text-xl font-bold text-yellow-800">Motivation Boost</h2>
      <MotivationalQuotes />
      <Button onClick={onBack} className="mt-4 w-full bg-yellow-600 hover:bg-yellow-700 text-white">Back to Strategies</Button>
    </div>
  ),
  music: ({ onBack }) => <MusicStrategy onBack={onBack} />,
};

export default function BeatCraving() {
  const [selectedStrategy, setSelectedStrategy] = useState(null);

  const handleStrategySelect = (strategyId) => {
    setSelectedStrategy(strategyId);
  };

  const handleBack = () => {
    setSelectedStrategy(null);
  };

  if (selectedStrategy) {
    const StrategyComponent = STRATEGY_COMPONENTS[selectedStrategy];
    if (StrategyComponent) {
      return (
        <div className="p-4 max-w-4xl mx-auto">
          <StrategyComponent onBack={handleBack} />
        </div>
      );
    }
    // Fallback for an unknown strategy
    return (
        <div className="p-4 text-center space-y-4">
          <p className="text-red-500">Error: Component not found for selected strategy.</p>
          <Button onClick={handleBack} className="mt-4">Back to Strategies</Button>
        </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="w-20 h-20 bg-gradient-to-br from-red-400 to-pink-600 rounded-full flex items-center justify-center mx-auto">
          <Heart className="w-10 h-10 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Beat This Craving</h1>
          <p className="text-gray-600 max-w-md mx-auto">
            You&apos;re stronger than this urge. Choose a strategy to find your calm.
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {COPING_CATEGORIES.map(strategy => {
            const StrategyIcon = strategy.icon;
            return (
              <Card
                key={strategy.id}
                className="cursor-pointer hover:shadow-lg transition-shadow duration-200 border border-gray-100 hover:border-blue-200"
                onClick={() => handleStrategySelect(strategy.id)}
              >
                <div className="p-4 flex items-start gap-3">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center bg-${strategy.color}-100`}>
                    <StrategyIcon className={`w-5 h-5 text-${strategy.color}-600`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{strategy.title}</h3>
                    <p className="text-sm text-gray-600">{strategy.description}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
