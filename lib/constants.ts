import type { Step } from "@/types/queue";

/** Maps each step to its ordinal index for the progress indicator. */
export const STEP_INDEX: Record<Step, number> = {
  form: 0,
  active: 1,
  cancelled: 1,
};

export const STEPS: Step[] = ["form", "active"];
export const CANCELLED_STEP: Step = "cancelled";

export const LANGS = ["en", "fr", "ar"] as const;

export const STORAGE_KEY = "butcher_customer_id";
