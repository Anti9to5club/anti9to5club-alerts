import type { SignalConfirmation, TradingViewWebhook, UserSettings } from "@/lib/types";

const fallback: SignalConfirmation = {
  signal_direction: "neutral",
  confidence: 0,
  entry_zone: "No valid entry zone confirmed",
  stop_loss: "No stop loss confirmed",
  targets: [],
  reasoning: "The confirmation service did not return a valid actionable signal.",
  should_send: false
};

function normalizeConfirmation(value: unknown): SignalConfirmation {
  if (!value || typeof value !== "object") return fallback;

  const data = value as Partial<SignalConfirmation>;
  const direction = data.signal_direction;

  return {
    signal_direction: direction === "long" || direction === "short" ? direction : "neutral",
    confidence: Math.max(0, Math.min(100, Number(data.confidence ?? 0))),
    entry_zone: String(data.entry_zone ?? fallback.entry_zone),
    stop_loss: String(data.stop_loss ?? fallback.stop_loss),
    targets: Array.isArray(data.targets) ? data.targets.map(String).slice(0, 4) : [],
    reasoning: String(data.reasoning ?? fallback.reasoning),
    should_send: Boolean(data.should_send)
  };
}

export async function confirmSignalWithOpenAI(
  payload: TradingViewWebhook,
  settings: UserSettings
): Promise<SignalConfirmation> {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL ?? "gpt-4.1-mini";

  if (!apiKey) {
    return {
      ...fallback,
      reasoning: "OPENAI_API_KEY is not configured, so the signal was saved but not sent."
    };
  }

const controller = new AbortController();

setTimeout(() => controller.abort(), 10000);

const response = await fetch("https://api.openai.com/v1/responses", {
  signal: controller.signal,
  method: "POST",
  headers: {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: "system",
          content:
            "You confirm trade-signal quality for a scanner. You never place trades, never give financial advice, and only return strict JSON."
        },
        {
          role: "user",
          content: JSON.stringify({
            instruction:
              `Confirm whether this TradingView alert matches the user's configured market, session, timeframe, and setup. Return JSON only with signal_direction, confidence, entry_zone, stop_loss, targets, reasoning, should_send. should_send must be false if confidence is below ${settings.min_confidence_threshold ?? 70} or risk controls are unclear.`,
            user_settings: settings,
            tradingview_alert: payload
          })
        }
      ],
      text: {
        format: {
          type: "json_schema",
          name: "signal_confirmation",
          schema: {
            type: "object",
            additionalProperties: false,
            required: [
              "signal_direction",
              "confidence",
              "entry_zone",
              "stop_loss",
              "targets",
              "reasoning",
              "should_send"
            ],
            properties: {
              signal_direction: { type: "string", enum: ["long", "short", "neutral"] },
              confidence: { type: "number", minimum: 0, maximum: 100 },
              entry_zone: { type: "string" },
              stop_loss: { type: "string" },
              targets: { type: "array", items: { type: "string" } },
              reasoning: { type: "string" },
              should_send: { type: "boolean" }
            }
          }
        }
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    return {
      ...fallback,
      reasoning: `OpenAI confirmation failed: ${errorText.slice(0, 240)}`
    };
  }

  const result = await response.json();
  const text = result.output_text ?? result.output?.[0]?.content?.[0]?.text;

  try {
    return normalizeConfirmation(JSON.parse(text));
  } catch {
    return normalizeConfirmation(result);
  }
}
