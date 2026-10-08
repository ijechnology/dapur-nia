import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 rounded-xl text-sm font-semibold transition-colors outline-none select-none disabled:pointer-events-none disabled:opacity-50 cursor-pointer shadow-xs",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
        outline: "border border-border bg-card hover:bg-muted text-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-muted text-foreground hover:text-foreground shadow-none",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        link: "text-primary underline-offset-4 hover:underline shadow-none",
      },
      size: {
        default: "h-9 px-4 py-2",
        xs: "h-7 px-2.5 text-xs rounded-lg",
        sm: "h-8 px-3 text-xs rounded-lg",
        lg: "h-10 px-5 text-base rounded-xl",
        icon: "h-9 w-9 p-0",
        "icon-xs": "h-6 w-6 p-0 rounded-md",
        "icon-sm": "h-8 w-8 p-0 rounded-lg",
        "icon-lg": "h-10 w-10 p-0 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
