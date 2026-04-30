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
  let telegramResponse: unknown = null;

  if (confirmation.should_send) {
    if (!settings.telegram_chat_id) {
      telegramStatus = "failed";
      telegramError = "Signal was marked should_send=true, but telegram_chat_id is not configured.";
      console.error("[TradingView webhook] Telegram send blocked", {
        user_id: settings.user_id,
        reason: telegramError
      });
    } else {
    try {
        const message = formatTelegramSignal(payload, settings, confirmation);
        console.log("[TradingView webhook] Sending Telegram signal", {
          user_id: settings.user_id,
          symbol: payload.symbol,
          chat_id: settings.telegram_chat_id
        });

        telegramResponse = await sendTelegramMessage(settings.telegram_chat_id, message);
      telegramStatus = "sent";
        console.log("[TradingView webhook] Telegram signal sent", {
          user_id: settings.user_id,
          symbol: payload.symbol,
          response: telegramResponse
        });
    } catch (error) {
      telegramStatus = "failed";
      telegramError = error instanceof Error ? error.message : "Telegram send failed.";
        telegramResponse =
          error instanceof Error && "telegramResponse" in error
            ? (error as Error & { telegramResponse?: unknown }).telegramResponse ?? null
            : null;
        console.error("[TradingView webhook] Telegram signal failed", {
          user_id: settings.user_id,
          symbol: payload.symbol,
          error: telegramError,
          response: telegramResponse
        });
      }
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
    telegram_error: telegramError,
    telegram_response: telegramResponse,
    raw_openai_response: confirmation.raw_openai_response ?? null,
    openai_parse_error: confirmation.openai_parse_error ?? null
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
    telegram_error: telegramError,
    telegram_response: telegramResponse
  });
}
