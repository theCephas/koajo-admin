/* eslint-disable @typescript-eslint/no-misused-promises */
import { useCallback, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
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
import { useLoginMutation } from "@/hooks/queries/use-login";
import { useAuthStore } from "@/stores/auth-store";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional().default(false),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();

  // Subscribe to store fields separately to avoid new object identity each render
  const setAuth = useAuthStore((s) => s.setAuth);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const { mutateAsync, isPending } = useLoginMutation();

  // Track if we're navigating to change password to prevent auto-redirect
  const navigatingToChangePassword = useRef(false);

  const onSubmit = useCallback(
    async (values: LoginFormValues) => {
      const toastId = toast.loading("Signing you in...");
      try {
        const response = await mutateAsync(values);

        // Check if password change is required
        if (response.requiresPasswordChange) {
          toast.dismiss(toastId);
          toast.info("Please change your password to continue", {
            duration: 3000,
          });
          // Store auth but navigate to change password
          navigatingToChangePassword.current = true;
          setAuth(response, { rememberMe: values.rememberMe });
          void navigate("/change-password", { replace: true });
          return;
        }

        // single store update, no loops
        setAuth(response, { rememberMe: values.rememberMe });
        toast.success("Welcome back to Koajo 👋", {
          id: toastId,
          duration: 3000,
        });
      } catch (error) {
        const message =
          (error as { response?: { data?: { message?: string } } })?.response
            ?.data?.message ?? "Unable to sign in. Please try again.";
        toast.error(message, { id: toastId, duration: 4000 });
      }
    },
    [mutateAsync, setAuth, navigate],
  );

  // Guard the redirect to only run on false -> true transitions (prevents StrictMode double-invoke loops)
  const prevAuthRef = useRef(isAuthenticated);
  useEffect(() => {
    if (
      !prevAuthRef.current &&
      isAuthenticated &&
      !navigatingToChangePassword.current
    ) {
      // defer to next tick to avoid synchronous update during mount effects
      const id = setTimeout(() => navigate("/", { replace: true }), 0);
      return () => clearTimeout(id);
    }
    prevAuthRef.current = isAuthenticated;
  }, [isAuthenticated, navigate]);

  return (
    <div
      className="relative min-h-screen flex items-center justify-center px-6 py-12"
      style={{
        background:
          "linear-gradient(180deg, rgba(19,21,31,1) 0%, rgba(9,11,18,1) 100%)",
      }}
    >
      {/* decorative background artwork */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
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

      <div className="relative z-10 w-full max-w-xl ">
        {/* form card */}
        <div className="w-full bg-card/60 border border-white/10 rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-3">
              <div className="w-[100px]">
                <img
                  src={KoajoIcon}
                  alt="Koajo"
                  className="w-14 h-14 rounded-md object-contain"
                />
              </div>
              <div>
                <h1 className="text-xl font-semibold">Sign in to Koajo</h1>
                <p className="text-sm text-muted-foreground">
                  Manage contributions, payouts and reports
                </p>
              </div>
            </div>

            {/* <div className="hidden sm:block">
              <span className="inline-flex items-center rounded-full bg-primary/20 px-3 py-1 text-sm font-medium text-primary-foreground">
                Beta
              </span>
            </div> */}
          </div>

          <Form {...form}>
            <form
              className="mt-6 space-y-4"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="you@koajo.com"
                        autoComplete="email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
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
                name="rememberMe"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between !mt-2">
                    <div className="flex items-center gap-2">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={(event) =>
                            field.onChange(event.target.checked)
                          }
                          className="h-4 w-4 rounded border border-input text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal text-muted-foreground">
                        Remember me
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <Button className="w-full" type="submit" disabled={isPending}>
                {isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  "Continue"
                )}
              </Button>
            </form>
          </Form>

          {/* <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>
              Need an account?{" "}
              <a
                className="text-primary hover:underline"
                href="/request-access"
              >
                Request access
              </a>
            </p>
          </div> */}
        </div>
      </div>
    </div>
  );
}
