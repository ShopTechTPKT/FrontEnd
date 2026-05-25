import React, { useEffect, useState } from "react";
import { Image } from "lucide-react";
import axiosInstance from "../../custom/axios";
import AdminEmptyStateCard from "./components/AdminEmptyStateCard";

export default function BannerManagerPage() {
  const [banners, setBanners] = useState([]);
  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const fetchBanners = async () => {
    const { data } = await axiosInstance.get("/banners");
    setBanners(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const createBanner = async () => {
    await axiosInstance.post("/banners", { title, imageUrl });
    setTitle("");
    setImageUrl("");
    fetchBanners();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-pageIn">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary-subtle)] text-[var(--color-primary)] flex items-center justify-center">
          <Image className="w-6 h-6" strokeWidth={1.75} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-text)] tracking-tight">
            Banner Manager
          </h2>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Quản lý banner hiển thị trên storefront
          </p>
        </div>
      </div>

      <div className="admin-card p-6 rounded-[var(--radius-lg)] space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Tiêu đề banner"
            className="admin-input flex-1 min-w-[160px]"
          />
          <input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="URL hình ảnh"
            className="admin-input flex-[2] min-w-[200px]"
          />
          <button
            type="button"
            onClick={createBanner}
            className="btn-admin-primary shrink-0"
          >
            Thêm banner
          </button>
        </div>
      </div>

      {banners.length === 0 ? (
        <AdminEmptyStateCard
          icon={<Image className="w-7 h-7" strokeWidth={1.5} />}
          title="Chưa có banner"
          description="Thêm banner đầu tiên bằng form phía trên. Ảnh sẽ được lưu qua API `/banners`."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {banners.map((banner) => (
            <div
              key={banner.id}
              className="admin-card overflow-hidden rounded-[var(--radius-lg)] flex flex-col"
            >
              <div className="aspect-[21/9] bg-[var(--color-bg-muted)] relative">
                {banner.imageUrl ? (
                  <img
                    src={banner.imageUrl}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-[var(--color-text-muted)] text-sm">
                    No image
                  </div>
                )}
              </div>
              <div className="p-4 border-t border-[var(--color-border)]">
                <div className="font-semibold text-[var(--color-text)]">
                  {banner.title}
                </div>
                <div className="text-xs text-[var(--color-text-secondary)] mt-1 truncate">
                  {banner.imageUrl}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
