
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { AdditionalInfoValues } from "./formSchemas";
import { motion } from "framer-motion";
import { UserRole } from "@/utils/types";
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Building, FileText, Upload } from "lucide-react";

interface AdditionalInfoStepProps {
  form: UseFormReturn<AdditionalInfoValues>;
  selectedRole: UserRole;
}

const AdditionalInfoStep: React.FC<AdditionalInfoStepProps> = ({ 
  form, 
  selectedRole 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <div className="mb-6 p-3 bg-secondary rounded-lg">
        <p className="text-sm text-foreground/80">
          Additional information for <span className="font-medium text-primary">
            {selectedRole && selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}
          </span> account
        </p>
      </div>
      
      <FormField
        control={form.control}
        name="businessName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {selectedRole === "manufacturer" ? "Company Name" : 
                selectedRole === "distributor" ? "Business Name" : 
                selectedRole === "pharmacist" ? "Pharmacy Name" : 
                "Hospital/Clinic Name"}
            </FormLabel>
            <FormControl>
              <div className="relative">
                <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Enter name" 
                  className="pl-10" 
                  {...field} 
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <div className="space-y-2">
        <FormLabel>Professional Certificate</FormLabel>
        <div className="border-2 border-dashed border-border rounded-lg p-4 bg-secondary/30">
          <div className="flex flex-col items-center justify-center gap-2 text-center">
            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
            <div className="flex flex-col items-center">
              <label 
                htmlFor="certificate-upload" 
                className="text-sm font-medium text-primary cursor-pointer hover:underline"
              >
                Choose a file
              </label>
              <p className="text-xs text-muted-foreground mt-1">
                or drag and drop
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                PDF, JPG or PNG (max. 5MB)
              </p>
            </div>
            <input 
              id="certificate-upload" 
              type="file" 
              className="hidden" 
              accept=".pdf,.jpg,.jpeg,.png" 
            />
          </div>
        </div>
      </div>
      
      <FormField
        control={form.control}
        name="govtCredential"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Government Credential ID</FormLabel>
            <FormControl>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Enter ID number" 
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
  );
};

export default AdditionalInfoStep;
