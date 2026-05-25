"use client";

import { useState } from "react";
import { translations } from "@/translations";
import { useQueue } from "@/hooks/useQueue";
import { ShoppingBagIcon } from "@/components/icons";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { StepIndicator } from "@/components/StepIndicator";
import { QueueForm } from "@/components/QueueForm";
import { SmsVerification } from "@/components/SmsVerification";
import { ActiveTicket } from "@/components/ActiveTicket";
import type { Lang } from "@/types/queue";

export default function CustomerPage() {
  const [lang, setLang] = useState<Lang>("en");
  const { customer, serving, onBreak, step, loading, joinQueue, cancelTicket } = useQueue();
  const t = translations[lang];

  return (
    <div className="bg-noise relative min-h-screen overflow-hidden" dir={t.dir}>
      {/* Decorative background orbs */}
      <div className="orb orb-red" />
      <div className="orb orb-blue" />

      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-8">
        <LanguageSwitcher current={lang} onChange={setLang} />

        {/* Main Card */}
        <div className="glass-card w-full max-w-md rounded-3xl p-8 animate-scale-in">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-red-600/20 to-red-800/10 ring-1 ring-red-500/20">
              <ShoppingBagIcon className="h-8 w-8 text-red-500" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">
              {t.title}
            </h1>
            <p className="mt-1 text-sm text-stone-500">{t.subtitle}</p>
          </div>

          {/* Eid Mubarak Banner */}
          <div className="mb-6 overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-amber-500/10 p-[1px]">
            <div className="flex items-center justify-center gap-2 bg-stone-950/40 py-3 px-4 backdrop-blur-sm">
              <span className="text-xl">🌙</span>
              <span className="bg-gradient-to-r from-amber-200 to-amber-500 bg-clip-text text-lg font-black tracking-wider text-transparent uppercase">
                {t.eid_mubarak}
              </span>
              <span className="text-xl">✨</span>
            </div>
          </div>

          <StepIndicator currentStep={step} />

          {step === "form" && (
            <QueueForm t={t} loading={loading} onSubmit={joinQueue} />
          )}

          {step === "sms" && customer && (
            <SmsVerification t={t} customer={customer} onCancel={cancelTicket} />
          )}

          {step === "active" && customer && (
            <ActiveTicket t={t} customer={customer} serving={serving} onBreak={onBreak} onCancel={cancelTicket} />
          )}
        </div>

        {/* Footer */}
        <p className="mt-8 text-xs text-stone-700">{t.powered_by}</p>
      </div>
    </div>
  );
}
