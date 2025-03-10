
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { UserDetails, UserRole } from "@/utils/types";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import UserTypeSelector from "./UserTypeSelector";
import { toast } from "sonner";
import { 
  AtSign, 
  Building, 
  Check, 
  FileText, 
  Lock, 
  Phone, 
  Upload, 
  User 
} from "lucide-react";

const SignUpForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Basic information schema
  const basicInfoSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters" }),
    email: z.string().email({ message: "Invalid email address" }),
    phoneNumber: z.string().min(5, { message: "Invalid phone number" }),
    password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  });

  // Additional details schema
  const additionalInfoSchema = z.object({
    businessName: z.string().min(2, { message: "Business name is required" }),
    govtCredential: z.string().min(2, { message: "Government credential is required" }),
  });

  // Combined schema that changes based on step
  const formSchema = currentStep === 1 
    ? basicInfoSchema 
    : additionalInfoSchema;

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phoneNumber: "",
      password: "",
      businessName: "",
      govtCredential: "",
    },
  });

  // Handle role selection
  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
  };

  // Handle form submission
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (currentStep === 1 && selectedRole) {
      // Move to next step
      setCurrentStep(2);
    } else if (currentStep === 2) {
      // Final submission
      setIsLoading(true);

      try {
        // Combine data from both steps
        const userData: UserDetails = {
          ...form.getValues(),
          role: selectedRole!,
        };

        console.log("Submitting user data:", userData);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Success notification
        toast.success("Account created successfully!", {
          description: "You can now sign in with your credentials.",
        });
        
        // Reset form and go back to step 1
        form.reset();
        setCurrentStep(1);
        setSelectedRole(null);
      } catch (error) {
        console.error("Error creating account:", error);
        toast.error("Failed to create account", {
          description: "Please try again later.",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {currentStep === 1 ? (
          <>
            <div className="mb-6">
              <h3 className="text-base font-medium mb-4">Select your role</h3>
              <UserTypeSelector 
                selectedRole={selectedRole} 
                onChange={handleRoleChange} 
              />
              {!selectedRole && form.formState.isSubmitted && (
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
                        <Input 
                          placeholder="John Doe" 
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
        ) : (
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
        )}

        <div className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2">
          {currentStep === 2 && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentStep(1)}
              disabled={isLoading}
            >
              Back
            </Button>
          )}
          <Button 
            type="submit" 
            className="w-full sm:w-auto"
            disabled={currentStep === 1 && !selectedRole || isLoading}
          >
            {isLoading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </div>
            ) : currentStep === 1 ? (
              "Continue"
            ) : (
              <div className="flex items-center">
                <Check className="mr-2 h-4 w-4" /> Complete Registration
              </div>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default SignUpForm;
