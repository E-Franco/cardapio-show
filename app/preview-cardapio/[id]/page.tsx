"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2, QrCode } from "lucide-react"
import PreviewMenu from "@/components/preview-menu"
import { MenuService } from "@/lib/services/menu-service"
import { useToast } from "@/components/ui/use-toast"
import ShareMenuDialog from "@/components/share-menu-dialog"
import ClientOnly from "@/components/client-only"
import { useErrorHandler } from "@/hooks/use-error-handler"

export default function PreviewCardapio({ params }: { params: { id: string } }) {
  const { id } = params
  const router = useRouter()
  const { toast } = useToast()
  const { handleError } = useErrorHandler()

  const [isLoading, setIsLoading] = useState(true)
  const [menu, setMenu] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [socialMedia, setSocialMedia] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadMenuData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Carregar dados do menu
        const menuData = await MenuService.getMenu(id)
        setMenu(menuData)

        // Carregar produtos
        const menuProducts = await MenuService.getMenuProducts(id)
        setProducts(menuProducts)

        // Carregar redes sociais
        const socialMediaData = await MenuService.getMenuSocialMedia(id)
        setSocialMedia(socialMediaData)
      } catch (error) {
        console.error("Erro ao carregar dados do cardápio:", error)
        handleError(error, {
          title: "Erro ao carregar preview",
          message: "Não foi possível carregar os dados do cardápio para preview.",
        })
        setError("Não foi possível carregar os dados do cardápio. Tente novamente mais tarde.")
      } finally {
        setIsLoading(false)
      }
    }

    loadMenuData()
  }, [id, handleError])

  // Criar objeto de redes sociais para o preview
  const socialMediaForPreview = socialMedia
    ? {
        instagram: socialMedia.instagram || undefined,
        facebook: socialMedia.facebook || undefined,
        twitter: socialMedia.twitter || undefined,
      }
    : undefined

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-[#E5324B]" />
          <p className="text-muted-foreground">Carregando preview do cardápio...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="text-red-500 mb-4">⚠️</div>
          <h2 className="text-xl font-semibold mb-2">Erro ao carregar preview</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex flex-col gap-3">
            <Button onClick={() => router.push("/")} variant="outline">
              Voltar para a página inicial
            </Button>
            <Button onClick={() => window.location.reload()}>Tentar novamente</Button>
          </div>
        </div>
      </div>
    )
  }

  if (!menu) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <h2 className="text-xl font-semibold mb-2">Cardápio não encontrado</h2>
          <p className="text-gray-600 mb-6">O cardápio que você está procurando não existe ou foi removido.</p>
          <Button onClick={() => router.push("/")} variant="outline">
            Voltar para a página inicial
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: menu.bodyBackgroundColor || "#f5f5f5" }}>
      {/* Barra de navegação */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="font-medium">Preview do Cardápio</h1>
              <p className="text-sm text-muted-foreground">{menu.name}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <ShareMenuDialog menuId={id} menuName={menu.name} />
            <Link href={`/editar-cardapio/${id}`}>
              <Button variant="outline">Editar</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="flex-1 container mx-auto py-6 px-4 flex flex-col items-center">
        <div className="w-full max-w-md mx-auto">
          <ClientOnly>
            <PreviewMenu
              name={menu.name}
              bannerColor={menu.bannerColor}
              bannerImage={menu.bannerImage}
              bannerLink={menu.bannerLink}
              showLinkButton={menu.showLinkButton}
              backgroundColor={menu.backgroundColor}
              textColor={menu.textColor}
              titlePosition={menu.titlePosition}
              fontFamily={menu.fontFamily}
              bodyBackgroundColor={menu.bodyBackgroundColor}
              socialMedia={socialMediaForPreview}
              products={products}
              fullWidthBanner={true}
            />
          </ClientOnly>
        </div>
      </div>

      {/* Rodapé com informações */}
      <div className="bg-white border-t py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground text-center sm:text-left">
              Este é um preview do seu cardápio. Compartilhe o link para que seus clientes possam acessá-lo.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-1.5">
                <QrCode className="h-4 w-4" />
                <span>QR Code</span>
              </Button>
              <ShareMenuDialog menuId={id} menuName={menu.name} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
