"use client";

import { Lock, Mail, Sparkles, User, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { AuthLayout } from "@/components/auth/AuthLayout";
import { FormError } from "@/components/auth/FormError";
import { PasswordField } from "@/components/auth/PasswordField";
import { SocialAuthButtons } from "@/components/auth/SocialAuthButtons";
import { SubmitButton } from "@/components/auth/SubmitButton";
import { TermsCheckbox } from "@/components/auth/TermsCheckbox";
import { TextField } from "@/components/auth/TextField";
import { useRedirectIfAuthenticated } from "@/hooks/useRequireAuth";
import { getErrorMessage } from "@/lib/errors";
import { authService } from "@/services/auth.service";

const FEATURES = [
  { icon: Sparkles, label: "AI-powered" },
  { icon: Lock, label: "End-to-end" },
  { icon: Users, label: "Team spaces" },
];

/** Backend đang yêu cầu mật khẩu tối thiểu 6 ký tự (CreateUserDto). */
const MIN_PASSWORD_LENGTH = 6;

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useRedirectIfAuthenticated();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Mật khẩu nhập lại không khớp");
      return;
    }

    if (!agreeToTerms) {
      setError("Bạn cần đồng ý với điều khoản trước khi tạo tài khoản");
      return;
    }

    setIsLoading(true);
    try {
      await authService.signup({ name, email, password });
      // Đăng ký xong quay về trang đăng nhập để vào bằng tài khoản vừa tạo.
      router.replace("/login");
    } catch (caught) {
      setError(getErrorMessage(caught, "Đăng ký thất bại. Thử lại nhé!"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      headline="Start chatting in"
      highlight="seconds."
      description="Experience real-time communication at its best. Join 10,000+ users worldwide connecting instantly with secure, encrypted messaging."
      features={FEATURES}
      avatarIds={[1, 2, 3]}
      socialProof={
        <>
          Join <span className="text-white">10k+</span> people already chatting
        </>
      }
    >
      <div className="text-center lg:text-left">
        <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">
          Create your account
        </h2>
        <p style={{ color: "var(--nx-text-tertiary)" }}>
          Enter your details to get started with NexusChat
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <FormError message={error} />

        <TextField
          id="name"
          label="Full Name"
          icon={User}
          type="text"
          placeholder="John Doe"
          value={name}
          onChange={(event) => setName(event.target.value)}
          disabled={isLoading}
          required
        />

        <TextField
          id="email"
          label="Email Address"
          icon={Mail}
          type="email"
          placeholder="name@example.com"
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
          minLength={MIN_PASSWORD_LENGTH}
        />

        <PasswordField
          id="confirmPassword"
          label="Confirm Password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          disabled={isLoading}
          minLength={MIN_PASSWORD_LENGTH}
        />

        <TermsCheckbox checked={agreeToTerms} onChange={setAgreeToTerms} />

        <SubmitButton isLoading={isLoading} loadingLabel="Creating...">
          Create Account
        </SubmitButton>

        <SocialAuthButtons dividerLabel="or sign up with" />

        <p
          className="text-center text-sm"
          style={{ color: "var(--nx-text-ghost)" }}
        >
          Already have an account?{" "}
          <Link
            href="/login"
            className="underline-offset-4 hover:underline font-medium"
            style={{ color: "var(--nx-accent-400)" }}
          >
            Log in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
