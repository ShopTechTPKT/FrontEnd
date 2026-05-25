import React, { useState } from "react";
import { Mail } from "lucide-react";
import axiosInstance from "../../custom/axios";

export default function EmailCampaignPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [recipients, setRecipients] = useState("");
  const [result, setResult] = useState(null);

  const submit = async () => {
    const { data } = await axiosInstance.post("/email-campaigns", {
      title,
      content,
      recipients: recipients
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean).length,
    });
    setResult(data);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-pageIn">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary-subtle)] text-[var(--color-primary)] flex items-center justify-center">
          <Mail className="w-6 h-6" strokeWidth={1.75} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-text)] tracking-tight">
            Email Campaign
          </h2>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Tạo chiến dịch gửi email (giao diện quản trị)
          </p>
        </div>
      </div>

      <div className="admin-card p-4 rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border)] bg-[var(--color-bg-subtle)]">
        <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
          <span className="font-semibold text-[var(--color-text)]">Mẹo:</span>{" "}
          Chiến dịch được gửi qua API{" "}
          <code className="text-xs px-1.5 py-0.5 rounded bg-[var(--color-bg)] border border-[var(--color-border)]">
            /email-campaigns
          </code>
          . Kiểm tra phản hồi bên dưới sau khi tạo.
        </p>
      </div>

      <div className="admin-card p-6 space-y-4 rounded-[var(--radius-lg)]">
        <label className="block text-sm font-medium text-[var(--color-text)]">
          Tiêu đề
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Tiêu đề chiến dịch"
            className="admin-input mt-1"
          />
        </label>
        <label className="block text-sm font-medium text-[var(--color-text)]">
          Nội dung
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Nội dung email"
            rows={5}
            className="admin-input mt-1 min-h-[8rem]"
          />
        </label>
        <label className="block text-sm font-medium text-[var(--color-text)]">
          Danh sách email (phân cách bằng dấu phẩy)
          <input
            value={recipients}
            onChange={(e) => setRecipients(e.target.value)}
            placeholder="a@mail.com, b@mail.com"
            className="admin-input mt-1"
          />
        </label>
        <div className="pt-2">
          <button type="button" onClick={submit} className="btn-admin-primary">
            Tạo campaign
          </button>
        </div>
      </div>

      {result ? (
        <div className="admin-card p-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-subtle)]">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)] mb-2">
            Phản hồi API
          </p>
          <pre className="text-xs p-3 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] overflow-x-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      ) : null}
    </div>
  );
}
