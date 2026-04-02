"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useState, useEffect } from "react";
import { MapPin, Search, Loader2 } from "lucide-react";

// Fix for default marker icons in Leaflet + Next.js
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface LeafletMapProps {
  lat: number;
  lng: number;
  onLocationChange?: (lat: number, lng: number) => void;
  interactive?: boolean;
}

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center]);
  return null;
}

function MapEvents({ onLocationChange }: { onLocationChange?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      if (onLocationChange) {
        onLocationChange(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

export default function LeafletMap({ lat, lng, onLocationChange, interactive = false }: LeafletMapProps) {
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Ensure map only renders on client
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Debounced search for suggestions
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.length > 2) {
        fetchSuggestions();
      } else {
        setSuggestions([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const fetchSuggestions = async () => {
    setSearching(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`);
      const data = await response.json();
      setSuggestions(data || []);
      setShowSuggestions(true);
    } catch (error) {
      console.error("Search failed", error);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectSuggestion = (newLat: string, newLng: string, displayName: string) => {
    if (onLocationChange) {
      onLocationChange(parseFloat(newLat), parseFloat(newLng));
    }
    setSearchQuery(displayName);
    setShowSuggestions(false);
  };

  if (!mounted) {
    return (
      <div className="w-full h-full bg-gray-50 flex items-center justify-center animate-pulse rounded-2xl">
        <Loader2 className="animate-spin text-gray-300" size={32} />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full group overflow-hidden rounded-2xl border border-gray-100 shadow-inner">
      {interactive && (
        <div className="absolute top-4 right-4 z-[1000] w-[300px] md:w-[320px]">
          <div className="relative group/search">
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 ${searching ? 'animate-pulse' : ''}`} size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowSuggestions(suggestions.length > 0)}
              placeholder="Search hospital or address..."
              className="w-full pl-12 pr-4 py-3.5 bg-white/95 backdrop-blur-md border border-gray-200 rounded-2xl shadow-2xl focus:outline-none focus:ring-2 focus:ring-[#C8102E]/20 text-[#002868] font-medium placeholder-gray-400 transition-all text-[13px]"
            />
            {searching && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-[#C8102E]" size={16} />}

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                {suggestions.map((item, idx) => (
                  <div 
                    key={idx}
                    onClick={() => handleSelectSuggestion(item.lat, item.lon, item.display_name)}
                    className="px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-none cursor-pointer group/item flex items-start gap-3 transition-colors"
                  >
                    <MapPin size={16} className="mt-1 text-gray-300 group-hover/item:text-[#C8102E]" />
                    <div className="flex-1">
                      <p className="text-[12px] font-bold text-[#002868] line-clamp-1">{item.display_name.split(',')[0]} (Pin to Map)</p>
                      <p className="text-[10px] text-gray-500 line-clamp-2 mt-0.5">{item.display_name}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <MapContainer 
        key={`${lat}-${lng}`}
        center={[lat, lng]} 
        zoom={13} 
        scrollWheelZoom={true}
        className="w-full h-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ChangeView center={[lat, lng]} />
        {interactive && <MapEvents onLocationChange={onLocationChange} />}
        <Marker 
          position={[lat, lng]} 
          draggable={interactive}
          eventHandlers={{
            dragend: (e) => {
              const marker = e.target;
              const position = marker.getLatLng();
              if (onLocationChange) {
                onLocationChange(position.lat, position.lng);
              }
            },
          }}
        >
          <Popup className="custom-popup">
            <div className="p-1">
              <p className="font-bold text-[#002868] text-[12px]">Hospital Location</p>
              <p className="text-gray-500 text-[10px] mt-0.5">{lat.toFixed(4)}, {lng.toFixed(4)}</p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
