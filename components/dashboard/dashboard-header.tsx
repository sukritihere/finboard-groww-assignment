"use client";

import { useDashboardStore } from "@/lib/store/dashboard-store";
import {
  Download,
  Upload,
  Plus,
  BarChart3,
  Trash2,
  Moon,
  Sun,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DashboardHeaderProps {
  onAddWidget: () => void;
  theme: "light" | "dark";
  onThemeToggle: () => void;
  onShowToast: (toast: {
    title: string;
    description?: string;
    type: "success" | "error" | "info";
  }) => void;
}

export default function DashboardHeader({
  onAddWidget,
  theme,
  onThemeToggle,
  onShowToast,
}: DashboardHeaderProps) {
  const {
    exportDashboard,
    importDashboard,
    widgets,
    dashboards,
    currentDashboardId,
    switchDashboard,
    createDashboard,
    deleteDashboard,
  } = useDashboardStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [newDashboardName, setNewDashboardName] = useState("");
  const [showNewDashboardInput, setShowNewDashboardInput] = useState(false);
  const [newDashboardTheme, setNewDashboardTheme] = useState<"light" | "dark">(
    "dark"
  );

  const currentDashboard = dashboards.find((d) => d.id === currentDashboardId);
  const isDefaultDashboard = currentDashboardId === "default";

  const handleExport = () => {
    const json = exportDashboard();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `finboard-dashboard-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onShowToast({ title: "Dashboard exported successfully", type: "success" });
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const json = event.target?.result as string;
          const success = importDashboard(json);
          if (success) {
            onShowToast({
              title: "Dashboard imported successfully",
              type: "success",
            });
          } else {
            onShowToast({
              title: "Import failed",
              description:
                "Invalid template format. Please check the file and try again.",
              type: "error",
            });
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleDeleteDashboard = () => {
    if (isDefaultDashboard) return;
    deleteDashboard(currentDashboardId);
    onShowToast({ title: `Dashboard deleted successfully`, type: "success" });
  };

  const handleCreateDashboard = () => {
    if (newDashboardName.trim()) {
      createDashboard(newDashboardName, newDashboardTheme);
      setNewDashboardName("");
      setShowNewDashboardInput(false);
      onShowToast({
        title: `Dashboard "${newDashboardName}" created`,
        type: "success",
      });
    }
  };

  const handleDeleteAllWidgets = () => {
    importDashboard(JSON.stringify([]));
    onShowToast({ title: "All widgets deleted", type: "success" });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm transition-colors duration-300">
      <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-lg">
              <BarChart3 size={24} className="text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                FinBoard
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Customizable Finance Dashboard
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 bg-transparent">
                  <span className="truncate max-w-[150px]">
                    {currentDashboard?.name}
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {dashboards.map((dashboard) => (
                  <DropdownMenuItem
                    key={dashboard.id}
                    onClick={() => switchDashboard(dashboard.id)}
                    className="flex items-center justify-between"
                  >
                    <span>{dashboard.name}</span>
                    {dashboard.id === currentDashboardId && (
                      <span className="text-primary">✓</span>
                    )}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setShowNewDashboardInput(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Dashboard
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteDashboard}
              disabled={isDefaultDashboard}
              title={
                isDefaultDashboard
                  ? "Cannot delete default dashboard"
                  : "Delete current dashboard"
              }
            >
              <Trash2 className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Delete Dashboard</span>
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mt-4">
          <div className="flex-1 max-w-xs flex items-center gap-2 px-3 py-2 bg-input border border-border rounded-lg">
            <svg
              className="w-4 h-4 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search widgets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent text-foreground placeholder-muted-foreground focus:outline-none text-sm"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              size="icon"
              onClick={onThemeToggle}
              title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              title="Export dashboard configuration"
            >
              <Download className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Export</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleImport}
              title="Import dashboard configuration"
            >
              <Upload className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Import</span>
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteAllWidgets}
              disabled={widgets.length === 0}
              title="Delete all widgets"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Delete All</span>
            </Button>
            <Button size="sm" onClick={onAddWidget} title="Add new widget">
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Add Widget</span>
            </Button>
          </div>
        </div>

        {showNewDashboardInput && (
          <div className="flex flex-col gap-3 mt-4 p-4 bg-muted/50 rounded-lg border border-border">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="Dashboard name..."
                value={newDashboardName}
                onChange={(e) => setNewDashboardName(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleCreateDashboard()}
                className="flex-1 px-3 py-2 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                autoFocus
              />
              <select
                value={newDashboardTheme}
                onChange={(e) =>
                  setNewDashboardTheme(e.target.value as "light" | "dark")
                }
                className="px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              >
                <option value="dark">Dark Mode</option>
                <option value="light">Light Mode</option>
              </select>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleCreateDashboard}
                className="flex-1"
              >
                Create
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowNewDashboardInput(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
