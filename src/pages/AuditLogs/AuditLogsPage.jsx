import { useEffect, useMemo, useState } from "react";
import axiosInstance from "../../custom/axios";
import { useNavigate } from "react-router-dom";
import StatusNotice from "../../components/ui/StatusNotice";

const defaultFilters = {
  actorEmail: "",
  action: "",
  resourceType: "",
  status: "",
  from: "",
  to: "",
};

export default function AuditLogsPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState(defaultFilters);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [data, setData] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    params.set("page", page);
    params.set("size", size);
    params.set("sortBy", "createdAt");
    params.set("direction", "desc");
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    return params.toString();
  }, [filters, page, size]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/audit-logs?${queryString}`);
      setData(response.data?.content || []);
      setTotalPages(response.data?.totalPages || 0);
      setError("");
    } catch (err) {
      console.error("Error fetching audit logs:", err);
      setError("Không tải được dữ liệu nhật ký kiểm toán. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [queryString]);

  const onChangeFilter = (key, value) => {
    setPage(0);
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const exportCsv = async () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    params.set("size", "5000");
    const response = await axiosInstance.get(`/audit-logs/export?${params.toString()}`, {
      responseType: "blob",
    });
    const blob = new Blob([response.data], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "audit-logs.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const formatDateTime = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString("vi-VN");
  };

  const statusClass = (status) => {
    if (status === "SUCCESS") {
      return "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 ring-1 ring-emerald-500/25";
    }
    if (status === "FAILED") {
      return "bg-red-500/15 text-red-800 dark:text-red-300 ring-1 ring-red-500/25";
    }
    return "bg-[var(--color-bg-muted)] text-[var(--color-text-secondary)] ring-1 ring-[var(--color-border)]";
  };

  return (
    <div className="p-6 animate-pageIn">
      <div className="max-w-[1400px] mx-auto space-y-4">
        <div className="admin-card p-5 rounded-[var(--radius-lg)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-[var(--color-text)]">Nhật ký kiểm toán</h1>
              <p className="text-sm text-[var(--color-text-muted)] mt-1">
                Trang này dùng để theo dõi ai đã thực hiện hành động gì, vào thời điểm nào, kết quả thành công hay thất bại
                để phục vụ kiểm tra, truy vết sự cố và đảm bảo bảo mật.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => navigate("/admin")}
                className="btn-admin-outline"
              >
                Quay lại Admin
              </button>
              <button type="button" onClick={exportCsv} className="btn-admin-primary">
                Xuất CSV
              </button>
            </div>
          </div>
        </div>

        {error ? (
          <StatusNotice
            tone="error"
            title="Lỗi tải dữ liệu"
            message={error}
            actionText="Thử lại"
            onAction={fetchLogs}
          />
        ) : null}

        <div className="admin-card p-4 rounded-[var(--radius-lg)]">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
            <input
              className="admin-input text-sm py-2 dark:bg-gray-900 dark:border-gray-700"
              placeholder="Email người thao tác"
              value={filters.actorEmail}
              onChange={(e) => onChangeFilter("actorEmail", e.target.value)}
            />
            <input
              className="admin-input text-sm py-2 dark:bg-gray-900 dark:border-gray-700"
              placeholder="Hành động"
              value={filters.action}
              onChange={(e) => onChangeFilter("action", e.target.value)}
            />
            <input
              className="admin-input text-sm py-2 dark:bg-gray-900 dark:border-gray-700"
              placeholder="Loại tài nguyên"
              value={filters.resourceType}
              onChange={(e) => onChangeFilter("resourceType", e.target.value)}
            />
            <select
              className="admin-input text-sm py-2 dark:bg-gray-900 dark:border-gray-700"
              value={filters.status}
              onChange={(e) => onChangeFilter("status", e.target.value)}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="SUCCESS">Thành công</option>
              <option value="FAILED">Thất bại</option>
            </select>
            <input
              className="admin-input text-sm py-2 dark:bg-gray-900 dark:border-gray-700"
              type="datetime-local"
              value={filters.from}
              onChange={(e) => onChangeFilter("from", e.target.value)}
            />
            <input
              className="admin-input text-sm py-2 dark:bg-gray-900 dark:border-gray-700"
              type="datetime-local"
              value={filters.to}
              onChange={(e) => onChangeFilter("to", e.target.value)}
            />
            <button
              type="button"
              onClick={() => setFilters(defaultFilters)}
              className="btn-admin-outline text-sm py-2 justify-self-start"
            >
              Đặt lại bộ lọc
            </button>
            <button type="button" onClick={fetchLogs} className="btn-admin-primary text-sm py-2 justify-self-start">
              Áp dụng
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg)] shadow-sm">
          <table className="admin-table text-sm">
            <thead>
              <tr>
                <th>ID</th>
                <th>Người thao tác</th>
                <th>Hành động</th>
                <th>Tài nguyên</th>
                <th>Trạng thái</th>
                <th>Lý do</th>
                <th>Thời gian</th>
              </tr>
            </thead>
            <tbody>
                {loading && (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-[var(--color-text-muted)]">
                      Đang tải dữ liệu nhật ký...
                    </td>
                  </tr>
                )}
                {!loading &&
                  data.map((row) => (
                    <tr key={row.id} className="admin-table-row">
                      <td className="text-[var(--color-text)]">{row.id}</td>
                      <td className="text-[var(--color-text)]">{row.actorEmail || "-"}</td>
                      <td className="text-[var(--color-text)]">{row.action || "-"}</td>
                      <td className="text-[var(--color-text)]">{row.resourceType || "-"}</td>
                      <td>
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(row.status)}`}>
                          {row.status === "SUCCESS" ? "Thành công" : row.status === "FAILED" ? "Thất bại" : "Không xác định"}
                        </span>
                      </td>
                      <td className="text-[var(--color-text)] max-w-[340px] truncate" title={row.reason || "-"}>
                        {row.reason || "-"}
                      </td>
                      <td className="text-[var(--color-text)]">{formatDateTime(row.createdAt)}</td>
                    </tr>
                  ))}
                {!loading && data.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-[var(--color-text-muted)]">
                      Chưa có dữ liệu nhật ký.
                    </td>
                  </tr>
                )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center gap-3 admin-card p-4 rounded-[var(--radius-lg)]">
          <button
            type="button"
            className="btn-admin-outline text-sm"
            disabled={page <= 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            Trước
          </button>
          <span className="text-sm text-[var(--color-text-secondary)]">
            Trang {page + 1} / {Math.max(totalPages, 1)}
          </span>
          <button
            type="button"
            className="btn-admin-outline text-sm"
            disabled={page + 1 >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Sau
          </button>
          <select
            className="admin-input text-sm py-2 w-auto dark:bg-gray-900 dark:border-gray-700"
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>
    </div>
  );
}
