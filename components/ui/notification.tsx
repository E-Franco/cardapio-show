"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { AlertCircle, CheckCircle2, Info, XCircle, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"

const notificationVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-4 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full",
  {
    variants: {
      variant: {
        default: "border bg-background text-foreground",
        destructive: "destructive group border-destructive bg-destructive text-destructive-foreground",
        success: "border-green-500 bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-50",
        warning: "border-yellow-500 bg-yellow-50 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-50",
        info: "border-blue-500 bg-blue-50 text-blue-800 dark:bg-blue-900 dark:text-blue-50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

export interface NotificationProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof notificationVariants> {
  title?: string
  description?: string
  action?: React.ReactNode
  onClose?: () => void
}

export function Notification({
  className,
  variant = "default",
  title,
  description,
  action,
  onClose,
  ...props
}: NotificationProps) {
  const { dismiss } = useToast()

  // Determinar ícone com base na variante
  const Icon = React.useMemo(() => {
    switch (variant) {
      case "destructive":
        return XCircle
      case "success":
        return CheckCircle2
      case "warning":
        return AlertCircle
      case "info":
        return Info
      default:
        return null
    }
  }, [variant])

  return (
    <div className={cn(notificationVariants({ variant }), className)} {...props}>
      <div className="flex items-start gap-3 w-full">
        {Icon && (
          <div className="shrink-0 mt-0.5">
            <Icon className="h-5 w-5" />
          </div>
        )}
        <div className="grid gap-1 flex-1">
          {title && <div className="text-sm font-semibold">{title}</div>}
          {description && <div className="text-sm opacity-90">{description}</div>}
          {action && <div className="mt-2">{action}</div>}
        </div>
      </div>
      <button
        onClick={() => {
          if (onClose) {
            onClose()
          } else {
            dismiss()
          }
        }}
        className="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100"
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Fechar</span>
      </button>
    </div>
  )
}
