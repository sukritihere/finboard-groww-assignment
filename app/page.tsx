"use client"

import { useEffect, useState } from "react"
import { useDashboardStore } from "@/lib/store/dashboard-store"
import DashboardHeader from "@/components/dashboard/dashboard-header"
import DashboardGrid from "@/components/dashboard/dashboard-grid"
import WidgetDrawer from "@/components/dashboard/widget-drawer"
import { ToastNotification, useToast, type Toast } from "@/components/ui/toast-notification"

export default function Home() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [editingWidgetId, setEditingWidgetId] = useState<string | null>(null)
  const [theme, setTheme] = useState<"light" | "dark">("dark")
  const { loadFromStorage } = useDashboardStore()
  const { toasts, addToast, removeToast } = useToast()

  useEffect(() => {
    loadFromStorage()
    const savedTheme = localStorage.getItem("finboard-theme") as "light" | "dark" | null
    if (savedTheme) {
      setTheme(savedTheme)
      document.documentElement.classList.toggle("dark", savedTheme === "dark")
    } else {
      document.documentElement.classList.add("dark")
    }
  }, [loadFromStorage])

  const handleThemeToggle = () => {
    const newTheme = theme === "dark" ? "light" : "dark"
    setTheme(newTheme)
    localStorage.setItem("finboard-theme", newTheme)
    document.documentElement.classList.toggle("dark", newTheme === "dark")
  }

  const handleAddWidget = () => {
    setEditingWidgetId(null)
    setIsDrawerOpen(true)
  }

  const handleEditWidget = (widgetId: string) => {
    setEditingWidgetId(widgetId)
    setIsDrawerOpen(true)
  }

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false)
    setEditingWidgetId(null)
  }

  const handleShowToast = (toast: Omit<Toast, "id">) => {
    addToast(toast)
  }

  return (
    <main className="min-h-screen bg-background transition-colors duration-300">
      <DashboardHeader
        onAddWidget={handleAddWidget}
        theme={theme}
        onThemeToggle={handleThemeToggle}
        onShowToast={handleShowToast}
      />
      <DashboardGrid onEditWidget={handleEditWidget} />
      <WidgetDrawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        editingWidgetId={editingWidgetId}
        onShowToast={handleShowToast}
      />

      <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
        {toasts.map((toast) => (
          <ToastNotification key={toast.id} toast={toast} onClose={removeToast} />
        ))}
      </div>
    </main>
  )
}
