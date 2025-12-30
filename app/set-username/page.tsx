"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { updateUserName } from "@/lib/local-storage"

export default function SetUsernamePage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const checkAuth = () => {
      const currentUser = localStorage.getItem("currentUser")
      if (!currentUser) {
        router.push("/login")
      }
    }
    checkAuth()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (username.trim().length < 2) {
      setError("Username must be at least 2 characters long")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const currentUser = localStorage.getItem("currentUser")
      if (currentUser) {
        const user = JSON.parse(currentUser)
        updateUserName(user.id, username.trim())

        // Update current user in localStorage
        localStorage.setItem(
          "currentUser",
          JSON.stringify({
            ...user,
            name: username.trim(),
          }),
        )

        // Mark as new user (not returning) for welcome message
        localStorage.removeItem("isReturningUser")

        // Redirect to main app
        router.push("/")
      }
    } catch (error: any) {
      setError(error.message || "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="neural-bg min-h-screen flex items-center justify-center px-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center mb-10"
        >
          <h1 className="text-4xl sm:text-5xl font-semibold text-[var(--text-primary)] mb-3 tracking-tight">Great!</h1>
          <p className="text-[var(--text-secondary)] text-sm">Let's personalize your experience</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="glass-card p-8 sm:p-10"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <label htmlFor="username" className="text-lg font-medium text-[var(--text-primary)] block text-center">
                What would you like us to call you as?
              </label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your name"
                required
                className="h-12 bg-[var(--bg-card-soft)]/50 border-[var(--border-glass)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--glow-soft)] focus:ring-2 focus:ring-[var(--glow-soft)]/20 text-center text-lg transition-all rounded-xl"
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-sm text-red-400 text-center"
              >
                {error}
              </motion.div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-[var(--glow-soft)] hover:bg-[var(--glow-main)] text-white font-semibold transition-all rounded-xl shadow-lg shadow-[var(--glow-soft)]/20 hover:shadow-[var(--glow-soft)]/30"
            >
              {isLoading ? "Setting up..." : "Continue"}
            </Button>
          </form>
        </motion.div>
      </motion.div>
    </div>
  )
}
