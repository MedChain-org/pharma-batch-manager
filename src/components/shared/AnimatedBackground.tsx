import React, { useState, useEffect } from "react";
import { motion, TargetAndTransition } from "framer-motion";

const AnimatedBackground: React.FC = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // DNA Helix points generator
  const generateDNAPoints = (count: number) => {
    return Array.from({ length: count }, (_, i) => ({
      x: i * 25,
      y: Math.sin(i * 0.5) * 40,
      delay: i * 0.1,
    }));
  };

  const dnaPoints = generateDNAPoints(40);

  // Function to calculate distance from mouse to a point
  const getDistanceFromMouse = (elementX: number, elementY: number, containerX: number, containerY: number) => {
    const dx = mousePosition.x - (elementX + containerX);
    const dy = mousePosition.y - (elementY + containerY);
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Function to get hover animation values based on distance
  const getHoverAnimation = (point: { y: number }, distance: number): TargetAndTransition => {
    const maxDistance = 100; // Maximum distance for hover effect
    const intensity = Math.max(0, 1 - distance / maxDistance);
    const baseScale = 1 + intensity * 0.5;
    const baseOpacity = 0.3 + intensity * 0.7;

    return {
      y: [point.y, -point.y, point.y],
      scale: [baseScale, baseScale * 1.3, baseScale],
      opacity: [baseOpacity, baseOpacity + 0.2, baseOpacity],
    };
  };

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-gradient-to-b from-background via-primary/10 to-background">
      {/* Mouse Follow Effect */}
      <motion.div
        className="pointer-events-none absolute w-[500px] h-[500px] rounded-full"
        animate={{
          x: mousePosition.x - 250,
          y: mousePosition.y - 250,
        }}
        transition={{
          type: "spring",
          damping: 30,
          stiffness: 200,
          mass: 0.5,
        }}
        style={{
          background: 'radial-gradient(circle, var(--primary-rgb, rgba(0,100,255,0.08)) 0%, transparent 70%)',
          mixBlendMode: 'plus-lighter',
        }}
      />

      {/* Static Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-primary/5 to-accent/5" />

      {/* Background Pills */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={`pill-${i}`}
          className={`absolute w-[200px] h-[80px] blur-xl ${
            i % 2 === 0 ? "bg-primary/20" : "bg-accent/20"
          }`}
          style={{
            borderRadius: "40px",
            left: `${15 + i * 20}%`,
            top: `${10 + (i % 3) * 30}%`,
            opacity: 0.15,
          }}
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, i % 2 === 0 ? 15 : -15, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 8 + i,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 2,
          }}
        >
          {/* Pill shine */}
          <div
            className="absolute inset-0"
            style={{
              borderRadius: "40px",
              background:
                "linear-gradient(to bottom, var(--background-rgb, rgba(255,255,255,0.2)) 0%, transparent 100%)",
              transform: "translateY(-30%)",
            }}
          />
        </motion.div>
      ))}

      {/* DNA Helix Animation - Upper */}
      <motion.div 
        className="absolute left-0 top-1/4 h-20 w-[1000px]"
        animate={{
          x: ["-100%", "100%"],
          y: [-50, 50, -50],
          rotate: [-2, 2, -2],
        }}
        transition={{
          x: {
            duration: 40,
            repeat: Infinity,
            ease: "linear"
          },
          y: {
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          },
          rotate: {
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }}
      >
        {dnaPoints.map((point, i) => (
          <div key={`dna-upper-${i}`} className="contents">
            <motion.div
              className="absolute w-4 h-4 rounded-full bg-primary/40"
              style={{ left: point.x, top: "50%" }}
              animate={{
                y: [point.y, -point.y, point.y],
                scale: [1, 1.3, 1],
                opacity: [0.3, 0.7, 0.3],
              }}
              whileHover={{
                scale: 2,
                opacity: 0.9,
                transition: { duration: 0.2 }
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                delay: point.delay,
                ease: "easeInOut",
              }}
            >
              <motion.div
                className="absolute inset-0 rounded-full bg-primary/20"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
            <motion.div
              className="absolute w-4 h-4 rounded-full bg-accent/40"
              style={{ left: point.x, top: "50%" }}
              animate={{
                y: [-point.y, point.y, -point.y],
                scale: [1, 1.3, 1],
                opacity: [0.3, 0.7, 0.3],
              }}
              whileHover={{
                scale: 2,
                opacity: 0.9,
                transition: { duration: 0.2 }
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                delay: point.delay,
                ease: "easeInOut",
              }}
            >
              <motion.div
                className="absolute inset-0 rounded-full bg-accent/20"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
          </div>
        ))}
      </motion.div>

      {/* DNA Helix Animation - Lower */}
      <motion.div 
        className="absolute left-0 top-2/3 h-20 w-[1000px]"
        animate={{
          x: ["100%", "-100%"],
          y: [50, -50, 50],
          rotate: [2, -2, 2],
        }}
        transition={{
          x: {
            duration: 40,
            repeat: Infinity,
            ease: "linear"
          },
          y: {
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          },
          rotate: {
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }}
      >
        {dnaPoints.map((point, i) => (
          <div key={`dna-lower-${i}`} className="contents">
            <motion.div
              className="absolute w-4 h-4 rounded-full bg-primary/40"
              style={{ left: point.x, top: "50%" }}
              animate={{
                y: [-point.y, point.y, -point.y],
                scale: [1, 1.3, 1],
                opacity: [0.3, 0.7, 0.3],
              }}
              whileHover={{
                scale: 2,
                opacity: 0.9,
                transition: { duration: 0.2 }
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                delay: point.delay,
                ease: "easeInOut",
              }}
            >
              <motion.div
                className="absolute inset-0 rounded-full bg-primary/20"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
            <motion.div
              className="absolute w-4 h-4 rounded-full bg-accent/40"
              style={{ left: point.x, top: "50%" }}
              animate={{
                y: [point.y, -point.y, point.y],
                scale: [1, 1.3, 1],
                opacity: [0.3, 0.7, 0.3],
              }}
              whileHover={{
                scale: 2,
                opacity: 0.9,
                transition: { duration: 0.2 }
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                delay: point.delay,
                ease: "easeInOut",
              }}
            >
              <motion.div
                className="absolute inset-0 rounded-full bg-accent/20"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
          </div>
        ))}
      </motion.div>

      {/* Molecule Structures */}
      {[...Array(3)].map((_, groupIndex) => (
        <div
          key={`molecule-group-${groupIndex}`}
          className="absolute"
          style={{
            left: `${25 + groupIndex * 25}%`,
            top: `${60 + (groupIndex % 2) * 20}%`,
          }}
        >
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={`molecule-${groupIndex}-${i}`}
              className="absolute w-5 h-5 rounded-full bg-accent/30"
              style={{
                left: Math.cos((i * (Math.PI * 2)) / 4) * 40,
                top: Math.sin((i * (Math.PI * 2)) / 4) * 40,
              }}
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                delay: i * 0.5 + groupIndex,
                ease: "easeInOut",
              }}
            >
              <motion.div
                className="absolute w-20 h-0.5 bg-accent/20 origin-left"
                style={{
                  rotate: i * (360 / 4),
                }}
                animate={{
                  opacity: [0.2, 0.4, 0.2],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 0.5,
                }}
              />
            </motion.div>
          ))}
        </div>
      ))}

      {/* Parallel Lines */}
      <div className="absolute inset-0">
        {/* Horizontal Lines */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(0deg, transparent 0%, transparent calc(100% - 1px), var(--border) calc(100% - 1px))",
            backgroundSize: "100% 80px",
          }}
        />
        {/* Vertical Lines */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(90deg, transparent 0%, transparent calc(100% - 1px), var(--border) calc(100% - 1px))",
            backgroundSize: "80px 100%",
          }}
        />
      </div>
    </div>
  );
};

export default AnimatedBackground;
