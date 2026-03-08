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
  GitCommit
} from "lucide-react"
import { useResumeData } from "@/hooks/useResumeData"
import { config } from "@/lib/config"

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
}

interface GitHubStats {
  totalRepos: number
  totalStars: number
  totalForks: number
  totalCommits: number
  languages: Record<string, number>
  recentActivity: any[]
  privateRepos: number
  publicRepos: number
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

const GitHubActivity: React.FC<{ username: string }> = ({ username }) => {
  const [repos, setRepos] = useState<Repo[]>([])
  const [stats, setStats] = useState<GitHubStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [chartBg, setChartBg] = useState("ffffff")
  const [activeTab, setActiveTab] = useState<'repos' | 'activity' | 'languages'>('repos')
  const [hasPrivateAccess, setHasPrivateAccess] = useState(false)
  const { resumeData } = useResumeData()

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

        // Use unified backend endpoint
        const response = await fetch(`${config.API_BASE_URL}${config.ENDPOINTS.GITHUB_ACTIVITY}&username=${username}`)
        
        if (!response.ok) {
          throw new Error(`Failed to fetch GitHub data: ${response.status}`)
        }

        const result = await response.json()
        
        if (!result.success) {
          throw new Error(result.message || 'Failed to fetch GitHub data')
        }

        const { repos, stats, user } = result.data

        setRepos(repos)
        setStats(stats)
        setHasPrivateAccess(stats.privateRepos > 0)
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
              <div className="text-xl md:text-2xl font-bold text-[var(--vscode-text)]">{stats?.totalRepos || 0}</div>
              <div className="text-xs md:text-sm text-[var(--vscode-text-muted)]">Repositories</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-6 md:py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
            <div className="bg-[var(--vscode-sidebar)] rounded-lg p-3 md:p-4 border border-[var(--vscode-border)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-[var(--vscode-text-muted)]">Total Stars</p>
                  <p className="text-xl md:text-2xl font-bold text-[var(--vscode-text)]">{stats.totalStars}</p>
                </div>
                <Star className="w-6 h-6 md:w-8 md:h-8 text-yellow-500" />
              </div>
            </div>
            <div className="bg-[var(--vscode-sidebar)] rounded-lg p-3 md:p-4 border border-[var(--vscode-border)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-[var(--vscode-text-muted)]">Total Forks</p>
                  <p className="text-xl md:text-2xl font-bold text-[var(--vscode-text)]">{stats.totalForks}</p>
                </div>
                <GitBranch className="w-6 h-6 md:w-8 md:h-8 text-blue-500" />
              </div>
            </div>
            <div className="bg-[var(--vscode-sidebar)] rounded-lg p-3 md:p-4 border border-[var(--vscode-border)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-[var(--vscode-text-muted)]">Total Commits</p>
                  <p className="text-xl md:text-2xl font-bold text-[var(--vscode-text)]">{stats.totalCommits.toLocaleString()}</p>
                </div>
                <GitCommit className="w-6 h-6 md:w-8 md:h-8 text-green-500" />
              </div>
            </div>
            <div className="bg-[var(--vscode-sidebar)] rounded-lg p-3 md:p-4 border border-[var(--vscode-border)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-[var(--vscode-text-muted)]">Languages</p>
                  <p className="text-xl md:text-2xl font-bold text-[var(--vscode-text)]">{Object.keys(stats.languages).length}</p>
                </div>
                <Code className="w-6 h-6 md:w-8 md:h-8 text-purple-500" />
              </div>
            </div>
          </div>

          {/* Private Repository Notice */}
          {hasPrivateAccess && (
            <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl p-6 mb-8">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Eye className="w-6 h-6 text-amber-500" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-[var(--vscode-text)] mb-2 flex items-center space-x-2">
                    <span>🔒 Private Repository Access</span>
                    <span className="px-2 py-1 text-xs bg-amber-500/20 text-amber-600 rounded-full">
                      Authenticated
                    </span>
                  </h3>
                  <p className="text-[var(--vscode-text-muted)] leading-relaxed">
                    Successfully accessing private repositories through authenticated backend. 
                    All projects are hosted on private repositories due to confidentiality reasons. 
                    They are available for review upon request. Security expertise demonstrated through 
                    multiple certifications, including Google Cybersecurity Certificate.
                  </p>
                  <div className="mt-4 flex items-center space-x-6 text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                      <span className="text-[var(--vscode-text-muted)]">
                        {stats.privateRepos} Private Repositories
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-[var(--vscode-text-muted)]">
                        {stats.publicRepos} Public Repositories
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6">
        <div className="flex flex-col sm:flex-row gap-1 sm:space-x-1 bg-[var(--vscode-sidebar)] rounded-lg p-1 border border-[var(--vscode-border)]">
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
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-6 md:py-8">
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
                  {projectRepoNameToSlug.has(repo.name.toLowerCase()) && (
                    <div className="mb-3 sm:mb-4">
                      <a
                        href={`/projects/${projectRepoNameToSlug.get(repo.name.toLowerCase())}/`}
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

        {activeTab === 'activity' && (
          <div className="space-y-6">
            <h2 className="text-xl md:text-2xl font-bold text-[var(--vscode-text)] mb-4 md:mb-6">GitHub Activity</h2>
            <div className="bg-[var(--vscode-sidebar)] border border-[var(--vscode-border)] rounded-xl p-4 md:p-6">
        <div className="flex justify-center">
          <img
            src={`https://ghchart.rshah.org/${username}?bg_color=${chartBg}`}
            alt={`${username} GitHub contributions`}
                  className="w-full max-w-full sm:max-w-3xl md:max-w-4xl rounded-lg shadow-lg"
          />
        </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default GitHubActivity
