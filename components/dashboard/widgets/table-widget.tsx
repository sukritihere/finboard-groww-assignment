"use client"

import { useEffect, useState } from "react"
import type { Widget } from "@/lib/store/dashboard-store"
import { testAPIConnection, getValueByPath } from "@/lib/api/api-client"
import { Loader2, ChevronLeft, ChevronRight, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface TableWidgetProps {
  widget: Widget
}

export default function TableWidget({ widget }: TableWidgetProps) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const itemsPerPage = 5

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

        let tableData = Array.isArray(result.data) ? result.data : [result.data]

        if (!Array.isArray(result.data) && typeof result.data === "object") {
          const firstArrayValue = Object.values(result.data).find((v) => Array.isArray(v))
          if (firstArrayValue) {
            tableData = firstArrayValue as any[]
          }
        }

        setData(tableData)
        setCurrentPage(1)
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

  const filteredData = data.filter((row) => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return Object.values(row).some((val) => String(val).toLowerCase().includes(searchLower))
  })

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortField) return 0
    const aVal = getValueByPath(a, sortField)
    const bVal = getValueByPath(b, sortField)

    if (aVal === null || bVal === null) return 0

    const comparison = String(aVal).localeCompare(String(bVal))
    return sortOrder === "asc" ? comparison : -comparison
  })

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
        <div className="flex items-center justify-center h-32">
          <Loader2 className="h-6 w-6 text-primary animate-spin" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-card border border-destructive/30 rounded-lg p-4 sm:p-6">
        <div className="text-center">
          <p className="text-destructive font-semibold text-sm">Error</p>
          <p className="text-destructive/70 text-xs mt-1 break-words">{error}</p>
        </div>
      </div>
    )
  }

  const displayFields = widget.selectedFields.length > 0 ? widget.selectedFields : Object.keys(data[0] || {})
  const totalPages = Math.ceil(sortedData.length / itemsPerPage)
  const startIdx = (currentPage - 1) * itemsPerPage
  const paginatedData = sortedData.slice(startIdx, startIdx + itemsPerPage)

  return (
    <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
      <h3 className="text-card-foreground font-semibold mb-4 text-base sm:text-lg truncate">{widget.title}</h3>

      <div className="mb-4 flex items-center gap-2 px-3 py-2 bg-input border border-border rounded-lg">
        <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <Input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setCurrentPage(1)
          }}
          className="flex-1 bg-transparent border-0 text-card-foreground placeholder-muted-foreground focus:outline-none focus:ring-0 text-xs sm:text-sm"
        />
      </div>

      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <table className="w-full text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-border">
              {displayFields.map((field) => (
                <th
                  key={field}
                  onClick={() => {
                    if (sortField === field) {
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                    } else {
                      setSortField(field)
                      setSortOrder("asc")
                    }
                  }}
                  className="text-left py-2 sm:py-3 px-2 sm:px-4 text-muted-foreground font-semibold text-xs uppercase tracking-wider cursor-pointer hover:bg-muted/50 transition-colors whitespace-nowrap"
                >
                  {field}
                  {sortField === field && <span className="ml-1">{sortOrder === "asc" ? "↑" : "↓"}</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={displayFields.length}
                  className="py-8 px-2 sm:px-4 text-center text-muted-foreground text-sm"
                >
                  No data available
                </td>
              </tr>
            ) : (
              paginatedData.map((row, idx) => (
                <tr key={idx} className="border-b border-border hover:bg-muted/50 transition-colors duration-200">
                  {displayFields.map((field) => (
                    <td
                      key={field}
                      className="py-2 sm:py-3 px-2 sm:px-4 text-card-foreground text-xs sm:text-sm truncate"
                    >
                      {String(getValueByPath(row, field) || "-")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 pt-4 border-t border-border text-xs sm:text-sm">
        <span className="text-muted-foreground font-medium">
          Page <span className="text-primary">{currentPage}</span> of <span className="text-primary">{totalPages}</span>{" "}
          ({sortedData.length} total)
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
