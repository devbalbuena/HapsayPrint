import { SubmitForm } from "@/components/SubmitForm";
import { PrinterIcon, CheckCircle2Icon } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen w-full flex flex-col lg:flex-row bg-background">
      
      {/* LEFT SIDE: Branding & Value Proposition */}
      <div className="relative flex flex-col justify-between w-full lg:w-[45%] xl:w-[40%] bg-zinc-950 text-zinc-50 p-8 lg:p-12 xl:p-16 overflow-hidden">
        
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-950/50 to-zinc-950 pointer-events-none" />

        <div className="relative z-10 flex-1 flex flex-col">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-16 lg:mb-32">
            <div className="p-2.5 rounded-xl bg-zinc-800 border border-zinc-700/50 shadow-sm">
              <PrinterIcon className="w-6 h-6 text-zinc-100" />
            </div>
            <span className="text-xl font-bold tracking-tight">HapsayPrint</span>
          </div>

          {/* Hero Copy */}
          <div className="space-y-6 max-w-md">
            <h1 className="text-4xl lg:text-5xl font-semibold tracking-tight leading-[1.1]">
              Professional printing, <br />
              <span className="text-zinc-400">delivered simply.</span>
            </h1>
            <p className="text-lg text-zinc-400 leading-relaxed">
              Submit your documents online. We handle the printing with high-end equipment and notify you the moment it's ready for pickup.
            </p>

            <ul className="space-y-4 pt-8">
              {[
                "No account creation required",
                "High-quality commercial printers",
                "Fast turnaround times",
                "Secure file handling"
              ].map((benefit, i) => (
                <li key={i} className="flex items-center gap-3 text-zinc-300">
                  <CheckCircle2Icon className="w-5 h-5 text-emerald-500" />
                  <span className="font-medium">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer Area */}
        <div className="relative z-10 mt-16 pt-8 border-t border-zinc-800/50 flex items-center justify-between text-sm text-zinc-500 font-medium">
          <p>© {new Date().getFullYear()} HapsayPrint</p>
          <Link href="/admin" className="hover:text-zinc-300 transition-colors">
            Staff Portal
          </Link>
        </div>
      </div>

      {/* RIGHT SIDE: The Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 xl:p-20 bg-zinc-50/50 dark:bg-background">
        <div className="w-full max-w-xl mx-auto">
          <SubmitForm />
        </div>
      </div>
      
    </main>
  );
}
