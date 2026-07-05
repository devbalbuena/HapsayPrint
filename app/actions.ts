"use server";

import { prisma } from "@/src/db";
import { revalidatePath } from "next/cache";

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
      const newJob = await tx.job.create({
        data: {
          description: data.description,
          status: "PENDING",
          customerId: customer.id,
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
    return { success: true, jobId: job.id };
  } catch (error: any) {
    console.error("Failed to submit print job:", error);
    return { success: false, error: "Failed to save submission. Please try again." };
  }
}
