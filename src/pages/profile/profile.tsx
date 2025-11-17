/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { LockKeyhole, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/stores/auth-store";

type TabKey = "profile" | "password";

const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  username: z.string().min(1, "Username is required"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().optional(),
});
type ProfileFormValues = z.infer<typeof profileSchema>;

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm your new password"),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });
type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function Profile() {
  const navigate = useNavigate();
  const [tab, setTab] = React.useState<TabKey>("profile");
  const isSuperAdmin = useAuthStore((state) => state.isSuperAdmin);

  // You can prefill from your auth store if available
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      phone: "",
    },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const submitProfile = profileForm.handleSubmit(async (_values) => {
    const t = toast.loading("Updating profile…");
    try {
      // TODO: call update profile API
      // await api.updateProfile(values)
      await new Promise((r) => setTimeout(r, 600));
      toast.success("Profile updated", { id: t });
    } catch (e) {
      toast.error("Unable to update profile", { id: t });
    }
  });

  const handleChangePasswordClick = () => {
    void navigate("/change-password");
  };

  const submitPassword = passwordForm.handleSubmit(async (_values) => {
    const t = toast.loading("Updating password…");
    try {
      // TODO: call update password API
      // await api.updatePassword(values)
      await new Promise((r) => setTimeout(r, 600));
      toast.success("Password updated", { id: t });
      void passwordForm.reset({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (e) {
      toast.error("Unable to update password", { id: t });
    }
  });

  return (
    <section className="mx-auto w-full max-w-5xl">
      <div className="rounded-[12px] border border-[#E5E7EB] bg-white shadow-sm">
        {/* Tabs header */}
        <div className="flex items-center gap-2 border-b">
          <TabButton
            active={tab === "profile"}
            onClick={() => setTab("profile")}
            icon={<UserIcon className="h-4 w-4" />}
            label="User profile"
          />
          {!isSuperAdmin && (
            <TabButton
              active={tab === "password"}
              onClick={handleChangePasswordClick}
              icon={<LockKeyhole className="h-4 w-4" />}
              label="Change password"
            />
          )}
        </div>

        {/* Content */}
        {tab === "profile" ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void submitProfile();
            }}
            className="space-y-6 p-4 md:p-6"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Field
                label="First Name"
                required
                error={profileForm.formState.errors.firstName?.message}
              >
                <Input
                  placeholder="First Name"
                  {...profileForm.register("firstName")}
                />
              </Field>
              <Field
                label="Last Name"
                required
                error={profileForm.formState.errors.lastName?.message}
              >
                <Input
                  placeholder="Last Name"
                  {...profileForm.register("lastName")}
                />
              </Field>
              <Field
                label="Username"
                required
                error={profileForm.formState.errors.username?.message}
              >
                <Input
                  placeholder="Username"
                  {...profileForm.register("username")}
                />
              </Field>
              <Field
                label="Email"
                required
                error={profileForm.formState.errors.email?.message}
              >
                <Input
                  placeholder="Email"
                  type="email"
                  {...profileForm.register("email")}
                />
              </Field>
              <div className="md:col-span-2">
                <Field
                  label="Phone"
                  error={profileForm.formState.errors.phone?.message}
                >
                  <Input
                    placeholder="Phone"
                    {...profileForm.register("phone")}
                  />
                </Field>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-end">
                <Button
                  type="submit"
                  className="rounded-xl bg-[#FF8C42] hover:bg-[#f77f2f]"
                  disabled={profileForm.formState.isSubmitting}
                >
                  {profileForm.formState.isSubmitting ? "Updating…" : "Update"}
                </Button>
              </div>
            </div>
          </form>
        ) : (
          <form
            onSubmit={() => void submitPassword}
            className="space-y-6 p-4 md:p-6"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <Field
                  label="Current Password"
                  required
                  error={passwordForm.formState.errors.currentPassword?.message}
                >
                  <Input
                    type="password"
                    placeholder="Current Password"
                    {...passwordForm.register("currentPassword")}
                  />
                </Field>
              </div>
              <Field
                label="New Password"
                required
                error={passwordForm.formState.errors.newPassword?.message}
              >
                <Input
                  type="password"
                  placeholder="New Password"
                  {...passwordForm.register("newPassword")}
                />
              </Field>
              <Field
                label="Confirm New Password"
                required
                error={passwordForm.formState.errors.confirmPassword?.message}
              >
                <Input
                  type="password"
                  placeholder="Confirm New Password"
                  {...passwordForm.register("confirmPassword")}
                />
              </Field>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-end">
                <Button
                  type="submit"
                  className="rounded-xl bg-[#FF8C42] hover:bg-[#f77f2f]"
                  disabled={passwordForm.formState.isSubmitting}
                >
                  {passwordForm.formState.isSubmitting ? "Updating…" : "Update"}
                </Button>
              </div>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 rounded-t-[10px] px-4 py-3 text-sm ${
        active
          ? "bg-white text-[#111827]"
          : "text-[#6B7280] hover:text-[#111827]"
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-[13px] text-[#6B7280]">
        {label} {required && <span className="text-rose-500">*</span>}
      </Label>
      {children}
      {error ? (
        <p className="text-xs text-rose-600">{error}</p>
      ) : (
        <div className="h-[0.5rem]" />
      )}
    </div>
  );
}
