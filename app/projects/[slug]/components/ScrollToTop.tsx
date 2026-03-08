"use client"
import { useState, useEffect } from "react"
import { ArrowUp } from "lucide-react"

interface ScrollToTopProps {
  threshold?: number // Show button after scrolling this many pixels
  mainElementId?: string // ID of the scrollable element (default: looks for main)
}

export default function ScrollToTop({ 
  threshold = 200,
  mainElementId 
}: ScrollToTopProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const mainElement = mainElementId 
      ? document.getElementById(mainElementId)
      : document.querySelector('main')
    
    if (!mainElement) return

    const handleScroll = () => {
      setIsVisible(mainElement.scrollTop > threshold)
    }

    // Initial check
    handleScroll()

    mainElement.addEventListener('scroll', handleScroll)
    return () => mainElement.removeEventListener('scroll', handleScroll)
  }, [threshold, mainElementId])

  const scrollToTop = () => {
    const mainElement = mainElementId 
      ? document.getElementById(mainElementId)
      : document.querySelector('main')
    
    if (mainElement) {
      mainElement.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
    }
  }

  if (!isVisible) return null

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 p-3 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 hover:shadow-blue-500/50 print:hidden group"
      style={{
        background: "var(--projects-primary)",
        border: "2px solid var(--projects-border)",
        zIndex: 9999,
      }}
      aria-label="Scroll to top"
    >
      <ArrowUp 
        className="w-5 h-5 transition-colors duration-200" 
        style={{ color: "var(--projects-text-white)" }}
      />
      
      {/* Tooltip */}
      <span 
        className="absolute bottom-full right-0 mb-2 px-2 py-1 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none shadow-lg"
        style={{
          background: "var(--projects-card-bg)",
          color: "var(--projects-text-white)",
          border: "1px solid var(--projects-border)"
        }}
      >
        Scroll to top
      </span>
    </button>
  )
}

