import { Home, Briefcase, Car, Trees, Users, MoreHorizontal, Frown, Coffee, RefreshCw, Heart, Utensils, Clock } from "lucide-react";

export const LOCATIONS = [
  { value: "home", label: "Home", icon: Home },
  { value: "work", label: "Work", icon: Briefcase },
  { value: "car", label: "Car", icon: Car },
  { value: "outside", label: "Outside", icon: Trees },
  { value: "social", label: "Social", icon: Users },
  { value: "other", label: "Other", icon: MoreHorizontal }
];

export const TRIGGERS = [
  { value: "stress", label: "Stress", icon: Frown },
  { value: "boredom", label: "Boredom", icon: Clock },
  { value: "habit", label: "Habit", icon: RefreshCw },
  { value: "social", label: "Social", icon: Users },
  { value: "craving", label: "Craving", icon: Heart },
  { value: "after_meal", label: "After Meal", icon: Utensils },
  { value: "break", label: "Break", icon: Coffee },
  { value: "other", label: "Other", icon: MoreHorizontal }
];