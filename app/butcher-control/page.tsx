"use client";
import { useState, useEffect, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { supabase } from '@/lib/supabase';
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { translations } from "@/translations";
import type { Customer, Lang } from '@/types/queue';

export default function ButcherDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [lang, setLang] = useState<Lang>("en");
  const t = translations[lang];
  const [pending, setPending] = useState<Customer[]>([]);
  const [active, setActive] = useState<Customer[]>([]);
  const [serving, setServing] = useState(0);
  const [onBreak, setOnBreak] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOrigin(window.location.origin);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple verification - change '1234' to your desired password
    if (password === "moutawer marouane") {
      setIsAuthenticated(true);
    } else {
      alert("Incorrect password");
    }
  };

  const fetchInitialData = useCallback(async () => {
    const { data: p } = await supabase.from('customers').select('*').eq('status', 'pending').order('created_at');
    const { data: a } = await supabase.from('customers').select('*').eq('status', 'active').order('ticket_number');
    const { data: s } = await supabase.from('queue_state').select('*').single();
    setPending(p as Customer[] || []);
    setActive(a as Customer[] || []);
    setServing(s?.current_serving || 0);
    setOnBreak(s?.on_break || false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchInitialData();
    const sub = supabase.channel('butcher_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'customers' }, () => fetchInitialData())
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'queue_state' }, (payload) => {
        setServing(payload.new.current_serving);
        setOnBreak(payload.new.on_break);
      })
      .subscribe();
    return () => { supabase.removeChannel(sub); };
  }, [fetchInitialData]);

  async function toggleBreak() {
    const nextState = !onBreak;
    await supabase.from('queue_state').update({ on_break: nextState }).eq('id', 1);
    setOnBreak(nextState);
  }

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

  if (!isAuthenticated) {
    return (
      <div className="bg-noise relative min-h-screen flex items-center justify-center p-4">
        <div className="orb orb-red" />
        <div className="glass-card rounded-3xl p-8 w-full max-w-md animate-scale-in relative z-10">
          <h1 className="text-2xl font-black text-white text-center mb-6 uppercase tracking-tighter">Butcher Control</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter Password"
              className="input-premium text-center text-lg"
              autoFocus
            />
            <button type="submit" className="btn-primary py-4">
              Unlock Terminal
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-noise relative min-h-screen overflow-hidden text-stone-200" dir={t.dir}>
      <div className="orb orb-red" />
      <div className="orb orb-blue" />

      <div className="relative z-10 p-4 md:p-8 max-w-6xl mx-auto min-h-screen flex flex-col gap-8 animate-scale-in">
        <div className="flex flex-col md:flex-row justify-between items-center w-full gap-6 z-20">
          <div className="flex items-center">
            <LanguageSwitcher current={lang} onChange={setLang} />
          </div>
          
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 w-full md:w-auto">
            <button 
              onClick={() => setShowQR(true)}
              className="bg-white/5 hover:bg-white/10 active:scale-95 text-stone-200 px-6 py-2.5 rounded-xl border border-white/10 flex items-center gap-2.5 transition-all font-bold shadow-lg backdrop-blur-sm"
            >
              <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
              QR CODE
            </button>
            <button 
              onClick={toggleBreak}
              className={`px-6 py-2.5 rounded-xl border flex items-center gap-2.5 transition-all font-bold shadow-lg backdrop-blur-sm active:scale-95 ${
                onBreak 
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-500' 
                : 'bg-white/5 border-white/10 text-stone-200 hover:bg-white/10'
              }`}
            >
              <svg className={`w-5 h-5 ${onBreak ? 'animate-pulse' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {t.lunch_break}
            </button>
            <button 
              onClick={restartQueue} 
              className="group truncate flex items-center gap-2 px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-xl border border-red-500/20 transition-all font-bold active:scale-95 shadow-xl backdrop-blur-md"
            >
              <svg className="w-4 h-4 transition-transform group-hover:rotate-180 duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {t.ctrl_restart}
            </button>
          </div>
        </div>

        {/* QR Code Modal */}
        {showQR && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in" onClick={() => setShowQR(false)}>
            <div className="glass-card rounded-[2.5rem] p-10 flex flex-col items-center gap-6 max-w-sm w-full animate-scale-in" onClick={e => e.stopPropagation()}>
              <div className="bg-white p-6 rounded-3xl">
                <QRCodeSVG value={origin} size={250} level="H" includeMargin={true} />
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">Scan to Join</h3>
                <p className="text-stone-400 text-sm italic">{origin}</p>
              </div>
              <button 
                onClick={() => setShowQR(false)}
                className="btn-primary py-4 px-8 mt-4"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Header / Serving Badge */}
        <div className="glass-card rounded-[2.5rem] p-10 flex flex-col lg:flex-row justify-between items-center gap-10 shadow-2xl relative overflow-hidden">
          {/* Decorative Shine */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
          
          <div className="text-center lg:text-left relative">
            <h1 className="text-xs font-black uppercase tracking-[0.3em] text-red-500/80 mb-3">{t.ctrl_serving}</h1>
            <div className="flex items-baseline justify-center lg:justify-start gap-2">
              <span className="text-4xl font-bold text-red-500/40">#</span>
              <p className="animate-count-pulse font-mono text-8xl md:text-9xl font-black text-red-500 tracking-tighter shadow-red-500/20 drop-shadow-2xl">
                {serving}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-5 w-full lg:w-auto relative z-10">
            <button 
              onClick={previousCustomer} 
              disabled={serving <= 0}
              className="group flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed border border-white/10 text-stone-300 w-full lg:w-auto text-lg font-bold py-6 px-8 rounded-3xl shadow-xl transition-all active:scale-95"
            >
              <svg className="w-6 h-6 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              {t.ctrl_prev}
            </button>
            
            <button 
              onClick={nextCustomer} 
              className="group flex items-center justify-center gap-4 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white w-full lg:min-w-[300px] text-2xl font-black py-7 px-12 rounded-3xl shadow-[0_20px_50px_rgba(239,68,68,0.3)] transition-all active:scale-95 hover:scale-[1.02]"
            >
              {t.ctrl_next}
              <svg className="w-8 h-8 transition-transform group-hover:translate-x-2 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
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
                      <p className="font-bold text-white text-xl">{c.name}</p>
                      <p className="font-mono text-lg font-black text-amber-500 tracking-tight mt-0.5">{c.phone}</p>
                      <p className="text-xs uppercase tracking-wider text-stone-500 mt-3">Code: <span className="font-mono text-red-400 font-bold tracking-widest">{c.code}</span></p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2.5 w-full sm:w-auto">
                      <button 
                        onClick={() => removeCustomer(c.id)} 
                        className="bg-red-500/5 hover:bg-red-500/15 text-red-500/70 hover:text-red-500 font-bold w-full sm:w-auto py-3.5 px-5 text-xs uppercase tracking-widest rounded-xl transition-all border border-red-500/10 hover:border-red-500/30 active:scale-95"
                      >
                        {t.ctrl_remove}
                      </button>
                      <button 
                        onClick={() => approve(c)} 
                        className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-black w-full sm:w-auto py-3.5 px-8 text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-green-900/20 active:scale-95 border border-white/10"
                      >
                        {t.ctrl_approve}
                      </button>
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
                  const isNext = c.ticket_number === serving + 1;
                  
                  return (
                    <div key={c.id} className={`p-5 rounded-2xl border flex items-center justify-between transition-all ${isServing ? 'bg-red-500/10 border-red-500/30' : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04]'}`}>
                      <div className="flex items-center gap-6">
                        <span className={`font-mono text-2xl font-black ${isServing ? 'text-red-400' : 'text-blue-400'}`}>#{c.ticket_number}</span>
                        <div className="flex flex-col">
                          <span className={`font-bold text-xl ${isServing ? 'text-white' : 'text-stone-300'}`}>{c.name}</span>
                          <span className="font-mono text-lg font-black text-amber-500 tracking-tight mt-0.5">{c.phone}</span>
                          
                          {isNext && (
                            <div className="mt-3">
                              <a 
                                href={`sms:${c.phone}${/iPad|iPhone|iPod/.test(navigator.userAgent) ? '&' : '?'}body=${encodeURIComponent(t.remind_sms_body)}`}
                                className="group inline-flex items-center gap-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 text-[9px] font-black uppercase tracking-[0.15em] px-4 py-2.5 rounded-xl border border-amber-500/20 transition-all active:scale-95 shadow-lg shadow-amber-900/10"
                              >
                                <svg className="w-3.5 h-3.5 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                </svg>
                                {t.remind_sms}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2.5">
                        <div className="flex items-center gap-2">
                          {isServing && <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500 bg-red-500/10 px-4 py-1.5 rounded-full border border-red-500/20">{t.ctrl_serving_badge}</span>}
                          
                          <button 
                            onClick={() => removeCustomer(c.id)} 
                            className="text-stone-600 hover:text-red-500 transition-all p-1.5 hover:bg-red-500/5 rounded-lg active:scale-90" 
                            title={t.ctrl_remove}
                          >
                            <svg className="w-5 h-5 font-bold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
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
