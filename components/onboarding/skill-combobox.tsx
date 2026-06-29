"use client"

import { useState } from "react"
import { Check, ChevronsUpDown, Plus, X } from "lucide-react"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { SKILL_CATEGORIES } from "@/lib/types"

export function SkillCombobox({
  selected,
  onToggle,
  onAddCustom,
}: {
  selected: string[]
  onToggle: (skill: string) => void
  onAddCustom: (skill: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")

  const allSkills = SKILL_CATEGORIES.flatMap((c) => c.skills)
  const trimmed = search.trim()
  const isNew =
    trimmed.length > 0 &&
    !allSkills.some((s) => s.toLowerCase() === trimmed.toLowerCase()) &&
    !selected.some((s) => s.toLowerCase() === trimmed.toLowerCase())

  return (
    <div className="space-y-4">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              variant="outline"
              aria-expanded={open}
              className="h-12 w-full justify-between text-base font-normal"
            >
              <span className="text-muted-foreground">
                {selected.length > 0
                  ? `${selected.length} selected`
                  : "Search freelance work…"}
              </span>
              <ChevronsUpDown className="size-4 opacity-50" />
            </Button>
          }
        />
        <PopoverContent
          className="w-[var(--anchor-width)] p-0"
          align="start"
        >
          <Command
            filter={(value, search) =>
              value.toLowerCase().includes(search.toLowerCase()) ? 1 : 0
            }
          >
            <CommandInput
              placeholder="Search or type your own…"
              value={search}
              onValueChange={setSearch}
            />
            <CommandList className="max-h-72">
              <CommandEmpty>No matches. Type to add your own.</CommandEmpty>
              {isNew && (
                <CommandGroup heading="Add your own">
                  <CommandItem
                    value={trimmed}
                    onSelect={() => {
                      onAddCustom(trimmed)
                      setSearch("")
                    }}
                  >
                    <Plus className="size-4" />
                    Add &ldquo;{trimmed}&rdquo;
                  </CommandItem>
                </CommandGroup>
              )}
              {SKILL_CATEGORIES.map((group) => (
                <CommandGroup key={group.category} heading={group.category}>
                  {group.skills.map((skill) => {
                    const active = selected.includes(skill)
                    return (
                      <CommandItem
                        key={skill}
                        value={skill}
                        onSelect={() => onToggle(skill)}
                      >
                        <Check
                          className={cn(
                            "size-4",
                            active ? "opacity-100" : "opacity-0",
                          )}
                        />
                        {skill}
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map((skill) => (
            <button
              key={skill}
              type="button"
              onClick={() => onToggle(skill)}
              className="group flex items-center gap-1.5 rounded-full border border-primary bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground"
            >
              {skill}
              <X className="size-3.5 opacity-70 transition-opacity group-hover:opacity-100" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
