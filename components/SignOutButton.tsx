"use client";

import { signOut } from "next-auth/react";
import { LogOutIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  return (
    <Button
      variant="outline"
      size="sm"
      className="h-8 text-xs gap-1.5"
      onClick={() => signOut({ callbackUrl: "/login" })}
    >
      <LogOutIcon className="w-3.5 h-3.5" />
      Sign Out
    </Button>
  );
}
