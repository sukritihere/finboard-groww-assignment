"use client"

import { useState, useEffect } from "react"
import { useDashboardStore, type Widget } from "@/lib/store/dashboard-store"
import { testAPIConnection, API_PRESETS } from "@/lib/api/api-client"
import { X, Check, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

interface WidgetDrawerProps {
  isOpen: boolean
  onClose: () => void
  editingWidgetId?: string | null
  onShowToast?: (toast: { title: string; description?: string; type: "success" | "error" | "info" }) => void
}

export default function WidgetDrawer({ isOpen, onClose, editingWidgetId, onShowToast }: WidgetDrawerProps) {
  const { addWidget, updateWidget, widgets } = useDashboardStore()
  const editingWidget = editingWidgetId ? widgets.find((w) => w.id === editingWidgetId) : null

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

  useEffect(() => {
    if (editingWidget) {
      setWidgetType(editingWidget.type)
      setTitle(editingWidget.title)
      setApiUrl(editingWidget.apiUrl)
      setApiKey(editingWidget.apiKey || "")
      setRefreshInterval(editingWidget.refreshInterval)
      setSelectedFields(editingWidget.selectedFields)
      if (editingWidget.chartConfig) {
        setChartType(editingWidget.chartConfig.chartType)
        setXAxisField(editingWidget.chartConfig.xAxisField)
        setYAxisField(editingWidget.chartConfig.yAxisField)
        setChartColor(editingWidget.chartConfig.color)
      }
    } else {
      resetForm()
    }
  }, [editingWidget, isOpen])

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

  const handleSave = () => {
    if (!widgetType || !title || !apiUrl) {
      onShowToast?.({
        title: "Missing required fields",
        description: "Please fill in widget type, title, and API URL",
        type: "error",
      })
      return
    }

    const widgetData = {
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
    }

    if (editingWidget) {
      updateWidget(editingWidget.id, widgetData)
      onShowToast?.({ title: "Widget updated successfully", type: "success" })
    } else {
      addWidget({
        id: `widget-${Date.now()}`,
        position: 0,
        ...widgetData,
      } as Widget)
      onShowToast?.({ title: "Widget added successfully", type: "success" })
    }

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
        className={`fixed right-0 top-0 h-screen w-full sm:w-96 bg-card border-l border-border z-50 overflow-y-auto transition-transform duration-300 ${
          isOpen ? "translate-x-0 animate-slide-in-right" : "translate-x-full"
        }`}
      >
        <div className="sticky top-0 bg-card border-b border-border p-4 sm:p-6 flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold text-card-foreground">
            {editingWidget ? "Edit Widget" : "Add Widget"}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-6 w-6" />
          </Button>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          {!editingWidget && (
            <div>
              <Label className="text-base font-semibold mb-3 block">Widget Type</Label>
              <div className="grid grid-cols-3 gap-2">
                {(["chart", "card", "table"] as const).map((type) => (
                  <Button
                    key={type}
                    variant={widgetType === type ? "default" : "outline"}
                    onClick={() => setWidgetType(type)}
                    className="capitalize text-xs sm:text-sm"
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="title" className="text-sm">
              Widget Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Bitcoin Price"
              className="text-sm"
            />
          </div>

          {widgetType && (
            <div>
              <Label htmlFor="preset" className="text-sm">
                API Presets
              </Label>
              <Select
                onValueChange={(value) => {
                  const preset = API_PRESETS.find((p) => p.name === value)
                  if (preset) setApiUrl(preset.url)
                }}
              >
                <SelectTrigger id="preset" className="text-sm">
                  <SelectValue placeholder="Choose a preset..." />
                </SelectTrigger>
                <SelectContent>
                  {API_PRESETS.map((preset) => (
                    <SelectItem key={preset.name} value={preset.name}>
                      {preset.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label htmlFor="apiUrl" className="text-sm">
              API URL
            </Label>
            <div className="flex gap-2">
              <Input
                id="apiUrl"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="https://api.example.com/data"
                className="text-sm"
              />
              <Button onClick={handleTestAPI} disabled={testStatus === "loading"} size="sm">
                {testStatus === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Test"}
              </Button>
            </div>
            {testStatus !== "idle" && (
              <div
                className={`mt-2 p-3 rounded-lg flex items-center gap-2 text-sm animate-scale-in ${
                  testStatus === "success"
                    ? "bg-green-500/10 text-green-600 border border-green-500/30"
                    : testStatus === "error"
                      ? "bg-red-500/10 text-red-600 border border-red-500/30"
                      : "bg-blue-500/10 text-blue-600 border border-blue-500/30"
                }`}
              >
                {testStatus === "success" && <Check className="h-4 w-4" />}
                {testStatus === "error" && <AlertCircle className="h-4 w-4" />}
                {testMessage}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="apiKey" className="text-sm">
              API Key (Optional)
            </Label>
            <Input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter API key if required"
              className="text-sm"
            />
          </div>

          <div>
            <Label htmlFor="refreshInterval" className="text-sm">
              Refresh Interval (seconds)
            </Label>
            <Input
              id="refreshInterval"
              type="number"
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Math.max(5, Number.parseInt(e.target.value) || 30))}
              min="5"
              max="3600"
              className="text-sm"
            />
          </div>

          {widgetType === "chart" && availableFields.length > 0 && (
            <div className="space-y-4 p-4 bg-muted/50 rounded-lg border border-border">
              <h3 className="font-semibold text-sm">Chart Configuration</h3>

              <div>
                <Label htmlFor="chartType" className="text-sm">
                  Chart Type
                </Label>
                <Select value={chartType} onValueChange={(value) => setChartType(value as "line" | "bar")}>
                  <SelectTrigger id="chartType" className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="line">Line Chart</SelectItem>
                    <SelectItem value="bar">Bar Chart</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="xAxis" className="text-sm">
                  X-Axis Field
                </Label>
                <Select value={xAxisField} onValueChange={setXAxisField}>
                  <SelectTrigger id="xAxis" className="text-sm">
                    <SelectValue placeholder="Select field..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableFields.map((field) => (
                      <SelectItem key={field} value={field}>
                        {field}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="yAxis" className="text-sm">
                  Y-Axis Field
                </Label>
                <Select value={yAxisField} onValueChange={setYAxisField}>
                  <SelectTrigger id="yAxis" className="text-sm">
                    <SelectValue placeholder="Select field..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableFields.map((field) => (
                      <SelectItem key={field} value={field}>
                        {field}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="chartColor" className="text-sm">
                  Chart Color
                </Label>
                <Input
                  id="chartColor"
                  type="color"
                  value={chartColor}
                  onChange={(e) => setChartColor(e.target.value)}
                />
              </div>
            </div>
          )}

          {availableFields.length > 0 && widgetType !== "chart" && (
            <div className="space-y-4 p-4 bg-muted/50 rounded-lg border border-border">
              <h3 className="font-semibold text-sm">Select Fields to Display</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {availableFields.map((field) => (
                  <div key={field} className="flex items-center gap-3">
                    <Checkbox
                      id={field}
                      checked={selectedFields.includes(field)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedFields([...selectedFields, field])
                        } else {
                          setSelectedFields(selectedFields.filter((f) => f !== field))
                        }
                      }}
                    />
                    <Label htmlFor={field} className="text-sm cursor-pointer">
                      {field}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t border-border">
            <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent text-sm">
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex-1 text-sm">
              {editingWidget ? "Save Changes" : "Add Widget"}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
