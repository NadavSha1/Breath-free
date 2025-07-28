import React from 'react';
import { Card } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { ZapOff } from "lucide-react";

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6'];

const TRIGGER_ICONS = {
  stress: '😰',
  boredom: '😴', 
  habit: '🔄',
  social: '👥',
  craving: '🤤',
  after_meal: '🍽️',
  break: '☕',
  anger: '😠',
  celebration: '🎉',
  other: '❓'
};

const LOCATION_ICONS = {
  home: '🏠',
  work: '💼',
  car: '🚗',
  outside: '🌳',
  social: '👥',
  restaurant: '🍽️',
  other: '📍'
};

export default function TriggerAnalysis({ data }) {
  if (!data?.triggers?.length && !data?.locations?.length) {
    return (
      <Card className="p-6 border-dashed border-2 text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Trigger Analysis</h3>
        <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-4 py-8">
            <ZapOff className="w-12 h-12 text-gray-300" />
            <p className="max-w-xs">Track triggers and locations with each log to unlock this analysis. Use detailed logging to see your patterns.</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Triggers */}
      {data?.triggers?.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Common Triggers</h3>
          <div className="h-64 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.triggers}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {data.triggers.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2">
            {data.triggers.map((trigger, index) => (
              <div key={trigger.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{TRIGGER_ICONS[trigger.name] || '❓'}</span>
                  <span className="capitalize text-sm text-gray-700">{trigger.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  <span className="text-sm font-medium">{trigger.value}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Locations */}
      {data?.locations?.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Common Locations</h3>
          <div className="h-64 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.locations} layout="horizontal">
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={80} />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2">
            {data.locations.map((location, index) => (
              <div key={location.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{LOCATION_ICONS[location.name] || '📍'}</span>
                  <span className="capitalize text-sm text-gray-700">{location.name}</span>
                </div>
                <span className="text-sm font-medium">{location.value}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}