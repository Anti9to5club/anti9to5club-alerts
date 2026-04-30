import type { SignalConfirmation, TradingViewWebhook, UserSettings } from "@/lib/types";

const fallback: SignalConfirmation = {
  signal_direction: "neutral",
  confidence: 0,
  entry_zone: "No valid entry zone confirmed",
  stop_loss: "No stop loss confirmed",
  targets: [],
  reasoning: "The confirmation service did not return a valid actionable signal.",
  should_send: false,
  raw_openai_response: null,
  openai_parse_error: null
};

const requiredFields = [
  "signal_direction",
  "confidence",
  "entry_zone",
  "stop_loss",
  "targets",
  "reasoning",
  "should_send"
] as const;

function buildFailure(reasoning: string, rawResponse: unknown, parseError: unknown): SignalConfirmation {
  const errorMessage = parseError instanceof Error ? parseError.message : String(parseError);
  console.error("[OpenAI confirmation] Parse/request failure", {
    error: errorMessage,
    rawResponse
  });

  return {
    ...fallback,
    reasoning,
    should_send: false,
    raw_openai_response: rawResponse,
    openai_parse_error: errorMessage
  };
}

function stripMarkdownCodeBlocks(value: string) {
  return value
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

function extractJsonObject(value: string) {
  const stripped = stripMarkdownCodeBlocks(value);
  const firstBrace = stripped.indexOf("{");

  if (firstBrace === -1) {
    throw new Error("No JSON object opening brace found in OpenAI response.");
  }

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = firstBrace; index < stripped.length; index += 1) {
    const char = stripped[index];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (char === "\\") {
      escaped = true;
      continue;
    }

    if (char === "\"") {
      inString = !inString;
      continue;
    }

    if (inString) continue;

    if (char === "{") depth += 1;
    if (char === "}") depth -= 1;

    if (depth === 0) {
      return stripped.slice(firstBrace, index + 1);
    }
  }

  throw new Error("No complete JSON object found in OpenAI response.");
}

function readOpenAIText(result: any) {
  if (typeof result?.output_text === "string") return result.output_text;

  const output = Array.isArray(result?.output) ? result.output : [];
  const textParts: string[] = [];

  for (const item of output) {
    const content = Array.isArray(item?.content) ? item.content : [];
    for (const part of content) {
      if (typeof part?.text === "string") textParts.push(part.text);
      if (typeof part?.content === "string") textParts.push(part.content);
    }
  }

  return textParts.join("\n").trim();
}

function validateRequiredFields(value: unknown): asserts value is Partial<SignalConfirmation> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Parsed OpenAI response is not a JSON object.");
  }

  const data = value as Record<string, unknown>;
  const missing = requiredFields.filter((field) => !(field in data));

  if (missing.length) {
    throw new Error(`Parsed OpenAI response is missing required field(s): ${missing.join(", ")}.`);
  }

  if (!["long", "short", "neutral"].includes(String(data.signal_direction))) {
    throw new Error("Parsed OpenAI response has invalid signal_direction.");
  }

  if (!Number.isFinite(Number(data.confidence))) {
    throw new Error("Parsed OpenAI response has invalid confidence.");
  }

  if (!Array.isArray(data.targets)) {
    throw new Error("Parsed OpenAI response has invalid targets.");
  }

  if (typeof data.should_send !== "boolean") {
    throw new Error("Parsed OpenAI response has invalid should_send.");
  }
}

function normalizeConfirmation(value: unknown): SignalConfirmation {
  validateRequiredFields(value);

  const data = value as Partial<SignalConfirmation>;
  const direction = data.signal_direction;

  return {
    signal_direction: direction === "long" || direction === "short" ? direction : "neutral",
    confidence: Math.max(0, Math.min(100, Number(data.confidence ?? 0))),
    entry_zone: String(data.entry_zone ?? fallback.entry_zone),
    stop_loss: String(data.stop_loss ?? fallback.stop_loss),
    targets: Array.isArray(data.targets) ? data.targets.map(String).slice(0, 4) : [],
    reasoning: String(data.reasoning ?? fallback.reasoning),
    should_send: Boolean(data.should_send),
    raw_openai_response: null,
    openai_parse_error: null
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
      reasoning: "OPENAI_API_KEY is not configured, so the signal was saved but not sent.",
      openai_parse_error: "OPENAI_API_KEY is not configured."
    };
  }

  const controller = new AbortController();

  setTimeout(() => controller.abort(), 10000);

  let result: unknown = null;

  try {
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
              required: [...requiredFields],
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

    const responseText = await response.text();

    try {
      result = JSON.parse(responseText);
    } catch {
      result = responseText;
    }

    if (!response.ok) {
      return buildFailure(
        `OpenAI confirmation failed: ${responseText.slice(0, 240)}`,
        result,
        `OpenAI API returned HTTP ${response.status}.`
      );
    }
  } catch (error) {
    return buildFailure("OpenAI confirmation request failed before a response was parsed.", result, error);
  }

  try {
    const text = readOpenAIText(result);
    const parseCandidate = text || (typeof result === "string" ? result : JSON.stringify(result));
    const jsonObject = extractJsonObject(parseCandidate);
    const parsed = JSON.parse(jsonObject);
    const normalized = normalizeConfirmation(parsed);

    return {
      ...normalized,
      raw_openai_response: result,
      openai_parse_error: null
    };
  } catch (error) {
    return buildFailure("OpenAI confirmation failed to parse into the required signal schema.", result, error);
  }
}
