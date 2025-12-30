"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"

interface CustomSelectProps {
  value: string | number
  options: { value: string | number; label: string }[]
  onChange: (value: number) => void
  label?: string
}

export default function CustomSelect({ value, options, onChange, label }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const selectRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const selectedOption = options.find((opt) => opt.value === value)

  return (
    <div ref={selectRef} className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-[rgba(23,17,42,0.6)] backdrop-blur-xl border border-[rgba(182,140,255,0.2)] rounded-xl px-4 py-2.5 text-[var(--text-primary)] font-medium focus:outline-none focus:border-[var(--glow-main)] transition-all cursor-pointer flex items-center justify-between group hover:bg-[rgba(23,17,42,0.8)] hover:border-[rgba(182,140,255,0.4)]"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <span className="text-sm">{selectedOption?.label}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3, ease: "easeInOut" }}>
          <ChevronDown className="w-4 h-4 text-[var(--glow-main)] transition-colors group-hover:text-[#b68cff]" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute z-50 w-full mt-2 bg-[rgba(23,17,42,0.95)] backdrop-blur-2xl border border-[rgba(182,140,255,0.3)] rounded-xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
          >
            <div className="max-h-64 overflow-y-auto custom-scrollbar">
              {options.map((option, index) => (
                <motion.button
                  key={option.value}
                  onClick={() => {
                    onChange(typeof option.value === "number" ? option.value : Number.parseInt(option.value as string))
                    setIsOpen(false)
                  }}
                  className={`w-full px-4 py-3 text-left text-sm transition-all ${
                    option.value === value
                      ? "bg-[rgba(182,140,255,0.2)] text-[var(--text-primary)] font-semibold"
                      : "text-[var(--text-secondary)] hover:bg-[rgba(182,140,255,0.1)] hover:text-[var(--text-primary)]"
                  }`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  whileHover={{ x: 4 }}
                >
                  {option.label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
