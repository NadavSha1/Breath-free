import React from 'react';
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

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
    <Card className="p-6 bg-gradient-to-br from-white to-gray-50">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${colorScheme.bg}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          {progress !== null && (
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${colorScheme.light} ${colorScheme.text}`}>
              {Math.round(progress)}%
            </div>
          )}
        </div>
        
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {value}
          </div>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>

        {progress !== null && (
          <div className="space-y-2">
            <Progress 
              value={Math.min(progress, 100)} 
              className="h-2"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Daily Progress</span>
              <span>{progress > 100 ? 'Over Limit' : 'On Track'}</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}