"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Edit, Trash2, LinkIcon, ImageIcon } from "lucide-react"
import type { Product } from "@/lib/services/menu-service"
import { ExternalLinkModal } from "@/components/external-link-modal"

interface ProductCardProps {
  product: Product
  onRemove: () => void
  onEdit: () => void
}

export default function ProductCard({ product, onRemove, onEdit }: ProductCardProps) {
  const [imageError, setImageError] = useState(false)
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false)

  // Verificar se é uma imagem avulsa
  const isImageOnly = product.type === "image"

  const handleImageError = () => {
    setImageError(true)
  }

  const openExternalLink = () => {
    if (product.externalLink) {
      setIsLinkModalOpen(true)
    }
  }

  return (
    <Card className="p-3 relative">
      <div className="flex gap-3">
        {/* Imagem do produto */}
        {isImageOnly ? (
          <div className="w-full">
            <div className="relative w-full h-48 rounded-md overflow-hidden bg-slate-50">
              {product.imageUrl?.startsWith("blob:") ? (
                <img
                  src={product.imageUrl || "/placeholder.svg"}
                  alt={product.name || "Imagem"}
                  className="w-full h-full object-contain"
                  onError={handleImageError}
                />
              ) : (
                <Image
                  src={product.imageUrl || "/placeholder.svg?height=200&width=300"}
                  alt={product.name || "Imagem"}
                  fill
                  className="object-contain"
                  onError={handleImageError}
                  unoptimized={product.imageUrl?.startsWith("data:")}
                />
              )}
            </div>
          </div>
        ) : (
          <>
            {product.imageUrl && !imageError && (
              <div className="shrink-0 w-[60px] h-[60px] relative">
                {product.imageUrl.startsWith("blob:") ? (
                  <img
                    src={product.imageUrl || "/placeholder.svg"}
                    alt={product.name}
                    className="w-[60px] h-[60px] rounded-md object-cover"
                    onError={handleImageError}
                  />
                ) : (
                  <Image
                    src={product.imageUrl || "/placeholder.svg?height=60&width=60"}
                    alt={product.name}
                    width={60}
                    height={60}
                    className="rounded-md object-cover"
                    onError={handleImageError}
                    unoptimized={product.imageUrl?.startsWith("data:")}
                  />
                )}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start gap-2">
                <h3 className="font-medium">{product.name}</h3>
                {product.price && (
                  <span className="font-bold whitespace-nowrap">
                    {product.price.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </span>
                )}
              </div>
              {product.description && <p className="text-sm text-muted-foreground mt-1">{product.description}</p>}
              {product.externalLink && (
                <div className="mt-2">
                  <Button size="sm" variant="outline" className="text-xs h-7 px-2" onClick={openExternalLink}>
                    <LinkIcon className="h-3 w-3 mr-1" />
                    Ver mais
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Botões de ação */}
      <div className="absolute top-2 right-2 flex gap-1">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onEdit}>
          <Edit className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={onRemove}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Indicador de tipo */}
      {isImageOnly && (
        <div className="absolute top-2 left-2 bg-black/50 text-white rounded-md px-2 py-1 text-xs flex items-center">
          <ImageIcon className="h-3 w-3 mr-1" />
          Imagem
        </div>
      )}

      {/* Modal para exibir links externos */}
      <ExternalLinkModal
        isOpen={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        url={product.externalLink}
        title={product.name}
      />
    </Card>
  )
}
