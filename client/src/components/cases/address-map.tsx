import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface AddressMapProps {
  onLocationSelect?: (lat: number, lng: number) => void;
  initialLocation?: { lat: number; lng: number };
  className?: string;
}

export function AddressMap({ onLocationSelect, initialLocation, className = "" }: AddressMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Initialize the map
    const map = L.map(mapContainerRef.current).setView(
      initialLocation || [0, 0],
      initialLocation ? 13 : 2
    );

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Create marker if initial location is provided
    if (initialLocation) {
      markerRef.current = L.marker(initialLocation)
        .addTo(map);
    }

    // Handle click events
    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      
      // Update or create marker
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        markerRef.current = L.marker([lat, lng]).addTo(map);
      }

      // Notify parent component
      onLocationSelect?.(lat, lng);
    });

    mapRef.current = map;

    // Cleanup
    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, [initialLocation]);

  return (
    <div 
      ref={mapContainerRef} 
      className={`h-[200px] rounded-md border ${className}`}
    />
  );
} 