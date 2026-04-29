import { NextResponse } from "next/server";
import { z } from "zod";
import { confirmSignalWithOpenAI } from "@/lib/ai/confirmSignal";
import { createServiceSupabase } from "@/lib/supabase/server";
import { formatTelegramSignal, sendTelegramMessage } from "@/lib/telegram";

const webhookSchema = z.object({
  webhook_secret: z.string().min(12),
  symbol: z.string().min(1),
  timeframe: z.string().min(1),
  price: z.union([z.number(), z.string()]).optional(),
  market: z.string().optional(),
  session: z.string().optional(),
  setup_type: z.string().optional(),
  direction: z.string().optional(),
  notes: z.string().optional()
}).passthrough();

export async function POST(request: Request) {
  const parsed = webhookSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid TradingView webhook payload." }, { status: 400 });
  }

  const payload = parsed.data;
  const supabase = createServiceSupabase();

  const { data: settings, error: settingsError } = await supabase
    .from("user_settings")
    .select("*")
    .eq("webhook_secret", payload.webhook_secret)
    .single();

  if (settingsError || !settings) {
    return NextResponse.json({ error: "Webhook secret was not recognized." }, { status: 401 });
  }

  const confirmation = await confirmSignalWithOpenAI(payload, settings);
  let telegramStatus = "not_sent";
  let telegramError: string | null = null;

  if (confirmation.should_send && settings.telegram_chat_id) {
    try {
      await sendTelegramMessage(
        settings.telegram_chat_id,
        formatTelegramSignal(payload, settings, confirmation)
      );
      telegramStatus = "sent";
    } catch (error) {
      telegramStatus = "failed";
      telegramError = error instanceof Error ? error.message : "Telegram send failed.";
    }
  }

  const { error: insertError } = await supabase.from("signals").insert({
    user_id: settings.user_id,
    settings_id: settings.id,
    webhook_payload: payload,
    signal_direction: confirmation.signal_direction,
    confidence: confirmation.confidence,
    entry_zone: confirmation.entry_zone,
    stop_loss: confirmation.stop_loss,
    targets: confirmation.targets,
    reasoning: confirmation.reasoning,
    should_send: confirmation.should_send,
    telegram_status: telegramStatus,
    telegram_error: telegramError
  });

  if (insertError) {
    return NextResponse.json(
      { ...confirmation, persistence_error: insertError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ...confirmation,
    telegram_status: telegramStatus,
    telegram_error: telegramError
  });
}
