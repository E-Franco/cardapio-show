"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2, ExternalLink, X } from "lucide-react"

interface ExternalLinkModalProps {
  isOpen: boolean
  onClose: () => void
  url: string | null
  title?: string
}

export function ExternalLinkModal({ isOpen, onClose, url, title = "Conteúdo externo" }: ExternalLinkModalProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  // Reset loading state when URL changes
  useEffect(() => {
    if (isOpen && url) {
      setLoading(true)
      setError(false)
    }
  }, [isOpen, url])

  // Formatar URL se necessário
  const formattedUrl = url && !url.startsWith("http") ? `https://${url}` : url

  const handleIframeLoad = () => {
    setLoading(false)
  }

  const handleIframeError = () => {
    setLoading(false)
    setError(true)
  }

  const openInNewTab = () => {
    if (formattedUrl) {
      window.open(formattedUrl, "_blank", "noopener,noreferrer")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[90vw] max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-4 border-b flex flex-row items-center justify-between">
          <DialogTitle className="mr-8">{title}</DialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="relative flex-1 min-h-[60vh] overflow-hidden">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span>Carregando conteúdo...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background z-10 p-4">
              <div className="max-w-md text-center">
                <div className="bg-red-50 text-red-500 rounded-full h-12 w-12 flex items-center justify-center mx-auto mb-4">
                  <X className="h-6 w-6" />
                </div>
                <h3 className="font-medium text-lg mb-2">Não foi possível carregar o conteúdo</h3>
                <p className="text-muted-foreground mb-6">
                  O site pode não permitir ser exibido em um iframe ou pode estar indisponível.
                </p>
                <Button onClick={openInNewTab} className="w-full">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Abrir em nova aba
                </Button>
              </div>
            </div>
          )}

          {formattedUrl && (
            <iframe
              src={formattedUrl}
              className="w-full h-full border-0"
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              referrerPolicy="no-referrer"
              title={title}
            />
          )}
        </div>

        <div className="flex justify-between p-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
          <Button onClick={openInNewTab} className="flex items-center gap-2">
            <ExternalLink size={16} />
            Abrir em nova aba
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
