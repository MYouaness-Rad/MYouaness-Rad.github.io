/**
 * Shared utility for consistent level-based styling across all collapsible components
 * Ensures no calculations - pure Tailwind classes for reusability
 */

export interface LevelStyleConfig {
  indent: string
  textSize: string
  iconSize: string
  padding: string
  spacing: string
}

export const getLevelStyles = (level: number): LevelStyleConfig => {
  switch (level) {
    case 1: return { 
      indent: "pl-0", 
      textSize: "text-sm font-semibold",
      iconSize: "w-4 h-4",
      padding: "py-2 px-3",
      spacing: "mb-1"
    }
    case 2: return { 
      indent: "pl-4", 
      textSize: "text-xs font-medium",
      iconSize: "w-3 h-3",
      padding: "py-1.5 px-2",
      spacing: "mb-1"
    }
    case 3: return { 
      indent: "pl-8", 
      textSize: "text-xs",
      iconSize: "w-3 h-3",
      padding: "py-1 px-2",
      spacing: "mb-1"
    }
    case 4: return { 
      indent: "pl-12", 
      textSize: "text-xs",
      iconSize: "w-2.5 h-2.5",
      padding: "py-1 px-2",
      spacing: "mb-1"
    }
    default: return { 
      indent: "pl-16", 
      textSize: "text-xs",
      iconSize: "w-2.5 h-2.5",
      padding: "py-1 px-2",
      spacing: "mb-1"
    }
  }
}

export const getContentLevelStyles = (level: number): LevelStyleConfig => {
  switch (level) {
    case 1: return { 
      indent: "pl-0", 
      textSize: "text-3xl",
      iconSize: "w-5 h-5",
      padding: "py-2 px-3",
      spacing: "mb-4 mt-8"
    }
    case 2: return { 
      indent: "pl-6", 
      textSize: "text-2xl",
      iconSize: "w-4 h-4",
      padding: "py-1.5 px-2",
      spacing: "mb-3 mt-6"
    }
    case 3: return { 
      indent: "pl-12", 
      textSize: "text-xl",
      iconSize: "w-4 h-4",
      padding: "py-1 px-2",
      spacing: "mb-2 mt-4"
    }
    case 4: return { 
      indent: "pl-16", 
      textSize: "text-lg",
      iconSize: "w-3 h-3",
      padding: "py-1 px-2",
      spacing: "mb-2 mt-3"
    }
    default: return { 
      indent: "pl-20", 
      textSize: "text-base",
      iconSize: "w-3 h-3",
      padding: "py-1 px-2",
      spacing: "mb-1 mt-2"
    }
  }
}

export const getIndentClass = (level: number): string => {
  const styles = getLevelStyles(level)
  return styles.indent
}

export const getContentIndentClass = (level: number): string => {
  const styles = getContentLevelStyles(level)
  return styles.indent
}

