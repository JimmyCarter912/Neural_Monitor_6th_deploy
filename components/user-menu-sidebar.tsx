"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Phone, Mail, Star, Edit2, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface UserMenuSidebarProps {
  isOpen: boolean
  onClose: () => void
  userName: string
  onLogout: () => void
}

export default function UserMenuSidebar({ isOpen, onClose, userName, onLogout }: UserMenuSidebarProps) {
  const [showFeedback, setShowFeedback] = useState(false)
  const [rating, setRating] = useState(0)
  const [hoveredStar, setHoveredStar] = useState(0)
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [editedName, setEditedName] = useState(userName)
  const [profileImage, setProfileImage] = useState<string | null>(null)

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser") || "{}")
    if (user.profileImage) {
      setProfileImage(user.profileImage)
    }
  }, [])

  const handleStarClick = (starIndex: number) => {
    setRating(starIndex)
  }

  const handleFeedbackSubmit = () => {
    setFeedbackSubmitted(true)
    setTimeout(() => {
      setShowFeedback(false)
      setFeedbackSubmitted(false)
      setRating(0)
    }, 4000)
  }

  const handlePhoneClick = () => {
    window.location.href = "tel:+918050869711"
  }

  const handleEmailClick = () => {
    window.location.href = "mailto:flamingomemories.team@gmail.com"
  }

  const handleSaveProfile = () => {
    const user = JSON.parse(localStorage.getItem("currentUser") || "{}")
    user.name = editedName
    if (profileImage) {
      user.profileImage = profileImage
    }
    localStorage.setItem("currentUser", JSON.stringify(user))
    setIsEditingProfile(false)
    window.dispatchEvent(new Event("storage"))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfileImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-md z-40"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 250,
              opacity: { duration: 0.3 },
            }}
            className="fixed left-0 top-0 h-full w-80 border-r border-white/10 shadow-2xl z-50 overflow-y-auto"
            style={{
              background: "rgba(30, 25, 60, 0.7)",
              backdropFilter: "blur(40px) saturate(180%) brightness(1.1)",
              WebkitBackdropFilter: "blur(40px) saturate(180%) brightness(1.1)",
              boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37), inset 0 1px 0 0 rgba(255, 255, 255, 0.05)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-xl font-semibold text-white/90">Menu</h2>
              <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* User Profile Section */}
            <div className="p-6 border-b border-white/10">
              {!isEditingProfile ? (
                <>
                  <div className="flex items-center space-x-3 mb-4 relative group">
                    <div className="relative">
                      {profileImage ? (
                        <img
                          src={profileImage || "/placeholder.svg"}
                          alt="Profile"
                          className="w-12 h-12 rounded-full object-cover ring-2 ring-purple-400/30"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500/40 to-violet-600/40 flex items-center justify-center ring-2 ring-purple-400/30 backdrop-blur-sm">
                          <span className="text-xl font-semibold text-white">{userName.charAt(0).toUpperCase()}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-semibold">{userName}</p>
                      <p className="text-sm text-white/50">Active</p>
                    </div>
                    <button
                      onClick={() => setIsEditingProfile(true)}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all backdrop-blur-sm"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  {/* Profile Image Upload */}
                  <div className="flex flex-col items-center space-y-2">
                    <div className="relative group">
                      {profileImage ? (
                        <img
                          src={profileImage || "/placeholder.svg"}
                          alt="Profile"
                          className="w-20 h-20 rounded-full object-cover ring-2 ring-purple-400/40"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500/40 to-violet-600/40 flex items-center justify-center ring-2 ring-purple-400/40 backdrop-blur-sm">
                          <span className="text-3xl font-semibold text-white">
                            {editedName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <label className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm">
                        <Upload className="w-6 h-6 text-white" />
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      </label>
                    </div>
                    <p className="text-xs text-white/50">Click to upload photo</p>
                  </div>

                  {/* Name Input */}
                  <div>
                    <label className="text-sm text-white/60 mb-2 block">Username</label>
                    <Input
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      maxLength={18}
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-purple-400/50 focus:ring-purple-400/30 backdrop-blur-sm"
                    />
                    <p className="text-xs text-white/40 mt-1">{editedName.length}/18 characters</p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <Button
                      onClick={handleSaveProfile}
                      className="flex-1 bg-purple-500/80 hover:bg-purple-500 text-white backdrop-blur-sm"
                    >
                      Save
                    </Button>
                    <Button
                      onClick={() => {
                        setIsEditingProfile(false)
                        setEditedName(userName)
                      }}
                      variant="outline"
                      className="flex-1 border-white/20 text-white/80 hover:bg-white/10 bg-transparent backdrop-blur-sm"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {!isEditingProfile && (
                <Button
                  onClick={onLogout}
                  variant="outline"
                  className="w-full border-white/20 text-white/80 hover:bg-white/10 hover:text-white bg-transparent backdrop-blur-sm"
                >
                  Logout
                </Button>
              )}
            </div>

            {/* Contact Section */}
            <div className="p-6 border-b border-white/10">
              <h3 className="text-lg font-semibold text-white/90 mb-3">Having any trouble?</h3>
              <p className="text-sm text-white/60 mb-4">Knock up</p>

              <div className="space-y-3">
                <button
                  onClick={handlePhoneClick}
                  className="w-full flex items-center space-x-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all group backdrop-blur-sm"
                >
                  <div className="p-2 rounded-full bg-gradient-to-br from-purple-500/30 to-violet-600/30 group-hover:from-purple-500/40 group-hover:to-violet-600/40 transition-all backdrop-blur-sm">
                    <Phone className="w-4 h-4 text-purple-300" />
                  </div>
                  <div className="flex-1 text-left overflow-hidden">
                    <p className="text-sm text-white/50">Call</p>
                    <p className="text-xs font-medium text-white/80 truncate">+91 8050869711</p>
                  </div>
                </button>

                <button
                  onClick={handleEmailClick}
                  className="w-full flex items-center space-x-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all group backdrop-blur-sm"
                >
                  <div className="p-2 rounded-full bg-gradient-to-br from-purple-500/30 to-violet-600/30 group-hover:from-purple-500/40 group-hover:to-violet-600/40 transition-all backdrop-blur-sm">
                    <Mail className="w-4 h-4 text-purple-300" />
                  </div>
                  <div className="flex-1 text-left overflow-hidden">
                    <p className="text-sm text-white/50">Email</p>
                    <p className="text-[10px] font-medium text-white/80 truncate">flamingomemories.team@gmail.com</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Feedback Section */}
            <div className="p-6">
              <h3 className="text-lg font-semibold text-white/90 mb-3">Enlightened?</h3>
              <Button
                onClick={() => setShowFeedback(true)}
                className="w-full bg-purple-500/80 hover:bg-purple-500 text-white transition-all backdrop-blur-sm"
              >
                Let us know how you feel
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feedback Popup */}
      <AnimatePresence>
        {showFeedback && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-lg z-[60]"
              onClick={() => !feedbackSubmitted && setShowFeedback(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-[70]"
            >
              <div
                className="p-8 mx-4 rounded-2xl border border-white/10 shadow-2xl"
                style={{
                  background: "rgba(30, 25, 60, 0.85)",
                  backdropFilter: "blur(40px) saturate(180%) brightness(1.1)",
                  WebkitBackdropFilter: "blur(40px) saturate(180%) brightness(1.1)",
                  boxShadow: "0 8px 32px 0 rgba(138, 43, 226, 0.3), inset 0 1px 0 0 rgba(255, 255, 255, 0.05)",
                }}
              >
                {!feedbackSubmitted ? (
                  <>
                    <h3 className="text-2xl font-bold text-white text-center mb-6">Rate Your Experience</h3>

                    {/* Star Rating */}
                    <div className="flex justify-center space-x-2 mb-8">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => handleStarClick(star)}
                          onMouseEnter={() => setHoveredStar(star)}
                          onMouseLeave={() => setHoveredStar(0)}
                          className="transition-transform hover:scale-110 active:scale-95"
                        >
                          <Star
                            className={`w-10 h-10 transition-all ${
                              star <= (hoveredStar || rating)
                                ? "fill-purple-400 text-purple-400 drop-shadow-[0_0_12px_rgba(168,85,247,0.8)]"
                                : "text-white/30"
                            }`}
                          />
                        </button>
                      ))}
                    </div>

                    {/* Submit Button - Only show after rating */}
                    <AnimatePresence>
                      {rating > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Button
                            onClick={handleFeedbackSubmit}
                            className="w-full bg-purple-500/80 hover:bg-purple-500 text-white text-lg py-6 transition-all backdrop-blur-sm"
                          >
                            Here You Go
                          </Button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="text-center"
                  >
                    <div className="mb-4 flex justify-center">
                      <div className="p-4 rounded-full bg-gradient-to-br from-purple-500/40 to-violet-600/40 backdrop-blur-sm">
                        <Star className="w-12 h-12 text-purple-300 fill-purple-300" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {rating >= 3
                        ? "Damn! That's a hell of a news for our Boss"
                        : "Ohh, looks like someone's getting fired"}
                    </h3>
                    <p className="text-white/70">
                      {rating >= 3 ? "Thank you for your feedback!" : "We'll work harder to improve!"}
                    </p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
