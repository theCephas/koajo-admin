/* eslint-disable @typescript-eslint/no-misused-promises */
import { useCallback, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import KoajoIcon from "../../../public/koajo.png";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useChangePasswordMutation } from "@/hooks/queries/use-login";
import { useAuthStore } from "@/stores/auth-store";

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(10, "Password must be at least 10 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[!@#$%^&*(),.?":{}|<>]/,
        "Password must contain at least one special character",
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ChangePasswordFormValues = z.infer<typeof passwordSchema>;

interface PasswordRequirement {
  label: string;
  regex: RegExp | ((password: string) => boolean);
}

const requirements: PasswordRequirement[] = [
  { label: "At least 10 characters", regex: (pw: string) => pw.length >= 10 },
  { label: "Contains uppercase letter", regex: /[A-Z]/ },
  { label: "Contains number", regex: /[0-9]/ },
  { label: "Contains special character", regex: /[!@#$%^&*(),.?":{}|<>]/ },
];

const calculatePasswordStrength = (password: string): number => {
  if (!password) return 0;
  let strength = 0;
  if (password.length >= 10) strength += 25;
  if (/[A-Z]/.test(password)) strength += 25;
  if (/[0-9]/.test(password)) strength += 25;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 25;
  return strength;
};

const getStrengthLabel = (strength: number): string => {
  if (strength === 0) return "";
  if (strength <= 25) return "Weak";
  if (strength <= 50) return "Fair";
  if (strength <= 75) return "Good";
  return "Strong";
};

const getStrengthColor = (
  strength: number,
): { bg: string; text: string; bar: string } => {
  if (strength === 0) return { bg: "", text: "", bar: "bg-gray-200" };
  if (strength <= 25)
    return { bg: "bg-red-50", text: "text-red-700", bar: "bg-red-500" };
  if (strength <= 50)
    return {
      bg: "bg-orange-50",
      text: "text-orange-700",
      bar: "bg-orange-500",
    };
  if (strength <= 75)
    return {
      bg: "bg-yellow-50",
      text: "text-yellow-700",
      bar: "bg-yellow-500",
    };
  return { bg: "bg-green-50", text: "text-green-700", bar: "bg-green-500" };
};

export function ChangePasswordPage() {
  const navigate = useNavigate();
  const isSuperAdmin = useAuthStore((state) => state.isSuperAdmin);

  // Redirect superadmins away from change password page
  useEffect(() => {
    if (isSuperAdmin) {
      toast.info("Password change is not available for superadmin accounts");
      void navigate("/", { replace: true });
    }
  }, [isSuperAdmin, navigate]);

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  const { mutateAsync, isPending } = useChangePasswordMutation();

  const newPassword = form.watch("newPassword");
  const confirmPassword = form.watch("confirmPassword");

  const passwordStrength = useMemo(
    () => calculatePasswordStrength(newPassword),
    [newPassword],
  );

  const strengthColors = getStrengthColor(passwordStrength);
  const strengthLabel = getStrengthLabel(passwordStrength);

  const checkRequirement = useCallback(
    (requirement: PasswordRequirement): boolean => {
      if (!newPassword) return false;
      if (typeof requirement.regex === "function") {
        return requirement.regex(newPassword);
      }
      return requirement.regex.test(newPassword);
    },
    [newPassword],
  );

  const passwordsMatch = useMemo(() => {
    if (!newPassword || !confirmPassword) return null;
    return newPassword === confirmPassword;
  }, [newPassword, confirmPassword]);

  const isFormValid = useMemo(() => {
    return (
      form.formState.isValid &&
      passwordStrength === 100 &&
      passwordsMatch === true
    );
  }, [form.formState.isValid, passwordStrength, passwordsMatch]);

  const onSubmit = useCallback(
    async (values: ChangePasswordFormValues) => {
      const toastId = toast.loading("Changing password...");
      try {
        await mutateAsync({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        });
        toast.success("Password changed successfully!", {
          id: toastId,
          duration: 3000,
        });
        // Navigate to login or dashboard after successful password change
        setTimeout(() => navigate("/", { replace: true }), 1000);
      } catch (error) {
        const message =
          (error as { response?: { data?: { message?: string } } })?.response
            ?.data?.message ?? "Unable to change password. Please try again.";
        toast.error(message, { id: toastId, duration: 4000 });
      }
    },
    [mutateAsync, navigate],
  );

  return (
    <div
      className="relative flex min-h-screen items-center justify-center px-6 py-12"
      style={{
        background:
          "linear-gradient(180deg, rgba(19,21,31,1) 0%, rgba(9,11,18,1) 100%)",
      }}
    >
      {/* decorative background artwork */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <svg
          className="absolute right-[-10%] top-[-12%] w-[60rem] opacity-20"
          viewBox="0 0 800 600"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="g1" x1="0" x2="1">
              <stop offset="0" stopColor="#ffd27a" />
              <stop offset="1" stopColor="#ff7a88" />
            </linearGradient>
            <linearGradient id="g2" x1="0" x2="1">
              <stop offset="0" stopColor="#7ee7c6" />
              <stop offset="1" stopColor="#6b8cff" />
            </linearGradient>
          </defs>
          <circle cx="200" cy="140" r="160" fill="url(#g1)" />
          <rect
            x="360"
            y="220"
            width="300"
            height="160"
            rx="24"
            fill="url(#g2)"
            transform="rotate(-18 360 220)"
          />
          <g transform="translate(120 300)" fill="#fff" opacity="0.06">
            <path d="M0 0h600v20H0z" />
          </g>
        </svg>
      </div>

      <div className="relative z-10 w-full max-w-xl">
        {/* form card */}
        <div className="w-full rounded-2xl border border-white/10 bg-card/60 p-8 shadow-2xl backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-3">
              <div className="w-[100px]">
                <img
                  src={KoajoIcon}
                  alt="Koajo"
                  className="h-14 w-14 rounded-md object-contain"
                />
              </div>
              <div>
                <h1 className="text-xl font-semibold">Change Password</h1>
                <p className="text-sm text-muted-foreground">
                  Update your password to continue
                </p>
              </div>
            </div>
          </div>

          <Form {...form}>
            <form
              className="mt-6 space-y-4"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder="••••••••"
                        autoComplete="current-password"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder="••••••••"
                        autoComplete="new-password"
                      />
                    </FormControl>
                    <FormMessage />

                    {/* Password strength indicator */}
                    {newPassword && (
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">
                            Password strength
                          </span>
                          {strengthLabel && (
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs font-medium ${strengthColors.bg} ${strengthColors.text}`}
                            >
                              {strengthLabel}
                            </span>
                          )}
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                          <div
                            className={`h-full transition-all duration-300 ${strengthColors.bar}`}
                            style={{ width: `${passwordStrength}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Password requirements */}
                    <div className="mt-3 space-y-1.5 rounded-lg border border-border bg-muted/50 p-3">
                      <p className="text-xs font-medium text-muted-foreground">
                        Password must contain:
                      </p>
                      {requirements.map((requirement, index) => {
                        const isMet = checkRequirement(requirement);
                        return (
                          <div
                            key={index}
                            className="flex items-center gap-2 text-xs"
                          >
                            {isMet ? (
                              <Check className="h-3.5 w-3.5 text-green-600" />
                            ) : (
                              <X className="h-3.5 w-3.5 text-gray-400" />
                            )}
                            <span
                              className={
                                isMet
                                  ? "text-green-600"
                                  : "text-muted-foreground"
                              }
                            >
                              {requirement.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder="••••••••"
                        autoComplete="new-password"
                      />
                    </FormControl>
                    <FormMessage />

                    {/* Password match indicator */}
                    {confirmPassword && passwordsMatch !== null && (
                      <div className="mt-2 flex items-center gap-2 text-xs">
                        {passwordsMatch ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-green-600" />
                            <span className="text-green-600">
                              Passwords match
                            </span>
                          </>
                        ) : (
                          <>
                            <X className="h-3.5 w-3.5 text-red-600" />
                            <span className="text-red-600">
                              Passwords do not match
                            </span>
                          </>
                        )}
                      </div>
                    )}
                  </FormItem>
                )}
              />

              <Button
                className="w-full"
                type="submit"
                disabled={!isFormValid || isPending}
              >
                {isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Changing password...
                  </span>
                ) : (
                  "Change Password"
                )}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
