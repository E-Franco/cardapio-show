"use client"

import Link from "next/link"
import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  ArrowLeft,
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
  Plus,
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
import { useToast } from "@/components/ui/use-toast"
import { MenuService, type Product, type TitlePosition } from "@/lib/services/menu-service"
import { UploadService } from "@/lib/services/upload-service"
import { useAuth } from "@/components/auth-provider"
import ClientOnly from "@/components/client-only"

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

// Interface para produtos temporários com arquivos
interface TempProduct extends Product {
  imageFile?: File
}

export default function CriarCardapio() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const { toast } = useToast()
  const isMounted = useRef(true)

  // Estados básicos
  const [isLoading, setIsLoading] = useState(false)
  const [menuName, setMenuName] = useState("")
  const [bannerColor, setBannerColor] = useState("#E5324B")
  const [tempBannerColor, setTempBannerColor] = useState("#E5324B")
  const [bannerImage, setBannerImage] = useState<string | undefined>(undefined)
  const [bannerImageFile, setBannerImageFile] = useState<File | null>(null)
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
  const [tempProducts, setTempProducts] = useState<TempProduct[]>([])
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [showAddImage, setShowAddImage] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editingProduct, setEditingProduct] = useState<TempProduct | null>(null)
  const [isDeleteProductDialogOpen, setIsDeleteProductDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<TempProduct | null>(null)

  // Social media states
  const [instagram, setInstagram] = useState("")
  const [facebook, setFacebook] = useState("")
  const [twitter, setTwitter] = useState("")

  // Verificar autenticação
  useEffect(() => {
    isMounted.current = true
    
    if (!authLoading && !user) {
      router.push("/login")
    }
    
    return () => {
      isMounted.current = false
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

  const handleAddProduct = (product: Omit<Product, "id" | "menuId" | "orderIndex"> & { imageFile?: File }) => {
    const newProduct = {
      ...product,
      id: Date.now().toString(),
      menuId: "temp",
      orderIndex: tempProducts.length,
      type: "product",
      imageFile: product.imageFile,
      // Se temos um arquivo de imagem, usamos a URL de preview temporária
      imageUrl: product.imageFile ? URL.createObjectURL(product.imageFile) : product.imageUrl,
    }
    setTempProducts([...tempProducts, newProduct])
    setShowAddProduct(false)
    
    toast({
      title: "Produto adicionado",
      description: "O produto foi adicionado ao cardápio. As imagens serão enviadas quando você salvar o cardápio.",
    })
  }

  const handleAddImage = (imageFile: File | null, previewUrl: string) => {
    const newImage = {
      id: Date.now().toString(),
      name: "Imagem",
      imageUrl: previewUrl,
      imageFile: imageFile,
      menuId: "temp",
      orderIndex: tempProducts.length,
      type: "image" as const,
    }
    setTempProducts([...tempProducts, newImage])
    setShowAddImage(false)
    
    toast({
      title: "Imagem adicionada",
      description: "A imagem foi adicionada ao cardápio. Ela será enviada quando você salvar o cardápio.",
    })
  }

  const handleEditProduct = (product: TempProduct) => {
    setEditingProduct(product)
    if (product.type === "image") {
      setShowAddImage(true)
    } else {
      setShowAddProduct(true)
    }
  }

  const handleUpdateProduct = (updatedProduct: Omit<Product, "id" | "menuId" | "orderIndex"> & { imageFile?: File }) => {
    if (!editingProduct) return

    const updated = {
      ...editingProduct,
      ...updatedProduct,
      // Se temos um novo arquivo de imagem, atualizamos a URL de preview
      imageUrl: updatedProduct.imageFile 
        ? URL.createObjectURL(updatedProduct.imageFile) 
        : updatedProduct.imageUrl || editingProduct.imageUrl,
      imageFile: updatedProduct.imageFile || editingProduct.imageFile,
    }

    setTempProducts(tempProducts.map((p) => (p.id === editingProduct.id ? updated : p)))
    setShowAddProduct(false)
    setEditingProduct(null)
    
    toast({
      title: "Produto atualizado",
      description: "O produto foi atualizado. As alterações serão salvas quando você salvar o cardápio.",
    })
  }

  const handleDeleteProductClick = (product: TempProduct) => {
    setSelectedProduct(product)
    setIsDeleteProductDialogOpen(true)
  }

  const handleDeleteProduct = () => {
    if (!selectedProduct) return

    // Se o produto tem uma URL de preview local, revogá-la
    if (selectedProduct.imageUrl && selectedProduct.imageUrl.startsWith("blob:")) {
      URL.revokeObjectURL(selectedProduct.imageUrl)
    }

    setTempProducts(tempProducts.filter((p) => p.id !== selectedProduct.id))
    setIsDeleteProductDialogOpen(false)
    
    toast({
      title: "Item removido",
      description: `O ${selectedProduct.type === "image" ? "imagem" : "produto"} foi removido do cardápio.`,
    })
  }

  const handleBannerImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

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

    // Se já temos uma URL de preview, revogá-la
    if (bannerImage && bannerImage.startsWith("blob:")) {
      URL.revokeObjectURL(bannerImage)
    }

    // Criar preview local
    const previewUrl = URL.createObjectURL(file)
    setBannerImage(previewUrl)
    setBannerImageFile(file)
    
    toast({
      title: "Imagem selecionada",
      description: "A imagem do banner será enviada quando você salvar o cardápio.",
    })
  }

  const handleRemoveBannerImage = () => {
    // Se temos uma URL de preview local, revogá-la
    if (bannerImage && bannerImage.startsWith("blob:")) {
      URL.revokeObjectURL(bannerImage)
    }

    setBannerImage(undefined)
    setBannerImageFile(null)
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
      // Primeiro, fazemos upload das imagens
      let finalBannerImage = bannerImage
      
      // Se temos um arquivo de banner, fazer upload
      if (bannerImageFile) {
        try {
          finalBannerImage = await UploadService.uploadFile(bannerImageFile, "banners")
          console.log("Banner image uploaded:", finalBannerImage)
        } catch (error) {
          console.error("Error uploading banner image:", error)
          // Continuamos com a URL local em caso de erro
        }
      }

      // Create menu
      const newMenu = await MenuService.createMenu({
        name: menuName || "Novo Cardápio",
        bannerColor,
        bannerImage: finalBannerImage,
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
          // Se temos um arquivo de imagem, fazer upload
          let finalImageUrl = product.imageUrl
          if (product.imageFile) {
            try {
              finalImageUrl = await UploadService.uploadFile(product.imageFile, "images")
              console.log("Image uploaded:", finalImageUrl)
            } catch (error) {
              console.error("Error uploading image:", error)
              // Continuamos com a URL local em caso de erro
            }
          }
          
          await MenuService.addImage({
            imageUrl: finalImageUrl || "",
            menuId: newMenu.id,
            orderIndex: i,
          })
        } else {
          // Se temos um arquivo de imagem, fazer upload
          let finalImageUrl = product.imageUrl
          if (product.imageFile) {
            try {
              finalImageUrl = await UploadService.uploadFile(product.imageFile, "products")
              console.log("Product image uploaded:", finalImageUrl)
            } catch (error) {
              console.error("Error uploading product image:", error)
              // Continuamos com a URL local em caso de erro
            }
          }
          
          await MenuService.addProduct({
            name: product.name,
            description: product.description,
            price: product.price,
            imageUrl: finalImageUrl,
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

      if (!isMounted.current) return

      toast({
        title: "Cardápio criado com sucesso!",
        description: "Seu cardápio foi salvo e já está disponível para compartilhamento.",
      })

      // Navigate back to home page after saving
      router.push("/")
    } catch (error) {
      console.error("Error saving menu:", error)
      
      if (!isMounted.current) return
      
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar o cardápio. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      if (isMounted.current) {
        setIsSaving(false)
      }
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
                    <ClientOnly>
                      {bannerImage ? (
                        <div className="w-full relative">
                          {/* Div para a cor de fundo */}
                          <div className="absolute inset-0" style={{ backgroundColor: tempBannerColor }}></div>

                          {/* Imagem por cima da cor */}
                          <img
                            src={bannerImage || "/placeholder.svg"}
                            alt={menuName}
                            className="w-full object-contain relative z-10"
                            style={{ display: "block" }}
                          />

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
                    </ClientOnly>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2 mt-6">
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
                      />
                      {bannerImage && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={handleRemoveBannerImage}
                          className="shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    {bannerImageFile && (
                      <p className="text-xs text-muted-foreground mt-2">
                        A imagem será enviada quando você salvar o cardápio.
                      </p>
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

                {tempProducts.length > 0 ? (
                  <div className="grid gap-4">
                    {tempProducts.map((product) => (
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
                          onClick\
