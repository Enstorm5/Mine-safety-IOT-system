"use client";
import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { db } from "@/firebase";
import { ref, onValue, query, orderByChild, limitToLast } from "firebase/database";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Bar, Cell,
} from "recharts";

const SENSOR_TYPES = [
  {
    key: "temperature",
    label: "Temperature",
    unit: "°C",
    min: 0,
    max: 60,
    color: "#eab308",
  },
  {
    key: "gas_analog",
    label: "Gas (CO)",
    unit: "ppm",
    min: 0,
    max: 400,
    color: "#ef4444",
  },
  {
    key: "pressure",
    label: "Pressure",
    unit: "hPa",
    min: 900,
    max: 1100,
    color: "#14b8a6",
  },
  {
    key: "vibration",
    label: "Vibration",
    unit: "m/s²",
    min: 0,
    max: 30,
    color: "#22c55e",
  },
  {
    key: "humidity",
    label: "Humidity",
    unit: "%",
    min: 0,
    max: 100,
    color: "#2b7fff",
  },
];

function analyzeData(records, key) {
  const vals = records.map(r => Number(r[key])).filter(v => !isNaN(v));
  if (!vals.length) return { min: "-", max: "-", avg: "-" };
  const sum = vals.reduce((a, b) => a + b, 0);
  return {
    min: Math.min(...vals).toFixed(2),
    max: Math.max(...vals).toFixed(2),
    avg: (sum / vals.length).toFixed(2),
  };
}

export default function HistoryPage() {
  const [history, setHistory] = React.useState([]);
  const [filter, setFilter] = React.useState("");
  
  // Initialize with empty data points
  React.useEffect(() => {
    const initialData = Array(50).fill(null).map((_, index) => ({
      id: index.toString(),      time: new Date(Date.now() - (49 - index) * 1000).toISOString(),
      temperature: 0,
      gas_analog: 0,
      pressure: 1000,
      vibration: 0, // Will show as empty bars initially
      humidity: 0
    }));
    setHistory(initialData);
  }, []);
  // Fetch live sensor data
  React.useEffect(() => {
    const sensorsRef = ref(db, "sensors");
    
    const unsub = onValue(sensorsRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;      const newReading = {
        id: Date.now().toString(),
        time: new Date().toISOString(),
        temperature: Number(data.temperature) || 0,
        gas_analog: Number(data.gas_analog) || 0,
        pressure: Number(data.pressure) || 0,
        vibration: Number(data.vibration) > 0 ? 100 : 0, // Convert to full height for visibility
        humidity: Number(data.humidity) || 0,
      };

      setHistory(prev => {
        // Keep last 50 readings for smooth visualization
        const newHistory = [...prev, newReading].slice(-50);
        return newHistory.sort((a, b) => new Date(a.time) - new Date(b.time));
      });
    });

    return () => unsub();
  }, []);

  // Filtered records
  const filtered = history.filter(r => {
    if (filter && !JSON.stringify(r).toLowerCase().includes(filter.toLowerCase())) return false;
    return true;
  });

  // Chart data
  const chartData = filtered.map(r => ({
    ...SENSOR_TYPES.reduce((acc, { key }) => ({
      ...acc, [key]: r[key] !== undefined ? Number(r[key]) : null
    }), {}),
    time: r.time ? new Date(r.time).toLocaleTimeString() : "--",
  }));

  // Analyzer
  const analyzer = SENSOR_TYPES.reduce((acc, { key }) => ({
    ...acc, [key]: analyzeData(filtered, key)
  }), {});

  return (
    <div className="w-full max-w-6xl mx-auto pt-24 pb-10 px-2">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>          <h1 className="text-3xl md:text-4xl font-bold mb-1">
            Live Sensor Data
          </h1>
          <p className="text-muted-foreground text-lg">
            Real-time monitoring of all mining sensors.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Input
            className="w-56"
            placeholder="Search records..."
            value={filter}
            onChange={e => setFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Analyzer */}
      <div className="flex flex-wrap gap-2 mb-6">
        {SENSOR_TYPES.map(({ key, label, unit }) => (
          <Badge key={key} className="font-semibold px-3 py-2 bg-muted text-primary">
            <span className="font-bold">{label}:</span>
            &nbsp;Min: {analyzer[key].min} {unit} &nbsp;|&nbsp;
            Max: {analyzer[key].max} {unit} &nbsp;|&nbsp;
            Avg: {analyzer[key].avg} {unit}
          </Badge>
        ))}
      </div>

      {/* Chart */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Sensor Data History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full h-[500px]">
            <ResponsiveContainer width="100%" height="100%">              <LineChart 
                data={chartData.slice(-50)} 
                margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis 
                  dataKey="time"
                  tick={{ fontSize: 12 }}
                />
                {/* Left Y-axis for Temperature, Gas, and Humidity */}                <YAxis 
                  yAxisId="left"
                  tick={{ fontSize: 12 }}
                  domain={[0, 100]}
                  label={{ 
                    value: 'Temperature (°C) / Gas (ppm) / Humidity (%) / Vibration', 
                    angle: -90, 
                    position: 'insideLeft' 
                  }}
                />
                {/* Right Y-axis for Pressure */}
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  domain={[900, 1100]}
                  tick={{ fontSize: 12 }}
                  label={{ 
                    value: 'Pressure (hPa)', 
                    angle: 90, 
                    position: 'insideRight' 
                  }}
                />                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '6px' }}
                  labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                  formatter={(value, name) => {
                    if (name === "Vibration") {
                      return [value > 0 ? "Active" : "Inactive", name];
                    }
                    return [
                      `${Number(value).toFixed(2)} ${SENSOR_TYPES.find(s => s.label === name)?.unit || ''}`,
                      name
                    ];
                  }}
                />
                <Legend 
                  verticalAlign="top" 
                  height={36}
                />
                {/* Temperature Line */}
                <Line
                  type="monotone"
                  dataKey="temperature"
                  stroke={SENSOR_TYPES.find(s => s.key === "temperature").color}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6 }}
                  name="Temperature"
                  yAxisId="left"
                  connectNulls
                />
                {/* Gas Line */}
                <Line
                  type="monotone"
                  dataKey="gas_analog"
                  stroke={SENSOR_TYPES.find(s => s.key === "gas_analog").color}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6 }}
                  name="Gas (CO)"
                  yAxisId="left"
                  connectNulls
                />
                {/* Pressure Line */}
                <Line
                  type="monotone"
                  dataKey="pressure"
                  stroke={SENSOR_TYPES.find(s => s.key === "pressure").color}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6 }}
                  name="Pressure"
                  yAxisId="right"
                  connectNulls
                />
                {/* Humidity Line */}
                <Line
                  type="monotone"
                  dataKey="humidity"
                  stroke={SENSOR_TYPES.find(s => s.key === "humidity").color}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6 }}
                  name="Humidity"
                  yAxisId="left"
                  connectNulls
                />                {/* Vibration Line */}
                <Line
                  type="monotone"
                  dataKey="vibration"
                  stroke={SENSOR_TYPES.find(s => s.key === "vibration").color}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6 }}
                  name="Vibration"
                  yAxisId="left"
                  connectNulls
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Data Log</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  {SENSOR_TYPES.map(t => <TableHead key={t.key}>{t.label}</TableHead>)}
                  <TableHead>Latitude</TableHead>
                  <TableHead>Longitude</TableHead>
                  <TableHead>Altitude</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.slice(-100).reverse().map((r, idx) => (
                  <TableRow key={r.id || idx}>
                    <TableCell className="font-mono">
                      {r.time ? new Date(r.time).toLocaleString() : "--"}
                    </TableCell>
                    {SENSOR_TYPES.map(t =>
                      <TableCell key={t.key}>
                        {r[t.key] !== undefined ? Number(r[t.key]).toFixed(2) : "--"}
                      </TableCell>
                    )}
                    <TableCell>{r.latitude !== undefined ? r.latitude : "--"}</TableCell>
                    <TableCell>{r.longitude !== undefined ? r.longitude : "--"}</TableCell>
                    <TableCell>{r.altitude !== undefined ? r.altitude : "--"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>      <div className="mt-4 text-sm text-muted-foreground">
        Showing real-time sensor data (last 50 readings)
      </div>
    </div>
  );
}
