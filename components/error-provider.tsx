"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Notification } from "@/components/ui/notification"
import { Button } from "@/components/ui/button"
import type { ErrorSeverity } from "@/hooks/use-error-handler"

type ErrorContextType = {
  captureError: (
    error: unknown,
    options?: {
      title?: string
      description?: string
      severity?: ErrorSeverity
      action?: {
        label: string
        onClick: () => void
      }
    },
  ) => void
  captureMessage: (
    message: string,
    options?: {
      title?: string
      severity?: ErrorSeverity
      action?: {
        label: string
        onClick: () => void
      }
    },
  ) => void
  clearErrors: () => void
}

const ErrorContext = createContext<ErrorContextType | null>(null)

export function useErrorContext() {
  const context = useContext(ErrorContext)
  if (!context) {
    throw new Error("useErrorContext must be used within an ErrorProvider")
  }
  return context
}

export function ErrorProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast()
  const [errors, setErrors] = useState<
    Array<{
      id: string
      error: unknown
      options?: {
        title?: string
        description?: string
        severity?: ErrorSeverity
        action?: {
          label: string
          onClick: () => void
        }
      }
    }>
  >([])

  const captureError = useCallback(
    (
      error: unknown,
      options?: {
        title?: string
        description?: string
        severity?: ErrorSeverity
        action?: {
          label: string
          onClick: () => void
        }
      },
    ) => {
      console.error("Error captured:", error)

      const errorId = Date.now().toString()
      setErrors((prev) => [...prev, { id: errorId, error, options }])

      // Extrair mensagem de erro
      let errorMessage = "Ocorreu um erro desconhecido"
      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === "string") {
        errorMessage = error
      } else if (error && typeof error === "object") {
        try {
          errorMessage = JSON.stringify(error)
        } catch (e) {
          errorMessage = "Erro não serializável"
        }
      }

      // Determinar variante com base na severidade
      let variant: "default" | "destructive" | "success" | "warning" | "info" = "default"
      switch (options?.severity) {
        case "error":
          variant = "destructive"
          break
        case "success":
          variant = "success"
          break
        case "warning":
          variant = "warning"
          break
        case "info":
          variant = "info"
          break
      }

      // Determinar título com base na severidade
      let title = options?.title
      if (!title) {
        switch (options?.severity) {
          case "warning":
            title = "Atenção"
            break
          case "info":
            title = "Informação"
            break
          case "success":
            title = "Sucesso"
            break
          default:
            title = "Erro"
        }
      }

      // Criar ação para tentar novamente, se aplicável
      const action = options?.action ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            options.action?.onClick()
            toast.dismiss(errorId)
          }}
        >
          {options.action.label}
        </Button>
      ) : undefined

      // Exibir notificação
      toast({
        id: errorId,
        title: title,
        description: options?.description || errorMessage,
        action,
        duration: 5000,
        asChild: true,
        className: "p-0",
        children: (
          <Notification
            variant={variant}
            title={title}
            description={options?.description || errorMessage}
            action={action}
          />
        ),
      })

      return errorId
    },
    [toast],
  )

  const captureMessage = useCallback(
    (
      message: string,
      options?: {
        title?: string
        severity?: ErrorSeverity
        action?: {
          label: string
          onClick: () => void
        }
      },
    ) => {
      return captureError(message, {
        ...options,
        description: message,
      })
    },
    [captureError],
  )

  const clearErrors = useCallback(() => {
    setErrors([])
  }, [])

  return <ErrorContext.Provider value={{ captureError, captureMessage, clearErrors }}>{children}</ErrorContext.Provider>
}
