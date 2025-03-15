import React from "react";
import BaseNavbar from "./BaseNavbar";
import {
  Stethoscope,
  BarChart3,
  ClipboardList,
  QrCode,
  User,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const DoctorNavbar: React.FC = () => {
  const navItems = [
    {
      label: "Dashboard",
      href: "/dashboard/doctor",
      icon: <BarChart3 className="h-4 w-4" />,
    },
    {
      label: "Prescriptions",
      href: "/doctor/prescriptions",
      icon: <ClipboardList className="h-4 w-4" />,
    },
    {
      label: "Generate QR",
      href: "/doctor/generate-qr",
      icon: <QrCode className="h-4 w-4" />,
    },
    {
      label: "Patients",
      href: "/doctor/patients",
      icon: <User className="h-4 w-4" />,
    },
  ];

  return (
    <BaseNavbar
      roleName="Doctor"
      roleIcon={<Stethoscope className="h-5 w-5 text-accent" />}
    >
      <div className="hidden md:flex items-center gap-6 mx-6">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              `flex items-center gap-1 text-sm font-medium transition-colors ${
                isActive
                  ? "text-accent"
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

export default DoctorNavbar;
