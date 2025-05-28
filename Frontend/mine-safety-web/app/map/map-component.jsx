"use client";
import React, { useRef, useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { db } from "@/firebase";
import { ref, onValue } from "firebase/database";

// Fix leaflet icon issues for Next.js
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x.src || markerIcon2x,
  iconUrl: markerIcon.src || markerIcon,
  shadowUrl: markerShadow.src || markerShadow,
});

// Map auto-center component
function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
}

export default function MapComponent() {
  const [coordinates, setCoordinates] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sensorsRef = ref(db, "sensors");
    const unsubscribe = onValue(sensorsRef, (snapshot) => {
      const data = snapshot.val();
      if (data?.gps) {
        setCoordinates({
          lat: data.gps.latitude,
          lng: data.gps.longitude,
          altitude: data.gps.altitude,
        });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center min-h-[600px]">
          <div className="text-lg text-muted-foreground">Loading map...</div>
        </CardContent>
      </Card>
    );
  }

  if (!coordinates) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center min-h-[600px]">
          <div className="text-lg text-muted-foreground">No GPS data available</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mine Location</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[600px] w-full relative">
          <MapContainer
            center={[coordinates.lat, coordinates.lng]}
            zoom={18}
            scrollWheelZoom={true}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[coordinates.lat, coordinates.lng]}>
              <Popup>
                <div className="text-sm">
                  <div>Latitude: {coordinates.lat.toFixed(6)}°</div>
                  <div>Longitude: {coordinates.lng.toFixed(6)}°</div>
                  <div>Altitude: {coordinates.altitude.toFixed(1)}m</div>
                </div>
              </Popup>
            </Marker>
            <MapUpdater center={[coordinates.lat, coordinates.lng]} />
          </MapContainer>
        </div>
      </CardContent>
    </Card>
  );
}
