"use client";
import type { Translation } from "@/types/queue";

interface CancelledTicketProps {
  t: Translation;
  onClose: () => void;
}

export function CancelledTicket({ t, onClose }: CancelledTicketProps) {
  return (
    <div className="animate-fade-up flex flex-col items-center gap-8 text-center py-6">
      <div className="h-24 w-24 rounded-full bg-red-500/10 border-4 border-red-500/20 flex items-center justify-center shadow-[0_0_40px_rgba(239,68,68,0.2)] animate-pulse">
        <svg className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>

      <div className="space-y-3">
        <h2 className="text-3xl font-black text-white uppercase tracking-tight italic">
          {t.cancelled_title}
        </h2>
        <p className="text-stone-400 text-lg leading-relaxed max-w-[280px]">
          {t.cancelled_msg}
        </p>
      </div>

      <button 
        onClick={onClose}
        className="btn-primary py-4 px-12 rounded-2xl shadow-2xl transition-all active:scale-95 group flex items-center gap-3"
      >
        <span>{t.join}</span>
        <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </button>
    </div>
  );
}
