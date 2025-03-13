import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { UserRole } from "@/utils/types";
import { 
  AlertCircle,
  BarChart3,
  Bell, 
  Building2, 
  ChevronDown, 
  ClipboardList, 
  Home, 
  LogOut, 
  Menu, 
  MessageSquare, 
  Package, 
  PillIcon, 
  Settings, 
  Stethoscope, 
  Truck, 
  Users, 
  X 
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface DashboardLayoutProps {
  children: React.ReactNode;
  userRole: UserRole;
}

type NavItem = {
  title: string;
  icon: React.ElementType;
  href: string;
  badge?: number;
};

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, userRole }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Role-specific navigation items
  const getNavigationItems = (): NavItem[] => {
    const commonItems: NavItem[] = [
      { title: "Dashboard", icon: Home, href: "/dashboard" },
      { title: "Reports", icon: BarChart3, href: "/reports" },
      { title: "Settings", icon: Settings, href: "/settings" },
    ];

    const roleSpecificItems: Record<UserRole, NavItem[]> = {
      manufacturer: [
        { title: "Batches", icon: Package, href: "/batches", badge: 3 },
        { title: "Inventory", icon: ClipboardList, href: "/inventory" },
        { title: "Production", icon: Building2, href: "/production" },
      ],
      distributor: [
        { title: "Shipments", icon: Truck, href: "/shipments", badge: 2 },
        { title: "Inventory", icon: ClipboardList, href: "/inventory" },
        { title: "Partners", icon: Users, href: "/partners" },
      ],
      pharmacist: [
        { title: "Prescriptions", icon: ClipboardList, href: "/prescriptions", badge: 5 },
        { title: "Inventory", icon: PillIcon, href: "/inventory" },
        { title: "Patients", icon: Users, href: "/patients" },
      ],
      doctor: [
        { title: "Patients", icon: Users, href: "/patients" },
        { title: "Prescriptions", icon: ClipboardList, href: "/prescriptions" },
        { title: "Consultations", icon: Stethoscope, href: "/consultations", badge: 1 },
      ],
    };

    return [...roleSpecificItems[userRole], ...commonItems];
  };

  const navigationItems = getNavigationItems();
  const isActive = (href: string) => location.pathname === href;

  const getRoleIcon = () => {
    switch (userRole) {
      case "manufacturer": return Building2;
      case "distributor": return Truck;
      case "pharmacist": return PillIcon;
      case "doctor": return Stethoscope;
      default: return Building2;
    }
  };

  const RoleIcon = getRoleIcon();

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar for desktop */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-20 transition-all duration-300 ease-in-out",
          "transform bg-white border-r border-border shadow-sm",
          isSidebarOpen ? "w-64" : "w-20",
          "hidden md:flex md:flex-col"
        )}
      >
        <div className="flex h-16 items-center px-4 border-b border-border">
          <div className={cn(
            "flex items-center transition-all duration-300",
            isSidebarOpen ? "justify-between w-full" : "justify-center w-full"
          )}>
            {isSidebarOpen ? (
              <span className="text-lg font-semibold text-primary">MedChain</span>
            ) : (
              <span className="text-lg font-semibold text-primary">PT</span>
            )}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-muted-foreground hover:text-foreground"
            >
              {isSidebarOpen ? (
                <ChevronDown className="h-5 w-5 rotate-90" />
              ) : (
                <ChevronDown className="h-5 w-5 -rotate-90" />
              )}
            </Button>
          </div>
        </div>

        <div className="px-4 py-4">
          <div className={cn(
            "p-2 flex items-center gap-x-3 bg-secondary/50 rounded-lg mb-4",
            !isSidebarOpen && "justify-center p-2"
          )}>
            <div className="bg-primary/10 p-1.5 rounded-md">
              <RoleIcon className="h-4 w-4 text-primary" />
            </div>
            {isSidebarOpen && (
              <div className="flex flex-col">
                <span className="text-xs font-medium">{userRole.charAt(0).toUpperCase() + userRole.slice(1)}</span>
                <span className="text-xs text-muted-foreground">Account</span>
              </div>
            )}
          </div>

          <nav className="space-y-1 mt-4">
            {navigationItems.map((item) => (
              <Link
                key={item.title}
                to={item.href}
                className={cn(
                  "flex items-center px-3 py-2.5 text-sm rounded-md transition-all duration-200 relative group overflow-hidden",
                  isActive(item.href)
                    ? "bg-primary text-primary-foreground font-medium"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  !isSidebarOpen && "justify-center px-2",
                  "after:absolute after:inset-0 after:bg-gradient-to-r after:from-primary/0 hover:after:from-primary/5 after:to-transparent after:opacity-0 hover:after:opacity-100 after:transition-opacity",
                  "before:absolute before:inset-y-0 before:left-0 before:w-[2px] before:bg-primary before:scale-y-0 hover:before:scale-y-100 before:transition-transform before:duration-200 before:origin-bottom"
                )}
              >
                <item.icon className={cn(
                  "h-4 w-4 transition-transform group-hover:scale-110",
                  isSidebarOpen && "mr-3"
                )} />
                {isSidebarOpen && (
                  <span className="truncate transition-transform group-hover:translate-x-0.5">{item.title}</span>
                )}
                {isSidebarOpen && item.badge && (
                  <span className="ml-auto bg-secondary text-foreground px-1.5 py-0.5 rounded-full text-xs font-medium transition-transform group-hover:scale-105">
                    {item.badge}
                  </span>
                )}
                {!isSidebarOpen && item.badge && (
                  <span className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full transition-transform group-hover:scale-125"></span>
                )}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-4 border-t border-border">
          <Button 
            variant="ghost" 
            className={cn(
              "text-muted-foreground hover:text-foreground w-full justify-start",
              !isSidebarOpen && "justify-center px-2"
            )}
          >
            <LogOut className={cn("h-4 w-4", isSidebarOpen && "mr-3")} />
            {isSidebarOpen && <span>Sign Out</span>}
          </Button>
        </div>
      </aside>

      {/* Mobile sidebar backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-20 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* Mobile sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-border shadow-lg md:hidden flex flex-col"
          >
            <div className="flex h-16 items-center justify-between px-4 border-b border-border">
              <span className="text-lg font-semibold text-primary">MedChain</span>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="px-4 py-4">
              <div className="p-2 flex items-center gap-x-3 bg-secondary/50 rounded-lg mb-4">
                <div className="bg-primary/10 p-1.5 rounded-md">
                  <RoleIcon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-medium">{userRole.charAt(0).toUpperCase() + userRole.slice(1)}</span>
                  <span className="text-xs text-muted-foreground">Account</span>
                </div>
              </div>

              <nav className="space-y-1 mt-4">
                {navigationItems.map((item) => (
                  <Link
                    key={item.title}
                    to={item.href}
                    className={cn(
                      "flex items-center px-3 py-2.5 text-sm rounded-md transition-all",
                      isActive(item.href)
                        ? "bg-primary text-primary-foreground font-medium"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4 mr-3" />
                    <span className="truncate">{item.title}</span>
                    {item.badge && (
                      <span className="ml-auto bg-secondary text-foreground px-1.5 py-0.5 rounded-full text-xs font-medium">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="mt-auto p-4 border-t border-border">
              <Button 
                variant="ghost" 
                className="text-muted-foreground hover:text-foreground w-full justify-start"
              >
                <LogOut className="h-4 w-4 mr-3" />
                <span>Sign Out</span>
              </Button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className={cn(
        "flex-1 flex flex-col min-w-0",
        isSidebarOpen ? "md:ml-64" : "md:ml-20",
        "transition-all duration-300"
      )}>
        {/* Header */}
        <header className="h-16 border-b border-border bg-white sticky top-0 z-10">
          <div className="h-full px-4 flex items-center justify-between">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden text-muted-foreground"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div className="ml-4 md:ml-0">
                <h1 className="text-lg font-medium">{location.pathname.split('/').pop()?.charAt(0).toUpperCase() + location.pathname.split('/').pop()?.slice(1) || "Dashboard"}</h1>
                <p className="text-xs text-muted-foreground">
                  Welcome back to your {userRole} dashboard
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className="text-muted-foreground"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full"></span>
                </Button>
                
                {/* Notifications dropdown */}
                {isNotificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white border border-border rounded-lg shadow-md py-2 z-10">
                    <div className="px-4 py-2 border-b border-border">
                      <h3 className="text-sm font-medium">Notifications</h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      <div className="p-4 border-b border-border hover:bg-secondary/50 transition-colors cursor-pointer">
                        <div className="flex items-start">
                          <AlertCircle className="h-5 w-5 text-primary mr-3 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">New shipment arrived</p>
                            <p className="text-xs text-muted-foreground mt-1">A new shipment has arrived at your location.</p>
                            <p className="text-xs text-muted-foreground mt-2">10 minutes ago</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 border-b border-border hover:bg-secondary/50 transition-colors cursor-pointer">
                        <div className="flex items-start">
                          <MessageSquare className="h-5 w-5 text-accent mr-3 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">New message from supplier</p>
                            <p className="text-xs text-muted-foreground mt-1">You have a new message regarding your order #12345.</p>
                            <p className="text-xs text-muted-foreground mt-2">1 hour ago</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="px-4 py-2 border-t border-border">
                      <a href="#" className="text-xs text-primary hover:text-primary/80 transition-colors">
                        View all notifications
                      </a>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="relative">
                <button 
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {userRole.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium">John Doe</p>
                    <p className="text-xs text-muted-foreground">{userRole.charAt(0).toUpperCase() + userRole.slice(1)}</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground hidden md:block" />
                </button>
                
                {/* User dropdown */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-border rounded-lg shadow-md py-2 z-10">
                    <div className="px-4 py-2 border-b border-border">
                      <p className="text-sm font-medium">John Doe</p>
                      <p className="text-xs text-muted-foreground">john.doe@example.com</p>
                    </div>
                    <div className="py-1">
                      <Link 
                        to="/profile" 
                        className="block px-4 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
                      >
                        Profile
                      </Link>
                      <Link 
                        to="/settings" 
                        className="block px-4 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
                      >
                        Settings
                      </Link>
                    </div>
                    <div className="py-1 border-t border-border">
                      <button 
                        className="block w-full text-left px-4 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>
        
        {/* Main content area */}
        <main 
          onClick={() => {
            setIsNotificationsOpen(false);
            setIsUserMenuOpen(false);
          }}
          className="flex-1 p-6 bg-secondary/30"
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
