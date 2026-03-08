"use client"

import React from "react"
import GitHubActivity from "@/components/GitHubActivity"

export default function GitHubPage() {
  const username = "MYouaness-Rad" // replace with the GitHub username you want to show
  // Email addresses associated with this GitHub account
  const emails = ["minaragaie@hotmail.com", "myouaness@radwell.com"]

  return (
    <div className="min-h-screen bg-[var(--vscode-editor-bg)] text-[var(--vscode-editor-foreground)]">
    

      {/* <main className="px-4 md:px-8"> */}
        <GitHubActivity username={username} emails={emails} />
      {/* </main> */}
    </div>
  )
}
