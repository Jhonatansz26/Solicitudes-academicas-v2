import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/shared/lib/utils"

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "bg-destructive text-white focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:focus-visible:ring-destructive/40 [a&]:hover:bg-destructive/90",
        outline:
          "border-border text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        ghost: "[a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        link: "text-primary underline-offset-4 [a&]:hover:underline",
        // Status variants
        "status-submitted": "bg-info-soft text-info border border-info/20",
        "status-in-review": "bg-warning-soft text-warning border border-warning/20",
        "status-approved": "bg-success-soft text-success border border-success/20",
        "status-rejected": "bg-danger-soft text-danger border border-danger/20",
        "status-draft": "bg-surface-hover text-muted-foreground border border-border",
        "status-cancelled": "bg-surface-hover text-muted-foreground border border-border",
        // Role variants
        "role-admin": "bg-navy-50 text-navy-800 border border-navy-200 dark:bg-navy-900/50 dark:text-navy-200 dark:border-navy-700",
        "role-student": "bg-info-soft text-info border border-info/20",
        "role-staff": "bg-warning-soft text-warning border border-warning/20",
        "role-coordinator": "bg-purple-50 text-purple-600 border border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800",
        // Priority variants
        "priority-high": "bg-danger-soft text-danger border border-danger/20",
        "priority-medium": "bg-warning-soft text-warning border border-warning/20",
        "priority-low": "bg-surface-hover text-muted-foreground border border-border",
        "priority-urgent": "bg-red-950 text-red-300 border border-red-800",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
