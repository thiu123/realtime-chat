"use client";

import { Globe, Mail, Shield, Zap } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { AuthLayout } from "@/components/auth/AuthLayout";
import { FormError } from "@/components/auth/FormError";
import { PasswordField } from "@/components/auth/PasswordField";
import { SocialAuthButtons } from "@/components/auth/SocialAuthButtons";
import { SubmitButton } from "@/components/auth/SubmitButton";
import { TextField } from "@/components/auth/TextField";
import { useRedirectIfAuthenticated } from "@/hooks/useRequireAuth";
import { getErrorMessage } from "@/lib/errors";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/stores/auth.store";

const FEATURES = [
  { icon: Zap, label: "Real-time" },
  { icon: Shield, label: "Encrypted" },
  { icon: Globe, label: "Global CDN" },
];

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Đăng nhập rồi thì vào thẳng màn hình chat.
  useRedirectIfAuthenticated();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const data = await authService.login({ email, password });
      setAuth(data.user, data.access_token);
      router.replace("/");
    } catch (caught) {
      setError(getErrorMessage(caught, "Đăng nhập thất bại. Thử lại nhé!"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      headline="Connect"
      highlight="instantly."
      description="The real-time workspace for modern teams. Secure, fast, and beautifully designed for seamless collaboration."
      features={FEATURES}
      avatarIds={[4, 5, 6]}
      socialProof={
        <>
          Joined by <span className="text-white">10,000+</span> teams worldwide
        </>
      }
    >
      <div className="text-center lg:text-left">
        <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">
          Welcome back
        </h2>
        <p style={{ color: "var(--nx-text-tertiary)" }}>
          Please enter your details to sign in.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <FormError message={error} />

        <TextField
          id="email"
          label="Email address"
          icon={Mail}
          type="email"
          placeholder="name@company.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={isLoading}
          required
        />

        <PasswordField
          id="password"
          label="Password"
          value={password}
          onChange={setPassword}
          disabled={isLoading}
        />

        <SubmitButton isLoading={isLoading} loadingLabel="Signing in...">
          Sign In
        </SubmitButton>

        <SocialAuthButtons dividerLabel="or continue with" />

        <p
          className="text-center text-sm"
          style={{ color: "var(--nx-text-ghost)" }}
        >
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="underline-offset-4 hover:underline font-medium"
            style={{ color: "var(--nx-accent-400)" }}
          >
            Create an account
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
