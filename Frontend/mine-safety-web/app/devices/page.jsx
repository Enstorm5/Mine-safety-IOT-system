"use client";
import * as React from "react";
import {
  Card, CardHeader, CardTitle, CardContent
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { CheckCircle, XCircle, Eye, Trash2, Plus } from "lucide-react";

// Sample device data (replace with Firebase fetch if available)
const devices = [
  {
    id: "Device 1",
    status: "Online",
    location: "Zone 1",
    lastActive: "2025-05-24 09:01 AM",
    sensors: { Temperature: "32°C", Gas: "90ppm", Pressure: "1008hPa", Vibration: "Normal" },
  },
  {
    id: "Device 2",
    status: "Offline",
    location: "Zone 3",
    lastActive: "2025-05-24 08:57 AM",
    sensors: { Temperature: "33°C", Gas: "180ppm", Pressure: "1009hPa", Vibration: "High" },
  },
  {
    id: "Device 3",
    status: "Online",
    location: "Zone 4",
    lastActive: "2025-05-24 09:00 AM",
    sensors: { Temperature: "31°C", Gas: "120ppm", Pressure: "1007hPa", Vibration: "Normal" },
  },
];

function StatusChip({ status }) {
  return status === "Online" ? (
    <Badge className="bg-green-100 text-green-700 border border-green-300 gap-1 font-semibold px-2 py-1">
      <CheckCircle size={16} /> Online
    </Badge>
  ) : (
    <Badge className="bg-red-100 text-red-700 border border-red-300 gap-1 font-semibold px-2 py-1">
      <XCircle size={16} /> Offline
    </Badge>
  );
}

export default function DevicesPage() {
  const [filter, setFilter] = React.useState("");
  const filteredDevices = devices.filter(
    d =>
      d.id.toLowerCase().includes(filter.toLowerCase()) ||
      d.location.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="w-full max-w-6xl mx-auto pt-24 pb-10 px-2">
      {/* Header and Add Button */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-1">Devices Management</h1>
          <p className="text-muted-foreground text-lg">Monitor, manage, and analyze all connected mining devices.</p>
        </div>
        <Button variant="success" className="font-bold gap-1 px-4 py-2">
          <Plus size={18} /> Add New Device
        </Button>
      </div>

      {/* Filter Bar */}
      <Card className="mb-6">
        <CardContent className="flex flex-col md:flex-row gap-4 pt-4">
          <Input
            className="md:w-56"
            placeholder="Search by device ID or location..."
            value={filter}
            onChange={e => setFilter(e.target.value)}
          />
          <span className="ml-auto text-sm text-muted-foreground">
            {filteredDevices.length} device{filteredDevices.length !== 1 ? "s" : ""} shown
          </span>
        </CardContent>
      </Card>

      {/* Devices Table */}
      <Card>
        <CardHeader>
          <CardTitle>Devices Overview</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Device ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead>Current Sensors</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDevices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No devices found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDevices.map(device => (
                    <TableRow key={device.id}>
                      <TableCell className="font-semibold">{device.id}</TableCell>
                      <TableCell><StatusChip status={device.status} /></TableCell>
                      <TableCell>{device.location}</TableCell>
                      <TableCell>{device.lastActive}</TableCell>
                      <TableCell>
                        <div className="flex flex-col text-sm gap-1">
                          <span>Temp: {device.sensors.Temperature} | Gas: {device.sensors.Gas}</span>
                          <span>Pressure: {device.sensors.Pressure} | Vib: {device.sensors.Vibration}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="icon" className="mr-2" title="View">
                          <Eye size={18} />
                        </Button>
                        <Button variant="outline" size="icon" className="text-red-700 border-red-300" title="Remove">
                          <Trash2 size={18} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="mt-4 text-sm text-muted-foreground">
        Manage all devices from one place. For sensor analytics, visit the <a className="underline" href="/history">History</a> page.
      </div>
    </div>
  );
}
