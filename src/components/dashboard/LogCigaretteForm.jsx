
import React, { useState } from "react";
import { SmokingEntry } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { LOCATIONS, TRIGGERS } from "@/components/utils/appData";

export default function LogCigaretteForm({ isOpen, onClose, onSave, mode = 'detailed' }) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    timestamp: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    location: "",
    trigger: ""
  });

  const handleInputChange = (field, value) => {
    if (field === 'timestamp') {
      const selectedTime = new Date(value);
      const now = new Date();
      if (selectedTime > now) {
        return;
      }
    }
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    const selectedTime = new Date(formData.timestamp);
    const now = new Date();
    if (selectedTime > now) {
      alert('Cannot log cigarettes in the future. Please select a past or current time.');
      return;
    }

    setIsLoading(true);
    try {
      const dataToSave = {
        timestamp: new Date(formData.timestamp).toISOString(),
        location: formData.location || null,
        trigger: formData.trigger || null,
        quick_log: false,
      };
      
      await SmokingEntry.create(dataToSave);
      onSave();
      onClose();
    } catch (error) {
      console.error('Error logging cigarette:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      timestamp: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      location: "",
      trigger: ""
    });
  }

  const maxDateTime = format(new Date(), "yyyy-MM-dd'T'HH:mm");

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open) {
            onClose();
            resetForm();
        }
    }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl text-center">Log Cigarette</DialogTitle>
          <DialogDescription className="text-center">
            Add details to help identify patterns
          </DialogDescription>
        </DialogHeader>

        <motion.div className="overflow-hidden">
          <div className="space-y-6 pt-4">
            <div className="space-y-2">
              <Label htmlFor="timestamp" className="text-sm font-medium">When?</Label>
              <Input
                id="timestamp"
                type="datetime-local"
                value={formData.timestamp}
                max={maxDateTime}
                onChange={(e) => handleInputChange('timestamp', e.target.value)}
                className="text-sm"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Where were you?
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {LOCATIONS.map((loc) => {
                  const LocationIcon = loc.icon;
                  return (
                    <Button 
                      key={loc.value} 
                      variant={formData.location === loc.value ? "default" : "outline"} 
                      onClick={() => handleInputChange('location', loc.value)}
                      className="h-12 flex flex-col items-center gap-1 text-xs"
                      aria-label={`Location: ${loc.label}`}
                    >
                      <LocationIcon className="w-4 h-4" />
                      <span>{loc.label}</span>
                    </Button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Zap className="w-4 h-4" /> What triggered it?
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {TRIGGERS.map((trig) => {
                  const TriggerIcon = trig.icon;
                  return (
                    <Button 
                      key={trig.value} 
                      variant={formData.trigger === trig.value ? "default" : "outline"} 
                      onClick={() => handleInputChange('trigger', trig.value)}
                      className="h-12 flex flex-col items-center gap-1 text-xs"
                      aria-label={`Trigger: ${trig.label}`}
                    >
                      <TriggerIcon className="w-4 h-4" />
                      <span>{trig.label}</span>
                    </Button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isLoading} className="flex-1">
                {isLoading ? "Saving..." : "Save Log"}
              </Button>
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
