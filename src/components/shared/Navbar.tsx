import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu, X, ChevronRight, Moon, Sun } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <motion.header
      initial={false}
      animate={isScrolled ? "scrolled" : "top"}
      variants={{
        top: {
          backgroundColor: "transparent",
          backdropFilter: "none",
          boxShadow: "none",
          borderBottom: "none",
        },
        scrolled: {
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          backdropFilter: "blur(12px)",
          boxShadow: "0 2px 20px rgba(0, 0, 0, 0.1)",
        },
      }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed top-0 left-0 right-0 z-50 py-4"
    >
      <div className="container mx-auto px-6 md:px-8">
        <div
          className={cn(
            "flex items-center justify-between relative rounded-full transition-all duration-300",
            isScrolled
              ? "px-6 py-2 bg-white/40 backdrop-blur-sm border border-white/20"
              : "bg-transparent"
          )}
        >
          {/* Logo */}
          <Link to="/" className="relative group">
            <motion.span
              className="text-2xl font-semibold bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent inline-block"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              MedChain
            </motion.span>
            <motion.div
              className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary/80 to-primary group-hover:w-full"
              transition={{ duration: 0.3 }}
              whileHover={{ width: "100%" }}
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path} className="relative group">
                <motion.span
                  className={cn(
                    "text-sm transition-colors duration-200 inline-block relative",
                    isActive(link.path)
                      ? "text-primary font-medium"
                      : "text-foreground/80 hover:text-primary"
                  )}
                  whileHover={{ y: -2 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  {link.name}
                </motion.span>
                <motion.div
                  className={cn(
                    "absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-primary/80 to-primary",
                    isActive(link.path) ? "w-full" : "w-0 group-hover:w-full"
                  )}
                  transition={{ duration: 0.3 }}
                />
              </Link>
            ))}
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Theme Toggle */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className={cn(
                  "relative overflow-hidden group",
                  isScrolled && "bg-white/40 hover:bg-primary/10",
                  !isScrolled && "hover:bg-primary/10"
                )}
                aria-label="Toggle theme"
              >
                {theme === "light" ? (
                  <Moon className="h-5 w-5 transition-transform rotate-0 scale-100 group-hover:rotate-90" />
                ) : (
                  <Sun className="h-5 w-5 transition-transform rotate-0 scale-100 group-hover:rotate-90" />
                )}
              </Button>
            </motion.div>
            <Link to="/signin">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="ghost"
                  className={cn(
                    "text-sm relative overflow-hidden group",
                    isScrolled &&
                      "bg-white/40 hover:from-[#0091ff]/70 hover:to-[#00c7a2]/70 hover:bg-gradient-to-r",
                    !isScrolled &&
                      "hover:from-[#0091ff]/50 hover:to-[#00c7a2]/50 hover:bg-gradient-to-r"
                  )}
                >
                  <span className="relative z-10 group-hover:text-white transition-colors">
                    Sign In
                  </span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-[#0091ff]/70 to-[#00c7a2]/70 -z-10 opacity-0 group-hover:opacity-100"
                    transition={{ duration: 0.2 }}
                  />
                </Button>
              </motion.div>
            </Link>
            <Link to="/signup">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  className={cn(
                    "text-sm relative group bg-gradient-to-r",
                    isScrolled &&
                      "from-[#0091ff] to-[#00c7a2] hover:from-[#0091ff]/90 hover:to-[#00c7a2]/90",
                    !isScrolled &&
                      "from-[#0091ff]/90 to-[#00c7a2]/90 hover:from-[#0091ff] hover:to-[#00c7a2]"
                  )}
                >
                  <span className="relative z-10">Sign Up</span>
                  <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            className={cn(
              "md:hidden relative z-50",
              !isScrolled && "text-foreground"
            )}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </motion.button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "md:hidden pt-4 pb-2 mt-2 rounded-xl",
                isScrolled &&
                  "bg-white/40 backdrop-blur-sm border border-white/30",
                !isScrolled && "bg-white/10 backdrop-blur-sm"
              )}
            >
              <nav className="flex flex-col space-y-4 px-4">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.path}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      to={link.path}
                      className={cn(
                        "text-sm py-2 transition-colors flex items-center",
                        isActive(link.path)
                          ? "text-primary font-medium"
                          : "text-foreground/80"
                      )}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <ChevronRight
                        className={cn(
                          "w-4 h-4 mr-2 transition-transform",
                          isActive(link.path)
                            ? "text-primary"
                            : "text-foreground/50"
                        )}
                      />
                      {link.name}
                    </Link>
                  </motion.div>
                ))}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: navLinks.length * 0.1 }}
                  className="flex flex-col space-y-2 pt-2"
                >
                  {/* Theme Toggle for Mobile */}
                  <Button
                    variant="ghost"
                    onClick={toggleTheme}
                    className={cn(
                      "w-full justify-start text-sm group gap-2",
                      isScrolled && "bg-white/40 hover:bg-primary/10",
                      !isScrolled && "hover:bg-primary/10"
                    )}
                  >
                    {theme === "light" ? (
                      <>
                        <Moon className="h-4 w-4 group-hover:rotate-90 transition-transform" />
                        <span>Dark Mode</span>
                      </>
                    ) : (
                      <>
                        <Sun className="h-4 w-4 group-hover:rotate-90 transition-transform" />
                        <span>Light Mode</span>
                      </>
                    )}
                  </Button>
                  <Link to="/signin">
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-center text-sm group",
                        isScrolled &&
                          "bg-white/40 hover:from-[#0091ff]/70 hover:to-[#00c7a2]/70 hover:bg-gradient-to-r",
                        !isScrolled &&
                          "hover:from-[#0091ff]/50 hover:to-[#00c7a2]/50 hover:bg-gradient-to-r"
                      )}
                    >
                      <span className="group-hover:text-white transition-colors">
                        Sign In
                      </span>
                    </Button>
                  </Link>
                  <Link to="/signup">
                    <Button
                      className={cn(
                        "w-full justify-center text-sm group bg-gradient-to-r",
                        isScrolled &&
                          "from-[#0091ff] to-[#00c7a2] hover:from-[#0091ff]/90 hover:to-[#00c7a2]/90",
                        !isScrolled &&
                          "from-[#0091ff]/90 to-[#00c7a2]/90 hover:from-[#0091ff] hover:to-[#00c7a2]"
                      )}
                    >
                      <span>Sign Up</span>
                      <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </motion.div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
};

export default Navbar;
