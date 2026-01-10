"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  verifyEmailSchema,
  VerifyEmailInput,
} from "@/lib/validators/verifyEmailSchema";
import { useVerifyEmail } from "@/hooks/useVerifyEmail";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";

export default function VerifyEmailPage() {
  const [resending, setResending] = useState(false);
  const router = useRouter();
  const params = useSearchParams();
  const emailFromQuery = params.get("email") ?? "";

  const [serverError, setServerError] = useState<string | null>(null);
  const mutation = useVerifyEmail();

  const form = useForm<VerifyEmailInput>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: {
      email: emailFromQuery,
      otp: "",
    },
  });

  async function onSubmit(data: VerifyEmailInput) {
    setServerError(null);

    try {
      await mutation.mutateAsync(data);
      router.push("/login");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setServerError(err?.response?.data?.message ?? "Verification failed");
      }
    } 
  }
  async function ResendOTP() {
    setResending(true);
    try {
      // await axios.post(
      //   `${process.env.NEXT_PUBLIC_API_URL}/auth/resend-verification`,
      //   { emailFromQuery }
      // );
      axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/resend-verification`, {
        email: form.getValues("email"),
      });
      toast.success("Verification code resent");
    } catch {
      toast.error("Failed to resend OTP");
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto space-y-6">
      <h1 className="text-xl font-semibold">Verify your email</h1>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <Input placeholder="Email" {...form.register("email")} />

        <Input placeholder="6-digit OTP" {...form.register("otp")} />
        <Button variant="ghost" onClick={ResendOTP} disabled={resending}>
          Resend OTP
        </Button>

        <Button type="submit" className="w-full" disabled={mutation.isPending}>
          Verify Email
        </Button>

        {serverError && <Alert variant="destructive">{serverError}</Alert>}
      </form>
    </div>
  );
}
