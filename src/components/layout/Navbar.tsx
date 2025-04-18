"use client";
import {
  ChartColumn,
  Crown,
  Flag,
  Flame,
  IdCard,
  LucideIcon,
  PanelLeftClose,
  PanelLeftOpen,
  Timer,
  Trophy,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import Tooltip from "./Tooltip";

type NavItemProps = {
  href: string;
  icon: LucideIcon;
  label: string;
  isExpanded: boolean;
};

const NavItem = ({href, icon: Icon, label, isExpanded}: NavItemProps) => {
  if (!isExpanded) {
    return (
      <Tooltip text={label}>
        <Link href={href} className="flex items-center p-2 my-1 hover:bg-slate-800 rounded-lg transition-colors justify-center">
          <Icon strokeWidth={1} size={22} />
        </Link>
      </Tooltip>
    );
  }
  return (
    <Link href={href} className="flex items-center gap-3 p-2 my-1 hover:bg-slate-800 rounded-lg transition-colors">
      <Icon strokeWidth={1} size={22} />
      <span>{label}</span>
    </Link>
  );
}

const navigationItems = [
  { href: '/drivers', icon: IdCard, label: 'Drivers' },
  { href: '/standings?title=Drivers', icon: Trophy, label: 'Drivers Championship' },
  { href: '/teams', icon: Users, label: 'Constructors' },
  { href: '/standings?title=Constructors', icon: Crown, label: 'Constructors Championship' },
  { href: '/stats', icon: ChartColumn, label: 'Driver Stats' },
  { href: '/races', icon: Flag, label: 'Races' },
  { href: '/pitstop', icon: Timer, label: 'Pit Stops' },
];

export default function Navbar() {
  const [isSidebarExpanded, setSidebarExpanded] = useState(false);

  const toggleSidebar = () => {
    setSidebarExpanded(!isSidebarExpanded);
  };

  useEffect(() => {
    const mainContent = document.getElementById("main-content");
    if (mainContent) {
      mainContent.style.marginLeft = isSidebarExpanded ? "15rem" : "4rem";
    }
  }, [isSidebarExpanded]);

  return (
    <>
      <nav className="p-4 border-b border-gray-800">
        <div className="ml-20 flex justify-between items-center">
          <Link href="/" className="text-xl">
            Delta Dash
          </Link>
        </div>
      </nav>
      <nav
        className={`fixed left-0 top-0 h-full bg-slate-900 border-r border-gray-800 transition-all duration-300 z-50 ${
          isSidebarExpanded ? "w-60" : "w-16"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo Header */}
          <div className="p-4 flex items-center justify-between">
            {isSidebarExpanded && (
              <Link href="/" className="flex items-center gap-2">
                <Flame className="text-f1-red" />
                <span className="font-bold">Delta Dash</span>
              </Link>
            )}
            <button
              onClick={toggleSidebar}
              className="p-1 hover:bg-slate-800 rounded-lg"
            >
              {isSidebarExpanded ? (
                <PanelLeftClose size={20} />
              ) : (
                <PanelLeftOpen size={20} />
              )}
            </button>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col gap-1 p-2 mt-6 text-sm">
          {navigationItems.map((item) => (
              <NavItem key={item.href} {...item} isExpanded={isSidebarExpanded} />
            ))}
          </div>
        </div>
      </nav>
    </>
  );
}
