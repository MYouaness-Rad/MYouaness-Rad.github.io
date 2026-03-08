"use client"
import { useRouter } from "next/navigation"
import { ChevronLeft, Share2, Printer } from "lucide-react"

interface ProjectHeaderProps {
  projectName?: string
  showBackButton?: boolean
  backUrl?: string
  backText?: string
  showActions?: boolean
  customActions?: React.ReactNode
}

export default function ProjectHeader({ 
  projectName, 
  showBackButton = true,
  backUrl = "/#projects",
  backText = "Back",
  showActions = true,
  customActions
}: ProjectHeaderProps) {
  const router = useRouter()

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: projectName, url: window.location.href })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert("✓ Link copied to clipboard!")
    }
  }

  const handleBack = () => {
    if (backUrl.startsWith("/")) {
      router.push(backUrl)
    } else {
      window.location.href = backUrl
    }
  }

  return (
    <header className="sticky top-0 z-40 backdrop-blur-sm bg-[var(--projects-bg)]/90 border-b border-[var(--projects-border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex items-center justify-between">
          {showBackButton && (
            <button
              onClick={handleBack}
              className="flex items-center gap-1.5 px-2 py-1.5 rounded hover:bg-white/5 transition-colors duration-150 text-sm"
              style={{ color: "var(--projects-text-white)" }}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>{backText}</span>
            </button>
          )}
          
          {showActions && (
            <div className="flex gap-1">
              {customActions || (
                <>
                  <button
                    onClick={handleShare}
                    className="p-2 rounded hover:bg-white/5 transition-colors duration-150"
                    style={{ color: "var(--projects-text-white)" }}
                    aria-label="Share"
                    title="Share"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="p-2 rounded hover:bg-white/5 transition-colors duration-150 print:hidden"
                    style={{ color: "var(--projects-text-white)" }}
                    aria-label="Print"
                    title="Print"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

