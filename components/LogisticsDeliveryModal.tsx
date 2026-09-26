'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Truck, Zap, ShieldAlert, CheckCircle2, Loader2 } from 'lucide-react';

export default function LogisticsDeliveryModal({ resourceName, onClose }: { resourceName: string; onClose: () => void }) {
  const [tokenBalance, setTokenBalance] = useState(125); // Seeker's current D.T. balance
  const [deliveryCostDT] = useState(25); // Cost in Delivery Tokens for this transport
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleDispatchLogistics = () => {
    if (tokenBalance < deliveryCostDT) {
      alert("Insufficient Delivery Tokens (D.T.). Please purchase an Extra D.T. top-up package.");
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      setTokenBalance(prev => prev - deliveryCostDT);
      setIsProcessing(false);
      setSuccess(true);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Managed Logistics Dispatch</h3>
              <p className="text-xs text-slate-500">Powered by VenueX & Delivery Partners</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold text-sm">✕</button>
        </div>

        {!success ? (
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Resource Item:</span>
                <span className="font-semibold text-slate-900">{resourceName}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>Your Available D.T.:</span>
                <span className="font-bold text-blue-600">{tokenBalance} D.T.</span>
              </div>
              <div className="flex justify-between text-xs text-slate-500 border-t border-slate-200 pt-2">
                <span>Required Logistics Cost:</span>
                <span className="font-bold text-slate-900">{deliveryCostDT} Delivery Tokens (D.T.)</span>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl flex items-start space-x-2 text-xs text-amber-800">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p>VenueX coordinates the transport partner directly on your behalf. Neither you nor the provider pay the partner directly.</p>
            </div>

            <button 
              onClick={handleDispatchLogistics}
              disabled={isProcessing}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-3 px-4 rounded-2xl transition-all shadow-sm flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Dispatching Transport Partner...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-cyan-300" />
                  <span>Authorize & Deduct {deliveryCostDT} D.T.</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="text-center py-6 space-y-4">
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-base text-slate-900">Logistics Dispatched Successfully!</h4>
              <p className="text-xs text-slate-500 mt-1">Our delivery partner has been booked. Margin captured securely via token economics[cite: 1].</p>
            </div>
            <button 
              onClick={onClose}
              className="w-full bg-slate-900 text-white font-bold text-xs py-3 rounded-xl hover:bg-slate-800 transition-colors"
            >
              Close Window
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}