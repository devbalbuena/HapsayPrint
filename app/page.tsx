import { SubmitForm } from "@/components/SubmitForm";
import { PrinterIcon } from "lucide-react";

export default function HomePage() {
  return (
    <main className="flex-1 flex flex-col items-center justify-start px-4 pt-8 pb-16">
      {/* Header / Brand */}
      <div className="w-full max-w-md mb-8 text-center">
        <div className="inline-flex items-center justify-center gap-2.5 mb-3">
          <div className="p-2.5 rounded-xl bg-primary text-primary-foreground shadow-md">
            <PrinterIcon className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">HapsayPrint</h1>
        </div>
        <p className="text-muted-foreground text-sm">
          Your neighbourhood printing shop — now online.
        </p>
      </div>

      {/* Form */}
      <div className="w-full max-w-md">
        <SubmitForm />
      </div>

      {/* Footer */}
      <footer className="mt-10 text-xs text-muted-foreground text-center space-y-1">
        <p>HapsayPrint © {new Date().getFullYear()}</p>
        <p>Questions? Message us on Facebook.</p>
      </footer>
    </main>
  );
}
