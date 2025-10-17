import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface Widget {
  id: string
  type: "chart" | "card" | "table"
  title: string
  apiUrl: string
  apiKey?: string
  refreshInterval: number
  selectedFields: string[]
  chartConfig?: {
    chartType: "line" | "bar"
    xAxisField: string
    yAxisField: string
    color: string
  }
  position: number
}

export interface Dashboard {
  id: string
  name: string
  widgets: Widget[]
  theme: "light" | "dark"
  createdAt: number
  updatedAt: number
}

interface DashboardStore {
  dashboards: Dashboard[]
  currentDashboardId: string
  widgets: Widget[]

  // Dashboard management
  createDashboard: (name: string, theme: "light" | "dark") => void
  deleteDashboard: (id: string) => void
  switchDashboard: (id: string) => void
  getCurrentDashboard: () => Dashboard | undefined
  updateDashboardTheme: (id: string, theme: "light" | "dark") => void

  // Widget management
  addWidget: (widget: Widget) => void
  removeWidget: (id: string) => void
  updateWidget: (id: string, updates: Partial<Widget>) => void
  reorderWidgets: (widgets: Widget[]) => void

  // Export/Import
  exportDashboard: () => string
  importDashboard: (json: string) => boolean
  loadFromStorage: () => void
}

export const useDashboardStore = create<DashboardStore>()(
  persist(
    (set, get) => ({
      dashboards: [
        {
          id: "default",
          name: "Default Dashboard",
          widgets: [],
          theme: "dark",
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ],
      currentDashboardId: "default",
      widgets: [],

      createDashboard: (name, theme) =>
        set((state) => {
          const newDashboard: Dashboard = {
            id: `dashboard-${Date.now()}`,
            name,
            widgets: [],
            theme,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          }
          return {
            dashboards: [...state.dashboards, newDashboard],
            currentDashboardId: newDashboard.id,
            widgets: [],
          }
        }),

      deleteDashboard: (id) =>
        set((state) => {
          if (id === "default") return state
          const newDashboards = state.dashboards.filter((d) => d.id !== id)
          const isCurrentDeleted = state.currentDashboardId === id
          return {
            dashboards: newDashboards,
            currentDashboardId: isCurrentDeleted ? "default" : state.currentDashboardId,
            widgets: isCurrentDeleted ? [] : state.widgets,
          }
        }),

      switchDashboard: (id) =>
        set((state) => {
          const dashboard = state.dashboards.find((d) => d.id === id)
          if (!dashboard) return state
          return {
            currentDashboardId: id,
            widgets: JSON.parse(JSON.stringify(dashboard.widgets)),
          }
        }),

      getCurrentDashboard: () => {
        const state = get()
        return state.dashboards.find((d) => d.id === state.currentDashboardId)
      },

      updateDashboardTheme: (id, theme) =>
        set((state) => ({
          dashboards: state.dashboards.map((d) => (d.id === id ? { ...d, theme, updatedAt: Date.now() } : d)),
        })),

      addWidget: (widget) =>
        set((state) => {
          const updatedWidgets = [...state.widgets, { ...widget, position: state.widgets.length }]
          const updatedDashboards = state.dashboards.map((d) =>
            d.id === state.currentDashboardId ? { ...d, widgets: updatedWidgets, updatedAt: Date.now() } : d,
          )
          return {
            widgets: updatedWidgets,
            dashboards: updatedDashboards,
          }
        }),

      removeWidget: (id) =>
        set((state) => {
          const updatedWidgets = state.widgets.filter((w) => w.id !== id)
          const updatedDashboards = state.dashboards.map((d) =>
            d.id === state.currentDashboardId ? { ...d, widgets: updatedWidgets, updatedAt: Date.now() } : d,
          )
          return {
            widgets: updatedWidgets,
            dashboards: updatedDashboards,
          }
        }),

      updateWidget: (id, updates) =>
        set((state) => {
          const updatedWidgets = state.widgets.map((w) => (w.id === id ? { ...w, ...updates } : w))
          const updatedDashboards = state.dashboards.map((d) =>
            d.id === state.currentDashboardId ? { ...d, widgets: updatedWidgets, updatedAt: Date.now() } : d,
          )
          return {
            widgets: updatedWidgets,
            dashboards: updatedDashboards,
          }
        }),

      reorderWidgets: (widgets) =>
        set((state) => {
          const updatedDashboards = state.dashboards.map((d) =>
            d.id === state.currentDashboardId ? { ...d, widgets, updatedAt: Date.now() } : d,
          )
          return {
            widgets,
            dashboards: updatedDashboards,
          }
        }),

      exportDashboard: () => {
        const state = get()
        return JSON.stringify(state.widgets, null, 2)
      },

      importDashboard: (json) => {
        try {
          const widgets = JSON.parse(json)
          if (!Array.isArray(widgets)) {
            throw new Error("Invalid format: expected array of widgets")
          }
          set((state) => {
            const updatedDashboards = state.dashboards.map((d) =>
              d.id === state.currentDashboardId ? { ...d, widgets, updatedAt: Date.now() } : d,
            )
            return {
              widgets,
              dashboards: updatedDashboards,
            }
          })
          return true
        } catch (error) {
          console.error("Failed to import dashboard:", error)
          return false
        }
      },

      loadFromStorage: () => {
        // Zustand persist middleware handles this automatically
      },
    }),
    {
      name: "finboard-dashboard",
    },
  ),
)
