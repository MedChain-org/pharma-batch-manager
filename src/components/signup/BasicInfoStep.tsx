import React, { useState } from "react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UserRole } from "@/utils/types";
import { motion } from "framer-motion";
import UserTypeSelector from "@/components/shared/UserTypeSelector";
import { UseFormReturn } from "react-hook-form";
import { BasicInfoValues } from "./formSchemas";
import { AtSign, Lock, Phone, User, Eye, EyeOff, Check } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface BasicInfoStepProps {
  form: UseFormReturn<BasicInfoValues>;
  selectedRole: UserRole | null;
  onRoleChange: (role: UserRole) => void;
  formSubmitted: boolean;
}

const BasicInfoStep: React.FC<BasicInfoStepProps> = ({
  form,
  selectedRole,
  onRoleChange,
  formSubmitted,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const password = form.watch("password");

  const calculatePasswordStrength = (password: string): number => {
    if (!password) return 0;
    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength += 25;
    
    // Contains number
    if (/\d/.test(password)) strength += 25;
    
    // Contains lowercase
    if (/[a-z]/.test(password)) strength += 25;
    
    // Contains uppercase or special char
    if (/[A-Z]/.test(password) || /[^A-Za-z0-9]/.test(password)) strength += 25;
    
    return strength;
  };

  const getPasswordStrengthText = (strength: number): string => {
    if (strength === 0) return "Enter password";
    if (strength <= 25) return "Weak";
    if (strength <= 50) return "Fair";
    if (strength <= 75) return "Good";
    return "Strong";
  };

  const getPasswordStrengthColor = (strength: number): string => {
    if (strength <= 25) return "bg-destructive";
    if (strength <= 50) return "bg-yellow-500";
    if (strength <= 75) return "bg-blue-500";
    return "bg-green-500";
  };

  return (
    <>
      <div className="mb-6">
        <h3 className="text-base font-medium mb-4">Select your role</h3>
        <UserTypeSelector selectedRole={selectedRole} onChange={onRoleChange} />
        {!selectedRole && formSubmitted && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 text-sm text-destructive flex items-center gap-2"
          >
            Please select a role
          </motion.p>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <div className="relative group">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input 
                    placeholder="John Doe" 
                    className="pl-10 transition-all border-muted-foreground/20 focus:border-primary" 
                    {...field}
                  />
                  {field.value && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute right-3 top-3"
                    >
                      <Check className="h-4 w-4 text-green-500" />
                    </motion.div>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <div className="relative group">
                  <AtSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    type="email"
                    placeholder="your.email@example.com"
                    className="pl-10 transition-all border-muted-foreground/20 focus:border-primary"
                    {...field}
                  />
                  {field.value && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute right-3 top-3"
                    >
                      <Check className="h-4 w-4 text-green-500" />
                    </motion.div>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <div className="relative group">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    placeholder="+1 (555) 123-4567"
                    className="pl-10 transition-all border-muted-foreground/20 focus:border-primary"
                    {...field}
                  />
                  {field.value && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute right-3 top-3"
                    >
                      <Check className="h-4 w-4 text-green-500" />
                    </motion.div>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <div className="relative group">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10 pr-10 transition-all border-muted-foreground/20 focus:border-primary"
                    {...field}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </FormControl>
              <div className="mt-2 space-y-2">
                <Progress 
                  value={calculatePasswordStrength(password)} 
                  className={cn("h-1", getPasswordStrengthColor(calculatePasswordStrength(password)))}
                />
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">
                    {getPasswordStrengthText(calculatePasswordStrength(password))}
                  </span>
                  <span className="text-muted-foreground">
                    {calculatePasswordStrength(password)}%
                  </span>
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </motion.div>
    </>
  );
};

export default BasicInfoStep;
