import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import AuthLayout from "@/components/auth/AuthLayout";
import SignUpForm from "@/components/signup/SignUpForm";
import { Shield } from "lucide-react";
import FloatingBubbles from "@/components/shared/FloatingBubbles";
import { Button } from "@/components/ui/button";

const SignUp: React.FC = () => {
  return (
    <AuthLayout
      title="Join our network"
      subtitle="Create your account to secure your pharmaceutical supply chain"
    >
      <FloatingBubbles />
      <div className="relative max-w-md w-full mx-auto">
        {/* Decorative Elements */}
        <div className="absolute -top-12 -left-6 w-24 h-24 bg-gradient-to-r from-[#0091ff]/30 to-[#00c7a2]/30 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-12 -right-6 w-24 h-24 bg-gradient-to-r from-[#00c7a2]/30 to-[#0091ff]/30 rounded-full blur-2xl"></div>
        
        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative p-8 rounded-2xl border border-white/20 shadow-xl bg-white/80 backdrop-blur-xl"
        >
          {/* Security Badge */}
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#0091ff] to-[#00c7a2] p-3 rounded-full shadow-lg">
            <Shield className="w-6 h-6 text-white" />
          </div>

          <SignUpForm />
        </motion.div>
      </div>

      {/* Sign In Link */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="mt-8 text-center"
      >
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            to="/signin"
            className="font-medium bg-gradient-to-r from-[#0091ff] to-[#00c7a2] bg-clip-text text-transparent hover:opacity-80 transition-opacity"
          >
            Sign in
          </Link>
        </p>
      </motion.div>

      {/* Terms and Privacy */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="mt-8 border-t border-white/10 pt-6"
      >
        <p className="text-xs text-center text-muted-foreground">
          By creating an account, you agree to our{" "}
          <a
            href="#"
            className="text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline"
          >
            Terms of Service
          </a>{" "}
          and{" "}
          <a
            href="#"
            className="text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline"
          >
            Privacy Policy
          </a>
        </p>
      </motion.div>
    </AuthLayout>
  );
};

export default SignUp;
