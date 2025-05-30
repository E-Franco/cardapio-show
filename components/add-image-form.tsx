"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface AddImageFormProps {
  onAdd: (imageFile: File | null, previewUrl: string) => void
  onCancel: () => void
}

export default function AddImageForm({ onAdd, onCancel }: AddImageFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const isMounted = useRef(true)

  // Limpar o estado quando o componente é montado/desmontado
  useEffect(() => {
    isMounted.current = true

    return () => {
      // Limpar URLs de objeto quando o componente é desmontado
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl)
      }
      isMounted.current = false
    }
  }, [previewUrl])

  const resetForm = () => {
    // Revogar URLs de objeto existentes para evitar vazamentos de memória
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl)
    }

    setSelectedFile(null)
    setPreviewUrl("")
    setIsLoading(false)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    // Criar preview local imediatamente
    const localPreview = URL.createObjectURL(file)
    setPreviewUrl(localPreview)
    setSelectedFile(file)

    toast({
      title: "Imagem selecionada",
      description: "A imagem será enviada quando você salvar o formulário.",
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Se não temos nem arquivo nem previewUrl, mostrar erro
    if (!selectedFile && !previewUrl) {
      toast({
        title: "Imagem obrigatória",
        description: "Por favor, selecione uma imagem para continuar.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    // Passar o arquivo e a URL de preview para o componente pai
    onAdd(selectedFile, previewUrl)

    // Não resetamos o formulário aqui, pois o componente pai vai lidar com isso
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
              disabled={isLoading}
              // Importante: adicionar key para forçar a recriação do componente
              key={`image-input-${Date.now()}`}
            />
          </div>
        </div>

        {previewUrl && (
          <div className="mt-4">
            <Label className="text-base font-medium mb-2 block">Preview</Label>
            <div className="relative h-48 w-full border rounded-md overflow-hidden bg-slate-50">
              <img src={previewUrl || "/placeholder.svg"} alt="Preview" className="object-contain w-full h-full" />
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={handleCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading} className="bg-[#E5324B] hover:bg-[#d02a41]">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Adicionando...
            </>
          ) : (
            "Adicionar Imagem"
          )}
        </Button>
      </div>
    </form>
  )
}
