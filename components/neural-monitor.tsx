"use client"

import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import TopTargets from "./top-targets"
import DonutChart from "./donut-chart"
import CalendarGrid from "./calendar-grid"
import Sidebar from "./sidebar"
import OverviewChart from "./overview-chart"
import UserMenuSidebar from "./user-menu-sidebar"
import StoryCards from "./story-cards" // Import StoryCards component
import { User, RotateCcw, BarChart3, ChevronLeft, BookOpen, ChevronDown } from "lucide-react"
import { useRouter } from "next/navigation"
import DailyGoals from "./daily-goals"
import { useTasks } from "@/lib/local-hooks"

export interface Task {
  id: number
  name: string
  target: number
  completedDays: number[]
}

const initialTasks: Task[] = [
  { id: 1, name: "Task 1", target: 0, completedDays: [] },
  { id: 2, name: "Task 2", target: 0, completedDays: [] },
  { id: 3, name: "Task 3", target: 0, completedDays: [] },
  { id: 4, name: "Task 4", target: 0, completedDays: [] },
  { id: 5, name: "Task 5", target: 0, completedDays: [] },
  { id: 6, name: "Task 6", target: 0, completedDays: [] },
  { id: 7, name: "Task 7", target: 0, completedDays: [] },
  { id: 8, name: "Task 8", target: 0, completedDays: [] },
  { id: 9, name: "Task 9", target: 0, completedDays: [] },
  { id: 10, name: "Task 10", target: 0, completedDays: [] },
]

export function NeuralMonitor() {
  const router = useRouter()
  const [currentYear, setCurrentYear] = useState(2024)
  const [currentMonth, setCurrentMonth] = useState(0)
  const [isScrolled, setIsScrolled] = useState(false)
  const [showUserIcon, setShowUserIcon] = useState(true)
  const [showStories, setShowStories] = useState(false)
  const [showMonthSelector, setShowMonthSelector] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string; id: string } | null>(null)
  const [showWelcome, setShowWelcome] = useState(true)
  const [showNeuralMonitor, setShowNeuralMonitor] = useState(false)
  const [showScrollArrow, setShowScrollArrow] = useState(false)
  const [scrollY, setScrollY] = useState(0)

  const containerRef = useRef<HTMLDivElement>(null)
  const lastScrollUpdate = useRef<number>(0)
  const scrollAnimationFrame = useRef<number>()

  const {
    tasks,
    setTasks,
    saveTasks: saveTasksToStorage,
    loading,
  } = useTasks(currentUser?.id || null, currentMonth, currentYear)

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  useEffect(() => {
    const checkAuth = () => {
      const user = localStorage.getItem("currentUser")

      if (!user) {
        router.push("/login")
        return
      }

      const userData = JSON.parse(user)
      setCurrentUser(userData)

      if (userData.name) {
        setShowWelcome(true)

        setTimeout(() => {
          setShowWelcome(false)
          setTimeout(() => {
            setShowNeuralMonitor(true)
          }, 700) // Reduced delay to 700ms for quicker transition
        }, 3500)
      } else {
        setShowNeuralMonitor(true)
      }
    }

    checkAuth()
  }, [router])

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "currentUser" && e.newValue) {
        const userData = JSON.parse(e.newValue)
        setCurrentUser(userData)
      }
    }

    const handleCustomStorageChange = () => {
      const user = localStorage.getItem("currentUser")
      if (user) {
        const userData = JSON.parse(user)
        setCurrentUser(userData)
      }
    }

    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("storage-update", handleCustomStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("storage-update", handleCustomStorageChange)
    }
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      if (scrollAnimationFrame.current) {
        cancelAnimationFrame(scrollAnimationFrame.current)
      }

      scrollAnimationFrame.current = requestAnimationFrame(() => {
        const container = containerRef.current
        if (container) {
          const currentScrollY = container.scrollTop
          setScrollY(currentScrollY)

          // Only update isScrolled state when crossing threshold to reduce re-renders
          const newIsScrolled = currentScrollY > 50
          if (newIsScrolled !== isScrolled) {
            setIsScrolled(newIsScrolled)
          }
        }
      })
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener("scroll", handleScroll, { passive: true })
      return () => {
        container.removeEventListener("scroll", handleScroll)
        if (scrollAnimationFrame.current) {
          cancelAnimationFrame(scrollAnimationFrame.current)
        }
      }
    }
  }, [isScrolled])

  useEffect(() => {
    if (!currentUser) return

    const welcomeTimer = setTimeout(() => {
      setShowWelcome(false)
    }, 3500)

    const monitorTimer = setTimeout(() => {
      setShowNeuralMonitor(true)
    }, 4200)

    const arrowAppearTimer = setTimeout(() => {
      setShowScrollArrow(true)
    }, 5000)

    const arrowDisappearTimer = setTimeout(() => {
      setShowScrollArrow(false)
    }, 8000)

    return () => {
      clearTimeout(welcomeTimer)
      clearTimeout(monitorTimer)
      clearTimeout(arrowAppearTimer)
      clearTimeout(arrowDisappearTimer)
    }
  }, [currentUser])

  useEffect(() => {
    if (currentUser && tasks.length > 0) {
      const timer = setTimeout(() => {
        saveTasksToStorage(tasks)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [tasks, currentUser, saveTasksToStorage])

  const handleLogout = useCallback(() => {
    localStorage.removeItem("currentUser")
    localStorage.removeItem("rememberedUser")
    localStorage.removeItem("isReturningUser")
    router.push("/login")
  }, [router])

  const daysInMonth = useMemo(() => {
    return new Date(currentYear, currentMonth + 1, 0).getDate()
  }, [currentYear, currentMonth])

  const filteredTasks = useMemo(() => {
    return tasks.map((task) => ({
      ...task,
      completedDays: task.completedDays.filter((day) => day <= daysInMonth),
    }))
  }, [tasks, daysInMonth])

  const toggleTaskDay = useCallback(
    (taskId: number, day: number) => {
      setTasks((prevTasks) =>
        prevTasks.map((task) => {
          if (task.id === taskId) {
            const completed = task.completedDays.includes(day)
            return {
              ...task,
              completedDays: completed
                ? task.completedDays.filter((d) => d !== day)
                : [...task.completedDays, day].sort((a, b) => a - b),
            }
          }
          return task
        }),
      )
    },
    [setTasks],
  )

  const updateTaskName = useCallback(
    (taskId: number, newName: string) => {
      setTasks((prevTasks) =>
        prevTasks.map((task) => {
          if (task.id === taskId) {
            return {
              ...task,
              name: newName,
            }
          }
          return task
        }),
      )
    },
    [setTasks],
  )

  const updateTaskTarget = useCallback(
    (taskId: number, newTarget: number) => {
      setTasks((prevTasks) =>
        prevTasks.map((task) => {
          if (task.id === taskId) {
            return {
              ...task,
              target: newTarget,
            }
          }
          return task
        }),
      )
    },
    [setTasks],
  )

  const resetAllTasks = useCallback(() => {
    const defaultTasks: Task[] = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      name: `Task ${i + 1}`,
      target: 0,
      completedDays: [],
    }))
    setTasks(defaultTasks)
  }, [setTasks])

  const addNewTask = useCallback(() => {
    const newTaskId = Math.max(...tasks.map((t) => (typeof t.id === "number" ? t.id : 0))) + 1
    const newTask: Task = {
      id: newTaskId,
      name: `Task ${newTaskId}`,
      target: 0,
      completedDays: [],
    }
    setTasks((prevTasks) => [...prevTasks, newTask])
  }, [tasks, setTasks])

  const totalCompleted = useMemo(() => {
    return filteredTasks.reduce((sum, task) => sum + task.completedDays.length, 0)
  }, [filteredTasks])

  const totalTarget = useMemo(() => {
    return filteredTasks.reduce((sum, task) => sum + task.target, 0)
  }, [filteredTasks])

  const completionPercentage = useMemo(() => {
    return totalTarget > 0 ? Math.round((totalCompleted / totalTarget) * 100) : 0
  }, [totalCompleted, totalTarget])

  const handleMonthSelect = useCallback((monthYear: string) => {
    const [year, month] = monthYear.split("-")
    const monthIndex = months.indexOf(month)
    if (monthIndex !== -1) {
      setCurrentMonth(monthIndex)
      setCurrentYear(Number.parseInt(year))
      setShowMonthSelector(false)
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" })
      }, 800)
    }
  }, [])

  const getMonthsWithData = useCallback(() => {
    if (!currentUser?.id) return []

    const monthsWithData = new Set<string>()
    const allData = localStorage.getItem(`neural_monitor_data_${currentUser.id}`)
    if (!allData) return []

    try {
      const userData = JSON.parse(allData)
      const tasks = userData.tasks || []

      tasks.forEach((task: any) => {
        // Check if task has actual data (non-zero target or completed days)
        const hasCompletedDays = task.completed_days && task.completed_days.length > 0
        const hasTarget = task.target > 0

        if (hasCompletedDays || hasTarget) {
          const monthYear = `${task.year}-${months[task.month]}`
          monthsWithData.add(monthYear)
        }
      })

      return Array.from(monthsWithData).sort((a, b) => {
        const [yearA, monthA] = a.split("-")
        const [yearB, monthB] = b.split("-")
        return Number.parseInt(yearB) - Number.parseInt(yearA) || months.indexOf(monthB) - months.indexOf(monthA)
      })
    } catch (error) {
      console.error("Error parsing user data:", error)
      return []
    }
  }, [currentUser])

  const monthsWithData = getMonthsWithData()

  const scrollArrowVisible = useMemo(() => {
    return showScrollArrow && scrollY === 0
  }, [showScrollArrow, scrollY])

  if (!currentUser) {
    return null
  }

  return (
    <div className="neural-bg h-screen overflow-hidden flex">
      <UserMenuSidebar
        isOpen={isUserMenuOpen}
        onClose={() => setIsUserMenuOpen(false)}
        userName={currentUser.name}
        onLogout={handleLogout}
      />

      <AnimatePresence mode="wait">
        {showUserIcon && (
          <motion.button
            key="user-icon"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            onClick={() => setIsUserMenuOpen(true)}
            className="fixed top-6 left-6 z-30 p-3 rounded-full bg-[var(--bg-card)]/80 border border-[var(--border-glass)] hover:bg-[var(--bg-card-soft)] transition-all group backdrop-blur-md"
            style={{
              backdropFilter: "blur(12px) saturate(180%)",
            }}
          >
            <User className="w-5 h-5 text-[var(--glow-main)] group-hover:scale-110 transition-transform" />
          </motion.button>
        )}
      </AnimatePresence>

      <div ref={containerRef} className="flex-1 overflow-y-auto">
        <section className="h-screen flex flex-col items-center justify-center relative">
          <AnimatePresence mode="wait">
            {showWelcome && currentUser.name ? (
              <motion.h1
                key="welcome"
                initial={{ opacity: 0, scale: 0.8, filter: "blur(20px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.8, filter: "blur(20px)" }}
                transition={{
                  duration: 2.2,
                  ease: [0.16, 1, 0.3, 1],
                  opacity: { duration: 2.2 },
                  scale: { duration: 2.2, delay: 0.1 },
                  filter: { duration: 2.2 },
                }}
                className="text-7xl md:text-8xl font-bold text-[var(--text-primary)] tracking-tight text-center px-6"
              >
                Welcome Back {currentUser.name}
              </motion.h1>
            ) : showNeuralMonitor ? (
              <motion.h1
                key="neural"
                initial={{ opacity: 0, scale: 0.8, filter: "blur(20px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.8, filter: "blur(20px)" }}
                transition={{
                  duration: 2.2,
                  ease: [0.16, 1, 0.3, 1],
                  opacity: { duration: 2.2 },
                  scale: { duration: 2.2, delay: 0.1 },
                  filter: { duration: 2.2 },
                }}
                className="text-8xl md:text-9xl font-bold text-[var(--text-primary)] tracking-tight"
              >
                Neural Monitor
              </motion.h1>
            ) : null}
          </AnimatePresence>

          <AnimatePresence>
            {scrollArrowVisible && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2, ease: "easeInOut" }}
                className="absolute bottom-12 left-1/2 -translate-x-1/2"
              >
                <motion.div
                  animate={{
                    y: [0, 12, 0],
                    opacity: [0.6, 1, 0.6],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                    times: [0, 0.5, 1],
                  }}
                >
                  <ChevronDown className="w-8 h-8 text-white/60" />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        <section className="min-h-screen flex items-center justify-center py-20 px-6">
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-[1600px]"
          >
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl md:text-6xl font-bold text-[var(--text-primary)] text-center mb-16 tracking-tight"
            >
              Your Daily Progress
            </motion.h2>
            <OverviewChart tasks={filteredTasks} daysInMonth={daysInMonth} />
          </motion.div>
        </section>

        <section className="py-20 px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="max-w-[1800px] mx-auto"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="lg:col-span-2"
              >
                <Sidebar
                  currentMonth={months[currentMonth]}
                  currentYear={currentYear}
                  onYearChange={setCurrentYear}
                  onMonthChange={setCurrentMonth}
                  months={months}
                  totalProgress={totalCompleted}
                  totalTarget={totalTarget}
                  completionPercentage={completionPercentage}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                className="lg:col-span-7"
              >
                <CalendarGrid
                  tasks={filteredTasks}
                  toggleTaskDay={toggleTaskDay}
                  daysInMonth={daysInMonth}
                  currentYear={currentYear}
                  currentMonth={currentMonth}
                />
              </motion.div>

              <div className="lg:col-span-3 space-y-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                >
                  <DonutChart completed={totalCompleted} total={totalTarget} percentage={completionPercentage} />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
                >
                  <TopTargets tasks={filteredTasks} />
                </motion.div>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
            >
              <DailyGoals
                tasks={filteredTasks}
                toggleTaskDay={toggleTaskDay}
                updateTaskTarget={updateTaskTarget}
                updateTaskName={updateTaskName}
                daysInMonth={daysInMonth}
                currentYear={currentYear}
                currentMonth={currentMonth}
                addNewTask={addNewTask}
              />
            </motion.div>
          </motion.div>
        </section>

        <section className="px-6 py-52">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-[1600px] mx-auto"
          >
            {showStories ? (
              <motion.div
                key="stories"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
                transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
                className="space-y-12 py-0"
              >
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] tracking-tight">
                    Your Stories
                  </h2>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowStories(false)}
                    className="px-6 py-2 rounded-lg bg-[var(--glow-soft)] text-[var(--text-primary)] font-semibold hover:bg-[var(--glow-main)] hover:text-white transition-all"
                  >
                    Back to Manage
                  </motion.button>
                </div>
                <StoryCards
                  currentMonth={months[currentMonth]}
                  currentYear={currentYear}
                  onMonthSelect={(month, year) => {
                    const monthIndex = months.indexOf(month)
                    if (monthIndex !== -1) {
                      setCurrentMonth(monthIndex)
                      setCurrentYear(year)
                    }
                  }}
                  userId={currentUser?.id || ""}
                />
              </motion.div>
            ) : (
              <motion.div
                key="manage"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
                transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
                className="space-y-12"
              >
                <h2 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] text-center mb-12 tracking-tight">
                  Manage Your Data
                </h2>

                <AnimatePresence mode="wait">
                  {showMonthSelector ? (
                    <motion.div
                      key="month-selector"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                      className="glass-card p-4 max-w-lg mx-auto"
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <button
                          onClick={() => setShowMonthSelector(false)}
                          className="p-1.5 rounded-lg hover:bg-[var(--glow-soft)] transition-colors"
                        >
                          <ChevronLeft className="w-4 h-4 text-[var(--text-primary)]" />
                        </button>
                        <h3 className="text-base font-semibold text-[var(--text-primary)]">Select a Month</h3>
                      </div>
                      {monthsWithData.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {monthsWithData.map((monthYear) => {
                            const [year, month] = monthYear.split("-")
                            const monthIndex = [
                              "January",
                              "February",
                              "March",
                              "April",
                              "May",
                              "June",
                              "July",
                              "August",
                              "September",
                              "October",
                              "November",
                              "December",
                            ].indexOf(month)
                            const isActive = monthIndex === currentMonth && Number.parseInt(year) === currentYear
                            return (
                              <motion.button
                                key={monthYear}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleMonthSelect(monthYear)}
                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                  isActive
                                    ? "bg-[var(--glow-main)] text-white"
                                    : "bg-[var(--bg-card)] text-[var(--text-secondary)] hover:bg-[var(--glow-soft)] hover:text-[var(--text-primary)]"
                                }`}
                              >
                                {month} {year}
                              </motion.button>
                            )
                          })}
                        </div>
                      ) : (
                        <p className="text-[var(--text-muted)] text-center py-6 text-sm">
                          No data saved yet. Start tracking to see months here!
                        </p>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="manage-buttons"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="grid grid-cols-3 gap-6 max-w-5xl mx-auto"
                    >
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={resetAllTasks}
                        className="glass-card px-8 py-6 text-center cursor-pointer group transition-all duration-300"
                      >
                        <div className="mb-4 flex justify-center">
                          <div className="p-4 rounded-full bg-gradient-to-br from-purple-500/20 to-violet-600/20 group-hover:from-purple-500/30 group-hover:to-violet-600/30 transition-all duration-300">
                            <RotateCcw className="w-6 h-6 text-purple-400" />
                          </div>
                        </div>
                        <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2 group-hover:text-[var(--glow-highlight)] transition-colors">
                          Reset Progress
                        </h3>
                        <p className="text-sm text-[var(--text-muted)]">Clear this month's data</p>
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowMonthSelector(true)}
                        className="glass-card px-8 py-6 text-center cursor-pointer group transition-all duration-300"
                      >
                        <div className="mb-4 flex justify-center">
                          <div className="p-4 rounded-full bg-gradient-to-br from-purple-500/20 to-violet-600/20 group-hover:from-purple-500/30 group-hover:to-violet-600/30 transition-all duration-300">
                            <BarChart3 className="w-6 h-6 text-purple-400" />
                          </div>
                        </div>
                        <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2 group-hover:text-[var(--glow-highlight)] transition-colors">
                          Previous Month
                        </h3>
                        <p className="text-sm text-[var(--text-muted)]">View and manage past month's data</p>
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowStories(true)}
                        className="glass-card px-8 py-6 text-center cursor-pointer group transition-all duration-300"
                      >
                        <div className="mb-4 flex justify-center">
                          <div className="p-4 rounded-full bg-gradient-to-br from-purple-500/20 to-violet-600/20 group-hover:from-purple-500/30 group-hover:to-violet-600/30 transition-all duration-300">
                            <BookOpen className="w-6 h-6 text-purple-400" />
                          </div>
                        </div>
                        <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2 group-hover:text-[var(--glow-highlight)] transition-colors">
                          View Stories
                        </h3>
                        <p className="text-sm text-[var(--text-muted)]">Read your journey stories</p>
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </motion.div>
        </section>
      </div>
    </div>
  )
}

export default NeuralMonitor
