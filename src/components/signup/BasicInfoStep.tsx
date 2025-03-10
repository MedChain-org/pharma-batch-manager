import React from "react";
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
import { AtSign, Lock, Phone, User } from "lucide-react";

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
  return (
    <>
      <div className="mb-6">
        <h3 className="text-base font-medium mb-4">Select your role</h3>
        <UserTypeSelector selectedRole={selectedRole} onChange={onRoleChange} />
        {!selectedRole && formSubmitted && (
          <p className="mt-2 text-sm text-destructive">Please select a role</p>
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
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="John Doe" className="pl-10" {...field} />
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
                <div className="relative">
                  <AtSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="your.email@example.com"
                    className="pl-10"
                    {...field}
                  />
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
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="+1 (555) 123-4567"
                    className="pl-10"
                    {...field}
                  />
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
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </motion.div>
    </>
  );
};

export default BasicInfoStep;
