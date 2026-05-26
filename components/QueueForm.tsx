"use client";

import { useRef, useState } from "react";
import { SpinnerIcon } from "@/components/icons";
import type { Translation } from "@/types/queue";

interface QueueFormProps {
  t: Translation;
  loading: boolean;
  onSubmit: (name: string, phone: string, sheeps: number) => void;
}

export function QueueForm({ t, loading, onSubmit }: QueueFormProps) {
  const nameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const [sheeps, setSheeps] = useState(1);
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

    if (sheeps < 1 || sheeps > 10) {
      setError(t.dir === "rtl" ? "لازم تختار بين 1 و 10 علالش" : "Veuillez choisir entre 1 et 10 moutons");
      return;
    }

    onSubmit(name, phone, sheeps);
  }

  const increment = () => sheeps < 10 && setSheeps(s => s + 1);
  const decrement = () => sheeps > 1 && setSheeps(s => s - 1);

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-stone-500">
            {t.sheeps}
          </label>
          <div className="input-premium flex items-center justify-between p-1 bg-stone-900/50">
            <button
              type="button"
              onClick={decrement}
              disabled={sheeps <= 1}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 active:scale-90 transition-all disabled:opacity-20 disabled:active:scale-100"
            >
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 12H6" />
              </svg>
            </button>
            <div className="flex flex-col items-center">
              <span className="text-xl font-black text-white font-mono">{sheeps}</span>
            </div>
            <button
              type="button"
              onClick={increment}
              disabled={sheeps >= 10}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-500/10 hover:bg-red-500/20 active:scale-90 transition-all disabled:opacity-20 disabled:active:scale-100"
            >
              <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      {error && (
        <p className="mt-2 text-xs font-bold text-red-500 animate-shake">
          {error}
        </p>
      )}
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
