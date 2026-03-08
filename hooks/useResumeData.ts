import { useState, useEffect } from 'react'
import { config } from '@/lib/config'

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

  useEffect(() => {
    const fetchResumeData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch(`${config.API_BASE_URL}${config.ENDPOINTS.RESUME}`)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
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
               } else {
                 throw new Error(result.message || 'Failed to fetch resume data')
               }
      } catch (err) {
        console.error('Error fetching resume data:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
        
        // Fallback to empty data structure
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
  }, [])

  return { resumeData, loading, error }
}
