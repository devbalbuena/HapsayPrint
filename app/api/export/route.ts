import { auth } from "@/auth";
import { prisma } from "@/src/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Parse month/year from query params — defaults to current month
  const { searchParams } = req.nextUrl;
  const now = new Date();
  const year = parseInt(searchParams.get("year") ?? String(now.getFullYear()));
  const month = parseInt(searchParams.get("month") ?? String(now.getMonth() + 1));

  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1); // exclusive — first day of next month

  const jobs = await prisma.job.findMany({
    where: {
      createdAt: { gte: start, lt: end },
    },
    orderBy: { createdAt: "asc" },
    include: {
      customer: true,
      files: true,
    },
  });

  // Map month number to name for filename
  const monthName = start.toLocaleString("en-US", { month: "long" });
  const filename = `HapsayPrint_Report_${monthName}_${year}.csv`;

  // CSV Headers
  const headers = [
    "Tracking Code",
    "Customer Name",
    "Contact",
    "Email",
    "Description",
    "Paper Size",
    "Quantity",
    "Print Type",
    "Finishing",
    "Estimated Price (₱)",
    "Status",
    "Date Submitted",
    "Last Updated",
    "Attached Files",
  ];

  function escapeCsv(val: string | number | null | undefined): string {
    if (val === null || val === undefined) return "";
    const str = String(val);
    // Wrap in quotes if the value contains comma, quote, or newline
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }

  const rows = jobs.map((job) => {
    const printTypeLabel = job.printType === "BW" ? "Black & White" : job.printType === "COLORED" ? "Colored" : job.printType ?? "";
    const finishingLabel = job.finishing === "NONE" ? "None"
      : job.finishing === "LAMINATION" ? "Lamination"
      : job.finishing === "BINDING_COMB" ? "Binding (Comb)"
      : job.finishing === "BINDING_SPIRAL" ? "Binding (Spiral)"
      : job.finishing ?? "";
    const paperLabel = job.paperSize === "SHORT" ? "Short (8.5x11)"
      : job.paperSize === "LONG" ? "Long (8.5x13)"
      : job.paperSize ?? "";
    const statusLabel = job.status === "PENDING" ? "Pending"
      : job.status === "IN_PROGRESS" ? "In Progress"
      : job.status === "READY_FOR_PICKUP" ? "Ready for Pickup"
      : job.status === "DELIVERED" ? "Delivered"
      : job.status;

    return [
      escapeCsv(job.trackingCode),
      escapeCsv(job.customer.name),
      escapeCsv(job.customer.contact),
      escapeCsv(job.customer.email),
      escapeCsv(job.description),
      escapeCsv(paperLabel),
      escapeCsv(job.quantity),
      escapeCsv(printTypeLabel),
      escapeCsv(finishingLabel),
      escapeCsv(job.estimatedPrice?.toFixed(2)),
      escapeCsv(statusLabel),
      escapeCsv(new Date(job.createdAt).toLocaleString("en-PH")),
      escapeCsv(new Date(job.updatedAt).toLocaleString("en-PH")),
      escapeCsv(job.files.map((f) => f.originalName).join("; ")),
    ].join(",");
  });

  const csv = [headers.join(","), ...rows].join("\r\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
