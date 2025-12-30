"use client"

import { useEffect, useState } from "react"
import { getTasks, saveTasks, getStories, createStory, updateStory, deleteStory } from "./local-storage"
import type { Task as StorageTask, Story } from "./local-storage"

export interface Task {
  id: number | string
  name: string
  target: number
  completedDays: number[]
}

export function useTasks(userId: string | null, month: number, year: number) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      const emptyTasks: Task[] = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        name: `Task ${i + 1}`,
        target: 0,
        completedDays: [],
      }))
      setTasks(emptyTasks)
      setLoading(false)
      return
    }

    const fetchTasks = async () => {
      const storedTasks = getTasks(userId, month, year)

      if (storedTasks.length > 0) {
        const formattedTasks: Task[] = storedTasks.map((task) => ({
          id: task.id,
          name: task.task_name,
          target: task.target || 0,
          completedDays: task.completed_days || [],
        }))
        setTasks(formattedTasks)
      } else {
        const initialTasks: Task[] = Array.from({ length: 10 }, (_, i) => ({
          id: `new-${i + 1}`,
          name: `Task ${i + 1}`,
          target: 0,
          completedDays: [],
        }))
        setTasks(initialTasks)

        // Save initial tasks
        const tasksToSave: StorageTask[] = initialTasks.map((task) => ({
          id:
            typeof task.id === "string" && task.id.startsWith("new-")
              ? `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
              : task.id,
          user_id: userId,
          task_name: task.name,
          target: task.target,
          completed_days: task.completedDays,
          month,
          year,
          updated_at: new Date().toISOString(),
        }))
        saveTasks(userId, tasksToSave, month, year)
      }
      setLoading(false)
    }

    fetchTasks()
  }, [userId, month, year])

  const saveTasksData = async (updatedTasks: Task[]) => {
    if (!userId) return

    const tasksToSave: StorageTask[] = updatedTasks.map((task) => ({
      id:
        typeof task.id === "string" && task.id.startsWith("new-")
          ? `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          : task.id,
      user_id: userId,
      task_name: task.name,
      target: task.target,
      completed_days: task.completedDays,
      month,
      year,
      updated_at: new Date().toISOString(),
    }))

    saveTasks(userId, tasksToSave, month, year)
  }

  return { tasks, setTasks, saveTasks: saveTasksData, loading }
}

export function useStories(userId: string | null) {
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const storedStories = getStories(userId)
    setStories(storedStories)
    setLoading(false)
  }, [userId])

  const saveStory = async (title: string, content: string, customDate?: Date) => {
    if (!userId) {
      return
    }

    const newStory = createStory(userId, title, content, customDate)
    setStories((prev) => [...prev, newStory])
    return newStory
  }

  const updateStoryData = async (id: string, content: string) => {
    if (!userId) return

    updateStory(userId, id, content)
    // Optimistically update the story in state
    setStories((prev) =>
      prev.map((story) => (story.id === id ? { ...story, content, updated_at: new Date().toISOString() } : story)),
    )
  }

  const deleteStoryData = async (id: string) => {
    if (!userId) return

    deleteStory(userId, id)
    // Optimistically remove the story from state
    setStories((prev) => prev.filter((story) => story.id !== id))
  }

  return { stories, saveStory, updateStory: updateStoryData, deleteStory: deleteStoryData, loading }
}
