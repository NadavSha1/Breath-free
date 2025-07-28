import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CoffeeSupportPopup({ 
  isOpen, 
  onBuyMeCoffee, 
  onMaybeLater, 
  onNeverAsk 
}) {

  const handlePrimaryClick = () => {
    onBuyMeCoffee();
    onMaybeLater(); // Close the dialog immediately
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onMaybeLater();
      }
    }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center text-lg font-semibold text-gray-900 flex items-center justify-center gap-2">
            💛 Support BreatheFree
          </DialogTitle>
        </DialogHeader>
        
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="py-4 text-center"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-white" />
          </div>
          
          <p className="text-gray-700 mb-6 leading-relaxed">
            If BreatheFree helps you, consider buying us a coffee. Your support keeps it free for everyone.
          </p>
          
          <div className="space-y-3">
            <Button 
              onClick={handlePrimaryClick}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-medium"
              size="lg"
            >
              🧡 Buy Me a Coffee
            </Button>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={onMaybeLater}
                className="flex-1"
              >
                Remind Me Later
              </Button>
              <Button 
                variant="ghost" 
                onClick={onNeverAsk}
                className="flex-1 text-gray-500 hover:text-gray-700"
              >
                Don’t Show Again
              </Button>
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}