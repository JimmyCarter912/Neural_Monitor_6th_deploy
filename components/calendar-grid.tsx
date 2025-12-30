"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useMemo, memo } from "react"
import type { Task } from "./neural-monitor"

interface CalendarGridProps {
  tasks: Task[]
  toggleTaskDay: (taskId: number, day: number) => void
  daysInMonth: number
  currentYear: number
  currentMonth: number
}

function generateWeeks(daysInMonth: number, year: number, month: number) {
  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  const weeks: { label: string; days: number[] }[] = []

  const firstDayOfWeek = new Date(year, month, 1).getDay()
  const adjustedFirstDay = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1

  let currentDay = 1
  let weekNum = 1
  let dayOfWeekIndex = adjustedFirstDay

  while (currentDay <= daysInMonth) {
    const daysInWeek: number[] = []

    if (weekNum === 1 && dayOfWeekIndex > 0) {
      for (let i = 0; i < dayOfWeekIndex; i++) {
        daysInWeek.push(0)
      }
    }

    while (daysInWeek.length < 7 && currentDay <= daysInMonth) {
      daysInWeek.push(currentDay)
      currentDay++
      dayOfWeekIndex++
    }

    while (daysInWeek.length < 7) {
      daysInWeek.push(0)
    }

    weeks.push({ label: `WEEK ${weekNum}`, days: daysInWeek })
    weekNum++
  }

  return weeks
}

const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

const CalendarGrid = memo(function CalendarGrid({
  tasks,
  toggleTaskDay,
  daysInMonth,
  currentYear,
  currentMonth,
}: CalendarGridProps) {
  const weeks = useMemo(
    () => generateWeeks(daysInMonth, currentYear, currentMonth),
    [daysInMonth, currentYear, currentMonth],
  )

  const getWeekStats = useMemo(() => {
    return (weekDays: number[]) => {
      const validDays = weekDays.filter((day) => day > 0)
      const completed = tasks.reduce((sum, task) => {
        return sum + task.completedDays.filter((day) => validDays.includes(day)).length
      }, 0)
      const total = tasks.length * validDays.length
      return {
        completed,
        total,
        percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
      }
    }
  }, [tasks])

  const getDayCompletions = useMemo(() => {
    return (day: number) => {
      if (day === 0) return 0
      return tasks.reduce((sum, task) => sum + (task.completedDays.includes(day) ? 1 : 0), 0)
    }
  }, [tasks])

  const calendarKey = `${currentYear}-${currentMonth}`

  return (
    <div className="glass-card p-6 transition-all duration-300 hover:shadow-[0_0_25px_rgba(139,92,246,0.3)] will-change-transform">
      <div className="space-y-6">
        {weeks.map((week, weekIndex) => {
          const stats = getWeekStats(week.days)
          return (
            <div key={week.label}>
              <div className="flex items-center gap-4 mb-3">
                <h3 className="text-sm font-semibold text-[var(--text-secondary)] min-w-[80px]">{week.label}</h3>
                <div className="flex-1 grid gap-2" style={{ gridTemplateColumns: `repeat(7, minmax(0, 1fr))` }}>
                  {week.days.map((day, dayIndex) => (
                    <div key={`${week.label}-header-${dayIndex}`} className="text-center">
                      <div className="text-xs text-[var(--text-muted)] mb-1">{dayNames[dayIndex]}</div>
                      <div className="text-xs text-[var(--text-secondary)]">{day > 0 ? day : ""}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="min-w-[80px]" />
                <div className="flex-1">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={calendarKey}
                      initial={{ opacity: 0, scaleY: 0 }}
                      animate={{ opacity: 1, scaleY: 1 }}
                      exit={{ opacity: 0, scaleY: 0 }}
                      transition={{
                        duration: 0.4,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    >
                      <div className="grid gap-2 mb-2" style={{ gridTemplateColumns: `repeat(7, minmax(0, 1fr))` }}>
                        {week.days.map((day, dayIndex) => {
                          if (day === 0) {
                            return <div key={`${week.label}-empty-${dayIndex}`} className="w-full" />
                          }

                          const completions = getDayCompletions(day)
                          const maxHeight = 60
                          const height = tasks.length > 0 ? (completions / tasks.length) * maxHeight : 0

                          return (
                            <div
                              key={`${week.label}-${day}`}
                              className="flex flex-col items-center group cursor-pointer"
                            >
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: `${height}px`, opacity: 1 }}
                                transition={{
                                  duration: 0.6,
                                  delay: weekIndex * 0.05 + dayIndex * 0.025,
                                  ease: [0.22, 1, 0.36, 1],
                                }}
                                className="w-full bg-[var(--glow-soft)] rounded-t transition-all duration-300 group-hover:bg-[var(--glow-main)] group-hover:shadow-[0_0_15px_rgba(139,92,246,0.5)]"
                                style={{ minHeight: "2px" }}
                              />
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{
                                  duration: 0.4,
                                  delay: weekIndex * 0.05 + dayIndex * 0.025 + 0.2,
                                }}
                                className="text-[10px] text-[var(--text-primary)] mt-1"
                              >
                                {completions}
                              </motion.div>
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{
                                  duration: 0.4,
                                  delay: weekIndex * 0.05 + dayIndex * 0.025 + 0.2,
                                }}
                                className="text-[10px] text-[var(--text-muted)]"
                              >
                                {tasks.length}
                              </motion.div>
                            </div>
                          )
                        })}
                      </div>

                      <div className="flex items-center gap-2 mt-3">
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.4, delay: weekIndex * 0.05 + 0.3 }}
                          className="text-sm font-semibold text-[var(--text-primary)]"
                        >
                          {stats.completed}/{stats.total}
                        </motion.div>
                        <div className="flex-1 h-2 bg-[var(--bg-card)] rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${stats.percentage}%` }}
                            transition={{
                              duration: 0.8,
                              delay: weekIndex * 0.05 + 0.15,
                              ease: [0.22, 1, 0.36, 1],
                            }}
                            className="h-full bg-[var(--glow-main)] rounded-full"
                          />
                        </div>
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.4, delay: weekIndex * 0.05 + 0.3 }}
                          className="text-sm font-semibold text-[var(--text-primary)]"
                        >
                          {stats.percentage}%
                        </motion.div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
})

export default CalendarGrid
