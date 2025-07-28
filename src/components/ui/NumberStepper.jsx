import React from 'react';
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";

export default function NumberStepper({ value, onValueChange, min = 0, max = 100, unit = "" }) {
  const handleDecrement = () => {
    if (value > min) {
      onValueChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (value < max) {
      onValueChange(value + 1);
    }
  };

  return (
    <div className="flex items-center justify-center gap-8 py-8">
      <Button
        variant="outline"
        size="icon"
        onClick={handleDecrement}
        disabled={value <= min}
        className="w-14 h-14 rounded-full border-2 border-blue-600 hover:bg-blue-50 disabled:opacity-50"
      >
        <Minus className="w-6 h-6 text-blue-600" />
      </Button>
      
      <div className="text-center">
        <div className="text-6xl font-bold text-gray-900 mb-2">
          {value}
        </div>
        {unit && (
          <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            {unit}
          </div>
        )}
      </div>
      
      <Button
        variant="outline"
        size="icon"
        onClick={handleIncrement}
        disabled={value >= max}
        className="w-14 h-14 rounded-full border-2 border-blue-600 hover:bg-blue-50 disabled:opacity-50"
      >
        <Plus className="w-6 h-6 text-blue-600" />
      </Button>
    </div>
  );
}