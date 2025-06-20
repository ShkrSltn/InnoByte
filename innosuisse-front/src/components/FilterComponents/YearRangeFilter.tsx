import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDownIcon, CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface YearRangeFilterProps {
    yearRange: [number, number];
    setYearRange: (value: [number, number]) => void;
    availableYears: number[];
    className?: string;
}

export const YearRangeFilter = ({
                                    yearRange,
                                    setYearRange,
                                    availableYears,
                                    className,
                                }: YearRangeFilterProps) => {
    const handleFromChange = (val: number) => {
        setYearRange([val, Math.max(val, yearRange[1])]);
    };

    const handleToChange = (val: number) => {
        setYearRange([Math.min(val, yearRange[0]), val]);
    };

    const sharedButtonStyle = cn(
        "flex items-center justify-between w-[120px] px-4 py-2 text-base font-semibold rounded-md shadow-sm bg-white text-gray-800",
        "hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors cursor-pointer"
    );

    const sharedContentStyle = cn(
        "bg-white text-sm min-w-[120px] max-h-[250px] overflow-auto rounded-md border shadow-lg z-50",
        "backdrop-blur-sm bg-opacity-95"
    );

    const sharedItemStyle = (selected: boolean) =>
        cn(
            "relative flex cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm font-medium",
            selected ? "text-red-600" : "text-gray-800",
            "hover:bg-gray-100 transition-colors"
        );

    return (
        <div className={cn("flex items-center gap-2 font-sans", className)}>
            <span className="text-base font-semibold text-gray-800">during</span>

            <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                    <button className={sharedButtonStyle}>
                        {yearRange[0]}
                        <ChevronDownIcon className="w-4 h-4 opacity-50 ml-2" />
                    </button>
                </DropdownMenu.Trigger>

                <DropdownMenu.Portal>
                    <DropdownMenu.Content
                        className={sharedContentStyle}
                        sideOffset={5}
                        align="start"
                    >
                        <div className="p-1">
                            {availableYears
                                .filter((y) => y <= yearRange[1])
                                .map((y) => (
                                    <DropdownMenu.CheckboxItem
                                        key={y}
                                        checked={yearRange[0] === y}
                                        onSelect={(e) => {
                                            e.preventDefault();
                                            handleFromChange(y);
                                        }}
                                        className={sharedItemStyle(yearRange[0] === y)}
                                    >
                    <span className="absolute left-2 flex items-center justify-center w-4 h-4">
                      {yearRange[0] === y && <CheckIcon className="w-4 h-4 text-red-600" />}
                    </span>
                                        {y}
                                    </DropdownMenu.CheckboxItem>
                                ))}
                        </div>
                    </DropdownMenu.Content>
                </DropdownMenu.Portal>
            </DropdownMenu.Root>

            <span className="text-base font-semibold text-gray-800">to</span>

            <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                    <button className={sharedButtonStyle}>
                        {yearRange[1]}
                        <ChevronDownIcon className="w-4 h-4 opacity-50 ml-2" />
                    </button>
                </DropdownMenu.Trigger>

                <DropdownMenu.Portal>
                    <DropdownMenu.Content
                        className={sharedContentStyle}
                        sideOffset={5}
                        align="start"
                    >
                        <div className="p-1">
                            {availableYears
                                .filter((y) => y >= yearRange[0])
                                .map((y) => (
                                    <DropdownMenu.CheckboxItem
                                        key={y}
                                        checked={yearRange[1] === y}
                                        onSelect={(e) => {
                                            e.preventDefault();
                                            handleToChange(y);
                                        }}
                                        className={sharedItemStyle(yearRange[1] === y)}
                                    >
                    <span className="absolute left-2 flex items-center justify-center w-4 h-4">
                      {yearRange[1] === y && <CheckIcon className="w-4 h-4 text-red-600" />}
                    </span>
                                        {y}
                                    </DropdownMenu.CheckboxItem>
                                ))}
                        </div>
                    </DropdownMenu.Content>
                </DropdownMenu.Portal>
            </DropdownMenu.Root>
        </div>
    );
};
