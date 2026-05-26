import { useEffect } from "react";
import type { Customer, Translation } from "@/types/queue";

interface ActiveTicketProps {
  t: Translation;
  customer: Customer;
  serving: number;
  onBreak: boolean;
  onCancel: () => void;
}

export function ActiveTicket({ t, customer, serving, onBreak, onCancel }: ActiveTicketProps) {
  const isYourTurn = customer.ticket_number === serving;
  const isServed = serving > customer.ticket_number;
  const ahead = customer.ticket_number - serving;
  const estimatedTime = (ahead * 20) + (onBreak ? 30 : 0);

  useEffect(() => {
    if (isYourTurn && "vibrate" in navigator) {
      // Vibrate 3 times to grab attention
      navigator.vibrate([500, 200, 500, 200, 500]);
    }
  }, [isYourTurn]);

  if (isServed) {
    return (
      <div className="animate-fade-up flex flex-col items-center gap-6 text-center py-4">
        <div className="h-20 w-20 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg mb-2">
          <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
          </svg>
        </div>
        <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">
          {t.thank_you}
        </h2>
        <p className="text-stone-400 text-lg leading-relaxed max-w-[250px]">
          {t.served_msg}
        </p>
        <button 
          onClick={onCancel}
          className="mt-4 bg-white/5 hover:bg-white/10 text-stone-300 font-bold py-3 px-8 rounded-xl transition-all border border-white/10"
        >
          {t.join}
        </button>
      </div>
    );
  }

  if (isYourTurn) {
    return (
      <div className="animate-fade-up flex flex-col items-center gap-8 text-center">
        <div className="animate-success-pulse border-4 border-green-500/50 bg-green-500/10 rounded-[2.5rem] p-10 w-full shadow-[0_0_50px_rgba(34,197,94,0.3)] flex flex-col gap-6 items-center">
          <div className="animate-scale-infinite h-24 w-24 rounded-full bg-green-500 flex items-center justify-center shadow-[0_0_30px_rgba(34,197,94,0.5)]">
            <svg className="h-14 w-14 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          </div>
          
          <div className="space-y-2">
            <h2 className="text-4xl font-black text-white uppercase tracking-tight leading-none px-2 py-1 bg-green-500 rounded-lg inline-block">
              {t.your_number}
            </h2>
            <p className="text-9xl font-black text-green-500 drop-shadow-[0_0_20px_rgba(34,197,94,0.4)]">
              #{customer.ticket_number}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <p className="text-2xl font-bold text-white uppercase tracking-wide">
              {t.your_turn}
            </p>
          </div>
        </div>

        <button 
          onClick={() => { if (window.confirm(t.cancel_confirm)) onCancel(); }}
          className="text-stone-500 hover:text-stone-300 text-sm py-2 transition-colors underline decoration-stone-500/30"
        >
          {t.cancel_ticket}
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-up space-y-6">
      {/* Currently Serving */}
      <div className="serving-badge text-center">
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-red-400/60">
          {t.serving}
        </p>
        <p className="animate-count-pulse font-mono text-7xl font-black text-red-500">
          #{serving}
        </p>
      </div>

      {/* Your Number */}
      <div className="your-number-badge relative text-center">
        <div className="sparkle-container">
          <span className="animate-sparkle block text-2xl">✨</span>
        </div>
        <div className="absolute -top-4 -left-4">
          <span className="animate-float block text-3xl">🥩</span>
        </div>
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-blue-400/60">
          {t.your_number}
        </p>
        <p className="font-mono text-7xl font-black text-blue-400">
          #{customer.ticket_number}
        </p>
      </div>

      {/* Wait message */}
      <div className="animate-float rounded-2xl border border-white/5 bg-white/[0.03] px-6 py-4 text-center">
        <p className="text-sm font-semibold text-stone-400">{t.wait_msg}</p>
      </div>

      {/* Position & Time Indicator */}
      {customer.ticket_number > 0 && (
        <div className="space-y-4">
          <div className="text-center">
            {ahead > 0 ? (
              <div className="space-y-4">
                <p className="text-xl font-medium text-stone-400">
                  <span className="text-blue-400 font-bold">{ahead}</span> {t.ahead_of_you}
                </p>
                
                {/* Estimated Time Card */}
                <div className="bg-gradient-to-br from-indigo-500/10 to-purple-600/10 border border-indigo-500/20 rounded-2xl p-6 shadow-xl backdrop-blur-md relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-1">
                    {t.estimated_wait}
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-3xl font-black text-white tracking-tight">
                      {estimatedTime} <span className="text-lg font-bold text-indigo-300/70">{t.minutes}</span>
                    </p>
                  </div>
                </div>

                {onBreak && (
                  <div className="animate-pulse bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-center gap-3">
                    <span className="text-xl">🥪</span>
                    <p className="text-sm font-bold text-amber-500 text-left leading-tight">
                      {t.on_break} (+30 {t.minutes})
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-3xl font-black text-amber-500 animate-pulse uppercase tracking-wider">
                {t.youre_next}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="flex justify-center pt-2">
        <button 
          onClick={() => { if (window.confirm(t.cancel_confirm)) onCancel(); }}
          className="text-stone-500 hover:text-stone-300 text-sm py-2 transition-colors"
        >
          {t.cancel_ticket}
        </button>
      </div>
    </div>
  );
}
