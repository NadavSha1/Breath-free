import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Star, X } from 'lucide-react';

export default function UpgradeModal({ isOpen, onClose }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0">
        <div className="p-8 text-center space-y-4">
            <h2 className="text-2xl font-bold">Unlock Detailed Analysis</h2>
            <p className="text-gray-600">
                Gain deeper insights into your habits with Trigger Analysis, a Pro feature.
            </p>
            <div className="bg-gray-100 p-4 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />)}
                </div>
                <blockquote className="italic text-gray-700">"Seeing my triggers helped me finally break the cycle!"</blockquote>
                <p className="text-sm text-gray-500 mt-2">- A Happy User</p>
            </div>
        </div>
        <div className="bg-gray-50 p-6 space-y-4">
            <div className="border-2 border-blue-500 rounded-lg p-4 bg-white">
                <h3 className="font-bold text-lg">Monthly Pro</h3>
                <p className="text-gray-600">$4.99 / month</p>
            </div>
            <Button className="w-full bg-blue-600 hover:bg-blue-700" size="lg">Start 7-Day Free Trial</Button>
            <p className="text-xs text-center text-gray-500">
                Cancel anytime. Billing starts after trial unless canceled.
            </p>
        </div>
        <Button variant="ghost" size="icon" className="absolute top-4 right-4" onClick={onClose}><X className="w-5 h-5" /></Button>
      </DialogContent>
    </Dialog>
  );
}