import React from "react";
import { motion } from "framer-motion";

const FloatingBubbles: React.FC = () => {
  const bottomBubbles = Array.from({ length: 6 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 50 + 50,
    size: Math.random() * 80 + 40,
    delay: Math.random() * 1,
    duration: Math.random() * 8 + 10, // Slightly longer duration
    direction: "up",
  }));

  const topBubbles = Array.from({ length: 6 }).map((_, i) => ({
    id: i + 6,
    x: Math.random() * 100,
    y: Math.random() * 50,
    size: Math.random() * 80 + 40,
    delay: Math.random() * 1,
    duration: Math.random() * 8 + 10,
    direction: "down",
  }));

  const bubbles = [...bottomBubbles, ...topBubbles];

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {bubbles.map((bubble) => (
        <motion.div
          key={bubble.id}
          className="absolute rounded-full bg-gradient-to-br from-[#0091ff]/30 to-[#00c7a2]/30 backdrop-blur-sm"
          style={{
            width: bubble.size,
            height: bubble.size,
            left: `${bubble.x}%`,
            top: `${bubble.y}%`,
          }}
          initial={{ opacity: 0.3, scale: 0.8 }}
          animate={{
            opacity: [0.3, 0.5, 0.3],
            scale: [0.8, 0.9, 0.8],
            y: bubble.direction === "up" 
              ? [bubble.y, bubble.y - 150, bubble.y - 300]
              : [bubble.y, bubble.y + 150, bubble.y + 300],
            x: [bubble.x, bubble.x + (Math.random() * 50 - 25)],
          }}
          transition={{
            duration: bubble.duration,
            delay: bubble.delay,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
};

export default FloatingBubbles;