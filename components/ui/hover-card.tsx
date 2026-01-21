"use client"

import * as React from "react"
import { createPortal } from "react-dom"

import { cn } from "@/lib/utils"

interface HoverCardContextValue {
  open: boolean
  setOpen: (open: boolean) => void
  triggerRef: React.RefObject<HTMLElement | null>
  cancelClose: () => void
}

const HoverCardContext = React.createContext<HoverCardContextValue | null>(null)

function useHoverCard() {
  const context = React.useContext(HoverCardContext)
  if (!context) {
    throw new Error("useHoverCard must be used within a HoverCard")
  }
  return context
}

interface HoverCardProps {
  children: React.ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  openDelay?: number
  closeDelay?: number
}

function HoverCard({
  children,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  openDelay = 700,
  closeDelay = 300,
}: HoverCardProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen)
  const triggerRef = React.useRef<HTMLElement>(null)
  const openTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)
  const closeTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)

  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : uncontrolledOpen

  const setOpen = React.useCallback(
    (value: boolean) => {
      if (openTimeoutRef.current) {
        clearTimeout(openTimeoutRef.current)
        openTimeoutRef.current = null
      }
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current)
        closeTimeoutRef.current = null
      }

      if (value) {
        openTimeoutRef.current = setTimeout(() => {
          if (!isControlled) {
            setUncontrolledOpen(true)
          }
          onOpenChange?.(true)
        }, openDelay)
      } else {
        closeTimeoutRef.current = setTimeout(() => {
          if (!isControlled) {
            setUncontrolledOpen(false)
          }
          onOpenChange?.(false)
        }, closeDelay)
      }
    },
    [isControlled, onOpenChange, openDelay, closeDelay]
  )

  const cancelClose = React.useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
  }, [])

  React.useEffect(() => {
    return () => {
      if (openTimeoutRef.current) clearTimeout(openTimeoutRef.current)
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current)
    }
  }, [])

  return (
    <HoverCardContext.Provider value={{ open, setOpen, triggerRef, cancelClose }}>
      {children}
    </HoverCardContext.Provider>
  )
}

interface HoverCardTriggerProps extends React.HTMLAttributes<HTMLSpanElement> {
  asChild?: boolean
}

function HoverCardTrigger({
  children,
  asChild,
  ...props
}: HoverCardTriggerProps) {
  const { setOpen, triggerRef } = useHoverCard()

  const handleMouseEnter = () => {
    setOpen(true)
  }

  const handleMouseLeave = () => {
    setOpen(false)
  }

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      ref: triggerRef,
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      "data-slot": "hover-card-trigger",
    })
  }

  return (
    <span
      ref={triggerRef as React.RefObject<HTMLSpanElement>}
      data-slot="hover-card-trigger"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}
    </span>
  )
}

interface HoverCardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: "top" | "right" | "bottom" | "left"
  sideOffset?: number
  align?: "start" | "center" | "end"
}

function HoverCardContent({
  className,
  side = "bottom",
  sideOffset = 4,
  align = "center",
  children,
  ...props
}: HoverCardContentProps) {
  const { open, setOpen, triggerRef, cancelClose } = useHoverCard()
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
    top: "slide-in-from-bottom-2",
    bottom: "slide-in-from-top-2",
    left: "slide-in-from-right-2",
    right: "slide-in-from-left-2",
  }

  return createPortal(
    <div
      ref={contentRef}
      data-slot="hover-card-content"
      data-state={open ? "open" : "closed"}
      data-side={side}
      className={cn(
        "fixed z-50 w-64 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none",
        "animate-in fade-in-0 zoom-in-95",
        slideClasses[side],
        className
      )}
      style={{
        top: position.top,
        left: position.left,
      }}
      onMouseEnter={cancelClose}
      onMouseLeave={() => setOpen(false)}
      {...props}
    >
      {children}
    </div>,
    document.body
  )
}

export { HoverCard, HoverCardTrigger, HoverCardContent }
