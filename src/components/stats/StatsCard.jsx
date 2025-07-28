import React from 'react';
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";

const COLOR_SCHEMES = {
  red: {
    bg: "from-red-500 to-red-600",
    text: "text-red-600",
    light: "bg-red-50"
  },
  green: {
    bg: "from-green-500 to-green-600",
    text: "text-green-600",
    light: "bg-green-50"
  },
  blue: {
    bg: "from-blue-500 to-blue-600",
    text: "text-blue-600",
    light: "bg-blue-50"
  },
  purple: {
    bg: "from-purple-500 to-purple-600",
    text: "text-purple-600",
    light: "bg-purple-50"
  }
};

export default function StatsCard({ title, value, subtitle, icon: Icon, color = "blue", progress = null }) {
  const colorScheme = COLOR_SCHEMES[color];

  return (
    <Card className="p-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className={`p-2 rounded-lg bg-gradient-to-br ${colorScheme.bg}`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
        </div>
        
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <div className="text-xl font-bold text-gray-900 mb-1">
            {typeof value === 'string' || typeof value === 'number' ? value : value}
          </div>
          <p className="text-xs text-gray-500">{subtitle}</p>
        </div>

        {progress !== null && (
          <div className="space-y-1">
            <Progress 
              value={Math.min(progress, 100)} 
              className="h-1.5"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Daily Progress</span>
              <span>{progress > 100 ? 'Over' : 'On Track'}</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}