interface FormErrorProps {
  /** Không có lỗi thì truyền chuỗi rỗng, component tự ẩn. */
  message?: string;
}

/** Khung báo lỗi màu đỏ hiện phía trên form. */
export function FormError({ message }: FormErrorProps) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="rounded-xl p-4"
      style={{
        background: "rgba(239, 68, 68, 0.08)",
        border: "1px solid rgba(239, 68, 68, 0.15)",
      }}
    >
      <p className="text-sm" style={{ color: "#F87171" }}>
        {message}
      </p>
    </div>
  );
}
