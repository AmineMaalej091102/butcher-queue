export type Lang = "en" | "fr" | "ar";

export type Step = "form" | "sms" | "active" | "cancelled";

export interface Customer {
  id: string;
  name: string;
  phone: string;
  code: string;
  status: "pending" | "active" | "served" | "cancelled";
  ticket_number: number;
  created_at: string;
}

export interface Translation {
  dir: "ltr" | "rtl";
  title: string;
  subtitle: string;
  name: string;
  phone: string;
  join: string;
  pending_title: string;
  sms_instruction: string;
  send_sms: string;
  active_title: string;
  serving: string;
  your_number: string;
  wait_msg: string;
  verification_code: string;
  ahead_of_you: string;
  youre_next: string;
  powered_by: string;
  loading: string;
  ctrl_restart: string;
  ctrl_restart_confirm: string;
  ctrl_serving: string;
  ctrl_prev: string;
  ctrl_next: string;
  ctrl_pending: string;
  ctrl_no_pending: string;
  ctrl_remove: string;
  ctrl_approve: string;
  ctrl_active: string;
  ctrl_empty: string;
  ctrl_serving_badge: string;
  cancel_ticket: string;
  cancel_confirm: string;
  your_turn: string;
  thank_you: string;
  served_msg: string;
  eid_mubarak: string;
  estimated_wait: string;
  minutes: string;
  hours: string;
  phone_error: string;
  lunch_break: string;
  on_break: string;
  cancelled_title: string;
  cancelled_msg: string;
  remind_sms: string;
  remind_sms_body: string;
}
