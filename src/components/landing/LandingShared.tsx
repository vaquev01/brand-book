"use client"

import { useRef } from "react"
import { motion, useInView, type Variants } from "framer-motion"

/* ═══════════════════════════════════════════════════════════════════════════════
   ANIMATION VARIANTS (shared across landing sections)
   ═══════════════════════════════════════════════════════════════════════════════ */

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
}

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
}

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
}

/* ═══════════════════════════════════════════════════════════════════════════════
   SUB-COMPONENTS (shared across landing sections)
   ═══════════════════════════════════════════════════════════════════════════════ */

export function SectionWrapper({
  children,
  className = "",
  id,
}: {
  children: React.ReactNode
  className?: string
  id?: string
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <motion.section
      ref={ref}
      id={id}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={staggerContainer}
      className={`relative z-10 px-6 sm:px-10 lg:px-16 ${className}`}
    >
      {children}
    </motion.section>
  )
}

export function GlassCard({
  children,
  className = "",
  hoverGlow,
}: {
  children: React.ReactNode
  className?: string
  hoverGlow?: string
}) {
  return (
    <motion.div
      variants={fadeInUp}
      className={`group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl overflow-hidden transition-all duration-500 hover:border-white/[0.12] hover:bg-white/[0.04] ${className}`}
      style={
        hoverGlow
          ? {
              background: `linear-gradient(135deg, ${hoverGlow}08, transparent 60%)`,
            }
          : undefined
      }
    >
      {/* Gradient border effect */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `linear-gradient(135deg, ${hoverGlow || "#6366f1"}15, transparent 50%)`,
        }}
      />
      <div className="relative z-10">{children}</div>
    </motion.div>
  )
}
