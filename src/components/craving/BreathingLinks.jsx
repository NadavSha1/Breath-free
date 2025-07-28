import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Wind, Youtube, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

const BREATHING_LINKS = [
  { name: 'Calm - Breathing exercise', url: 'https://www.youtube.com/watch?v=aNXKjGFUlMs', source: 'Calm' },
  { name: '4-7-8 breathing exercise', url: 'https://www.youtube.com/shorts/_fqr8XNubEI', source: 'YouTube Shorts' },
  { name: 'Belly Breathing Exercise', url: 'https://www.youtube.com/watch?v=OXjlR4mXxSk', source: 'YouTube' },
  { name: 'Headspace breathing technique', url: 'https://www.youtube.com/shorts/-YHRb2S4uvg', source: 'Headspace' }
];

export default function BreathingLinks({ onBack }) {
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
          <h1 className="text-2xl font-bold text-gray-900">Deep Breathing</h1>
          <p className="text-gray-600">Choose a guided exercise to follow.</p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ staggerChildren: 0.1 }}
      >
        <div className="space-y-4">
          {BREATHING_LINKS.map((link, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-blue-50 transition-colors"
                onClick={() => handleLinkClick(link.url)}
                role="button"
                tabIndex="0"
                aria-label={`Open video: ${link.name}`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Youtube className="w-5 h-5 text-blue-600" />
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