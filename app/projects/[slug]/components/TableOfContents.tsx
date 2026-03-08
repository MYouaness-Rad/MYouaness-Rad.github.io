"use client"
import { useState, useMemo } from "react"
import { ChevronUp, Search, X } from "lucide-react"
import { HeadingNode } from "./useProjectScroll"
import { CollapsibleTOCItem } from "./CollapsibleTOC"

export interface Heading {
  id: string
  text: string
  level: number
}

interface TableOfContentsProps {
  headingTree: HeadingNode[]
  activeId: string
  onTOCClick: (e: React.MouseEvent, id: string) => void
}

export default function TableOfContents({
  headingTree,
  activeId,
  onTOCClick,
}: TableOfContentsProps) {
  const [tocOpen, setTocOpen] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  // Filter headings based on search query
  const filteredTree = useMemo(() => {
    if (!searchQuery.trim()) return headingTree

    const filterNodes = (nodes: HeadingNode[]): HeadingNode[] => {
      return nodes.reduce((acc, node) => {
        const matchesSearch = node.text.toLowerCase().includes(searchQuery.toLowerCase())
        const filteredChildren = filterNodes(node.children)
        
        // Include node if it matches or any of its children match
        if (matchesSearch || filteredChildren.length > 0) {
          acc.push({
            ...node,
            children: filteredChildren
          })
        }
        
        return acc
      }, [] as HeadingNode[])
    }

    return filterNodes(headingTree)
  }, [headingTree, searchQuery])

  const handleSearchClear = () => {
    setSearchQuery("")
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && filteredTree.length > 0) {
      // Jump to first match
      const firstMatch = filteredTree[0]
      const syntheticEvent = {
        preventDefault: () => {},
        stopPropagation: () => {}
      } as React.MouseEvent
      onTOCClick(syntheticEvent, firstMatch.id)
    }
  }

  if (headingTree.length === 0) return null

  return (
    <aside className="hidden lg:block w-64 flex-shrink-0 h-full min-h-0">
      <div className="bg-[var(--projects-card-bg)] border border-[var(--projects-border)] rounded-lg overflow-hidden h-full flex flex-col min-h-0">
        <button
          onClick={() => setTocOpen(!tocOpen)}
          className="w-full p-3 flex items-center justify-between cursor-pointer select-none hover:opacity-80 transition-opacity duration-150"
          style={{
            color: "var(--projects-text-white)",
            borderBottom: tocOpen ? "1px solid var(--projects-border)" : "none",
          }}
        >
          <span className="font-semibold text-xs uppercase tracking-wide">Contents</span>
          <span className="transition-all duration-150">
            {tocOpen ? (
              <ChevronUp className="w-3.5 h-3.5 text-blue-400" />
            ) : (
              <ChevronUp className="w-3.5 h-3.5 text-blue-400 rotate-180" />
            )}
          </span>
        </button>

        {tocOpen && (
          <>
            {/* Search Input */}
            <div className="p-2 border-b" style={{ borderColor: "var(--projects-border)" }}>
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  placeholder="Search headings..."
                  className="w-full pl-8 pr-8 py-1.5 text-xs rounded border bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-400 transition-all"
                  style={{
                    color: "var(--projects-text-white)",
                    borderColor: "var(--projects-border)",
                  }}
                />
                {searchQuery && (
                  <button
                    onClick={handleSearchClear}
                    className="absolute right-2 top-1/2 -translate-y-1/2 hover:bg-white/10 rounded p-0.5 transition-colors"
                    aria-label="Clear search"
                  >
                    <X className="w-3 h-3 text-gray-400" />
                  </button>
                )}
              </div>
              {searchQuery && filteredTree.length === 0 && (
                <p className="text-xs text-gray-400 mt-1 ml-1">No matches found</p>
              )}
              {searchQuery && filteredTree.length > 0 && (
                <p className="text-xs text-blue-400 mt-1 ml-1">
                  {filteredTree.length} match{filteredTree.length !== 1 ? 'es' : ''}
                </p>
              )}
            </div>

            {/* TOC Navigation */}
            <nav className="p-2 flex-1 overflow-y-auto min-h-0 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
              {filteredTree.map((node, index) => (
                <CollapsibleTOCItem
                  key={node.id || `toc-root-${index}-${node.text?.slice(0, 10)}`}
                  node={node}
                  activeId={activeId}
                  onTOCClick={onTOCClick}
                />
              ))}
            </nav>
          </>
        )}
      </div>
    </aside>
  )
}

