"use client";
import { useEffect } from "react";
import { motion, stagger, useAnimate } from "framer-motion";
import { cn } from "@/lib/utils";

export const TextGenerateEffect = ({
  words,
  className,
}: {
  words: string;
  className?: string;
}) => {
  const [scope, animate] = useAnimate();
  
  useEffect(() => {
    const animateText = async () => {
      await animate(
        "span",
        {
          opacity: 1,
        },
        {
          duration: 2,
          delay: stagger(0.2),
        }
      );
    };

    animateText();
  }, [animate]);

  const characters = words.split("");
  
  return (
    <motion.div ref={scope} className={cn("font-bold", className)}>
      {characters.map((char, i) => (
        <motion.span
          initial={{ opacity: 0 }}
          key={char + i}
        >
          {char}
        </motion.span>
      ))}
    </motion.div>
  );
}; 