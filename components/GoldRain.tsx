"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

interface Particle {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  drift: number;
}

export default function GoldRain() {
  const shouldReduceMotion = useReducedMotion() ?? false;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    if (shouldReduceMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let lastTimestamp = 0;

    function initCanvas() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
    }

    function initParticles() {
      particlesRef.current = Array.from({ length: 60 }, () => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: 2 + Math.random() * 3,
        speed: 0.5 + Math.random() * 1,
        opacity: 0.1 + Math.random() * 0.3,
        drift: (Math.random() - 0.5) * 0.4,
      }));
    }

    initCanvas();
    initParticles();

    const observer = new ResizeObserver(() => {
      initCanvas();
    });
    observer.observe(document.documentElement);

    function draw(timestamp: number) {
      const delta = lastTimestamp === 0 ? 1 : (timestamp - lastTimestamp) / 16.67;
      lastTimestamp = timestamp;

      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);

      for (const p of particlesRef.current) {
        ctx!.globalAlpha = p.opacity;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
        ctx!.fillStyle = "rgb(200,168,75)";
        ctx!.fill();

        p.y += p.speed * delta;
        p.x += p.drift * delta;

        if (p.y > canvas!.height + 20) {
          p.x = Math.random() * canvas!.width;
          p.y = -20;
          p.size = 2 + Math.random() * 3;
          p.speed = 0.5 + Math.random() * 1;
          p.opacity = 0.1 + Math.random() * 0.3;
          p.drift = (Math.random() - 0.5) * 0.4;
        }
      }

      ctx!.globalAlpha = 1;
      animId = requestAnimationFrame(draw);
    }

    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      observer.disconnect();
    };
  }, [shouldReduceMotion]);

  if (shouldReduceMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 2,
        pointerEvents: "none",
        willChange: "transform",
      }}
    />
  );
}
