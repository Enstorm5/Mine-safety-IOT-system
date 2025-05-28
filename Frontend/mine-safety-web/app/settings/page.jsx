"use client";
import * as React from "react";
import {
  Card, CardHeader, CardTitle, CardContent, CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast, Toaster } from "sonner";

// Both warning & danger for every sensor:
const DEFAULT_THRESHOLDS = {
  gas_analog: { danger: 200, warning: 120 },
  temperature: { danger: 45, warning: 35 },
  humidity: { danger: 90, warning: 80 },
  pressure: { dangerLow: 960, warningLow: 970, warningHigh: 1050, dangerHigh: 1070 },
  vibration: { danger: 25, warning: 15 },
};

export default function Settings() {
  const [thresholds, setThresholds] = React.useState(DEFAULT_THRESHOLDS);
  const [enablePopups, setEnablePopups] = React.useState(true);

  // Load from storage (thresholds & popup switch)
  React.useEffect(() => {
    const stored = localStorage.getItem("alertThresholdsV2");
    if (stored) {
      try { setThresholds({ ...DEFAULT_THRESHOLDS, ...JSON.parse(stored) }); } catch {}
    }
    const val = localStorage.getItem("enablePopups");
    if (val === "false") setEnablePopups(false);
  }, []);

  function handleThresholdChange(sensor, level, value) {
    setThresholds((prev) => ({
      ...prev,
      [sensor]: { ...prev[sensor], [level]: Number(value) },
    }));
  }
  function handlePressureChange(level, value) {
    setThresholds((prev) => ({
      ...prev,
      pressure: { ...prev.pressure, [level]: Number(value) }
    }));
  }

  function handleSaveThresholds() {
    try {
      localStorage.setItem("alertThresholdsV2", JSON.stringify(thresholds));
      // Save popup switch as well (in case it changed)
      localStorage.setItem("enablePopups", enablePopups ? "true" : "false");
      window.dispatchEvent(new Event("thresholds-updated"));
      toast.success("Thresholds saved successfully!", { duration: 4000 });
    } catch {
      toast.error("Error saving thresholds. Try again.", { duration: 4000 });
    }
  }

  function handlePopupToggle(val) {
    setEnablePopups(val);
    localStorage.setItem("enablePopups", val ? "true" : "false");
    window.dispatchEvent(new Event("thresholds-updated")); // Let alerts page update
    toast(val ? "Popup notifications enabled" : "Popup notifications disabled", { duration: 3000 });
  }

  return (
    <div className="w-full max-w-3xl mx-auto pt-24 pb-8 px-2">
      <Toaster position="top-center" richColors closeButton />
      <h1 className="text-3xl md:text-4xl font-bold mb-4">Settings</h1>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Alert Thresholds</CardTitle>
          <CardDescription>
            Set danger and warning levels for each sensor.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>Gas (ppm) - Danger</Label>
              <Input type="number" min={0} max={500}
                value={thresholds.gas_analog.danger}
                onChange={e => handleThresholdChange("gas_analog", "danger", e.target.value)} className="mb-2" />
              <Label>Gas (ppm) - Warning</Label>
              <Input type="number" min={0} max={500}
                value={thresholds.gas_analog.warning}
                onChange={e => handleThresholdChange("gas_analog", "warning", e.target.value)} className="mb-4" />
            </div>
            <div>
              <Label>Temperature (°C) - Danger</Label>
              <Input type="number" min={-10} max={80}
                value={thresholds.temperature.danger}
                onChange={e => handleThresholdChange("temperature", "danger", e.target.value)} className="mb-2" />
              <Label>Temperature (°C) - Warning</Label>
              <Input type="number" min={-10} max={80}
                value={thresholds.temperature.warning}
                onChange={e => handleThresholdChange("temperature", "warning", e.target.value)} className="mb-4" />
            </div>
            <div>
              <Label>Humidity (%) - Danger</Label>
              <Input type="number" min={0} max={100}
                value={thresholds.humidity.danger}
                onChange={e => handleThresholdChange("humidity", "danger", e.target.value)} className="mb-2" />
              <Label>Humidity (%) - Warning</Label>
              <Input type="number" min={0} max={100}
                value={thresholds.humidity.warning}
                onChange={e => handleThresholdChange("humidity", "warning", e.target.value)} className="mb-4" />
            </div>
            <div>
              <Label>Vibration (m/s²) - Danger</Label>
              <Input type="number" min={0} max={50}
                value={thresholds.vibration.danger}
                onChange={e => handleThresholdChange("vibration", "danger", e.target.value)} className="mb-2" />
              <Label>Vibration (m/s²) - Warning</Label>
              <Input type="number" min={0} max={50}
                value={thresholds.vibration.warning}
                onChange={e => handleThresholdChange("vibration", "warning", e.target.value)} className="mb-4" />
            </div>
            <div>
              <Label>Pressure Danger Low (hPa)</Label>
              <Input type="number" min={800} max={1100}
                value={thresholds.pressure.dangerLow}
                onChange={e => handlePressureChange("dangerLow", e.target.value)} className="mb-2" />
              <Label>Pressure Warning Low (hPa)</Label>
              <Input type="number" min={800} max={1100}
                value={thresholds.pressure.warningLow}
                onChange={e => handlePressureChange("warningLow", e.target.value)} className="mb-4" />
            </div>
            <div>
              <Label>Pressure Warning High (hPa)</Label>
              <Input type="number" min={800} max={1200}
                value={thresholds.pressure.warningHigh}
                onChange={e => handlePressureChange("warningHigh", e.target.value)} className="mb-2" />
              <Label>Pressure Danger High (hPa)</Label>
              <Input type="number" min={800} max={1200}
                value={thresholds.pressure.dangerHigh}
                onChange={e => handlePressureChange("dangerHigh", e.target.value)} className="mb-4" />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-6">
            <Button onClick={handleSaveThresholds} className="w-fit">
              Save Thresholds
            </Button>
            <div className="flex items-center gap-2">
              <Switch
                checked={enablePopups}
                onCheckedChange={handlePopupToggle}
                id="enablePopups"
              />
              <Label htmlFor="enablePopups">Enable Popup Notifications</Label>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
