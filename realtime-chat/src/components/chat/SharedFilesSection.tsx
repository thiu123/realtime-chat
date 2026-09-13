import { FileText, Image as ImageIcon, type LucideIcon } from "lucide-react";

interface SharedFile {
  id: number;
  name: string;
  size: string;
  date: string;
  icon: LucideIcon;
  color: string;
  background: string;
}

/**
 * DỮ LIỆU MẪU — backend chưa có API file đính kèm.
 * Khi nào làm tính năng đó thì thay mảng này bằng dữ liệu thật.
 */
const SAMPLE_FILES: SharedFile[] = [
  {
    id: 1,
    name: "Design_Guidelines_v2.pdf",
    size: "2.9 MB",
    date: "Oct 22",
    icon: FileText,
    color: "var(--nx-danger)",
    background: "rgba(239, 68, 68, 0.1)",
  },
  {
    id: 2,
    name: "Hero_Concept_Draft.png",
    size: "4.8 MB",
    date: "Oct 19",
    icon: ImageIcon,
    color: "var(--nx-warning)",
    background: "rgba(245, 158, 11, 0.1)",
  },
];

/** Danh sách file đã gửi trong cuộc trò chuyện (hiện đang là dữ liệu mẫu). */
export function SharedFilesSection() {
  return (
    <div>
      <h3
        className="text-[11px] font-semibold uppercase tracking-widest mb-4"
        style={{ color: "var(--nx-accent-400)" }}
      >
        Shared Files
      </h3>

      <div className="space-y-2">
        {SAMPLE_FILES.map(({ id, name, size, date, icon: Icon, color, background }) => (
          <div
            key={id}
            className="flex items-center gap-3 p-3 rounded-xl"
            style={{ background: "var(--nx-glass-bg)" }}
          >
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
              style={{ background, color }}
            >
              <Icon className="w-5 h-5" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{name}</p>
              <p className="text-xs" style={{ color: "var(--nx-text-ghost)" }}>
                {size} • {date}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
