"use client"

import { useState } from "react"
import {
  CalendarIcon,
  MailIcon,
  RocketIcon,
  SettingsIcon,
  SmileIcon,
  UserIcon,
} from "lucide-react"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import { Button } from "@/components/ui/button"

const Home: React.FC = () => {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-screen gap-8 p-8">
      <h1 className="text-4xl font-bold font-heading text-black text-center">
        Command Component Example
      </h1>

      <Button onClick={() => setOpen(true)}>
        Open Command Palette
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen} showCloseButton={false}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem onSelect={() => { console.log("Calendar selected"); setOpen(false) }}>
              <CalendarIcon />
              <span>Calendar</span>
            </CommandItem>
            <CommandItem onSelect={() => { console.log("Search Emoji selected"); setOpen(false) }}>
              <SmileIcon />
              <span>Search Emoji</span>
            </CommandItem>
            <CommandItem onSelect={() => { console.log("Launch selected"); setOpen(false) }}>
              <RocketIcon />
              <span>Launch</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Settings">
            <CommandItem onSelect={() => { console.log("Profile selected"); setOpen(false) }}>
              <UserIcon />
              <span>Profile</span>
              <CommandShortcut>⌘P</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => { console.log("Mail selected"); setOpen(false) }}>
              <MailIcon />
              <span>Mail</span>
              <CommandShortcut>⌘B</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => { console.log("Settings selected"); setOpen(false) }}>
              <SettingsIcon />
              <span>Settings</span>
              <CommandShortcut>⌘S</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  )
}

export default Home