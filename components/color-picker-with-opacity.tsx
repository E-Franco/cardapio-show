"use client"

import { useState, useEffect } from "react"
import { HexColorPicker, HexColorInput } from "react-colorful"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { InfoIcon as Transparency, Check, X } from "lucide-react"

interface ColorPickerWithOpacityProps {
  color: string
  onChange: (color: string) => void
  onTempChange?: (color: string) => void // Callback for temporary changes
  allowTransparent?: boolean
  label?: string
  previewClassName?: string
}

export default function ColorPickerWithOpacity({
  color,
  onChange,
  onTempChange,
  allowTransparent = true,
  label,
  previewClassName,
}: ColorPickerWithOpacityProps) {
  const [hexColor, setHexColor] = useState("#ffffff")
  const [opacity, setOpacity] = useState(100)
  const [isTransparent, setIsTransparent] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  // Temporary states for editing
  const [tempHexColor, setTempHexColor] = useState("#ffffff")
  const [tempOpacity, setTempOpacity] = useState(100)
  const [tempIsTransparent, setTempIsTransparent] = useState(false)

  // Parse the initial color on component mount or when color prop changes
  useEffect(() => {
    console.log("ColorPicker recebeu cor:", color)

    if (!color || color === "transparent") {
      setIsTransparent(true)
      setTempIsTransparent(true)
      setHexColor("#ffffff")
      setTempHexColor("#ffffff")
      setOpacity(100)
      setTempOpacity(100)
      return
    }

    setIsTransparent(false)
    setTempIsTransparent(false)

    // Handle rgba format - converter para hex
    if (color.startsWith("rgba")) {
      try {
        const rgbaMatch = color.match(/rgba$$\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*$$/)

        if (rgbaMatch && rgbaMatch.length === 5) {
          const r = Number.parseInt(rgbaMatch[1], 10)
          const g = Number.parseInt(rgbaMatch[2], 10)
          const b = Number.parseInt(rgbaMatch[3], 10)
          const a = Number.parseFloat(rgbaMatch[4])

          const hex = rgbToHex(r, g, b)
          const opacityValue = Math.round(a * 100)

          console.log(`Convertendo ${color} para hex: ${hex}, opacidade: ${opacityValue}`)

          setHexColor(hex)
          setTempHexColor(hex)
          setOpacity(opacityValue)
          setTempOpacity(opacityValue)
          return
        } else {
          console.warn("Formato RGBA não reconhecido:", color)
        }
      } catch (error) {
        console.error("Erro ao processar cor RGBA:", error)
      }
    }

    // Handle hex format
    if (color.startsWith("#")) {
      const hex = color.substring(0, 7)
      console.log(`Usando cor hex: ${hex}`)
      setHexColor(hex)
      setTempHexColor(hex)
      setOpacity(100)
      setTempOpacity(100)
      return
    }

    // Fallback to default color if format is not recognized
    console.warn("Unrecognized color format, using default:", color)
    setHexColor("#ffffff")
    setTempHexColor("#ffffff")
    setOpacity(100)
    setTempOpacity(100)
  }, [color])

  // Convert rgb to hex
  const rgbToHex = (r: number, g: number, b: number) => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
  }

  // Convert hex to rgb
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? {
          r: Number.parseInt(result[1], 16),
          g: Number.parseInt(result[2], 16),
          b: Number.parseInt(result[3], 16),
        }
      : { r: 0, g: 0, b: 0 }
  }

  // Get color string from temp values
  const getTempColorString = () => {
    if (tempIsTransparent) {
      return "transparent"
    }
    const { r, g, b } = hexToRgb(tempHexColor)
    return `rgba(${r}, ${g}, ${b}, ${tempOpacity / 100})`
  }

  // Handle temporary color change from the color picker
  const handleTempColorChange = (newHexColor: string) => {
    setTempHexColor(newHexColor)

    // Call onTempChange if provided
    if (onTempChange) {
      if (tempIsTransparent) {
        onTempChange("transparent")
      } else {
        // Retornar apenas o valor hexadecimal
        onTempChange(newHexColor)
      }
    }
  }

  // Handle temporary opacity change
  const handleTempOpacityChange = (value: number[]) => {
    const newOpacity = value[0]
    setTempOpacity(newOpacity)

    // Call onTempChange if provided
    if (onTempChange && !tempIsTransparent) {
      // Retornar apenas o valor hexadecimal
      onTempChange(tempHexColor)
    }
  }

  // Handle temporary transparent toggle
  const handleTempTransparentToggle = () => {
    const newIsTransparent = !tempIsTransparent
    setTempIsTransparent(newIsTransparent)

    // Call onTempChange if provided
    if (onTempChange) {
      if (newIsTransparent) {
        onTempChange("transparent")
      } else {
        const { r, g, b } = hexToRgb(tempHexColor)
        onTempChange(`rgba(${r}, ${g}, ${b}, ${tempOpacity / 100})`)
      }
    }
  }

  // Apply changes when user clicks save
  const handleSave = () => {
    setHexColor(tempHexColor)
    setOpacity(tempOpacity)
    setIsTransparent(tempIsTransparent)

    if (tempIsTransparent) {
      onChange("transparent")
    } else {
      // Retornar apenas o valor hexadecimal
      onChange(tempHexColor)
    }

    setIsOpen(false)
  }

  // Reset temporary values when user cancels
  const handleCancel = () => {
    setTempHexColor(hexColor)
    setTempOpacity(opacity)
    setTempIsTransparent(isTransparent)

    // Reset to original color if onTempChange is provided
    if (onTempChange) {
      if (isTransparent) {
        onTempChange("transparent")
      } else {
        // Retornar apenas o valor hexadecimal
        onTempChange(hexColor)
      }
    }

    setIsOpen(false)
  }

  // Initialize temporary values when opening the popover
  const handleOpenChange = (open: boolean) => {
    if (open) {
      setTempHexColor(hexColor)
      setTempOpacity(opacity)
      setTempIsTransparent(isTransparent)
    } else {
      // If closing without saving, reset temp values
      if (onTempChange) {
        if (isTransparent) {
          onTempChange("transparent")
        } else {
          // Retornar apenas o valor hexadecimal
          onTempChange(hexColor)
        }
      }
    }
    setIsOpen(open)
  }

  // Get the display color for the color swatch
  const getDisplayColor = () => {
    if (isTransparent) {
      return "transparent"
    }
    return hexColor
  }

  return (
    <div className="flex flex-col gap-2">
      {label && <Label className="mb-1">{label}</Label>}

      <Popover open={isOpen} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={`w-full flex justify-between items-center h-10 px-3 ${previewClassName}`}
            style={{
              backgroundColor: getDisplayColor() === "transparent" ? undefined : getDisplayColor(),
              borderColor: getDisplayColor() === "transparent" ? undefined : "transparent",
              color: getDisplayColor() === "transparent" ? undefined : getContrastColor(hexColor),
            }}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded border border-border"
                style={{
                  backgroundColor: getDisplayColor(),
                  backgroundImage: isTransparent
                    ? "linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc), linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc)"
                    : "none",
                  backgroundSize: "10px 10px",
                  backgroundPosition: "0 0, 5px 5px",
                }}
              />
              <span className="text-sm truncate">{isTransparent ? "Transparente" : hexColor}</span>
            </div>
            <span className="sr-only">Abrir seletor de cor</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-4" align="start">
          <div className="space-y-4">
            <HexColorPicker color={tempHexColor} onChange={handleTempColorChange} />

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">#</span>
              <HexColorInput
                color={tempHexColor}
                onChange={handleTempColorChange}
                prefixed={false}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="opacity-slider">Opacidade</Label>
                <span className="text-sm">{tempOpacity}%</span>
              </div>
              <Slider
                id="opacity-slider"
                min={0}
                max={100}
                step={1}
                value={[tempOpacity]}
                onValueChange={handleTempOpacityChange}
                disabled={tempIsTransparent}
                className="cursor-pointer"
              />

              <div
                className="h-8 mt-2 rounded border"
                style={{
                  background: `linear-gradient(to right, transparent, ${tempHexColor})`,
                  opacity: tempOpacity / 100,
                }}
              />
            </div>

            {allowTransparent && (
              <div className="pt-2">
                <Button
                  variant={tempIsTransparent ? "default" : "outline"}
                  className="w-full"
                  onClick={handleTempTransparentToggle}
                >
                  <Transparency className="mr-2 h-4 w-4" />
                  {tempIsTransparent ? "Cor Selecionada" : "Tornar Transparente"}
                </Button>
              </div>
            )}

            <div className="flex justify-between gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={handleCancel}>
                <X className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
              <Button className="flex-1" onClick={handleSave}>
                <Check className="mr-2 h-4 w-4" />
                Aplicar
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

// Helper function to determine if text should be white or black based on background color
function getContrastColor(hexColor: string) {
  // Convert hex to RGB
  const r = Number.parseInt(hexColor.slice(1, 3), 16)
  const g = Number.parseInt(hexColor.slice(3, 5), 16)
  const b = Number.parseInt(hexColor.slice(5, 7), 16)

  // Calculate luminance (perceived brightness)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

  // Return white for dark colors, black for light colors
  return luminance > 0.5 ? "#000000" : "#ffffff"
}
