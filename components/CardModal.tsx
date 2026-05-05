"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

interface Props {
  onClose: () => void;
  children: React.ReactNode;
}

export default function CardModal({ onClose, children }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const shouldReduceMotion = useReducedMotion() ?? false;

  function dismiss() {
    setVisible(false);
  }

  async function handleDownload() {
    if (!cardRef.current) return;
    const html2canvas = (await import("html2canvas")).default;
    const canvas = await html2canvas(cardRef.current, {
      useCORS: true,
      allowTaint: false,
      backgroundColor: null,
      scale: 2,
      width: 390,
      height: 690,
    });
    const link = document.createElement("a");
    link.download = "dota-wrapped.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  return (
    <AnimatePresence onExitComplete={onClose}>
      {visible && (
        <motion.div
          key="backdrop"
          initial={shouldReduceMotion ? {} : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={shouldReduceMotion ? {} : { opacity: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.3 }}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.85)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-start",
            overflowY: "auto",   /* allows scroll on short/narrow viewports */
            zIndex: 9999,
            padding: "20px",
          }}
          onClick={dismiss}
        >
          {/* Close button */}
          <button
            onClick={dismiss}
            style={{
              position: "fixed",
              top: 20,
              right: 20,
              background: "rgba(255,255,255,0.12)",
              border: "none",
              borderRadius: "50%",
              width: 40,
              height: 40,
              color: "white",
              fontSize: 20,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              lineHeight: 1,
              zIndex: 10000,
            }}
            aria-label="Close"
          >
            ×
          </button>

          {/* Card container — clamps to viewport width on small screens */}
          <motion.div
            ref={cardRef}
            initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={shouldReduceMotion ? {} : { opacity: 0, scale: 0.95, y: 10 }}
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : { type: "spring", stiffness: 200, damping: 25, duration: 0.4 }
            }
            style={{
              width: 390,
              maxWidth: "calc(100vw - 40px)",   /* 320px fix: card can't exceed viewport */
              height: 690,
              borderRadius: 20,
              overflow: "hidden",
              flexShrink: 0,
              marginTop: 48,    /* space for the fixed close button */
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>

          {/* Download button */}
          <button
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              handleDownload();
            }}
            style={{
              marginTop: 20,
              marginBottom: 20,
              padding: "12px 32px",
              backgroundColor: "white",
              color: "black",
              border: "none",
              borderRadius: 24,
              fontSize: 13,
              fontWeight: 900,
              letterSpacing: "0.08em",
              cursor: "pointer",
              textTransform: "uppercase",
              flexShrink: 0,
            }}
          >
            Download PNG
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
