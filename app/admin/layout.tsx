import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/SignOutButton";
import { PrinterIcon } from "lucide-react";
import Link from "next/link";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) {
    redirect("/login?callbackUrl=/admin");
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Unified Top Nav */}
      <header className="bg-zinc-950 text-zinc-50 border-b border-zinc-800 sticky top-0 z-20 shadow-sm">
        <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-lg bg-zinc-800/80 border border-zinc-700/50">
                <PrinterIcon className="w-5 h-5 text-zinc-300" />
              </div>
              <span className="font-bold text-lg tracking-tight">HapsayPrint</span>
            </div>
            
            <div className="hidden sm:flex items-center gap-4 text-sm font-medium">
              <span className="text-zinc-600">/</span>
              <Link href="/admin" className="text-zinc-400 hover:text-zinc-100 transition-colors">
                Dashboard
              </Link>
              <Link href="/admin/qr" className="text-zinc-400 hover:text-zinc-100 transition-colors">
                QR Code
              </Link>
              <Link href="/admin/settings" className="text-zinc-400 hover:text-zinc-100 transition-colors">
                Settings
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="text-sm font-medium text-zinc-400 hover:text-zinc-50 transition-colors"
            >
              Public Form ↗
            </Link>
            <div className="h-4 w-px bg-zinc-800 hidden sm:block" />
            <SignOutButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      {children}
    </div>
  );
}
