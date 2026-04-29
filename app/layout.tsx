import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Anti9to5Club Alerts",
  description: "AI-confirmed trading signal scanner with TradingView webhooks and Telegram alerts."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
