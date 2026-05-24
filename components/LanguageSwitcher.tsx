import { LANGS } from "@/lib/constants";
import type { Lang } from "@/types/queue";

const LABELS: Record<Lang, string> = { en: "EN", fr: "FR", ar: "عر" };

interface LanguageSwitcherProps {
  current: Lang;
  onChange: (lang: Lang) => void;
}

export function LanguageSwitcher({ current, onChange }: LanguageSwitcherProps) {
  return (
    <div className="mb-6 flex items-center gap-2">
      {LANGS.map((l) => (
        <button
          key={l}
          onClick={() => onChange(l)}
          className={`lang-btn ${current === l ? "lang-btn-active" : ""}`}
        >
          {LABELS[l]}
        </button>
      ))}
    </div>
  );
}
