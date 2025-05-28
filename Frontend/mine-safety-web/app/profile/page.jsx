"use client";
import * as React from "react";
import {
  Card, CardHeader, CardTitle, CardContent, CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Mail, User, MapPin, CheckCircle2, AlarmClock, Shield, Settings2, PencilLine, LogOut } from "lucide-react";

// User info
const user = {
  name: "Indusara Deviruan",
  email: "indusara@email.com",
  role: "Admin",
  joined: "Jan 2024",
  location: "Colombo, Sri Lanka",
  avatar: "", // Avatar image URL or empty for icon
  status: "Active",
};

// Stats
const stats = [
  { label: "Devices Managed", value: 6, icon: <Settings2 className="text-blue-600" size={22} /> },
  { label: "Alerts Responded", value: 11, icon: <AlarmClock className="text-yellow-600" size={22} /> },
  { label: "Active Sessions", value: 2, icon: <CheckCircle2 className="text-green-600" size={22} /> },
];

// Recent Activity
const recentActivity = [
  {
    title: "Responded to Gas Alert",
    desc: "Handled a gas threshold alert in Zone 3.",
    time: "Today, 10:30 AM"
  },
  {
    title: "Added New Device",
    desc: "Registered a new sensor in Zone 2.",
    time: "Yesterday, 3:18 PM"
  },
  {
    title: "Changed Pressure Threshold",
    desc: "Updated device pressure limit settings.",
    time: "2 days ago"
  }
];

export default function ProfilePage() {
  return (
    <div className="w-full max-w-2xl mx-auto pt-20 pb-8 px-2 flex flex-col gap-6">
      {/* Profile Card */}
      <Card>
        <CardHeader className="flex flex-col items-center gap-2">
          <Avatar className="w-20 h-20 text-4xl bg-blue-500 text-white border-2 border-blue-200 shadow-md">
            {user.avatar ? (
              <img src={user.avatar} alt="avatar" className="w-full h-full rounded-full" />
            ) : (
              <User size={42} />
            )}
          </Avatar>
          <CardTitle className="text-2xl mt-2">{user.name}</CardTitle>
          <CardDescription className="flex gap-2 items-center mt-1">
            <Badge className="bg-green-200 text-green-800 font-semibold px-2">{user.status}</Badge>
            <Badge className="bg-blue-100 text-blue-700 font-medium gap-1">
              <Shield size={14} /> {user.role}
            </Badge>
            <Badge className="bg-zinc-100 text-zinc-700 gap-1">
              <MapPin size={14} /> {user.location}
            </Badge>
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <div className="flex items-center gap-2 mt-2">
            <Mail size={16} className="text-blue-500" />
            <span className="text-sm text-zinc-700 dark:text-zinc-200">{user.email}</span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">Joined {user.joined}</div>
          <div className="flex gap-3 mt-5 mb-2">
            <Button size="sm" variant="default" className="gap-2">
              <PencilLine size={16} /> Edit Profile
            </Button>
            <Button size="sm" variant="outline" className="gap-2 text-red-500 border-red-200">
              <LogOut size={16} /> Logout
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {stats.map((s, idx) => (
              <div key={idx} className="flex flex-col items-center bg-muted rounded-xl p-4">
                {s.icon}
                <div className="text-xl font-bold">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            {recentActivity.map((a, i) => (
              <div key={i} className="flex gap-3 items-start">
                <span>
                  <AlarmClock size={20} className="mt-1 text-yellow-600" />
                </span>
                <div>
                  <div className="font-medium">{a.title}</div>
                  <div className="text-xs text-muted-foreground">{a.desc}</div>
                  <div className="text-xs text-zinc-400 mt-1">{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
