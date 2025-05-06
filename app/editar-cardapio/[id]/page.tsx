"use client"

import type React from "react"

import { useState, useEffect } from "react"
import ShareMenuDialog from "@/components/share-menu-dialog"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  ArrowLeft,
  Plus,
  Eye,
  Instagram,
  Facebook,
  Twitter,
  Palette,
  ImageIcon,
  LinkIcon,
  Share2,
  Hash,
  Layers,
  Trash2,
  Loader2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import ProductCard from "@/components/product-card"
import AddProductForm from "@/components/add-product-form"
import AddImageForm from "@/components/add-image-form"
import ColorPickerWithOpacity from "@/components/color-picker-with-opacity"
import PreviewMenu from "@/components/preview-menu"
import { useToast } from "@/components/ui/use-toast"
import { MenuService, type Product, type TitlePosition } from "@/lib/services/menu-service"
import { UploadService } from "@/lib/services/upload-service"
import { useAuth } from "@/components/auth-provider"
import ClientOnly from "@/components/client-only"
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

export default function EditarCardapio({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { id } = params
  const { user } = useAuth()
  const { toast } = useToast()

  // Initialize all state variables with default values
  const [menuName, setMenuName] = useState("")
  const [bannerColor, setBannerColor] = useState("#E5324B")
  const [tempBannerColor, setTempBannerColor] = useState("#E5324B")
  const [bannerImage, setBannerImage] = useState("")
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
  const [products, setProducts] = useState<Product[]>([])
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [showAddImage, setShowAddImage] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isDeleteProductDialogOpen, setIsDeleteProductDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  // Social media states
  const [instagram, setInstagram] = useState("")
  const [facebook, setFacebook] = useState("")
  const [twitter, setTwitter] = useState("")

  useEffect(() => {
    const loadMenuData = async () => {
      if (!user) return

      setIsLoading(true)
      try {
        console.log("Carregando dados do cardápio:", id)

        // Load menu data
        const menu = await MenuService.getMenu(id)
        console.log("Dados do cardápio carregados:", menu)

        // Check if the user has permission to edit this menu
        if (!user.isAdmin && menu.userId !== user.id) {
          toast({
            title: "Acesso negado",
            description: "Você não tem permissão para editar este cardápio.",
            variant: "destructive",
          })
          router.push("/")
          return
        }

        // Set menu data - garantindo que todos os campos sejam definidos
        setMenuName(menu.name || "")

        // Cores - garantindo que todas as cores sejam definidas corretamente
        console.log("Definindo cores:", {
          bannerColor: menu.bannerColor,
          backgroundColor: menu.backgroundColor,
          textColor: menu.textColor,
          bodyBackgroundColor: menu.bodyBackgroundColor,
        })

        // Definir cores com valores padrão caso estejam ausentes
        const bannerColorValue = menu.bannerColor || "#E5324B"
        const backgroundColorValue = menu.backgroundColor || "#ffffff"
        const textColorValue = menu.textColor || "#333333"
        const bodyBackgroundColorValue = menu.bodyBackgroundColor || "#f5f5f5"

        console.log("Valores de cores que serão definidos:", {
          bannerColorValue,
          backgroundColorValue,
          textColorValue,
          bodyBackgroundColorValue,
        })

        // Definir os estados com os valores processados
        setBannerColor(bannerColorValue)
        setTempBannerColor(bannerColorValue)

        setBackgroundColor(backgroundColorValue)
        setTempBackgroundColor(backgroundColorValue)

        setTextColor(textColorValue)
        setTempTextColor(textColorValue)

        setBodyBackgroundColor(bodyBackgroundColorValue)
        setTempBodyBackgroundColor(bodyBackgroundColorValue)

        // Outras propriedades
        setBannerImage(menu.bannerImage || "")
        setBannerLink(menu.bannerLink || "")
        setShowLinkButton(menu.showLinkButton !== false)
        setTitlePosition(menu.titlePosition || "banner")
        setFontFamily(menu.fontFamily || "Poppins")

        // Load products
        console.log("Carregando produtos do cardápio:", id)
        const menuProducts = await MenuService.getMenuProducts(id)
        console.log("Produtos carregados:", menuProducts)
        setProducts(menuProducts)

        // Load social media
        console.log("Carregando redes sociais do cardápio:", id)
        const socialMedia = await MenuService.getMenuSocialMedia(id)
        console.log("Redes sociais carregadas:", socialMedia)
        if (socialMedia) {
          setInstagram(socialMedia.instagram || "")
          setFacebook(socialMedia.facebook || "")
          setTwitter(socialMedia.twitter || "")
        }

        console.log("Todos os dados carregados com sucesso")
      } catch (error) {
        console.error("Error loading menu data:", error)
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados do cardápio. Tente novamente mais tarde.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadMenuData()
  }, [id, user, router, toast])

  const handleAddProduct = async (product: Omit<Product, "id" | "menuId" | "orderIndex">) => {
    try {
      const newProduct = await MenuService.addProduct({
        ...product,
        menuId: id,
        orderIndex: products.length,
        type: "product",
      })

      setProducts([...products, newProduct])
      setShowAddProduct(false)

      toast({
        title: "Produto adicionado",
        description: "O produto foi adicionado com sucesso ao cardápio.",
      })
    } catch (error) {
      console.error("Error adding product:", error)
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o produto. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  const handleAddImage = async (imageUrl: string) => {
    try {
      const newImage = await MenuService.addImage({
        imageUrl,
        menuId: id,
        orderIndex: products.length,
      })

      setProducts([...products, newImage])
      setShowAddImage(false)

      toast({
        title: "Imagem adicionada",
        description: "A imagem foi adicionada com sucesso ao cardápio.",
      })
    } catch (error) {
      console.error("Error adding image:", error)
      toast({
        title: "Erro",
        description: "Não foi possível adicionar a imagem. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    if (product.type === "image") {
      setShowAddImage(true)
    } else {
      setShowAddProduct(true)
    }
  }

  const handleUpdateProduct = async (updatedProduct: Omit<Product, "id" | "menuId" | "orderIndex">) => {
    if (!editingProduct) return

    try {
      const product = await MenuService.updateProduct(editingProduct.id, {
        ...updatedProduct,
      })

      setProducts(products.map((p) => (p.id === editingProduct.id ? product : p)))
      setShowAddProduct(false)
      setEditingProduct(null)

      toast({
        title: "Produto atualizado",
        description: "O produto foi atualizado com sucesso.",
      })
    } catch (error) {
      console.error("Error updating product:", error)
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o produto. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteProductClick = (product: Product) => {
    setSelectedProduct(product)
    setIsDeleteProductDialogOpen(true)
  }

  const handleDeleteProduct = async () => {
    if (!selectedProduct) return

    try {
      await MenuService.deleteProduct(selectedProduct.id)

      // If the product has a custom image (not a placeholder), delete it
      if (selectedProduct.imageUrl && !selectedProduct.imageUrl.includes("placeholder.svg")) {
        try {
          await UploadService.deleteImage(selectedProduct.imageUrl)
        } catch (error) {
          console.error("Error deleting product image:", error)
        }
      }

      setProducts(products.filter((p) => p.id !== selectedProduct.id))
      setIsDeleteProductDialogOpen(false)

      toast({
        title: "Item excluído",
        description: `O ${selectedProduct.type === "image" ? "imagem" : "produto"} foi excluído com sucesso.`,
      })
    } catch (error) {
      console.error("Error deleting product:", error)
      toast({
        title: "Erro",
        description: "Não foi possível excluir o item. Tente novamente.",
        variant: "destructive",
      })
    }
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

    setBannerImage("")
  }

  const handleSaveMenu = async () => {
    if (!user) return

    setIsSaving(true)
    try {
      console.log("Salvando cardápio:", {
        id,
        name: menuName,
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

      // Update menu
      await MenuService.updateMenu(id, {
        name: menuName,
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

      console.log("Salvando redes sociais:", {
        menuId: id,
        instagram,
        facebook,
        twitter,
      })

      // Update social media
      await MenuService.upsertSocialMedia({
        menuId: id,
        instagram: instagram || null,
        facebook: facebook || null,
        twitter: twitter || null,
      })

      toast({
        title: "Cardápio atualizado",
        description: "Seu cardápio foi atualizado com sucesso.",
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

  // Update the document body background color when bodyBackgroundColor changes
  useEffect(() => {
    document.body.style.backgroundColor = tempBodyBackgroundColor

    // Cleanup function to reset body background when component unmounts
    return () => {
      document.body.style.backgroundColor = ""
    }
  }, [tempBodyBackgroundColor])

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

  return (
    <div className="min-h-screen" style={{ backgroundColor: tempBodyBackgroundColor }}>
      <div className="container mx-auto py-6 px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center">
            <Link href="/" className="mr-4">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-[#E5324B]">Editar Cardápio</h1>
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
            <ShareMenuDialog menuId={id} menuName={menuName} />
            <Link href={`/preview-cardapio/${id}`}>
              <Button variant="outline" className="flex-1 md:flex-none">
                Preview Completo
              </Button>
            </Link>
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
                "Salvar Alterações"
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
                  <div
                    className="sm:rounded-lg relative overflow-hidden"
                    style={{ backgroundColor: tempBannerColor || "#E5324B" }}
                  >
                    <ClientOnly>
                      {bannerImage ? (
                        <div className="w-full relative">
                          {/* Div para a cor de fundo */}
                          <div
                            className="absolute inset-0"
                            style={{ backgroundColor: tempBannerColor || "#E5324B" }}
                          ></div>

                          {/* Imagem por cima da cor */}
                          {bannerImage.startsWith("blob:") ? (
                            <img
                              src={bannerImage || "/placeholder.svg"}
                              alt={menuName || "Banner"}
                              className="w-full object-contain relative z-10"
                              style={{ display: "block" }}
                            />
                          ) : (
                            <img
                              src={bannerImage || "/placeholder.svg"}
                              alt={menuName || "Banner"}
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
                                style={{ fontFamily: fontFamily || "Poppins" }}
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
                    </ClientOnly>
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

            {/* Aparência */}
            <Card>
              <CardContent className="p-6">
                <SectionHeader icon={<Palette className="h-4 w-4" />} title="Aparência" />

                <div className="grid gap-6">
                  <div>
                    <Label htmlFor="font-family" className="text-base font-medium">
                      Fonte do Cardápio
                    </Label>
                    <div className="mt-1.5">
                      <Select value={fontFamily} onValueChange={setFontFamily}>
                        <SelectTrigger id="font-family">
                          <SelectValue placeholder="Selecione uma fonte" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableFonts.map((font) => (
                            <SelectItem key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                              <span style={{ fontFamily: font.value }}>{font.label}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="mt-2 p-3 border rounded-lg text-center" style={{ fontFamily }}>
                        <span>Exemplo de texto com a fonte {fontFamily}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <Label htmlFor="body-background-color" className="text-base font-medium">
                        Cor de Fundo da Página
                      </Label>
                      <ColorPickerWithOpacity
                        color={bodyBackgroundColor}
                        onChange={setBodyBackgroundColor}
                        onTempChange={setTempBodyBackgroundColor}
                        allowTransparent={true}
                        previewClassName="bg-gradient-to-r from-white to-gray-100 mt-1.5"
                      />
                    </div>

                    <div>
                      <Label htmlFor="background-color" className="text-base font-medium">
                        Cor de Fundo do Cardápio
                      </Label>
                      <ColorPickerWithOpacity
                        color={backgroundColor}
                        onChange={setBackgroundColor}
                        onTempChange={setTempBackgroundColor}
                        allowTransparent={true}
                        previewClassName="bg-gradient-to-r from-white to-gray-100 mt-1.5"
                      />
                    </div>

                    <div>
                      <Label htmlFor="text-color" className="text-base font-medium">
                        Cor do Texto
                      </Label>
                      <ColorPickerWithOpacity
                        color={textColor}
                        onChange={setTextColor}
                        onTempChange={setTempTextColor}
                        allowTransparent={false}
                        previewClassName="bg-gradient-to-r from-white to-gray-100 mt-1.5"
                      />
                      <p className="text-xs text-muted-foreground mt-1.5">
                        A cor da descrição dos produtos será automaticamente derivada desta cor.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Redes Sociais */}
            <Card>
              <CardContent className="p-6">
                <SectionHeader icon={<Share2 className="h-4 w-4" />} title="Redes Sociais" />

                <div className="grid gap-6 md:grid-cols-3">
                  <div>
                    <Label htmlFor="instagram" className="flex items-center gap-2 mb-2">
                      <Instagram className="h-4 w-4 text-pink-500" />
                      Instagram
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                        @
                      </span>
                      <Input
                        id="instagram"
                        value={instagram}
                        onChange={(e) => setInstagram(e.target.value)}
                        placeholder="seu_instagram"
                        className="pl-8"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="facebook" className="flex items-center gap-2 mb-2">
                      <Facebook className="h-4 w-4 text-blue-600" />
                      Facebook
                    </Label>
                    <Input
                      id="facebook"
                      value={facebook}
                      onChange={(e) => setFacebook(e.target.value)}
                      placeholder="sua_pagina ou URL completa"
                    />
                  </div>

                  <div>
                    <Label htmlFor="twitter" className="flex items-center gap-2 mb-2">
                      <Twitter className="h-4 w-4 text-sky-500" />
                      Twitter
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                        @
                      </span>
                      <Input
                        id="twitter"
                        value={twitter}
                        onChange={(e) => setTwitter(e.target.value)}
                        placeholder="seu_twitter"
                        className="pl-8"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 mt-6">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
                      <LinkIcon className="h-3 w-3 text-[#E5324B]" />
                    </div>
                    Visualização do Footer
                  </h4>
                  <div className="border rounded-lg p-4 bg-white">
                    <div className="flex justify-center space-x-6 mb-4">
                      {instagram && (
                        <div className="p-2 rounded-full bg-slate-50 text-pink-500">
                          <Instagram className="h-5 w-5" />
                        </div>
                      )}
                      {facebook && (
                        <div className="p-2 rounded-full bg-slate-50 text-blue-600">
                          <Facebook className="h-5 w-5" />
                        </div>
                      )}
                      {twitter && (
                        <div className="p-2 rounded-full bg-slate-50 text-sky-500">
                          <Twitter className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                    {instagram || facebook || twitter ? (
                      <p className="text-sm text-center text-slate-500">Siga-nos nas redes sociais</p>
                    ) : (
                      <p className="text-sm text-center text-slate-400">
                        Adicione pelo menos uma rede social para exibir o footer
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Produtos */}
            <Card>
              <CardContent className="p-6">
                <SectionHeader icon={<Layers className="h-4 w-4" />} title="Produtos e Imagens" />

                <div className="flex justify-between items-center mb-6">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Adicione produtos e imagens que serão exibidos no seu cardápio
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        setEditingProduct(null)
                        setShowAddProduct(true)
                      }}
                      variant="outline"
                      className="bg-red-50 text-[#E5324B] border-red-200 hover:bg-red-100 hover:text-[#d02a41]"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Adicionar Produto
                    </Button>
                    <Button
                      onClick={() => {
                        setEditingProduct(null)
                        setShowAddImage(true)
                      }}
                      variant="outline"
                      className="bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 hover:text-blue-700"
                    >
                      <ImageIcon className="mr-2 h-4 w-4" />
                      Adicionar Imagem
                    </Button>
                  </div>
                </div>

                {showAddProduct && (
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle className="text-lg">{editingProduct ? "Editar Produto" : "Novo Produto"}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <AddProductForm
                        onAdd={editingProduct ? handleUpdateProduct : handleAddProduct}
                        onCancel={() => {
                          setShowAddProduct(false)
                          setEditingProduct(null)
                        }}
                        initialProduct={editingProduct || undefined}
                        isEdit={!!editingProduct}
                      />
                    </CardContent>
                  </Card>
                )}

                {showAddImage && (
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle className="text-lg">Adicionar Imagem</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <AddImageForm
                        onAdd={handleAddImage}
                        onCancel={() => {
                          setShowAddImage(false)
                        }}
                      />
                    </CardContent>
                  </Card>
                )}

                {products.length > 0 ? (
                  <div className="grid gap-4">
                    {products.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onRemove={() => handleDeleteProductClick(product)}
                        onEdit={() => handleEditProduct(product)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 border rounded-lg bg-slate-50">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                        <ImageIcon className="h-8 w-8 text-[#E5324B]" />
                      </div>
                      <h4 className="font-medium mb-2">Nenhum item adicionado</h4>
                      <p className="text-muted-foreground mb-4">
                        Clique em "Adicionar Produto" ou "Adicionar Imagem" para começar a criar seu cardápio.
                      </p>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => setShowAddProduct(true)}
                          variant="outline"
                          className="bg-red-50 text-[#E5324B] border-red-200 hover:bg-red-100 hover:text-[#d02a41]"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Adicionar Produto
                        </Button>
                        <Button
                          onClick={() => setShowAddImage(true)}
                          variant="outline"
                          className="bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 hover:text-blue-700"
                        >
                          <ImageIcon className="mr-2 h-4 w-4" />
                          Adicionar Imagem
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end mt-6 sticky bottom-4 z-10">
              <Button
                onClick={handleSaveMenu}
                size="lg"
                className="shadow-lg bg-[#E5324B] hover:bg-[#d02a41]"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar Alterações"
                )}
              </Button>
            </div>
          </div>

          {/* Preview Column */}
          {showPreview && (
            <ClientOnly>
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
                            products.length > 0
                              ? products.slice(0, 3)
                              : [
                                  {
                                    id: "preview-1",
                                    name: "Produto de Exemplo",
                                    description: "Descrição do produto de exemplo para visualização",
                                    imageUrl: "/placeholder.svg?height=80&width=80",
                                    externalLink: undefined,
                                    menuId: id,
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
            </ClientOnly>
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
