import { AppNav } from "@/components/AppNav";
import { TradingViewSetup } from "@/components/TradingViewSetup";

export default function TradingViewPage() {
  return (
    <>
      <AppNav />
      <main className="shell py-10">
        <TradingViewSetup />
      </main>
    </>
  );
}
