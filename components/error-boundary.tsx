"use client"

import { Component, type ErrorInfo, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
}

/**
 * Componente de limite de erro
 *
 * Captura erros em componentes filhos e exibe uma UI de fallback
 * para evitar que a aplicação quebre completamente.
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Erro capturado pelo ErrorBoundary:", error)

    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-[400px] flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Algo deu errado</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            Ocorreu um erro inesperado. Tente recarregar a página ou voltar para a página inicial.
          </p>
          <div className="flex gap-4">
            <Button variant="outline" onClick={this.handleReset}>
              Tentar novamente
            </Button>
            <Button className="bg-[#E5324B] hover:bg-[#d02a41]" onClick={() => (window.location.href = "/")}>
              Voltar para o início
            </Button>
          </div>
          {this.state.error && process.env.NODE_ENV === "development" && (
            <div className="mt-6 p-4 bg-slate-100 rounded-md text-left overflow-auto max-w-full">
              <p className="font-mono text-sm text-red-600 mb-2">{this.state.error.toString()}</p>
              <details>
                <summary className="cursor-pointer text-sm text-slate-500 mb-2">Detalhes técnicos</summary>
                <pre className="text-xs text-slate-700 whitespace-pre-wrap">{this.state.error.stack}</pre>
              </details>
            </div>
          )}
        </div>
      )
    }

    return this.props.children
  }
}
