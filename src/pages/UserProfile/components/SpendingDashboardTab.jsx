import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  getUserCategoryAnalytics,
  getUserMonthlyAnalytics,
  getUserSavingsAnalytics,
} from "../../../apis/userApi";
import formatCurrency from "../../../utils/formatCurrency";
import { Wallet, PiggyBank, BarChart3, PieChartIcon, Lightbulb } from "lucide-react";

const COLORS = ["#8b5cf6", "#06b6d4", "#f59e0b", "#ef4444", "#10b981", "#3b82f6"];

export default function SpendingDashboardTab({ userId }) {
  const [monthly, setMonthly] = useState([]);
  const [categories, setCategories] = useState([]);
  const [savings, setSavings] = useState({ totalSavings: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const [monthlyRes, categoryRes, savingsRes] = await Promise.all([
          getUserMonthlyAnalytics(userId),
          getUserCategoryAnalytics(userId),
          getUserSavingsAnalytics(userId),
        ]);
        if (!mounted) return;
        setMonthly(monthlyRes || []);
        setCategories(categoryRes || []);
        setSavings(savingsRes || { totalSavings: 0 });
      } catch (error) {
        console.error("Failed to load spending dashboard:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadData();
    return () => {
      mounted = false;
    };
  }, [userId]);

  const predictedNextPurchase = useMemo(() => {
    if (!categories.length) return "Gaming gear";
    const top = [...categories].sort((a, b) => Number(b.spent || 0) - Number(a.spent || 0))[0];
    return top?.category || "Gaming gear";
  }, [categories]);

  const totalSpent = useMemo(() => {
    return monthly.reduce((acc, curr) => acc + Number(curr.spent || 0), 0);
  }, [monthly]);

  if (loading) {
    return (
      <div className="profile-card flex flex-col items-center justify-center py-20 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent mb-3" />
        <p className="text-sm text-gray-500">Đang tải phân tích chi tiêu cá nhân...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Total Spending */}
        <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-xs transition-all hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-indigo-500/5 blur-xl"></div>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
              <Wallet className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tổng chi tiêu</p>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-0.5">
                {formatCurrency(totalSpent)}
              </h3>
            </div>
          </div>
        </div>

        {/* Savings */}
        <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-xs transition-all hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-emerald-500/5 blur-xl"></div>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <PiggyBank className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Đã tiết kiệm được</p>
              <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-500 mt-0.5">
                {formatCurrency(Number(savings?.totalSavings || 0))}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Monthly spending bar chart */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-indigo-600" />
            <h4 className="font-bold text-gray-900 dark:text-gray-100">Chi tiêu theo tháng</h4>
          </div>
          {monthly.length > 0 ? (
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthly} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="month" tickLine={false} tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <YAxis tickLine={false} tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(124, 58, 237, 0.05)' }} 
                    contentStyle={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                    formatter={(value) => [formatCurrency(Number(value || 0)), "Chi tiêu"]}
                  />
                  <Bar dataKey="spent" fill="#8b5cf6" radius={[6, 6, 0, 0]} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-[250px] items-center justify-center text-sm text-gray-400">Chưa có lịch sử chi tiêu</div>
          )}
        </div>

        {/* Category spending pie chart */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-4 flex items-center gap-2">
            <PieChartIcon className="h-5 w-5 text-indigo-600" />
            <h4 className="font-bold text-gray-900 dark:text-gray-100">Phân loại chi tiêu</h4>
          </div>
          {categories.length > 0 ? (
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categories} dataKey="spent" nameKey="category" innerRadius={60} outerRadius={85} paddingAngle={3} labelLine={false}>
                    {categories.map((entry, index) => (
                      <Cell key={entry.category || index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                    formatter={(value) => [formatCurrency(Number(value || 0)), "Tổng mua"]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-[250px] items-center justify-center text-sm text-gray-400">Chưa phân loại danh mục</div>
          )}
        </div>
      </div>

      {/* Smart Recommendations Tips */}
      <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-5 dark:border-indigo-950/40 dark:bg-indigo-950/10">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-400 mt-0.5">
            <Lightbulb className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-bold text-indigo-900 dark:text-indigo-300">Gợi ý mua sắm thông minh</h4>
            <p className="text-sm text-indigo-700 dark:text-indigo-400 mt-1 leading-relaxed">
              Dựa trên dữ liệu chi tiêu, danh mục ưu tiên dự đoán cho lần mua sắm tiếp theo của bạn là <span className="font-bold text-indigo-900 dark:text-indigo-200 uppercase">{predictedNextPurchase}</span>. Nhấp vào các gợi ý sản phẩm tại trang chủ để nhận thêm nhiều ưu đãi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
