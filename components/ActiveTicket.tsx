import type { Customer, Translation } from "@/types/queue";

interface ActiveTicketProps {
  t: Translation;
  customer: Customer;
  serving: number;
  onCancel: () => void;
}

export function ActiveTicket({ t, customer, serving, onCancel }: ActiveTicketProps) {
  const ahead = customer.ticket_number - serving;

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
        <div className="text-center">
          <p className="text-xs text-stone-600">
            {ahead > 0
              ? `${ahead} ${t.ahead_of_you}`
              : t.youre_next}
          </p>
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
