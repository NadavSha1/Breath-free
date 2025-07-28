
import React, { useState, useEffect } from "react";
import { User, GoalHistory, SmokingEntry, CravingEntry, Achievement } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { User as UserIcon, Bell, Target, ChevronRight, LogOut, Trash2, Star, MessageSquare, Share2, Coffee } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import NumberStepper from "../components/ui/NumberStepper";

export default function Account() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showCoffeeModal, setShowCoffeeModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const [profileData, setProfileData] = useState({ age: '', smoking_years: '' });
  const [goalData, setGoalData] = useState({ daily_limit: '0' });
  const [profileErrors, setProfileErrors] = useState({ age: '', smoking_years: '' });
  const [goalError, setGoalError] = useState('');
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    loadUserData();
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('open') === 'goal') {
      setShowGoalModal(true);
    }
  }, []);

  const loadUserData = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      setProfileData({ age: currentUser.age || '', smoking_years: currentUser.smoking_years || '' });
      setGoalData({ daily_limit: String(currentUser.daily_limit || 0) });
    } catch (error) { 
      console.error("Error loading user data:", error); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleSave = async (data, onComplete, validator, errorSetter) => {
    if (validator && !validator()) {
      return;
    }

    setSaving(true);
    try {
      await User.updateMyUserData(data);

      if (data.daily_limit !== undefined && data.daily_limit !== user.daily_limit) {
        await GoalHistory.create({
          date: new Date().toISOString(),
          limit: Number(data.daily_limit),
        });
      }

      await loadUserData();
      onComplete();
    } catch (error) { 
      console.error("Error saving data:", error); 
      alert("Failed to save settings. Please try again.");
    } finally { 
      setSaving(false); 
    }
  };

  const validateProfile = () => {
    const errors = { age: '', smoking_years: '' };
    const age = parseInt(profileData.age);
    const smokingYears = parseInt(profileData.smoking_years);

    if (isNaN(age) || age <= 0) {
      errors.age = "Age must be a positive number.";
    }
    if (isNaN(smokingYears) || smokingYears < 0) {
      errors.smoking_years = "Years must be a positive number or zero.";
    }
    if (age > 0 && smokingYears >= age) {
        errors.smoking_years = "Years smoking cannot be greater than or equal to age.";
    }

    setProfileErrors(errors);
    return !errors.age && !errors.smoking_years;
  };
  
  const validateGoal = () => {
    const limit = parseInt(goalData.daily_limit);
    if (isNaN(limit) || limit < 0) {
      setGoalError("Daily limit must be a positive number or zero.");
      return false;
    }
    setGoalError('');
    return true;
  };

  const handleRating = async () => {
    console.log(`User rated the app: ${rating} stars`);
    setShowRatingModal(false);
    setRating(0);
  };

  const handleFeedback = async () => {
    console.log(`User feedback: ${feedback}`);
    setShowFeedbackModal(false);
    setFeedback('');
  };

  const copyShareLink = async () => {
    const shareText = "Check out BreatheFree - helping me quit smoking! 🚭";
    const shareUrl = window.location.origin;
    try {
      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      alert('Link copied to clipboard!');
      setShowShareModal(false);
    } catch (copyError) {
      alert('Please copy this link manually: ' + shareUrl);
    }
  };

  const handleLogout = async () => {
    try {
      await User.logout();
      navigate(createPageUrl("Login"));
    } catch (error) {
      console.error('Logout error:', error);
      // Force redirect even if logout fails
      navigate(createPageUrl("Login"));
    }
  };

  const handleDeleteAccount = async () => {
    setSaving(true);
    try {
      const allEntries = await SmokingEntry.list();
      const allCravings = await CravingEntry.list();
      const allAchievements = await Achievement.list();
      const allGoals = await GoalHistory.list();
      
      const deletionPromises = [
        ...allEntries.map(e => SmokingEntry.delete(e.id)),
        ...allCravings.map(c => CravingEntry.delete(c.id)),
        ...allAchievements.map(a => Achievement.delete(a.id)),
        ...allGoals.map(g => GoalHistory.delete(g.id))
      ];
      
      await Promise.all(deletionPromises);
      
      // Reset user-specific fields
      await User.updateMyUserData({
        age: null,
        smoking_years: null,
        cigarettes_per_day_before: null,
        cost_per_pack: null,
        cigarettes_per_pack: 20,
        currency: "USD",
        quit_goal: null,
        daily_limit: null,
        quit_date: null,
        motivation: null,
        onboarding_completed: false,
        journey_start_date: null
      });

      await User.logout();
      navigate(createPageUrl("Login"));

    } catch (error) {
      console.error("Error deleting account data:", error);
      alert("Could not delete account data. Please try again.");
    } finally {
      setSaving(false);
      setShowDeleteModal(false);
      // Navigate to a logged-out state, e.g., an auth page or the root
      navigate(createPageUrl("Onboarding"));
    }
  };

  if (loading) return <div className="p-8 text-center">Loading Account...</div>;

  const AccountRow = ({ icon: Icon, title, onClick, variant = "default", badge = null }) => (
    <div onClick={onClick} className={`flex items-center justify-between p-4 rounded-lg cursor-pointer transition-colors ${ variant === "danger" ? "hover:bg-red-50" : "hover:bg-gray-50"}`}>
      <div className="flex items-center gap-4">
        <div className={`p-2 rounded-full ${ variant === "danger" ? 'bg-red-100' : 'bg-gray-100'}`}>
          <Icon className={`w-5 h-5 ${variant === "danger" ? "text-red-500" : "text-gray-600"}`} />
        </div>
        <div className="flex items-center gap-2">
          <span className={`font-medium ${variant === "danger" ? "text-red-600" : "text-gray-900"}`}>{title}</span>
          {badge && <Badge variant="secondary" className="text-xs px-2 py-0.5">{badge}</Badge>}
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-gray-400" />
    </div>
  );

  return (
    <>
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center py-2">
            <h1 className="text-2xl font-bold text-gray-900 flex-1">Account</h1>
            <Button variant="ghost" onClick={() => navigate(createPageUrl("Home"))} className="text-blue-600 hover:text-blue-700">Done</Button>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-2xl font-bold text-blue-600">
                  {user?.full_name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{user?.full_name}</h2>
                  <p className="text-gray-600">{user?.email}</p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="p-2">
              <AccountRow icon={UserIcon} title="Profile Details" onClick={() => setShowProfileModal(true)} />
              <Separator />
              <AccountRow icon={Target} title="Daily Goal" onClick={() => setShowGoalModal(true)} />
              <Separator />
              <AccountRow icon={Bell} title="Notifications" onClick={() => setShowNotificationsModal(true)} badge="Coming Soon" />
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Actions</h3>
            <Card className="p-2">
              <AccountRow icon={Star} title="Rate App" onClick={() => setShowRatingModal(true)} />
              <Separator />
              <AccountRow icon={MessageSquare} title="Share Feedback" onClick={() => setShowFeedbackModal(true)} />
              <Separator />
              <AccountRow icon={Share2} title="Share with Friends" onClick={() => setShowShareModal(true)} />
              <Separator />
              <AccountRow icon={Coffee} title="Buy Me Coffee" onClick={() => setShowCoffeeModal(true)} />
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="p-2">
              <AccountRow icon={LogOut} title="Logout" onClick={handleLogout} />
              <Separator />
              <AccountRow icon={Trash2} title="Delete Account" onClick={() => setShowDeleteModal(true)} variant="danger" />
            </Card>
          </motion.div>
        </div>
        
        {/* Profile Modal */}
        <Dialog open={showProfileModal} onOpenChange={setShowProfileModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Profile Details</DialogTitle>
              <DialogDescription>Update your personal information.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="age">Age</Label>
                <Input 
                  id="age" 
                  type="number"
                  min="1"
                  value={profileData.age} 
                  onChange={(e) => setProfileData({...profileData, age: e.target.value})}
                  placeholder="Enter your age"
                />
                {profileErrors.age && <p className="text-red-500 text-xs mt-1">{profileErrors.age}</p>}
              </div>
              <div>
                <Label htmlFor="smoking_years">Years Smoking</Label>
                <Input 
                  id="smoking_years" 
                  type="number"
                  min="0"
                  value={profileData.smoking_years} 
                  onChange={(e) => setProfileData({...profileData, smoking_years: e.target.value})}
                  placeholder="Years you've been smoking"
                />
                {profileErrors.smoking_years && <p className="text-red-500 text-xs mt-1">{profileErrors.smoking_years}</p>}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowProfileModal(false)}>Cancel</Button>
              <Button onClick={() => handleSave({ age: parseInt(profileData.age) || null, smoking_years: parseInt(profileData.smoking_years) || null }, () => setShowProfileModal(false), validateProfile, setProfileErrors)} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Goal Modal */}
        <Dialog open={showGoalModal} onOpenChange={setShowGoalModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Daily Goal</DialogTitle>
              <DialogDescription>Set a daily limit for cigarettes.</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="daily_limit">Daily Cigarette Limit</Label>
              <NumberStepper
                value={parseInt(goalData.daily_limit) || 0}
                onValueChange={(value) => setGoalData({ daily_limit: String(value) })}
                min={0}
                max={40}
                unit="CIGARETTES/DAY"
              />
              {goalError && <p className="text-red-500 text-xs mt-1">{goalError}</p>}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowGoalModal(false)}>Cancel</Button>
              <Button onClick={() => handleSave({ daily_limit: parseInt(goalData.daily_limit) }, () => setShowGoalModal(false), validateGoal, setGoalError)} disabled={saving}>{saving ? 'Saving...' : 'Set Goal'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Notifications Modal */}
        <Dialog open={showNotificationsModal} onOpenChange={setShowNotificationsModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Notifications</DialogTitle>
              <DialogDescription>
                Push notifications are coming soon! We're working on bringing you helpful reminders.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="text-center py-8">
                <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Coming Soon</h3>
                <p className="text-gray-600 mb-6">
                  We're working on push notifications to help you stay motivated on your journey.
                </p>
                
                <div className="space-y-4 text-left">
                  <div className="flex items-center justify-between opacity-50">
                    <div>
                      <Label>Daily Check-ins</Label>
                      <p className="text-sm text-gray-500">Evening reminder to log your day</p>
                    </div>
                    <Switch disabled />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between opacity-50">
                    <div>
                      <Label>Goal Reminders</Label>
                      <p className="text-sm text-gray-500">Morning motivation about your goals</p>
                    </div>
                    <Switch disabled />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between opacity-50">
                    <div>
                      <Label>Craving Support</Label>
                      <p className="text-sm text-gray-500">Random motivational messages</p>
                    </div>
                    <Switch disabled />
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setShowNotificationsModal(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Rating Modal */}
        <Dialog open={showRatingModal} onOpenChange={setShowRatingModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rate BreatheFree</DialogTitle>
              <DialogDescription>How would you rate your experience?</DialogDescription>
            </DialogHeader>
            <div className="flex justify-center gap-2 py-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`text-3xl transition-colors ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                >
                  ★
                </button>
              ))}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRatingModal(false)}>Cancel</Button>
              <Button onClick={handleRating} disabled={rating === 0}>Submit Rating</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Feedback Modal */}
        <Dialog open={showFeedbackModal} onOpenChange={setShowFeedbackModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Share Feedback</DialogTitle>
              <DialogDescription>Help us improve BreatheFree with your thoughts.</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="feedback">Your Feedback</Label>
              <textarea
                id="feedback"
                className="w-full mt-2 p-3 border rounded-md h-32 resize-none"
                placeholder="What can we improve? What do you love?"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowFeedbackModal(false)}>Cancel</Button>
              <Button onClick={handleFeedback} disabled={feedback.trim() === ''}>Send Feedback</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Share Modal */}
        <Dialog open={showShareModal} onOpenChange={setShowShareModal}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Share with Friends</DialogTitle>
              <DialogDescription>Help others start their smoke-free journey.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Button onClick={copyShareLink} variant="outline" className="w-full" size="lg">
                Copy Link
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Coffee Modal */}
        <Dialog open={showCoffeeModal} onOpenChange={setShowCoffeeModal}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Enjoying BreatheFree?</DialogTitle>
            </DialogHeader>
            <div className="py-4 text-center">
              <p className="text-gray-600 mb-6">
              If this app helps you, your coffee means a lot! Your support keeps it free for everyone — and helps others on their journey too.
              </p>
              <Button 
                onClick={() => {
                  window.open('https://buymeacoffee.com/nadavsha', '_blank');
                  setShowCoffeeModal(false);
                }}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black"
                size="lg"
              >
                <Coffee className="w-4 h-4 mr-2" />
                Buy Me a Coffee
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Account Modal */}
        <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Account Data</DialogTitle>
              <DialogDescription>
                This action is <strong className="text-red-600">permanent and irreversible.</strong> All your logged data will be <strong className="text-red-600">permanently deleted.</strong> This action <strong className="text-red-600">cannot be undone.</strong>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleDeleteAccount} disabled={saving}>{saving ? 'Deleting...' : 'Delete My Data'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
