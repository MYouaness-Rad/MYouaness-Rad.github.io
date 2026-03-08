"use client"

interface ReadingProgressProps {
  progress: number
  height?: string
  color?: string
  showShadow?: boolean
  className?: string
}

export default function ReadingProgress({ 
  progress, 
  height = "h-1",
  color = "linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%)",
  showShadow = true,
  className = ""
}: ReadingProgressProps) {
  return (
    <div className={`fixed top-0 left-0 w-full ${height} z-50 bg-gray-800/20 ${className}`}>
      <div
        className="h-full transition-all duration-300 ease-out"
        style={{
          width: `${Math.min(100, Math.max(0, progress))}%`,
          background: color,
          boxShadow: showShadow && progress > 0 ? "0 0 10px rgba(59, 130, 246, 0.5)" : "none",
        }}
      />
    </div>
  )
}

