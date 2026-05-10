'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';

// Fix for default marker icons in Leaflet with Next.js
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const OfficeIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapDomisiliProps {
  pegawai: Array<{
    id: string;
    nama: string;
    lat: number;
    lng: number;
  }>;
  officeCoord: [number, number];
}

// Haversine distance formula
const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export default function MapDomisili({ pegawai, officeCoord }: MapDomisiliProps) {
  const [nearest, setNearest] = useState<any>(null);

  useEffect(() => {
    if (pegawai.length > 0) {
      let minDistance = Infinity;
      let nearestPegawai = null;

      pegawai.forEach((p) => {
        const d = getDistance(officeCoord[0], officeCoord[1], p.lat, p.lng);
        if (d < minDistance) {
          minDistance = d;
          nearestPegawai = { ...p, distance: d };
        }
      });

      setNearest(nearestPegawai);
    }
  }, [pegawai, officeCoord]);

  return (
    <div>
      {nearest && (
        <div className="alert alert-info py-2 small mb-3">
          <i className="bi bi-info-circle me-2"></i>
          Pegawai terdekat dari kantor: <strong>{nearest.nama}</strong> ({nearest.distance.toFixed(2)} km)
        </div>
      )}
      <div style={{ height: '400px', width: '100%', borderRadius: '8px', overflow: 'hidden' }}>
        <MapContainer 
          center={officeCoord} 
          zoom={13} 
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          <Marker position={officeCoord} icon={OfficeIcon}>
            <Popup>Kantor Utama</Popup>
          </Marker>

          {pegawai.map((p) => (
            <Marker key={p.id} position={[p.lat, p.lng]}>
              <Popup>{p.nama}</Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
