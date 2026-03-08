"use client"
import React, { useMemo } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeHighlight from "rehype-highlight"
import { CollapsibleSection } from "./CollapsibleSection"
import { CodeBlock } from "./CodeBlock"
import "highlight.js/styles/github-dark.css"

interface ProjectContentProps {
  markdownContent: string
  headingTree: any[]
}

interface Section {
  level: number
  title: string
  id: string
  content: string
}

// Parse markdown into hierarchical sections
function parseMarkdownSections(content: string, parentId = "", minLevel = 1): Section[] {
  if (!content || typeof content !== 'string') {
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️ Invalid markdown content provided to parseMarkdownSections')
    }
    return []
  }

  const lines = content.split('\n')
  const sections: Section[] = []
  let currentSection: Section | null = null
  let currentContent: string[] = []
  const idCounts = new Map<string, number>() // Track ID usage to prevent duplicates
  let inCodeBlock = false

  lines.forEach((line, index) => {
    try {
      // Track code blocks to ignore headings inside them
      if (line.trim().startsWith('```')) {
        inCodeBlock = !inCodeBlock
        currentContent.push(line)
        return
      }

      // Skip heading detection inside code blocks
      if (inCodeBlock) {
        currentContent.push(line)
        return
      }

      const headingMatch = line.match(/^(#{1,6})\s+(.+)$/)
      
      if (headingMatch) {
        const level = headingMatch[1].length
        
        // Only process headings at the minimum level for this parse
        if (level === minLevel) {
          // Save previous section
          if (currentSection) {
            currentSection.content = currentContent.join('\n').trim()
            sections.push(currentSection)
          }

          // Start new section
          const title = headingMatch[2].trim()
          
          // Generate safe slug - handle edge cases
          let titleSlug = title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
            .replace(/\s+/g, '-')          // Replace spaces with hyphens
            .replace(/-+/g, '-')           // Replace multiple hyphens with single
            .replace(/^-|-$/g, '')         // Trim hyphens from start/end
            || `section-${index}`          // Fallback if slug is empty

          // Create base ID
          let baseId = parentId ? `${parentId}-${titleSlug}` : titleSlug
          
          // Ensure uniqueness by adding counter if ID already exists
          let id = baseId
          const count = idCounts.get(baseId) || 0
          if (count > 0) {
            id = `${baseId}-${count}`
          }
          idCounts.set(baseId, count + 1)

          currentSection = { level, title, id, content: '' }
          currentContent = []
        } else {
          // This is a nested heading or content, add to current section
          currentContent.push(line)
        }
      } else {
        currentContent.push(line)
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error(`❌ Error parsing line ${index}:`, line, error)
      }
      // Continue processing other lines
    }
  })

  // Save final section
  if (currentSection) {
    const finalSection = currentSection as Section
    finalSection.content = currentContent.join('\n').trim()
    sections.push(finalSection)
  }

  return sections
}

// Check if content has nested headings (but ignore headings inside code blocks)
const hasNestedHeadingsInContent = (content: string): boolean => {
  if (!content) return false
  
  const lines = content.split('\n')
  let inCodeBlock = false
  
  for (const line of lines) {
    if (line.trim().startsWith('```')) {
      inCodeBlock = !inCodeBlock
      continue
    }
    
    // Only check for headings outside code blocks
    if (!inCodeBlock && /^#{1,6}\s+/.test(line)) {
      return true
    }
  }
  
  return false
}

// Render a single section with its nested content
const RenderSection = React.memo(({ section, parentId = "" }: { section: Section; parentId?: string }) => {
  if (!section || !section.id) {
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ Invalid section provided to RenderSection:', section)
    }
    return null
  }

  // Cache the parsing results to avoid re-parsing on every render
  const { hasNestedHeadings, hasContent, nestedSections } = React.useMemo(() => {
    const hasNestedHeadings = hasNestedHeadingsInContent(section.content)
    const hasContent = section.content && section.content.trim().length > 0
    const nestedSections = hasNestedHeadings 
      ? parseMarkdownSections(section.content, section.id, section.level + 1)
      : []
    
    return { hasNestedHeadings, hasContent, nestedSections }
  }, [section.content, section.id, section.level])

  try {
    // If section has nested headings, render them
    if (hasNestedHeadings) {
      
      return (
        <CollapsibleSection
          level={section.level}
          id={section.id}
          defaultExpanded={section.level <= 2}
        >
          {section.title}
          <div className="pt-2">
            {nestedSections.map((nested) => (
              <RenderSection key={nested.id} section={nested} parentId={section.id} />
            ))}
          </div>
        </CollapsibleSection>
      )
    }

    // If section has content but no nested headings, render as markdown
    if (hasContent) {
      return (
        <CollapsibleSection
          level={section.level}
          id={section.id}
          defaultExpanded={section.level <= 2}
        >
          {section.title}
          <div className="pt-2">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={{
                hr: () => <div className="my-8" />,
                pre: ({ children, ...props }) => {
                  // Extract code element and its properties
                  const codeElement = React.Children.toArray(children).find(
                    (child): child is React.ReactElement => 
                      React.isValidElement(child) && child.type === 'code'
                  )
                  
                  if (codeElement) {
                    const className = (codeElement.props as any)?.className || ""
                    return (
                      <CodeBlock className={className}>
                        {codeElement}
                      </CodeBlock>
                    )
                  }
                  
                  // Fallback for pre without code
                  return <pre {...props}>{children}</pre>
                },
              }}
            >
              {section.content}
            </ReactMarkdown>
          </div>
        </CollapsibleSection>
      )
    }

    // Empty section with no nested headings - still render it but without content
    // This handles edge cases where a heading exists but has no content yet
    return (
      <CollapsibleSection
        level={section.level}
        id={section.id}
        defaultExpanded={section.level <= 2}
      >
        {section.title}
      </CollapsibleSection>
    )
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ Error rendering section:', section.id, error)
    }
    return (
      <div className="p-4 border border-red-500/30 bg-red-500/10 rounded-lg my-4">
        <p className="text-red-400 font-semibold">Error rendering section: {section.title}</p>
        <p className="text-red-300 text-sm mt-1">Check console for details</p>
      </div>
    )
  }
})

// Add display name for debugging
RenderSection.displayName = 'RenderSection'

export default function ProjectContent({ markdownContent, headingTree }: ProjectContentProps) {
  const sections = useMemo(() => {
    try {
      const parsed = parseMarkdownSections(markdownContent)
      return parsed
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ Error parsing markdown content:', error)
      }
      return []
    }
  }, [markdownContent])

  const proseClasses = `
    prose prose-sm prose-invert max-w-none
    prose-headings:scroll-mt-32 prose-headings:font-bold prose-headings:tracking-tight
    prose-h1:text-3xl prose-h1:mb-4 prose-h1:mt-10 prose-h1:bg-gradient-to-r prose-h1:from-blue-400 prose-h1:to-blue-600 prose-h1:bg-clip-text prose-h1:text-transparent prose-h1:pb-3 prose-h1:border-b prose-h1:border-blue-500/20
    prose-h2:text-2xl prose-h2:mb-2 prose-h2:mt-8 prose-h2:pb-2 prose-h2:border-b prose-h2:border-gray-700/40 prose-h2:text-blue-300
    prose-h3:text-xl prose-h3:mb-2 prose-h3:mt-6 prose-h3:text-blue-200 prose-h3:opacity-90
    prose-h4:text-lg prose-h4:mb-1 prose-h4:mt-4 prose-h4:text-gray-200 prose-h4:opacity-80
    prose-p:leading-relaxed prose-p:mb-4 prose-p:text-gray-300
    prose-a:inline-flex prose-a:items-center prose-a:gap-1.5 prose-a:no-underline prose-a:transition-colors
    prose-strong:text-white prose-strong:font-semibold
    prose-em:text-blue-200
    prose-code:text-blue-400 prose-code:bg-gray-800 prose-code:border prose-code:border-gray-700 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:before:content-[''] prose-code:after:content-['']
    prose-pre:bg-gray-900 prose-pre:border prose-pre:border-gray-700 prose-pre:rounded-lg prose-pre:p-4 prose-pre:my-6 prose-pre:overflow-x-auto
    prose-ul:my-4 prose-ul:space-y-2 prose-ul:list-none
    prose-ol:my-4 prose-ol:space-y-2
    prose-li:text-gray-300 prose-li:relative prose-li:before:absolute prose-li:before:left-[-1.25rem] prose-li:before:content-['▹'] prose-li:before:text-blue-400
    prose-blockquote:border-l-2 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-500/5 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:my-4 prose-blockquote:italic
    prose-img:rounded-lg prose-img:border prose-img:border-gray-700 prose-img:my-6
    prose-table:border prose-table:border-gray-700 prose-table:rounded-lg prose-table:my-6 prose-table:text-sm
    prose-thead:bg-blue-600
    prose-th:text-white prose-th:font-semibold prose-th:p-3 prose-th:border-b prose-th:border-blue-500
    prose-td:border prose-td:border-gray-700 prose-td:p-3 prose-td:text-gray-300
    prose-tbody:bg-gray-800/20
  `.replace(/\s+/g, ' ').trim()

  return (
    <article className={proseClasses}>
      <style jsx global>{`
        article a {
          color: var(--projects-link-color, #60a5fa) !important;
          position: relative !important;
          display: inline-flex !important;
          align-items: center !important;
          gap: 0.375rem !important;
          text-decoration: none !important;
          transition: all 0.2s ease !important;
        }

        article a:hover {
          color: var(--projects-link-hover-color, #3b82f6) !important;
          text-decoration: underline !important;
        }

        article a::after {
          font-size: 0.875em !important;
          opacity: 0.7 !important;
          transition: opacity 0.2s ease !important;
          margin-left: 0.25rem !important;
        }

        article a:hover::after {
          opacity: 1 !important;
        }

        article a[href^="#"]::after {
          content: '🔗' !important;
        }

        article a[href^="mailto:"]::after {
          content: '✉' !important;
        }

        article a[href*="github.com"]::after {
          content: '🔗' !important;
        }

        article a[href^="http"]:not([href*="github.com"]):not([href*="mailto"])::after {
          content: '↗' !important;
        }

        article hr {
          border: none !important;
          height: 0 !important;
          margin: 4rem 0 !important;
          opacity: 0 !important;
          display: block !important;
        }

        article pre code {
          background: transparent !important;
          border: none !important;
          padding: 0 !important;
          border-radius: 0 !important;
        }

        article pre {
          position: relative;
        }

        article pre:hover {
          border-color: rgba(59, 130, 246, 0.5);
        }

        article ol li {
          padding-left: 0.5rem;
        }

        article ol li::marker {
          color: #60a5fa;
          font-weight: bold;
        }

        article table {
          display: block;
          max-width: 100%;
          overflow-x: auto;
        }

        @media (max-width: 768px) {
          article table {
            font-size: 0.875rem;
          }

          article th, article td {
            padding: 0.75rem;
          }
        }
      `}</style>

      {sections.length > 0 ? (
        sections.map((section) => (
          <RenderSection key={section.id} section={section} />
        ))
      ) : (
        <div className="p-8 text-center">
          <p className="text-gray-400 text-lg mb-2">No content available</p>
          <p className="text-gray-500 text-sm">
            {markdownContent ? 'Unable to parse markdown content' : 'No markdown content provided'}
          </p>
        </div>
      )}
    </article>
  )
}
