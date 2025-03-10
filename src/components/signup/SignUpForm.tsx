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
import {
  BasicInfoValues,
  AdditionalInfoValues,
  basicInfoSchema,
  additionalInfoSchema,
  SignUpFormValues,
} from "./formSchemas";

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
  });

  // Initialize form for step 2
  const additionalInfoForm = useForm<AdditionalInfoValues>({
    resolver: zodResolver(additionalInfoSchema),
    defaultValues: {
      businessName: "",
      govtCredential: "",
    },
  });

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

    // Move to next step
    setCurrentStep(2);
  };

  // Handle form submission for step 2
  const onSubmitAdditionalInfo = async (data: AdditionalInfoValues) => {
    setIsLoading(true);

    try {
      // Combine data from both steps
      const userData: UserDetails = {
        role: selectedRole!,
        name: basicInfoForm.getValues().name,
        email: basicInfoForm.getValues().email,
        phoneNumber: basicInfoForm.getValues().phoneNumber,
        password: basicInfoForm.getValues().password,
        businessName: data.businessName,
        govtCredential: data.govtCredential,
      };

      // Sign up with Supabase
      const { data: authData, error: signUpError } = await supabase.auth.signUp(
        {
          email: userData.email,
          password: userData.password,
          options: {
            data: {
              role: userData.role,
              name: userData.name,
              phoneNumber: userData.phoneNumber,
              
            },
          },
        }
      );

      if (signUpError) throw signUpError;

      if (authData.user) {
        // Success notification
        toast.success("Account created successfully!", {
          description: "Please check your email for verification.",
        });

        // Reset forms and redirect to signin
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
    <>
      {currentStep === 1 ? (
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
            />
          </form>
        </Form>
      ) : (
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
            <FormButtons
              currentStep={currentStep}
              isLoading={isLoading}
              onBack={handleBack}
              hasSelectedRole={true}
            />
          </form>
        </Form>
      )}
    </>
  );
};

export default SignUpForm;
