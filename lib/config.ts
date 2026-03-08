// Configuration for external API and authentication
export const config = {
  // External API Base URL
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  
  // API Endpoints
  ENDPOINTS: {
    RESUME: "/api/admin?type=resume",
    PUBLIC_RESUME: "/api/admin?type=resume", // Use same endpoint as admin
    EXPERIENCE: "/api/admin?type=experience", 
    EDUCATION: "/api/admin?type=education",
    CERTIFICATIONS: "/api/admin?type=certifications",
    PORTFOLIO: "/api/admin?type=portfolio", // Portfolio content for private repos
    AUTH: "/api/admin-auth",
    GENERATE_PDF: "/api/generate-pdf",
    AI_CHAT: "/api/ai-chat",
    GITHUB_ACTIVITY: "/api/admin?type=github-activity",
    // Version control endpoints
    RESUME_HISTORY: "/api/admin?type=resume&action=history",
    RESUME_RESTORE: "/api/admin?type=resume&action=restore",
    RESUME_PREVIEW: "/api/admin?type=resume&action=preview"
  }
}
