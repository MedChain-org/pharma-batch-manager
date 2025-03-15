import React from "react";
import BaseNavbar from "./BaseNavbar";
import { Truck, BarChart3, Package, Route } from "lucide-react";
import { NavLink } from "react-router-dom";

const DistributorNavbar: React.FC = () => {
  const navItems = [
    {
      label: "Dashboard",
      href: "/dashboard/distributor",
      icon: <BarChart3 className="h-4 w-4" />,
    },
    {
      label: "Shipments",
      href: "/distributor/shipments",
      icon: <Package className="h-4 w-4" />,
    },
    {
      label: "Tracking",
      href: "/distributor/tracking",
      icon: <Route className="h-4 w-4" />,
    },
  ];

  return (
    <BaseNavbar
      roleName="Distributor"
      roleIcon={<Truck className="h-5 w-5 text-accent" />}
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

export default DistributorNavbar;
