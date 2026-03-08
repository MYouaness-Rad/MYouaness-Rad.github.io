"use client"
import { useState } from "react"
import { ChevronRight, ChevronDown } from "lucide-react"
import { HeadingNode } from "./useProjectScroll"
import { getLevelStyles } from "./LevelStyles"

interface CollapsibleTOCProps {
  node: HeadingNode
  activeId: string
  onTOCClick: (e: React.MouseEvent, id: string) => void
}

export function CollapsibleTOCItem({ node, activeId, onTOCClick }: CollapsibleTOCProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const isActive = activeId === node.id
  const hasChildren = node.children.length > 0

  const styles = getLevelStyles(node.level)

  return (
    <div className={styles.spacing}>
      <div 
        className={`flex items-start gap-2 cursor-pointer select-none group/toc-item hover:opacity-80 transition-opacity duration-150 ${styles.indent}`}
        onClick={(e) => {
          e.stopPropagation()
          setIsExpanded(!isExpanded)
        }}
      >
        <span className="flex-shrink-0 mt-1 transition-all duration-150">
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className={`${styles.iconSize} text-blue-400 group-hover/toc-item:text-blue-300`} />
            ) : (
              <ChevronRight className={`${styles.iconSize} text-blue-400 group-hover/toc-item:text-blue-300`} />
            )
          ) : (
            <div className={`${styles.iconSize}`} />
          )}
        </span>
        
        <a
          href={`#${node.id}`}
          onClick={(e) => onTOCClick(e, node.id)}
          className={`flex-1 block rounded transition-all duration-150 ${styles.textSize} ${styles.padding} ${
            isActive 
              ? "font-semibold bg-blue-600/20 text-white border-l-2 border-blue-400" 
              : "hover:bg-white/5 text-gray-300 hover:text-white"
          }`}
        >
          {node.text}
        </a>
      </div>
      
      {hasChildren && isExpanded && (
        <div>
          {node.children.map((child, index) => (
            <CollapsibleTOCItem
              key={child.id || `toc-${index}-${child.text?.slice(0, 10)}`}
              node={child}
              activeId={activeId}
              onTOCClick={onTOCClick}
            />
          ))}
        </div>
      )}
    </div>
  )
}

