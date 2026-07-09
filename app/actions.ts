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

export type SubmitPrintJobData = {
  name: string;
  contact: string;
  email: string | null;
  description: string;
  file?: {
    url: string;
    originalName: string;
    fileType: string;
  };
  paperSize?: string | null;
  quantity?: number;
  printType?: string | null;
  finishing?: string | null;
  estimatedPrice?: number;
};

export async function submitPrintJob(data: SubmitPrintJobData) {
  try {
    const job = await prisma.$transaction(async (tx) => {
      // 1. Find existing customer by contact number or create a new one
      let customer = await tx.customer.findFirst({
        where: { contact: data.contact },
      });

      if (customer) {
        // Update their latest name/email just in case
        customer = await tx.customer.update({
          where: { id: customer.id },
          data: { name: data.name, email: data.email },
        });
      } else {
        customer = await tx.customer.create({
          data: { name: data.name, contact: data.contact, email: data.email },
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
        },
      });

      // 3. Create FileUpload if a file is present
      if (data.file) {
        await tx.fileUpload.create({
          data: {
            url: data.file.url,
            originalName: data.file.originalName,
            fileType: data.file.fileType,
            jobId: newJob.id,
          },
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
