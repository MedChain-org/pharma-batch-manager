
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import AuthLayout from "@/components/AuthLayout";
import SignUpForm from "@/components/signup/SignUpForm";

const SignUp: React.FC = () => {
  return (
    <AuthLayout 
      title="Join our network" 
      subtitle="Create your account to secure your pharmaceutical supply chain"
    >
      <div className="relative">
        <div className="absolute -top-10 left-10 w-20 h-20 bg-pharma-light rounded-full blur-xl opacity-50"></div>
        <div className="absolute -bottom-10 right-10 w-20 h-20 bg-medical-light rounded-full blur-xl opacity-50"></div>
        
        <div className="relative p-6 rounded-lg border border-muted shadow-sm bg-gradient-to-br from-white via-background to-white">
          <SignUpForm />
        </div>
      </div>
      
      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link 
            to="/signin" 
            className="font-medium text-primary hover:underline transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="mt-10 border-t border-border pt-6"
      >
        <p className="text-xs text-center text-muted-foreground">
          By creating an account, you agree to our{" "}
          <a href="#" className="text-primary hover:text-primary/80 transition-colors">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="text-primary hover:text-primary/80 transition-colors">
            Privacy Policy
          </a>
        </p>
      </motion.div>
    </AuthLayout>
  );
};

export default SignUp;
