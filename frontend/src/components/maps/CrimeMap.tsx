import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Shield, Layers, Activity } from 'lucide-react';

// Custom Map Markers
const customStationIcon = new L.DivIcon({
  className: 'custom-station-icon',
  html: `<div style="background-color:#F59E0B; width:14px; height:14px; border-radius:50%; border:2px solid #FFFFFF; box-shadow:0 0 10px #F59E0B;"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7]
});

const customCrimeIcon = new L.DivIcon({
  className: 'custom-crime-icon',
  html: `<div style="background-color:#EF4444; width:10px; height:10px; border-radius:50%; border:1.5px solid #FFFFFF; box-shadow:0 0 8px #EF4444;"></div>`,
  iconSize: [10, 10],
  iconAnchor: [5, 5]
});

export const CrimeMap: React.FC = () => {
  const karnatakaCenter: [number, number] = [12.9716, 77.5946]; // Bengaluru

  const stationsData = [
    { id: 'STN_PEENYA', name: 'Peenya Police Station', lat: 13.0285, lng: 77.5197, district: 'Bengaluru City', activeCases: 42 },
    { id: 'STN_KAMAKSHIPALYA', name: 'Kamakshipalya PS', lat: 12.9812, lng: 77.5284, district: 'Bengaluru City', activeCases: 38 },
    { id: 'STN_MYS_LASHKAR', name: 'Lashkar PS (Mysuru)', lat: 12.3118, lng: 76.6522, district: 'Mysuru City', activeCases: 29 },
    { id: 'STN_MANG_CENTRAL', name: 'Central PS (Mangaluru)', lat: 12.8702, lng: 74.8810, district: 'Mangaluru City', activeCases: 24 }
  ];

  const crimeHotspots = [
    { id: 'FIR_0001', fir_no: 'FIR-PEE-2025-0001', title: 'Peenya Serial Burglary', lat: 13.0290, lng: 77.5200, category: 'BURGLARY' },
    { id: 'FIR_0002', fir_no: 'FIR-PEE-2025-0002', title: 'Vehicle Theft Ring', lat: 13.0310, lng: 77.5180, category: 'VEHICLE_THEFT' },
    { id: 'FIR_0003', fir_no: 'FIR-MYS-2025-0012', title: 'Lashkar Chain Snatching', lat: 12.3125, lng: 76.6540, category: 'ROBBERY' },
    { id: 'FIR_0004', fir_no: 'FIR-MAN-2025-0008', title: 'Mangaluru Cyber UPI Fraud', lat: 12.8715, lng: 74.8830, category: 'CYBER_FRAUD' }
  ];

  return (
    <div className="w-full h-full flex flex-col glass-panel border border-police-border/80 rounded-2xl overflow-hidden relative select-none font-mono text-xs shadow-2xl">
      {/* Map Action Header */}
      <div className="p-3 bg-police-dark/95 border-b border-police-border flex items-center justify-between z-10">
        <div className="flex items-center gap-2 text-police-highlight">
          <Layers className="w-4 h-4" />
          <span className="font-bold uppercase tracking-wider text-xs">ARCGIS SPATIAL CRIME HOTSPOT GIS MAP</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-police-muted">
          <Activity className="w-3.5 h-3.5 text-police-success animate-pulse" />
          <span>REAL-TIME HOTSPOT CLUSTERING ACTIVE</span>
        </div>
      </div>

      {/* Leaflet Map Canvas */}
      <div className="flex-1 w-full bg-[#030712] relative z-0">
        <MapContainer
          center={karnatakaCenter}
          zoom={10}
          style={{ height: '100%', width: '100%', backgroundColor: '#030712' }}
          zoomControl={false}
        >
          {/* Dark Tactical CartoDB Tiles */}
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; KSP GIS'
          />

          {/* Station Markers & Coverage Radius */}
          {stationsData.map(stn => (
            <React.Fragment key={stn.id}>
              <Circle
                center={[stn.lat, stn.lng]}
                radius={2500}
                pathOptions={{ color: '#F59E0B', fillColor: '#F59E0B', fillOpacity: 0.1, weight: 1.5 }}
              />
              <Marker position={[stn.lat, stn.lng]} icon={customStationIcon}>
                <Popup className="dark-popup font-mono text-xs">
                  <div className="p-1 space-y-1">
                    <div className="font-bold text-amber-400">{stn.name}</div>
                    <div className="text-[10px] text-slate-300">Jurisdiction: {stn.district}</div>
                    <div className="text-[10px] text-emerald-400 font-bold">Active Cases: {stn.activeCases}</div>
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          ))}

          {/* Crime Hotspot Markers */}
          {crimeHotspots.map(crime => (
            <Marker key={crime.id} position={[crime.lat, crime.lng]} icon={customCrimeIcon}>
              <Popup className="dark-popup font-mono text-xs">
                <div className="p-1 space-y-1">
                  <div className="font-bold text-rose-400">{crime.fir_no}</div>
                  <div className="text-[10px] text-slate-200">{crime.title}</div>
                  <div className="text-[9px] px-1.5 py-0.5 bg-rose-950 text-rose-300 rounded font-bold">{crime.category}</div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Map Telemetry Footer */}
      <div className="p-2 bg-police-dark/95 border-t border-police-border flex items-center justify-between text-[10px] text-police-muted">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Police Station Hub</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Crime Hotspot</span>
        </div>
        <div>KARNATAKA STATE POLICE GIS NETWORK</div>
      </div>
    </div>
  );
};
