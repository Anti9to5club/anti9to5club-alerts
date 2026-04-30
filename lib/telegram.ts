import type { SignalConfirmation, TradingViewWebhook, UserSettings } from "@/lib/types";

const disclaimer =
  "Risk disclaimer: Anti9to5Club Alerts is an informational scanner, not financial advice. It does not place trades.";

export function formatTelegramSignal(
  alert: TradingViewWebhook,
  settings: UserSettings,
  confirmation: SignalConfirmation
) {
  return [
    "Anti9to5Club Alerts confirmed signal",
    "",
    `Symbol: ${alert.symbol}`,
    `Market: ${settings.market}`,
    `Session: ${settings.session}`,
    `Timeframe: ${alert.timeframe}`,
    `Direction: ${confirmation.signal_direction.toUpperCase()}`,
    `Confidence: ${confirmation.confidence}%`,
    `Entry zone: ${confirmation.entry_zone}`,
    `Stop loss: ${confirmation.stop_loss}`,
    `Targets: ${confirmation.targets.length ? confirmation.targets.join(", ") : "None confirmed"}`,
    "",
    `Reasoning: ${confirmation.reasoning}`,
    "",
    disclaimer
  ].join("\n");
}

export async function sendTelegramMessage(chatId: string, text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token) {
    throw new Error("TELEGRAM_BOT_TOKEN is not configured.");
  }

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      disable_web_page_preview: true
    })
  });

  const responseText = await response.text();
  let responseBody: unknown = responseText;

  try {
    responseBody = JSON.parse(responseText);
  } catch {
    responseBody = { raw: responseText };
  }

  if (!response.ok) {
    const error = new Error(`Telegram send failed: ${responseText.slice(0, 240)}`);
    Object.assign(error, { telegramResponse: responseBody });
    throw error;
  }

  return responseBody;
}
