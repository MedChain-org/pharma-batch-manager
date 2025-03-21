import React from "react";
import BaseNavbar from "./BaseNavbar";
import { Pill, BarChart3 } from "lucide-react";
import { NavLink } from "react-router-dom";

const PharmacistNavbar: React.FC = () => {
  const navItems = [
    {
      label: "Dashboard",
      href: "/dashboard/pharmacist",
      icon: <BarChart3 className="h-4 w-4" />,
    },
    {
      label: "Inventory",
      href: "/pharmacist/inventory",
      icon: <Pill className="h-4 w-4" />,
    },
  ];

  return (
    <BaseNavbar
      roleName="Pharmacist"
      roleIcon={<Pill className="h-5 w-5 text-primary" />}
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

export default PharmacistNavbar;
