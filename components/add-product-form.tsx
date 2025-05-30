"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, ImageIcon, LinkIcon, Trash2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import type { Product } from "@/lib/services/menu-service"

interface AddProductFormProps {
  onAdd: (product: Omit<Product, "id" | "menuId" | "orderIndex"> & { imageFile?: File }) => void
  onCancel: () => void
  initialProduct?: Product
  isEdit?: boolean
}

export default function AddProductForm({ onAdd, onCancel, initialProduct, isEdit = false }: AddProductFormProps) {
  const [name, setName] = useState(initialProduct?.name || "")
  const [description, setDescription] = useState(initialProduct?.description || "")
  const [price, setPrice] = useState<string>(initialProduct?.price ? String(initialProduct.price) : "")
  const [externalLink, setExternalLink] = useState(initialProduct?.externalLink || "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>(initialProduct?.imageUrl || "")
  const { toast } = useToast()
  const isMounted = useRef(true)

  // Limpar o estado quando o componente é montado/desmontado
  useEffect(() => {
    isMounted.current = true

    // Configurar o estado inicial com base no produto fornecido
    if (initialProduct) {
      setName(initialProduct.name || "")
      setDescription(initialProduct.description || "")
      setPrice(initialProduct.price ? String(initialProduct.price) : "")
      setExternalLink(initialProduct.externalLink || "")
      setPreviewUrl(initialProduct.imageUrl || "")
    }

    return () => {
      // Limpar URLs de objeto quando o componente é desmontado
      if (previewUrl && previewUrl.startsWith("blob:") && previewUrl !== initialProduct?.imageUrl) {
        URL.revokeObjectURL(previewUrl)
      }
      isMounted.current = false
    }
  }, [initialProduct, previewUrl])

  const resetForm = () => {
    // Revogar URLs de objeto existentes para evitar vazamentos de memória
    if (previewUrl && previewUrl.startsWith("blob:") && !initialProduct?.imageUrl) {
      URL.revokeObjectURL(previewUrl)
    }

    if (!isEdit) {
      setName("")
      setDescription("")
      setPrice("")
      setExternalLink("")
      setPreviewUrl("")
      setSelectedFile(null)
    }
    setIsSubmitting(false)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Limpar qualquer URL de preview anterior que seja blob
    if (previewUrl && previewUrl.startsWith("blob:") && previewUrl !== initialProduct?.imageUrl) {
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
      description: "A imagem será enviada quando você salvar o produto.",
    })
  }

  const handleRemoveImage = () => {
    // Se a imagem for do produto inicial e estivermos editando, perguntar antes de excluir
    if (isEdit && previewUrl === initialProduct?.imageUrl) {
      if (!confirm("Tem certeza que deseja remover esta imagem?")) {
        return
      }
    }

    // Se for uma URL blob, revogá-la
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl)
    }

    setPreviewUrl("")
    setSelectedFile(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, informe o nome do produto.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    const parsedPrice = price ? Number.parseFloat(price.replace(",", ".")) : null

    // Se estamos editando e não selecionamos um novo arquivo, mantemos a URL original
    const imageUrl = isEdit && !selectedFile ? initialProduct?.imageUrl || null : null

    onAdd({
      name: name.trim(),
      description: description.trim() || null,
      price: parsedPrice,
      imageUrl: imageUrl,
      imageFile: selectedFile || undefined,
      externalLink: externalLink.trim() || null,
      type: "product",
    })

    // Não resetamos o formulário aqui, pois o componente pai vai lidar com isso
  }

  const handleCancel = () => {
    // Se não estamos editando, limpar o formulário
    if (!isEdit) {
      resetForm()
    }
    onCancel()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4 md:col-span-1">
          <div>
            <Label htmlFor="name" className="text-base font-medium">
              Nome do Produto
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Hambúrguer Especial"
              className="mt-1.5"
              required
            />
          </div>

          <div>
            <Label htmlFor="description" className="text-base font-medium">
              Descrição (opcional)
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Pão, hambúrguer, queijo, alface e tomate"
              className="mt-1.5 min-h-[100px]"
            />
          </div>

          <div>
            <Label htmlFor="price" className="text-base font-medium">
              Preço (opcional)
            </Label>
            <div className="relative mt-1.5">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">R$</span>
              <Input
                id="price"
                type="text"
                inputMode="decimal"
                value={price}
                onChange={(e) => {
                  // Permitir apenas números e vírgula
                  const value = e.target.value.replace(/[^0-9,]/g, "")
                  setPrice(value)
                }}
                placeholder="0,00"
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="external-link" className="text-base font-medium">
              Link Externo (opcional)
            </Label>
            <div className="relative mt-1.5">
              <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="external-link"
                value={externalLink}
                onChange={(e) => setExternalLink(e.target.value)}
                placeholder="https://exemplo.com"
                className="pl-10"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">
              Adicione um link para um site externo, como um link para pedido online.
            </p>
          </div>
        </div>

        <div className="space-y-4 md:col-span-1">
          <div>
            <Label htmlFor="product-image" className="text-base font-medium">
              Imagem do Produto (opcional)
            </Label>
            <div className="flex gap-2 mt-1.5">
              <Input
                id="product-image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="flex-1"
                disabled={isSubmitting}
                // Importante: adicionar key para forçar a recriação do componente
                key={`product-image-${isEdit ? initialProduct?.id : Date.now()}`}
              />
              {previewUrl && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleRemoveImage}
                  className="shrink-0"
                  disabled={isSubmitting}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {previewUrl ? (
            <div className="mt-4">
              <Label className="text-base font-medium mb-2 block">Preview</Label>
              <div className="relative h-48 w-full border rounded-md overflow-hidden bg-slate-50">
                <img src={previewUrl || "/placeholder.svg"} alt="Preview" className="object-contain w-full h-full" />
              </div>
            </div>
          ) : (
            <div className="mt-4 h-48 border rounded-md flex flex-col items-center justify-center bg-slate-50 text-muted-foreground">
              <ImageIcon className="h-10 w-10 mb-2 text-muted-foreground/50" />
              <p className="text-sm">Nenhuma imagem selecionada</p>
              <p className="text-xs">Tamanho recomendado: 500x500px</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={handleCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting} className="bg-[#E5324B] hover:bg-[#d02a41]">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isEdit ? "Salvando..." : "Adicionando..."}
            </>
          ) : isEdit ? (
            "Salvar Alterações"
          ) : (
            "Adicionar Produto"
          )}
        </Button>
      </div>
    </form>
  )
}
