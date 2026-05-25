import React, { useEffect, useRef, useState } from "react";
import axios from "axios";

export default function ShipperLiveMap({ orderId }) {
  const mapRef = useRef(null);
  const shipperMarkerRef = useRef(null);
  const [shipperCoords, setShipperCoords] = useState(null);
  const [distance, setDistance] = useState(null);

  // Mock static positions
  const customerLoc = [10.8220, 106.6310];
  const warehouseLoc = [10.8245, 106.6260];

  useEffect(() => {
    // Dynamically load Leaflet CDN
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    if (!document.getElementById("leaflet-js")) {
      const script = document.createElement("script");
      script.id = "leaflet-js";
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = initMap;
      document.body.appendChild(script);
    } else {
      initMap();
    }

    // Dynamic GPS polling helper (resilient real-time updates)
    const interval = setInterval(fetchShipperLocation, 5000);
    fetchShipperLocation();

    return () => {
      clearInterval(interval);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [orderId]);

  const fetchShipperLocation = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/shipper/orders/${orderId}/location`);
      const data = response.data;
      if (data && data.latitude) {
        const coords = [data.latitude, data.longitude];
        setShipperCoords(coords);
        
        // Calculate basic Euclidean distance in km for UI estimate
        const dist = Math.sqrt(
          Math.pow(coords[0] - customerLoc[0], 2) + 
          Math.pow(coords[1] - customerLoc[1], 2)
        ) * 111.32; // ~111.32 km per degree
        setDistance(dist.toFixed(1));

        if (mapRef.current && window.L) {
          if (!shipperMarkerRef.current) {
            // Create custom animated shipper icon
            const shipperIcon = window.L.divIcon({
              className: "custom-shipper-icon",
              html: `<div style="background-color: #4F46E5; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px #4F46E5; animation: pulse 1.5s infinite;"></div>`,
              iconSize: [14, 14],
            });
            shipperMarkerRef.current = window.L.marker(coords, { icon: shipperIcon })
              .addTo(mapRef.current)
              .bindPopup("<b>Shipper ShopPC</b><br>Đang di chuyển thực tế")
              .openPopup();
          } else {
            shipperMarkerRef.current.setLatLng(coords);
          }
        }
      }
    } catch (e) {
      console.warn("Failed to retrieve live shipper location:", e);
    }
  };

  const initMap = () => {
    if (mapRef.current || !window.L) return;

    const map = window.L.map("live-tracking-map").setView(customerLoc, 15);
    mapRef.current = map;

    // Use smooth styled openstreetmap tiles
    window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);

    // Customer Marker
    window.L.marker(customerLoc)
      .addTo(map)
      .bindPopup("<b>Nhà của bạn</b><br>Địa chỉ nhận hàng")
      .openPopup();

    // Warehouse Marker
    window.L.marker(warehouseLoc, {
      icon: window.L.divIcon({
        className: "warehouse-icon",
        html: `<div style="background-color: #10B981; width: 12px; height: 12px; border-radius: 20%; border: 2px solid white;"></div>`,
        iconSize: [12, 12],
      })
    }).addTo(map).bindPopup("<b>Kho hàng ShopPC</b>");

    // Polyline connecting Warehouse and Customer
    window.L.polyline([warehouseLoc, customerLoc], {
      color: "#10B981",
      dashArray: "5, 10",
      weight: 3,
    }).addTo(map);
  };

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
          </span>
          Bản đồ theo dõi Shipper thời gian thực
        </h2>
        {distance !== null && (
          <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
            Cách bạn {distance} km
          </span>
        )}
      </div>

      <div id="live-tracking-map" style={{ height: "300px", borderRadius: "12px", zIndex: 1 }} />

      <p className="text-xs text-gray-500 mt-3 text-center">
        💡 Vị trí Shipper tự động đồng bộ theo tọa độ GPS điện thoại mỗi 5 giây.
      </p>

      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.4); opacity: 0.7; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
