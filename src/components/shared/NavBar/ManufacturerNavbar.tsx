import React from "react";
import BaseNavbar from "./BaseNavbar";
import {
  Factory,
  Pill,
  Package,
  BarChart3,
  FileText,
  QrCode,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const ManufacturerNavbar: React.FC = () => {
  const navItems = [
    {
      label: "Dashboard",
      href: "/dashboard/manufacturer",
      icon: <BarChart3 className="h-4 w-4" />,
    },
    {
      label: "Drug Batches",
      href: "/manufacturer/drugs",
      icon: <Pill className="h-4 w-4" />,
    },
    {
      label: "Generate QR",
      href: "/manufacturer/generate-qr",
      icon: <QrCode className="h-4 w-4" />,
    },
    {
      label: "Supply Chain",
      href: "/manufacturer/supply-chain",
      icon: <Package className="h-4 w-4" />,
    },
    {
      label: "Reports",
      href: "/manufacturer/reports",
      icon: <FileText className="h-4 w-4" />,
    },
  ];

  return (
    <BaseNavbar
      roleName="Manufacturer"
      roleIcon={<Factory className="h-5 w-5 text-primary" />}
    >
      <div className="hidden md:flex items-center gap-6 mx-6">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              `flex items-center gap-1 text-sm font-medium transition-colors ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </div>
    </BaseNavbar>
  );
};

export default ManufacturerNavbar;
