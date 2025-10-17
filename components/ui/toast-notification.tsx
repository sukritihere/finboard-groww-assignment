"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface Toast {
  id: string
  title: string
  description?: string
  type: "success" | "error" | "info"
  duration?: number
}

interface ToastNotificationProps {
  toast: Toast
  onClose: (id: string) => void
}

export function ToastNotification({ toast, onClose }: ToastNotificationProps) {
  useEffect(() => {
    if (toast.duration !== 0) {
      const timer = setTimeout(() => onClose(toast.id), toast.duration || 3000)
      return () => clearTimeout(timer)
    }
  }, [toast, onClose])

  const bgColor = {
    success: "bg-green-500/10 border-green-500/30",
    error: "bg-red-500/10 border-red-500/30",
    info: "bg-blue-500/10 border-blue-500/30",
  }[toast.type]

  const textColor = {
    success: "text-green-600",
    error: "text-red-600",
    info: "text-blue-600",
  }[toast.type]

  return (
    <div className={`${bgColor} border rounded-lg p-4 flex items-start gap-3 animate-slide-in-right`}>
      <div className="flex-1">
        <p className={`font-semibold text-sm ${textColor}`}>{toast.title}</p>
        {toast.description && <p className={`text-xs mt-1 ${textColor}`}>{toast.description}</p>}
      </div>
      <Button variant="ghost" size="icon" onClick={() => onClose(toast.id)} className="h-6 w-6">
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = (toast: Omit<Toast, "id">) => {
    const id = `toast-${Date.now()}`
    setToasts((prev) => [...prev, { ...toast, id }])
    return id
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return { toasts, addToast, removeToast }
}
