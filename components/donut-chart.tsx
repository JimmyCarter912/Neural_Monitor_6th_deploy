"use client"

import { motion, useInView } from "framer-motion"
import { useEffect, useRef, useState } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"

interface DonutChartProps {
  completed: number
  total: number
  percentage: number
}

function easeOutQuart(x: number): number {
  return 1 - Math.pow(1 - x, 4)
}

export default function DonutChart({ completed, total, percentage }: DonutChartProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })

  const [animatedData, setAnimatedData] = useState([
    { name: "Completed", value: 0 },
    { name: "Remaining", value: total },
  ])
  const [displayPercentage, setDisplayPercentage] = useState(0)

  useEffect(() => {
    if (isInView) {
      let animationFrameId: number
      const startTime = Date.now()
      const duration = 2000 // 2 seconds
      const targetCompleted = completed
      const targetRemaining = total - completed

      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        const easedProgress = easeOutQuart(progress)

        const currentCompleted = targetCompleted * easedProgress
        const currentRemaining = total - currentCompleted

        setAnimatedData([
          { name: "Completed", value: currentCompleted },
          { name: "Remaining", value: currentRemaining },
        ])
        setDisplayPercentage(percentage * easedProgress)

        if (progress < 1) {
          animationFrameId = requestAnimationFrame(animate)
        }
      }

      animationFrameId = requestAnimationFrame(animate)

      return () => {
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId)
        }
      }
    }
  }, [isInView, completed, total, percentage])

  const COLORS = ["#b68cff", "rgba(42, 31, 69, 0.5)"]

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="glass-card p-6 transition-all duration-300 hover:scale-[1.02]"
    >
      <h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-4 text-center">OVERVIEW DAILY PROGRESS</h3>

      <div className="relative">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={animatedData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
              animationDuration={0}
              isAnimationActive={false}
            >
              {animatedData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index]}
                  style={{
                    filter: index === 0 ? "drop-shadow(0 0 12px rgba(182, 140, 255, 0.8))" : "none",
                  }}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl font-bold text-[var(--text-primary)]">{Math.round(displayPercentage)}%</div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
