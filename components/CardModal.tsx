"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  onClose: () => void;
  children: React.ReactNode;
}

export default function CardModal({ onClose, children }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.85)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px",
          }}
          onClick={dismiss}
        >
          {/* Close button */}
          <button
            onClick={dismiss}
            style={{
              position: "absolute",
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
            }}
            aria-label="Close"
          >
            ×
          </button>

          {/* Card container */}
          <motion.div
            ref={cardRef}
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 25,
              duration: 0.4,
            }}
            style={{
              width: 390,
              height: 690,
              borderRadius: 20,
              overflow: "hidden",
              flexShrink: 0,
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
              padding: "12px 32px",
              backgroundColor: "#0d9488",
              color: "white",
              border: "none",
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: "0.05em",
              cursor: "pointer",
              textTransform: "uppercase",
            }}
          >
            Download PNG
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
