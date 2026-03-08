"use client"

import { useState, useEffect } from "react"
import ProtectedRoute from "@/components/ProtectedRoute"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LogOut, Terminal, AlertCircle, Info } from "lucide-react"
import { useAuth } from "@/context/AuthContext"

export default function AdminPageGitHub() {
  const { username, logout } = useAuth()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1e1e1e] text-[#d4d4d4] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#007acc] mx-auto mb-4"></div>
          <p>Loading admin panel...</p>
        </div>
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-[#0d1117] via-[#1e1e1e] to-[#0d1117] text-[#d4d4d4]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0d1117] via-[#1e1e1e] to-[#0d1117] border-b border-[#30363d] shadow-2xl">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f57] shadow-sm"></div>
                  <div className="w-3 h-3 rounded-full bg-[#ffbd2e] shadow-sm"></div>
                  <div className="w-3 h-3 rounded-full bg-[#28ca42] shadow-sm"></div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#007acc] to-[#4ec9b0] rounded-xl flex items-center justify-center shadow-lg">
                    <Terminal className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-[#007acc] to-[#4ec9b0] bg-clip-text text-transparent">
                      Admin Dashboard
                    </h1>
                    <p className="text-sm text-gray-400">Resume Management System v2.0</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#1e1e1e] to-[#2d2d30] rounded-xl border border-[#30363d] shadow-lg">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-300 font-medium">Welcome, {username}</span>
                </div>
                <Button
                  onClick={logout}
                  variant="outline"
                  className="border-[#f85149] text-[#f85149] hover:bg-[#f85149] hover:text-white transition-all duration-200 hover:scale-105 px-6"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <Card className="bg-gradient-to-br from-[#161b22] to-[#0d1117] border-[#30363d] shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-[#0d1117] to-[#161b22] border-b border-[#30363d]">
              <CardTitle className="text-[#d4d4d4] flex items-center gap-3 text-xl">
                <div className="w-8 h-8 bg-gradient-to-br from-[#ff6b6b] to-[#ff8e8e] rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-4 h-4 text-white" />
                </div>
                GitHub Pages Deployment Notice
              </CardTitle>
              <CardDescription className="text-[#8b949e] text-base">
                Admin panel functionality is not available on GitHub Pages
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-6">
                <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-[#d4d4d4] mb-4 flex items-center gap-2">
                    <Info className="w-5 h-5 text-[#4ec9b0]" />
                    Why is the admin panel not available?
                  </h3>
                  <ul className="space-y-3 text-[#8b949e]">
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-[#ff6b6b] rounded-full mt-2 flex-shrink-0"></span>
                      <span>GitHub Pages only supports static websites (HTML, CSS, JavaScript)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-[#ff6b6b] rounded-full mt-2 flex-shrink-0"></span>
                      <span>No server-side processing or API routes are supported</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-[#ff6b6b] rounded-full mt-2 flex-shrink-0"></span>
                      <span>Cannot read/write to files dynamically</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-[#0d1117] border border-[#4ec9b0] rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-[#d4d4d4] mb-4 flex items-center gap-2">
                    <Info className="w-5 h-5 text-[#4ec9b0]" />
                    Solutions for full admin functionality:
                  </h3>
                  <ul className="space-y-3 text-[#8b949e]">
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-[#4ec9b0] rounded-full mt-2 flex-shrink-0"></span>
                      <span><strong>Vercel:</strong> Free hosting with full Next.js support including API routes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-[#4ec9b0] rounded-full mt-2 flex-shrink-0"></span>
                      <span><strong>Netlify:</strong> Free hosting with serverless functions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-[#4ec9b0] rounded-full mt-2 flex-shrink-0"></span>
                      <span><strong>Railway/Render:</strong> Full-stack hosting platforms</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-[#4ec9b0] rounded-full mt-2 flex-shrink-0"></span>
                      <span><strong>GitHub Pages + External API:</strong> Use a separate backend service</span>
                    </li>
                  </ul>
                </div>

                <div className="flex gap-4">
                  <Button
                    onClick={() => window.open("/", "_blank")}
                    className="bg-gradient-to-r from-[#007acc] to-[#4ec9b0] hover:from-[#4ec9b0] hover:to-[#007acc] text-white px-6"
                  >
                    View Resume
                  </Button>
                  <Button
                    onClick={() => window.open("https://vercel.com", "_blank")}
                    variant="outline"
                    className="border-[#4ec9b0] text-[#4ec9b0] hover:bg-[#4ec9b0] hover:text-[#0d1117] px-6"
                  >
                    Deploy to Vercel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}
