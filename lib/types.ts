export type SessionName = "NY" | "London" | "Asia";

export type SignalConfirmation = {
  signal_direction: "long" | "short" | "neutral";
  confidence: number;
  entry_zone: string;
  stop_loss: string;
  targets: string[];
  reasoning: string;
  should_send: boolean;
  raw_openai_response?: unknown;
  openai_parse_error?: string | null;
};

export type TradingViewWebhook = {
  webhook_secret: string;
  symbol: string;
  timeframe: string;
  price?: number | string;
  market?: string;
  session?: SessionName | string;
  setup_type?: string;
  direction?: string;
  notes?: string;
  [key: string]: unknown;
};

export type UserSettings = {
  id: string;
  user_id: string;
  webhook_secret: string;
  market: string;
  session: SessionName;
  timeframes: string[];
  setup_type: string;
  telegram_chat_id: string | null;
  min_confidence_threshold: number;
};
