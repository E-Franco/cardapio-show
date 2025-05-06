"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { UploadService } from "@/lib/services/upload-service"
import Image from "next/image"

interface AddImageFormProps {
  onAdd: (imageUrl: string) => void
  onCancel: () => void
}

export default function AddImageForm({ onAdd, onCancel }: AddImageFormProps) {
  const [imageUrl, setImageUrl] = useState<string>("")
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string>("")
  const { toast } = useToast()

  // Limpar o estado quando o componente é montado
  useEffect(() => {
    return () => {
      // Limpar URLs de objeto quando o componente é desmontado
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const resetForm = () => {
    // Revogar URLs de objeto existentes para evitar vazamentos de memória
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl)
    }

    setImageUrl("")
    setPreviewUrl("")
    setIsUploading(false)
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Limpar qualquer URL de preview anterior
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl)
    }

    // Validar o tipo de arquivo
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Formato de arquivo inválido",
        description: "Por favor, selecione uma imagem nos formatos JPEG, PNG, GIF ou WEBP.",
        variant: "destructive",
      })
      return
    }

    // Validar o tamanho do arquivo (5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      toast({
        title: "Arquivo muito grande",
        description: "O tamanho máximo permitido é 5MB.",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    try {
      // Criar preview local
      const localPreview = URL.createObjectURL(file)
      setPreviewUrl(localPreview)

      // Upload da imagem
      const uploadedUrl = await UploadService.uploadImage(file, "images")
      setImageUrl(uploadedUrl)

      // Verificar se o upload foi bem-sucedido
      if (uploadedUrl) {
        toast({
          title: "Imagem carregada",
          description: uploadedUrl.startsWith("blob:")
            ? "A imagem está sendo usada localmente."
            : "A imagem foi carregada com sucesso.",
        })
      } else {
        throw new Error("Falha ao obter URL da imagem")
      }
    } catch (error) {
      console.error("Error uploading image:", error)
      toast({
        title: "Erro ao fazer upload",
        description: "Não foi possível fazer o upload da imagem. Usando versão local temporária.",
        variant: "destructive",
      })

      // Usar a URL de preview local como fallback
      setImageUrl(previewUrl)
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!imageUrl && !previewUrl) {
      toast({
        title: "Imagem obrigatória",
        description: "Por favor, selecione uma imagem para continuar.",
        variant: "destructive",
      })
      return
    }

    // Se temos uma URL de imagem, usamos ela, caso contrário usamos a URL de preview
    const finalImageUrl = imageUrl || previewUrl
    onAdd(finalImageUrl)
    resetForm()
  }

  const handleCancel = () => {
    resetForm()
    onCancel()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="image" className="text-base font-medium">
            Imagem
          </Label>
          <div className="mt-1.5">
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              disabled={isUploading}
              // Importante: adicionar key para forçar a recriação do componente
              key={`image-input-${Date.now()}`}
            />
            {isUploading && (
              <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Fazendo upload da imagem...</span>
              </div>
            )}
          </div>
        </div>

        {previewUrl && (
          <div className="mt-4">
            <Label className="text-base font-medium mb-2 block">Preview</Label>
            <div className="relative h-48 w-full border rounded-md overflow-hidden bg-slate-50">
              {previewUrl.startsWith("blob:") ? (
                <img src={previewUrl || "/placeholder.svg"} alt="Preview" className="object-contain w-full h-full" />
              ) : (
                <Image
                  src={previewUrl || "/placeholder.svg"}
                  alt="Preview"
                  fill
                  className="object-contain"
                  unoptimized={previewUrl.startsWith("blob:")}
                />
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={handleCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isUploading} className="bg-[#E5324B] hover:bg-[#d02a41]">
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Carregando...
            </>
          ) : (
            "Adicionar Imagem"
          )}
        </Button>
      </div>
    </form>
  )
}
