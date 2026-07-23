"use server";

import { prisma } from "@/src/db";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const VALID_STATUSES = ["PENDING", "IN_PROGRESS", "READY_FOR_PICKUP", "DELIVERED"] as const;
type JobStatus = typeof VALID_STATUSES[number];

export async function updateJobStatus(jobId: string, newStatus: string) {
  // Double-check session server-side — cannot be bypassed by direct calls
  const session = await auth();
  if (!session) {
    return { success: false, error: "Unauthorized. Please log in." };
  }

  if (!VALID_STATUSES.includes(newStatus as JobStatus)) {
    return { success: false, error: "Invalid status value." };
  }

  try {
    const updatedJob = await prisma.job.update({
      where: { id: jobId },
      data: { status: newStatus as JobStatus },
      include: { customer: true },
    });

    let notified = false;

    if (newStatus === "READY_FOR_PICKUP" && updatedJob.customer.email) {
      try {
        await resend.emails.send({
          from: 'onboarding@resend.dev',
          to: updatedJob.customer.email,
          subject: 'Your order at HapsayPrint is ready for pickup!',
          text: `Hi ${updatedJob.customer.name},\n\nYour print order is now ready for pickup at our shop!\n\nOrder Details:\n${updatedJob.description}\n\n${updatedJob.trackingCode ? `Tracking Code: ${updatedJob.trackingCode}\n\n` : ''}See you soon!\n- The HapsayPrint Team`,
        });
        notified = true;
      } catch (emailError) {
        console.error("Failed to send pickup notification email:", emailError);
      }
    }

    revalidatePath("/admin");
    return { success: true, notified };
  } catch (error) {
    console.error("Failed to update job status:", error);
    return { success: false, error: "Failed to update status. Please try again." };
  }
}

export type LastOrderPrefill = {
  name: string;
  email: string | null;
  paperSize: string | null;
  printType: string | null;
  finishing: string | null;
  quantity: number;
  isRush: boolean;
};

/** Public: load print specs from the customer's most recent job (matched by contact). */
export async function getLastOrderByContact(
  contact: string
): Promise<{ success: true; data: LastOrderPrefill | null } | { success: false; error: string }> {
  const trimmed = contact.trim();
  if (trimmed.length < 7) {
    return { success: true, data: null };
  }

  try {
    const customer = await prisma.customer.findFirst({
      where: { contact: trimmed },
      include: {
        jobs: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!customer || customer.jobs.length === 0) {
      return { success: true, data: null };
    }

    const job = customer.jobs[0];
    return {
      success: true,
      data: {
        name: customer.name,
        email: customer.email,
        paperSize: job.paperSize,
        printType: job.printType,
        finishing: job.finishing ?? "NONE",
        quantity: job.quantity && job.quantity > 0 ? job.quantity : 1,
        isRush: job.isRush,
      },
    };
  } catch (error) {
    console.error("Failed to load last order:", error);
    return { success: false, error: "Could not load your previous order." };
  }
}

export type SubmitPrintJobData = {
  name: string;
  contact: string;
  email: string | null;
  description: string;
  files?: {
    url: string;
    originalName: string;
    fileType: string;
  }[];
  paperSize?: string | null;
  quantity?: number;
  printType?: string | null;
  finishing?: string | null;
  estimatedPrice?: number;
  isRush?: boolean;
};

export async function submitPrintJob(data: SubmitPrintJobData) {
  try {
    const contact = data.contact.trim();
    const job = await prisma.$transaction(async (tx) => {
      // 1. Find existing customer by contact number or create a new one
      let customer = await tx.customer.findFirst({
        where: { contact },
      });

      if (customer) {
        // Update their latest name/email just in case
        customer = await tx.customer.update({
          where: { id: customer.id },
          data: { name: data.name, email: data.email },
        });
      } else {
        customer = await tx.customer.create({
          data: { name: data.name, contact, email: data.email },
        });
      }

      // 2. Create the Job
      const trackingCode = `HP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const newJob = await tx.job.create({
        data: {
          description: data.description,
          status: "PENDING",
          customerId: customer.id,
          trackingCode: trackingCode,
          paperSize: data.paperSize,
          quantity: data.quantity,
          printType: data.printType,
          finishing: data.finishing,
          estimatedPrice: data.estimatedPrice,
          isRush: data.isRush ?? false,
        },
      });

      // 3. Create FileUpload records if files are present
      if (data.files && data.files.length > 0) {
        await tx.fileUpload.createMany({
          data: data.files.map(f => ({
            url: f.url,
            originalName: f.originalName,
            fileType: f.fileType,
            jobId: newJob.id,
          })),
        });
      }

      return newJob;
    });

    revalidatePath("/");
    return { success: true, jobId: job.id, trackingCode: job.trackingCode };
  } catch (error: any) {
    console.error("Failed to submit print job:", error);
    return { success: false, error: "Failed to save submission. Please try again." };
  }
}

export async function addJobNote(jobId: string, content: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized. Please log in." };
  }

  if (!content.trim()) {
    return { success: false, error: "Note content cannot be empty." };
  }

  try {
    const newNote = await prisma.jobNote.create({
      data: {
        content: content.trim(),
        jobId,
        adminId: session.user.id,
      },
      include: { admin: true },
    });

    revalidatePath("/admin");
    return { success: true, note: newNote };
  } catch (error) {
    console.error("Failed to add job note:", error);
    return { success: false, error: "Failed to add note. Please try again." };
  }
}

export async function toggleArchiveJob(jobId: string, archive: boolean) {
  const session = await auth();
  if (!session) {
    return { success: false, error: "Unauthorized. Please log in." };
  }

  try {
    await prisma.job.update({
      where: { id: jobId },
      data: { archived: archive },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/archive");
    return { success: true };
  } catch (error) {
    console.error("Failed to archive job:", error);
    return { success: false, error: "Failed to update job. Please try again." };
  }
}

export async function updatePricingConfig(data: Record<string, number>) {
  const session = await auth();
  if (!session) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await prisma.pricingConfig.upsert({
      where: { id: "default" },
      update: data,
      create: { id: "default", ...data },
    });
    
    revalidatePath("/");
    revalidatePath("/admin/settings");
    return { success: true };
  } catch (error) {
    console.error("Failed to update pricing:", error);
    return { success: false, error: "Failed to save prices" };
  }
}

export async function updateStoreSettings(data: {
  isAcceptingOrders: boolean;
  closedMessage: string;
  scheduleEnabled: boolean;
  openTime: string;
  closeTime: string;
  openDays: string;
}) {
  const session = await auth();
  if (!session) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await prisma.storeSettings.upsert({
      where: { id: "default" },
      update: data,
      create: { id: "default", ...data },
    });

    revalidatePath("/");
    revalidatePath("/admin/settings");
    return { success: true };
  } catch (error) {
    console.error("Failed to update store settings:", error);
    return { success: false, error: "Failed to save settings" };
  }
}
