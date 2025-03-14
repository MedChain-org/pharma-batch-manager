import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserDetails, UserRole } from "@/utils/types";
import { Form } from "@/components/ui/form";
import { toast } from "sonner";
import BasicInfoStep from "./BasicInfoStep";
import AdditionalInfoStep from "./AdditionalInfoStep";
import FormButtons from "./FormButtons";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2 } from "lucide-react";
import {
  BasicInfoValues,
  AdditionalInfoValues,
  basicInfoSchema,
  additionalInfoSchema,
  SignUpFormValues,
} from "./formSchemas";
import { Button } from "@/components/ui/button";

const SignUpForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const navigate = useNavigate();

  // Initialize form for step 1
  const basicInfoForm = useForm<BasicInfoValues>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      name: "",
      email: "",
      phoneNumber: "",
      password: "",
    },
    mode: "onChange",
  });

  // Initialize form for step 2
  const additionalInfoForm = useForm<AdditionalInfoValues>({
    resolver: zodResolver(additionalInfoSchema),
    defaultValues: {
      businessName: "",
      govtCredential: "",
    },
    mode: "onChange",
  });

  // Calculate progress
  const calculateProgress = () => {
    if (currentStep === 1) {
      const fields = ["name", "email", "phoneNumber", "password"] as const;
      const filledFields = fields.filter(field => !!basicInfoForm.watch(field));
      return ((filledFields.length / fields.length) * 50) + (selectedRole ? 10 : 0);
    }
    return 60 + (additionalInfoForm.formState.isValid ? 40 : 0);
  };

  // Handle role selection
  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
  };

  // Handle moving to previous step
  const handleBack = () => {
    setCurrentStep(1);
  };

  // Handle form submission for step 1
  const onSubmitBasicInfo = async (data: BasicInfoValues) => {
    setFormSubmitted(true);
    if (!selectedRole) return;
    setCurrentStep(2);
  };

  // Handle form submission for step 2
  const onSubmitAdditionalInfo = async (data: AdditionalInfoValues) => {
    setIsLoading(true);

    try {
      const userData: UserDetails = {
        role: selectedRole!,
        name: basicInfoForm.getValues().name,
        email: basicInfoForm.getValues().email,
        phoneNumber: basicInfoForm.getValues().phoneNumber,
        password: basicInfoForm.getValues().password,
        businessName: data.businessName,
        govtCredential: data.govtCredential,
      };

      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            role: userData.role,
            name: userData.name,
            phoneNumber: userData.phoneNumber,
          },
        },
      });

      if (signUpError) throw signUpError;

      if (authData.user) {
        toast.success("Account created successfully!", {
          description: "Please check your email for verification.",
        });

        basicInfoForm.reset();
        additionalInfoForm.reset();
        setCurrentStep(1);
        setSelectedRole(null);
        setFormSubmitted(false);
        navigate("/signin");
      }
    } catch (error: any) {
      console.error("Error creating account:", error);
      toast.error("Failed to create account", {
        description: error.message || "Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground">
            {currentStep === 1 ? "Basic Information" : "Additional Details"}
          </span>
          <span className="text-sm font-medium text-primary">
            {Math.round(calculateProgress())}%
          </span>
        </div>
        <Progress value={calculateProgress()} className="h-2" />
      </div>

      {/* Form Steps */}
      <AnimatePresence mode="wait">
        {currentStep === 1 ? (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <Form {...basicInfoForm}>
              <form
                onSubmit={basicInfoForm.handleSubmit(onSubmitBasicInfo)}
                className="space-y-6"
              >
                <BasicInfoStep
                  form={basicInfoForm}
                  selectedRole={selectedRole}
                  onRoleChange={handleRoleChange}
                  formSubmitted={formSubmitted}
                />
                <FormButtons
                  currentStep={currentStep}
                  isLoading={isLoading}
                  onBack={handleBack}
                  hasSelectedRole={!!selectedRole}
                  isValid={basicInfoForm.formState.isValid}
                />
              </form>
            </Form>
          </motion.div>
        ) : (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Form {...additionalInfoForm}>
              <form
                onSubmit={additionalInfoForm.handleSubmit(onSubmitAdditionalInfo)}
                className="space-y-6"
              >
                {selectedRole && (
                  <AdditionalInfoStep
                    form={additionalInfoForm}
                    selectedRole={selectedRole}
                  />
                )}
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary to-accent hover:from-accent hover:to-primary text-background transition-all duration-300"
                  disabled={isLoading || !selectedRole}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Signing up...
                    </div>
                  ) : (
                    "Sign up"
                  )}
                </Button>
              </form>
            </Form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step Indicators */}
      <div className="absolute -bottom-12 left-0 right-0 flex justify-center space-x-2">
        <motion.div
          className={`w-2 h-2 rounded-full ${
            currentStep === 1 ? "bg-primary" : "bg-primary/30"
          }`}
          animate={{ scale: currentStep === 1 ? 1.2 : 1 }}
        />
        <motion.div
          className={`w-2 h-2 rounded-full ${
            currentStep === 2 ? "bg-primary" : "bg-primary/30"
          }`}
          animate={{ scale: currentStep === 2 ? 1.2 : 1 }}
        />
      </div>
    </div>
  );
};

export default SignUpForm;
