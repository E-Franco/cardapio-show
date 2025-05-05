"use client"

import { useEffect } from "react"
import { useErrorContext } from "./error-provider"

/**
 * Componente para interceptar e tratar erros de API
 *
 * Intercepta erros de fetch e erros não tratados para
 * fornecer feedback consistente ao usuário.
 */
export function ApiErrorHandler() {
  const { captureError } = useErrorContext()

  useEffect(() => {
    // Armazenar a função fetch original
    const originalFetch = window.fetch

    // Interceptar chamadas fetch
    window.fetch = async function (...args) {
      try {
        const response = await originalFetch.apply(this, args)

        // Verificar se a resposta é um erro HTTP
        if (!response.ok) {
          await handleErrorResponse(response)
        }

        return response
      } catch (error) {
        // Capturar erros de rede
        captureError(error, {
          title: "Erro de conexão",
          description: "Não foi possível conectar ao servidor. Verifique sua conexão com a internet.",
          severity: "error",
          action: {
            label: "Tentar novamente",
            onClick: () => {
              window.location.reload()
            },
          },
        })
        throw error
      }
    }

    /**
     * Processa respostas de erro HTTP
     */
    const handleErrorResponse = async (response: Response) => {
      try {
        const contentType = response.headers.get("content-type")

        if (contentType && contentType.includes("application/json")) {
          // Processar erro JSON
          const errorData = await response.clone().json()

          captureError(new Error(`Erro na requisição: ${response.status} ${response.statusText}`), {
            title: getErrorTitle(response.status),
            description: errorData.message || errorData.error || `Erro ${response.status}: ${response.statusText}`,
            severity: getErrorSeverity(response.status),
            action: shouldRetry(response.status)
              ? {
                  label: "Tentar novamente",
                  onClick: () => window.location.reload(),
                }
              : undefined,
          })
        } else {
          // Processar erro de texto
          const errorText = await response.clone().text()

          captureError(new Error(`Erro na requisição: ${response.status} ${response.statusText}`), {
            title: getErrorTitle(response.status),
            description: errorText || `Erro ${response.status}: ${response.statusText}`,
            severity: getErrorSeverity(response.status),
          })
        }
      } catch (parseError) {
        // Se não conseguir extrair detalhes, usar mensagem genérica
        captureError(new Error(`Erro na requisição: ${response.status} ${response.statusText}`), {
          title: getErrorTitle(response.status),
          severity: getErrorSeverity(response.status),
        })
      }
    }

    /**
     * Determina o título do erro com base no código de status
     */
    const getErrorTitle = (status: number): string => {
      if (status === 401 || status === 403) return "Acesso negado"
      if (status === 404) return "Recurso não encontrado"
      if (status === 429) return "Muitas requisições"
      if (status >= 500) return "Erro no servidor"
      return "Erro na comunicação com o servidor"
    }

    /**
     * Determina a severidade do erro com base no código de status
     */
    const getErrorSeverity = (status: number): "error" | "warning" | "info" => {
      if (status === 429) return "warning"
      if (status === 404) return "info"
      return "error"
    }

    /**
     * Determina se deve mostrar botão de retry com base no código de status
     */
    const shouldRetry = (status: number): boolean => {
      return status !== 401 && status !== 403 && status !== 404
    }

    // Interceptar erros não tratados
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      event.preventDefault()
      captureError(event.reason, {
        title: "Erro não tratado",
        severity: "error",
      })
    }

    const handleError = (event: ErrorEvent) => {
      event.preventDefault()
      captureError(event.error || new Error(event.message), {
        title: "Erro não tratado",
        severity: "error",
      })
    }

    window.addEventListener("unhandledrejection", handleUnhandledRejection)
    window.addEventListener("error", handleError)

    return () => {
      // Restaurar comportamento original ao desmontar
      window.fetch = originalFetch
      window.removeEventListener("unhandledrejection", handleUnhandledRejection)
      window.removeEventListener("error", handleError)
    }
  }, [captureError])

  return null
}
