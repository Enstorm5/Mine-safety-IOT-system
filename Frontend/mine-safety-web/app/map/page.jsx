"use client";
import dynamic from "next/dynamic";

// Dynamically import the map component with no SSR
const MapComponent = dynamic(() => import("./map-component"), {
  ssr: false, // Disable server-side rendering
  loading: () => (
    <div className="w-full h-[600px] flex items-center justify-center">
      <div className="text-lg text-muted-foreground">Loading map...</div>
    </div>
  ),
});

export default function MapPage() {
  return <MapComponent />;
}
