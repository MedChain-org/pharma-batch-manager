
import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Navbar from "@/components/shared/Navbar";
import Hero from "@/components/shared/Hero";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  Smartphone, 
  Link as LinkIcon, 
  BarChart3, 
  Check, 
  ExternalLink 
} from "lucide-react";

const Index: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <Hero />

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 md:px-8">
          <div className="text-center mb-16">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-block px-3 py-1 mb-4 text-xs font-medium tracking-wider text-primary bg-primary/10 rounded-full"
            >
              Key Features
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              Why Choose PharmaTrack?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="max-w-2xl mx-auto text-foreground/70"
            >
              Our comprehensive solution ensures transparency and authenticity across the entire pharmaceutical supply chain,
              from manufacturers to patients.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Shield,
                title: "Secure Tracking",
                description: "Blockchain-powered technology ensures tamper-proof record keeping for each drug batch."
              },
              {
                icon: LinkIcon,
                title: "End-to-End Traceability",
                description: "Follow pharmaceuticals from production to dispensing with complete visibility."
              },
              {
                icon: Smartphone,
                title: "Mobile Verification",
                description: "Easy verification of drug authenticity at any point in the supply chain."
              },
              {
                icon: BarChart3,
                title: "Advanced Analytics",
                description: "Gain insights into supply chain efficiency and identify areas for improvement."
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * index, duration: 0.5 }}
                className="glass-card p-6"
              >
                <div className="bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center mb-5">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-medium mb-3">{feature.title}</h3>
                <p className="text-foreground/70 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* User Types Section */}
      <section className="py-20 bg-gradient-to-b from-white to-secondary/30">
        <div className="container mx-auto px-6 md:px-8">
          <div className="text-center mb-16">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-block px-3 py-1 mb-4 text-xs font-medium tracking-wider text-primary bg-primary/10 rounded-full"
            >
              For Everyone
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              Tailored for Every Role
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="max-w-2xl mx-auto text-foreground/70"
            >
              Whether you're a manufacturer, distributor, pharmacist, or doctor, PharmaTrack provides
              the tools you need to ensure pharmaceutical integrity.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                title: "Manufacturers",
                features: [
                  "Create and manage drug batches",
                  "Track manufacturing processes",
                  "Maintain quality control records",
                  "Generate compliance documentation"
                ],
                cta: "Start manufacturing",
                color: "from-primary/5 to-primary/10",
                delay: 0
              },
              {
                title: "Distributors",
                features: [
                  "Track shipments in real-time",
                  "Verify drug authenticity",
                  "Manage warehousing operations",
                  "Optimize distribution routes"
                ],
                cta: "Optimize distribution",
                color: "from-accent/5 to-accent/10",
                delay: 0.1
              },
              {
                title: "Pharmacists",
                features: [
                  "Verify medication authenticity",
                  "Track prescription fulfillment",
                  "Manage inventory efficiently",
                  "Ensure patient safety"
                ],
                cta: "Enhance patient care",
                color: "from-primary/5 to-primary/10",
                delay: 0.2
              },
              {
                title: "Doctors",
                features: [
                  "Issue secure digital prescriptions",
                  "Verify medication sources",
                  "Monitor patient medication history",
                  "Reduce medication errors"
                ],
                cta: "Improve prescribing",
                color: "from-accent/5 to-accent/10",
                delay: 0.3
              }
            ].map((role, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: role.delay, duration: 0.5 }}
                className="rounded-xl overflow-hidden border border-border shadow-subtle"
              >
                <div className={`bg-gradient-to-r ${role.color} p-6`}>
                  <h3 className="text-xl font-semibold">{role.title}</h3>
                </div>
                <div className="bg-white p-6">
                  <ul className="space-y-3 mb-6">
                    {role.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <Check className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-foreground/80">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/signup">
                    <Button variant="outline" className="w-full">
                      {role.cta}
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative rounded-2xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-10"></div>
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between p-10 md:p-16">
              <div className="mb-8 lg:mb-0 lg:max-w-2xl">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Ready to secure your pharmaceutical supply chain?
                </h2>
                <p className="text-foreground/70 mb-6">
                  Join the growing network of healthcare professionals using PharmaTrack to ensure medication safety and authenticity.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/signup">
                    <Button size="lg">Get Started</Button>
                  </Link>
                  <Link to="/contact">
                    <Button size="lg" variant="outline">Contact Sales</Button>
                  </Link>
                </div>
              </div>
              <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-card border border-border">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-primary rounded-full"></div>
                    <div className="text-sm font-medium">Security Stats</div>
                  </div>
                </div>
                <div className="space-y-4">
                  {[
                    { label: "Tracked Batches", value: "100,000+" },
                    { label: "Verified Transactions", value: "1.2M+" },
                    { label: "Platform Users", value: "5,000+" }
                  ].map((stat, i) => (
                    <div key={i} className="flex justify-between items-center text-sm">
                      <span className="text-foreground/60">{stat.label}</span>
                      <span className="font-medium">{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-border py-10">
        <div className="container mx-auto px-6 md:px-8">
          <div className="flex flex-col md:flex-row justify-between mb-8">
            <div className="mb-8 md:mb-0">
              <h3 className="text-xl font-semibold text-primary mb-4">PharmaTrack</h3>
              <p className="text-foreground/60 max-w-xs text-sm">
                Secure pharmaceutical tracking and verification for the entire supply chain.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h4 className="text-sm font-medium mb-4">Product</h4>
                <ul className="space-y-2">
                  {["Features", "Security", "Pricing", "Demos"].map((item, i) => (
                    <li key={i}>
                      <a href="#" className="text-foreground/60 hover:text-primary text-sm">
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-4">Company</h4>
                <ul className="space-y-2">
                  {["About", "Blog", "Careers", "Contact"].map((item, i) => (
                    <li key={i}>
                      <a href="#" className="text-foreground/60 hover:text-primary text-sm">
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-4">Resources</h4>
                <ul className="space-y-2">
                  {["Documentation", "Support", "API", "Privacy"].map((item, i) => (
                    <li key={i}>
                      <a href="#" className="text-foreground/60 hover:text-primary text-sm">
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-foreground/60">
              &copy; {new Date().getFullYear()} PharmaTrack. All rights reserved.
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              {["Terms", "Privacy", "Cookies"].map((item, i) => (
                <a 
                  key={i} 
                  href="#" 
                  className="text-sm text-foreground/60 hover:text-primary"
                >
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
