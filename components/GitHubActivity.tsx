"use client"

import React, { useEffect, useMemo, useState } from "react"
import { 
  Star, 
  GitBranch, 
  Code, 
  ExternalLink, 
  Calendar, 
  TrendingUp, 
  Users, 
  Clock,
  Activity,
  Zap,
  Award,
  Github,
  Eye,
  GitCommit,
  GitPullRequest,
  MessageSquare,
  CheckCircle2,
  Circle
} from "lucide-react"
import { useResumeData } from "@/hooks/useResumeData"
import { config } from "@/lib/config"
import ContributionsHeatmap, { Contribution } from "@/components/ContributionsHeatmap"

interface Repo {
  name: string
  html_url: string
  description: string
  language: string
  stargazers_count: number
  forks_count: number
  commits_count: number
  updated_at: string
  size: number
  topics: string[]
  visibility: string
  full_name?: string
}

interface ActivityEvent {
  type: 'commit' | 'pull_request' | 'pull_request_review' | 'issue'
  repo: string
  repoFullName: string
  date: string
  title?: string
  count?: number
  status?: 'open' | 'closed' | 'merged'
}

interface GitHubStats {
  totalRepos: number
  totalStars: number
  totalForks: number
  totalCommits: number
  languages: Record<string, number>
  recentActivity: ActivityEvent[]
  privateRepos: number
  publicRepos: number
  contributions: Contribution[]
  contributedRepos: string[]
  activityBreakdown: {
    commits: number
    pullRequests: number
    reviews: number
    issues: number
  }
}

const languageColors: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f7df1e",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Python: "#3572A5",
  PHP: "#4F5D95",
  Java: "#b07219",
  "C++": "#00599C",
  "C#": "#239120",
  Go: "#00ADD8",
  Rust: "#000000",
  Swift: "#FA7343",
  Kotlin: "#7F52FF",
  Ruby: "#CC342D",
  Shell: "#89e051",
  Dockerfile: "#384d54",
  "Vue.js": "#4FC08D",
  React: "#61DAFB",
  "Node.js": "#339933",
  "Next.js": "#000000",
  "Svelte": "#FF3E00",
  "Angular": "#DD0031",
  "Express": "#000000",
  "Django": "#092E20",
  "Flask": "#000000",
  "Laravel": "#FF2D20",
  "Spring": "#6DB33F",
  "Rails": "#CC0000",
  "ASP.NET": "#512BD4",
  "Jupyter Notebook": "#F37626",
  "Markdown": "#083FA1",
  "JSON": "#000000",
  "YAML": "#CB171E",
  "XML": "#005F9F",
  "SQL": "#336791",
  "R": "#276DC3",
  "MATLAB": "#e16737",
  "Scala": "#DC322F",
  "Clojure": "#5881D8",
  "Haskell": "#5D4F85",
  "Elixir": "#4B275F",
  "Erlang": "#A90533",
  "F#": "#378BBA",
  "OCaml": "#EC6813",
  "Perl": "#39457E",
  "Lua": "#000080",
  "PowerShell": "#012456",
  "Assembly": "#6E4C13",
  "C": "#A8B9CC",
  "Objective-C": "#438EFF",
  "Dart": "#00B4AB",
  "Elm": "#60B5CC",
  "Julia": "#A270BA",
  "Nim": "#FFE953",
  "Crystal": "#000100",
  "Groovy": "#4298B8",
  "Haxe": "#DF7900",
  "Idris": "#B30000",
  "PureScript": "#1D222D",
  "Reason": "#FF5847",
  "Solidity": "#363636",
  "Terraform": "#623CE4",
  "Vim script": "#199F4B",
  "WebAssembly": "#654FF0",
  "Zig": "#F7A41D"
}

// Helper function to mask private repo names
const maskPrivateRepoName = (repoName: string, isPrivate: boolean): string => {
  if (!isPrivate) return repoName
  return "Private Repo"
}

// Helper function to generate contribution heatmap data from real events only
const generateContributions = (events: ActivityEvent[]): Contribution[] => {
  const contributionsMap = new Map<string, number>()
  
  // Group events by date - only use real data
  events.forEach(event => {
    const date = event.date.split('T')[0]
    const currentCount = contributionsMap.get(date) || 0
    // For commits, use the actual count, for other events count as 1
    const increment = event.type === 'commit' ? (event.count || 1) : 1
    contributionsMap.set(date, currentCount + increment)
  })
  
  // Only generate contributions for dates where we have real data
  // Sort dates and create contribution entries
  const contributions: Contribution[] = []
  const sortedDates = Array.from(contributionsMap.keys()).sort()
  
    sortedDates.forEach(dateStr => {
      const count = contributionsMap.get(dateStr) || 0
      if (count > 0) {
        // Calculate contribution level
        let level: 0 | 1 | 2 | 3 | 4 = 0
        if (count > 0) {
          if (count <= 3) level = 1
          else if (count <= 7) level = 2
          else if (count <= 12) level = 3
          else level = 4
        }
        
        contributions.push({
          date: dateStr,
          count,
          level
        })
      }
    })
    
    return contributions
  }

interface GitHubActivityProps {
  username: string
  emails?: string[] // Optional array of email addresses to fetch commits for
}

const GitHubActivity: React.FC<GitHubActivityProps> = ({ username, emails = [] }) => {
  const [repos, setRepos] = useState<Repo[]>([])
  const [stats, setStats] = useState<GitHubStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [chartBg, setChartBg] = useState("ffffff")
  const [activeTab, setActiveTab] = useState<'repos' | 'activity' | 'languages'>('activity')
  const [hasPrivateAccess, setHasPrivateAccess] = useState(false)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const { resumeData } = useResumeData()
  
  // Default emails if not provided
  const authorEmails = emails.length > 0 ? emails : ['minaragaie@hotmail.com', 'myouaness@radwell.com']

  // Map repo name -> project slug for quick lookup (based on githubUrl)
  const projectRepoNameToSlug = useMemo(() => {
    const map = new Map<string, string>()
    if (resumeData?.projects) {
      for (const p of resumeData.projects as any[]) {
        const url: string | undefined = (p as any).githubUrl
        const slug: string | undefined = (p as any).slug
        if (url && slug) {
          const match = url.match(/github\.com\/[^\/]+\/([^\/?#]+)/)
          if (match && match[1]) {
            map.set(match[1].toLowerCase(), slug)
          }
        }
      }
    }
    return map
  }, [resumeData])

  // Fetch comprehensive GitHub data
  useEffect(() => {
    const fetchGitHubData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Try backend API first for private repos
        let reposData: any[] = []
        let eventsData: any[] = []
        let commitEvents: any[] = []
        let topRepos: any[] = []
        let hasBackendAccess = false

        if (config.API_BASE_URL) {
          try {
            // Build query params with username and emails
            const params = new URLSearchParams({
              username: username,
              ...(authorEmails.length > 0 && { emails: authorEmails.join(',') })
            })
            const backendResponse = await fetch(`${config.API_BASE_URL}${config.ENDPOINTS.GITHUB_ACTIVITY}?${params.toString()}`)
            if (backendResponse.ok) {
              const backendData = await backendResponse.json()
              reposData = backendData.repos || backendData.data?.repos || []
              eventsData = backendData.events || backendData.data?.events || []
              hasBackendAccess = true
              console.log(`✅ Fetched ${reposData.length} repos and ${eventsData.length} events from backend API`)
            }
          } catch (err) {
            console.log('Backend API not available, falling back to public API:', err)
          }
        }

        // Fetch public repos from GitHub API
        if (!hasBackendAccess) {
          const reposResponse = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`)
          
          if (!reposResponse.ok) {
            if (reposResponse.status === 404) {
              throw new Error(`GitHub user "${username}" not found`)
            }
            throw new Error(`Failed to fetch GitHub data: ${reposResponse.status}`)
          }

          reposData = await reposResponse.json()
          
          // Fetch user events (last 30 days, up to 300 events)
          try {
            const eventsResponse = await fetch(`https://api.github.com/users/${username}/events/public?per_page=100`)
            if (eventsResponse.ok) {
              eventsData = await eventsResponse.json()
              console.log(`✅ Fetched ${eventsData.length} events from GitHub Events API (last 30 days)`)
            }
          } catch (err) {
            console.log('Could not fetch events:', err)
          }

          // Fetch commits from repositories to get more historical data
          // Limit to top 10 most recently updated repos to avoid rate limits
          topRepos = reposData
            .filter((r: any) => r.visibility === 'public' && !r.fork)
            .slice(0, 10)
          
          // Fetch commits with rate limiting (sequential with delay)
          // Fetch commits for all email addresses
          commitEvents = []
          for (const repo of topRepos) {
            try {
              // Fetch commits from the last year, authored by the user (by username first)
              const since = new Date()
              since.setFullYear(since.getFullYear() - 1)
              const sinceISO = since.toISOString()
              
              // Fetch commits by username
              const commitsResponse = await fetch(
                `https://api.github.com/repos/${repo.full_name}/commits?author=${username}&since=${sinceISO}&per_page=100`,
                {
                  headers: {
                    'Accept': 'application/vnd.github.v3+json'
                  }
                }
              )
              
              // Check rate limit
              const remaining = parseInt(commitsResponse.headers.get('X-RateLimit-Remaining') || '0')
              if (remaining < 5) {
                console.log('Rate limit approaching, stopping commit fetches')
                break
              }
              
              if (commitsResponse.ok) {
                const commits = await commitsResponse.json()
                console.log(`✅ Fetched ${commits.length} commits from ${repo.full_name} (by username)`)
                
                // Filter commits by email addresses if provided
                const filteredCommits = commits.filter((commit: any) => {
                  const commitEmail = commit.commit.author?.email?.toLowerCase() || ''
                  // If no emails specified, include all commits
                  if (authorEmails.length === 0) return true
                  // Check if commit email matches any of the specified emails
                  return authorEmails.some(email => commitEmail === email.toLowerCase())
                })
                
                filteredCommits.forEach((commit: any) => {
                  commitEvents.push({
                    type: 'PushEvent',
                    repo: {
                      name: repo.name,
                      full_name: repo.full_name
                    },
                    created_at: commit.commit.author.date,
                    payload: {
                      commits: [{
                        sha: commit.sha,
                        message: commit.commit.message,
                        author: commit.commit.author
                      }]
                    }
                  })
                })
                
                // Also fetch commits by each email address (GitHub API supports author email search)
                for (const email of authorEmails) {
                  if (remaining < 3) break // Stop if rate limit is low
                  
                  try {
                    const emailCommitsResponse = await fetch(
                      `https://api.github.com/repos/${repo.full_name}/commits?author=${encodeURIComponent(email)}&since=${sinceISO}&per_page=100`,
                      {
                        headers: {
                          'Accept': 'application/vnd.github.v3+json'
                        }
                      }
                    )
                    
                    const emailRemaining = parseInt(emailCommitsResponse.headers.get('X-RateLimit-Remaining') || '0')
                    if (emailRemaining < 3) {
                      console.log('Rate limit approaching, stopping email-based commit fetches')
                      break
                    }
                    
                    if (emailCommitsResponse.ok) {
                      const emailCommits = await emailCommitsResponse.json()
                      console.log(`✅ Fetched ${emailCommits.length} commits from ${repo.full_name} (by email: ${email})`)
                      
                      // Add commits that aren't already in commitEvents (avoid duplicates)
                      const existingShas = new Set(commitEvents.map((e: any) => e.payload.commits[0].sha))
                      emailCommits.forEach((commit: any) => {
                        if (!existingShas.has(commit.sha)) {
                          commitEvents.push({
                            type: 'PushEvent',
                            repo: {
                              name: repo.name,
                              full_name: repo.full_name
                            },
                            created_at: commit.commit.author.date,
                            payload: {
                              commits: [{
                                sha: commit.sha,
                                message: commit.commit.message,
                                author: commit.commit.author
                              }]
                            }
                          })
                        }
                      })
                    }
                    
                    // Small delay between email fetches
                    await new Promise(resolve => setTimeout(resolve, 100))
                  } catch (err) {
                    console.log(`Could not fetch commits by email ${email} from ${repo.full_name}:`, err)
                  }
                }
              } else if (commitsResponse.status === 404) {
                // Repo might not exist or be inaccessible, skip
                continue
              }
              
              // Small delay to avoid hitting rate limits
              await new Promise(resolve => setTimeout(resolve, 100))
            } catch (err) {
              console.log(`Could not fetch commits from ${repo.full_name}:`, err)
              // Continue with next repo
            }
          }
          
          // Merge commit events with other events
          // Create a set of existing event dates+repos to avoid duplicates
          const existingEventKeys = new Set(eventsData.map((e: any) => {
            const date = e.created_at?.split('T')[0]
            const repo = e.repo?.full_name
            return `${date}-${repo}`
          }))
          
          // Add commit events that don't duplicate existing events
          commitEvents.forEach((commitEvent: any) => {
            const date = commitEvent.created_at?.split('T')[0]
            const repo = commitEvent.repo?.full_name
            const key = `${date}-${repo}`
            if (!existingEventKeys.has(key)) {
              eventsData.push(commitEvent)
            }
          })
          
          // Sort events by date (newest first)
          eventsData.sort((a: any, b: any) => 
            new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
          )
        }

        // Process events into activity timeline
        const activityEvents: ActivityEvent[] = []
        const contributedReposSet = new Set<string>()
        const activityBreakdown = {
          commits: 0,
          pullRequests: 0,
          reviews: 0,
          issues: 0
        }

        eventsData.forEach((event: any) => {
          const repoName = event.repo?.name || 'unknown'
          const repoFullName = event.repo?.full_name || `${username}/${repoName}`
          const isPrivate = reposData.find((r: any) => r.full_name === repoFullName)?.visibility === 'private'
          const maskedRepoName = maskPrivateRepoName(repoName, isPrivate || false)
          
          contributedReposSet.add(repoFullName)

          const eventDate = event.created_at || new Date().toISOString()

          switch (event.type) {
            case 'PushEvent':
              activityBreakdown.commits += event.payload?.commits?.length || 1
              activityEvents.push({
                type: 'commit',
                repo: maskedRepoName,
                repoFullName,
                date: eventDate,
                count: event.payload?.commits?.length || 1
              })
              break
            case 'PullRequestEvent':
              activityBreakdown.pullRequests++
              activityEvents.push({
                type: 'pull_request',
                repo: maskedRepoName,
                repoFullName,
                date: eventDate,
                title: event.payload?.pull_request?.title,
                status: event.payload?.action === 'closed' && event.payload?.pull_request?.merged 
                  ? 'merged' 
                  : event.payload?.pull_request?.state === 'open' 
                  ? 'open' 
                  : 'closed'
              })
              break
            case 'PullRequestReviewEvent':
              activityBreakdown.reviews++
              activityEvents.push({
                type: 'pull_request_review',
                repo: maskedRepoName,
                repoFullName,
                date: eventDate,
                title: event.payload?.pull_request?.title
              })
              break
            case 'IssuesEvent':
              activityBreakdown.issues++
              activityEvents.push({
                type: 'issue',
                repo: maskedRepoName,
                repoFullName,
                date: eventDate,
                title: event.payload?.issue?.title,
                status: event.payload?.issue?.state as 'open' | 'closed'
              })
              break
          }
        })

        // Group activity by month for display
        const groupedActivity = activityEvents.reduce((acc, event) => {
          const date = new Date(event.date)
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
          if (!acc[monthKey]) {
            acc[monthKey] = []
          }
          acc[monthKey].push(event)
          return acc
        }, {} as Record<string, ActivityEvent[]>)

        // Calculate stats
        const totalStars = reposData.reduce((sum: number, repo: any) => sum + repo.stargazers_count, 0)
        const totalForks = reposData.reduce((sum: number, repo: any) => repo.forks_count + sum, 0)
        const publicRepos = reposData.filter((r: any) => r.visibility === 'public').length
        const privateRepos = reposData.filter((r: any) => r.visibility === 'private').length
        
        // Calculate language distribution
        const languages: Record<string, number> = {}
        reposData.forEach((repo: any) => {
          if (repo.language) {
            languages[repo.language] = (languages[repo.language] || 0) + 1
          }
        })

        // Transform repos to match expected format
        const repos: Repo[] = reposData.map((repo: any) => ({
          name: repo.visibility === 'private' ? maskPrivateRepoName(repo.name, true) : repo.name,
          html_url: repo.html_url,
          description: repo.description || '',
          language: repo.language || '',
          stargazers_count: repo.stargazers_count,
          forks_count: repo.forks_count,
          commits_count: 0,
          updated_at: repo.updated_at,
          size: repo.size,
          topics: repo.topics || [],
          visibility: repo.visibility || 'public',
          full_name: repo.full_name
        }))

        // Generate contributions heatmap from real events
        const contributions = generateContributions(activityEvents)
        
        // Log for debugging - verify real data is being used
        console.log('📊 GitHub Contributions Summary:', {
          totalEventsFromAPI: eventsData.length,
          totalCommitsFromRepos: commitEvents.length,
          processedActivityEvents: activityEvents.length,
          uniqueContributionDays: contributions.length,
          totalContributions: contributions.reduce((sum, c) => sum + c.count, 0),
          dateRange: contributions.length > 0 ? {
            earliest: contributions[0]?.date,
            latest: contributions[contributions.length - 1]?.date
          } : 'No contributions found',
          reposFetched: topRepos?.length || 0,
          note: 'All data is fetched from GitHub API - no dummy data'
        })

        const stats: GitHubStats = {
          totalRepos: reposData.length,
          totalStars,
          totalForks,
          totalCommits: activityBreakdown.commits,
          languages,
          recentActivity: activityEvents.slice(0, 50), // Last 50 events
          privateRepos,
          publicRepos,
          contributions,
          contributedRepos: Array.from(contributedReposSet),
          activityBreakdown
        }

        setRepos(repos)
        setStats(stats)
        setHasPrivateAccess(privateRepos > 0 || hasBackendAccess)
      } catch (err) {
        console.error('GitHub API Error:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch GitHub data')
      } finally {
        setLoading(false)
      }
    }

    fetchGitHubData()
  }, [username])

  // Dynamically track theme color changes
  useEffect(() => {
    const updateBg = () => {
      const bgColor = getComputedStyle(document.documentElement)
        .getPropertyValue("--bg-primary")
        .trim()
        .replace("#", "")
      setChartBg(bgColor || "ffffff")
    }

    updateBg()
    const observer = new MutationObserver(updateBg)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["style"] })
    return () => observer.disconnect()
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatFileSize = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 B'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  // Filter contributions by selected year (must be called before early returns)
  const filteredContributions = useMemo(() => {
    if (!stats) return []
    return stats.contributions.filter(cont => {
      const year = new Date(cont.date).getFullYear()
      return year === selectedYear
    })
  }, [stats, selectedYear])

  // Filter activity events by selected year
  const filteredActivityEvents = useMemo(() => {
    if (!stats) return []
    return stats.recentActivity.filter(event => {
      const year = new Date(event.date).getFullYear()
      return year === selectedYear
    })
  }, [stats, selectedYear])

  // Recalculate percentages based on filtered data
  const percentages = useMemo(() => {
    if (!filteredActivityEvents.length) return { commits: 0, pullRequests: 0, reviews: 0, issues: 0 }
    
    const breakdown = {
      commits: filteredActivityEvents.filter(e => e.type === 'commit').length,
      pullRequests: filteredActivityEvents.filter(e => e.type === 'pull_request').length,
      reviews: filteredActivityEvents.filter(e => e.type === 'pull_request_review').length,
      issues: filteredActivityEvents.filter(e => e.type === 'issue').length
    }
    
    const total = breakdown.commits + breakdown.pullRequests + breakdown.reviews + breakdown.issues
    if (total === 0) return { commits: 0, pullRequests: 0, reviews: 0, issues: 0 }
    
    return {
      commits: Math.round((breakdown.commits / total) * 100),
      pullRequests: Math.round((breakdown.pullRequests / total) * 100),
      reviews: Math.round((breakdown.reviews / total) * 100),
      issues: Math.round((breakdown.issues / total) * 100)
    }
  }, [filteredActivityEvents])

  // Group filtered activity by month
  const groupedActivity = useMemo(() => {
    const grouped: Record<string, {
      commits: ActivityEvent[]
      pullRequests: ActivityEvent[]
      reviews: ActivityEvent[]
      issues: ActivityEvent[]
    }> = {}
    
    filteredActivityEvents.forEach(event => {
      const date = new Date(event.date)
      const monthKey = `${date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
      
      if (!grouped[monthKey]) {
        grouped[monthKey] = {
          commits: [],
          pullRequests: [],
          reviews: [],
          issues: []
        }
      }
      
      grouped[monthKey][`${event.type === 'commit' ? 'commits' : event.type === 'pull_request' ? 'pullRequests' : event.type === 'pull_request_review' ? 'reviews' : 'issues'}` as keyof typeof grouped[string]].push(event)
    })
    
    return grouped
  }, [filteredActivityEvents])

  const activityMonths = Object.keys(groupedActivity).sort((a, b) => {
    return new Date(b).getTime() - new Date(a).getTime()
  })

  // Early returns must come AFTER all hooks
  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--vscode-editor-bg)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[var(--vscode-blue)] mx-auto mb-4"></div>
          <p className="text-[var(--vscode-text)]">Loading GitHub activity...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--vscode-editor-bg)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Github className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-[var(--vscode-text)] mb-2">Error Loading GitHub Data</h2>
          <p className="text-[var(--vscode-text-muted)] mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[var(--vscode-blue)] text-white rounded-lg hover:bg-[var(--vscode-blue)]/80 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--vscode-editor-bg)] text-[var(--vscode-editor-foreground)]">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-[var(--vscode-blue)]/10 to-[var(--vscode-green)]/10 border-b border-[var(--vscode-border)]">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-6 md:py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-[var(--vscode-blue)] to-[var(--vscode-green)] rounded-xl flex items-center justify-center">
                <Github className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-[var(--vscode-text)]">@{username}</h1>
                <p className="text-sm md:text-base text-[var(--vscode-text-muted)]">GitHub Activity Dashboard</p>
              </div>
            </div>
            <div className="text-left md:text-right">
              <div className="text-xl md:text-2xl font-bold text-[var(--vscode-text)]">
                {filteredContributions.reduce((sum, c) => sum + c.count, 0) || 0} contributions
              </div>
              <div className="text-xs md:text-sm text-[var(--vscode-text-muted)]">in {selectedYear}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Year Selector */}
          <div className="lg:col-span-1">
            <div className="bg-[var(--vscode-sidebar)] border border-[var(--vscode-border)] rounded-xl p-4 sticky top-4">
              <h3 className="text-sm font-semibold text-[var(--vscode-text-muted)] mb-3">Year</h3>
              <div className="space-y-1">
                {Array.from({ length: 12 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                  <button
                    key={year}
                    onClick={() => setSelectedYear(year)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      selectedYear === year
                        ? 'bg-[var(--vscode-blue)] text-white'
                        : 'text-[var(--vscode-text-muted)] hover:text-[var(--vscode-text)] hover:bg-[var(--vscode-border)]'
                    }`}
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Contributions Heatmap */}
            {stats && <ContributionsHeatmap contributions={filteredContributions} />}

            {/* Activity Overview */}
            {stats && (
              <div className="bg-[var(--vscode-sidebar)] border border-[var(--vscode-border)] rounded-xl p-6">
                <h2 className="text-xl font-bold text-[var(--vscode-text)] mb-4">Contributed to ({selectedYear})</h2>
                <div className="space-y-2 mb-6">
                  {Array.from(new Set(filteredActivityEvents.map(e => e.repoFullName))).slice(0, 3).map((repoFullName, index) => {
                    const repo = repos.find(r => r.full_name === repoFullName)
                    const isPrivate = repo?.visibility === 'private'
                    const displayName = isPrivate ? 'Private Repo' : repoFullName.split('/')[1]
                    return (
                      <div key={index} className="flex items-center gap-2 text-sm text-[var(--vscode-text)]">
                        <Code className="w-4 h-4" />
                        <span className="font-mono">{repoFullName.split('/')[0]}/{displayName}</span>
                      </div>
                    )
                  })}
                  {Array.from(new Set(filteredActivityEvents.map(e => e.repoFullName))).length > 3 && (
                    <p className="text-sm text-[var(--vscode-text-muted)]">
                      and {Array.from(new Set(filteredActivityEvents.map(e => e.repoFullName))).length - 3} other repositories
                    </p>
                  )}
                </div>

                {/* Code Review Quadrant Chart */}
                <div className="border-t border-[var(--vscode-border)] pt-6">
                  <h3 className="text-lg font-semibold text-[var(--vscode-text)] mb-4">Activity Breakdown</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-[var(--vscode-text)]">{percentages.commits}%</div>
                      <div className="text-sm text-[var(--vscode-text-muted)]">Commits</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-[var(--vscode-text)]">{percentages.pullRequests}%</div>
                      <div className="text-sm text-[var(--vscode-text-muted)]">Pull Requests</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-[var(--vscode-text)]">{percentages.reviews}%</div>
                      <div className="text-sm text-[var(--vscode-text-muted)]">Code Reviews</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-[var(--vscode-text)]">{percentages.issues}%</div>
                      <div className="text-sm text-[var(--vscode-text-muted)]">Issues</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Contribution Activity Timeline */}
            {stats && activityMonths.length > 0 && (
              <div className="bg-[var(--vscode-sidebar)] border border-[var(--vscode-border)] rounded-xl p-6">
                <h2 className="text-xl font-bold text-[var(--vscode-text)] mb-4">Contribution activity</h2>
                {activityMonths.slice(0, 3).map((month) => {
                  const monthData = groupedActivity[month]
                  const commits = monthData.commits
                  const pullRequests = monthData.pullRequests
                  const reviews = monthData.reviews
                  
                  // Group commits by repo
                  const commitsByRepo = commits.reduce((acc, event) => {
                    if (!acc[event.repoFullName]) {
                      acc[event.repoFullName] = []
                    }
                    acc[event.repoFullName].push(event)
                    return acc
                  }, {} as Record<string, ActivityEvent[]>)

                  return (
                    <div key={month} className="mb-6 last:mb-0">
                      <h3 className="text-lg font-semibold text-[var(--vscode-text)] mb-4">{month}</h3>
                      
                      {/* Commits */}
                      {commits.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm text-[var(--vscode-text-muted)] mb-2">
                            Created {commits.reduce((sum, e) => sum + (e.count || 1), 0)} commits in {Object.keys(commitsByRepo).length} repositories
                          </p>
                          <div className="space-y-2">
                            {Object.entries(commitsByRepo).slice(0, 5).map(([repoFullName, repoCommits]) => {
                              const repo = repos.find(r => r.full_name === repoFullName)
                              const isPrivate = repo?.visibility === 'private'
                              const displayName = isPrivate ? 'Private Repo' : repoFullName.split('/')[1]
                              const commitCount = repoCommits.reduce((sum, e) => sum + (e.count || 1), 0)
                              const maxCommits = Math.max(...Object.values(commitsByRepo).map(rc => rc.reduce((sum, e) => sum + (e.count || 1), 0)))
                              return (
                                <div key={repoFullName} className="flex items-center gap-3">
                                  <span className="text-sm font-mono text-[var(--vscode-text)] min-w-[200px]">
                                    {repoFullName.split('/')[0]}/{displayName}
                                  </span>
                                  <div className="flex-1 bg-[var(--vscode-border)] rounded-full h-2">
                                    <div
                                      className="bg-green-500 h-2 rounded-full"
                                      style={{ width: `${(commitCount / maxCommits) * 100}%` }}
                                    />
                                  </div>
                                  <span className="text-sm text-[var(--vscode-text-muted)] min-w-[60px] text-right">
                                    {commitCount} commits
                                  </span>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      {/* Pull Requests */}
                      {pullRequests.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm text-[var(--vscode-text-muted)] mb-2">
                            Opened {pullRequests.length} pull request{pullRequests.length !== 1 ? 's' : ''} in {new Set(pullRequests.map(pr => pr.repoFullName)).size} repositories
                          </p>
                          <div className="space-y-2">
                            {Object.entries(
                              pullRequests.reduce((acc, pr) => {
                                if (!acc[pr.repoFullName]) {
                                  acc[pr.repoFullName] = { open: 0, merged: 0, closed: 0 }
                                }
                                if (pr.status === 'merged') acc[pr.repoFullName].merged++
                                else if (pr.status === 'open') acc[pr.repoFullName].open++
                                else acc[pr.repoFullName].closed++
                                return acc
                              }, {} as Record<string, { open: number; merged: number; closed: number }>)
                            ).slice(0, 5).map(([repoFullName, counts]) => {
                              const repo = repos.find(r => r.full_name === repoFullName)
                              const isPrivate = repo?.visibility === 'private'
                              const displayName = isPrivate ? 'Private Repo' : repoFullName.split('/')[1]
                              return (
                                <div key={repoFullName} className="flex items-center gap-3">
                                  <span className="text-sm font-mono text-[var(--vscode-text)] min-w-[200px]">
                                    {repoFullName.split('/')[0]}/{displayName}
                                  </span>
                                  <div className="flex gap-2">
                                    {counts.merged > 0 && (
                                      <span className="px-2 py-1 text-xs bg-purple-500/20 text-purple-400 rounded">
                                        {counts.merged} merged
                                      </span>
                                    )}
                                    {counts.open > 0 && (
                                      <span className="px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded">
                                        {counts.open} open
                                      </span>
                                    )}
                                    {counts.closed > 0 && (
                                      <span className="px-2 py-1 text-xs bg-gray-500/20 text-gray-400 rounded">
                                        {counts.closed} closed
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      {/* Reviews */}
                      {reviews.length > 0 && (
                        <div>
                          <p className="text-sm text-[var(--vscode-text-muted)] mb-2">
                            Reviewed {reviews.length} pull request{reviews.length !== 1 ? 's' : ''} in {new Set(reviews.map(r => r.repoFullName)).size} repository
                          </p>
                          <div className="space-y-2">
                            {Object.entries(
                              reviews.reduce((acc, review) => {
                                if (!acc[review.repoFullName]) {
                                  acc[review.repoFullName] = []
                                }
                                acc[review.repoFullName].push(review)
                                return acc
                              }, {} as Record<string, ActivityEvent[]>)
                            ).slice(0, 3).map(([repoFullName, repoReviews]) => {
                              const repo = repos.find(r => r.full_name === repoFullName)
                              const isPrivate = repo?.visibility === 'private'
                              const displayName = isPrivate ? 'Private Repo' : repoFullName.split('/')[1]
                              return (
                                <div key={repoFullName} className="flex items-center gap-3">
                                  <span className="text-sm font-mono text-[var(--vscode-text)] min-w-[200px]">
                                    {repoFullName.split('/')[0]}/{displayName}
                                  </span>
                                  <span className="text-sm text-[var(--vscode-text-muted)]">
                                    {repoReviews.length} pull request{repoReviews.length !== 1 ? 's' : ''}
                                  </span>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {/* Tab Navigation */}
            <div className="flex flex-col sm:flex-row gap-1 sm:space-x-1 bg-[var(--vscode-sidebar)] rounded-lg p-1 border border-[var(--vscode-border)]">
              <button
                onClick={() => setActiveTab('activity')}
                className={`w-full sm:flex-1 py-2 px-3 md:px-4 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'activity'
                    ? 'bg-[var(--vscode-blue)] text-white shadow-sm'
                    : 'text-[var(--vscode-text-muted)] hover:text-[var(--vscode-text)]'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>Activity</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('repos')}
                className={`w-full sm:flex-1 py-2 px-3 md:px-4 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'repos'
                    ? 'bg-[var(--vscode-blue)] text-white shadow-sm'
                    : 'text-[var(--vscode-text-muted)] hover:text-[var(--vscode-text)]'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Code className="w-4 h-4" />
                  <span>Repositories</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('languages')}
                className={`w-full sm:flex-1 py-2 px-3 md:px-4 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'languages'
                    ? 'bg-[var(--vscode-blue)] text-white shadow-sm'
                    : 'text-[var(--vscode-text-muted)] hover:text-[var(--vscode-text)]'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Activity className="w-4 h-4" />
                  <span>Languages</span>
                </div>
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'repos' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl md:text-2xl font-bold text-[var(--vscode-text)]">Top Repositories</h2>
                  <div className="hidden sm:flex items-center space-x-4 text-sm text-[var(--vscode-text-muted)]">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                      <span>Private</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span>Public</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {repos.map((repo, index) => (
                    <div
                      key={`${repo.name}-${index}-${repo.html_url}`}
                      className="group bg-[var(--vscode-sidebar)] border border-[var(--vscode-border)] rounded-xl p-3 sm:p-4 md:p-6 hover:border-[var(--vscode-blue)] hover:shadow-lg transition-all duration-300"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3 sm:mb-4">
                        <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                          <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            repo.visibility === 'private' 
                              ? 'bg-gradient-to-br from-amber-500 to-orange-500' 
                              : 'bg-gradient-to-br from-[var(--vscode-blue)] to-[var(--vscode-green)]'
                          }`}>
                            {repo.visibility === 'private' ? (
                              <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                            ) : (
                              <Code className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
                              <h3 className="font-semibold text-sm sm:text-base text-[var(--vscode-text)] group-hover:text-[var(--vscode-blue)] transition-colors truncate">
                                {repo.name}
                              </h3>
                              {repo.visibility === 'private' && (
                                <span className="px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs bg-amber-500/20 text-amber-600 rounded-full flex items-center space-x-1 flex-shrink-0">
                                  <Eye className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                  <span className="hidden sm:inline">Private</span>
                                  <span className="sm:hidden">🔒</span>
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] sm:text-xs text-[var(--vscode-text-muted)]">
                              Updated {formatDate(repo.updated_at)}
                            </p>
                          </div>
                        </div>
                        <a
                          href={repo.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-1 text-xs px-3 sm:px-2 py-2 sm:py-1 rounded-md border border-[var(--vscode-border)] text-[var(--vscode-text-muted)] hover:text-[var(--vscode-text)] hover:border-[var(--vscode-blue)] transition-colors flex-shrink-0 min-h-[44px] sm:min-h-0"
                          title="Open on GitHub"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          GitHub
                        </a>
                      </div>

                      <p className="text-xs sm:text-sm text-[var(--vscode-text-muted)] mb-3 sm:mb-4 line-clamp-2">
                        {repo.description || "No description available"}
                      </p>

                      {/* Project link indicator if this repo exists in projects */}
                      {repo.full_name && projectRepoNameToSlug.has(repo.full_name.split('/')[1]?.toLowerCase()) && (
                        <div className="mb-3 sm:mb-4">
                          <a
                            href={`/projects/${projectRepoNameToSlug.get(repo.full_name.split('/')[1].toLowerCase())}/`}
                            className="inline-flex items-center justify-center gap-2 px-3 py-2 sm:py-1.5 rounded-lg bg-[var(--vscode-blue)] text-white hover:bg-[var(--vscode-blue)]/90 text-xs transition-colors min-h-[44px] sm:min-h-0 w-full sm:w-auto"
                            title="View project details"
                          >
                            <Code className="w-3.5 h-3.5" />
                            View Project
                          </a>
                        </div>
                      )}

                      {repo.topics.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 sm:gap-1 mb-3 sm:mb-4">
                          {repo.topics.slice(0, 3).map((topic, topicIndex) => (
                            <span
                              key={`${repo.name}-topic-${topicIndex}-${topic}`}
                              className="px-2 py-1 text-[10px] sm:text-xs bg-[var(--vscode-blue)]/10 text-[var(--vscode-blue)] rounded-md"
                            >
                              {topic}
                            </span>
                          ))}
                          {repo.topics.length > 3 && (
                            <span className="px-2 py-1 text-[10px] sm:text-xs text-[var(--vscode-text-muted)]">
                              +{repo.topics.length - 3} more
                            </span>
                          )}
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm pt-3 sm:pt-0 border-t sm:border-t-0 border-[var(--vscode-border)]">
                        <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                          {repo.language && (
                            <div className="flex items-center space-x-1.5">
                              <div
                                className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0"
                                style={{ backgroundColor: languageColors[repo.language] || "#888" }}
                              />
                              <span className="text-[var(--vscode-text-muted)] whitespace-nowrap">{repo.language}</span>
                            </div>
                          )}
                          <span className="text-[var(--vscode-text-muted)] whitespace-nowrap">
                            {formatFileSize(repo.size * 1024)}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 sm:gap-4 ml-auto">
                          <div className="flex items-center space-x-1">
                            <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-500 flex-shrink-0" />
                            <span className="text-[var(--vscode-text-muted)] whitespace-nowrap">{repo.stargazers_count}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <GitBranch className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500 flex-shrink-0" />
                            <span className="text-[var(--vscode-text-muted)] whitespace-nowrap">{repo.forks_count}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <GitCommit className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                            <span className="text-[var(--vscode-text-muted)] whitespace-nowrap">{repo.commits_count}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'languages' && stats && (
              <div className="space-y-6">
                <h2 className="text-xl md:text-2xl font-bold text-[var(--vscode-text)] mb-4 md:mb-6">Language Distribution</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-[var(--vscode-sidebar)] border border-[var(--vscode-border)] rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-[var(--vscode-text)] mb-4">By Repository Count</h3>
                    <div className="space-y-3">
                      {Object.entries(stats.languages)
                        .sort(([,a], [,b]) => b - a)
                        .slice(0, 10)
                        .map(([language, count], index) => (
                          <div key={`${language}-${index}-${count}`} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: languageColors[language] || "#888" }}
                              />
                              <span className="text-[var(--vscode-text)]">{language}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-24 bg-[var(--vscode-border)] rounded-full h-2">
                                <div
                                  className="h-2 rounded-full"
                                  style={{
                                    width: `${(count / Math.max(...Object.values(stats.languages))) * 100}%`,
                                    backgroundColor: languageColors[language] || "#888"
                                  }}
                                />
                              </div>
                              <span className="text-sm text-[var(--vscode-text-muted)] w-8 text-right">{count}</span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                  <div className="bg-[var(--vscode-sidebar)] border border-[var(--vscode-border)] rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-[var(--vscode-text)] mb-4">Language Overview</h3>
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-[var(--vscode-text)]">
                          {Object.keys(stats.languages).length}
                        </div>
                        <div className="text-sm text-[var(--vscode-text-muted)]">Different Languages</div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-xl font-semibold text-[var(--vscode-text)]">
                            {Object.entries(stats.languages).reduce((sum, [,count]) => sum + count, 0)}
                          </div>
                          <div className="text-xs text-[var(--vscode-text-muted)]">Total Repos</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-semibold text-[var(--vscode-text)]">
                            {Object.entries(stats.languages).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'}
                          </div>
                          <div className="text-xs text-[var(--vscode-text-muted)]">Most Used</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default GitHubActivity
