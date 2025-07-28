import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Music, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

const PLAYLISTS = [
  { name: 'Deep House Relax', url: 'https://open.spotify.com/playlist/37i9dQZF1DX2TRYkJECvfC?si=kqy18ksnQXeyMWkSEGc-FQ' },
  { name: 'Nature Relaxation', url: 'https://open.spotify.com/playlist/37i9dQZF1DX2DjEOgyULQF?si=48pFMo2OTLmrrcX1PlWpUw' },
  { name: 'Peaceful Meditation', url: 'https://open.spotify.com/playlist/37i9dQZF1DWZqd5JICZI0u?si=CnHV3cl6QwiAX9beJzABRg' },
  { name: 'Peaceful Piano', url: 'https://open.spotify.com/playlist/37i9dQZF1DX4sWSpwq3LiO?si=Adn8FOsgTIyxJrfd2a6q5g' }
];

export default function MusicStrategy({ onBack }) {
  const handlePlaylistClick = (url) => {
    window.open(url, '_blank');
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={onBack} className="rounded-full" aria-label="Go back to strategies">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relax with Music</h1>
          <p className="text-gray-600">Choose a playlist to calm your mind.</p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ staggerChildren: 0.1 }}
      >
        <div className="space-y-4">
          {PLAYLISTS.map((playlist, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-green-50 transition-colors"
                onClick={() => handlePlaylistClick(playlist.url)}
                role="button"
                tabIndex="0"
                aria-label={`Open playlist: ${playlist.name}`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Music className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="font-semibold text-gray-800">{playlist.name}</span>
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