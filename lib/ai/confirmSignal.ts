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

function hasUsableRiskPlan(confirmation: SignalConfirmation) {
  const entry = confirmation.entry_zone.trim().toLowerCase();
  const stop = confirmation.stop_loss.trim().toLowerCase();

  return (
    entry.length > 0 &&
    stop.length > 0 &&
    !entry.includes("no valid") &&
    !stop.includes("no stop") &&
    confirmation.targets.length > 0
  );
}

function hasExplicitAllowedRejectionReason(reasoning: string) {
  const normalizedReasoning = reasoning.toLowerCase();
  const rejectionSignals = [
    "structurally invalid",
    "invalid structure",
    "structure is invalid",
    "no valid structure",
    "confidence is below",
    "below threshold",
    "market context is clearly against",
    "market context clearly against",
    "clearly against the trade",
    "trend is clearly against",
    "trend clearly against"
  ];

  return rejectionSignals.some((signal) => normalizedReasoning.includes(signal));
}

function applyDecisionPolicy(
  confirmation: SignalConfirmation,
  settings: UserSettings
): SignalConfirmation {
  const threshold = settings.min_confidence_threshold ?? 70;
  const directionalSignal =
    confirmation.signal_direction === "long" || confirmation.signal_direction === "short";
  const structurallyComplete = directionalSignal && hasUsableRiskPlan(confirmation);

  if (confirmation.confidence < threshold) {
    return {
      ...confirmation,
      should_send: false,
      reasoning: `Rejected because confidence ${confirmation.confidence}% is below the configured ${threshold}% threshold. ${confirmation.reasoning}`
    };
  }

  if (
    !confirmation.should_send &&
    confirmation.confidence >= threshold &&
    structurallyComplete &&
    !hasExplicitAllowedRejectionReason(confirmation.reasoning)
  ) {
    return {
      ...confirmation,
      should_send: true,
      reasoning: `Approved because confidence is at or above ${threshold}% and the setup has valid structure with entry, stop, and targets. ${confirmation.reasoning}`
    };
  }

  return confirmation;
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
              "You confirm trade-signal quality for an informational scanner. You never place trades, never give financial advice, and only return strict JSON. Be selective but not overly conservative: valid liquidity sweep reclaim setups with displacement are high-probability structures when risk levels are defined."
          },
          {
            role: "user",
            content: JSON.stringify({
              instruction:
                [
                  "Confirm whether this TradingView alert should be delivered as an informational signal.",
                  "Return JSON only with signal_direction, confidence, entry_zone, stop_loss, targets, reasoning, should_send.",
                  `Reject only when: the setup is structurally invalid, confidence is below ${settings.min_confidence_threshold ?? 70}, or market context is clearly against the trade.`,
                  "Do not reject solely because setup_type is liquidity_sweep_fvg.",
                  "Treat liquidity sweep plus reclaim plus displacement as a valid high-probability structure when entry, stop, and target areas are reasonable.",
                  "Increase confidence weighting for liquidity reclaim, displacement candle, session timing, and trend alignment.",
                  `If confidence is ${settings.min_confidence_threshold ?? 70} or higher and structure is valid, should_send must be true.`,
                  "If should_send is false, reasoning must state the exact rejection reason: structurally invalid, confidence below threshold, or market context clearly against the trade."
                ].join(" "),
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
    const normalized = applyDecisionPolicy(normalizeConfirmation(parsed), settings);

    return {
      ...normalized,
      raw_openai_response: result,
      openai_parse_error: null
    };
  } catch (error) {
    return buildFailure("OpenAI confirmation failed to parse into the required signal schema.", result, error);
  }
}
