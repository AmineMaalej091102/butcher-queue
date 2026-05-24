import { useEffect } from "react";
import type { Customer, Translation } from "@/types/queue";

interface ActiveTicketProps {
  t: Translation;
  customer: Customer;
  serving: number;
  onCancel: () => void;
}

export function ActiveTicket({ t, customer, serving, onCancel }: ActiveTicketProps) {
  const isYourTurn = customer.ticket_number === serving;
  const ahead = customer.ticket_number - serving;

  useEffect(() => {
    if (isYourTurn && "vibrate" in navigator) {
      // Vibrate 3 times to grab attention
      navigator.vibrate([500, 200, 500, 200, 500]);
    }
  }, [isYourTurn]);

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
      <div className="your-number-badge text-center">
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

      {/* Position indicator */}
      {customer.ticket_number && serving > 0 && (
        <div className="text-center p-4">
          {ahead > 0 ? (
            <p className="text-xl font-medium text-stone-400">
              <span className="text-blue-400 font-bold">{ahead}</span> {t.ahead_of_you}
            </p>
          ) : (
            <p className="text-3xl font-black text-amber-500 animate-pulse uppercase tracking-wider">
              {t.youre_next}
            </p>
          )}
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
