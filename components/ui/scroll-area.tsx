"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "vertical" | "horizontal" | "both"
}

function ScrollArea({
  className,
  children,
  orientation = "vertical",
  ...props
}: ScrollAreaProps) {
  const viewportRef = React.useRef<HTMLDivElement>(null)
  const [showVerticalScrollbar, setShowVerticalScrollbar] = React.useState(false)
  const [showHorizontalScrollbar, setShowHorizontalScrollbar] = React.useState(false)
  const [scrollTop, setScrollTop] = React.useState(0)
  const [scrollLeft, setScrollLeft] = React.useState(0)
  const [viewportHeight, setViewportHeight] = React.useState(0)
  const [viewportWidth, setViewportWidth] = React.useState(0)
  const [contentHeight, setContentHeight] = React.useState(0)
  const [contentWidth, setContentWidth] = React.useState(0)

  React.useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    const updateScrollInfo = () => {
      const hasVerticalScroll = viewport.scrollHeight > viewport.clientHeight
      const hasHorizontalScroll = viewport.scrollWidth > viewport.clientWidth

      setShowVerticalScrollbar(
        hasVerticalScroll && (orientation === "vertical" || orientation === "both")
      )
      setShowHorizontalScrollbar(
        hasHorizontalScroll && (orientation === "horizontal" || orientation === "both")
      )
      setViewportHeight(viewport.clientHeight)
      setViewportWidth(viewport.clientWidth)
      setContentHeight(viewport.scrollHeight)
      setContentWidth(viewport.scrollWidth)
    }

    const handleScroll = () => {
      setScrollTop(viewport.scrollTop)
      setScrollLeft(viewport.scrollLeft)
    }

    updateScrollInfo()
    viewport.addEventListener("scroll", handleScroll)

    const resizeObserver = new ResizeObserver(updateScrollInfo)
    resizeObserver.observe(viewport)

    // Also observe children for content changes
    const mutationObserver = new MutationObserver(updateScrollInfo)
    mutationObserver.observe(viewport, { childList: true, subtree: true })

    return () => {
      viewport.removeEventListener("scroll", handleScroll)
      resizeObserver.disconnect()
      mutationObserver.disconnect()
    }
  }, [orientation])

  return (
    <div
      data-slot="scroll-area"
      className={cn("relative overflow-hidden", className)}
      {...props}
    >
      <div
        ref={viewportRef}
        data-slot="scroll-area-viewport"
        className={cn(
          "size-full rounded-[inherit] outline-none",
          "focus-visible:ring-ring/50 transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1",
          orientation === "vertical" && "overflow-y-auto overflow-x-hidden",
          orientation === "horizontal" && "overflow-x-auto overflow-y-hidden",
          orientation === "both" && "overflow-auto"
        )}
        tabIndex={0}
      >
        {children}
      </div>
      {showVerticalScrollbar && (
        <ScrollBar
          orientation="vertical"
          viewportRef={viewportRef}
          scrollPosition={scrollTop}
          viewportSize={viewportHeight}
          contentSize={contentHeight}
        />
      )}
      {showHorizontalScrollbar && (
        <ScrollBar
          orientation="horizontal"
          viewportRef={viewportRef}
          scrollPosition={scrollLeft}
          viewportSize={viewportWidth}
          contentSize={contentWidth}
        />
      )}
    </div>
  )
}

interface ScrollBarProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "vertical" | "horizontal"
  viewportRef?: React.RefObject<HTMLDivElement | null>
  scrollPosition?: number
  viewportSize?: number
  contentSize?: number
}

function ScrollBar({
  className,
  orientation = "vertical",
  viewportRef,
  scrollPosition = 0,
  viewportSize = 0,
  contentSize = 0,
  ...props
}: ScrollBarProps) {
  const [isDragging, setIsDragging] = React.useState(false)
  const [isHovered, setIsHovered] = React.useState(false)
  const scrollbarRef = React.useRef<HTMLDivElement>(null)
  const startPosRef = React.useRef(0)
  const startScrollRef = React.useRef(0)

  const thumbSize =
    contentSize > 0 ? Math.max((viewportSize / contentSize) * 100, 10) : 0
  const thumbPosition =
    contentSize > viewportSize
      ? (scrollPosition / (contentSize - viewportSize)) * (100 - thumbSize)
      : 0

  const handleThumbMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    startPosRef.current = orientation === "vertical" ? e.clientY : e.clientX
    startScrollRef.current = scrollPosition
  }

  React.useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      const viewport = viewportRef?.current
      const scrollbar = scrollbarRef.current
      if (!viewport || !scrollbar) return

      const currentPos = orientation === "vertical" ? e.clientY : e.clientX
      const delta = currentPos - startPosRef.current
      const scrollbarSize =
        orientation === "vertical"
          ? scrollbar.clientHeight
          : scrollbar.clientWidth
      const scrollRatio = (contentSize - viewportSize) / (scrollbarSize * (1 - thumbSize / 100))
      const newScrollPos = startScrollRef.current + delta * scrollRatio

      if (orientation === "vertical") {
        viewport.scrollTop = Math.max(0, Math.min(newScrollPos, contentSize - viewportSize))
      } else {
        viewport.scrollLeft = Math.max(0, Math.min(newScrollPos, contentSize - viewportSize))
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging, orientation, viewportRef, contentSize, viewportSize, thumbSize])

  const handleTrackClick = (e: React.MouseEvent) => {
    const viewport = viewportRef?.current
    const scrollbar = scrollbarRef.current
    if (!viewport || !scrollbar || e.target !== scrollbar) return

    const rect = scrollbar.getBoundingClientRect()
    const clickPos =
      orientation === "vertical" ? e.clientY - rect.top : e.clientX - rect.left
    const scrollbarSize = orientation === "vertical" ? rect.height : rect.width
    const clickRatio = clickPos / scrollbarSize
    const targetScroll = clickRatio * contentSize - viewportSize / 2

    if (orientation === "vertical") {
      viewport.scrollTop = Math.max(0, Math.min(targetScroll, contentSize - viewportSize))
    } else {
      viewport.scrollLeft = Math.max(0, Math.min(targetScroll, contentSize - viewportSize))
    }
  }

  return (
    <div
      ref={scrollbarRef}
      data-slot="scroll-area-scrollbar"
      data-orientation={orientation}
      className={cn(
        "absolute flex touch-none p-px transition-opacity select-none",
        orientation === "vertical" && "right-0 top-0 h-full w-2.5 border-l border-l-transparent",
        orientation === "horizontal" && "bottom-0 left-0 h-2.5 w-full flex-col border-t border-t-transparent",
        !isHovered && !isDragging && "opacity-0",
        (isHovered || isDragging) && "opacity-100",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleTrackClick}
      {...props}
    >
      <div
        data-slot="scroll-area-thumb"
        className={cn(
          "bg-border relative rounded-full transition-colors",
          orientation === "vertical" && "w-full",
          orientation === "horizontal" && "h-full",
          isDragging && "bg-foreground/50"
        )}
        style={{
          [orientation === "vertical" ? "height" : "width"]: `${thumbSize}%`,
          [orientation === "vertical" ? "top" : "left"]: `${thumbPosition}%`,
          position: "absolute",
        }}
        onMouseDown={handleThumbMouseDown}
      />
    </div>
  )
}

export { ScrollArea, ScrollBar }
