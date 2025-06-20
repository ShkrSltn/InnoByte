import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { CheckIcon, ChevronDownIcon, XIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface MultiSelectProps {
  options: string[]
  selectedValues: string[]
  onValueChange: (values: string[]) => void
  placeholder?: string
  className?: string
  triggerClassName?: string
  contentClassName?: string
}

export const MultiSelectDropdown = ({
  options,
  selectedValues = [],
  onValueChange,
  placeholder = "Select options...",
  className,
  triggerClassName,
  contentClassName,
}: MultiSelectProps) => {
  const handleSelect = (value: string) => {
    const newValues = selectedValues.includes(value)
      ? selectedValues.filter(v => v !== value)
      : [...selectedValues, value]
    onValueChange(newValues)
  }

  const removeItem = (value: string) => {
    onValueChange(selectedValues.filter(v => v !== value))
  }

  return (
    <div className={cn("relative z-10", className)}>
      <DropdownMenuPrimitive.Root>
        <DropdownMenuPrimitive.Trigger asChild>
          <button
            className={cn(
              "flex items-center justify-between w-full px-3 py-2 text-sm border rounded-md bg-background hover:bg-accent",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
              "cursor-pointer",
              triggerClassName
            )}
          >
    <span className="truncate">
      {selectedValues.length > 0
          ? selectedValues.join(", ")
          : placeholder}
    </span>
            <ChevronDownIcon className="w-5 h-5 ml-2 opacity-50" />
          </button>
        </DropdownMenuPrimitive.Trigger>


        <DropdownMenuPrimitive.Portal>
          <DropdownMenuPrimitive.Content
            className={cn(
              "bg-popover text-popover-foreground min-w-[200px] max-h-[300px] overflow-auto rounded-md border shadow-lg",
              "z-50",
              "backdrop-blur-sm bg-opacity-95",
              contentClassName
            )}
            sideOffset={5}
            align="start"
            avoidCollisions={true}
          >
            {selectedValues.length > 0 && (
              <div className="p-2 border-b bg-popover/95">
                <div className="flex flex-wrap gap-1">
                  {selectedValues.map(value => (
                    <div
                      key={value}
                      className="flex items-center px-2 py-1 text-xs rounded-full bg-accent"
                    >
                      <span>{value}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          removeItem(value)
                        }}
                        className={cn(
                          "ml-1 rounded-full hover:bg-accent/50 focus:outline-none focus:ring-1 focus:ring-ring",
                          "cursor-pointer"
                        )}
                      >
                        <XIcon className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="p-1 bg-popover/95">
              {options.map(option => (
                  <DropdownMenuPrimitive.CheckboxItem
                      key={option}
                      checked={selectedValues.includes(option)}
                      onSelect={(e) => {
                        e.preventDefault()
                        handleSelect(option)
                      }}
                      className={cn(
                          "relative flex cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm font-medium transition-colors duration-200",
                          selectedValues.includes(option)
                              ? "text-red-600"
                              : "text-gray-800",
                          "hover:bg-gray-100",
                          "focus:outline-none focus:ring-1 focus:ring-red-500"
                      )}
                  >
                    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                      {selectedValues.includes(option) && (
                          <CheckIcon className="h-4 w-4 text-red-600" />
                      )}
                    </span>
                    {option}
                  </DropdownMenuPrimitive.CheckboxItem>

              ))}
            </div>
          </DropdownMenuPrimitive.Content>
        </DropdownMenuPrimitive.Portal>
      </DropdownMenuPrimitive.Root>
    </div>
  )
}