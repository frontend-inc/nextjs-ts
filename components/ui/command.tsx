"use client"

import * as React from "react"
import { SearchIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface CommandContextValue {
  search: string
  setSearch: (value: string) => void
  selectedIndex: number
  setSelectedIndex: (index: number) => void
  items: React.RefObject<HTMLDivElement[]>
  registerItem: (element: HTMLDivElement | null, index: number) => void
  filter: (value: string, search: string) => boolean
}

const CommandContext = React.createContext<CommandContextValue | null>(null)

function useCommand() {
  const context = React.useContext(CommandContext)
  if (!context) {
    throw new Error("useCommand must be used within a Command")
  }
  return context
}

interface CommandProps extends React.HTMLAttributes<HTMLDivElement> {
  filter?: (value: string, search: string) => boolean
  shouldFilter?: boolean
}

function Command({
  className,
  children,
  filter,
  shouldFilter = true,
  ...props
}: CommandProps) {
  const [search, setSearch] = React.useState("")
  const [selectedIndex, setSelectedIndex] = React.useState(0)
  const items = React.useRef<HTMLDivElement[]>([])

  const defaultFilter = React.useCallback((value: string, search: string) => {
    if (!shouldFilter) return true
    if (search.length === 0) return true
    return value.toLowerCase().includes(search.toLowerCase())
  }, [shouldFilter])

  const registerItem = React.useCallback((element: HTMLDivElement | null, index: number) => {
    if (element) {
      items.current[index] = element
    }
  }, [])

  const handleKeyDown = React.useCallback((e: React.KeyboardEvent) => {
    const visibleItems = items.current.filter((item) => item && !item.hidden)

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setSelectedIndex((prev) => {
          const next = prev + 1
          return next >= visibleItems.length ? 0 : next
        })
        break
      case "ArrowUp":
        e.preventDefault()
        setSelectedIndex((prev) => {
          const next = prev - 1
          return next < 0 ? visibleItems.length - 1 : next
        })
        break
      case "Enter":
        e.preventDefault()
        const selectedItem = visibleItems[selectedIndex]
        if (selectedItem) {
          selectedItem.click()
        }
        break
      case "Home":
        e.preventDefault()
        setSelectedIndex(0)
        break
      case "End":
        e.preventDefault()
        setSelectedIndex(visibleItems.length - 1)
        break
    }
  }, [selectedIndex])

  React.useEffect(() => {
    setSelectedIndex(0)
  }, [search])

  return (
    <CommandContext.Provider
      value={{
        search,
        setSearch,
        selectedIndex,
        setSelectedIndex,
        items,
        registerItem,
        filter: filter || defaultFilter,
      }}
    >
      <div
        data-slot="command"
        className={cn(
          "bg-popover text-popover-foreground flex h-full w-full flex-col overflow-hidden rounded-md border border-border",
          className
        )}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {children}
      </div>
    </CommandContext.Provider>
  )
}

function CommandDialog({
  title = "Command Palette",
  description = "Search for a command to run...",
  children,
  className,
  showCloseButton = false,
  ...props
}: React.ComponentProps<typeof Dialog> & {
  title?: string
  description?: string
  className?: string
  showCloseButton?: boolean
}) {
  return (
    <Dialog {...props}>
      <DialogHeader className="sr-only">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <DialogContent
        className={cn("overflow-hidden p-0 bg-transparent border-none shadow-none max-w-[450px]", className)}
        showCloseButton={showCloseButton}
      >
        <Command className="rounded-lg border shadow-md w-full [&_[data-slot=command-input-wrapper]]:h-12 [&_[data-slot=command-input]]:h-12 [&_[data-slot=command-item]]:px-2 [&_[data-slot=command-item]]:py-3 [&_svg]:h-5 [&_svg]:w-5">
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  )
}

function CommandInput({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  const { search, setSearch } = useCommand()

  return (
    <div
      data-slot="command-input-wrapper"
      className="flex h-9 items-center gap-2 border-b border-border px-3"
    >
      <SearchIcon className="size-4 shrink-0 opacity-50" />
      <input
        data-slot="command-input"
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className={cn(
          "placeholder:text-muted-foreground flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    </div>
  )
}

function CommandList({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="command-list"
      role="listbox"
      className={cn(
        "max-h-[300px] scroll-py-1 overflow-x-hidden overflow-y-auto",
        className
      )}
      {...props}
    />
  )
}

function CommandEmpty({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { search, items } = useCommand()
  const [isEmpty, setIsEmpty] = React.useState(false)

  React.useEffect(() => {
    const checkEmpty = () => {
      const visibleItems = search.length === 0
        ? items.current.filter((item) => item)
        : items.current.filter((item) => item && !item.hidden)
      setIsEmpty(search.length > 0 && visibleItems.length === 0)
    }

    // Use a small delay to let items update their visibility
    const timeout = setTimeout(checkEmpty, 10)
    return () => clearTimeout(timeout)
  }, [search, items])

  if (!isEmpty) return null

  return (
    <div
      data-slot="command-empty"
      className={cn("py-6 text-center text-sm", className)}
      {...props}
    >
      {children || "No results found."}
    </div>
  )
}

interface CommandGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  heading?: React.ReactNode
}

function CommandGroup({
  className,
  heading,
  children,
  ...props
}: CommandGroupProps) {
  const groupRef = React.useRef<HTMLDivElement>(null)
  const { search } = useCommand()
  const [hasVisibleItems, setHasVisibleItems] = React.useState(true)

  React.useEffect(() => {
    if (search.length === 0) {
      setHasVisibleItems(true)
      return
    }

    const checkVisibility = () => {
      if (groupRef.current) {
        const items = groupRef.current.querySelectorAll('[data-slot="command-item"]')
        const visibleItems = Array.from(items).filter(
          (item) => !(item as HTMLElement).hidden
        )
        setHasVisibleItems(visibleItems.length > 0)
      }
    }

    const timeout = setTimeout(checkVisibility, 10)
    return () => clearTimeout(timeout)
  }, [search])

  return (
    <div
      ref={groupRef}
      data-slot="command-group"
      role="group"
      hidden={!hasVisibleItems}
      className={cn(
        "text-foreground overflow-hidden p-1",
        className
      )}
      {...props}
    >
      {heading && (
        <div className="text-muted-foreground px-2 py-1.5 text-xs font-medium">
          {heading}
        </div>
      )}
      {children}
    </div>
  )
}

function CommandSeparator({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="command-separator"
      role="separator"
      className={cn("bg-border -mx-1 h-px", className)}
      {...props}
    />
  )
}

interface CommandItemProps extends React.HTMLAttributes<HTMLDivElement> {
  disabled?: boolean
  value?: string
  onSelect?: (value: string) => void
  keywords?: string[]
}

const itemIndexCounter = { current: 0 }

function getTextFromChildren(children: React.ReactNode): string {
  if (typeof children === "string") return children
  if (typeof children === "number") return String(children)
  if (Array.isArray(children)) return children.map(getTextFromChildren).join(" ")
  if (React.isValidElement(children) && children.props.children) {
    return getTextFromChildren(children.props.children)
  }
  return ""
}

function CommandItem({
  className,
  disabled,
  value,
  onSelect,
  keywords = [],
  children,
  ...props
}: CommandItemProps) {
  const { search, selectedIndex, setSelectedIndex, registerItem, filter } = useCommand()
  const ref = React.useRef<HTMLDivElement>(null)
  const indexRef = React.useRef<number>(-1)

  React.useLayoutEffect(() => {
    indexRef.current = itemIndexCounter.current++
    return () => {
      itemIndexCounter.current = Math.max(0, itemIndexCounter.current - 1)
    }
  }, [])

  React.useEffect(() => {
    registerItem(ref.current, indexRef.current)
  }, [registerItem])

  const searchableText = value || getTextFromChildren(children)
  const allSearchableText = [searchableText, ...keywords].join(" ")
  const isVisible = search.length === 0 ? true : filter(allSearchableText, search)
  const isSelected = selectedIndex === indexRef.current && isVisible

  const handleSelect = () => {
    if (disabled) return
    onSelect?.(searchableText)
  }

  const handleMouseEnter = () => {
    if (!disabled) {
      setSelectedIndex(indexRef.current)
    }
  }

  return (
    <div
      ref={ref}
      data-slot="command-item"
      role="option"
      aria-selected={isSelected}
      aria-disabled={disabled}
      data-selected={isSelected}
      data-disabled={disabled}
      hidden={!isVisible}
      tabIndex={disabled ? -1 : 0}
      className={cn(
        "data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground",
        "[&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none select-none",
        "data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      onClick={handleSelect}
      onMouseEnter={handleMouseEnter}
      {...props}
    >
      {children}
    </div>
  )
}

function CommandShortcut({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      data-slot="command-shortcut"
      className={cn(
        "text-muted-foreground ml-auto text-xs tracking-widest",
        className
      )}
      {...props}
    />
  )
}

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
}
