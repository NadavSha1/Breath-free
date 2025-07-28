import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Brain, Youtube, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

const MEDITATION_LINKS = [
  { name: 'De-stress in 5 minutes', url: 'https://www.youtube.com/watch?v=wE292vsJcBY', source: 'Headspace' },
  { name: '5-minute meditation', url: 'https://www.youtube.com/watch?v=inpok4MKVLM', source: 'Great Meditation' },
  { name: 'Re-center and clear your mind', url: 'https://www.youtube.com/watch?v=LDs7jglje_U', source: 'Goodful' },
];

export default function MeditationLinks({ onBack }) {
  const handleLinkClick = (url) => {
    window.open(url, '_blank');
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={onBack} className="rounded-full" aria-label="Go back">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quick Meditation</h1>
          <p className="text-gray-600">Find your calm with a short, guided session.</p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ staggerChildren: 0.1 }}
      >
        <div className="space-y-4">
          {MEDITATION_LINKS.map((link, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-purple-50 transition-colors"
                onClick={() => handleLinkClick(link.url)}
                role="button"
                tabIndex="0"
                aria-label={`Open video: ${link.name}`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Youtube className="w-5 h-5 text-purple-600" />
                  </div>
                  <span className="font-semibold text-gray-800">{link.name}</span>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

       <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-center pt-4"
      >
        <Button onClick={onBack} size="lg" variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Strategies
        </Button>
      </motion.div>
    </div>
  );
}