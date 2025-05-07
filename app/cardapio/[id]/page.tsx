"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Instagram, Facebook, Twitter, Loader2 } from "lucide-react"
import { MenuService } from "@/lib/services/menu-service"
import { ExternalLinkModal } from "@/components/external-link-modal"
import ClientOnly from "@/components/client-only"
import { useErrorHandler } from "@/hooks/use-error-handler"

export default function CardapioPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string
  const { handleError } = useErrorHandler()

  const [menu, setMenu] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [socialMedia, setSocialMedia] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Estado para controlar o modal de link externo
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false)
  const [currentExternalUrl, setCurrentExternalUrl] = useState<string | null>(null)
  const [currentLinkTitle, setCurrentLinkTitle] = useState("")

  // Função para abrir o modal com um link específico
  const openExternalLink = useCallback((url: string, title = "Link Externo") => {
    setCurrentExternalUrl(url)
    setCurrentLinkTitle(title)
    setIsLinkModalOpen(true)
  }, [])

  useEffect(() => {
    let isMounted = true

    const loadMenuData = async () => {
      try {
        setIsLoading(true)

        // Verificar se o ID é válido
        if (!id) {
          setError("ID do cardápio inválido")
          setIsLoading(false)
          return
        }

        console.log("Carregando cardápio público:", id)

        // Carregar dados do menu
        const menuData = await MenuService.getPublicMenu(id)
        console.log("Dados do cardápio público carregados:", menuData)

        // Verificar se o componente ainda está montado
        if (!isMounted) return

        if (menuData && menuData.menu) {
          setMenu(menuData.menu)
          setProducts(menuData.products || [])
          setSocialMedia(menuData.socialMedia || null)

          // Definir a cor de fundo do body
          if (menuData.menu.bodyBackgroundColor) {
            document.body.style.backgroundColor = menuData.menu.bodyBackgroundColor
          }
        } else {
          setError("Cardápio não encontrado")
        }
      } catch (error) {
        console.error("Error loading menu data:", error)

        // Verificar se o componente ainda está montado
        if (!isMounted) return

        handleError(error, {
          title: "Erro ao carregar cardápio",
          message: "Não foi possível carregar os dados do cardápio.",
        })
        setError("Não foi possível carregar o cardápio. Verifique o link e tente novamente.")
      } finally {
        // Verificar se o componente ainda está montado
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadMenuData()

    // Cleanup function
    return () => {
      isMounted = false
      document.body.style.backgroundColor = ""
    }
  }, [id, handleError])

  // Função para gerar a URL do Instagram
  const getInstagramUrl = useCallback((username: string) => {
    if (!username) return "#"
    if (username.startsWith("http")) return username
    return `https://instagram.com/${username.replace("@", "")}`
  }, [])

  // Função para gerar a URL do Facebook
  const getFacebookUrl = useCallback((username: string) => {
    if (!username) return "#"
    if (username.startsWith("http")) return username
    return `https://facebook.com/${username}`
  }, [])

  // Função para gerar a URL do Twitter
  const getTwitterUrl = useCallback((username: string) => {
    if (!username) return "#"
    if (username.startsWith("http")) return username
    return `https://twitter.com/${username.replace("@", "")}`
  }, [])

  // Função para derivar uma cor mais clara para descrições
  const getLighterColor = useCallback((color: string) => {
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
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-[#E5324B]" />
          <p className="text-muted-foreground">Carregando cardápio...</p>
        </div>
      </div>
    )
  }

  if (error || !menu) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-[#E5324B] mb-4">Cardápio não encontrado</h1>
          <p className="text-muted-foreground mb-6">{error || "Este cardápio não existe ou foi removido."}</p>
          <Button onClick={() => router.push("/")} className="bg-[#E5324B] hover:bg-[#d02a41]">
            Voltar para a página inicial
          </Button>
        </div>
      </div>
    )
  }

  // Definir estilos com base nas configurações do menu
  const bodyBackgroundColor = menu.bodyBackgroundColor || "#f5f5f5"
  const backgroundColor = menu.backgroundColor || "#ffffff"
  const textColor = menu.textColor || "#333333"
  const fontFamily = menu.fontFamily || "Poppins"
  const bannerColor = menu.bannerColor || "#E5324B"
  const titlePosition = menu.titlePosition || "banner"

  return (
    <ClientOnly>
      <div className="min-h-screen py-6 px-4" style={{ backgroundColor: bodyBackgroundColor, fontFamily }}>
        <div className="max-w-md mx-auto">
          {/* Banner - Removida a altura fixa */}
          <div className="relative rounded-t-lg overflow-hidden" style={{ backgroundColor: bannerColor }}>
            {menu.bannerImage ? (
              <div className="w-full">
                {menu.bannerImage.startsWith("blob:") ? (
                  <img
                    src={menu.bannerImage || "/placeholder.svg"}
                    alt={menu.name || "Banner"}
                    className="w-full object-contain"
                    style={{ display: "block" }}
                  />
                ) : (
                  <img
                    src={menu.bannerImage || "/placeholder.svg"}
                    alt={menu.name || "Banner"}
                    className="w-full object-contain"
                    style={{ display: "block" }}
                  />
                )}

                {/* Overlay para o título e botão */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent"></div>

                  {titlePosition === "banner" && (
                    <h1 className="text-white font-bold text-2xl z-10 text-center px-4 drop-shadow-sm">
                      {menu.name || "Cardápio"}
                    </h1>
                  )}

                  {menu.bannerLink && menu.showLinkButton && (
                    <div className="absolute top-2 right-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={(e) => {
                          e.preventDefault()
                          openExternalLink(menu.bannerLink, menu.name || "Link do Banner")
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
              <div className="w-full py-16 flex items-center justify-center">
                {titlePosition === "banner" && (
                  <h1 className="text-white font-bold text-2xl z-10 text-center px-4 drop-shadow-sm">
                    {menu.name || "Cardápio"}
                  </h1>
                )}
              </div>
            )}
          </div>

          {/* Conteúdo */}
          <div className="p-6 rounded-b-lg shadow-sm" style={{ backgroundColor, color: textColor }}>
            {titlePosition === "below" && (
              <h1 className="text-2xl font-bold mb-6 text-center">{menu.name || "Cardápio"}</h1>
            )}

            {/* Produtos */}
            <div className="space-y-6 mt-4">
              {products.length > 0 ? (
                products.map((product) => (
                  <div key={product.id}>
                    {product.type === "image" ? (
                      // Renderização de imagem avulsa
                      <div className="w-full relative rounded-lg overflow-hidden mb-6">
                        {product.imageUrl?.startsWith("blob:") ? (
                          <img
                            src={product.imageUrl || "/placeholder.svg"}
                            alt="Imagem"
                            className="w-full object-contain"
                            style={{ display: "block" }}
                          />
                        ) : (
                          <img
                            src={product.imageUrl || "/placeholder.svg"}
                            alt="Imagem"
                            className="w-full object-contain"
                            style={{ display: "block" }}
                          />
                        )}
                      </div>
                    ) : (
                      // Renderização de produto normal
                      <div className="flex gap-4 p-4 rounded-lg border" style={{ borderColor: `${textColor}20` }}>
                        {product.imageUrl && (
                          <div className="shrink-0 w-[80px] h-[80px] relative">
                            {product.imageUrl.startsWith("blob:") ? (
                              <img
                                src={product.imageUrl || "/placeholder.svg"}
                                alt={product.name}
                                className="w-[80px] h-[80px] rounded-md object-cover"
                              />
                            ) : (
                              <Image
                                src={product.imageUrl || "/placeholder.svg"}
                                alt={product.name}
                                width={80}
                                height={80}
                                className="rounded-md object-cover"
                                unoptimized={product.imageUrl.startsWith("data:")}
                              />
                            )}
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <h3 className="font-medium text-lg">{product.name}</h3>
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
                            <p className="mt-1" style={{ color: getLighterColor(textColor) }}>
                              {product.description}
                            </p>
                          )}
                          {product.externalLink && (
                            <div className="mt-3">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs h-7 px-3"
                                onClick={(e) => {
                                  e.preventDefault()
                                  openExternalLink(product.externalLink, product.name)
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
                <div className="text-center py-8 text-gray-500">Nenhum produto adicionado</div>
              )}
            </div>

            {/* Footer com redes sociais */}
            {socialMedia && (socialMedia.instagram || socialMedia.facebook || socialMedia.twitter) && (
              <div className="pt-8 mt-8 border-t" style={{ borderColor: `${textColor}20` }}>
                <div className="flex justify-center space-x-8">
                  {socialMedia.instagram && (
                    <button
                      onClick={() => openExternalLink(getInstagramUrl(socialMedia.instagram), "Instagram")}
                      className="focus:outline-none"
                    >
                      <div className="p-3 rounded-full" style={{ backgroundColor: `${textColor}10` }}>
                        <Instagram className="h-6 w-6" style={{ color: textColor }} />
                      </div>
                    </button>
                  )}
                  {socialMedia.facebook && (
                    <button
                      onClick={() => openExternalLink(getFacebookUrl(socialMedia.facebook), "Facebook")}
                      className="focus:outline-none"
                    >
                      <div className="p-3 rounded-full" style={{ backgroundColor: `${textColor}10` }}>
                        <Facebook className="h-6 w-6" style={{ color: textColor }} />
                      </div>
                    </button>
                  )}
                  {socialMedia.twitter && (
                    <button
                      onClick={() => openExternalLink(getTwitterUrl(socialMedia.twitter), "Twitter")}
                      className="focus:outline-none"
                    >
                      <div className="p-3 rounded-full" style={{ backgroundColor: `${textColor}10` }}>
                        <Twitter className="h-6 w-6" style={{ color: textColor }} />
                      </div>
                    </button>
                  )}
                </div>
                <p className="text-sm text-center mt-3" style={{ color: getLighterColor(textColor) }}>
                  Siga-nos nas redes sociais
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal para exibir links externos */}
        <ExternalLinkModal
          url={currentExternalUrl}
          isOpen={isLinkModalOpen}
          onClose={() => setIsLinkModalOpen(false)}
          title={currentLinkTitle}
        />
      </div>
    </ClientOnly>
  )
}
