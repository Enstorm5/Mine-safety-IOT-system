"use client";
import * as React from "react";
import { useState, useEffect, useRef } from "react";
import {
  Card, CardHeader, CardTitle, CardContent
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
  Thermometer, Wind, Gauge, ActivitySquare, TrendingUp, TrendingDown, AlertCircle, ChevronRight,
  DropletIcon
} from "lucide-react";
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  
} from "recharts";

// Import Firebase db and onValue
import { db } from "@/firebase";
import { ref, onValue } from "firebase/database";

// ---- Sensor config reflecting Firebase structure ----
const sensorConfigs = [
  {
    key: "temperature",
    label: "Temperature",
    unit: "°C",
    min: 0,
    max: 60,
    icon: Thermometer,
    color: "text-yellow-500",
    bar: "bg-yellow-400",
    badge: "bg-yellow-100 text-yellow-700",
    critical: v => v > 50,
  },
  {
    key: "gas",
    label: "Gas (CO)",
    unit: "ppm",
    min: 0,
    max: 400,
    icon: Wind,
    color: "text-red-500",
    bar: "bg-red-400",
    badge: "bg-red-100 text-red-700",
    critical: v => v > 15,
  },
  {
    key: "pressure",
    label: "Pressure",
    unit: "hPa",
    min: 900,
    max: 1100,
    icon: Gauge,
    color: "text-teal-500",
    bar: "bg-teal-400",
    badge: "bg-blue-100 text-blue-700",
    critical: v => v < 950 || v > 1080,
  },
  {
    key: "vibration",
    label: "Vibration",
    unit: "m/s²",
    min: 0,
    max: 30,
    icon: ActivitySquare,
    color: "text-green-500",
    bar: "bg-green-400",
    badge: "bg-green-100 text-green-700",
    critical: v => v > 0,
  },{    key: "humidity",
    label: "Humidity",
    unit: "%",
    min: 0,
    max: 100,
    icon: DropletIcon,
    color: "text-blue-500",
    bar: "bg-blue-500",
    badge: "bg-green-100 text-green-700",
    critical: v => v > 1000,
  },
  
];

const HISTORY_LENGTH = 20;

// ---- Main Component ----
export default function LiveData() {
  // States
  const [sensors, setSensors] = useState({
    temperature: 0,
    gas: 0,
    pressure: 0,
    vibration: 0,
    humidity: 0,
  });
  const [history, setHistory] = useState([]);
  const [events, setEvents] = useState([]);
  const [alert, setAlert] = useState(null);

  // Refs for calculating min/max/avg over history
  const historyRef = useRef([]);

  // Fetch live data from Firebase
  useEffect(() => {
    const sensorsRef = ref(db, "sensors");
    const unsubscribe = onValue(sensorsRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      // Parse each value as number (fallback 0)
      const newSensors = {
        temperature: Number(data.temperature) ?? 0,
        gas: Number(data.gas_analog) ?? 0,
        pressure: Number(data.pressure) ?? 0,
        vibration: Number(data.vibration) ?? 0,
        humidity: Number(data.humidity) ?? 0,
      };

      setSensors(newSensors);

      // Update history (max HISTORY_LENGTH)
      historyRef.current = [
        ...historyRef.current.slice(-HISTORY_LENGTH + 1),
        {
          time: new Date().toLocaleTimeString().slice(0, 8),
          ...newSensors,
        },
      ];
      setHistory([...historyRef.current]);
    });

    return () => unsubscribe();
  }, []);

  // Alerts & Events from history
  useEffect(() => {
    if (history.length === 0) return;
    const latest = history[history.length - 1];
    const crits = sensorConfigs.filter((c) => c.critical(latest[c.key]));
    if (crits.length) {
      const first = crits[0];
      setAlert({
        icon: AlertCircle,
        color: "bg-red-500 text-white",
        message: `${first.label} critical! Current: ${latest[first.key].toFixed(1)} ${first.unit}`,
      });
      setEvents((e) => [
        {
          type: "Critical",
          message: `${first.label} exceeded normal range.`,
          value: `${latest[first.key].toFixed(1)} ${first.unit}`,
          time: latest.time,
        },
        ...e.slice(0, 19),
      ]);
    } else {
      setAlert(null);
    }
  }, [history]);

  // Summaries for each sensor
  const sensorSummaries = sensorConfigs.map((c) => {
    const vals = history.map((h) => h[c.key]);
    const min = vals.length ? Math.min(...vals) : 0;
    const max = vals.length ? Math.max(...vals) : 0;
    const avg = vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
    const trend =
      vals.length >= 2
        ? vals[vals.length - 1] > vals[vals.length - 2]
          ? "up"
          : vals[vals.length - 1] < vals[vals.length - 2]
          ? "down"
          : "flat"
        : "flat";
    return { ...c, min, max, avg, trend, current: sensors[c.key] };
  });

  return (
    <div className="w-full max-w-7xl mx-auto pt-24 pb-10 px-2">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-1">
            Live Mining Data
          </h1>
          <p className="text-muted-foreground text-lg">
            Real-time analytics & visualization for mine safety sensors.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 mt-3 md:mt-0">
          {sensorSummaries.map((s) => (
            <Badge key={s.key} className={`${s.badge} px-4 py-2`}>
              {s.label}: <span className="mx-1 font-bold">{s.current?.toFixed(1)} {s.unit}</span>
              <span className="flex items-center">
                {s.trend === "up" ? (
                  <TrendingUp className="w-4 h-4 ml-1 text-green-500" />
                ) : s.trend === "down" ? (
                  <TrendingDown className="w-4 h-4 ml-1 text-red-500" />
                ) : (
                  <ChevronRight className="w-4 h-4 ml-1 text-gray-500" />
                )}
              </span>
            </Badge>
          ))}
        </div>
      </div>

      {/* Critical Alert Banner */}
      {alert && (
        <Card className={`mb-6 ${alert.color} border-none shadow-lg`}>
          <CardContent className="flex items-center gap-6 py-3">
            <alert.icon className="w-6 h-6" />
            <span className="font-semibold">Alert:</span>
            <span>{alert.message}</span>
          </CardContent>
        </Card>
      )}

      {/* Sensor Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        {sensorSummaries.map((sensor, idx) => {
          const Icon = sensor.icon;
          const progress =
            ((sensor.current - sensor.min) / (sensor.max - sensor.min || 1)) * 100;
          return (
            <Card
              key={idx}
              className={`border-l-8 ${sensor.bar} bg-background shadow-md flex flex-col h-full`}
            >
              <CardHeader className="pb-2 flex flex-row items-center gap-2">
                <Icon size={32} className={`${sensor.color}`} />
                <CardTitle className="text-lg font-semibold">{sensor.label}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 flex flex-col flex-1 justify-between">
                <div className="flex items-end gap-2">
                  <div className={`text-3xl font-bold ${sensor.color}`}>
                    {sensor.current?.toFixed(1)}
                  </div>
                  <span className="text-lg mb-1">{sensor.unit}</span>
                </div>
                <div className="mt-2 mb-2">
                  <Progress
                    value={progress}
                    className={`h-3 ${sensor.bar} rounded-xl`}
                  />
                </div>
                <div className="mt-7 flex flex-wrap gap-2">
                  <Badge className={`${sensor.badge}`}>
                    Min: {sensor.min?.toFixed(1)} {sensor.unit}
                  </Badge>
                  <Badge className={`${sensor.badge}`}>
                    Max: {sensor.max?.toFixed(1)} {sensor.unit}
                  </Badge>
                  <Badge className={`${sensor.badge}`}>
                    Avg: {sensor.avg?.toFixed(1)} {sensor.unit}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">        {/* Temperature Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Temperature Trend (°C)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={history}>
                <XAxis dataKey="time" hide />
                <YAxis domain={[0, 60]} />
                <CartesianGrid strokeDasharray="3 3" />
                <Legend />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="temperature"
                  stroke="#eab308"
                  strokeWidth={2}
                  dot={false}
                  name="Temperature"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pressure Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Pressure Trend (hPa)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={history}>
                <XAxis dataKey="time" hide />
                <YAxis domain={[1000, 1100]} />
                <CartesianGrid strokeDasharray="3 3" />
                <Legend />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="pressure"
                  stroke="#14b8a6"
                  strokeWidth={2}
                  dot={false}
                  name="Pressure"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        {/* Gas Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>CO Gas Level (ppm)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={history}>
                <XAxis dataKey="time" hide />
                <YAxis domain={[0, 30]} />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip />
                <Legend />
                <Area 
                  type="monotone"
                  dataKey="gas" 
                  stroke="#ef4444"
                  fill="#ef4444"
                  fillOpacity={0.2}
                  name="Gas (CO)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
                    <CardHeader>
            <CardTitle>Humidity level %</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={history}>
                <XAxis dataKey="time" hide />
                <YAxis domain={[0, 30]} />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip />
                <Legend />
                <Area 
                  type="monotone"
                  dataKey="humidity" 
                  stroke="#2b7fff"
                  fill="#2b7fff"
                  fillOpacity={0.2}
                  name="Humidity"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
          


            
          
    
        </Card>
      </div>

      {/* Recent Events/Logs */}
      <div className="mb-10">
        <Card>
          <CardHeader>
            <CardTitle>Sensor Events Log</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No recent critical events.
                    </TableCell>
                  </TableRow>
                ) : (
                  events.map((e, i) => (
                    <TableRow key={i}>
                      <TableCell>{e.type}</TableCell>
                      <TableCell>{e.message}</TableCell>
                      <TableCell>{e.value}</TableCell>
                      <TableCell>{e.time}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
