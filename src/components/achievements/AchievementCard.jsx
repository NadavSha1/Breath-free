import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

const BADGE_COLORS = {
  green: "from-green-400 to-green-600",
  blue: "from-blue-400 to-blue-600",
  purple: "from-purple-400 to-purple-600",
  gold: "from-yellow-400 to-yellow-600",
};

export default function AchievementCard({ achievement, icon: Icon }) {
  const progress = achievement.target_value > 0 
    ? (achievement.current_progress / achievement.target_value) * 100 
    : 0;

  const badgeColor = BADGE_COLORS[achievement.badge_color] || BADGE_COLORS.blue;

  return (
    <Card className={`relative overflow-hidden bg-white/80 backdrop-blur-sm border-slate-200/60 transition-all duration-300 ${
      achievement.is_completed ? 'bg-green-50' : 'hover:shadow-lg'
    }`}>
      {achievement.is_completed && (
        <div className="absolute top-3 right-3 p-1 bg-green-500 text-white rounded-full">
          <CheckCircle2 className="w-5 h-5" />
        </div>
      )}
      <CardHeader className="flex flex-row items-start gap-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${badgeColor} shadow-lg text-white`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <CardTitle className={`text-slate-900 ${achievement.is_completed ? 'line-through text-slate-500' : ''}`}>
            {achievement.title}
          </CardTitle>
          <CardDescription className="mt-1">{achievement.description}</CardDescription>
        </div>
      </CardHeader>
      {!achievement.is_completed && achievement.type !== 'custom' && (
        <CardContent>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-slate-600">Progress</span>
            <span className="text-sm font-medium text-slate-800">
              {Math.round(achievement.current_progress)} / {achievement.target_value}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      )}
    </Card>
  );
}