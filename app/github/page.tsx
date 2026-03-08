"use client"

import React from "react"
import GitHubActivity from "@/components/GitHubActivity"

export default function GitHubPage() {
  const username = "MYouaness-Rad" // replace with the GitHub username you want to show

  return (
    <div className="min-h-screen bg-[var(--vscode-editor-bg)] text-[var(--vscode-editor-foreground)]">
    

      {/* <main className="px-4 md:px-8"> */}
        <GitHubActivity username={username} />
      {/* </main> */}
    </div>
  )
}
