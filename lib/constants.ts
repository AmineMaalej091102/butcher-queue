import type { Step } from "@/types/queue";

/** Maps each step to its ordinal index for the progress indicator. */
export const STEP_INDEX: Record<Step, number> = {
  form: 0,
  sms: 1,
  active: 2,
  cancelled: 2,
};

export const STEPS: Step[] = ["form", "sms", "active"];
export const CANCELLED_STEP: Step = "cancelled";

export const LANGS = ["en", "fr", "ar"] as const;

export const STORAGE_KEY = "butcher_customer_id";
