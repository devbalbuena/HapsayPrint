import { NextResponse } from "next/server";
import { prisma } from "@/src/db";
import bcrypt from "bcrypt";

// ONE-TIME SETUP ROUTE — DELETE THIS FILE AFTER CREATING YOUR ADMIN ACCOUNT
// Visit: http://localhost:3000/api/setup-admin to create the first admin user
export async function GET() {
  // --- EDIT THESE CREDENTIALS BEFORE VISITING THE ROUTE ---
  const ADMIN_EMAIL = "admin@hapsayprint.com";
  const ADMIN_NAME = "Admin";
  const ADMIN_PASSWORD = "changeme123"; // Change this to something secure!
  // ---------------------------------------------------------

  try {
    // Check if an admin already exists
    const existing = await prisma.user.findUnique({
      where: { email: ADMIN_EMAIL },
    });

    if (existing) {
      return NextResponse.json(
        { message: "Admin account already exists. Delete this route file immediately." },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);

    const user = await prisma.user.create({
      data: {
        email: ADMIN_EMAIL,
        name: ADMIN_NAME,
        password: hashedPassword,
        role: "ADMIN",
      },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });

    return NextResponse.json({
      message: "✅ Admin account created! DELETE THIS FILE NOW (app/api/setup-admin/route.ts).",
      user,
    });
  } catch (error) {
    console.error("Setup error:", error);
    return NextResponse.json({ message: "Failed to create admin account." }, { status: 500 });
  }
}
