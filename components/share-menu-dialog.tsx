"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Share2, Copy, Check, QrCode } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import QRCode from "qrcode.react"
import { useErrorHandler } from "@/hooks/use-error-handler"

interface ShareMenuDialogProps {
  menuId: string
  menuName: string
}

export default function ShareMenuDialog({ menuId, menuName }: ShareMenuDialogProps) {
  const { toast } = useToast()
  const { handleError } = useErrorHandler()
  const [copied, setCopied] = useState(false)
  const [showQRCode, setShowQRCode] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  // Gerar URL do cardápio - usando uma função para garantir que seja calculada apenas quando necessário
  const getMenuUrl = useCallback(() => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/cardapio/${menuId}`
    }
    return `/cardapio/${menuId}`
  }, [menuId])

  const handleCopyLink = async () => {
    try {
      const url = getMenuUrl()
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast({
        title: "Link copiado!",
        description: "O link do cardápio foi copiado para a área de transferência.",
      })

      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      handleError(error, {
        title: "Erro ao copiar",
        message: "Não foi possível copiar o link. Tente copiar manualmente.",
      })
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        const url = getMenuUrl()
        await navigator.share({
          title: `Cardápio: ${menuName}`,
          text: `Confira o cardápio "${menuName}"`,
          url,
        })

        toast({
          title: "Compartilhado!",
          description: "O link do cardápio foi compartilhado com sucesso.",
        })
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          handleError(error, {
            title: "Erro ao compartilhar",
            message: "Não foi possível compartilhar o cardápio.",
          })
        }
      }
    } else {
      handleCopyLink()
    }
  }

  const toggleQRCode = () => {
    setShowQRCode(!showQRCode)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex-1 md:flex-none">
          <Share2 className="mr-2 h-4 w-4" />
          Compartilhar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Compartilhar Cardápio</DialogTitle>
          <DialogDescription>Compartilhe o link do seu cardápio com seus clientes.</DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2 mt-4">
          <div className="grid flex-1 gap-2">
            <Label htmlFor="link" className="sr-only">
              Link
            </Label>
            <Input id="link" value={getMenuUrl()} readOnly className="font-mono text-sm" />
          </div>
          <Button type="button" size="sm" className="px-3" onClick={handleCopyLink}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            <span className="sr-only">Copiar</span>
          </Button>
        </div>

        <div className="flex flex-col items-center mt-4">
          <Button type="button" variant="outline" onClick={toggleQRCode} className="mb-4">
            <QrCode className="mr-2 h-4 w-4" />
            {showQRCode ? "Ocultar QR Code" : "Mostrar QR Code"}
          </Button>

          {showQRCode && (
            <div className="p-4 bg-white rounded-lg border">
              <QRCode value={getMenuUrl()} size={200} />
              <p className="text-center text-sm mt-2">Escaneie para acessar o cardápio</p>
            </div>
          )}
        </div>

        <DialogFooter className="sm:justify-between mt-4">
          <DialogDescription className="text-xs text-muted-foreground">
            O link é público e pode ser acessado por qualquer pessoa.
          </DialogDescription>
          <Button type="button" onClick={handleShare}>
            <Share2 className="mr-2 h-4 w-4" />
            Compartilhar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
