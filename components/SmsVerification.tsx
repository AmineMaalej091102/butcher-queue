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
      <div className="h-20 w-20 rounded-full bg-amber-500/10 border-2 border-amber-500/50 flex items-center justify-center shadow-lg shadow-amber-500/10 mb-2">
        <svg className="h-10 w-10 text-amber-500 animate-pulse" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
      </div>
      
      <div className="space-y-2">
        <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">
          {t.pending_title}
        </h2>
        <p className="text-stone-400 text-sm leading-relaxed max-w-[280px]">
          {t.sms_instruction}
        </p>
      </div>

      <button
        onClick={handleSendSms}
        disabled={loading}
        className="btn-primary w-full py-5 text-lg"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <SpinnerIcon />
            {t.loading}
          </span>
        ) : (
          t.send_sms
        )}
      </button>

      <button 
        onClick={() => { if (window.confirm(t.cancel_confirm)) onCancel(); }}
        className="text-stone-500 hover:text-stone-300 text-sm mt-4 underline decoration-stone-500/30"
      >
        {t.cancel_ticket}
      </button>
    </div>
  );
}
