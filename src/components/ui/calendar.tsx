import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker, getDefaultClassNames } from "react-day-picker"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-2 bg-card rounded-2xl select-none", defaultClassNames.root, className)}
      classNames={{
        months: cn("flex flex-col sm:flex-row gap-3", defaultClassNames.months),
        month: cn("space-y-3", defaultClassNames.month),
        month_caption: cn(
          "flex justify-center pt-1 relative items-center text-xs font-bold text-foreground mb-2",
          defaultClassNames.month_caption
        ),
        caption_label: cn("text-xs font-bold text-foreground", defaultClassNames.caption_label),
        nav: cn("space-x-1 flex items-center", defaultClassNames.nav),
        button_previous: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100 rounded-lg cursor-pointer absolute left-1",
          defaultClassNames.button_previous
        ),
        button_next: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100 rounded-lg cursor-pointer absolute right-1",
          defaultClassNames.button_next
        ),
        month_grid: cn("w-full border-collapse space-y-1", defaultClassNames.month_grid),
        weekdays: cn("flex justify-center", defaultClassNames.weekdays),
        weekday: cn(
          "text-muted-foreground rounded-md w-8 font-medium text-[0.75rem] text-center",
          defaultClassNames.weekday
        ),
        week: cn("flex w-full mt-1.5 justify-center", defaultClassNames.week),
        day: cn(
          "relative p-0 text-center text-xs focus-within:relative focus-within:z-20",
          defaultClassNames.day
        ),
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-8 w-8 p-0 font-normal rounded-xl cursor-pointer text-foreground hover:bg-primary/15 hover:text-primary transition text-xs flex items-center justify-center",
          defaultClassNames.day_button
        ),
        selected: cn(
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground font-semibold shadow-xs rounded-xl",
          defaultClassNames.selected
        ),
        today: cn(
          "bg-muted text-foreground font-bold border border-border rounded-xl",
          defaultClassNames.today
        ),
        outside: cn("text-muted-foreground/40 opacity-50", defaultClassNames.outside),
        disabled: cn("text-muted-foreground/30 opacity-40 cursor-not-allowed", defaultClassNames.disabled),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === "left" ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          ),
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
