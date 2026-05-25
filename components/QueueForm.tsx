"use client";

import { useRef, useState } from "react";
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
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    const name = nameRef.current?.value?.trim();
    const phone = phoneRef.current?.value?.trim();

    if (!name || !phone) return;

    // Name length and character validation
    if (name.length < 3) {
      setError(t.dir === "rtl" ? "الإسم لازم يكون فيه 3 حروف على الأقل" : "Le nom doit comporter au moins 3 caractères");
      nameRef.current?.focus();
      return;
    }

    // Tunisian Phone Validation: starts with 2, 4, 5, or 9 and is 8 digits long
    const phoneRegex = /^[2459]\d{7}$/;
    
    if (!phoneRegex.test(phone)) {
      setError(t.phone_error);
      phoneRef.current?.focus();
      return;
    }

    onSubmit(name, phone);
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
          required
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
          className={`input-premium ${error ? 'border-red-500 focus:ring-red-500/20' : ''}`}
          autoComplete="tel"
          dir="ltr"
          maxLength={8}
          inputMode="numeric"
          onChange={() => error && setError(null)}
          required
        />
        {error && (
          <p className="mt-2 text-xs font-bold text-red-500 animate-shake">
            {error}
          </p>
        )}
      </div>
      <div className="pt-2">
        <button
          type="button"
          onClick={handleClick}
          disabled={loading}
          className="btn-primary w-full"
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
