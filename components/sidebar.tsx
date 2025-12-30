"use client"

import { motion, useMotionValue, useTransform, animate } from "framer-motion"
import { useEffect } from "react"
import CustomSelect from "./custom-select"

interface SidebarProps {
  currentMonth: string
  currentYear: number
  onYearChange: (year: number) => void
  onMonthChange: (month: number) => void
  months: string[]
  totalProgress: number
  totalTarget: number
  completionPercentage: number
}

function AnimatedNumber({ value }: { value: number }) {
  const motionValue = useMotionValue(0)
  const rounded = useTransform(motionValue, (latest) => Math.round(latest))

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration: 1,
      ease: "easeOut",
    })
    return controls.stop
  }, [value, motionValue])

  return <motion.span>{rounded}</motion.span>
}

export default function Sidebar({
  currentMonth,
  currentYear,
  onYearChange,
  onMonthChange,
  months,
  totalProgress,
  totalTarget,
  completionPercentage,
}: SidebarProps) {
  const monthOptions = months.map((month, index) => ({
    value: index,
    label: month,
  }))

  const yearOptions = Array.from({ length: 10 }, (_, i) => {
    const year = currentYear - 5 + i
    return { value: year, label: year.toString() }
  })

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      {/* Current Month */}
      <div className="glass-card p-4 transition-all duration-300 hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:scale-[1.02]">
        <h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-3">Current Month</h3>
        <div className="bg-[var(--glow-soft)] rounded-full px-4 py-2 text-center">
          <span className="text-sm font-medium text-[var(--text-primary)]">~ {currentMonth} ~</span>
        </div>
      </div>

      {/* Calendar Settings */}
      <div className="glass-card p-4 transition-all duration-300 hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:scale-[1.02]">
        <h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-3">Calendar Settings</h3>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <span className="text-xs text-[var(--text-muted)] font-semibold">YEAR</span>
            <CustomSelect value={currentYear} options={yearOptions} onChange={onYearChange} />
          </div>
          <div className="space-y-1.5">
            <span className="text-xs text-[var(--text-muted)] font-semibold">MONTH</span>
            <CustomSelect value={months.indexOf(currentMonth)} options={monthOptions} onChange={onMonthChange} />
          </div>
        </div>
      </div>

      {/* Overview */}
      <div className="glass-card p-4 transition-all duration-300 hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:scale-[1.02]">
        <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-6">OVERVIEW</h3>

        {/* Total Progress */}
        <div className="mb-6">
          <h4 className="text-xs text-[var(--text-muted)] mb-2 font-semibold">TOTAL PROGRESS</h4>
          <div className="text-3xl font-semibold text-[var(--text-primary)] mb-1">
            <AnimatedNumber value={totalProgress} />/<AnimatedNumber value={totalTarget} />
          </div>
          <div className="text-xs text-[var(--text-secondary)]">COMPLETED</div>
        </div>

        {/* Weekly Progress */}
        <div>
          <h4 className="text-xs text-[var(--text-muted)] mb-3 font-semibold">WEEKLY PROGRESS</h4>
          <div className="h-8 bg-[var(--bg-card)] rounded overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${completionPercentage}%` }}
              transition={{ duration: 1, delay: 0.3 }}
              className="h-full bg-[var(--glow-main)] rounded"
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
}
