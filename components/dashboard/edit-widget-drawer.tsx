"use client"

import { useState, useEffect } from "react"
import { useDashboardStore } from "@/lib/store/dashboard-store"
import { testAPIConnection } from "@/lib/api/api-client"
import { X, Check, AlertCircle, Loader2 } from "lucide-react"

interface EditWidgetDrawerProps {
  widgetId: string
  onClose: () => void
}

export default function EditWidgetDrawer({ widgetId, onClose }: EditWidgetDrawerProps) {
  const { widgets, updateWidget } = useDashboardStore()
  const widget = widgets.find((w) => w.id === widgetId)

  const [title, setTitle] = useState("")
  const [refreshInterval, setRefreshInterval] = useState(30)
  const [selectedFields, setSelectedFields] = useState<string[]>([])
  const [availableFields, setAvailableFields] = useState<string[]>([])
  const [testStatus, setTestStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [testMessage, setTestMessage] = useState("")

  useEffect(() => {
    if (widget) {
      setTitle(widget.title)
      setRefreshInterval(widget.refreshInterval)
      setSelectedFields(widget.selectedFields)
    }
  }, [widget])

  if (!widget) return null

  const handleTestAPI = async () => {
    setTestStatus("loading")
    const result = await testAPIConnection(widget.apiUrl)

    if (result.success) {
      setTestStatus("success")
      setTestMessage(`API connection successful! ${result.fields?.length || 0} fields found.`)
      setAvailableFields(result.fields || [])
    } else {
      setTestStatus("error")
      setTestMessage(result.error || "Failed to connect to API")
    }
  }

  const handleSave = () => {
    updateWidget(widget.id, {
      title,
      refreshInterval,
      selectedFields,
    })
    onClose()
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fade-in" onClick={onClose} />

      <div className="fixed right-0 top-0 h-screen w-full sm:w-96 bg-gradient-to-b from-slate-900 to-slate-950 border-l border-blue-900/30 z-50 overflow-y-auto transition-transform duration-300 translate-x-0 animate-slide-in-right">
        <div className="sticky top-0 bg-gradient-to-r from-slate-900 to-slate-950 border-b border-blue-900/30 p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Edit Widget</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-white font-semibold mb-2 text-sm">Widget Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all"
            />
          </div>

          <div>
            <label className="block text-white font-semibold mb-2 text-sm">Refresh Interval (seconds)</label>
            <input
              type="number"
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Math.max(5, Number.parseInt(e.target.value) || 30))}
              min="5"
              max="3600"
              className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all text-sm"
            />
          </div>

          <div>
            <button
              onClick={handleTestAPI}
              disabled={testStatus === "loading"}
              className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-slate-600 disabled:to-slate-600 text-white rounded-lg transition-all font-medium text-sm flex items-center justify-center gap-2"
            >
              {testStatus === "loading" ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Testing
                </>
              ) : (
                "Test API Connection"
              )}
            </button>
            {testStatus !== "idle" && (
              <div
                className={`mt-2 p-3 rounded-lg flex items-center gap-2 text-sm animate-scale-in ${
                  testStatus === "success"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                    : testStatus === "error"
                      ? "bg-red-500/10 text-red-400 border border-red-500/30"
                      : "bg-blue-500/10 text-blue-400 border border-blue-500/30"
                }`}
              >
                {testStatus === "success" && <Check size={16} />}
                {testStatus === "error" && <AlertCircle size={16} />}
                {testMessage}
              </div>
            )}
          </div>

          {availableFields.length > 0 && (
            <div className="space-y-4 p-4 bg-slate-800/30 rounded-lg border border-slate-700">
              <h3 className="text-white font-semibold text-sm">Select Fields to Display</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {availableFields.map((field) => (
                  <label
                    key={field}
                    className="flex items-center gap-3 cursor-pointer hover:bg-slate-700/30 p-2 rounded transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedFields.includes(field)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedFields([...selectedFields, field])
                        } else {
                          setSelectedFields(selectedFields.filter((f) => f !== field))
                        }
                      }}
                      className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-600 cursor-pointer"
                    />
                    <span className="text-slate-300 text-sm">{field}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t border-slate-700">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 text-white rounded-lg transition-all duration-200 border border-slate-700/50 hover:border-slate-600/50 font-medium text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg transition-all duration-200 font-medium text-sm shadow-lg hover:shadow-blue-500/50"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
