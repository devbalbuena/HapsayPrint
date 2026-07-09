"use client";

import { QRCodeCanvas } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { DownloadIcon, PrinterIcon, InfoIcon } from "lucide-react";
import { useRef, useEffect, useState } from "react";

export default function QRCodePage() {
  const qrRef = useRef<HTMLDivElement>(null);
  const [appUrl, setAppUrl] = useState<string>("");

  useEffect(() => {
    // Only access env variable on client to prevent hydration mismatch if it differs
    const url = process.env.NEXT_PUBLIC_APP_URL || "";
    setAppUrl(url);
  }, []);

  const downloadQR = () => {
    if (!qrRef.current) return;
    const canvas = qrRef.current.querySelector("canvas");
    if (!canvas) return;

    const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    let downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = "hapsayprint-qr.png";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const targetUrl = appUrl ? `${appUrl.replace(/\/$/, '')}/` : "";

  return (
    <main className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-2xl mx-auto space-y-8">
        
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Shop QR Code</h1>
          <p className="text-zinc-500 mt-2">Print this QR code and place it on your counter so customers can easily access the print job submission form.</p>
        </div>

        {!appUrl ? (
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 p-6 rounded-2xl flex items-start gap-4">
            <InfoIcon className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0" />
            <div>
              <h3 className="font-semibold text-amber-900 dark:text-amber-100">Action Required: Environment Variable Missing</h3>
              <p className="text-sm text-amber-700 dark:text-amber-200/70 mt-1 mb-3">
                You need to configure the <code className="bg-amber-100 dark:bg-amber-900 px-1 py-0.5 rounded">NEXT_PUBLIC_APP_URL</code> environment variable for the QR code to point to your live site.
              </p>
              <ul className="text-sm text-amber-700 dark:text-amber-200/70 list-disc list-inside space-y-1">
                <li>Locally: Add <code className="bg-amber-100 dark:bg-amber-900 px-1 py-0.5 rounded">NEXT_PUBLIC_APP_URL="http://localhost:3000"</code> to your <code className="bg-amber-100 dark:bg-amber-900 px-1 py-0.5 rounded">.env</code> file.</li>
                <li>Production: Add <code className="bg-amber-100 dark:bg-amber-900 px-1 py-0.5 rounded">NEXT_PUBLIC_APP_URL="https://hapsay-print.vercel.app"</code> in your Vercel Dashboard, then <strong>redeploy</strong>.</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 lg:p-12 flex flex-col items-center justify-center text-center shadow-sm">
            <div 
              ref={qrRef}
              className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800 mb-6"
            >
              <QRCodeCanvas 
                value={targetUrl}
                size={256}
                level="H"
                includeMargin={true}
                fgColor="#09090b" // zinc-950
                imageSettings={{
                  src: "/favicon.ico", // Optionally overlay logo if you have one
                  x: undefined,
                  y: undefined,
                  height: 24,
                  width: 24,
                  excavate: true,
                }}
              />
            </div>

            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">Scan to Submit a Print Job</h2>
            <p className="text-sm font-medium text-zinc-500 mt-2 mb-8 select-all">{targetUrl}</p>

            <div className="flex gap-4">
              <Button onClick={downloadQR} className="h-11 px-6 font-semibold">
                <DownloadIcon className="w-4 h-4 mr-2" />
                Download as PNG
              </Button>
              <Button variant="outline" className="h-11 px-6 font-semibold" onClick={() => window.print()}>
                <PrinterIcon className="w-4 h-4 mr-2" />
                Print Now
              </Button>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
