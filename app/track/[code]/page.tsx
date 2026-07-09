import { prisma } from "@/src/db";
import { notFound } from "next/navigation";
import { PrinterIcon, ClockIcon, Loader2Icon, PackageCheckIcon, CheckCircle2Icon, ArrowLeftIcon, FileIcon } from "lucide-react";
import Link from "next/link";

export const revalidate = 0; // Dynamic page

const statusDetails = {
  PENDING: {
    label: "Pending Review",
    message: "We've received your order and are reviewing it before printing.",
    color: "amber",
    icon: ClockIcon,
  },
  IN_PROGRESS: {
    label: "Printing in Progress",
    message: "Your order is currently being printed by our machines.",
    color: "blue",
    icon: Loader2Icon,
  },
  READY_FOR_PICKUP: {
    label: "Ready for Pickup",
    message: "Great news! Your print job is done and ready to be picked up.",
    color: "emerald",
    icon: PackageCheckIcon,
  },
  DELIVERED: {
    label: "Completed",
    message: "This order has been picked up and completed.",
    color: "zinc",
    icon: CheckCircle2Icon,
  },
};

export default async function TrackPage(props: { params: Promise<{ code: string }> }) {
  const params = await props.params;
  const { code } = params;

  const job = await prisma.job.findUnique({
    where: { trackingCode: code },
    include: { customer: true, files: true },
  });

  if (!job) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-zinc-50 p-6">
        <div className="w-20 h-20 bg-zinc-200 rounded-full flex items-center justify-center mb-6">
          <SearchIcon className="w-10 h-10 text-zinc-400" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 mb-2">Order Not Found</h1>
        <p className="text-zinc-500 text-center max-w-sm mb-8">
          We couldn't find an order with the tracking code <strong>{code}</strong>. Please check your code and try again.
        </p>
        <Link href="/" className="inline-flex items-center text-sm font-medium text-emerald-600 hover:text-emerald-700">
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back to Homepage
        </Link>
      </div>
    );
  }

  const statusInfo = statusDetails[job.status];
  const StatusIcon = statusInfo.icon;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans">
      <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 shadow-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-zinc-900 dark:text-zinc-50">
            <PrinterIcon className="w-5 h-5" />
            <span className="font-bold tracking-tight">HapsayPrint</span>
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12 space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Track Your Order</h1>
          <p className="text-zinc-500 mt-2">Tracking Code: <span className="font-mono font-bold text-zinc-900 dark:text-zinc-200 uppercase">{job.trackingCode}</span></p>
        </div>

        {/* Status Card */}
        <div className={`rounded-2xl border p-6 md:p-10 ${
          statusInfo.color === 'amber' ? 'bg-amber-50/50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/50' :
          statusInfo.color === 'blue' ? 'bg-blue-50/50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900/50' :
          statusInfo.color === 'emerald' ? 'bg-emerald-50/50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900/50' :
          'bg-zinc-100 border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800'
        }`}>
          <div className="flex flex-col items-center text-center gap-4">
            <div className={`p-4 rounded-full ${
              statusInfo.color === 'amber' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400' :
              statusInfo.color === 'blue' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400' :
              statusInfo.color === 'emerald' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400' :
              'bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
            }`}>
              <StatusIcon className={`w-10 h-10 ${statusInfo.color === 'blue' ? 'animate-spin-slow' : ''}`} />
            </div>
            <div>
              <h2 className={`text-2xl font-bold ${
                statusInfo.color === 'amber' ? 'text-amber-900 dark:text-amber-100' :
                statusInfo.color === 'blue' ? 'text-blue-900 dark:text-blue-100' :
                statusInfo.color === 'emerald' ? 'text-emerald-900 dark:text-emerald-100' :
                'text-zinc-900 dark:text-zinc-100'
              }`}>
                {statusInfo.label}
              </h2>
              <p className={`mt-2 max-w-md mx-auto ${
                statusInfo.color === 'amber' ? 'text-amber-700 dark:text-amber-200/70' :
                statusInfo.color === 'blue' ? 'text-blue-700 dark:text-blue-200/70' :
                statusInfo.color === 'emerald' ? 'text-emerald-700 dark:text-emerald-200/70' :
                'text-zinc-600 dark:text-zinc-400'
              }`}>
                {statusInfo.message}
              </p>
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-sm">
          <h3 className="text-lg font-semibold tracking-tight border-b border-zinc-100 dark:border-zinc-800 pb-4">Order Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-zinc-500 mb-1">Submitted On</p>
              <p className="font-medium text-zinc-900 dark:text-zinc-100">
                {new Date(job.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500 mb-1">Name</p>
              <p className="font-medium text-zinc-900 dark:text-zinc-100">{job.customer.name}</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-zinc-500 mb-1">Instructions</p>
            <p className="font-medium text-zinc-900 dark:text-zinc-100 p-4 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-100 dark:border-zinc-800 whitespace-pre-wrap">
              {job.description}
            </p>
          </div>

          {job.files.length > 0 && (
            <div>
              <p className="text-sm font-medium text-zinc-500 mb-2">Attached File</p>
              <div className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-100 dark:border-zinc-800">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
                  <FileIcon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate max-w-[200px] md:max-w-[400px]">
                    {job.files[0].originalName}
                  </p>
                  <p className="text-xs text-zinc-500">File received</p>
                </div>
              </div>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}

function SearchIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
