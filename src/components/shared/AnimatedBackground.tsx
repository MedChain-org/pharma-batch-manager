import React from "react";
import { motion } from "framer-motion";

const AnimatedBackground: React.FC = () => {
  // DNA Helix points generator
  const generateDNAPoints = (count: number) => {
    return Array.from({ length: count }, (_, i) => ({
      x: Math.sin(i * 0.5) * 40,
      y: i * 15,
      delay: i * 0.1,
    }));
  };

  const dnaPoints = generateDNAPoints(30);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-gradient-to-b from-background via-primary/10 to-background">
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

      {/* DNA Helix Animation - Right Side */}
      <div className="absolute right-20 top-1/4 h-[600px] w-20">
        {dnaPoints.map((point, i) => (
          <div key={`dna-right-${i}`} className="contents">
            <motion.div
              className="absolute w-4 h-4 rounded-full bg-primary/40"
              style={{ left: "50%", top: point.y }}
              animate={{
                x: [point.x, -point.x, point.x],
                scale: [1, 1.3, 1],
                opacity: [0.3, 0.7, 0.3],
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
              style={{ left: "50%", top: point.y }}
              animate={{
                x: [-point.x, point.x, -point.x],
                scale: [1, 1.3, 1],
                opacity: [0.3, 0.7, 0.3],
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
      </div>

      {/* DNA Helix Animation - Left Side */}
      <div className="absolute left-20 top-1/3 h-[600px] w-20">
        {dnaPoints.map((point, i) => (
          <div key={`dna-left-${i}`} className="contents">
            <motion.div
              className="absolute w-4 h-4 rounded-full bg-primary/40"
              style={{ left: "50%", top: point.y }}
              animate={{
                x: [-point.x, point.x, -point.x],
                scale: [1, 1.3, 1],
                opacity: [0.3, 0.7, 0.3],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                delay: point.delay + 2,
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
              style={{ left: "50%", top: point.y }}
              animate={{
                x: [point.x, -point.x, point.x],
                scale: [1, 1.3, 1],
                opacity: [0.3, 0.7, 0.3],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                delay: point.delay + 2,
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
      </div>

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
