import type { Step } from "@/types/queue";

/** Maps each step to its ordinal index for the progress indicator. */
export const STEP_INDEX: Record<Step, number> = {
  form: 0,
  sms: 1,
  active: 2,
  cancelled: 2, // Map to active for indicator logic or handle separately
};

export const STEPS: Step[] = ["form", "sms", "active", "cancelled"];

export const LANGS = ["en", "fr", "ar"] as const;

export const STORAGE_KEY = "butcher_customer_id";

export const SMS_RECIPIENT = "+21692536828";
