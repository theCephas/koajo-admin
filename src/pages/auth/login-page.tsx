import { useState, type FormEvent } from "react";
import KoajoIcon from "../../../public/koajo.png";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => setIsSubmitting(false), 1200);
  };

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

      <div className="relative z-10 w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* illustrative left panel (hidden on small screens) */}
        <div className="hidden md:flex flex-col items-center justify-center space-y-6 px-6">
          <div className="w-56 h-56 rounded-3xl bg-gradient-to-br from-yellow-300 to-pink-400 p-6 shadow-xl flex items-center justify-center">
            {/* stylized coin stack illustration */}
            <svg viewBox="0 0 120 120" className="w-full h-full">
              <ellipse cx="60" cy="20" rx="32" ry="12" fill="#FFD27A" />
              <ellipse cx="60" cy="40" rx="32" ry="12" fill="#FFB65E" />
              <ellipse cx="60" cy="60" rx="32" ry="12" fill="#FF9B3B" />
              <rect
                x="20"
                y="25"
                width="80"
                height="10"
                rx="5"
                fill="#fff"
                opacity="0.12"
              />
              <g transform="translate(70,10)" fill="#fff" opacity="0.9">
                <circle cx="8" cy="8" r="2" />
                <circle cx="18" cy="6" r="1.6" />
                <circle cx="26" cy="14" r="1.2" />
              </g>
            </svg>
          </div>

          <div className="text-center">
            <h2 className="text-lg font-semibold text-white">
              Contribute smarter
            </h2>
            <p className="text-sm text-white/80 max-w-xs">
              Fast, transparent contributions and payouts — built for teams and
              finance-first workflows.
            </p>
          </div>
        </div>

        {/* form card */}
        <div className="w-full bg-card/70 border border-white/10 rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
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

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="text-sm font-medium block mb-2" htmlFor="email">
                Email
              </label>
              <Input
                id="email"
                type="email"
                required
                placeholder="you@koajo.com"
              />
            </div>

            <div>
              <label
                className="text-sm font-medium block mb-2"
                htmlFor="password"
              >
                Password
              </label>
              <Input
                id="password"
                type="password"
                required
                placeholder="••••••••"
              />
            </div>

            <Button className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Continue"}
            </Button>
          </form>

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
