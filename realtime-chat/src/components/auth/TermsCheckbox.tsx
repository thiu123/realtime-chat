"use client";

import { Checkbox } from "@/components/ui/checkbox";

interface TermsCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

/** Ô tích "đồng ý điều khoản" ở trang đăng ký. */
export function TermsCheckbox({ checked, onChange }: TermsCheckboxProps) {
  return (
    <div className="flex items-start space-x-2">
      <Checkbox
        id="terms"
        checked={checked}
        onCheckedChange={(value) => onChange(value === true)}
        className="mt-1 border-zinc-700 data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-500"
      />

      <label
        htmlFor="terms"
        className="text-sm leading-relaxed cursor-pointer"
        style={{ color: "var(--nx-text-tertiary)" }}
      >
        I agree to the Terms of Service and Privacy Policy.
      </label>
    </div>
  );
}
