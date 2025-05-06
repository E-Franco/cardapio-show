"use client"

import Link from "next/link"
import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Eye, ImageIcon, LinkIcon, Hash, Trash2, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import ColorPickerWithOpacity from "@/components/color-picker-with-opacity"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/components/ui/use-toast"
import PreviewMenu from "@/components/preview-menu"
import { MenuService, type Product, type TitlePosition } from "@/lib/services/menu-service"
import { UploadService } from "@/lib/services/upload-service"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// Lista de fontes disponíveis
const availableFonts = [
  { value: "Poppins", label: "Poppins" },
  { value: "Inter", label: "Inter" },
  { value: "Montserrat", label: "Montserrat" },
  { value: "Roboto", label: "Roboto" },
  { value: "Open Sans", label: "Open Sans" },
  { value: "Raleway", label: "Raleway" },
  { value: "Nunito", label: "Nunito" },
  { value: "Lato", label: "Lato" },
  { value: "Source Sans Pro", label: "Source Sans Pro" },
  { value: "Work Sans", label: "Work Sans" },
]

export default function CriarCardapio() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const { toast } = useToast()

  // Estados básicos
  const [isLoading, setIsLoading] = useState(false)
  const [menuName, setMenuName] = useState("")
  const [bannerColor, setBannerColor] = useState("#E5324B")
  const [tempBannerColor, setTempBannerColor] = useState("#E5324B")
  const [bannerImage, setBannerImage] = useState<string | undefined>(undefined)
  const [bannerLink, setBannerLink] = useState("")
  const [showLinkButton, setShowLinkButton] = useState(true)
  const [backgroundColor, setBackgroundColor] = useState("#ffffff")
  const [tempBackgroundColor, setTempBackgroundColor] = useState("#ffffff")
  const [textColor, setTextColor] = useState("#333333")
  const [tempTextColor, setTempTextColor] = useState("#333333")
  const [titlePosition, setTitlePosition] = useState<TitlePosition>("banner")
  const [fontFamily, setFontFamily] = useState("Poppins")
  const [bodyBackgroundColor, setBodyBackgroundColor] = useState("#f5f5f5")
  const [tempBodyBackgroundColor, setTempBodyBackgroundColor] = useState("#f5f5f5")
  const [tempProducts, setTempProducts] = useState<Product[]>([])
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [showAddImage, setShowAddImage] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isDeleteProductDialogOpen, setIsDeleteProductDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [addItemTab, setAddItemTab] = useState<"product" | "image">("product")

  // Social media states
  const [instagram, setInstagram] = useState("")
  const [facebook, setFacebook] = useState("")
  const [twitter, setTwitter] = useState("")

  // Verificar autenticação
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  // Update the document body background color when bodyBackgroundColor changes
  useEffect(() => {
    document.body.style.backgroundColor = tempBodyBackgroundColor

    // Cleanup function to reset body background when component unmounts
    return () => {
      document.body.style.backgroundColor = ""
    }
  }, [tempBodyBackgroundColor])

  const handleAddProduct = (product: Omit<Product, "id" | "menuId" | "orderIndex">) => {
    const newProduct = {
      ...product,
      id: Date.now().toString(),
      menuId: "temp",
      orderIndex: tempProducts.length,
      type: "product",
    }
    setTempProducts([...tempProducts, newProduct])
    setShowAddProduct(false)
  }

  const handleAddImage = (imageUrl: string) => {
    const newImage = {
      id: Date.now().toString(),
      name: "Imagem",
      imageUrl,
      menuId: "temp",
      orderIndex: tempProducts.length,
      type: "image" as const,
    }
    setTempProducts([...tempProducts, newImage])
    setShowAddImage(false)
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    if (product.type === "image") {
      setShowAddImage(true)
    } else {
      setShowAddProduct(true)
    }
  }

  const handleUpdateProduct = (updatedProduct: Omit<Product, "id" | "menuId" | "orderIndex">) => {
    if (!editingProduct) return

    const updated = {
      ...editingProduct,
      ...updatedProduct,
    }

    setTempProducts(tempProducts.map((p) => (p.id === editingProduct.id ? updated : p)))
    setShowAddProduct(false)
    setEditingProduct(null)
  }

  const handleDeleteProductClick = (product: Product) => {
    setSelectedProduct(product)
    setIsDeleteProductDialogOpen(true)
  }

  const handleDeleteProduct = () => {
    if (!selectedProduct) return

    setTempProducts(tempProducts.filter((p) => p.id !== selectedProduct.id))
    setIsDeleteProductDialogOpen(false)
  }

  const handleBannerImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setIsUploading(true)
      try {
        // Criar preview local imediatamente
        const localPreview = URL.createObjectURL(file)

        // Upload the file to Supabase Storage
        const imageUrl = await UploadService.uploadImage(file, "banners")
        setBannerImage(imageUrl)

        // Verificar se a URL é local (blob) ou do Supabase
        if (imageUrl.startsWith("blob:")) {
          toast({
            title: "Imagem carregada localmente",
            description: "A imagem está sendo usada localmente devido a restrições de permissão no servidor.",
            variant: "warning",
          })
        } else {
          toast({
            title: "Imagem carregada",
            description: "A imagem do banner foi carregada com sucesso.",
          })
        }
      } catch (error) {
        console.error("Erro ao fazer upload da imagem:", error)
        toast({
          title: "Erro ao fazer upload",
          description: "Não foi possível fazer o upload da imagem do banner. Usando versão local temporária.",
          variant: "destructive",
        })

        // Criar uma URL temporária para a imagem
        const tempUrl = URL.createObjectURL(file)
        setBannerImage(tempUrl)
      } finally {
        setIsUploading(false)
      }
    }
  }

  const handleRemoveBannerImage = async () => {
    if (bannerImage && !bannerImage.includes("placeholder.svg")) {
      try {
        await UploadService.deleteImage(bannerImage)
      } catch (error) {
        console.error("Error deleting banner image:", error)
      }
    }

    setBannerImage(undefined)
  }

  const handleSaveMenu = async () => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para criar um cardápio.",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      // Create menu
      const newMenu = await MenuService.createMenu({
        name: menuName || "Novo Cardápio",
        bannerColor,
        bannerImage,
        bannerLink,
        showLinkButton,
        backgroundColor,
        textColor,
        titlePosition,
        fontFamily,
        bodyBackgroundColor,
        userId: user.id,
      })

      // Add products
      for (let i = 0; i < tempProducts.length; i++) {
        const product = tempProducts[i]
        if (product.type === "image") {
          await MenuService.addImage({
            imageUrl: product.imageUrl || "",
            menuId: newMenu.id,
            orderIndex: i,
          })
        } else {
          await MenuService.addProduct({
            name: product.name,
            description: product.description,
            price: product.price,
            imageUrl: product.imageUrl,
            externalLink: product.externalLink,
            menuId: newMenu.id,
            orderIndex: i,
            type: "product",
          })
        }
      }

      // Add social media
      if (instagram || facebook || twitter) {
        await MenuService.upsertSocialMedia({
          menuId: newMenu.id,
          instagram: instagram || null,
          facebook: facebook || null,
          twitter: twitter || null,
        })
      }

      toast({
        title: "Cardápio criado com sucesso!",
        description: "Seu cardápio foi salvo e já está disponível para compartilhamento.",
      })

      // Navigate back to home page after saving
      router.push("/")
    } catch (error) {
      console.error("Error saving menu:", error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar o cardápio. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const togglePreview = () => {
    setShowPreview(!showPreview)
  }

  // Create social media object for preview
  const socialMedia = {
    instagram: instagram || undefined,
    facebook: facebook || undefined,
    twitter: twitter || undefined,
  }

  // Função para criar um cabeçalho de seção
  const SectionHeader = ({ icon, title }: { icon: React.ReactNode; title: string }) => (
    <div className="flex items-center gap-3 mb-5 border-b pb-3">
      <div className="h-8 w-8 rounded-full bg-red-50 flex items-center justify-center text-[#E5324B]">{icon}</div>
      <h2 className="text-xl font-semibold">{title}</h2>
    </div>
  )

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-[#E5324B]" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <p className="text-muted-foreground mb-4">Você precisa estar logado para criar um cardápio.</p>
          <Button onClick={() => router.push("/login")} className="bg-[#E5324B] hover:bg-[#d02a41]">
            Ir para o Login
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: tempBodyBackgroundColor }}>
      <div className="container mx-auto py-6 px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center">
            <Link href="/">
              <Button variant="ghost" size="icon" className="rounded-full mr-4">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-[#E5324B]">Criar Novo Cardápio</h1>
              <p className="text-muted-foreground text-sm">
                Personalize seu cardápio digital e compartilhe com seus clientes
              </p>
            </div>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Button variant="outline" onClick={togglePreview} className="flex-1 md:flex-none">
              <Eye className="mr-2 h-4 w-4" />
              {showPreview ? "Ocultar Preview" : "Mostrar Preview"}
            </Button>
            <Button
              onClick={handleSaveMenu}
              className="flex-1 md:flex-none bg-[#E5324B] hover:bg-[#d02a41]"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar Cardápio"
              )}
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          {/* Editor Column */}
          <div className={`space-y-8 ${showPreview ? "lg:col-span-3" : "lg:col-span-5"}`}>
            {/* Informações Básicas */}
            <Card>
              <CardContent className="p-6">
                <SectionHeader icon={<Hash className="h-4 w-4" />} title="Informações Básicas" />

                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="menu-name" className="text-base font-medium">
                      Nome do Cardápio
                    </Label>
                    <Input
                      id="menu-name"
                      value={menuName}
                      onChange={(e) => setMenuName(e.target.value)}
                      placeholder="Ex: Cardápio de Verão"
                      className="mt-1.5"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Banner */}
            <Card>
              <CardContent className="p-6">
                <SectionHeader icon={<ImageIcon className="h-4 w-4" />} title="Banner" />

                {/* Banner Preview */}
                <div className="-mx-4 sm:mx-0">
                  <div className="sm:rounded-lg relative overflow-hidden" style={{ backgroundColor: tempBannerColor }}>
                    {bannerImage ? (
                      <div className="w-full relative">
                        {/* Div para a cor de fundo */}
                        <div className="absolute inset-0" style={{ backgroundColor: tempBannerColor }}></div>

                        {/* Imagem por cima da cor */}
                        {bannerImage.startsWith("blob:") ? (
                          <img
                            src={bannerImage || "/placeholder.svg"}
                            alt={menuName}
                            className="w-full object-contain relative z-10"
                            style={{ display: "block" }}
                          />
                        ) : (
                          <img
                            src={bannerImage || "/placeholder.svg"}
                            alt={menuName}
                            className="w-full object-contain relative z-10"
                            style={{ display: "block" }}
                          />
                        )}

                        {/* Overlay para o título */}
                        <div className="absolute inset-0 flex items-center justify-center z-20">
                          <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent"></div>

                          {titlePosition === "banner" && (
                            <h3
                              className="text-white font-bold text-2xl z-10 text-center px-4 drop-shadow-sm"
                              style={{ fontFamily }}
                            >
                              {menuName || "Seu Cardápio"}
                            </h3>
                          )}
                          {bannerLink && showLinkButton && (
                            <div className="absolute top-2 right-2">
                              <Link href={bannerLink} target="_blank" rel="noopener noreferrer">
                                <Button size="sm" variant="secondary">
                                  Visitar
                                </Button>
                              </Link>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      // Se não tiver imagem, usamos uma altura mínima
                      <div className="w-full py-16 flex items-center justify-center">
                        {titlePosition === "banner" && (
                          <h3
                            className="text-white font-bold text-2xl z-10 text-center px-4 drop-shadow-sm"
                            style={{ fontFamily }}
                          >
                            {menuName || "Seu Cardápio"}
                          </h3>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <Label htmlFor="banner-color" className="text-base font-medium">
                      Cor do Banner
                    </Label>
                    <ColorPickerWithOpacity
                      color={bannerColor}
                      onChange={setBannerColor}
                      onTempChange={setTempBannerColor}
                      allowTransparent={false}
                      previewClassName="bg-gradient-to-r from-white to-gray-100 mt-1.5"
                    />
                  </div>

                  <div>
                    <Label htmlFor="banner-image" className="text-base font-medium">
                      Imagem do Banner (opcional)
                    </Label>
                    <div className="flex gap-2 mt-1.5">
                      <Input
                        id="banner-image"
                        type="file"
                        accept="image/*"
                        onChange={handleBannerImageChange}
                        className="flex-1"
                        disabled={isUploading}
                      />
                      {bannerImage && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={handleRemoveBannerImage}
                          className="shrink-0"
                          disabled={isUploading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    {isUploading && (
                      <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        <span>Fazendo upload da imagem...</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="banner-link" className="text-base font-medium">
                      Link do Banner (opcional)
                    </Label>
                    <div className="relative mt-1.5">
                      <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="banner-link"
                        value={bannerLink}
                        onChange={(e) => setBannerLink(e.target.value)}
                        placeholder="https://exemplo.com"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 pt-6">
                    <Switch id="show-link-button" checked={showLinkButton} onCheckedChange={setShowLinkButton} />
                    <Label htmlFor="show-link-button">Mostrar botão de link no banner</Label>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t">
                  <h3 className="text-base font-medium mb-3">Posição do Título</h3>
                  <RadioGroup
                    value={titlePosition}
                    onValueChange={(value) => setTitlePosition(value as "banner" | "below" | "hidden")}
                    className="mt-1.5"
                  >
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-slate-50 cursor-pointer">
                        <RadioGroupItem value="banner" id="title-banner" />
                        <Label htmlFor="title-banner" className="cursor-pointer">
                          Dentro do Banner
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-slate-50 cursor-pointer">
                        <RadioGroupItem value="below" id="title-below" />
                        <Label htmlFor="title-below" className="cursor-pointer">
                          Abaixo do Banner
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-slate-50 cursor-pointer">
                        <RadioGroupItem value="hidden" id="title-hidden" />
                        <Label htmlFor="title-hidden" className="cursor-pointer">
                          Não Exibir
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>

            {/* Resto do código permanece o mesmo */}
            {/* ... */}
          </div>

          {/* Preview Column */}
          {showPreview && (
            <div className="lg:col-span-2 space-y-6">
              <Card className="sticky top-20">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Eye className="h-5 w-5 text-[#E5324B]" />
                    Preview em Tempo Real
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div
                    className="rounded-lg overflow-hidden border"
                    style={{ backgroundColor: tempBodyBackgroundColor }}
                  >
                    <div className="p-4">
                      <PreviewMenu
                        name={menuName}
                        bannerColor={tempBannerColor}
                        bannerImage={bannerImage}
                        bannerLink={bannerLink}
                        showLinkButton={showLinkButton}
                        backgroundColor={tempBackgroundColor}
                        textColor={tempTextColor}
                        titlePosition={titlePosition}
                        fontFamily={fontFamily}
                        bodyBackgroundColor={tempBodyBackgroundColor}
                        socialMedia={socialMedia}
                        products={
                          tempProducts.length > 0
                            ? tempProducts.slice(0, 3)
                            : [
                                {
                                  id: "preview-1",
                                  name: "Produto de Exemplo",
                                  description: "Descrição do produto de exemplo para visualização",
                                  imageUrl: "/placeholder.svg?height=80&width=80",
                                  externalLink: undefined,
                                  menuId: "temp",
                                  orderIndex: 0,
                                  type: "product",
                                },
                              ]
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Dialog para confirmar exclusão de produto */}
      <Dialog open={isDeleteProductDialogOpen} onOpenChange={setIsDeleteProductDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Excluir item</DialogTitle>
            <DialogDescription>
              <p className="mb-2">
                Tem certeza que deseja excluir {selectedProduct?.type === "image" ? "esta imagem" : "o produto"}{" "}
                {selectedProduct?.type !== "image" && `"${selectedProduct?.name}"`}?
              </p>
              <p className="text-red-500 font-medium">Esta ação é irreversível e não poderá ser desfeita.</p>
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="sm:justify-between">
            <Button variant="outline" onClick={() => setIsDeleteProductDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteProduct} className="bg-[#E5324B] hover:bg-[#d02a41]">
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
