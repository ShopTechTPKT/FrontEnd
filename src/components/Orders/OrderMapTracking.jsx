import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// A custom icon for the delivery truck
const truckIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/2769/2769339.png',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20],
});

// Helper component to center map on coordinates
const MapUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 13, {
        animate: true,
      });
    }
  }, [center, map]);
  return null;
};

const OrderMapTracking = ({ deliveryAddress, status }) => {
  const [destinationCoords, setDestinationCoords] = useState(null);
  const [driverCoords, setDriverCoords] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!deliveryAddress) {
      setIsLoading(false);
      return;
    }

    const fetchCoordinates = async () => {
      try {
        setIsLoading(true);
        // Using Nominatim API for open-source geocoding
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            deliveryAddress
          )}`
        );
        const data = await response.json();

        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);
          const destCoords = [lat, lon];
          
          setDestinationCoords(destCoords);

          // Simulate driver location based on status
          // If "Shipped" or "In Transit", put the driver slightly away from destination
          // If "Delivered", put driver on destination
          if (status === 'Delivered') {
            setDriverCoords(destCoords);
          } else {
            // Put the driver a bit south-west of the destination to simulate movement
            setDriverCoords([lat - 0.05, lon - 0.05]);
          }
        } else {
          setError('Không tìm thấy tọa độ cho địa chỉ này.');
        }
      } catch (err) {
        console.error('Lỗi lấy tọa độ bản đồ:', err);
        setError('Lỗi kết nối bản đồ.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCoordinates();
  }, [deliveryAddress, status]);

  if (isLoading) {
    return (
      <div className="w-full h-64 bg-gray-100 rounded-2xl flex items-center justify-center animate-pulse">
        <span className="text-gray-400 font-medium">Đang tải bản đồ...</span>
      </div>
    );
  }

  if (error || !destinationCoords) {
    return (
      <div className="w-full h-64 bg-gray-50 border border-gray-200 rounded-2xl flex flex-col items-center justify-center text-gray-500 p-4 text-center">
        <span className="text-3xl mb-2">🗺️</span>
        <p>{error || 'Chưa cung cấp địa chỉ giao hàng hợp lệ.'}</p>
        <p className="text-sm mt-1 opacity-70">Địa chỉ: {deliveryAddress}</p>
      </div>
    );
  }

  return (
    <div className="w-full h-80 rounded-2xl overflow-hidden shadow-inner border-2 border-gray-200 relative z-0">
      <MapContainer
        center={destinationCoords}
        zoom={13}
        style={{ width: '100%', height: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Destination Marker */}
        <Marker position={destinationCoords}>
          <Popup>
            <strong>Điểm giao hàng</strong> <br />
            {deliveryAddress}
          </Popup>
        </Marker>

        {/* Driver / Truck Marker */}
        {driverCoords && (
          <Marker position={driverCoords} icon={truckIcon}>
            <Popup>
              <strong>Vị trí Đơn hàng</strong> <br />
              Trạng thái: {status}
            </Popup>
          </Marker>
        )}

        <MapUpdater center={destinationCoords} />
      </MapContainer>
      
      {/* Overlay Status Badge */}
      <div className="absolute top-4 right-4 z-[1000] bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl shadow-md border border-gray-100 font-medium text-sm text-purple-800 flex items-center gap-2">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-600"></span>
        </span>
        Live Tracking
      </div>
    </div>
  );
};

export default OrderMapTracking;
