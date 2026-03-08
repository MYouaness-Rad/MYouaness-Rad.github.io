"use client"
import React, { useState } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import { getContentLevelStyles } from "./LevelStyles"

interface CollapsibleSectionProps {
  level: number
  id?: string
  children: React.ReactNode
  defaultExpanded?: boolean
}

export function CollapsibleSection({ 
  level,
  id,
  children, 
  defaultExpanded = true,
}: CollapsibleSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)
  const [hasRendered, setHasRendered] = useState(defaultExpanded) // Track if content was ever rendered
  const styles = getContentLevelStyles(level)
  const Tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'

  // Split children into title and content - memoize to avoid re-computation
  const { title, content } = React.useMemo(() => {
    const childrenArray = React.Children.toArray(children)
    return {
      title: childrenArray[0],
      content: childrenArray.slice(1)
    }
  }, [children])

  // Expand handler - mark as rendered when first expanded
  const handleToggle = () => {
    if (!isExpanded && !hasRendered) {
      setHasRendered(true)
    }
    setIsExpanded(!isExpanded)
  }

  return (
    <div className="group/section">
      <Tag 
        id={id}
        className={`${styles.textSize} ${styles.spacing} font-bold ${styles.indent} flex items-start gap-3 cursor-pointer select-none group/heading hover:opacity-80 transition-opacity duration-150`}
        onClick={handleToggle}
      >
        <span className="flex-shrink-0 mt-1 transition-all duration-150">
          {isExpanded ? (
            <ChevronDown className={`${styles.iconSize} text-blue-400 group-hover/heading:text-blue-300`} />
          ) : (
            <ChevronRight className={`${styles.iconSize} text-blue-400 group-hover/heading:text-blue-300`} />
          )}
        </span>
        <span className="flex-1">{title}</span>
      </Tag>
      
      {hasRendered && content.length > 0 && (
        <div className={`${styles.indent} pt-2 ${!isExpanded ? 'hidden' : ''}`}>
          {content}
        </div>
      )}
    </div>
  )
}
