"use client";

import { useRef } from "react";
import { SpinnerIcon } from "@/components/icons";
import type { Translation } from "@/types/queue";

interface QueueFormProps {
  t: Translation;
  loading: boolean;
  onSubmit: (name: string, phone: string) => void;
}

export function QueueForm({ t, loading, onSubmit }: QueueFormProps) {
  const nameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);

  function handleClick() {
    const name = nameRef.current?.value?.trim();
    const phone = phoneRef.current?.value?.trim();
    if (name && phone) onSubmit(name, phone);
  }

  return (
    <div className="animate-fade-up space-y-4">
      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-stone-500">
          {t.name}
        </label>
        <input
          ref={nameRef}
          id="customer-name"
          type="text"
          placeholder={t.name}
          className="input-premium"
          autoComplete="name"
        />
      </div>
      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-stone-500">
          {t.phone}
        </label>
        <input
          ref={phoneRef}
          id="customer-phone"
          type="tel"
          placeholder={t.phone}
          className="input-premium"
          autoComplete="tel"
          dir="ltr"
        />
      </div>
      <div className="pt-2">
        <button
          type="button"
          onClick={handleClick}
          disabled={loading}
          className="btn-primary"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <SpinnerIcon />
              {t.loading}
            </span>
          ) : (
            t.join
          )}
        </button>
      </div>
    </div>
  );
}
