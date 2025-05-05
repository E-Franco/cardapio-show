import { Loader2 } from "lucide-react"

interface LoadingFallbackProps {
  message?: string
  size?: "sm" | "md" | "lg"
}

export function LoadingFallback({ message = "Carregando...", size = "md" }: LoadingFallbackProps) {
  const sizeClass = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  }

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <Loader2 className={`${sizeClass[size]} animate-spin text-[#E5324B]`} />
      {message && <p className="mt-2 text-sm text-muted-foreground">{message}</p>}
    </div>
  )
}
