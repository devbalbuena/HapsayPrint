import { Metadata } from "next";
import { getPricingConfig } from "@/lib/pricing";
import { PricingSettingsForm } from "@/components/PricingSettingsForm";
import { getStoreSettings } from "@/lib/settings";
import { StoreStatusForm } from "@/components/StoreStatusForm";

export const metadata: Metadata = {
  title: "Settings | Admin | HapsayPrint",
  description: "Configure system settings and pricing.",
};

export const revalidate = 0; // Don't cache settings page so prices are always fresh for admin

export default async function SettingsPage() {
  const [config, storeSettings] = await Promise.all([
    getPricingConfig(),
    getStoreSettings(),
  ]);

  return (
    <main className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mb-1">
          System Settings
        </h1>
        <p className="text-zinc-500 text-sm">
          Manage pricing rules and global configuration for HapsayPrint.
        </p>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 md:p-8 shadow-sm">
        <StoreStatusForm settings={storeSettings} />
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 md:p-8 shadow-sm">
        <PricingSettingsForm config={config} />
      </div>
    </main>
  );
}
