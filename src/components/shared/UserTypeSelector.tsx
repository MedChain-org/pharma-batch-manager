import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { UserRole } from "@/utils/types";
import { 
  Building2, 
  Truck, 
  PillIcon, 
  Stethoscope 
} from "lucide-react";

interface UserTypeSelectorProps {
  selectedRole: UserRole | null;
  onChange: (role: UserRole) => void;
}

interface RoleOption {
  id: UserRole;
  icon: React.ElementType;
  title: string;
  description: string;
}

const UserTypeSelector: React.FC<UserTypeSelectorProps> = ({ selectedRole, onChange }) => {
  const roles: RoleOption[] = [
    {
      id: "manufacturer",
      icon: Building2,
      title: "Manufacturer",
      description: "Add new drug batches and manage inventory",
    },
    {
      id: "distributor",
      icon: Truck,
      title: "Distributor",
      description: "Track shipments and manage inventory",
    },
    {
      id: "pharmacist",
      icon: PillIcon,
      title: "Pharmacist",
      description: "Access prescriptions and manage dispensing",
    },
    {
      id: "doctor",
      icon: Stethoscope,
      title: "Doctor",
      description: "Add prescriptions and manage patient data",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
      {roles.map((role, index) => (
        <motion.div
          key={role.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 * index, duration: 0.4 }}
        >
          <button
            type="button"
            onClick={() => onChange(role.id)}
            className={cn(
              "w-full p-6 rounded-xl transition-all duration-300 text-left",
              selectedRole === role.id
                ? "bg-primary/10 border-2 border-primary/50 shadow-md"
                : "bg-background/60 border border-border hover:bg-secondary/50 hover:border-primary/30"
            )}
          >
            <div className="flex items-start space-x-4">
              <div className={cn(
                "p-3 rounded-lg",
                selectedRole === role.id ? "bg-primary/15" : "bg-secondary/50"
              )}>
                <role.icon className={cn(
                  "h-6 w-6",
                  selectedRole === role.id ? "text-primary" : "text-muted-foreground"
                )} />
              </div>
              <div>
                <p className={cn(
                  "font-medium mb-1",
                  selectedRole === role.id ? "text-primary" : "text-foreground"
                )}>
                  {role.title}
                </p>
                <p className="text-sm text-muted-foreground">
                  {role.description}
                </p>
              </div>
            </div>
          </button>
        </motion.div>
      ))}
    </div>
  );
};

export default UserTypeSelector;
