"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PrinterIcon, LockKeyholeIcon, AlertCircleIcon } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password. Please try again.");
    } else {
      router.push(callbackUrl);
      router.refresh();
    }
  }

  return (
    <Card className="border shadow-lg bg-card/90 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <LockKeyholeIcon className="w-4 h-4 text-muted-foreground" />
          <CardTitle className="text-lg">Sign In</CardTitle>
        </div>
        <CardDescription>
          Enter your admin credentials to access the dashboard.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Error Alert */}
          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
              <AlertCircleIcon className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@hapsayprint.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full h-10 font-semibold"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                Signing in…
              </span>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />

      <div className="w-full max-w-sm relative">
        {/* Logo / Brand */}
        <div className="flex flex-col items-center mb-8 gap-3">
          <div className="p-3 rounded-2xl bg-primary/10 ring-1 ring-primary/20">
            <PrinterIcon className="w-8 h-8 text-primary" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold">HapsayPrint</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Admin Portal</p>
          </div>
        </div>

        {/* Wrap in Suspense because LoginForm uses useSearchParams() */}
        <Suspense fallback={<div className="h-64 rounded-xl border bg-card animate-pulse" />}>
          <LoginForm />
        </Suspense>

        <p className="text-center text-xs text-muted-foreground mt-6">
          This portal is for staff only.{" "}
          <a href="/" className="underline hover:text-foreground transition-colors">
            Submit a print job →
          </a>
        </p>
      </div>
    </div>
  );
}
