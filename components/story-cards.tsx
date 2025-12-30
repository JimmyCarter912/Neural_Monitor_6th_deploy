"use client"

import { useState, useMemo, useCallback, memo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, ChevronLeft, Plus } from "lucide-react"
import { useStories } from "@/lib/local-hooks"

interface StoryCardsProps {
  currentMonth: string
  currentYear: number
  onMonthSelect?: (month: string, year: number) => void
  userId: string
}

const StoryCards = memo(function StoryCards({ currentMonth, currentYear, onMonthSelect, userId }: StoryCardsProps) {
  const [editingStories, setEditingStories] = useState<{ [key: string]: string }>({})
  const [showMonthSelector, setShowMonthSelector] = useState(false)
  const [savingStories, setSavingStories] = useState<Set<string>>(new Set())
  const selectedMonth = currentMonth
  const selectedYear = currentYear

  const { stories, saveStory, updateStory, deleteStory, loading } = useStories(userId)

  const storyKey = `${selectedYear}-${selectedMonth}`

  const currentMonthStories = useMemo(() => {
    return stories.filter((s) => {
      const storyDate = new Date(s.created_at)
      const storyMonth = storyDate.toLocaleString("default", { month: "long" })
      const storyYear = storyDate.getFullYear()
      return storyMonth === selectedMonth && storyYear === selectedYear
    })
  }, [stories, selectedMonth, selectedYear])

  const monthsWithStories = useMemo(() => {
    return Array.from(
      new Set(
        stories
          .filter((s) => s.content.trim() !== "")
          .map((s) => {
            const date = new Date(s.created_at)
            return `${date.getFullYear()}-${date.toLocaleString("default", { month: "long" })}`
          }),
      ),
    ).sort((a, b) => {
      const [yearA, monthA] = a.split("-")
      const [yearB, monthB] = b.split("-")
      return Number.parseInt(yearB) - Number.parseInt(yearA) || monthB.localeCompare(monthA)
    })
  }, [stories])

  const getSelectedMonthDate = useCallback(() => {
    const monthNames = [
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
    const monthIndex = monthNames.indexOf(selectedMonth)
    return new Date(selectedYear, monthIndex, 1, 12, 0, 0)
  }, [selectedMonth, selectedYear])

  const handleSaveEdit = useCallback(
    async (storyId: string) => {
      const content = editingStories[storyId]
      const existingStory = stories.find((s) => s.id === storyId)

      setSavingStories((prev) => new Set(prev).add(storyId))

      setEditingStories((prev) => {
        const newEditing = { ...prev }
        delete newEditing[storyId]
        return newEditing
      })

      if (content && content.trim() !== "") {
        if (existingStory) {
          await updateStory(storyId, content)
        } else {
          const title = `${selectedMonth} ${selectedYear}`
          const storyDate = getSelectedMonthDate()
          await saveStory(title, content, storyDate)
        }
      }

      setTimeout(() => {
        setSavingStories((prev) => {
          const newSet = new Set(prev)
          newSet.delete(storyId)
          return newSet
        })
      }, 100)
    },
    [editingStories, stories, selectedMonth, selectedYear, updateStory, saveStory, getSelectedMonthDate],
  )

  const handleEditStory = useCallback((storyId: string, content: string) => {
    setEditingStories((prev) => ({ ...prev, [storyId]: content }))
  }, [])

  const handleDeleteStory = useCallback(
    async (storyId: string) => {
      await deleteStory(storyId)
      setEditingStories((prev) => {
        const newEditing = { ...prev }
        delete newEditing[storyId]
        return newEditing
      })
    },
    [deleteStory],
  )

  const handleSelectMonth = useCallback(
    (monthYear: string) => {
      const [year, month] = monthYear.split("-")
      if (onMonthSelect) {
        onMonthSelect(month, Number.parseInt(year))
      }
      setShowMonthSelector(false)
    },
    [onMonthSelect],
  )

  const handleWelcomeCardClick = useCallback(() => {
    const welcomeStoryId = `${storyKey}-welcome`
    setEditingStories((prev) => ({ ...prev, [welcomeStoryId]: "" }))
  }, [storyKey])

  const handleAddNewStory = useCallback(() => {
    const newStoryId = `${storyKey}-${Date.now()}`
    setEditingStories((prev) => ({ ...prev, [newStoryId]: "" }))
  }, [storyKey])

  const hasExistingStory = currentMonthStories.length > 0
  const hasEditingStory = Object.keys(editingStories).some(
    (id) => !stories.find((s) => s.id === id) && id.startsWith(storyKey),
  )

  return (
    <div className="space-y-6">
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
            {monthsWithStories.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {monthsWithStories.map((monthYear) => {
                  const [year, month] = monthYear.split("-")
                  const isActive = month === selectedMonth && Number.parseInt(year) === selectedYear
                  return (
                    <motion.button
                      key={monthYear}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSelectMonth(monthYear)}
                      className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
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
              <p className="text-[var(--text-muted)] text-center text-sm py-6">
                No stories saved yet. Start writing to see them here!
              </p>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="story-cards"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {!hasExistingStory && !hasEditingStory ? (
              <div className="flex justify-center">
                <motion.button
                  key="welcome-card"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ y: -4 }}
                  onClick={handleWelcomeCardClick}
                  className="glass-card p-6 flex flex-col items-center justify-center gap-4 group hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] transition-all duration-300"
                  style={{ width: "224px", height: "288px" }}
                >
                  <h3 className="text-xl font-semibold text-[var(--text-primary)] group-hover:text-[var(--glow-highlight)] transition-colors text-center leading-relaxed">
                    Sweet Memories huh?
                  </h3>
                  <p className="text-sm text-[var(--text-muted)] text-center">Click to start writing your story</p>
                </motion.button>
              </div>
            ) : (
              <motion.div className="flex flex-wrap gap-6 justify-center mx-0 my-44">
                {currentMonthStories.map((story, index) => {
                  const storyDate = new Date(story.created_at)
                  const storyMonth = storyDate.toLocaleString("default", { month: "long" })
                  const storyYear = storyDate.getFullYear()

                  const isSaving = savingStories.has(story.id)
                  if (isSaving) return null

                  return (
                    <motion.div
                      key={story.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                      whileHover={{ y: -4 }}
                      className="glass-card p-6 flex flex-col relative group hover:shadow-[0_0_35px_rgba(139,92,246,0.6)] transition-all duration-300"
                      style={{ width: "224px", minHeight: "288px" }}
                    >
                      <button
                        onClick={() => handleDeleteStory(story.id)}
                        className="absolute top-3 right-3 p-1.5 rounded-full bg-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/30 z-10"
                      >
                        <X className="w-4 h-4 text-red-400" />
                      </button>
                      <h3 className="text-base font-semibold text-[var(--text-primary)] mb-4">
                        {storyMonth} {storyYear}
                      </h3>
                      {editingStories[story.id] !== undefined ? (
                        <div className="flex flex-col flex-1">
                          <textarea
                            value={editingStories[story.id]}
                            onChange={(e) => handleEditStory(story.id, e.target.value)}
                            placeholder="Write your story here..."
                            className="flex-1 bg-[var(--bg-card)] text-[var(--text-primary)] rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--glow-main)] transition-all mb-3 min-h-[180px]"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveEdit(story.id)}
                            className="text-sm text-purple-400 hover:text-purple-300 transition-colors font-semibold"
                          >
                            Save Story
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col flex-1">
                          <p className="flex-1 text-[var(--text-secondary)] text-sm leading-relaxed whitespace-pre-wrap mb-3 overflow-y-auto">
                            {story.content || "No content yet..."}
                          </p>
                          <button
                            onClick={() => handleEditStory(story.id, story.content)}
                            className="text-sm text-purple-400 hover:text-purple-300 transition-colors font-semibold"
                          >
                            Edit Story
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )
                })}

                {Object.entries(editingStories).map(([storyId, content]) => {
                  if (!stories.find((s) => s.id === storyId)) {
                    return (
                      <motion.div
                        key={storyId}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3 }}
                        whileHover={{ y: -4 }}
                        className="glass-card p-6 flex flex-col relative group hover:shadow-[0_0_35px_rgba(139,92,246,0.6)] transition-all duration-300"
                        style={{ width: "224px", minHeight: "288px" }}
                      >
                        <button
                          onClick={() => {
                            setEditingStories((prev) => {
                              const newEditing = { ...prev }
                              delete newEditing[storyId]
                              return newEditing
                            })
                          }}
                          className="absolute top-3 right-3 p-1.5 rounded-full bg-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/30 z-10"
                        >
                          <X className="w-4 h-4 text-red-400" />
                        </button>
                        <h3 className="text-base font-semibold text-[var(--text-primary)] mb-4">
                          {selectedMonth} {selectedYear}
                        </h3>
                        <textarea
                          value={content}
                          onChange={(e) => handleEditStory(storyId, e.target.value)}
                          placeholder="Write your story here..."
                          className="flex-1 bg-[var(--bg-card)] text-[var(--text-primary)] rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--glow-main)] transition-all mb-3 min-h-[180px]"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveEdit(storyId)}
                          className="text-sm text-purple-400 hover:text-purple-300 transition-colors font-semibold"
                        >
                          Save Story
                        </button>
                      </motion.div>
                    )
                  }
                  return null
                })}

                <motion.button
                  key="add-story-card"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4 }}
                  whileHover={{ scale: 1.03, y: -4 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleAddNewStory}
                  className="glass-card p-6 flex flex-col items-center justify-center gap-4 group hover:shadow-[0_0_35px_rgba(139,92,246,0.6)] transition-all duration-300 border-2 border-dashed border-[var(--glow-soft)]"
                  style={{ width: "224px", height: "288px" }}
                >
                  <div className="p-4 rounded-full bg-[var(--glow-soft)] group-hover:bg-[var(--glow-main)] transition-all duration-300">
                    <Plus className="w-8 h-8 text-black group-hover:text-white transition-colors duration-300" />
                  </div>
                  <h3 className="text-xl font-semibold text-[var(--text-primary)] group-hover:text-[var(--glow-highlight)] transition-colors text-center">
                    Add Story
                  </h3>
                  <p className="text-sm text-[var(--text-muted)] text-center">Create a new memory</p>
                </motion.button>
              </motion.div>
            )}

            {monthsWithStories.length > 0 && (
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                whileHover={{ scale: 1.01, y: -2 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setShowMonthSelector(true)}
                className="w-full max-w-md mx-auto block glass-card p-4 mt-8 flex items-center justify-center gap-2 group hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] transition-all duration-300"
              >
                <span className="text-[var(--text-primary)] font-semibold group-hover:text-[var(--glow-highlight)] transition-colors">
                  View Stories from Other Months
                </span>
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})

export default StoryCards
