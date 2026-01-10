"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  resetPasswordSchema,
  ResetPasswordInput,
} from "@/lib/validators/resetPasswordSchema";
import { useResetPassword } from "@/hooks/useResetPassword";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const params = useSearchParams();
  const token = params.get("token")!;
  const router = useRouter();
  const mutation = useResetPassword();

  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordInput) => {
    try {
      await mutation.mutateAsync({ token, password: data.password });
      router.push("/login");
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        if (status) {
          toast.error(error.response?.data?.message ?? "Reset failed");
        }
      }
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-sm">
      <Input
        type="password"
        placeholder="New Password"
        {...form.register("password")}
      />
      <Input
        type="password"
        placeholder="Confirm Password"
        {...form.register("confirmPassword")}
      />

      <Button type="submit">Reset Password</Button>

      {mutation.isError && (
        <p className="text-red-500">
          {(mutation.error as AxiosError<{ message: string }>)?.response?.data
            ?.message ?? "Something went wrong"}
        </p>
      )}
    </form>
  );
}
