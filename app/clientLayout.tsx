"use client"

import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/components/auth-provider"
import { MainNav } from "@/components/main-nav"
import { Toaster } from "@/components/ui/toaster"
import { usePathname } from "next/navigation"

const inter = Inter({ subsets: ["latin"] })

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname()

  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <AuthProvider>
          {!pathname?.includes("/login") &&
            !pathname?.includes("/cadastro") &&
            !pathname?.includes("/esqueci-senha") && <MainNav />}
          <main>{children}</main>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}
