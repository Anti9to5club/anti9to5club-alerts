"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { markets, sessions, setupTypes, timeframes } from "@/lib/forms";
import { createBrowserSupabase } from "@/lib/supabase/client";

type SettingsState = {
  id?: string;
  webhook_secret: string;
  market: string;
  session: string;
  timeframes: string[];
  setup_type: string;
  telegram_chat_id: string;
  min_confidence_threshold: number;
};

const defaults: SettingsState = {
  webhook_secret: "",
  market: "Forex",
  session: "NY",
  timeframes: ["15m"],
  setup_type: "Liquidity sweep",
  telegram_chat_id: "",
  min_confidence_threshold: 70
};

function createSecret() {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function SettingsForm() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [settings, setSettings] = useState<SettingsState>(defaults);
  const [message, setMessage] = useState("");
  const supabase = useMemo(() => createBrowserSupabase(), []);

  useEffect(() => {
    async function load() {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;

      if (!user) {
        router.push("/login");
        return;
      }

      setUserId(user.id);
      const { data } = await supabase.from("user_settings").select("*").eq("user_id", user.id).maybeSingle();

      if (data) {
        setSettings({
          id: data.id,
          webhook_secret: data.webhook_secret,
          market: data.market,
          session: data.session,
          timeframes: data.timeframes ?? ["15m"],
          setup_type: data.setup_type,
          telegram_chat_id: data.telegram_chat_id ?? "",
          min_confidence_threshold: data.min_confidence_threshold ?? 70
        });
      } else {
        setSettings({ ...defaults, webhook_secret: createSecret() });
      }
    }

    load();
  }, [router, supabase]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!userId) return;

    const payload = {
      user_id: userId,
      webhook_secret: settings.webhook_secret || createSecret(),
      market: settings.market,
      session: settings.session,
      timeframes: settings.timeframes,
      setup_type: settings.setup_type,
      telegram_chat_id: settings.telegram_chat_id || null,
      min_confidence_threshold: settings.min_confidence_threshold
    };

    const response = settings.id
      ? await supabase.from("user_settings").update(payload).eq("id", settings.id).select().single()
      : await supabase.from("user_settings").insert(payload).select().single();

    if (response.error) {
      setMessage(response.error.message);
      return;
    }

    setSettings((current) => ({ ...current, id: response.data.id, webhook_secret: response.data.webhook_secret }));
    setMessage("Settings saved.");
  }

  function toggleTimeframe(value: string) {
    setSettings((current) => ({
      ...current,
      timeframes: current.timeframes.includes(value)
        ? current.timeframes.filter((item) => item !== value)
        : [...current.timeframes, value]
    }));
  }

  return (
    <form className="panel grid gap-6 p-6" onSubmit={submit}>
      <div>
        <h1 className="text-3xl font-black tracking-tight">Alert settings</h1>
        <p className="muted mt-2">Configure how Anti9to5Club Alerts filters and confirms TradingView signals.</p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <label className="label">
          Market
          <select className="input" value={settings.market} onChange={(e) => setSettings({ ...settings, market: e.target.value })}>
            {markets.map((market) => (
              <option key={market}>{market}</option>
            ))}
          </select>
        </label>

        <label className="label">
          Session
          <select className="input" value={settings.session} onChange={(e) => setSettings({ ...settings, session: e.target.value })}>
            {sessions.map((session) => (
              <option key={session}>{session}</option>
            ))}
          </select>
        </label>
      </div>

      <fieldset className="grid gap-3">
        <legend className="text-sm font-bold text-slate-700">Timeframe</legend>
        <div className="flex flex-wrap gap-2">
          {timeframes.map((timeframe) => (
            <label key={timeframe} className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold">
              <input
                type="checkbox"
                checked={settings.timeframes.includes(timeframe)}
                onChange={() => toggleTimeframe(timeframe)}
              />
              {timeframe}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-5 md:grid-cols-2">
        <label className="label">
          Setup type
          <select className="input" value={settings.setup_type} onChange={(e) => setSettings({ ...settings, setup_type: e.target.value })}>
            {setupTypes.map((setupType) => (
              <option key={setupType}>{setupType}</option>
            ))}
          </select>
        </label>

        <label className="label">
          Minimum confidence threshold
          <input
            className="input"
            max={100}
            min={0}
            type="number"
            value={settings.min_confidence_threshold}
            onChange={(e) =>
              setSettings({
                ...settings,
                min_confidence_threshold: Math.max(0, Math.min(100, Number(e.target.value)))
              })
            }
          />
        </label>
      </div>

      <label className="label">
        Telegram chat ID
        <input
          className="input"
          placeholder="123456789"
          value={settings.telegram_chat_id}
          onChange={(e) => setSettings({ ...settings, telegram_chat_id: e.target.value })}
        />
      </label>

      <label className="label">
        Webhook secret
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            className="input font-mono text-sm"
            value={settings.webhook_secret}
            onChange={(e) => setSettings({ ...settings, webhook_secret: e.target.value })}
            required
          />
          <button className="btn btn-secondary" type="button" onClick={() => setSettings({ ...settings, webhook_secret: createSecret() })}>
            Rotate
          </button>
        </div>
      </label>

      {message ? <p className="rounded-md bg-slate-100 p-3 text-sm font-semibold text-slate-700">{message}</p> : null}

      <button className="btn btn-primary" type="submit">
        Save settings
      </button>
    </form>
  );
}
