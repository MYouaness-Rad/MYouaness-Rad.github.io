"use client"
import { useEffect, useState, useRef, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { ChevronLeft } from "lucide-react"
import { useResumeData } from "@/hooks/useResumeData"
import { Project } from "@/types/resume"
import { config } from "@/lib/config"
import ReadingProgress from "./components/ReadingProgress"
import ProjectHeader from "./components/ProjectHeader"
import TableOfContents from "./components/TableOfContents"
import ProjectMetadata from "./components/ProjectMetadata"
import ProjectContent from "./components/ProjectContent"
import ScrollToTop from "./components/ScrollToTop"
import GiscusComments from "./components/GiscusComments"
import {
  useReadingProgress,
  useActiveHeading,
  useHeadingExtraction,
} from "./components/useProjectScroll"
import "./styles/print.css"

export default function ProjectDetailClient() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const { resumeData } = useResumeData()

  const [markdownContent, setMarkdownContent] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [project, setProject] = useState<Project | null>(null)

  // Ref to control scroll tracking
  const isScrollingProgrammatically = useRef(false)

  // Custom hooks for scroll behavior
  const readingProgress = useReadingProgress()
  const { headings, headingTree } = useHeadingExtraction(markdownContent)
  const activeId = useActiveHeading(headings, isScrollingProgrammatically)

  // Helper to extract repo info from GitHub URL
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

  // Find project by slug
  useEffect(() => {
    if (resumeData?.projects) {
      const found = resumeData.projects.find((p: any) => p.slug === slug)
      setProject(found || null)
      
      if (!found) {
        setError("Project not found")
        setLoading(false)
      }
    }
  }, [resumeData, slug])

  // Fetch portfolio content (from backend if private, from GitHub if public)
  useEffect(() => {
    const fetchPortfolio = async () => {
      if (!project) return

      setLoading(true)
      setError(null)

      try {
        // Check if project is private - fetch from backend
        if ((project as any).isPrivateRepo) {
          const portfolioUrl = `${config.API_BASE_URL}${config.ENDPOINTS.PORTFOLIO}&slug=${project.slug}`
          console.log('Fetching portfolio from backend:', portfolioUrl)
          
          const response = await fetch(portfolioUrl)
          
          if (!response.ok) {
            console.error('Backend response error:', response.status, response.statusText)
            try {
              const errorText = await response.text()
              console.error('Error details:', errorText)
              
              // Try to parse as JSON for more details
              let errorDetails = errorText
              try {
                const errorJson = JSON.parse(errorText)
                errorDetails = JSON.stringify(errorJson, null, 2)
              } catch (e) {
                // Keep as text if not JSON
              }
              
              throw new Error(`Backend API error (${response.status}): ${response.statusText}\n${errorDetails}`)
            } catch (parseError) {
              throw new Error(`Failed to load portfolio from backend: ${response.status} ${response.statusText}`)
            }
          }
          
          const result = await response.json()
          console.log('Backend response:', result)
          
          if (!result.content || result.content.trim() === '') {
            throw new Error("Portfolio content is empty or missing")
          }
          
          setMarkdownContent(result.content)
          setLoading(false)
          return
        }

        // Public repo - fetch from GitHub
        if (!project.githubUrl) {
          setError("Project does not have a GitHub repository")
          setLoading(false)
          return
        }

        const repoInfo = getRepoInfo(project.githubUrl)
        if (!repoInfo) {
          setError("Invalid GitHub URL")
          setLoading(false)
          return
        }

        // Try portfolio.md (lowercase) from main branch first
        let portfolioUrl = `https://raw.githubusercontent.com/${repoInfo.fullRepo}/main/portfolio.md`
        let response = await fetch(portfolioUrl)
        
        // Try PORTFOLIO.md (uppercase) if lowercase doesn't exist
        if (!response.ok) {
          portfolioUrl = `https://raw.githubusercontent.com/${repoInfo.fullRepo}/main/PORTFOLIO.md`
          response = await fetch(portfolioUrl)
        }
        
        // Try master branch with lowercase
        if (!response.ok) {
          portfolioUrl = `https://raw.githubusercontent.com/${repoInfo.fullRepo}/master/portfolio.md`
          response = await fetch(portfolioUrl)
        }
        
        // Try master branch with uppercase
        if (!response.ok) {
          portfolioUrl = `https://raw.githubusercontent.com/${repoInfo.fullRepo}/master/PORTFOLIO.md`
          response = await fetch(portfolioUrl)
        }
        
        if (!response.ok) {
          throw new Error("portfolio.md or PORTFOLIO.md not found in repository")
        }
        
        const text = await response.text()
        setMarkdownContent(text)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching portfolio:", err)
        setError("Failed to load project portfolio")
        setLoading(false)
      }
    }

    if (project) {
      fetchPortfolio()
    }
  }, [project])

  // Handle TOC click - memoized to prevent recreation
  const handleTOCClick = useCallback((e: React.MouseEvent, id: string) => {
    e.preventDefault()
    const mainElement = document.getElementById("main-content")
    const targetElement = document.getElementById(id)
    
    if (mainElement && targetElement) {
      // Disable scroll tracking BEFORE any scroll happens
      isScrollingProgrammatically.current = true
      
      // Update hash first (only once)
      history.replaceState(null, "", `#${id}`)
      
      // Listen for scroll end to re-enable tracking
      const handleScrollEnd = () => {
        isScrollingProgrammatically.current = false
        mainElement.removeEventListener("scrollend", handleScrollEnd)
      }
      
      mainElement.addEventListener("scrollend", handleScrollEnd, { once: true })
      
      // Fallback timeout in case scrollend doesn't fire (older browsers)
      const fallbackTimeout = setTimeout(() => {
        if (isScrollingProgrammatically.current) {
          isScrollingProgrammatically.current = false
          mainElement.removeEventListener("scrollend", handleScrollEnd)
        }
      }, 1500)
      
      // Then scroll
      const elementTop = targetElement.offsetTop - mainElement.offsetTop
      mainElement.scrollTo({
        top: elementTop - 100, // Offset for header
        behavior: "smooth",
      })
      
      // Clear fallback if scrollend fires first
      mainElement.addEventListener("scrollend", () => clearTimeout(fallbackTimeout), { once: true })
    }
  }, [])

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#1e1e1e] text-[#d4d4d4] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#007acc] mx-auto mb-4"></div>
          <p>Loading project details...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !project) {
    return (
      <div className="min-h-screen bg-[#1e1e1e] text-[#d4d4d4] flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <p className="text-[#f48771] text-xl mb-2">
            {error || "Project not found"}
          </p>
          <p className="mb-6 text-sm text-gray-400">
            {error 
              ? "Unable to load the project portfolio from GitHub. Make sure the repository has a portfolio.md file."
              : "The project you're looking for doesn't exist."}
          </p>
          {project?.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mb-4 px-6 py-2 rounded-lg font-medium transition-all duration-200 hover:bg-[#007acc]/20 border border-[#007acc] text-[#007acc]"
            >
              View on GitHub →
            </a>
          )}
          <br />
          <button
            onClick={() => router.push("/#projects")}
            className="px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:bg-[#007acc]/20 border border-[#007acc] text-[#007acc]"
          >
            ← Back to Projects
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-[var(--bg-primary)] overflow-hidden">
      <ReadingProgress progress={readingProgress} />
      <ProjectHeader projectName={project.name} />

      <div className="flex-1 overflow-hidden min-h-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex gap-4 h-full py-4">
            <TableOfContents
              headingTree={headingTree}
              activeId={activeId}
              onTOCClick={handleTOCClick}
            />

            <main 
              id="main-content"
              className="flex-1 min-w-0 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent"
            >
              <div className="pr-4">
                <ProjectMetadata project={project} />
                <ProjectContent markdownContent={markdownContent} headingTree={headingTree} />

                {/* Giscus Comments Section - Only for public repos */}
                {!(project as any).isPrivateRepo && (
                  <GiscusComments 
                    projectName={project.name}
                    githubUrl={project.githubUrl}
                  />
                )}

                <div
                  className="mt-12 pt-6 border-t border-[var(--projects-border)]"
                >
                  <button
                    onClick={() => router.push("/#projects")}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150 hover:bg-white/5"
                    style={{ color: "var(--projects-text-accent-blue)", border: "1px solid var(--projects-border)" }}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Back to All Projects
                  </button>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      <ScrollToTop threshold={300} mainElementId="main-content" />
    </div>
  )
}
