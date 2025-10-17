"use client"

import { useState } from "react"
import { useDashboardStore } from "@/lib/store/dashboard-store"
import { testAPIConnection, API_PRESETS } from "@/lib/api/api-client"
import { X, Check, AlertCircle, Loader2 } from "lucide-react"

interface AddWidgetDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export default function AddWidgetDrawer({ isOpen, onClose }: AddWidgetDrawerProps) {
  const { addWidget } = useDashboardStore()
  const [widgetType, setWidgetType] = useState<"chart" | "card" | "table" | null>(null)
  const [title, setTitle] = useState("")
  const [apiUrl, setApiUrl] = useState("")
  const [apiKey, setApiKey] = useState("")
  const [refreshInterval, setRefreshInterval] = useState(30)
  const [selectedFields, setSelectedFields] = useState<string[]>([])
  const [availableFields, setAvailableFields] = useState<string[]>([])
  const [testStatus, setTestStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [testMessage, setTestMessage] = useState("")
  const [chartType, setChartType] = useState<"line" | "bar">("line")
  const [xAxisField, setXAxisField] = useState("")
  const [yAxisField, setYAxisField] = useState("")
  const [chartColor, setChartColor] = useState("#3b82f6")

  const handleTestAPI = async () => {
    if (!apiUrl) {
      setTestStatus("error")
      setTestMessage("Please enter an API URL")
      return
    }

    setTestStatus("loading")
    const result = await testAPIConnection(apiUrl)

    if (result.success) {
      setTestStatus("success")
      setTestMessage(`API connection successful! ${result.fields?.length || 0} fields found.`)
      setAvailableFields(result.fields || [])
    } else {
      setTestStatus("error")
      setTestMessage(result.error || "Failed to connect to API")
    }
  }

  const handleAddWidget = () => {
    if (!widgetType || !title || !apiUrl) {
      alert("Please fill in all required fields")
      return
    }

    const newWidget = {
      id: `widget-${Date.now()}`,
      type: widgetType,
      title,
      apiUrl,
      apiKey: apiKey || undefined,
      refreshInterval,
      selectedFields,
      ...(widgetType === "chart" && {
        chartConfig: {
          chartType,
          xAxisField,
          yAxisField,
          color: chartColor,
        },
      }),
      position: 0,
    }

    addWidget(newWidget)
    resetForm()
    onClose()
  }

  const resetForm = () => {
    setWidgetType(null)
    setTitle("")
    setApiUrl("")
    setApiKey("")
    setRefreshInterval(30)
    setSelectedFields([])
    setAvailableFields([])
    setTestStatus("idle")
    setTestMessage("")
    setChartType("line")
    setXAxisField("")
    setYAxisField("")
    setChartColor("#3b82f6")
  }

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fade-in" onClick={onClose} />}

      <div
        className={`fixed right-0 top-0 h-screen w-full sm:w-96 bg-gradient-to-b from-slate-900 to-slate-950 border-l border-blue-900/30 z-50 overflow-y-auto transition-transform duration-300 ${
          isOpen ? "translate-x-0 animate-slide-in-right" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-slate-900 to-slate-950 border-b border-blue-900/30 p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Add Widget</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Widget Type Selection */}
          <div>
            <label className="block text-white font-semibold mb-3 text-sm">Widget Type</label>
            <div className="grid grid-cols-3 gap-2">
              {(["chart", "card", "table"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setWidgetType(type)}
                  className={`p-3 rounded-lg border-2 transition-all capitalize font-medium text-sm ${
                    widgetType === type
                      ? "border-blue-500 bg-blue-500/10 text-blue-400"
                      : "border-slate-700 bg-slate-800/50 text-slate-300 hover:border-slate-600"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Widget Title */}
          <div>
            <label className="block text-white font-semibold mb-2 text-sm">Widget Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Bitcoin Price"
              className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all"
            />
          </div>

          {/* API Presets */}
          {widgetType && (
            <div>
              <label className="block text-white font-semibold mb-2 text-sm">API Presets</label>
              <select
                onChange={(e) => {
                  const preset = API_PRESETS.find((p) => p.name === e.target.value)
                  if (preset) setApiUrl(preset.url)
                }}
                className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all text-sm"
              >
                <option value="">Choose a preset...</option>
                {API_PRESETS.map((preset) => (
                  <option key={preset.name} value={preset.name}>
                    {preset.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* API URL */}
          <div>
            <label className="block text-white font-semibold mb-2 text-sm">API URL</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="https://api.example.com/data"
                className="flex-1 px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all text-sm"
              />
              <button
                onClick={handleTestAPI}
                disabled={testStatus === "loading"}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-slate-600 disabled:to-slate-600 text-white rounded-lg transition-all font-medium text-sm flex items-center gap-2"
              >
                {testStatus === "loading" ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span className="hidden sm:inline">Testing</span>
                  </>
                ) : (
                  "Test"
                )}
              </button>
            </div>
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

          {/* API Key */}
          <div>
            <label className="block text-white font-semibold mb-2 text-sm">API Key (Optional)</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter API key if required"
              className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all text-sm"
            />
          </div>

          {/* Refresh Interval */}
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

          {/* Chart Configuration */}
          {widgetType === "chart" && availableFields.length > 0 && (
            <div className="space-y-4 p-4 bg-slate-800/30 rounded-lg border border-slate-700">
              <h3 className="text-white font-semibold text-sm">Chart Configuration</h3>

              <div>
                <label className="block text-slate-300 text-xs mb-2">Chart Type</label>
                <select
                  value={chartType}
                  onChange={(e) => setChartType(e.target.value as "line" | "bar")}
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="line">Line Chart</option>
                  <option value="bar">Bar Chart</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 text-xs mb-2">X-Axis Field</label>
                <select
                  value={xAxisField}
                  onChange={(e) => setXAxisField(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select field...</option>
                  {availableFields.map((field) => (
                    <option key={field} value={field}>
                      {field}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 text-xs mb-2">Y-Axis Field</label>
                <select
                  value={yAxisField}
                  onChange={(e) => setYAxisField(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select field...</option>
                  {availableFields.map((field) => (
                    <option key={field} value={field}>
                      {field}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 text-xs mb-2">Chart Color</label>
                <input
                  type="color"
                  value={chartColor}
                  onChange={(e) => setChartColor(e.target.value)}
                  className="w-full h-10 rounded cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* Field Selection */}
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

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-slate-700">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 text-white rounded-lg transition-all duration-200 border border-slate-700/50 hover:border-slate-600/50 font-medium text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleAddWidget}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg transition-all duration-200 font-medium text-sm shadow-lg hover:shadow-blue-500/50"
            >
              Add Widget
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
