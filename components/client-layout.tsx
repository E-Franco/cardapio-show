"use client"

import type React from "react"

import { usePathname } from "next/navigation"
import { MainNav } from "@/components/main-nav"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAuthPage =
    pathname?.includes("/login") || pathname?.includes("/cadastro") || pathname?.includes("/esqueci-senha")

  return (
    <>
      {!isAuthPage && <MainNav />}
      <main>{children}</main>
    </>
  )
}
