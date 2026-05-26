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
      if (data.status === "pending") setStep("sms");
      else if (data.status === "active") setStep("active");
      else if (data.status === "cancelled") setStep("cancelled");
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
            if (payload.new.status === "cancelled") setStep("cancelled");
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchCustomer]);

  const joinQueue = useCallback(async (name: string, phone: string) => {
    // Simple Rate Limiting check
    const lastJoin = localStorage.getItem('last_join_time');
    const now = Date.now();
    if (lastJoin && now - parseInt(lastJoin) < 60000) { // 1 minute cooldown
      const waitTime = Math.ceil((60000 - (now - parseInt(lastJoin))) / 1000);
      alert(`يرحم والديك أستنى شويه. زيد ${waitTime} ثانية و عاود جرب.`);
      return;
    }

    setLoading(true);

    // Check if customer already has an active/pending ticket
    const { data: existingCustomer } = await supabase
      .from("customers")
      .select("*")
      .eq("phone", phone)
      .in("status", ["pending", "active"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingCustomer) {
      localStorage.setItem(STORAGE_KEY, existingCustomer.id);
      setCustomer(existingCustomer as Customer);
      setStep(existingCustomer.status === "pending" ? "sms" : "active");
      setLoading(false);
      return;
    }

    const code = Math.floor(1000 + Math.random() * 9000).toString();

    const { data, error } = await supabase
      .from("customers")
      .insert([{ 
        name: name.substring(0, 50), // Limit name length
        phone, 
        code, 
        status: "pending" // Insert as pending for butcher approval
      }])
      .select()
      .single();

    setLoading(false);

    if (data) {
      localStorage.setItem(STORAGE_KEY, data.id);
      localStorage.setItem('last_join_time', now.toString()); // Update rate limit
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
