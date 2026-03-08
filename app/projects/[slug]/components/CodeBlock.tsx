"use client"
import React, { useState } from "react"
import { Copy, Check, Terminal } from "lucide-react"

interface CodeBlockProps {
  children: React.ReactNode
  className?: string
  language?: string
}

export function CodeBlock({ children, className, language }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)
  
  // Extract language from className (e.g., "language-typescript" -> "typescript")
  const lang = language || className?.replace(/language-/, "") || "code"
  
  // Get the code text content for copying
  const getCodeText = () => {
    if (typeof children === "string") return children
    
    // Handle React element children
    const element = React.Children.only(children) as React.ReactElement<{ children?: any }>
    const elementChildren = element?.props?.children
    
    if (elementChildren) {
      if (typeof elementChildren === "string") {
        return elementChildren
      }
      // Handle nested elements
      if (Array.isArray(elementChildren)) {
        return elementChildren
          .map((child: any) => (typeof child === "string" ? child : child?.props?.children || ""))
          .join("")
      }
    }
    return ""
  }

  const handleCopy = async () => {
    const code = getCodeText()
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative group/code-block my-6 bg-[var(--terminal-bg)] rounded-lg border border-[var(--vscode-border)] overflow-hidden">
      {/* Terminal Header - macOS style */}
      <div className="bg-[var(--terminal-title-bar)] px-4 py-2 flex items-center gap-2 border-b border-[var(--vscode-border)]">
        {/* Left side - Traffic lights + Icon + Title */}
        <div className="flex items-center gap-2 flex-1">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 bg-[var(--vscode-error)] rounded-full"></div>
            <div className="w-3 h-3 bg-[var(--vscode-warning)] rounded-full"></div>
            <div className="w-3 h-3 bg-[var(--vscode-green)] rounded-full"></div>
          </div>
          <Terminal className="w-4 h-4 text-[var(--vscode-text-muted)] ml-2" />
          <span className="text-sm text-[var(--vscode-text-muted)]">Code</span>
          {lang && (
            <span className="text-xs font-mono text-[var(--vscode-text-muted)] uppercase tracking-wide ml-2 opacity-60">
              {lang}
            </span>
          )}
        </div>
        
        {/* Right side - Copy button */}
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all duration-150 hover:bg-white/5"
          style={{ color: "var(--vscode-text-muted)" }}
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-[var(--vscode-green)]" />
              <span className="text-[var(--vscode-green)]">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Content with Syntax Highlighting */}
      <div className="p-4 font-mono text-sm overflow-x-auto max-h-[600px] overflow-y-auto scrollbar-thin">
        <pre className="!mt-0 !mb-0 !bg-transparent !border-0">
          {children}
        </pre>
      </div>
    </div>
  )
}

