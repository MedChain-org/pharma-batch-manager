import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const Hero: React.FC = () => {
  return (
    <section className="min-h-screen flex items-center pt-24 pb-16">
      <div className="container mx-auto px-6 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col space-y-6"
          >
            <div>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-block px-3 py-1 mb-4 text-xs font-medium tracking-wider text-primary bg-primary/10 rounded-full"
              >
                Secure Pharmaceutical Tracking
              </motion.span>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-balance"
              >
                Transparent Pharmaceutical{" "}
                <span className="text-gradient">Supply Chain</span>
              </motion.h1>
            </div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-lg text-foreground/80 max-w-lg"
            >
              Track pharmaceuticals from manufacturing to dispensing with our secure,
              blockchain-powered platform. Ensuring authenticity and integrity at every step.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 pt-2"
            >
              <Link to="/signup">
                <Button size="lg" className="group">
                  <span>Get Started</span>
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/about">
                <Button size="lg" variant="outline">
                  Learn More
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-xl">
              <div className="aspect-[4/3] bg-gradient-to-br from-primary/10 to-medical-light rounded-2xl flex items-center justify-center">
                <div className="absolute inset-0 bg-background/60 backdrop-blur-sm"></div>
                <div className="relative z-10 p-8">
                  <div className="glass-card p-6 mb-6">
                    <div className="flex items-center mb-4">
                      <div className="w-3 h-3 rounded-full bg-primary mr-2"></div>
                      <span className="text-sm font-medium">Batch Tracking</span>
                    </div>
                    <div className="h-32 bg-background/50 rounded-lg shadow-subtle flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-1 bg-primary/20 rounded mx-auto mb-2"></div>
                        <div className="w-24 h-1 bg-primary/20 rounded mx-auto mb-2"></div>
                        <div className="w-20 h-1 bg-primary/20 rounded mx-auto"></div>
                      </div>
                    </div>
                  </div>

                  <div className="glass-card p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-3 h-3 rounded-full bg-pharma-dark mr-2"></div>
                      <span className="text-sm font-medium">Supply Chain</span>
                    </div>
                    <div className="flex space-x-2">
                      <div className="w-4 h-16 bg-pharma-light rounded-full"></div>
                      <div className="w-4 h-16 bg-pharma-light rounded-full mt-4"></div>
                      <div className="w-4 h-16 bg-pharma-light rounded-full mt-8"></div>
                      <div className="w-4 h-16 bg-pharma-light rounded-full mt-2"></div>
                      <div className="w-4 h-16 bg-pharma-light rounded-full mt-6"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-accent/10 rounded-full blur-3xl"></div>
            <div className="absolute -top-6 -left-6 w-24 h-24 bg-primary/10 rounded-full blur-3xl"></div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
