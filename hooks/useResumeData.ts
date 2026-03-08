import { useState, useEffect } from 'react'
import { config } from '@/lib/config'
import localResumeData from '@/data/resume.json'

interface ResumeData {
  personalInfo: {
    name: string
    email: string
    phone: string
    location: string
    linkedin: string
    github: string
    website: string
    summary: string
  }
  experience: Array<{
    id: number
    company: string
    title: string
    startDate: string
    endDate: string
    description: string
    technologies: string[]
    achievements?: string[]
    projects?: string[] // Array of project slugs built during this experience
  }>
  education: Array<{
    degree: string
    institution: string
    year: string
    gpa: string
  }>
  certifications: Array<{
    name: string
    issuer: string
    icon: string
    status: string
    description: string
    color: string
    skills: string[]
    verify: string
    pathway: any[]
  }>
  skills: {
    languages: string[]
    frameworks: string[]
    databases: string[]
    technologies: string[]
    versionControl: string[]
    methodologies: string[]
    standards: string[]
  }
  projects: Array<{
    id?: number
    name: string
    slug?: string
    description: string
    technologies: string[]
    icon: string
    color: string
    status: string
    year: string
    detailsFile?: string
    featured?: boolean
    githubUrl?: string
    liveUrl?: string
    imageUrl?: string
  }>
  additionalInfo: string
}

export const useResumeData = () => {
  const [resumeData, setResumeData] = useState<ResumeData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    const fetchResumeData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Try to fetch from API if available, otherwise use local data
        if (config.API_BASE_URL && typeof window !== 'undefined') {
          try {
            const controller = new AbortController()
            const timeoutId = setTimeout(() => {
              controller.abort()
            }, 5000) // Shorter timeout for static sites
            
            const response = await fetch(`${config.API_BASE_URL}${config.ENDPOINTS.RESUME}`, {
              signal: controller.signal
            })
            
            clearTimeout(timeoutId)
            
            if (response.ok) {
              const result = await response.json()
              if (result.success) {
                // Transform backend data to match frontend structure
                const transformedData = {
                  ...result.data,
                  personalInfo: {
                    ...result.data.personalInfo,
                    summary: result.data.summary || result.data.personalInfo?.summary || ''
                  },
                  projects: result.data.projects || []
                }
                setResumeData(transformedData)
                setLoading(false)
                return
              }
            }
          } catch (apiError) {
            // API fetch failed, fall through to use local data
            console.log('API fetch failed, using local resume data:', apiError)
          }
        }
        
        // Use local resume data (for static sites or as fallback)
        if (localResumeData) {
          setResumeData(localResumeData as ResumeData)
        } else {
          throw new Error('No resume data available')
        }
      } catch (err) {
        console.error('Error loading resume data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load resume data')
        
        // Final fallback to empty data structure
        setResumeData({
          personalInfo: {
            name: "",
            email: "",
            phone: "",
            location: "",
            linkedin: "",
            github: "",
            website: "",
            summary: ""
          },
          experience: [],
          education: [],
          certifications: [],
          skills: {
            languages: [],
            frameworks: [],
            databases: [],
            technologies: [],
            versionControl: [],
            methodologies: [],
            standards: []
          },
          projects: [],
          additionalInfo: ""
        })
      } finally {
        setLoading(false)
      }
    }

    fetchResumeData()
  }, [retryCount])

  const retry = () => {
    setRetryCount(prev => prev + 1)
  }

  return { resumeData, loading, error, retry }
}
