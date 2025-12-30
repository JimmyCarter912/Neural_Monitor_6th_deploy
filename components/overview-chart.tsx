"use client"

import { useMemo, useState, useCallback, useEffect } from "react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { motion } from "framer-motion"
import type { Task } from "./neural-monitor"

interface OverviewChartProps {
  tasks: Task[]
  daysInMonth: number
}

const AnimatedDot = (props: any) => {
  const { cx, cy, index, ...rest } = props
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const delay = index * 50 // 50ms delay between each dot
    const timeout = setTimeout(() => {
      setIsVisible(true)
    }, delay)
    return () => clearTimeout(timeout)
  }, [index])

  if (!isVisible) return null

  return (
    <motion.circle
      cx={cx}
      cy={cy}
      r={4.5}
      fill="#faf5ff"
      stroke="#b68cff"
      strokeWidth={2.5}
      style={{ filter: "drop-shadow(0 0 12px rgba(182, 140, 255, 0.8))" }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        duration: 0.4,
        ease: [0.16, 1, 0.3, 1],
      }}
    />
  )
}

export default function OverviewChart({ tasks, daysInMonth }: OverviewChartProps) {
  const [isInView, setIsInView] = useState(false)

  const chartData = useMemo(() => {
    const data = []
    for (let day = 1; day <= daysInMonth; day++) {
      const dayCompletions = tasks.reduce((sum, task) => {
        return sum + (task.completedDays.includes(day) ? 1 : 0)
      }, 0)
      const percentage = tasks.length > 0 ? (dayCompletions / tasks.length) * 100 : 0
      data.push({
        day,
        percentage: Math.round(percentage * 10) / 10,
      })
    }
    return data
  }, [tasks, daysInMonth])

  const renderDot = useCallback((props: any) => {
    const { key, ...restProps } = props
    return <AnimatedDot key={key} {...restProps} />
  }, [])

  return (
    <motion.div
      className="w-full h-full flex items-center justify-center px-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: isInView ? 1 : 0 }}
      transition={{ duration: 0.3 }}
      onViewportEnter={() => {
        setTimeout(() => setIsInView(true), 300)
      }}
      viewport={{ once: true, margin: "0px" }}
    >
      <div className="w-full max-w-7xl relative">
        <div
          className="absolute inset-0 opacity-80 blur-[200px]"
          style={{
            background:
              "radial-gradient(ellipse at 50% 55%, rgba(168, 85, 247, 0.9) 0%, rgba(147, 51, 234, 0.7) 25%, rgba(126, 34, 206, 0.5) 45%, rgba(107, 33, 168, 0.3) 65%, transparent 85%)",
          }}
        />

        <ResponsiveContainer width="100%" height={500}>
          <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 40 }}>
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#e9d5ff" stopOpacity={0.35} />
                <stop offset="5%" stopColor="#d8b4fe" stopOpacity={0.3} />
                <stop offset="12%" stopColor="#c084fc" stopOpacity={0.25} />
                <stop offset="20%" stopColor="#a855f7" stopOpacity={0.2} />
                <stop offset="30%" stopColor="#9333ea" stopOpacity={0.15} />
                <stop offset="45%" stopColor="#7e22ce" stopOpacity={0.1} />
                <stop offset="60%" stopColor="#6b21a8" stopOpacity={0.06} />
                <stop offset="75%" stopColor="#581c87" stopOpacity={0.03} />
                <stop offset="90%" stopColor="#3b0764" stopOpacity={0.01} />
                <stop offset="100%" stopColor="#1e1b4b" stopOpacity={0} />
              </linearGradient>

              <filter id="chartGlow">
                <feGaussianBlur stdDeviation="8" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="rgba(139, 92, 246, 0.15)" vertical={false} />

            <XAxis
              dataKey="day"
              stroke="rgba(167, 139, 250, 0.5)"
              tick={{ fill: "rgba(167, 139, 250, 0.5)", fontSize: 12, dy: 8 }}
              tickLine={{ stroke: "rgba(139, 92, 246, 0.3)" }}
              label={{
                value: "Days",
                position: "insideBottom",
                offset: -20,
                fill: "rgba(167, 139, 250, 0.6)",
                fontSize: 13,
                fontWeight: 600,
              }}
            />

            <YAxis
              stroke="rgba(167, 139, 250, 0.5)"
              tick={{ fill: "rgba(167, 139, 250, 0.5)", fontSize: 12 }}
              tickLine={{ stroke: "rgba(139, 92, 246, 0.3)" }}
              tickFormatter={(value) => `${value}%`}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(22, 16, 42, 0.95)",
                border: "1px solid rgba(139, 92, 246, 0.4)",
                borderRadius: "8px",
                backdropFilter: "blur(10px)",
                color: "#e9d5ff",
              }}
              labelStyle={{ color: "#c4b5fd" }}
            />

            <Area
              type="monotone"
              dataKey="percentage"
              stroke="#b68cff"
              strokeWidth={2.5}
              fill="url(#areaGradient)"
              animationDuration={1500}
              animationEasing="ease-out"
              isAnimationActive={isInView}
              dot={renderDot}
              activeDot={{
                r: 6.5,
                fill: "#faf5ff",
                stroke: "#e9d5ff",
                strokeWidth: 3,
                style: { filter: "drop-shadow(0 0 12px rgba(182, 140, 255, 0.8))" },
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}
