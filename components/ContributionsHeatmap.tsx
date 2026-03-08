"use client"

import React from "react"

export interface Contribution {
  date: string
  count: number
  level: 0 | 1 | 2 | 3 | 4
}

interface ContributionsHeatmapProps {
  contributions: Contribution[]
}

// Helper function to get contribution level based on count
const getContributionLevel = (count: number): 0 | 1 | 2 | 3 | 4 => {
  if (count === 0) return 0
  if (count <= 3) return 1
  if (count <= 7) return 2
  if (count <= 12) return 3
  return 4
}

// Get contribution color based on level
const getContributionColor = (level: 0 | 1 | 2 | 3 | 4) => {
  const colors = [
    '#ebedf0', // No contributions
    '#9be9a8', // 1-3 contributions
    '#40c463', // 4-7 contributions
    '#30a14e', // 8-12 contributions
    '#216e39'  // 13+ contributions
  ]
  return colors[level]
}

// Group contributions by week for horizontal heatmap display (like GitHub)
const groupContributionsByWeek = (contributions: Contribution[]) => {
  if (contributions.length === 0) return { weeks: [], monthLabels: [] }
  
  // Create a map of all contributions by date
  const contributionsMap = new Map<string, Contribution>()
  contributions.forEach(cont => {
    contributionsMap.set(cont.date, cont)
  })
  
  // Find the date range
  const dates = contributions.map(c => new Date(c.date))
  const earliestDate = new Date(Math.min(...dates.map(d => d.getTime())))
  const latestDate = new Date(Math.max(...dates.map(d => d.getTime())))
  
  // Start from the Sunday of the week containing the earliest date
  const startDate = new Date(earliestDate)
  const dayOfWeek = startDate.getDay()
  startDate.setDate(startDate.getDate() - dayOfWeek)
  startDate.setHours(0, 0, 0, 0)
  
  // End at today or latest contribution date
  const endDate = new Date(latestDate > new Date() ? new Date() : latestDate)
  endDate.setHours(23, 59, 59, 999)
  
  // Generate all days in the range, grouped by week
  const weeks: (Contribution | null)[][] = []
  let currentWeek: (Contribution | null)[] = []
  let currentDate = new Date(startDate)
  const monthLabels: { month: string; weekIndex: number }[] = []
  let lastMonth = -1
  let currentWeekIndex = 0
  let lastLabelWeekIndex = -10 // Track last label position to avoid duplicates
  
  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split('T')[0]
    const dayOfWeek = currentDate.getDay()
    
    // Start new week on Sunday (but don't push if it's the very first day)
    if (dayOfWeek === 0 && currentWeek.length > 0) {
      weeks.push(currentWeek)
      currentWeek = []
      currentWeekIndex++
    }
    
    // Track month labels (show at the start of the week containing the first day of each month)
    const month = currentDate.getMonth()
    const dayOfMonth = currentDate.getDate()
    if (month !== lastMonth && dayOfMonth === 1) {
      const monthName = currentDate.toLocaleDateString('en-US', { month: 'short' })
      // The week index for this month is the current week being built
      // Month label should appear at the start of this week
      const weekForMonth = currentWeekIndex
      
      // Only add label if it's different from the last one or if there's enough space
      // Show label if it's a new month and either first label or at least 2 weeks from last
      if (lastLabelWeekIndex === -10 || weekForMonth - lastLabelWeekIndex >= 2) {
        monthLabels.push({ 
          month: monthName, 
          weekIndex: weekForMonth
        })
        lastLabelWeekIndex = weekForMonth
      }
      lastMonth = month
    }
    
    // Add contribution for this day (or null if no contribution)
    const contribution = contributionsMap.get(dateStr) || null
    currentWeek.push(contribution)
    
    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1)
  }
  
  // Add the last week if it has days
  if (currentWeek.length > 0) {
    // Pad the last week to 7 days if needed
    while (currentWeek.length < 7) {
      currentWeek.push(null)
    }
    weeks.push(currentWeek)
  }
  
  return { weeks, monthLabels }
}

const ContributionsHeatmap: React.FC<ContributionsHeatmapProps> = ({ contributions }) => {
  if (contributions.length === 0) {
    return (
      <div className="bg-[var(--vscode-sidebar)] border border-[var(--vscode-border)] rounded-xl p-6">
        <div className="text-center py-8 text-[var(--vscode-text-muted)]">
          No contribution data available. Contributions will appear here as activity is detected.
        </div>
      </div>
    )
  }

  const { weeks, monthLabels } = groupContributionsByWeek(contributions)
  const totalContributions = contributions.reduce((sum, c) => sum + c.count, 0)
  const earliestDate = new Date(Math.min(...contributions.map(c => new Date(c.date).getTime())))
  const latestDate = new Date(Math.max(...contributions.map(c => new Date(c.date).getTime())))

  return (
    <div className="bg-[var(--vscode-sidebar)] border border-[var(--vscode-border)] rounded-xl p-6">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-[var(--vscode-text)] mb-2">
          {totalContributions} contributions
          {contributions.length > 0 && (
            <span className="text-sm font-normal text-[var(--vscode-text-muted)] ml-2">
              (from {earliestDate.toLocaleDateString()} to {latestDate.toLocaleDateString()})
            </span>
          )}
        </h2>
        <p className="text-sm text-[var(--vscode-text-muted)]">
          Showing real contribution data from GitHub
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <div className="flex items-start gap-1">
          {/* Day labels on the left */}
          <div className="flex flex-col gap-1 pr-2 pt-6">
            {['Mon', '', 'Wed', '', 'Fri', '', ''].map((day, index) => (
              <div
                key={index}
                className="w-3 h-3 flex items-center justify-end text-[10px] text-[var(--vscode-text-muted)]"
                style={{ visibility: day ? 'visible' : 'hidden' }}
              >
                {day}
              </div>
            ))}
          </div>
          
          {/* Month labels and weeks */}
          <div className="flex-1">
            {/* Month labels */}
            <div className="flex gap-1 mb-1 h-4 relative" style={{ width: `${weeks.length * 13 + (weeks.length - 1) * 4}px`, minWidth: `${weeks.length * 13 + (weeks.length - 1) * 4}px` }}>
              {monthLabels.map(({ month, weekIndex }) => {
                // Position at the start of the week
                // Each week column is 13px wide, and gap-1 adds 4px between weeks
                // So position = weekIndex * (13px + 4px gap)
                const leftPosition = weekIndex * (13 + 4)
                return (
                  <div
                    key={`${month}-${weekIndex}`}
                    className="text-[10px] text-[var(--vscode-text-muted)] absolute whitespace-nowrap"
                    style={{ left: `${leftPosition}px` }}
                  >
                    {month}
                  </div>
                )
              })}
            </div>
            
            {/* Contribution grid */}
            <div className="flex gap-1" style={{ width: `${weeks.length * 13 + (weeks.length - 1) * 4}px`, minWidth: `${weeks.length * 13 + (weeks.length - 1) * 4}px` }}>
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1">
                  {week.map((cont, dayIndex) => {
                    if (cont === null) {
                      return (
                        <div
                          key={`empty-${weekIndex}-${dayIndex}`}
                          className="w-3 h-3 rounded-sm"
                          style={{ backgroundColor: getContributionColor(0) }}
                        />
                      )
                    }
                    
                    const date = new Date(cont.date)
                    const isToday = date.toDateString() === new Date().toDateString()
                    return (
                      <div
                        key={`${cont.date}-${dayIndex}`}
                        className="w-3 h-3 rounded-sm cursor-pointer hover:ring-2 hover:ring-[var(--vscode-blue)] transition-all"
                        style={{
                          backgroundColor: getContributionColor(cont.level),
                          border: isToday ? '1px solid var(--vscode-blue)' : 'none'
                        }}
                        title={`${cont.count} contribution${cont.count !== 1 ? 's' : ''} on ${date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`}
                      />
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between mt-4 text-xs text-[var(--vscode-text-muted)]">
        <span>Less</span>
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4].map(level => (
            <div
              key={level}
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: getContributionColor(level as 0 | 1 | 2 | 3 | 4) }}
            />
          ))}
        </div>
        <span>More</span>
      </div>
    </div>
  )
}

export default ContributionsHeatmap
