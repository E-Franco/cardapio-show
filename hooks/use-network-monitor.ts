"use client"

import { useState, useEffect, useCallback } from "react"
import { useErrorContext } from "@/components/error-provider"

export function useNetworkMonitor() {
  const [isOnline, setIsOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true)
  const { captureMessage } = useErrorContext()

  const handleOnline = useCallback(() => {
    setIsOnline(true)
    captureMessage("Conexão com a internet restaurada", {
      severity: "success",
      title: "Você está online novamente",
    })
  }, [captureMessage])

  const handleOffline = useCallback(() => {
    setIsOnline(false)
    captureMessage("Conexão com a internet perdida", {
      severity: "warning",
      title: "Você está offline",
      action: {
        label: "Tentar reconectar",
        onClick: () => {
          window.location.reload()
        },
      },
    })
  }, [captureMessage])

  useEffect(() => {
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [handleOnline, handleOffline])

  return { isOnline }
}
