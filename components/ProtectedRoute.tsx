"use client"

import { useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"

interface ProtectedRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export default function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { isAuthenticated, username } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      // Redirect to signin page if not authenticated
      router.push('/signin')
    }
  }, [isAuthenticated, router])

  // Show loading state while checking authentication
  if (!isAuthenticated) {
    return fallback || (
      <div className="min-h-screen bg-[#1e1e1e] text-[#d4d4d4] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#007acc] mx-auto mb-4"></div>
          <p>Checking authentication...</p>
          <p className="text-sm text-gray-400 mt-2">Redirecting to sign in...</p>
        </div>
      </div>
    )
  }

  // Show authenticated content
  return <>{children}</>
}
