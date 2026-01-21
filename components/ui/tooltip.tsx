"use client"

import * as React from "react"
import { createPortal } from "react-dom"

import { cn } from "@/lib/utils"

interface TooltipContextValue {
  open: boolean
  setOpen: (open: boolean) => void
  triggerRef: React.RefObject<HTMLElement | null>
  delayDuration: number
}

const TooltipContext = React.createContext<TooltipContextValue | null>(null)

function useTooltip() {
  const context = React.useContext(TooltipContext)
  if (!context) {
    throw new Error("useTooltip must be used within a Tooltip")
  }
  return context
}

interface TooltipProviderProps {
  children: React.ReactNode
  delayDuration?: number
}

const TooltipProviderContext = React.createContext<{ delayDuration: number }>({
  delayDuration: 0,
})

function TooltipProvider({
  children,
  delayDuration = 0,
}: TooltipProviderProps) {
  return (
    <TooltipProviderContext.Provider value={{ delayDuration }}>
      {children}
    </TooltipProviderContext.Provider>
  )
}

interface TooltipProps {
  children: React.ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  delayDuration?: number
}

function Tooltip({
  children,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  delayDuration: propDelayDuration,
}: TooltipProps) {
  const providerContext = React.useContext(TooltipProviderContext)
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen)
  const triggerRef = React.useRef<HTMLElement>(null)

  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : uncontrolledOpen
  const delayDuration = propDelayDuration ?? providerContext.delayDuration

  const setOpen = React.useCallback(
    (value: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(value)
      }
      onOpenChange?.(value)
    },
    [isControlled, onOpenChange]
  )

  return (
    <TooltipContext.Provider value={{ open, setOpen, triggerRef, delayDuration }}>
      {children}
    </TooltipContext.Provider>
  )
}

interface TooltipTriggerProps extends React.HTMLAttributes<HTMLSpanElement> {
  asChild?: boolean
}

function TooltipTrigger({
  children,
  asChild,
  ...props
}: TooltipTriggerProps) {
  const { setOpen, triggerRef, delayDuration } = useTooltip()
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null)

  const handleMouseEnter = () => {
    if (delayDuration > 0) {
      timeoutRef.current = setTimeout(() => setOpen(true), delayDuration)
    } else {
      setOpen(true)
    }
  }

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    setOpen(false)
  }

  const handleFocus = () => {
    setOpen(true)
  }

  const handleBlur = () => {
    setOpen(false)
  }

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      ref: triggerRef,
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      onFocus: handleFocus,
      onBlur: handleBlur,
      "data-slot": "tooltip-trigger",
    })
  }

  return (
    <span
      ref={triggerRef as React.RefObject<HTMLSpanElement>}
      data-slot="tooltip-trigger"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      {...props}
    >
      {children}
    </span>
  )
}

interface TooltipContentProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: "top" | "right" | "bottom" | "left"
  sideOffset?: number
  align?: "start" | "center" | "end"
}

function TooltipContent({
  className,
  side = "top",
  sideOffset = 4,
  align = "center",
  children,
  ...props
}: TooltipContentProps) {
  const { open, triggerRef } = useTooltip()
  const [position, setPosition] = React.useState({ top: 0, left: 0 })
  const [mounted, setMounted] = React.useState(false)
  const contentRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useLayoutEffect(() => {
    if (!open || !triggerRef.current || !contentRef.current) return

    const trigger = triggerRef.current.getBoundingClientRect()
    const content = contentRef.current.getBoundingClientRect()

    let top = 0
    let left = 0

    // Calculate position based on side
    switch (side) {
      case "top":
        top = trigger.top - content.height - sideOffset
        break
      case "bottom":
        top = trigger.bottom + sideOffset
        break
      case "left":
        left = trigger.left - content.width - sideOffset
        top = trigger.top + (trigger.height - content.height) / 2
        break
      case "right":
        left = trigger.right + sideOffset
        top = trigger.top + (trigger.height - content.height) / 2
        break
    }

    // Calculate alignment for top/bottom
    if (side === "top" || side === "bottom") {
      switch (align) {
        case "start":
          left = trigger.left
          break
        case "center":
          left = trigger.left + (trigger.width - content.width) / 2
          break
        case "end":
          left = trigger.right - content.width
          break
      }
    }

    // Calculate alignment for left/right
    if (side === "left" || side === "right") {
      switch (align) {
        case "start":
          top = trigger.top
          break
        case "center":
          top = trigger.top + (trigger.height - content.height) / 2
          break
        case "end":
          top = trigger.bottom - content.height
          break
      }
    }

    setPosition({ top, left })
  }, [open, side, align, sideOffset, triggerRef])

  if (!open || !mounted) return null

  const slideClasses = {
    top: "animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-2",
    bottom: "animate-in fade-in-0 zoom-in-95 slide-in-from-top-2",
    left: "animate-in fade-in-0 zoom-in-95 slide-in-from-right-2",
    right: "animate-in fade-in-0 zoom-in-95 slide-in-from-left-2",
  }

  return createPortal(
    <div
      ref={contentRef}
      data-slot="tooltip-content"
      data-state={open ? "open" : "closed"}
      data-side={side}
      role="tooltip"
      className={cn(
        "fixed z-50 w-max rounded-md bg-foreground px-3 py-1.5 text-xs text-background text-balance",
        slideClasses[side],
        className
      )}
      style={{
        top: position.top,
        left: position.left,
      }}
      {...props}
    >
      {children}
      <div
        className={cn(
          "absolute size-2.5 rotate-45 rounded-[2px] bg-foreground",
          side === "top" && "top-full left-1/2 -translate-x-1/2 -translate-y-1/2",
          side === "bottom" && "bottom-full left-1/2 -translate-x-1/2 translate-y-1/2",
          side === "left" && "left-full top-1/2 -translate-x-1/2 -translate-y-1/2",
          side === "right" && "right-full top-1/2 translate-x-1/2 -translate-y-1/2"
        )}
      />
    </div>,
    document.body
  )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
