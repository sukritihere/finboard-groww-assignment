"use client"

import { useEffect, useState } from "react"
import type { Widget } from "@/lib/store/dashboard-store"
import { testAPIConnection, getValueByPath } from "@/lib/api/api-client"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Loader2, RefreshCw } from "lucide-react"

interface ChartWidgetProps {
  widget: Widget
}

export default function ChartWidget({ widget }: ChartWidgetProps) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchData = async () => {
    setIsRefreshing(true)
    setLoading(true)
    setError(null)

    try {
      const result = await testAPIConnection(widget.apiUrl)

      if (!result.success || !result.data) {
        setError(result.error || "Failed to fetch data")
        return
      }

      let chartData = Array.isArray(result.data) ? result.data : [result.data]

      if (widget.chartConfig?.xAxisField && widget.chartConfig?.yAxisField) {
        chartData = chartData.map((item) => ({
          name: getValueByPath(item, widget.chartConfig!.xAxisField),
          value: getValueByPath(item, widget.chartConfig!.yAxisField),
          xLabel: widget.chartConfig!.xAxisField,
          yLabel: widget.chartConfig!.yAxisField,
        }))
      }

      setData(chartData.slice(0, 10))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, widget.refreshInterval * 1000)
    return () => clearInterval(interval)
  }, [widget])

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-lg p-4 sm:p-6 h-64 sm:h-96 flex items-center justify-center backdrop-blur-sm">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-muted-foreground text-sm">Loading chart...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-card border border-destructive/30 rounded-lg p-4 sm:p-6 h-64 sm:h-96 flex items-center justify-center backdrop-blur-sm">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-destructive/20 rounded-full mb-3">
            <svg className="w-6 h-6 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-destructive font-semibold text-sm">Error</p>
          <p className="text-destructive/70 text-xs mt-1 break-words">{error}</p>
        </div>
      </div>
    )
  }

  const ChartComponent = widget.chartConfig?.chartType === "bar" ? BarChart : LineChart
  const DataComponent = widget.chartConfig?.chartType === "bar" ? Bar : Line

  return (
    <div className="bg-card border border-border rounded-lg p-3 sm:p-6 backdrop-blur-sm hover:border-primary/50 transition-all duration-300 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-card-foreground font-semibold text-base sm:text-lg truncate flex-1">{widget.title}</h3>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="hidden sm:inline">{data.length} points</span>
          {isRefreshing && <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />}
        </div>
      </div>

      <div className="w-full flex-1 min-h-64 sm:min-h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ChartComponent data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
            <XAxis
              dataKey="name"
              stroke="currentColor"
              style={{ fontSize: "12px" }}
              label={{
                value: data[0]?.xLabel || "X Axis",
                position: "insideBottomRight",
                offset: -5,
                style: { fontSize: "12px", fill: "currentColor" },
              }}
            />
            <YAxis
              stroke="currentColor"
              style={{ fontSize: "12px" }}
              label={{
                value: data[0]?.yLabel || "Y Axis",
                angle: -90,
                position: "insideLeft",
                style: { fontSize: "12px", fill: "currentColor" },
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              }}
              labelStyle={{ color: "hsl(var(--card-foreground))" }}
            />
            <Legend />
            <DataComponent
              dataKey="value"
              stroke={widget.chartConfig?.color || "hsl(var(--primary))"}
              fill={widget.chartConfig?.color || "hsl(var(--primary))"}
              name={widget.chartConfig?.yAxisField || "Value"}
              isAnimationActive={true}
            />
          </ChartComponent>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
