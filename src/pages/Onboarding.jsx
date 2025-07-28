
import React, { useState } from "react";
import { User, Achievement } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, ArrowLeft, Sparkles, Target, Heart, Flag, PieChart, Users, Calendar as CalendarIcon, CheckCircle, ClipboardCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import NumberStepper from "../components/ui/NumberStepper";

const ONBOARDING_STEPS = [
  { id: 'welcome', title: 'Welcome to SmokeFree', subtitle: 'Your journey to a healthier life starts now.' },
  { id: 'basics', title: 'About Your Habits', subtitle: 'This helps us personalize your plan.' },
  { id: 'goals', title: 'What is Your Goal?', subtitle: 'Choose the path that\'s right for you.' },
  { id: 'motivation', title: 'Finding Your "Why"', subtitle: 'A powerful reason is key to success.' },
  { id: 'plan', title: 'Your Personalized Plan', subtitle: 'Here is your starting plan. You can change it anytime.' }
];

const ACHIEVEMENT_TEMPLATES = [
  // Convert all awards from the library to achievement templates
  {
    title: "Getting Started",
    description: "You've logged your very first cigarette. The journey begins.",
    type: "logging",
    target_value: 1,
    badge_icon: "plus-circle",
    badge_color: "green",
    category: "logging"
  },
  {
    title: "The First Five",
    description: "You've avoided 5 cigarettes. Every one counts.",
    type: "progress",
    target_value: 5,
    badge_icon: "award",
    badge_color: "blue",
    category: "progress"
  },
  {
    title: "Avoider: 50 Club",
    description: "You've dodged 50 cigarettes. That's strength.",
    type: "progress",
    target_value: 50,
    badge_icon: "shield",
    badge_color: "blue",
    category: "progress"
  },
  {
    title: "Avoider Elite: 100",
    description: "100 cigarettes not smoked. Your lungs love you.",
    type: "progress",
    target_value: 100,
    badge_icon: "trophy",
    badge_color: "purple",
    category: "progress"
  },
  {
    title: "Avoider Champion: 500",
    description: "500 cigarettes dodged. You're becoming unstoppable.",
    type: "progress",
    target_value: 500,
    badge_icon: "crown",
    badge_color: "gold",
    category: "progress"
  },
  {
    title: "Gained an Hour",
    description: "You've regained 1 hour of your life — literally.",
    type: "health",
    target_value: 60,
    badge_icon: "clock",
    badge_color: "green",
    category: "health"
  },
  {
    title: "Half a Day Back",
    description: "12 hours of life regained. Not bad at all.",
    type: "health",
    target_value: 720,
    badge_icon: "hourglass",
    badge_color: "green",
    category: "health"
  },
  {
    title: "Full Day Bonus",
    description: "You just gained back an entire day of life.",
    type: "health",
    target_value: 1440,
    badge_icon: "calendar",
    badge_color: "purple",
    category: "health"
  },
  {
    title: "Saved a Tenner",
    description: "10 bucks saved — that's a coffee and a snack.",
    type: "money",
    target_value: 10,
    badge_icon: "coffee",
    badge_color: "yellow",
    category: "money"
  },
  {
    title: "Smokin' Saver: $100",
    description: "That's $100 not lit on fire. Nice work.",
    type: "money",
    target_value: 100,
    badge_icon: "dollar-sign",
    badge_color: "yellow",
    category: "money"
  },
  {
    title: "Money Boss: $500",
    description: "Half a grand saved. Still smoke-free.",
    type: "money",
    target_value: 500,
    badge_icon: "piggy-bank",
    badge_color: "gold",
    category: "money"
  },
  {
    title: "Half Cut Hero",
    description: "You've cut your daily smoking by 50%. Respect.",
    type: "progress",
    target_value: 50,
    badge_icon: "trending-down",
    badge_color: "blue",
    category: "progress"
  },
  {
    title: "Deep Detox: -75%",
    description: "You've dropped your habit by 75%. Almost there.",
    type: "progress",
    target_value: 75,
    badge_icon: "trending-down",
    badge_color: "purple",
    category: "progress"
  },
  {
    title: "1-Day Wall",
    description: "You've gone 24 hours without smoking. That's the first wall broken.",
    type: "milestone",
    target_value: 1,
    badge_icon: "star",
    badge_color: "green",
    category: "milestone"
  },
  {
    title: "The Week Warrior",
    description: "7 days clean. That's a full circle.",
    type: "milestone",
    target_value: 7,
    badge_icon: "trophy",
    badge_color: "blue",
    category: "milestone"
  },
  {
    title: "Unshakeable: 30 Days",
    description: "One full month smoke-free. That's transformation.",
    type: "milestone",
    target_value: 30,
    badge_icon: "crown",
    badge_color: "gold",
    category: "milestone"
  },
  {
    title: "Daily Logger: 3 Days",
    description: "You've logged a cigarette 3 days in a row.",
    type: "consistency",
    target_value: 3,
    badge_icon: "calendar",
    badge_color: "purple",
    category: "consistency"
  },
  {
    title: "Daily Logger: 7 Days",
    description: "7 days straight of tracking. That's how change begins.",
    type: "consistency",
    target_value: 7,
    badge_icon: "calendar-check",
    badge_color: "purple",
    category: "consistency"
  },
  {
    title: "Habit Tracker Pro: 30 Days",
    description: "30 days of logs — win or lose, you're showing up.",
    type: "consistency",
    target_value: 30,
    badge_icon: "clipboard-check",
    badge_color: "gold",
    category: "consistency"
  }
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);
  const [formData, setFormData] = useState({
    age: '',
    smoking_years: '',
    cigarettes_per_day_before: '',
    cost_per_pack: '',
    cigarettes_per_pack: '20',
    currency: 'USD',
    quit_goal: '',
    quit_date: null,
    motivation: '',
    daily_limit: '0',
    notifications_enabled: false
  });
  const [errors, setErrors] = useState({});

  const currentStepData = ONBOARDING_STEPS[currentStep];
  const progress = ((currentStep + 1) / ONBOARDING_STEPS.length) * 100;

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateBasics = () => {
    const newErrors = {};
    const age = parseInt(formData.age);
    const smokingYears = parseInt(formData.smoking_years);
    const cigsPerDay = parseInt(formData.cigarettes_per_day_before);
    const costPerPack = parseFloat(formData.cost_per_pack);

    if (isNaN(age) || age <= 0) newErrors.age = "Must be a positive number.";
    if (isNaN(smokingYears) || smokingYears < 0) newErrors.smoking_years = "Cannot be negative.";
    if (age > 0 && smokingYears >= age) newErrors.smoking_years = "Cannot be more than your age.";
    if (isNaN(cigsPerDay) || cigsPerDay <= 0) newErrors.cigarettes_per_day_before = "Must be a positive number.";
    if (isNaN(costPerPack) || costPerPack <= 0) newErrors.cost_per_pack = "Must be a positive number.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateGoals = () => {
    if (formData.quit_goal === 'quit_date') {
      if (!formData.quit_date) return false;
      const selectedDate = new Date(formData.quit_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selectedDate.getTime() >= today.getTime();
    }
    return formData.quit_goal !== '';
  };

  const handleNext = () => {
    if (currentStepData.id === 'basics') {
      if (!validateBasics()) return;
    }
    if (currentStepData.id === 'goals') {
        if (!validateGoals()) return;
    }
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    setIsCompleting(true);
    try {
      await User.updateMyUserData({
        ...formData,
        age: parseInt(formData.age) || null,
        smoking_years: parseInt(formData.smoking_years) || null,
        cigarettes_per_day_before: parseInt(formData.cigarettes_per_day_before) || null,
        cost_per_pack: parseFloat(formData.cost_per_pack) || null,
        cigarettes_per_pack: parseInt(formData.cigarettes_per_pack) || null,
        daily_limit: parseInt(formData.daily_limit) || null,
        onboarding_completed: true,
        journey_start_date: new Date().toISOString()
      });

      // Delete existing achievements to start fresh
      const existingAchievements = await Achievement.list();
      for (const achievement of existingAchievements) {
        await Achievement.delete(achievement.id);
      }

      // Create all new achievements from the templates
      const createdAchievements = await Achievement.bulkCreate(ACHIEVEMENT_TEMPLATES);

      // Mark "Getting Started" as complete since onboarding is completed
      const gettingStartedAchievement = createdAchievements.find(a => a.title === "Getting Started");
      if (gettingStartedAchievement) {
        await Achievement.update(gettingStartedAchievement.id, {
          is_completed: true,
          completed_date: new Date().toISOString(),
          current_progress: 1
        });
      }
      
      navigate(createPageUrl("Home"));
    } catch (error) {
      console.error('Error completing onboarding:', error);
      alert('There was an error setting up your account. Please try again.');
    } finally {
      setIsCompleting(false);
    }
  };

  const canProceed = () => {
    switch (currentStepData.id) {
      case 'basics':
        return formData.age && formData.smoking_years && formData.cigarettes_per_day_before && formData.cost_per_pack;
      case 'goals':
        return validateGoals();
      case 'motivation':
        return true;
      case 'plan':
        return true;
      default:
        return true;
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Heart className="w-6 h-6 text-blue-600" />
              <span className="font-semibold text-gray-800">SmokeFree</span>
            </div>
            <span className="text-sm text-gray-500">
              Step {currentStep + 1} of {ONBOARDING_STEPS.length}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-8 bg-white shadow-lg rounded-xl">
              <div className="text-center mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  {currentStepData.title}
                </h1>
                <p className="text-gray-600">{currentStepData.subtitle}</p>
              </div>

              {currentStepData.id === 'welcome' && (
                <div className="text-center space-y-6 py-8">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                    <Sparkles className="w-12 h-12 text-white" />
                  </div>
                  <p className="text-gray-700 leading-relaxed max-w-md mx-auto">
                    Quitting is a journey, not a single event. We're here to provide the tools and support you need to succeed.
                  </p>
                </div>
              )}

              {currentStepData.id === 'basics' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="age">Your Age</Label>
                      <Input 
                        id="age" 
                        type="number" 
                        min="1" 
                        value={formData.age} 
                        onChange={(e) => handleInputChange('age', e.target.value)} 
                        placeholder="e.g., 30" 
                      />
                      {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age}</p>}
                    </div>
                    <div>
                      <Label htmlFor="smoking_years">Years Smoking</Label>
                      <Input 
                        id="smoking_years" 
                        type="number" 
                        min="0" 
                        value={formData.smoking_years} 
                        onChange={(e) => handleInputChange('smoking_years', e.target.value)} 
                        placeholder="e.g., 10" 
                      />
                      {errors.smoking_years && <p className="text-red-500 text-xs mt-1">{errors.smoking_years}</p>}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="cigarettes_per_day">Cigarettes Per Day (Average)</Label>
                    <Input 
                      id="cigarettes_per_day" 
                      type="number" 
                      min="1" 
                      value={formData.cigarettes_per_day_before} 
                      onChange={(e) => handleInputChange('cigarettes_per_day_before', e.target.value)} 
                      placeholder="e.g., 20" 
                    />
                    {errors.cigarettes_per_day_before && <p className="text-red-500 text-xs mt-1">{errors.cigarettes_per_day_before}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cost">Cost Per Pack</Label>
                      <Input 
                        id="cost" 
                        type="number" 
                        min="0" 
                        step="0.01" 
                        value={formData.cost_per_pack} 
                        onChange={(e) => handleInputChange('cost_per_pack', e.target.value)} 
                        placeholder="e.g., 10.50" 
                      />
                      {errors.cost_per_pack && <p className="text-red-500 text-xs mt-1">{errors.cost_per_pack}</p>}
                    </div>
                    <div>
                      <Label htmlFor="currency">Currency</Label>
                      <Select value={formData.currency} onValueChange={(value) => handleInputChange('currency', value)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD ($)</SelectItem>
                          <SelectItem value="EUR">EUR (€)</SelectItem>
                          <SelectItem value="GBP">GBP (£)</SelectItem>
                          <SelectItem value="CAD">CAD ($)</SelectItem>
                          <SelectItem value="AUD">AUD ($)</SelectItem>
                          <SelectItem value="NIS">NIS (₪)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {currentStepData.id === 'goals' && (
                <div className="space-y-4">
                  {[
                    { value: 'quit_completely', title: 'Quit Completely', description: 'Stop smoking entirely, starting now.', icon: Flag },
                    { value: 'quit_date', title: 'Set a Quit Date', description: 'Choose a future date to stop.', icon: CalendarIcon },
                    { value: 'reduce', title: 'Reduce Gradually', description: 'Cut down slowly over time.', icon: PieChart },
                    { value: 'maintain_current', title: 'Just Track Habits', description: 'Monitor without a specific quit goal.', icon: Users }
                  ].map((goal) => {
                    const GoalIcon = goal.icon;
                    const isSelected = formData.quit_goal === goal.value;
                    return (
                      <Button
                        key={goal.value}
                        variant={isSelected ? "default" : "outline"}
                        onClick={() => handleInputChange('quit_goal', goal.value)}
                        className={`h-auto p-4 justify-start w-full text-left relative ${
                          isSelected ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-900 border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-4 w-full">
                          <GoalIcon className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-blue-500'}`} />
                          <div className="flex-1">
                            <div className="font-semibold">{goal.title}</div>
                            <div className={`text-sm font-normal ${isSelected ? 'text-blue-100' : 'text-gray-600'}`}>
                              {goal.description}
                            </div>
                          </div>
                          {isSelected && (
                            <CheckCircle className="w-5 h-5 text-white" />
                          )}
                        </div>
                      </Button>
                    );
                  })}
                  
                  {formData.quit_goal === 'quit_date' && (
                      <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="pt-4">
                          <Label>Your Target Quit Date</Label>
                           <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {formData.quit_date ? format(formData.quit_date, 'PPP') : 'Select a date'}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar 
                                      mode="single" 
                                      selected={formData.quit_date} 
                                      onSelect={(date) => handleInputChange('quit_date', date)} 
                                      disabled={(date) => date < new Date().setHours(0,0,0,0)}
                                      initialFocus 
                                    />
                                </PopoverContent>
                            </Popover>
                            {formData.quit_goal === 'quit_date' && !validateGoals() && (
                                <p className="text-red-500 text-xs mt-1">Please select a future date (or today).</p>
                            )}
                      </motion.div>
                  )}
                </div>
              )}

              {currentStepData.id === 'motivation' && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="motivation">What is your biggest motivation to make a change?</Label>
                    <Textarea id="motivation" value={formData.motivation} onChange={(e) => handleInputChange('motivation', e.target.value)} placeholder="For my health, for my family... (optional)" rows={5} className="mt-2" />
                  </div>
                  <p className="text-sm text-gray-500 text-center">We'll remind you of this when things get tough.</p>
                </div>
              )}

              {currentStepData.id === 'plan' && (
                <div className="space-y-6 text-center">
                   <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                      <Target className="w-12 h-12 text-white" />
                    </div>
                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <div>
                        <span className="text-gray-600 font-semibold">Your Goal:</span>
                        <p className="font-bold text-blue-600 text-lg">
                            {
                                {
                                    'quit_completely': 'Quit Completely',
                                    'quit_date': `Quit on ${formData.quit_date ? format(formData.quit_date, 'MMMM d, yyyy') : ''}`,
                                    'reduce': 'Reduce Gradually',
                                    'maintain_current': 'Track Your Habits'
                                }[formData.quit_goal]
                            }
                        </p>
                    </div>
                    
                    {(formData.quit_goal === 'reduce' || formData.quit_goal === 'maintain_current') && (
                      <div>
                        <span className="text-gray-600 font-semibold">Daily Limit:</span>
                        <NumberStepper
                          value={parseInt(formData.daily_limit) || 0}
                          onValueChange={(value) => handleInputChange('daily_limit', String(value))}
                          min={0}
                          max={40}
                          unit="CIGARETTES/DAY"
                        />
                      </div>
                    )}
                    
                     <div>
                        <span className="text-gray-600 font-semibold">Your Motivation:</span>
                        <p className="text-gray-800 italic">"{formData.motivation || "Staying healthy!"}"</p>
                    </div>
                  </div>
                  <p className="text-gray-600">You're all set. Your journey to a smoke-free life begins now. You can do this!</p>
                </div>
              )}

            </Card>
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between items-center mt-6 w-full max-w-lg">
          <Button variant="ghost" onClick={handlePrevious} disabled={currentStep === 0}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Previous
          </Button>

          {currentStep < ONBOARDING_STEPS.length - 1 ? (
            <Button onClick={handleNext} disabled={!canProceed()}>
              Next <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleComplete} className="bg-green-600 hover:bg-green-700" disabled={isCompleting}>
              {isCompleting ? 'Setting up your plan...' : 'Start My Journey'} <Sparkles className={`w-4 h-4 ml-2 ${isCompleting ? 'animate-spin' : ''}`} />
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
