"use client";

import { WarningIcon, ChatBubbleIcon } from "@/components/icons";
import { SMS_RECIPIENT } from "@/lib/constants";
import type { Customer, Translation } from "@/types/queue";

interface SmsVerificationProps {
  t: Translation;
  customer: Customer;
  onCancel: () => void;
}

function buildSmsUrl(customer: Customer): string {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const body = `Verify Ticket for ${customer.name}: ${customer.code}`;
  return `sms:${SMS_RECIPIENT}${isIOS ? "&" : "?"}body=${encodeURIComponent(body)}`;
}

export function SmsVerification({ t, customer, onCancel }: SmsVerificationProps) {
  return (
    <div className="animate-fade-up space-y-6">
      <div className="text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 ring-1 ring-amber-500/20">
          <WarningIcon className="h-6 w-6 text-amber-500" />
        </div>
        <h2 className="text-xl font-bold text-white">{t.pending_title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-stone-400">
          {t.sms_instruction}
        </p>
      </div>

      <div className="ticket-badge text-center">
        <p className="mb-1 text-xs font-bold uppercase tracking-widest text-red-400/70">
          {t.verification_code}
        </p>
        <p className="relative z-10 font-mono text-5xl font-black tracking-[0.25em] text-red-500">
          {customer.code}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <a href={buildSmsUrl(customer)} className="btn-success">
          <span className="flex items-center justify-center gap-3">
            <ChatBubbleIcon />
            {t.send_sms}
          </span>
        </a>
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
