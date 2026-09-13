import type { LucideIcon } from "lucide-react";
import { MessageSquare } from "lucide-react";
import type { ReactNode } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AuthLayoutProps {
  /** Dòng chữ lớn, ví dụ "Connect". */
  headline: string;
  /** Từ được tô màu gradient ở dòng dưới, ví dụ "instantly.". */
  highlight: string;
  description: string;
  /** 3 viên thuốc giới thiệu tính năng. */
  features: { icon: LucideIcon; label: string }[];
  socialProof: ReactNode;
  /** Id ảnh đại diện mẫu của i.pravatar.cc. */
  avatarIds: [number, number, number];
  /** Form đăng nhập / đăng ký nằm ở cột phải. */
  children: ReactNode;
}

/**
 * Khung 2 cột dùng chung cho trang đăng nhập và đăng ký:
 * cột trái giới thiệu sản phẩm, cột phải là form.
 * Cột trái ẩn trên màn hình nhỏ.
 */
export function AuthLayout({
  headline,
  highlight,
  description,
  features,
  socialProof,
  avatarIds,
  children,
}: AuthLayoutProps) {
  return (
    <div
      className="flex min-h-screen noise-bg"
      style={{ background: "var(--nx-surface-0)" }}
    >
      <div
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12"
        style={{
          background:
            "linear-gradient(135deg, var(--nx-surface-1) 0%, var(--nx-surface-0) 50%, var(--nx-surface-2) 100%)",
        }}
      >
        <div className="absolute inset-0 grid-pattern" />

        {/* Hai quầng sáng mờ cho đỡ đơn điệu */}
        <div
          className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full blur-[120px] opacity-20"
          style={{ background: "var(--nx-accent-500)" }}
        />
        <div
          className="absolute bottom-1/3 right-1/4 w-56 h-56 rounded-full blur-[100px] opacity-15"
          style={{ background: "var(--nx-violet-500)" }}
        />

        <div className="relative z-10 flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center accent-gradient shadow-lg"
            style={{ boxShadow: "0 0 20px rgba(99, 102, 241, 0.3)" }}
          >
            <MessageSquare className="w-7 h-7 text-white" />
          </div>
          <span className="text-2xl font-bold text-white tracking-tight">
            NexusChat
          </span>
        </div>

        <div className="relative z-10">
          <h1 className="text-5xl font-bold text-white mb-6 leading-tight tracking-tight">
            {headline}
            <br />
            <span className="accent-text-gradient">{highlight}</span>
          </h1>

          <p
            className="text-lg max-w-md leading-relaxed"
            style={{ color: "var(--nx-text-secondary)" }}
          >
            {description}
          </p>

          <div className="flex flex-wrap gap-3 mt-8">
            {features.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
                style={{
                  background: "var(--nx-glass-bg)",
                  border: "1px solid var(--nx-glass-border)",
                  color: "var(--nx-text-secondary)",
                }}
              >
                <Icon
                  className="w-4 h-4"
                  style={{ color: "var(--nx-accent-400)" }}
                />
                {label}
              </div>
            ))}
          </div>
        </div>

        <div
          className="relative z-10 flex items-center gap-4 rounded-2xl p-4"
          style={{
            background: "var(--nx-glass-bg)",
            border: "1px solid var(--nx-glass-border)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div className="flex -space-x-3">
            {avatarIds.map((id, index) => (
              <Avatar
                key={id}
                className="w-10 h-10 ring-2"
                style={{ ["--tw-ring-color" as string]: "var(--nx-surface-1)" }}
              >
                <AvatarImage src={`https://i.pravatar.cc/150?img=${id}`} />
                <AvatarFallback>{`U${index + 1}`}</AvatarFallback>
              </Avatar>
            ))}
          </div>

          <p
            className="text-sm font-medium"
            style={{ color: "var(--nx-text-secondary)" }}
          >
            {socialProof}
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8 animate-fade-in">
          {children}

          <p
            className="text-center text-xs pt-4"
            style={{ color: "var(--nx-text-ghost)" }}
          >
            © 2024 NexusChat Inc. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
