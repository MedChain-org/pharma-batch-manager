import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Navbar from "@/components/shared/Navbar";
import Hero from "@/components/shared/Hero";
import AnimatedBackground from "@/components/shared/AnimatedBackground";
import { Button } from "@/components/ui/button";
import {
  Shield,
  Smartphone,
  Link as LinkIcon,
  BarChart3,
  Check,
  ExternalLink,
  ArrowRight,
  Star,
  Users,
  ChevronRight,
  Building2,
  Truck,
  PillIcon,
  Stethoscope,
} from "lucide-react";

const Index: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <AnimatedBackground />
      <Navbar />

      <Hero />

      {/* Stats Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 backdrop-blur-xl"></div>
        <div className="container mx-auto px-6 py-12 relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              {
                value: "10,000+",
                label: "Batches Tracked",
                color: "from-primary/20 to-primary/10",
              },
              {
                value: "99.9%",
                label: "Accuracy Rate",
                color: "from-accent/20 to-accent/10",
              },
              {
                value: "5,000+",
                label: "Active Users",
                color: "from-primary/20 to-primary/10",
              },
              {
                value: "24/7",
                label: "Support",
                color: "from-accent/20 to-accent/10",
              },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ 
                  scale: 1.03,
                  rotate: [-0.5, 1, -0.5],
                  transition: { 
                    duration: 0.3,
                    rotate: { repeat: Infinity, duration: 2 }
                  }
                }}
                className={`text-center p-6 rounded-2xl bg-gradient-to-br ${stat.color} backdrop-blur-lg border border-white/20 shadow-xl relative overflow-hidden group`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                <div className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2 relative">
                  {stat.value}
                </div>
                <div className="text-sm font-medium text-foreground/80">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* How it Works Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent"></div>
        <div className="container mx-auto px-6 md:px-8 relative">
          <div className="text-center mb-16">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-block px-4 py-1.5 mb-4 text-xs font-medium tracking-wider text-primary bg-primary/10 rounded-full ring-1 ring-primary/20"
            >
              Simple Process
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
            >
              How MedChain Works
            </motion.h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Register Your Batch",
                description:
                  "Create a unique digital identity for each pharmaceutical batch",
                gradient: "from-primary/20 to-primary/5",
              },
              {
                step: "2",
                title: "Track Movement",
                description:
                  "Monitor real-time location and handling throughout the supply chain",
                gradient: "from-accent/20 to-accent/5",
              },
              {
                step: "3",
                title: "Verify Authenticity",
                description:
                  "Instantly verify product authenticity at any point",
                gradient: "from-primary/20 to-primary/5",
              },
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * index, duration: 0.5 }}
                whileHover={{ 
                  scale: 1.02,
                  transition: { duration: 0.2 }
                }}
                className={`relative p-8 rounded-2xl bg-gradient-to-br ${step.gradient} backdrop-blur-sm border border-white/20 shadow-xl group hover:shadow-2xl hover:shadow-primary/5`}
              >
                <motion.div
                  className="absolute -top-4 left-6 bg-gradient-to-r from-primary to-accent w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-lg"
                  whileHover={{
                    scale: 1.2,
                    rotate: 360,
                    transition: { duration: 0.5 }
                  }}
                >
                  {step.step}
                </motion.div>
                <h3 className="text-xl font-semibold mt-4 mb-3 flex items-center">
                  {step.title}
                  <ChevronRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transform group-hover:translate-x-1 transition-all" />
                </h3>
                <p className="text-foreground/70">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/5 to-transparent"></div>
        <div className="container mx-auto px-6 md:px-8 relative">
          <div className="text-center mb-16">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-block px-4 py-1.5 mb-4 text-xs font-medium tracking-wider text-primary bg-primary/10 rounded-full ring-1 ring-primary/20"
            >
              Key Features
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
            >
              Why Choose MedChain?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="max-w-2xl mx-auto text-foreground/70 text-lg"
            >
              Our comprehensive solution ensures transparency and authenticity
              across the entire pharmaceutical supply chain, from manufacturers
              to patients.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Shield,
                title: "Secure Tracking",
                description:
                  "Blockchain-powered technology ensures tamper-proof record keeping for each drug batch.",
                gradient: "from-primary/20 to-primary/5",
              },
              {
                icon: LinkIcon,
                title: "End-to-End Traceability",
                description:
                  "Follow pharmaceuticals from production to dispensing with complete visibility.",
                gradient: "from-accent/20 to-accent/5",
              },
              {
                icon: Smartphone,
                title: "Mobile Verification",
                description:
                  "Easy verification of drug authenticity at any point in the supply chain.",
                gradient: "from-primary/20 to-primary/5",
              },
              {
                icon: BarChart3,
                title: "Advanced Analytics",
                description:
                  "Gain insights into supply chain efficiency and identify areas for improvement.",
                gradient: "from-accent/20 to-accent/5",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * index, duration: 0.5 }}
                whileHover={{ 
                  scale: 1.02,
                  transition: { duration: 0.2 }
                }}
                className={`p-8 rounded-2xl bg-gradient-to-br ${feature.gradient} backdrop-blur-sm border border-white/20 shadow-xl group hover:shadow-2xl hover:shadow-primary/5 relative overflow-hidden`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                <motion.div 
                  className="bg-gradient-to-r from-primary to-accent w-14 h-14 rounded-xl flex items-center justify-center mb-6"
                  whileHover={{
                    scale: 1.1,
                    rotate: [0, -10, 10, -10, 0],
                    transition: { duration: 0.5 }
                  }}
                >
                  <feature.icon className="h-7 w-7 text-white" />
                </motion.div>
                <h3 className="text-xl font-semibold mb-3 flex items-center">
                  {feature.title}
                  <ChevronRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transform group-hover:translate-x-1 transition-all" />
                </h3>
                <p className="text-foreground/70">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* User Types Section */}
      <section className="py-20 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-accent/5"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(0,145,255,0.03)_0%,transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(0,199,162,0.03)_0%,transparent_50%)]"></div>
        
        <div className="container mx-auto px-6 md:px-8 relative">
          <div className="text-center mb-16">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-block px-4 py-1.5 mb-4 text-xs font-medium tracking-wider text-primary bg-primary/10 rounded-full ring-1 ring-primary/20"
            >
              For Everyone
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
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
              Whether you're a manufacturer, distributor, pharmacist, or doctor,
              provides the tools you need to ensure pharmaceutical integrity.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                title: "Manufacturers",
                icon: Building2,
                features: [
                  "Create and manage drug batches",
                  "Track manufacturing processes",
                  "Maintain quality control records",
                  "Generate compliance documentation",
                ],
                cta: "Start manufacturing",
                color: "from-primary/5 to-primary/10",
                delay: 0,
              },
              {
                title: "Distributors",
                icon: Truck,
                features: [
                  "Track shipments in real-time",
                  "Verify drug authenticity",
                  "Manage warehousing operations",
                  "Optimize distribution routes",
                ],
                cta: "Optimize distribution",
                color: "from-accent/5 to-accent/10",
                delay: 0.1,
              },
              {
                title: "Pharmacists",
                icon: PillIcon,
                features: [
                  "Verify medication authenticity",
                  "Track prescription fulfillment",
                  "Manage inventory efficiently",
                  "Ensure patient safety",
                ],
                cta: "Enhance patient care",
                color: "from-primary/5 to-primary/10",
                delay: 0.2,
              },
              {
                title: "Doctors",
                icon: Stethoscope,
                features: [
                  "Issue secure digital prescriptions",
                  "Verify medication sources",
                  "Monitor patient medication history",
                  "Reduce medication errors",
                ],
                cta: "Improve prescribing",
                color: "from-accent/5 to-accent/10",
                delay: 0.3,
              },
            ].map((role, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: role.delay, duration: 0.5 }}
                whileHover={{ 
                  y: -5,
                  scale: 1.02,
                  transition: { duration: 0.2 }
                }}
                className="rounded-2xl overflow-hidden border border-border/50 shadow-lg bg-background/60 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:border-primary/20 group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                <div className={`bg-gradient-to-r ${role.color} p-8 flex items-center gap-4 relative`}>
                  <motion.div 
                    className="p-3 bg-background/80 backdrop-blur-md rounded-xl"
                    whileHover={{
                      scale: 1.1,
                      rotate: [0, -10, 10, -10, 0],
                      transition: { duration: 0.5 }
                    }}
                  >
                    <role.icon className="h-8 w-8 text-primary" />
                  </motion.div>
                  <h3 className="text-2xl font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    {role.title}
                  </h3>
                </div>
                <div className="p-8 bg-background/40 backdrop-blur-sm">
                  <ul className="space-y-4 mb-8">
                    {role.features.map((feature, i) => (
                      <motion.li 
                        key={i} 
                        className="flex items-start group"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * i + role.delay, duration: 0.3 }}
                      >
                        <div className="p-1 rounded-full bg-primary/10 mr-3 group-hover:bg-primary/20 transition-colors">
                          <Check className="h-5 w-5 text-primary" />
                        </div>
                        <span className="text-foreground/80 group-hover:text-foreground transition-colors">
                          {feature}
                        </span>
                      </motion.li>
                    ))}
                  </ul>
                  <Link to="/signup">
                    <Button 
                      variant="outline" 
                      className="w-full group hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                    >
                      <span className="group-hover:translate-x-1 transition-transform">
                        {role.cta}
                      </span>
                      <ExternalLink className="ml-2 h-4 w-4 group-hover:rotate-45 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-accent/5"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_107%,rgba(0,145,255,0.05)_0%,transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_-7%,rgba(0,199,162,0.05)_0%,transparent_50%)]"></div>
        
        <div className="container mx-auto px-6 md:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative rounded-3xl overflow-hidden border border-border/50 shadow-2xl bg-background/60 backdrop-blur-sm"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 opacity-50"></div>
            <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px]"></div>
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between p-10 md:p-16 gap-12">
              <div className="lg:max-w-2xl">
                <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
                >
                  Ready to secure your pharmaceutical supply chain?
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="text-foreground/70 text-lg mb-8"
                >
                  Join the growing network of healthcare professionals using
                  MedChain to ensure medication safety and authenticity.
                </motion.p>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="flex flex-col sm:flex-row gap-4"
                >
                  <Link to="/signup">
                    <Button 
                      size="lg" 
                      className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
                    >
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link to="/contact">
                    <Button 
                      size="lg" 
                      variant="outline"
                      className="border-primary/20 hover:bg-primary/10 transition-colors"
                    >
                      Contact Sales
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </motion.div>
              </div>
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="bg-background/80 backdrop-blur-xl p-8 rounded-2xl shadow-xl border border-border/50 w-full lg:w-auto"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-gradient-to-r from-primary to-accent rounded-full"></div>
                    <div className="text-base font-medium bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Security Stats</div>
                  </div>
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
                <div className="space-y-6">
                  {[
                    { label: "Tracked Batches", value: "100,000+", icon: Building2 },
                    { label: "Verified Transactions", value: "1.2M+", icon: Shield },
                    { label: "Platform Users", value: "5,000+", icon: Users },
                  ].map((stat, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5 + (i * 0.1), duration: 0.5 }}
                      className="flex justify-between items-center p-3 rounded-xl hover:bg-primary/5 transition-colors group"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                          <stat.icon className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-foreground/60 group-hover:text-foreground/80 transition-colors">{stat.label}</span>
                      </div>
                      <span className="font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{stat.value}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent"></div>
        <div className="container mx-auto px-6 md:px-8 relative">
          <div className="text-center mb-16">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-block px-4 py-1.5 mb-4 text-xs font-medium tracking-wider text-primary bg-primary/10 rounded-full ring-1 ring-primary/20"
            >
              Testimonials
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
            >
              What Our Users Say
            </motion.h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote:
                  "MedChain has revolutionized how we manage our pharmaceutical supply chain. The transparency and security it provides is invaluable.",
                author: "Dr. Sarah Johnson",
                role: "Chief Pharmacist",
                company: "MedCare Hospital",
                gradient: "from-primary/20 to-primary/5",
              },
              {
                quote:
                  "Implementation was smooth and the results were immediate. We've seen a 40% reduction in verification time.",
                author: "Michael Chen",
                role: "Supply Chain Director",
                company: "Global Pharma Ltd",
                gradient: "from-accent/20 to-accent/5",
              },
              {
                quote:
                  "The real-time tracking and authentication features have helped us eliminate counterfeit products entirely.",
                author: "Emma Williams",
                role: "Quality Control Manager",
                company: "PharmaTech Solutions",
                gradient: "from-primary/20 to-primary/5",
              },
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * index, duration: 0.5 }}
                whileHover={{ 
                  y: -5,
                  scale: 1.02,
                  rotateX: 5,
                  rotateY: 5,
                  transition: { duration: 0.2 }
                }}
                className={`p-8 rounded-2xl bg-gradient-to-br ${testimonial.gradient} backdrop-blur-sm border border-white/20 shadow-xl group hover:shadow-2xl hover:shadow-primary/5 relative overflow-hidden`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 fill-primary text-primary"
                    />
                  ))}
                </div>
                <p className="text-foreground/80 mb-6 text-lg italic leading-relaxed">
                  "{testimonial.quote}"
                </p>
                <div className="border-t border-white/20 pt-6">
                  <p className="font-semibold text-lg">{testimonial.author}</p>
                  <p className="text-sm text-foreground/60">
                    {testimonial.role}
                  </p>
                  <p className="text-sm text-foreground/60">
                    {testimonial.company}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-16 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/5 to-transparent"></div>
        <div className="container mx-auto px-6 md:px-8 relative">
          <div className="text-center mb-12">
            <p className="text-lg font-medium text-foreground/80 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Trusted by Industry Leaders
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-12 items-center justify-items-center">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * i, duration: 0.5 }}
                className="h-12 w-full flex items-center justify-center"
              >
                <div className="bg-gradient-to-r from-primary/20 to-accent/20 h-6 w-32 rounded-lg animate-pulse"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative overflow-hidden border-t border-border/30">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 to-background"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_107%,rgba(0,145,255,0.05)_0%,transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_-7%,rgba(0,199,162,0.05)_0%,transparent_50%)]"></div>
        
        <div className="container mx-auto px-6 md:px-8 relative py-16">
          <div className="flex flex-col md:flex-row justify-between gap-12 mb-16">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="md:max-w-sm"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-primary to-accent flex items-center justify-center">
                  <Shield className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  MedChain
                </h3>
              </div>
              <p className="text-foreground/70 text-base leading-relaxed">
                Secure pharmaceutical tracking and verification for the entire
                supply chain. Ensuring medication safety and authenticity at every step.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12 lg:gap-16"
            >
              <div className="space-y-4">
                <h4 className="text-base font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Product</h4>
                <ul className="space-y-3">
                  {[
                    { label: "Features", href: "#features" },
                    { label: "Security", href: "#security" },
                    { label: "Pricing", href: "#pricing" },
                    { label: "Demos", href: "#demos" }
                  ].map((item, i) => (
                    <motion.li 
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 + (i * 0.1) }}
                    >
                      <Link 
                        to={item.href}
                        className="text-sm text-foreground/60 hover:text-primary transition-colors flex items-center group"
                      >
                        <ChevronRight className="w-3 h-3 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                        {item.label}
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </div>

              <div className="space-y-4">
                <h4 className="text-base font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Company</h4>
                <ul className="space-y-3">
                  {[
                    { label: "About", href: "#about" },
                    { label: "Blog", href: "#blog" },
                    { label: "Careers", href: "#careers" },
                    { label: "Contact", href: "#contact" }
                  ].map((item, i) => (
                    <motion.li 
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + (i * 0.1) }}
                    >
                      <Link 
                        to={item.href}
                        className="text-sm text-foreground/60 hover:text-primary transition-colors flex items-center group"
                      >
                        <ChevronRight className="w-3 h-3 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                        {item.label}
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </div>

              <div className="space-y-4">
                <h4 className="text-base font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Resources</h4>
                <ul className="space-y-3">
                  {[
                    { label: "Documentation", href: "#docs" },
                    { label: "Support", href: "#support" },
                    { label: "API", href: "#api" },
                    { label: "Privacy", href: "#privacy" }
                  ].map((item, i) => (
                    <motion.li 
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.4 + (i * 0.1) }}
                    >
                      <Link 
                        to={item.href}
                        className="text-sm text-foreground/60 hover:text-primary transition-colors flex items-center group"
                      >
                        <ChevronRight className="w-3 h-3 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                        {item.label}
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="border-t border-border/30 pt-8 flex flex-col md:flex-row justify-between items-center gap-4"
          >
            <div className="flex items-center gap-6">
              <p className="text-sm text-foreground/60">
                &copy; {new Date().getFullYear()} MedChain. All rights reserved.
              </p>
              <div className="h-4 w-px bg-border/30"></div>
              <div className="flex items-center gap-4">
                {[
                  { label: "Terms", href: "#terms" },
                  { label: "Privacy", href: "#privacy" },
                  { label: "Cookies", href: "#cookies" }
                ].map((item, i) => (
                  <Link
                    key={i}
                    to={item.href}
                    className="text-sm text-foreground/60 hover:text-primary transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-4">
              {[
                { icon: LinkIcon, href: "#twitter", label: "Twitter" },
                { icon: Building2, href: "#linkedin", label: "LinkedIn" },
                { icon: Users, href: "#github", label: "GitHub" }
              ].map((item, i) => (
                <Link
                  key={i}
                  to={item.href}
                  className="p-2 rounded-lg hover:bg-primary/10 transition-colors group"
                  aria-label={item.label}
                >
                  <item.icon className="h-5 w-5 text-foreground/60 group-hover:text-primary transition-colors" />
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
