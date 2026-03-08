"use client"

import React, { createContext, useContext, useState, ReactNode } from "react"
import { config } from "@/lib/config"

interface AuthContextProps {
  isAuthenticated: boolean
  username: string | null
  token: string | null
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  showAuthTerminal: boolean
  openAuthTerminal: () => void
  closeAuthTerminal: () => void
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [username, setUsername] = useState<string | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [showAuthTerminal, setShowAuthTerminal] = useState(false)

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${config.API_BASE_URL}${config.ENDPOINTS.AUTH}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setIsAuthenticated(true)
          setUsername(username)
          setToken(result.token)
          setShowAuthTerminal(false)
          
          // Store token in localStorage for persistence
          localStorage.setItem('admin_token', result.token)
          localStorage.setItem('admin_username', username)
          
          return true
        }
      }
      return false
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  const logout = () => {
    setIsAuthenticated(false)
    setUsername(null)
    setToken(null)
    
    // Clear localStorage
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_username')
  }

  const openAuthTerminal = () => {
    setShowAuthTerminal(true)
  }

  const closeAuthTerminal = () => {
    setShowAuthTerminal(false)
  }

  // Check for existing token on mount
  React.useEffect(() => {
    const storedToken = localStorage.getItem('admin_token')
    const storedUsername = localStorage.getItem('admin_username')
    
    if (storedToken && storedUsername) {
      // Verify token with backend
      fetch(`${config.API_BASE_URL}${config.ENDPOINTS.AUTH}`, {
        headers: {
          'Authorization': `Bearer ${storedToken}`
        }
      })
      .then(response => response.json())
      .then(result => {
        if (result.success) {
          setIsAuthenticated(true)
          setUsername(storedUsername)
          setToken(storedToken)
        } else {
          // Token is invalid, clear storage
          localStorage.removeItem('admin_token')
          localStorage.removeItem('admin_username')
        }
      })
      .catch(() => {
        // Network error, clear storage
        localStorage.removeItem('admin_token')
        localStorage.removeItem('admin_username')
      })
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        username,
        token,
        login,
        logout,
        showAuthTerminal,
        openAuthTerminal,
        closeAuthTerminal,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
