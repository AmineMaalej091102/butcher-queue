"use client";
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { translations } from "@/translations";
import type { Customer, Lang } from '@/types/queue';

export default function ButcherDashboard() {
  const [lang, setLang] = useState<Lang>("en");
  const t = translations[lang];
  const [pending, setPending] = useState<Customer[]>([]);
  const [active, setActive] = useState<Customer[]>([]);
  const [serving, setServing] = useState(0);


  const fetchInitialData = useCallback(async () => {
    const { data: p } = await supabase.from('customers').select('*').eq('status', 'pending').order('created_at');
    const { data: a } = await supabase.from('customers').select('*').eq('status', 'active').order('ticket_number');
    const { data: s } = await supabase.from('queue_state').select('*').single();
    setPending(p as Customer[] || []);
    setActive(a as Customer[] || []);
    setServing(s?.current_serving || 0);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchInitialData();
    const sub = supabase.channel('butcher_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'customers' }, () => fetchInitialData())
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'queue_state' }, (payload) => setServing(payload.new.current_serving))
      .subscribe();
    return () => { supabase.removeChannel(sub); };
  }, [fetchInitialData]);

  async function approve(customer: Customer) {
    const nextTicket = active.length > 0 ? Math.max(...active.map(c => c.ticket_number)) + 1 : serving + 1;
    await supabase.from('customers').update({ status: 'active', ticket_number: nextTicket }).eq('id', customer.id);
  }

  async function nextCustomer() {
    const nextVal = serving + 1;
    await supabase.from('queue_state').update({ current_serving: nextVal }).eq('id', 1);
  }

  async function previousCustomer() {
    if (serving <= 0) return;
    const nextVal = serving - 1;
    await supabase.from('queue_state').update({ current_serving: nextVal }).eq('id', 1);
  }

  async function removeCustomer(id: string) {
    await supabase.from('customers').update({ status: 'cancelled' }).eq('id', id);
  }

  async function restartQueue() {
    if (!window.confirm(t.ctrl_restart_confirm)) return;
    await supabase.from('queue_state').update({ current_serving: 0 }).eq('id', 1);
    await supabase.from('customers').update({ status: 'cancelled' }).in('status', ['pending', 'active']);
  }

  return (
    <div className="bg-noise relative min-h-screen overflow-hidden text-stone-200" dir={t.dir}>
      <div className="orb orb-red" />
      <div className="orb orb-blue" />

      <div className="relative z-10 p-4 md:p-8 max-w-6xl mx-auto min-h-screen flex flex-col gap-8 animate-scale-in">
        <div className="flex justify-between items-center w-full mb-[-1rem] z-20">
          <LanguageSwitcher current={lang} onChange={setLang} />
          <button onClick={restartQueue} className="text-red-400 hover:text-red-300 hover:bg-red-500/10 text-sm font-bold flex items-center gap-2 transition-colors px-4 py-2 border border-red-500/20 rounded-xl bg-white/[0.02] shadow-xl backdrop-blur-md">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {t.ctrl_restart}
          </button>
        </div>

        {/* Header / Serving Badge */}
        <div className="glass-card rounded-3xl p-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <h1 className="text-sm font-bold uppercase tracking-widest text-red-400/80 mb-2">{t.ctrl_serving}</h1>
            <p className="animate-count-pulse font-mono text-7xl md:text-8xl font-black text-red-500">#{serving}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <button 
              onClick={previousCustomer} 
              disabled={serving <= 0}
              className="bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed border border-white/10 text-white w-full sm:w-auto text-lg py-6 px-8 rounded-2xl shadow-xl transition-all"
            >
              {t.ctrl_prev}
            </button>
            <button 
              onClick={nextCustomer} 
              className="btn-primary w-full sm:w-auto text-xl py-6 px-10 shadow-xl"
            >
              {t.ctrl_next}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Pending Column */}
          <div className="glass-card rounded-3xl p-6 md:p-8 flex flex-col gap-6">
            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 ring-1 ring-amber-500/20">
                <svg className="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white">{t.ctrl_pending} <span className="text-stone-500 text-base font-normal">({pending.length})</span></h2>
            </div>
            
            <div className="flex flex-col gap-4 overflow-y-auto max-h-[60vh] pr-2">
              {pending.length === 0 ? (
                <p className="text-stone-500 text-center py-8">{t.ctrl_no_pending}</p>
              ) : (
                pending.map(c => (
                  <div key={c.id} className="bg-white/[0.03] border border-white/5 p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all hover:bg-white/[0.05]">
                    <div>
                      <p className="font-bold text-white text-lg">{c.name}</p>
                      <p className="text-sm text-stone-400 mt-1">{c.phone}</p>
                      <p className="text-xs uppercase tracking-wider text-stone-500 mt-2">Code: <span className="font-mono text-red-400 font-bold tracking-widest">{c.code}</span></p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                      <button onClick={() => removeCustomer(c.id)} className="bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold w-full sm:w-auto py-3 px-4 text-sm rounded-xl transition">{t.ctrl_remove}</button>
                      <button onClick={() => approve(c)} className="btn-success w-full sm:w-auto py-3 px-6 text-sm">{t.ctrl_approve}</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Active Queue Column */}
          <div className="glass-card rounded-3xl p-6 md:p-8 flex flex-col gap-6">
            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 ring-1 ring-blue-500/20">
                <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white">{t.ctrl_active} <span className="text-stone-500 text-base font-normal">({active.length})</span></h2>
            </div>

            <div className="flex flex-col gap-3 overflow-y-auto max-h-[60vh] pr-2">
              {active.length === 0 ? (
                <p className="text-stone-500 text-center py-8">{t.ctrl_empty}</p>
              ) : (
                active.map(c => {
                  const isServing = c.ticket_number === serving;
                  return (
                    <div key={c.id} className={`p-5 rounded-2xl border flex items-center justify-between transition-all ${isServing ? 'bg-red-500/10 border-red-500/30' : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04]'}`}>
                      <div className="flex items-center gap-4">
                        <span className={`font-mono text-2xl font-black ${isServing ? 'text-red-400' : 'text-blue-400'}`}>#{c.ticket_number}</span>
                        <span className={`font-medium ${isServing ? 'text-white' : 'text-stone-300'}`}>{c.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        {isServing && <span className="text-xs font-bold uppercase tracking-widest text-red-500 bg-red-500/10 px-3 py-1 rounded-full">{t.ctrl_serving_badge}</span>}
                        <button onClick={() => removeCustomer(c.id)} className="text-stone-500 hover:text-red-400 transition p-2" title={t.ctrl_remove}>
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
