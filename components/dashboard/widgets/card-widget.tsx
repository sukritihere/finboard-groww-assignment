"use client"

import { useEffect, useState } from "react"
import type { Widget } from "@/lib/store/dashboard-store"
import { testAPIConnection, getValueByPath } from "@/lib/api/api-client"
import { Loader2 } from "lucide-react"

interface CardWidgetProps {
  widget: Widget
}

export default function CardWidget({ widget }: CardWidgetProps) {
  const [data, setData] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)

      try {
        const result = await testAPIConnection(widget.apiUrl)

        if (!result.success || !result.data) {
          setError(result.error || "Failed to fetch data")
          return
        }

        let dataToDisplay = result.data
        if (Array.isArray(result.data) && result.data.length > 0) {
          dataToDisplay = result.data[0]
        }

        const displayData: Record<string, any> = {}

        const fieldsToDisplay =
          widget.selectedFields.length > 0 ? widget.selectedFields : Object.keys(dataToDisplay || {}).slice(0, 6)

        fieldsToDisplay.forEach((field) => {
          const value = getValueByPath(dataToDisplay, field)
          displayData[field] = value !== null && value !== undefined ? value : "-"
        })

        setData(displayData)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, widget.refreshInterval * 1000)
    return () => clearInterval(interval)
  }, [widget])

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-lg p-4 sm:p-6 backdrop-blur-sm h-full">
        <div className="flex items-center justify-center h-32">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-card border border-destructive/30 rounded-lg p-4 sm:p-6 backdrop-blur-sm h-full">
        <div className="text-center">
          <p className="text-destructive font-semibold text-sm">Error</p>
          <p className="text-destructive/70 text-xs mt-1 break-words">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card border border-border rounded-lg p-4 sm:p-6 backdrop-blur-sm hover:border-primary/50 transition-all duration-300 h-full">
      <h3 className="text-card-foreground font-semibold mb-4 text-base sm:text-lg truncate">{widget.title}</h3>
      <div className="space-y-2 sm:space-y-3">
        {Object.entries(data).length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-4">No data to display</p>
        ) : (
          Object.entries(data).map(([key, value]) => (
            <div
              key={key}
              className="flex justify-between items-start gap-2 pb-2 sm:pb-3 border-b border-border/50 last:border-0"
            >
              <span className="text-muted-foreground text-xs sm:text-sm font-medium truncate">{key}</span>
              <span className="text-card-foreground font-semibold text-xs sm:text-sm bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent text-right break-words max-w-[50%]">
                {String(value)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
