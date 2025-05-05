import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth-provider"
import { ErrorProvider } from "@/components/error-provider"
import { ApiErrorHandler } from "@/components/api-error-handler"
import { ErrorBoundary } from "@/components/error-boundary"

// Carrega a fonte Inter com subconjunto latino
const inter = Inter({
  subsets: ["latin"],
  display: "swap", // Melhora a performance de carregamento da fonte
})

// Metadados da aplicação
export const metadata: Metadata = {
  title: "CardápioShow",
  description: "Crie e compartilhe cardápios digitais personalizados",
  viewport: "width=device-width, initial-scale=1",
  applicationName: "CardápioShow",
  authors: [{ name: "CardápioShow Team" }],
  keywords: ["cardápio", "menu", "digital", "restaurante", "comida"],
    generator: 'v0.dev'
}

/**
 * Layout principal da aplicação
 *
 * Configura os provedores globais e a estrutura básica da aplicação.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <ErrorProvider>
            <ErrorBoundary>
              <AuthProvider>
                <ApiErrorHandler />
                <main className="min-h-screen">{children}</main>
                <Toaster />
              </AuthProvider>
            </ErrorBoundary>
          </ErrorProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
