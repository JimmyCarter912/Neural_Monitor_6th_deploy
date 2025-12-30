"use client"

import { useMemo } from "react"
import { motion, useMotionValue, useTransform, animate } from "framer-motion"
import { useEffect } from "react"
import type { Task } from "./neural-monitor"

interface TopTargetsProps {
  tasks: Task[]
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

export default function TopTargets({ tasks }: TopTargetsProps) {
  const sortedTasks = useMemo(() => {
    return [...tasks]
      .map((task) => ({
        ...task,
        percentage: task.target > 0 ? Math.round((task.completedDays.length / task.target) * 100) : 0,
      }))
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 10)
  }, [tasks])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="glass-card p-6 transition-all duration-300 hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:scale-[1.01]"
    >
      <h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-4">TOP 10 TARGETS EXECUTED</h3>

      <div className="space-y-2">
        {sortedTasks.map((task, index) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.03 }}
            className="group flex items-center justify-between text-sm p-2 rounded transition-all duration-200 hover:bg-[var(--bg-card)]/30"
          >
            <span className="text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
              {task.name}
            </span>
            <span className="text-[var(--text-primary)] font-semibold">
              <AnimatedNumber value={task.percentage} />%
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
