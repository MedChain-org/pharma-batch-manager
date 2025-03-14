import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  showBackToHome?: boolean;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
  showBackToHome = true,
}) => {
  return (
    <div className="min-h-screen flex">
      {/* Left panel (decorated) */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-primary/10 to-accent/5"
      >
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-[10%] -left-[10%] w-1/2 h-1/2 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute top-[60%] -right-[5%] w-1/3 h-1/3 bg-accent/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12">
          <div className="text-4xl font-bold text-primary mb-8">
            MedChain
          </div>

          <div className="glass-card max-w-md p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-primary mr-2"></div>
                <span className="text-sm font-medium">Secure Tracking</span>
              </div>
              <div className="text-xs text-muted-foreground">Now</div>
            </div>

            <p className="text-sm text-foreground/80 mb-4">
              Blockchain-powered end-to-end tracking of pharmaceuticals ensures
              authenticity and safety at every stage of the supply chain.
            </p>

            <div className="flex space-x-2">
              <div className="flex-1 h-1 bg-medical-light rounded-full"></div>
              <div className="flex-1 h-1 bg-medical-light rounded-full"></div>
              <div className="flex-1 h-1 bg-medical-dark rounded-full"></div>
            </div>
          </div>

          <div className="flex space-x-2 mb-8">
            <div className="w-2 h-2 rounded-full bg-primary/30"></div>
            <div className="w-2 h-2 rounded-full bg-primary/60"></div>
            <div className="w-2 h-2 rounded-full bg-primary"></div>
          </div>

          <p className="text-sm text-center text-muted-foreground max-w-xs">
            Ensuring the safety and efficacy of pharmaceuticals through
            transparent tracking and verification.
          </p>
        </div>
      </motion.div>

      {/* Right panel (form) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={cn(
          "flex-1 flex flex-col justify-center bg-background dark:bg-background/5",
          "px-6 py-12 lg:px-8 xl:px-12"
        )}
      >
        <div className="sm:mx-auto sm:w-full sm:max-w-md lg:max-w-xl">
          {showBackToHome && (
            <div className="mb-8">
              <Link
                to="/"
                className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-1"
                >
                  <path d="m15 18-6-6 6-6" />
                </svg>
                Back to home
              </Link>
            </div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold leading-9 tracking-tight">
              {title}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-8"
          >
            {children}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthLayout;
