"use client"

import { useState, useCallback } from "react"

export function useExternalLinkModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [url, setUrl] = useState<string | null>(null)
  const [title, setTitle] = useState<string>("Conteúdo externo")

  const openModal = useCallback((newUrl: string, newTitle?: string) => {
    setUrl(newUrl)
    if (newTitle) setTitle(newTitle)
    setIsOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    setIsOpen(false)
  }, [])

  return {
    isOpen,
    url,
    title,
    openModal,
    closeModal,
  }
}
