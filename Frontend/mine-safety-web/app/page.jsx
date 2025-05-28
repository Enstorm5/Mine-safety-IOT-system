"use client";
import * as React from "react";
import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  MapPin,
  Thermometer,
  Droplets,
  Wind,
  Activity,
  TrendingUp,
  Waves,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { db } from "@/firebase"; // adjust path if needed
import { ref, onValue } from "firebase/database";

const getEmptyHistory = () =>
  Array(20)
    .fill(null)
    .map((_, i) => ({
      time: `${i}`,
      gas: 0,
      temperature: 0,
      humidity: 0,
      pressure: 0,
      vibration: 0,
      altitude: 0,
    }));

export default function HomePage() {
  const [sensors, setSensors] = useState({
    gas: 0,
    temperature: 0,
    humidity: 0,
    pressure: 0,
    vibration: 0,
    altitude: 0,
    location: { lat: 0, lon: 0, altitude: 0 },
  });
  const [history, setHistory] = useState(getEmptyHistory());

  useEffect(() => {
    const sensorsRef = ref(db, "sensors");
    const unsubscribe = onValue(sensorsRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      const newSensors = {
        gas: Number(data.gas_analog) ?? 0,
        temperature: Number(data.temperature) ?? 0,
        humidity: Number(data.humidity) ?? 0,
        pressure: Number(data.pressure) ?? 0,
        vibration: Number(data.vibration) ?? 0,
        altitude: data.gps && data.gps.altitude ? Number(data.gps.altitude) : 0,
        location: data.gps
          ? {
              lat: Number(data.gps.latitude) ?? 0,
              lon: Number(data.gps.longitude) ?? 0,
              altitude: Number(data.gps.altitude) ?? 0,
            }
          : { lat: 0, lon: 0, altitude: 0 },
      };

      setSensors(newSensors);

      setHistory((prev) => [
        ...prev.slice(1),
        {
          time: new Date().toLocaleTimeString().slice(0, 8),
          gas: newSensors.gas,
          temperature: newSensors.temperature,
          humidity: newSensors.humidity,
          pressure: newSensors.pressure,
          vibration: newSensors.vibration,
          altitude: newSensors.altitude,
        },
      ]);
    });

    return () => unsubscribe();
  }, []);

  const sensorConfigs = [
    {
      label: "Gas (CO)",
      value: sensors.gas,
      unit: "ppm",
      min: 0,
      max: 400,
      icon: Waves,
      bar: "bg-red-400",
      color: "text-red-500",
    },
    {
      label: "Temperature",
      value: sensors.temperature,
      unit: "°C",
      min: 0,
      max: 60,
      icon: Thermometer,
      bar: "bg-yellow-400",
      color: "text-yellow-500",
    },
    {
      label: "Humidity",
      value: sensors.humidity,
      unit: "%",
      min: 0,
      max: 100,
      icon: Droplets,
      bar: "bg-blue-400",
      color: "text-blue-500",
    },
    {
      label: "Pressure",
      value: sensors.pressure,
      unit: "hPa",
      min: 900,
      max: 1100,
      icon: Wind,
      bar: "bg-teal-400",
      color: "text-teal-500",
    },
    {
      label: "Vibration",
      value: sensors.vibration,
      unit: "m/s²",
      min: 0,
      max: 1,
      icon: Activity,
      bar: "bg-green-400",
      color: "text-green-500",
    },
    {
      label: "Altitude",
      value: sensors.altitude,
      unit: "m",
      min: 0,
      max: 500,
      icon: TrendingUp,
      bar: "bg-purple-400",
      color: "text-purple-500",
    },
  ];

  return (
    <div className="bg-background min-h-screen pb-16">
      {/* HEADER */}
      <div className="pt-24 px-4 max-w-7xl mx-auto w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-1">
            Mining Safety Dashboard
          </h1>
          <p className="text-muted-foreground text-lg">
            Real-time monitoring and alerts for mining operations.
          </p>
        </div>

        {/* SENSOR GRID */}
        <section>
          <h2 className="text-xl font-semibold mb-4 text-left pl-1">
            Live Sensor Overview
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
            {sensorConfigs.map((sensor, idx) => {
              const Icon = sensor.icon;
              const progress =
                ((sensor.value - sensor.min) / (sensor.max - sensor.min)) * 100;
              return (
                <Card
                  key={idx}
                  className={`flex flex-col h-full border-l-8 ${sensor.bar} bg-background shadow-md`}
                >
                  <CardHeader className="pb-2 flex flex-row items-center gap-2">
                    <Icon size={32} className={sensor.color} />
                    <CardTitle className="text-lg font-semibold">
                      {sensor.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col flex-1 justify-between pt-0">
                    <div className={`text-2xl font-bold ${sensor.color}`}>
                      {sensor.label === "Vibration" 
                        ? (sensor.value === 1 ? "Vibration Detected" : "No Vibration")
                        : (sensor.value !== undefined && !isNaN(sensor.value)
                          ? sensor.value.toFixed(1)
                          : "--")}
                      {sensor.label !== "Vibration" && <span className="text-base"> {sensor.unit}</span>}
                    </div>
                    <div className="mt-4 mb-2">
                      <Progress value={progress} className="h-3 rounded-xl" />
                    </div>
                    <Badge className="mt-2">
                      Sensor max:–{sensor.max} {sensor.unit}
                    </Badge>
                    <Badge className="mt-2">
                      Sensor min:–{sensor.min} {sensor.unit}
                    </Badge>
                  </CardContent>
                </Card>
              );
            })}            {/* LOCATION CARD always last */}
            <Card className="flex flex-col h-full border-l-8 border-indigo-400 bg-background shadow-md">
              <CardHeader className="pb-2 flex flex-row items-center gap-2">
                <MapPin size={32} className="text-indigo-500" />
                <CardTitle className="text-lg font-semibold">Location</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col flex-1 justify-between pt-0">
                <div className="text-xl font-bold mb-1">
                  Lat: {sensors.location.lat?.toFixed(5)}, Lon:{" "}
                  {sensors.location.lon?.toFixed(5)}
                </div>
                <div className="text-base mb-2">
                  Altitude: {sensors.location.altitude?.toFixed(2)} m
                </div>
                <Badge className="mt-2 bg-indigo-100 text-indigo-700">
                  Live GPS
                </Badge>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CHARTS */}
        <section>
          <h2 className="text-xl font-semibold mb-4 text-left pl-1">
            Sensor Trends
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Gas Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Gas (CO) ppm</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={history}>
                    <XAxis dataKey="time" hide />
                    <YAxis domain={[0, 400]} />
                    <CartesianGrid strokeDasharray="3 3" />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="gas"
                      stroke="#ef4444"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            {/* Temperature Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Temperature (°C)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={history}>
                    <XAxis dataKey="time" hide />
                    <YAxis domain={[0, 60]} />
                    <CartesianGrid strokeDasharray="3 3" />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="temperature"
                      stroke="#f59e42"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}
