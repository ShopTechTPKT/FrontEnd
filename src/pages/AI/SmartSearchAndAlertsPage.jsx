import React, { useEffect, useMemo, useState } from "react";
import { createPriceAlert, fetchTrendingKeywords, fetchUserPriceAlerts } from "../../apis/aiApi";
import getCurrentUserId from "../../utils/getCurrentUserId";

export default function SmartSearchAndAlertsPage() {
  const [keywords, setKeywords] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [productId, setProductId] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const userId = useMemo(() => getCurrentUserId() || 0, []);

  const load = async () => {
    const [k, a] = await Promise.all([
      fetchTrendingKeywords(),
      userId ? fetchUserPriceAlerts(userId) : Promise.resolve([]),
    ]);
    setKeywords(Array.isArray(k) ? k : []);
    setAlerts(Array.isArray(a) ? a : []);
  };

  useEffect(() => {
    load();
  }, [userId]);

  const submitAlert = async () => {
    if (!userId || !productId || !targetPrice) return;
    await createPriceAlert({
      userId,
      productId: Number(productId),
      targetPrice: Number(targetPrice),
      channel: "IN_APP",
    });
    setProductId("");
    setTargetPrice("");
    load();
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Smart Search & Price Alerts</h1>

      <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <h2 className="font-semibold mb-3">Trending Search Keywords</h2>
        <div className="flex flex-wrap gap-2">
          {keywords.map((k) => (
            <span key={`${k.id}-${k.keyword}`} className="px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-sm">
              {k.keyword}
            </span>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
        <h2 className="font-semibold">Create Price Alert</h2>
        <div className="flex flex-wrap gap-3">
          <input value={productId} onChange={(e) => setProductId(e.target.value)} placeholder="Product ID" className="px-3 py-2 border rounded-lg dark:bg-gray-900" />
          <input value={targetPrice} onChange={(e) => setTargetPrice(e.target.value)} placeholder="Target price" className="px-3 py-2 border rounded-lg dark:bg-gray-900" />
          <button onClick={submitAlert} className="px-3 py-2 rounded-lg bg-violet-600 text-white">Set Alert</button>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <h2 className="font-semibold mb-3">My Alerts</h2>
        <div className="space-y-2">
          {alerts.map((a) => (
            <div key={a.id} className="text-sm border-b border-gray-100 dark:border-gray-700 py-2">
              Product #{a.productId} - target {Number(a.targetPrice || 0).toLocaleString("vi-VN")} VND ({a.status})
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
