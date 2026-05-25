import React, { useEffect, useState } from "react";
import { createShippingZone, fetchShippingLabel, fetchShippingZones, fetchTracking } from "../../apis/logisticsApi";

export default function ShippingSettingsPage() {
  const [zones, setZones] = useState([]);
  const [zoneName, setZoneName] = useState("");
  const [fee, setFee] = useState("");
  const [orderId, setOrderId] = useState("");
  const [tracking, setTracking] = useState(null);
  const [label, setLabel] = useState(null);

  const loadZones = async () => {
    const data = await fetchShippingZones();
    setZones(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    loadZones();
  }, []);

  const addZone = async () => {
    if (!zoneName || !fee) return;
    await createShippingZone({ zoneName, fee: Number(fee) });
    setZoneName("");
    setFee("");
    loadZones();
  };

  const loadTracking = async () => {
    if (!orderId) return;
    const [trackingData, labelData] = await Promise.all([
      fetchTracking(orderId),
      fetchShippingLabel(orderId),
    ]);
    setTracking(trackingData);
    setLabel(labelData);
  };

  return (
    <div className="space-y-6 animate-pageIn max-w-4xl">
      <h2 className="text-2xl font-bold text-[var(--color-text)] tracking-tight">
        Shipping Settings
      </h2>
      <div className="admin-card rounded-[var(--radius-lg)] p-5 space-y-4">
        <h3 className="font-semibold text-[var(--color-text)]">Shipping Zones</h3>
        <div className="flex gap-3 flex-wrap">
          <input
            value={zoneName}
            onChange={(e) => setZoneName(e.target.value)}
            placeholder="Zone name"
            className="admin-input"
          />
          <input
            value={fee}
            onChange={(e) => setFee(e.target.value)}
            placeholder="Fee"
            className="admin-input"
          />
          <button type="button" onClick={addZone} className="btn-admin-primary">
            Add Zone
          </button>
        </div>
        {zones.map((z) => (
          <div
            key={z.id}
            className="text-sm border-b border-[var(--color-border)] py-2 text-[var(--color-text-secondary)]"
          >
            {z.zoneName} - {Number(z.fee || 0).toLocaleString("vi-VN")} VND
          </div>
        ))}
      </div>

      <div className="admin-card rounded-[var(--radius-lg)] p-5 space-y-4">
        <h3 className="font-semibold text-[var(--color-text)]">
          Order Tracking & Label
        </h3>
        <div className="flex gap-3">
          <input
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="Order ID"
            className="admin-input"
          />
          <button type="button" onClick={loadTracking} className="btn-admin-primary">
            Load
          </button>
        </div>
        {tracking && (
          <div className="text-sm space-y-1 text-[var(--color-text-secondary)]">
            <p className="font-medium text-[var(--color-text)]">
              {tracking.carrier} - {tracking.trackingCode}
            </p>
            {(tracking.timeline || []).map((t, idx) => (
              <p key={idx}>
                {t.status} - {t.time}
              </p>
            ))}
          </div>
        )}
        {label && (
          <p className="text-sm text-[var(--color-text-secondary)]">
            Label: {label.labelUrl}
          </p>
        )}
      </div>
    </div>
  );
}
