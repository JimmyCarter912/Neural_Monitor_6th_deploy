"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { createUser, signInUser } from "@/lib/local-storage"

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="currentColor"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="currentColor"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="currentColor"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="currentColor"
    />
  </svg>
)

const FacebookIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
)

const XIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)

  useEffect(() => {
    const checkUser = () => {
      const currentUser = localStorage.getItem("currentUser")
      if (currentUser) {
        router.push("/")
      }
    }
    checkUser()
  }, [router])

  const handleGoogleSignIn = async () => {
    setError("OAuth sign-in is not available in local storage mode. Please use email and password.")
  }

  const handleFacebookSignIn = async () => {
    setError("OAuth sign-in is not available in local storage mode. Please use email and password.")
  }

  const handleXSignIn = async () => {
    setError("OAuth sign-in is not available in local storage mode. Please use email and password.")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      if (isSignUp) {
        const user = createUser(email, password)

        if (rememberMe) {
          localStorage.setItem("rememberMe", "true")
        }

        localStorage.setItem(
          "currentUser",
          JSON.stringify({
            email: user.email,
            name: user.name,
            id: user.id,
          }),
        )
        localStorage.setItem("isNewUser", "true")
        router.push("/set-username")
      } else {
        const user = signInUser(email, password)

        if (rememberMe) {
          localStorage.setItem("rememberMe", "true")
        }

        localStorage.setItem(
          "currentUser",
          JSON.stringify({
            email: user.email,
            name: user.name,
            id: user.id,
          }),
        )
        localStorage.setItem("isReturningUser", "true")
        router.push("/")
      }
    } catch (error: any) {
      console.error("Auth error:", error)
      setError(error.message || "An error occurred. Please try again.")
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
          <h1 className="text-4xl sm:text-5xl font-semibold text-[var(--text-primary)] mb-3 tracking-tight">
            Neural Monitor
          </h1>
          <p className="text-[var(--text-secondary)] text-sm">
            {isSignUp ? "Create your account" : "Sign in to continue"}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="glass-card p-8 sm:p-10"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wide"
              >
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                className="h-12 bg-[var(--bg-card-soft)]/50 border-[var(--border-glass)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--glow-soft)] focus:ring-2 focus:ring-[var(--glow-soft)]/20 transition-all rounded-xl"
              />
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wide"
              >
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="h-12 bg-[var(--bg-card-soft)]/50 border-[var(--border-glass)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--glow-soft)] focus:ring-2 focus:ring-[var(--glow-soft)]/20 pr-12 transition-all rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {!isSignUp && (
              <div className="flex items-center space-x-2 pt-1">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  className="border-[var(--border-glass)]/60 bg-[var(--bg-card-soft)]/30 data-[state=checked]:bg-[var(--glow-soft)] data-[state=checked]:border-[var(--glow-soft)] rounded-[0.35rem] shadow-[0_0_8px_rgba(139,92,246,0.15)] data-[state=checked]:shadow-[0_0_12px_rgba(139,92,246,0.4)]"
                />
                <label htmlFor="remember" className="text-sm text-[var(--text-secondary)] cursor-pointer select-none">
                  Remember me
                </label>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-sm text-red-400"
              >
                {error}
              </motion.div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-[var(--glow-soft)] hover:bg-[var(--glow-main)] text-white font-semibold transition-all rounded-xl shadow-lg shadow-[var(--glow-soft)]/20 hover:shadow-[var(--glow-soft)]/30 mt-6"
            >
              {isLoading ? (isSignUp ? "Creating account..." : "Signing in...") : isSignUp ? "Sign Up" : "Sign In"}
            </Button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--border-glass)]"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 text-[var(--text-muted)] uppercase tracking-wide">Or continue with</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-6">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-14 h-14 flex items-center justify-center rounded-full bg-[var(--bg-card-soft)]/30 border border-[var(--border-glass)]/40 text-[var(--glow-soft)] transition-all hover:bg-[var(--bg-card-soft)]/50 hover:border-[var(--glow-soft)]/60 hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] shadow-[0_0_12px_rgba(139,92,246,0.2)] group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <GoogleIcon />
            </button>

            <button
              type="button"
              onClick={handleFacebookSignIn}
              disabled={isLoading}
              className="w-14 h-14 flex items-center justify-center rounded-full bg-[var(--bg-card-soft)]/30 border border-[var(--border-glass)]/40 text-[var(--glow-soft)] transition-all hover:bg-[var(--bg-card-soft)]/50 hover:border-[var(--glow-soft)]/60 hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] shadow-[0_0_12px_rgba(139,92,246,0.2)] group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FacebookIcon />
            </button>

            <button
              type="button"
              onClick={handleXSignIn}
              disabled={isLoading}
              className="w-14 h-14 flex items-center justify-center rounded-full bg-[var(--bg-card-soft)]/30 border border-[var(--border-glass)]/40 text-[var(--glow-soft)] transition-all hover:bg-[var(--bg-card-soft)]/50 hover:border-[var(--glow-soft)]/60 hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] shadow-[0_0_12px_rgba(139,92,246,0.2)] group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <XIcon />
            </button>
          </div>

          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp)
                setError("")
              }}
              className="text-sm text-[var(--text-secondary)] hover:text-[var(--glow-soft)] transition-colors"
            >
              {isSignUp ? (
                <>
                  Already have an account? <span className="font-semibold text-[var(--glow-soft)]">Sign In</span>
                </>
              ) : (
                <>
                  New user? <span className="font-semibold text-[var(--glow-soft)]">Sign Up</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
