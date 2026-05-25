"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { STORAGE_KEY } from "@/lib/constants";
import type { Customer, Step } from "@/types/queue";

interface QueueState {
  customer: Customer | null;
  serving: number;
  onBreak: boolean;
  step: Step;
  loading: boolean;
  joinQueue: (name: string, phone: string) => Promise<void>;
  cancelTicket: () => Promise<void>;
}

export function useQueue(): QueueState {
  const [step, setStep] = useState<Step>("form");
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [serving, setServing] = useState(0);
  const [onBreak, setOnBreak] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchCustomer = useCallback(async (id: string) => {
    const { data } = await supabase
      .from("customers")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (data) {
      setCustomer(data as Customer);
      setStep(data.status === "pending" ? "sms" : "active");
    }
  }, []);

  useEffect(() => {
    const savedId = localStorage.getItem(STORAGE_KEY);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (savedId) fetchCustomer(savedId);

    // Fetch initial serving number
    supabase
      .from("queue_state")
      .select("*")
      .single()
      .then(({ data }) => {
        setServing(data?.current_serving || 0);
        setOnBreak(data?.on_break || false);
      });

    // Subscribe to real-time updates
    const channel = supabase
      .channel("queue_updates")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "queue_state" },
        (payload) => {
          setServing(payload.new.current_serving);
          setOnBreak(payload.new.on_break);
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "customers" },
        (payload) => {
          const myId = localStorage.getItem(STORAGE_KEY);
          if (payload.new.id === myId) {
            setCustomer(payload.new as Customer);
            if (payload.new.status === "active") setStep("active");
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchCustomer]);

  const joinQueue = useCallback(async (name: string, phone: string) => {
    setLoading(true);
    const code = Math.floor(1000 + Math.random() * 9000).toString();

    const { data, error } = await supabase
      .from("customers")
      .insert([{ name, phone, code, status: "pending" }])
      .select()
      .single();

    setLoading(false);

    if (data) {
      localStorage.setItem(STORAGE_KEY, data.id);
      setCustomer(data as Customer);
      setStep("sms");
    } else {
      console.error(error);
    }
  }, []);

  const cancelTicket = useCallback(async () => {
    if (!customer) return;
    setLoading(true);
    await supabase.from("customers").update({ status: "cancelled" }).eq("id", customer.id);
    localStorage.removeItem(STORAGE_KEY);
    setCustomer(null);
    setStep("form");
    setLoading(false);
  }, [customer]);

  return { customer, serving, onBreak, step, loading, joinQueue, cancelTicket };
}
