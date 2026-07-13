import { prisma } from "@/src/db";
import { StoreSettings } from "@/src/generated/prisma";

export async function getStoreSettings(): Promise<StoreSettings> {
  let settings = await prisma.storeSettings.findUnique({
    where: { id: "default" },
  });

  if (!settings) {
    settings = await prisma.storeSettings.create({
      data: { id: "default" },
    });
  }

  return settings;
}

const DAY_MAP: Record<string, number> = {
  SUN: 0,
  MON: 1,
  TUE: 2,
  WED: 3,
  THU: 4,
  FRI: 5,
  SAT: 6,
};

/**
 * Given store settings, determine if the shop is currently open.
 * Returns { isOpen: boolean, reason?: string }
 */
export function computeStoreStatus(settings: StoreSettings): {
  isOpen: boolean;
  message: string;
} {
  // Manual override always wins
  if (!settings.isAcceptingOrders) {
    return { isOpen: false, message: settings.closedMessage };
  }

  // If schedule is not enabled, we are open
  if (!settings.scheduleEnabled) {
    return { isOpen: true, message: "" };
  }

  // Check against schedule
  // Use Philippine time (Asia/Manila) for schedule evaluation
  const now = new Date();
  const phNow = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Manila" })
  );

  const currentDay = phNow.getDay(); // 0 = Sunday
  const openDays = settings.openDays
    .split(",")
    .map((d) => DAY_MAP[d.trim().toUpperCase()])
    .filter((d) => d !== undefined);

  const isDayOpen = openDays.includes(currentDay);

  if (!isDayOpen) {
    return { isOpen: false, message: settings.closedMessage };
  }

  // Check time window
  const [openHour, openMin] = settings.openTime.split(":").map(Number);
  const [closeHour, closeMin] = settings.closeTime.split(":").map(Number);

  const currentMinutes = phNow.getHours() * 60 + phNow.getMinutes();
  const openMinutes = openHour * 60 + openMin;
  const closeMinutes = closeHour * 60 + closeMin;

  if (currentMinutes >= openMinutes && currentMinutes < closeMinutes) {
    return { isOpen: true, message: "" };
  }

  return { isOpen: false, message: settings.closedMessage };
}
