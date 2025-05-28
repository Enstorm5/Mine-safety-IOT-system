"use client";
import * as React from "react";
import {
  Card, CardHeader, CardTitle, CardContent
} from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toaster, toast } from "sonner";
import { AlertTriangle, AlertCircle, Info, Download } from "lucide-react";
import { db } from "@/firebase";
import { ref, onValue } from "firebase/database";

// Sensor configs
const SENSOR_CONFIG = [
  { key: "gas_analog", label: "Gas", unit: "ppm" },
  { key: "temperature", label: "Temperature", unit: "°C" },
  { key: "humidity", label: "Humidity", unit: "%" },
  { key: "pressure", label: "Pressure", unit: "hPa" },
  { key: "vibration", label: "Vibration", unit: "m/s²" }
];

// --- Severity Logic
function getSeverity(sensor, value, thresholds) {
  switch(sensor) {
    case "gas_analog":
      if (value >= thresholds.gas_analog.danger) return "Danger";
      if (value >= thresholds.gas_analog.warning) return "Warning";
      return "Info";
    case "temperature":
      if (value >= thresholds.temperature.danger) return "Danger";
      if (value >= thresholds.temperature.warning) return "Warning";
      return "Info";
    case "humidity":
      if (value >= thresholds.humidity.danger) return "Danger";
      if (value >= thresholds.humidity.warning) return "Warning";
      return "Info";
    case "pressure":
      if (value <= thresholds.pressure.dangerLow || value >= thresholds.pressure.dangerHigh) return "Danger";
      if (value <= thresholds.pressure.warningLow || value >= thresholds.pressure.warningHigh) return "Warning";
      return "Info";
    case "vibration":
      if (value >= thresholds.vibration.danger) return "Danger";
      if (value >= thresholds.vibration.warning) return "Warning";
      return "Info";
    default:
      return "Info";
  }
}

function getSensorLabel(key) {
  const s = SENSOR_CONFIG.find(x => x.key === key);
  return s ? s.label : key;
}

function getSensorUnit(key) {
  const s = SENSOR_CONFIG.find(x => x.key === key);
  return s ? s.unit : "";
}

function SeverityBadge({ severity }) {
  if (severity === "Danger")
    return (
      <Badge className="bg-red-600/90 text-white dark:bg-red-700/80 dark:text-white font-semibold gap-1 px-2 py-1">
        <AlertCircle size={16} /> Danger
      </Badge>
    );
  if (severity === "Warning")
    return (
      <Badge className="bg-yellow-500/90 text-black dark:bg-yellow-600/80 dark:text-black font-semibold gap-1 px-2 py-1">
        <AlertTriangle size={16} /> Warning
      </Badge>
    );
  return (
    <Badge className="bg-blue-500/90 text-white dark:bg-blue-700/80 dark:text-white font-semibold gap-1 px-2 py-1">
      <Info size={16} /> Info
    </Badge>
  );
}

export default function Alerts() {
  const [thresholds, setThresholds] = React.useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("alertThresholdsV2");
      if (saved) return JSON.parse(saved);
    }
    return {
      gas_analog: { danger: 200, warning: 120 },
      temperature: { danger: 45, warning: 35 },
      humidity: { danger: 90, warning: 80 },
      pressure: { dangerLow: 960, warningLow: 970, warningHigh: 1050, dangerHigh: 1070 },
      vibration: { danger: 25, warning: 15 },
    };
  });

  const [enablePopups, setEnablePopups] = React.useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("enablePopups") !== "false";
    }
    return true;
  });

  React.useEffect(() => {
    function updateFromStorage() {
      if (typeof window === "undefined") return;
      const val = localStorage.getItem("alertThresholdsV2");
      if (val) setThresholds(JSON.parse(val));
      setEnablePopups(localStorage.getItem("enablePopups") !== "false");
    }
    window.addEventListener("thresholds-updated", updateFromStorage);
    return () => window.removeEventListener("thresholds-updated", updateFromStorage);
  }, []);

  const [alerts, setAlerts] = React.useState([]);
  const [filter, setFilter] = React.useState("");
  const [show, setShow] = React.useState("All");
  const [sensorType, setSensorType] = React.useState("All");
  const [lastToastMap, setLastToastMap] = React.useState({});

  React.useEffect(() => {
    const sensorsRef = ref(db, "sensors");
    const unsub = onValue(sensorsRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return setAlerts([]);
      const now = Date.now();
      let events = [];
      let newLastToastMap = { ...lastToastMap };

      SENSOR_CONFIG.forEach(({ key }) => {
        if (!(key in data)) return;
        const value = Number(data[key]);
        const severity = getSeverity(key, value, thresholds);
        const alertId = `${key}-${severity}`;
        if (
          enablePopups &&
          (severity === "Danger" || severity === "Warning") &&
          (newLastToastMap[alertId] == null || now - newLastToastMap[alertId] > 12000)
        ) {
          const msg =
            severity === "Danger"
              ? `${getSensorLabel(key)} Danger: ${value} ${getSensorUnit(key)} - Critical level!`
              : `${getSensorLabel(key)} Warning: ${value} ${getSensorUnit(key)} - Warning zone!`;
          severity === "Danger"
            ? toast.error(msg, { duration: 5000 })
            : toast.warning(msg, { duration: 5000 });
          newLastToastMap[alertId] = now;
        }
        events.push({
          id: `${key}-${now}`,
          type: getSensorLabel(key),
          value: `${value} ${getSensorUnit(key)}`,
          severity,
          time: new Date().toLocaleString(),
          description:
            severity === "Danger"
              ? `Critical ${getSensorLabel(key)} value!`
              : severity === "Warning"
              ? `Unusual ${getSensorLabel(key)} detected.`
              : `Normal ${getSensorLabel(key)} level.`,
        });
      });

      setAlerts(events);
      setLastToastMap(newLastToastMap);
    });
    return () => unsub();
  }, [thresholds, enablePopups]);

  const filteredAlerts = alerts.filter((a) => {
    if (sensorType !== "All" && a.type !== sensorType) return false;
    if (show !== "All" && a.severity !== show) return false;
    if (
      filter &&
      !(
        a.type.toLowerCase().includes(filter.toLowerCase()) ||
        a.value.toLowerCase().includes(filter.toLowerCase()) ||
        a.description.toLowerCase().includes(filter.toLowerCase())
      )
    ) return false;
    return true;
  });

  const downloadCSV = () => {
    const header = "Time,Type,Value,Severity,Description\n";
    const rows = filteredAlerts
      .map((a) =>
        [
          a.time || "",
          a.type || "",
          a.value || "",
          a.severity || "",
          a.description || "",
        ]
          .map((s) => `"${s}"`)
          .join(",")
      )
      .join("\n");
    const csv = header + rows;
    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.download = "alerts.csv";
    link.href = URL.createObjectURL(blob);
    link.click();
  };

  const counts = {
    Danger: alerts.filter((a) => a.severity === "Danger").length,
    Warning: alerts.filter((a) => a.severity === "Warning").length,
    Info: alerts.filter((a) => a.severity === "Info").length,
  };

  return (
    <div className="w-full max-w-4xl mx-auto pt-24 pb-8 px-2">
      <Toaster position="top-center" richColors closeButton />
      <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-1">Alerts & Incidents</h1>
          <p className="text-muted-foreground text-lg">
            Live safety events from current sensor readings.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Badge className="bg-red-600/90 text-white dark:bg-red-700/80 dark:text-white font-semibold px-3">
            Danger: {counts.Danger}
          </Badge>
          <Badge className="bg-yellow-500/90 text-black dark:bg-yellow-600/80 dark:text-black font-semibold px-3">
            Warning: {counts.Warning}
          </Badge>
          <Badge className="bg-blue-500/90 text-white dark:bg-blue-700/80 dark:text-white font-semibold px-3">
            Info: {counts.Info}
          </Badge>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="mb-6">
        <CardContent className="flex flex-col md:flex-row md:items-center gap-4 pt-4">
          <div className="flex gap-2">
            <Button variant={show === "All" ? "default" : "outline"} onClick={() => setShow("All")}>All</Button>
            <Button variant={show === "Danger" ? "default" : "outline"} className="text-red-600 dark:text-red-500 border-red-400" onClick={() => setShow("Danger")}>Danger</Button>
            <Button variant={show === "Warning" ? "default" : "outline"} className="text-yellow-800 dark:text-yellow-400 border-yellow-400" onClick={() => setShow("Warning")}>Warning</Button>
            <Button variant={show === "Info" ? "default" : "outline"} className="text-blue-800 dark:text-blue-400 border-blue-400" onClick={() => setShow("Info")}>Info</Button>
          </div>
          <select className="md:w-36 p-2 border rounded-md bg-background" value={sensorType} onChange={e => setSensorType(e.target.value)}>
            <option value="All">All Parameters</option>
            {SENSOR_CONFIG.map(s => (<option key={s.key} value={s.label}>{s.label}</option>))}
          </select>
          <Input className="md:w-56" placeholder="Search value/desc..." value={filter} onChange={e => setFilter(e.target.value)} />
          <Button variant="outline" onClick={downloadCSV} className="ml-auto flex items-center gap-1">
            <Download size={16} />
            Export CSV
          </Button>
        </CardContent>
      </Card>

      {/* Alerts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Current Sensor Alerts</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAlerts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No alerts found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAlerts.map(alert => (
                    <TableRow
                      key={alert.id}
                      className={
                        alert.severity === "Danger"
                          ? "bg-red-700/20 dark:bg-red-700/50"
                          : alert.severity === "Warning"
                          ? "bg-yellow-500/10 dark:bg-yellow-700/30"
                          : ""
                      }
                    >
                      <TableCell className="font-mono">{alert.time}</TableCell>
                      <TableCell>{alert.type}</TableCell>
                      <TableCell>{alert.value}</TableCell>
                      <TableCell><SeverityBadge severity={alert.severity} /></TableCell>
                      <TableCell>{alert.description}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      <div className="mt-3 flex justify-between items-center text-sm text-muted-foreground">
        <span>
          Showing <b>{filteredAlerts.length}</b> of <b>{alerts.length}</b> parameters.{" "}
          <a href="/history" className="underline text-blue-700 dark:text-blue-400 hover:text-blue-900">See history</a>.
        </span>
        <span>Last updated: {new Date().toLocaleString()}</span>
      </div>
    </div>
  );
}
