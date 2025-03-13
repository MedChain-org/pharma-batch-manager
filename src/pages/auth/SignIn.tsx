import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import AuthLayout from "@/components/auth/AuthLayout";
import { AtSign, Lock } from "lucide-react";
import UserTypeSelector from "@/components/shared/UserTypeSelector";
import { UserRole } from "@/utils/types";
import { supabase } from "@/lib/supabase";
import { fetchUserById } from "@/lib/database";
import FloatingBubbles from "@/components/shared/FloatingBubbles";

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
  rememberMe: z.boolean().optional(),
});

const SignIn: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (!selectedRole) {
      toast.error("Please select your role", {
        description: "You need to select your role to sign in.",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Authenticate with Supabase
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) throw error;

      if (authData.user) {
        // Fetch the user's actual role from the database
        const userDetails = await fetchUserById(authData.user.id);

        if (!userDetails) {
          throw new Error("User details not found");
        }

        // Check if the selected role matches the user's actual role
        if (userDetails.role !== selectedRole) {
          throw new Error(
            `You do not have permissions to access the ${selectedRole} dashboard. Your role is ${userDetails.role}.`
          );
        }

        // Store the verified role in user metadata
        await supabase.auth.updateUser({
          data: { role: userDetails.role },
        });

        toast.success("Successfully signed in", {
          description: "Welcome back to MedChain",
        });

        // Redirect to dashboard based on verified role
        navigate(`/dashboard/${userDetails.role.toLowerCase()}`);
      }
    } catch (error: any) {
      console.error("Error signing in:", error);
      toast.error("Failed to sign in", {
        description:
          error.message || "Please check your credentials and try again.",
      });

      // Sign out the user if authentication succeeded but role verification failed
      if (
        error.message &&
        error.message.includes("You do not have permissions")
      ) {
        await supabase.auth.signOut();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Enter your credentials to continue your journey"
    >
      <div className="relative z-0">
        <FloatingBubbles />
        <div className="relative z-10 bg-gradient-to-r from-primary/5 to-accent/5 p-6 rounded-lg border border-primary/10 mb-6 backdrop-blur-sm">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-3 text-primary">
                    I am a...
                  </h3>
                  <UserTypeSelector
                    selectedRole={selectedRole}
                    onChange={handleRoleChange}
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground/80">Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <AtSign className="absolute left-3 top-3 h-4 w-4 text-primary/60" />
                          <Input
                            type="email"
                            placeholder="your.email@example.com"
                            className="pl-10 bg-background/60 focus:bg-background border-primary/20 focus:border-primary/40"
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
                      <div className="flex items-center justify-between">
                        <FormLabel className="text-foreground/80">
                          Password
                        </FormLabel>
                        <Link
                          to="/forgot-password"
                          className="text-xs text-primary hover:text-primary/80 transition-colors"
                        >
                          Forgot password?
                        </Link>
                      </div>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-primary/60" />
                          <Input
                            type="password"
                            placeholder="••••••••"
                            className="pl-10 bg-background/60 focus:bg-background border-primary/20 focus:border-primary/40"
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
                  name="rememberMe"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="border-primary/30 data-[state=checked]:border-primary"
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal cursor-pointer text-foreground/70">
                        Remember me for 30 days
                      </FormLabel>
                    </FormItem>
                  )}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#0091ff] to-[#00c7a2] hover:from-[#00c7a2] hover:to-[#0091ff] transition-colors"
                  disabled={isLoading || !selectedRole}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                      Signing in...
                    </div>
                  ) : (
                    "Sign in"
                  )}
                </Button>
              </motion.div>
            </form>
          </Form>
        </div>
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="font-medium text-primary hover:underline transition-colors"
          >
            Create an account
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default SignIn;
