"use client";

import { useState } from "react";
import { SpinnerIcon } from "@/components/icons";
import type { Customer, Translation } from "@/types/queue";

interface SmsVerificationProps {
  t: Translation;
  customer: Customer;
  onCancel: () => void;
}

export function SmsVerification({ t, customer, onCancel }: SmsVerificationProps) {
  const [loading, setLoading] = useState(false);

  const handleSendSms = () => {
    setLoading(true);
    // Format the number for the SMS link
    const phone = customer.phone.startsWith("+") ? customer.phone : `+216${customer.phone}`;
    const message = encodeURIComponent(`Activate my ticket #${customer.ticket_number || "Pending"}`);
    
    // Check if device is iOS for correct separator
    const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const separator = isIos ? "&" : "?";
    
    // We send to a "fake" verification number or back to the shop
    window.location.href = `sms:+21652000000${separator}body=${message}`;
    
    // Reset loading after a delay to allow the SMS app to open
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div className="animate-fade-up flex flex-col items-center gap-6 text-center py-4">
      <div className="h-24 w-24 rounded-full bg-blue-500/10 border-2 border-blue-500/50 flex items-center justify-center shadow-lg shadow-blue-500/10 mb-2">
        <svg className="h-12 w-12 text-blue-500 animate-pulse" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      
      <div className="space-y-3">
        <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">
          {t.pending_title}
        </h2>
        <p className="text-stone-300 text-lg font-medium leading-relaxed max-w-[300px]">
          {t.sms_instruction}
        </p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 w-full space-y-2">
        <p className="text-xs font-bold text-stone-500 uppercase tracking-widest">{t.we_will_call}</p>
        <p className="text-2xl font-black text-amber-500 font-mono tracking-tighter">{customer.phone}</p>
        <button 
          onClick={onCancel}
          className="text-xs text-blue-400 hover:text-blue-300 font-bold uppercase tracking-widest underline decoration-blue-400/30"
        >
          {t.fix_number}
        </button>
      </div>

      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mt-2">
        <div className="h-full bg-blue-500 animate-shimmer w-full" />
      </div>

      <button 
        onClick={() => { if (window.confirm(t.cancel_confirm)) onCancel(); }}
        className="text-stone-500 hover:text-stone-300 text-sm mt-6 underline decoration-stone-500/30 font-bold"
      >
        {t.cancel_ticket}
      </button>
    </div>
  );
}
