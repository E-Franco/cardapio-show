"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Instagram, Facebook, Twitter } from "lucide-react"
import { ExternalLinkModal } from "@/components/external-link-modal"
import type { TitlePosition, ProductType } from "@/lib/services/menu-service"

interface SocialMediaProps {
  instagram?: string
  facebook?: string
  twitter?: string
}

interface Product {
  id: string
  name: string
  description?: string | null
  price?: number
  imageUrl?: string
  externalLink?: string | null
  menuId: string
  orderIndex: number
  type?: ProductType
}

interface PreviewMenuProps {
  name: string
  bannerColor: string
  bannerImage?: string | null
  bannerLink?: string | null
  showLinkButton?: boolean
  backgroundColor?: string | null
  textColor?: string | null
  titlePosition?: TitlePosition
  fontFamily?: string | null
  bodyBackgroundColor?: string | null
  socialMedia?: SocialMediaProps
  products: Product[]
  fullWidthBanner?: boolean
}

export default function PreviewMenu({
  name,
  bannerColor,
  bannerImage,
  bannerLink,
  showLinkButton = true,
  backgroundColor = "#ffffff",
  textColor = "#333333",
  titlePosition = "banner",
  fontFamily = "Poppins",
  bodyBackgroundColor = "#f5f5f5",
  socialMedia,
  products,
  fullWidthBanner,
}: PreviewMenuProps) {
  // Estado para controlar o modal de link externo
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false)
  const [currentExternalUrl, setCurrentExternalUrl] = useState<string | null>(null)
  const [currentLinkTitle, setCurrentLinkTitle] = useState("")

  // Função para abrir o modal com um link específico
  const openExternalLink = (url: string, title = "Link Externo") => {
    setCurrentExternalUrl(url)
    setCurrentLinkTitle(title)
    setIsLinkModalOpen(true)
  }

  // Função para gerar a URL do Instagram
  const getInstagramUrl = (username: string) => {
    if (!username) return "#"
    if (username.startsWith("http")) return username
    return `https://instagram.com/${username.replace("@", "")}`
  }

  // Função para gerar a URL do Facebook
  const getFacebookUrl = (username: string) => {
    if (!username) return "#"
    if (username.startsWith("http")) return username
    return `https://facebook.com/${username}`
  }

  // Função para gerar a URL do Twitter
  const getTwitterUrl = (username: string) => {
    if (!username) return "#"
    if (username.startsWith("http")) return username
    return `https://twitter.com/${username.replace("@", "")}`
  }

  // Função para derivar uma cor mais clara para descrições
  const getLighterColor = (color: string) => {
    if (!color) return "rgba(51, 51, 51, 0.7)"

    // Se a cor for rgba, ajustamos a opacidade
    if (color.startsWith("rgba")) {
      return color.replace(/rgba$$(\d+),\s*(\d+),\s*(\d+),\s*[\d.]+$$/, "rgba($1, $2, $3, 0.7)")
    }
    // Se for hex, convertemos para rgb e adicionamos opacidade
    else if (color.startsWith("#")) {
      try {
        const r = Number.parseInt(color.slice(1, 3), 16)
        const g = Number.parseInt(color.slice(3, 5), 16)
        const b = Number.parseInt(color.slice(5, 7), 16)
        return `rgba(${r}, ${g}, ${b}, 0.7)`
      } catch (e) {
        console.error("Error parsing color:", e)
        return "rgba(51, 51, 51, 0.7)"
      }
    }
    return color
  }

  // Verificar se temos produtos válidos
  const validProducts = Array.isArray(products) ? products : []

  return (
    <div
      className="flex flex-col min-h-[500px] max-w-md mx-auto overflow-hidden rounded-lg shadow-sm"
      style={{
        backgroundColor: backgroundColor || "#ffffff",
        color: textColor || "#333333",
        fontFamily: fontFamily || "Poppins",
      }}
    >
      {/* Banner - Removida a altura fixa */}
      <div
        className={`relative flex items-center justify-center ${fullWidthBanner ? "w-full" : ""}`}
        style={{ backgroundColor: bannerColor || "#E5324B" }}
      >
        {bannerImage ? (
          // Se tiver imagem, não definimos altura fixa para o contêiner
          <div className="w-full">
            {bannerImage.startsWith("blob:") ? (
              <img
                src={bannerImage || "/placeholder.svg"}
                alt={name || "Banner"}
                className="w-full object-contain"
                style={{ display: "block" }}
              />
            ) : (
              <div className="relative w-full">
                <img
                  src={bannerImage || "/placeholder.svg"}
                  alt={name || "Banner"}
                  className="w-full object-contain"
                  style={{ display: "block" }}
                />
              </div>
            )}

            {/* Overlay para o título e botão */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent"></div>

              {titlePosition === "banner" && (
                <h1 className="text-white font-bold text-xl z-10 text-center px-4 drop-shadow-sm">
                  {name || "Seu Cardápio"}
                </h1>
              )}

              {bannerLink && showLinkButton && (
                <div className="absolute top-2 right-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={(e) => {
                      e.preventDefault()
                      openExternalLink(bannerLink, name || "Link do Banner")
                    }}
                  >
                    Visitar
                  </Button>
                </div>
              )}
            </div>
          </div>
        ) : (
          // Se não tiver imagem, usamos uma altura mínima
          <div className="w-full py-12 flex items-center justify-center">
            {titlePosition === "banner" && (
              <h1 className="text-white font-bold text-xl z-10 text-center px-4 drop-shadow-sm">
                {name || "Seu Cardápio"}
              </h1>
            )}
          </div>
        )}
      </div>

      {/* Conteúdo */}
      <div className="flex-1 p-4">
        {titlePosition === "below" && <h1 className="text-xl font-bold mb-4 text-center">{name || "Seu Cardápio"}</h1>}

        {/* Produtos */}
        <div className="space-y-4 mt-4">
          {validProducts.length > 0 ? (
            validProducts.map((product) => (
              <div key={product.id}>
                {product.type === "image" ? (
                  // Renderização de imagem avulsa
                  <div className="w-full relative rounded-lg overflow-hidden">
                    {product.imageUrl?.startsWith("blob:") ? (
                      <img
                        src={product.imageUrl || "/placeholder.svg"}
                        alt="Imagem"
                        className="w-full object-contain"
                        style={{ display: "block" }}
                      />
                    ) : (
                      <div className="relative w-full h-48">
                        <Image
                          src={product.imageUrl || "/placeholder.svg"}
                          alt="Imagem"
                          fill
                          className="object-contain"
                          unoptimized={product.imageUrl?.startsWith("data:")}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  // Renderização de produto normal
                  <div
                    className="flex gap-3 p-3 rounded-lg border"
                    style={{ borderColor: `${textColor || "#333333"}20` }}
                  >
                    {product.imageUrl && (
                      <div className="shrink-0 w-[60px] h-[60px] relative">
                        {product.imageUrl.startsWith("blob:") ? (
                          <img
                            src={product.imageUrl || "/placeholder.svg"}
                            alt={product.name}
                            className="w-[60px] h-[60px] rounded-md object-cover"
                          />
                        ) : (
                          <Image
                            src={product.imageUrl || "/placeholder.svg"}
                            alt={product.name}
                            width={60}
                            height={60}
                            className="rounded-md object-cover"
                            unoptimized={product.imageUrl.startsWith("data:")}
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
                      {product.description && (
                        <p className="text-sm mt-1" style={{ color: getLighterColor(textColor || "#333333") }}>
                          {product.description}
                        </p>
                      )}
                      {product.externalLink && (
                        <div className="mt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-7 px-2"
                            onClick={(e) => {
                              e.preventDefault()
                              openExternalLink(product.externalLink!, product.name)
                            }}
                          >
                            Ver mais
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-gray-500">Nenhum produto adicionado</div>
          )}
        </div>
      </div>

      {/* Footer com redes sociais */}
      {socialMedia && (socialMedia.instagram || socialMedia.facebook || socialMedia.twitter) && (
        <div className="p-4 border-t" style={{ borderColor: `${textColor || "#333333"}20` }}>
          <div className="flex justify-center space-x-6">
            {socialMedia.instagram && (
              <button
                onClick={() => openExternalLink(getInstagramUrl(socialMedia.instagram!), "Instagram")}
                className="focus:outline-none"
              >
                <div className="p-2 rounded-full" style={{ backgroundColor: `${textColor || "#333333"}10` }}>
                  <Instagram className="h-5 w-5" style={{ color: textColor || "#333333" }} />
                </div>
              </button>
            )}
            {socialMedia.facebook && (
              <button
                onClick={() => openExternalLink(getFacebookUrl(socialMedia.facebook!), "Facebook")}
                className="focus:outline-none"
              >
                <div className="p-2 rounded-full" style={{ backgroundColor: `${textColor || "#333333"}10` }}>
                  <Facebook className="h-5 w-5" style={{ color: textColor || "#333333" }} />
                </div>
              </button>
            )}
            {socialMedia.twitter && (
              <button
                onClick={() => openExternalLink(getTwitterUrl(socialMedia.twitter!), "Twitter")}
                className="focus:outline-none"
              >
                <div className="p-2 rounded-full" style={{ backgroundColor: `${textColor || "#333333"}10` }}>
                  <Twitter className="h-5 w-5" style={{ color: textColor || "#333333" }} />
                </div>
              </button>
            )}
          </div>
          <p className="text-sm text-center mt-2" style={{ color: getLighterColor(textColor || "#333333") }}>
            Siga-nos nas redes sociais
          </p>
        </div>
      )}

      {/* Modal para exibir links externos */}
      <ExternalLinkModal
        url={currentExternalUrl}
        isOpen={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        title={currentLinkTitle}
      />
    </div>
  )
}
