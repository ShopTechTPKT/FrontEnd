import React, { useEffect, useState } from "react";
import { fetchPricingSuggestions, fetchRevenueForecast, fetchSentiment } from "../../apis/aiApi";
import formatCurrency from "../../utils/formatCurrency";

export default function AIAnalyticsPage() {
  const [forecast, setForecast] = useState([]);
  const [sentiment, setSentiment] = useState(null);
  const [pricing, setPricing] = useState([]);

  useEffect(() => {
    const load = async () => {
      const [f, s, p] = await Promise.all([
        fetchRevenueForecast(6),
        fetchSentiment(),
        fetchPricingSuggestions(6),
      ]);
      setForecast(f?.forecast || []);
      setSentiment(s || null);
      setPricing(Array.isArray(p) ? p : []);
    };
    load();
  }, []);

  return (
    <div className="space-y-6 animate-pageIn">
      <h2 className="text-2xl font-bold text-[var(--color-text)] tracking-tight">
        AI Admin Analytics
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Stat label="Positive sentiment" value={`${sentiment?.positive || 0}%`} />
        <Stat label="Neutral sentiment" value={`${sentiment?.neutral || 0}%`} />
        <Stat label="Negative sentiment" value={`${sentiment?.negative || 0}%`} />
      </div>

      <div className="admin-card rounded-[var(--radius-lg)] p-4">
        <h3 className="font-semibold mb-3 text-[var(--color-text)]">Revenue Forecast</h3>
        <div className="space-y-2">
          {forecast.map((row) => (
            <div
              key={row.month}
              className="flex items-center justify-between text-sm text-[var(--color-text-secondary)]"
            >
              <span>{row.month}</span>
              <span className="font-semibold text-[var(--color-text)]">
                {formatCurrency(row.predictedRevenue || 0)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="admin-card rounded-[var(--radius-lg)] p-4">
        <h3 className="font-semibold mb-3 text-[var(--color-text)]">Pricing Suggestions</h3>
        <div className="space-y-2">
          {pricing.map((row) => (
            <div
              key={row.productId}
              className="text-sm border-b border-[var(--color-border)] py-2 text-[var(--color-text-secondary)]"
            >
              <p className="font-medium text-[var(--color-text)]">{row.productName}</p>
              <p>
                Current: {formatCurrency(row.currentPrice || 0)} | Suggested:{" "}
                {formatCurrency(row.suggestedPrice || 0)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="admin-card rounded-[var(--radius-lg)] p-4">
      <p className="text-xs text-[var(--color-text-muted)]">{label}</p>
      <p className="text-lg font-bold text-[var(--color-text)]">{value}</p>
    </div>
  );
}
