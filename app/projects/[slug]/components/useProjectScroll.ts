"use client"
import React, { useEffect, useState, useRef, useCallback } from "react"
import { Heading } from "./TableOfContents"

export interface HeadingNode extends Heading {
  children: HeadingNode[]
  parent?: HeadingNode
}

export function useReadingProgress() {
  const [readingProgress, setReadingProgress] = useState(0)

  useEffect(() => {
    const mainElement = document.getElementById("main-content")
    if (!mainElement) return

    let rafId: number | null = null

    const updateProgress = () => {
      if (rafId) return

      rafId = requestAnimationFrame(() => {
        const scrollTop = mainElement.scrollTop
        const scrollHeight = mainElement.scrollHeight - mainElement.clientHeight
        setReadingProgress(scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0)
        rafId = null
      })
    }

    mainElement.addEventListener("scroll", updateProgress, { passive: true })
    updateProgress()

    return () => {
      mainElement.removeEventListener("scroll", updateProgress)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [])

  return readingProgress
}

export function useActiveHeading(
  headings: Heading[],
  isScrollingProgrammatically?: React.MutableRefObject<boolean>
) {
  const [activeId, setActiveId] = useState("")
  const headingElementsRef = useRef<Map<string, HTMLElement>>(new Map())
  const rafIdRef = useRef<number | null>(null)

  // Update URL hash when activeId changes
  useEffect(() => {
    if (activeId && !isScrollingProgrammatically?.current) {
      history.replaceState(null, "", `#${activeId}`)
    }
  }, [activeId, isScrollingProgrammatically])

  useEffect(() => {
    const mainElement = document.getElementById("main-content")
    if (!mainElement || headings.length === 0) return

    // Cache DOM elements for all headings
    headingElementsRef.current.clear()
    headings.forEach((heading) => {
      const el = document.getElementById(heading.id)
      if (el) {
        headingElementsRef.current.set(heading.id, el)
      }
    })

    const mainOffsetTop = mainElement.offsetTop

    const onScroll = () => {
      if (isScrollingProgrammatically?.current) {
        return
      }

      // Use RAF to throttle scroll events
      if (rafIdRef.current !== null) {
        return // Already scheduled, skip this event
      }

      rafIdRef.current = requestAnimationFrame(() => {
        const scrollPos = mainElement.scrollTop + 150
        let active = headings[0]?.id || ""

        // Find the active heading
        for (const heading of headings) {
          const el = headingElementsRef.current.get(heading.id)
          if (el) {
            const elementTop = el.offsetTop - mainOffsetTop
            if (elementTop <= scrollPos) {
              active = heading.id
            }
          }
        }

        // Only update if changed
        setActiveId((prev) => (prev !== active ? active : prev))

        rafIdRef.current = null
      })
    }

    mainElement.addEventListener("scroll", onScroll, { passive: true })
    onScroll()

    return () => {
      mainElement.removeEventListener("scroll", onScroll)
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current)
      }
      headingElementsRef.current.clear()
    }
  }, [headings, isScrollingProgrammatically])

  return activeId
}

export function useHeadingExtraction(markdownContent: string) {
  const [headings, setHeadings] = useState<Heading[]>([])
  const [headingTree, setHeadingTree] = useState<HeadingNode[]>([])

  useEffect(() => {
    if (!markdownContent) return

    const extractHeadings = () => {
      const article = document.querySelector("article")
      if (!article) {
        return false
      }

      const nodes = Array.from(article.querySelectorAll("h1, h2, h3, h4")) as HTMLElement[]
      
      // Only extract if we have headings with IDs
      if (nodes.length === 0 || !nodes[0]?.id) {
        return false
      }
      
      const extracted = nodes.map((h) => ({
        id: h.id,
        text: h.textContent || "",
        level: parseInt(h.tagName.substring(1)),
      }))

      setHeadings(extracted)
      
      // Build tree structure
      const tree = buildHeadingTree(extracted)
      setHeadingTree(tree)
      
      return true
    }

    // Try immediate extraction first
    if (extractHeadings()) {
      return
    }

    // If not ready, use MutationObserver to detect when headings are added
    const article = document.querySelector("article")
    if (!article) return

    const observer = new MutationObserver((mutations) => {
      // Check if any heading elements were added
      const hasHeadings = mutations.some(mutation => 
        Array.from(mutation.addedNodes).some(node => 
          node instanceof HTMLElement && /^H[1-6]$/.test(node.tagName)
        )
      )

      if (hasHeadings && extractHeadings()) {
        observer.disconnect()
      }
    })

    observer.observe(article, {
      childList: true,
      subtree: true,
    })

    return () => observer.disconnect()
  }, [markdownContent])

  return { headings, headingTree }
}

// Build hierarchical tree from flat heading list
function buildHeadingTree(headings: Heading[]): HeadingNode[] {
  const root: HeadingNode[] = []
  const stack: HeadingNode[] = []

  headings.forEach((heading) => {
    const node: HeadingNode = {
      ...heading,
      children: [],
    }

    // Find parent - the last heading with a lower level
    while (stack.length > 0 && stack[stack.length - 1].level >= node.level) {
      stack.pop()
    }

    if (stack.length === 0) {
      // Top-level heading
      root.push(node)
    } else {
      // Child heading
      const parent = stack[stack.length - 1]
      node.parent = parent
      parent.children.push(node)
    }

    stack.push(node)
  })

  return root
}
