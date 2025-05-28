"use client";
import * as React from "react";
import { useState, useEffect, ReactNode, Dispatch, SetStateAction } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Gauge,
  Waves,
  Map,
  Bell,
  History,
  Settings,
  Home as HomeIcon,
  Sun,
  Moon,
} from "lucide-react";

type NavItem = {
  text: string;
  icon: React.ElementType;
  path: string;
};

const navItems: NavItem[] = [
  { text: "Home", icon: HomeIcon, path: "/" },
  { text: "Live Data", icon: Waves, path: "/live-data" },
  { text: "Map", icon: Map, path: "/map" },
  { text: "Alerts", icon: Bell, path: "/alerts" },
  { text: "History", icon: History, path: "/history" },
  { text: "Settings", icon: Settings, path: "/settings" },
];

type TopNavBarProps = {
  darkMode: boolean;
  setDarkMode: Dispatch<SetStateAction<boolean>>;
};

function TopNavBar({ darkMode, setDarkMode }: TopNavBarProps) {  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border shadow-sm">
      <div className="container mx-auto flex items-center h-16 px-2">
        {/* Logo with blue color */}
        <Gauge className="text-yellow-400 mr-2" size={32} />
        <span className="text-xl font-bold tracking-wide mr-6">Mining Safety</span>
        
        <div className="flex-1" />
        <div className="flex space-x-1">
          {navItems.map((item: NavItem) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <Button
                key={item.text}
                asChild
                variant={isActive ? "default" : "ghost"}
                className={`font-semibold px-4 rounded-xl transition ${
                  isActive
                    ? "bg-blue-500/15 dark:bg-blue-600/40 text-blue-700 dark:text-blue-200 shadow"
                    : ""
                }`}
              >
                <Link href={item.path} className="flex items-center space-x-2">
                  <Icon className="mr-2" size={18} />
                  <span>{item.text}</span>
                </Link>
              </Button>
            );
          })}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="ml-2"
          onClick={() => setDarkMode((v: boolean) => !v)}
          aria-label="Toggle theme"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </Button>

      </div>
    </nav>
  );
}

type NavLayoutProps = {
  children: ReactNode;
};

export default function NavLayout({ children }: NavLayoutProps) {
  const [darkMode, setDarkMode] = useState<boolean>(true);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <div className="bg-background min-h-screen">
      <TopNavBar darkMode={darkMode} setDarkMode={setDarkMode} />
      <div className="pt-20 px-2 max-w-7xl mx-auto">{children}</div>
    </div>
  );
}
