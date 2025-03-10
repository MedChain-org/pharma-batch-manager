
import React from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface FormButtonsProps {
  currentStep: number;
  isLoading: boolean;
  onBack: () => void;
  hasSelectedRole: boolean;
}

const FormButtons: React.FC<FormButtonsProps> = ({ 
  currentStep, 
  isLoading, 
  onBack,
  hasSelectedRole
}) => {
  return (
    <div className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2">
      {currentStep === 2 && (
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isLoading}
        >
          Back
        </Button>
      )}
      <Button 
        type="submit" 
        className="w-full sm:w-auto"
        disabled={currentStep === 1 && !hasSelectedRole || isLoading}
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
  );
};

export default FormButtons;
