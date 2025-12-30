"use client"

import { motion } from "framer-motion"
import { useMemo, useState } from "react"
import { Plus } from "lucide-react"
import type { Task } from "./neural-monitor"

interface DailyGoalsProps {
  tasks: Task[]
  toggleTaskDay: (taskId: number, day: number) => void
  updateTaskTarget: (taskId: number, newTarget: number) => void
  updateTaskName: (taskId: number, newName: string) => void
  daysInMonth: number
  currentYear: number
  currentMonth: number
  addNewTask: () => void
}

function generateWeeksWithNames(daysInMonth: number, year: number, month: number) {
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  const weeks: { label: string; days: { name: string; num: number }[] }[] = []

  const firstDayOfWeek = new Date(year, month, 1).getDay()

  let currentDay = 1
  let weekNum = 1
  let dayOfWeekIndex = firstDayOfWeek

  while (currentDay <= daysInMonth) {
    const daysInWeek: { name: string; num: number }[] = []

    if (weekNum === 1 && dayOfWeekIndex > 0) {
      for (let i = 0; i < dayOfWeekIndex; i++) {
        daysInWeek.push({ name: "", num: 0 })
      }
    }

    while (daysInWeek.length < 7 && currentDay <= daysInMonth) {
      daysInWeek.push({
        name: dayNames[dayOfWeekIndex % 7],
        num: currentDay,
      })
      currentDay++
      dayOfWeekIndex++
    }

    while (daysInWeek.length < 7) {
      daysInWeek.push({ name: "", num: 0 })
    }

    weeks.push({ label: `WEEK ${weekNum}`, days: daysInWeek })
    weekNum++
  }

  return weeks
}

export default function DailyGoals({
  tasks,
  toggleTaskDay,
  updateTaskTarget,
  updateTaskName,
  daysInMonth,
  currentYear,
  currentMonth,
  addNewTask,
}: DailyGoalsProps) {
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null)
  const [editingName, setEditingName] = useState("")
  const [animatingCheckbox, setAnimatingCheckbox] = useState<string | null>(null)
  const [editingTargetId, setEditingTargetId] = useState<number | null>(null)

  const weeks = useMemo(
    () => generateWeeksWithNames(daysInMonth, currentYear, currentMonth),
    [daysInMonth, currentYear, currentMonth],
  )

  const getWeekCompletionForTask = (task: Task, weekDays: number[]) => {
    const completed = task.completedDays.filter((day) => weekDays.includes(day)).length
    const total = weekDays.length
    return {
      completed,
      total,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    }
  }

  const totalCompleted = tasks.reduce((sum, task) => sum + task.completedDays.length, 0)
  const totalTarget = tasks.reduce((sum, task) => sum + task.target, 0)
  const totalPercentage = totalTarget > 0 ? Math.round((totalCompleted / totalTarget) * 100) : 0

  const startEditingTask = (task: Task) => {
    setEditingTaskId(task.id)
    setEditingName(task.name)
  }

  const saveTaskName = (taskId: number) => {
    if (editingName.trim()) {
      updateTaskName(taskId, editingName.trim())
    }
    setEditingTaskId(null)
    setEditingName("")
  }

  const cancelEditing = () => {
    setEditingTaskId(null)
    setEditingName("")
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.5 }}
      className="glass-card p-6 transition-all duration-300"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-[var(--text-primary)]">Daily Goals</h3>
        <div className="text-2xl font-bold text-[var(--text-primary)]">{totalPercentage}%</div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border-glass)]">
              <th className="text-left py-3 px-2 text-[var(--text-muted)] font-medium">TASK</th>
              <th className="text-center py-3 px-2 text-[var(--text-muted)] font-medium">TARGET</th>
              {weeks.map((week) => (
                <th key={week.label} colSpan={week.days.length} className="text-center py-3 px-2">
                  <div className="text-[var(--text-secondary)] font-semibold">{week.label}</div>
                </th>
              ))}
            </tr>
            <tr className="border-b border-[var(--border-glass)]">
              <th className="py-2 px-2" />
              <th className="py-2 px-2" />
              {weeks.map((week) =>
                week.days.map((day, idx) => (
                  <th key={`${week.label}-${day.num}-${idx}`} className="text-center py-2 px-1">
                    {day.num > 0 && (
                      <>
                        <div className="text-[10px] text-[var(--text-muted)]">{day.name}</div>
                        <div className="text-[10px] text-[var(--text-secondary)]">{day.num}</div>
                      </>
                    )}
                  </th>
                )),
              )}
            </tr>
          </thead>
          <tbody>
            {tasks.map((task, taskIndex) => {
              const hasReachedTarget = task.completedDays.length >= task.target
              const isEditing = editingTaskId === task.id

              return (
                <motion.tr
                  key={task.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: taskIndex * 0.05 }}
                  className="border-b border-[var(--border-glass)]/50 hover:bg-[var(--bg-card)]/30 transition-colors duration-200"
                >
                  <td className="py-3 px-2 text-[var(--text-secondary)]">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveTaskName(task.id)
                          if (e.key === "Escape") cancelEditing()
                        }}
                        onBlur={() => saveTaskName(task.id)}
                        autoFocus
                        className="w-full bg-[var(--bg-card)] border border-[var(--glow-soft)] rounded px-2 py-1 text-[var(--text-primary)] focus:outline-none focus:border-[var(--glow-main)] transition-all"
                      />
                    ) : (
                      <span
                        onDoubleClick={() => startEditingTask(task)}
                        className="cursor-pointer hover:text-[var(--text-primary)] transition-colors"
                        title="Double-click to edit"
                      >
                        {task.name}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-2 text-center">
                    <input
                      type="number"
                      min="0"
                      max={daysInMonth}
                      value={editingTargetId === task.id && task.target === 0 ? "" : task.target}
                      onChange={(e) => {
                        const newValue = Number.parseInt(e.target.value) || 0
                        updateTaskTarget(task.id, Math.min(daysInMonth, Math.max(0, newValue)))
                      }}
                      onFocus={() => setEditingTargetId(task.id)}
                      onBlur={(e) => {
                        setEditingTargetId(null)
                        if (e.target.value === "") {
                          updateTaskTarget(task.id, 0)
                        }
                      }}
                      id={`target-input-${task.id}`}
                      className="w-14 bg-[var(--bg-card)] border border-[var(--border-glass)] rounded px-2 py-1 text-center text-[var(--text-primary)] focus:outline-none focus:border-[var(--glow-main)] transition-all hover:border-[var(--glow-soft)]"
                    />
                  </td>
                  {weeks.map((week) =>
                    week.days.map((day, idx) => {
                      if (day.num === 0) {
                        return <td key={`${task.id}-empty-${idx}`} className="text-center py-3 px-1" />
                      }

                      const isCompleted = task.completedDays.includes(day.num)
                      const isDisabled = hasReachedTarget && !isCompleted
                      const checkboxId = `checkbox-${task.id}-${day.num}`
                      const isAnimating = animatingCheckbox === checkboxId

                      return (
                        <td key={`${task.id}-${day.num}`} className="text-center py-3 px-1">
                          <button
                            onClick={() => {
                              toggleTaskDay(task.id, day.num)
                              setAnimatingCheckbox(checkboxId)
                              setTimeout(() => setAnimatingCheckbox(null), 400)
                            }}
                            disabled={isDisabled}
                            className={`w-5 h-5 rounded-md transition-all duration-300 ease-out ${
                              isCompleted
                                ? "bg-[var(--glow-main)] border-[var(--glow-main)] shadow-[0_2px_12px_rgba(182,140,255,0.5)]"
                                : isDisabled
                                  ? "border-[var(--border-glass)]/30 cursor-not-allowed opacity-30 border-2 bg-transparent"
                                  : "border-2 border-[var(--text-muted)]/48 hover:border-[var(--glow-main)]/70 cursor-pointer hover:scale-105 hover:shadow-[0_0_8px_rgba(182,140,255,0.3)] bg-transparent"
                            } ${isAnimating ? "checkbox-animate-minimal" : ""}`}
                          >
                            {isCompleted && (
                              <svg
                                className={`w-full h-full p-[2px] ${isAnimating ? "checkmark-animate-minimal" : ""}`}
                                fill="none"
                                stroke="var(--text-primary)"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                viewBox="0 0 24 24"
                              >
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            )}
                          </button>
                        </td>
                      )
                    }),
                  )}
                </motion.tr>
              )
            })}

            <tr className="border-b border-[var(--border-glass)]/50">
              <td colSpan={2} className="py-3 px-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={addNewTask}
                  className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--glow-main)] transition-all duration-200 group"
                >
                  <div className="w-5 h-5 rounded-md border-2 border-dashed border-[var(--text-muted)]/40 group-hover:border-[var(--glow-main)]/60 flex items-center justify-center transition-all">
                    <Plus className="w-3 h-3" />
                  </div>
                  <span className="text-sm">Add New Task</span>
                </motion.button>
              </td>
              {weeks.map((week) =>
                week.days.map((day, idx) => <td key={`add-task-${week.label}-${idx}`} className="py-3 px-1" />),
              )}
            </tr>

            <tr className="bg-[var(--bg-card)]/50">
              {weeks.map((week) => {
                const weekDays = week.days.filter((d) => d.num > 0).map((d) => d.num)
                const weekCompleted = tasks.reduce((sum, task) => {
                  return sum + task.completedDays.filter((day) => weekDays.includes(day)).length
                }, 0)
                const weekTotal = tasks.reduce((sum, task) => sum + Math.min(task.target, weekDays.length), 0)
                const weekPercentage = weekTotal > 0 ? Math.round((weekCompleted / weekTotal) * 100) : 0

                return (
                  <td key={`summary-${week.label}`} colSpan={week.days.length} className="text-center py-3 px-2">
                    <div className="text-sm font-semibold text-[var(--text-primary)]">{weekPercentage}%</div>
                  </td>
                )
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}
