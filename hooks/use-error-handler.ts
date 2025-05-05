"use client"

import { useState, useCallback } from "react"
import { useToast } from "@/components/ui/use-toast"

export type ErrorSeverity = "error" | "warning" | "info" | "success"

export type ErrorOptions = {
  title?: string
  description?: string
  severity?: ErrorSeverity
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

export type ErrorHandler = {
  handleError: (error: unknown, options?: ErrorOptions) => void
  handleSuccess: (message: string, title?: string) => void
  handleWarning: (message: string, title?: string) => void
  handleInfo: (message: string, title?: string) => void
  clearErrors: () => void
  errors: Array<{
    id: string
    message: string
    severity: ErrorSeverity
    timestamp: Date
  }>
}

/**
 * Hook para gerenciar erros na aplicação
 *
 * Fornece funções para exibir mensagens de erro, sucesso, aviso e informação,
 * além de manter um histórico de erros.
 */
export function useErrorHandler(): ErrorHandler {
  const { toast } = useToast()
  const [errors, setErrors] = useState<
    Array<{
      id: string
      message: string
      severity: ErrorSeverity
      timestamp: Date
    }>
  >([])

  /**
   * Processa e exibe um erro
   */
  const handleError = useCallback(
    (error: unknown, options?: ErrorOptions) => {
      // Extrair mensagem de erro com base no tipo
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

      // Adicionar erro ao estado
      const newError = {
        id: Date.now().toString(),
        message: errorMessage,
        severity: options?.severity || "error",
        timestamp: new Date(),
      }

      setErrors((prev) => [...prev, newError])

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

      // Determinar variante do toast com base na severidade
      let variant: "default" | "destructive" = "default"
      if (options?.severity === "error") {
        variant = "destructive"
      }

      // Exibir toast
      toast({
        title,
        description: options?.description || errorMessage,
        variant,
        duration: options?.duration || 5000,
        action: options?.action
          ? {
              label: options.action.label,
              onClick: options.action.onClick,
            }
          : undefined,
      })

      return newError.id
    },
    [toast],
  )

  /**
   * Exibe uma mensagem de sucesso
   */
  const handleSuccess = useCallback(
    (message: string, title?: string) => {
      handleError(message, {
        severity: "success",
        title: title || "Sucesso",
      })
    },
    [handleError],
  )

  /**
   * Exibe uma mensagem de aviso
   */
  const handleWarning = useCallback(
    (message: string, title?: string) => {
      handleError(message, {
        severity: "warning",
        title: title || "Atenção",
      })
    },
    [handleError],
  )

  /**
   * Exibe uma mensagem informativa
   */
  const handleInfo = useCallback(
    (message: string, title?: string) => {
      handleError(message, {
        severity: "info",
        title: title || "Informação",
      })
    },
    [handleError],
  )

  /**
   * Limpa o histórico de erros
   */
  const clearErrors = useCallback(() => {
    setErrors([])
  }, [])

  return {
    handleError,
    handleSuccess,
    handleWarning,
    handleInfo,
    clearErrors,
    errors,
  }
}
