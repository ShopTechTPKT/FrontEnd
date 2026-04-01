import { useEffect, useMemo, useState } from "react";
import axiosInstance from "../../custom/axios";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
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
    if (status === "SUCCESS") return "bg-green-100 text-green-700";
    if (status === "FAILED") return "bg-red-100 text-red-700";
    return "bg-gray-100 text-gray-700";
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-[1400px] mx-auto space-y-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Nhật ký kiểm toán</h1>
              <p className="text-sm text-gray-500 mt-1">
                Trang này dùng để theo dõi ai đã thực hiện hành động gì, vào thời điểm nào, kết quả thành công hay thất bại
                để phục vụ kiểm tra, truy vết sự cố và đảm bảo bảo mật.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => navigate("/admin")}
                variant="outline"
              >
                Quay lại Admin
              </Button>
              <Button
                onClick={exportCsv}
                variant="primary"
              >
                Xuất CSV
              </Button>
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

        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
            <input
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
              placeholder="Email người thao tác"
              value={filters.actorEmail}
              onChange={(e) => onChangeFilter("actorEmail", e.target.value)}
            />
            <input
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
              placeholder="Hành động"
              value={filters.action}
              onChange={(e) => onChangeFilter("action", e.target.value)}
            />
            <input
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
              placeholder="Loại tài nguyên"
              value={filters.resourceType}
              onChange={(e) => onChangeFilter("resourceType", e.target.value)}
            />
            <select
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
              value={filters.status}
              onChange={(e) => onChangeFilter("status", e.target.value)}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="SUCCESS">Thành công</option>
              <option value="FAILED">Thất bại</option>
            </select>
            <input
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
              type="datetime-local"
              value={filters.from}
              onChange={(e) => onChangeFilter("from", e.target.value)}
            />
            <input
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
              type="datetime-local"
              value={filters.to}
              onChange={(e) => onChangeFilter("to", e.target.value)}
            />
            <Button
              onClick={() => setFilters(defaultFilters)}
              variant="outline"
              size="sm"
            >
              Đặt lại bộ lọc
            </Button>
            <Button
              onClick={fetchLogs}
              variant="ghost"
              size="sm"
            >
              Áp dụng
            </Button>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">ID</th>
                  <th className="px-4 py-3 text-left font-semibold">Người thao tác</th>
                  <th className="px-4 py-3 text-left font-semibold">Hành động</th>
                  <th className="px-4 py-3 text-left font-semibold">Tài nguyên</th>
                  <th className="px-4 py-3 text-left font-semibold">Trạng thái</th>
                  <th className="px-4 py-3 text-left font-semibold">Lý do</th>
                  <th className="px-4 py-3 text-left font-semibold">Thời gian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading && (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-gray-500">
                      Đang tải dữ liệu nhật ký...
                    </td>
                  </tr>
                )}
                {!loading &&
                  data.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50/70">
                      <td className="px-4 py-3 text-gray-700">{row.id}</td>
                      <td className="px-4 py-3 text-gray-700">{row.actorEmail || "-"}</td>
                      <td className="px-4 py-3 text-gray-700">{row.action || "-"}</td>
                      <td className="px-4 py-3 text-gray-700">{row.resourceType || "-"}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(row.status)}`}>
                          {row.status === "SUCCESS" ? "Thành công" : row.status === "FAILED" ? "Thất bại" : "Không xác định"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700 max-w-[340px] truncate" title={row.reason || "-"}>
                        {row.reason || "-"}
                      </td>
                      <td className="px-4 py-3 text-gray-700">{formatDateTime(row.createdAt)}</td>
                    </tr>
                  ))}
                {!loading && data.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-gray-500">
                      Chưa có dữ liệu nhật ký.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            Trước
          </Button>
          <span className="text-sm text-gray-700">
            Trang {page + 1} / {Math.max(totalPages, 1)}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page + 1 >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Sau
          </Button>
          <select
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
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
