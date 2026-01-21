"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

interface CollapsibleContextValue {
  open: boolean
  setOpen: (open: boolean) => void
  contentId: string
}

const CollapsibleContext = React.createContext<CollapsibleContextValue | null>(null)

function useCollapsible() {
  const context = React.useContext(CollapsibleContext)
  if (!context) {
    throw new Error("useCollapsible must be used within a Collapsible")
  }
  return context
}

interface CollapsibleProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  disabled?: boolean
}

function Collapsible({
  children,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  disabled,
  className,
  ...props
}: CollapsibleProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen)
  const contentId = React.useId()

  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : uncontrolledOpen

  const setOpen = React.useCallback(
    (value: boolean) => {
      if (disabled) return
      if (!isControlled) {
        setUncontrolledOpen(value)
      }
      onOpenChange?.(value)
    },
    [disabled, isControlled, onOpenChange]
  )

  return (
    <CollapsibleContext.Provider value={{ open, setOpen, contentId }}>
      <div
        data-slot="collapsible"
        data-state={open ? "open" : "closed"}
        data-disabled={disabled || undefined}
        className={className}
        {...props}
      >
        {children}
      </div>
    </CollapsibleContext.Provider>
  )
}

interface CollapsibleTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
}

function CollapsibleTrigger({
  children,
  asChild,
  className,
  ...props
}: CollapsibleTriggerProps) {
  const { open, setOpen, contentId } = useCollapsible()

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    props.onClick?.(e)
    if (!e.defaultPrevented) {
      setOpen(!open)
    }
  }

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      onClick: handleClick,
      "aria-expanded": open,
      "aria-controls": contentId,
      "data-state": open ? "open" : "closed",
      "data-slot": "collapsible-trigger",
    })
  }

  return (
    <button
      type="button"
      data-slot="collapsible-trigger"
      data-state={open ? "open" : "closed"}
      aria-expanded={open}
      aria-controls={contentId}
      className={className}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  )
}

interface CollapsibleContentProps extends React.HTMLAttributes<HTMLDivElement> {
  forceMount?: boolean
}

function CollapsibleContent({
  children,
  className,
  forceMount,
  ...props
}: CollapsibleContentProps) {
  const { open, contentId } = useCollapsible()
  const contentRef = React.useRef<HTMLDivElement>(null)
  const [height, setHeight] = React.useState<number | undefined>(undefined)
  const [isAnimating, setIsAnimating] = React.useState(false)

  React.useLayoutEffect(() => {
    const content = contentRef.current
    if (!content) return

    if (open) {
      // Opening: measure and animate
      setIsAnimating(true)
      const contentHeight = content.scrollHeight
      setHeight(contentHeight)

      const timer = setTimeout(() => {
        setIsAnimating(false)
        setHeight(undefined)
      }, 200) // Match animation duration

      return () => clearTimeout(timer)
    } else {
      // Closing: set current height first, then animate to 0
      const contentHeight = content.scrollHeight
      setHeight(contentHeight)
      setIsAnimating(true)

      // Force reflow then set to 0
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setHeight(0)
        })
      })

      const timer = setTimeout(() => {
        setIsAnimating(false)
      }, 200)

      return () => clearTimeout(timer)
    }
  }, [open])

  if (!open && !isAnimating && !forceMount) {
    return null
  }

  return (
    <div
      ref={contentRef}
      id={contentId}
      data-slot="collapsible-content"
      data-state={open ? "open" : "closed"}
      hidden={!open && !isAnimating && !forceMount}
      className={cn(
        "overflow-hidden transition-[height] duration-200 ease-out",
        className
      )}
      style={{
        height: isAnimating ? height : open ? "auto" : 0,
      }}
      {...props}
    >
      {children}
    </div>
  )
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
