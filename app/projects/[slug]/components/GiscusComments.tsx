"use client"
import { useEffect, useRef } from "react"

interface GiscusCommentsProps {
  projectName?: string
  githubUrl?: string // GitHub repo URL (e.g., "https://github.com/minaragaie/turris-erp")
}

export default function GiscusComments({ projectName, githubUrl }: GiscusCommentsProps) {
  const commentsRef = useRef<HTMLDivElement>(null)

  // Extract repo owner/name from GitHub URL
  const getRepoInfo = (url?: string) => {
    if (!url) return null
    const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/)
    if (!match) return null
    return {
      owner: match[1],
      name: match[2],
      fullRepo: `${match[1]}/${match[2]}`
    }
  }

  const repoInfo = getRepoInfo(githubUrl)

  useEffect(() => {
    if (!commentsRef.current || !repoInfo) return

    // Clear previous comments
    commentsRef.current.innerHTML = ""

    // Create script element
    const script = document.createElement("script")
    script.src = "https://giscus.app/client.js"
    script.setAttribute("data-repo", repoInfo.fullRepo)
    script.setAttribute("data-repo-id", "") // Giscus will fetch automatically
    script.setAttribute("data-category", "General")
    script.setAttribute("data-category-id", "") // Giscus will fetch automatically
    script.setAttribute("data-mapping", "pathname")
    script.setAttribute("data-strict", "0")
    script.setAttribute("data-reactions-enabled", "1")
    script.setAttribute("data-emit-metadata", "0")
    script.setAttribute("data-input-position", "top")
    script.setAttribute("data-theme", "dark_dimmed")
    script.setAttribute("data-lang", "en")
    script.setAttribute("data-loading", "lazy")
    script.crossOrigin = "anonymous"
    script.async = true

    commentsRef.current.appendChild(script)

    // Cleanup
    return () => {
      if (commentsRef.current) {
        commentsRef.current.innerHTML = ""
      }
    }
  }, [repoInfo?.fullRepo])

  // Don't render if no GitHub URL
  if (!githubUrl || !repoInfo) {
    return (
      <div className="mt-16 pt-8 border-t" style={{ borderColor: "var(--projects-border)" }}>
        <div className="mb-6">
          <h2 
            className="text-2xl font-bold mb-2"
            style={{ color: "var(--projects-text-white)" }}
          >
            💬 Comments & Discussion
          </h2>
          <p 
            className="text-sm"
            style={{ color: "var(--projects-text-muted)" }}
          >
            Comments are not available for this project.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-16 pt-8 border-t" style={{ borderColor: "var(--projects-border)" }}>
      <div className="mb-6">
        <h2 
          className="text-2xl font-bold mb-2"
          style={{ color: "var(--projects-text-white)" }}
        >
          💬 Comments & Discussion
        </h2>
        <p 
          className="text-sm"
          style={{ color: "var(--projects-text-muted)" }}
        >
          {projectName && `Share your thoughts about ${projectName}. `}
          Comments are linked to the{" "}
          <a 
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline"
          >
            {repoInfo.fullRepo}
          </a>
          {" "}repository. Sign in with GitHub to comment.
        </p>
      </div>
      <div ref={commentsRef} className="giscus-container" />
    </div>
  )
}

