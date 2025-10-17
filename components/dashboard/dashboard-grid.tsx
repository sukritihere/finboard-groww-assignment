"use client";

import type React from "react";

import { useState } from "react";
import { useDashboardStore } from "@/lib/store/dashboard-store";
import ChartWidget from "./widgets/chart-widget";
import CardWidget from "./widgets/card-widget";
import TableWidget from "./widgets/table-widget";
import { Trash2, Settings, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardGridProps {
  onEditWidget: (widgetId: string) => void;
}

export default function DashboardGrid({ onEditWidget }: DashboardGridProps) {
  const { widgets, removeWidget, reorderWidgets } = useDashboardStore();
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, widgetId: string) => {
    setDraggedId(widgetId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", widgetId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDragEnter = (e: React.DragEvent, widgetId: string) => {
    e.preventDefault();
    setDragOverId(widgetId);
  };

  const handleDragLeave = () => {
    setDragOverId(null);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }

    const draggedIndex = widgets.findIndex((w) => w.id === draggedId);
    const targetIndex = widgets.findIndex((w) => w.id === targetId);

    const newWidgets = [...widgets];
    const [draggedWidget] = newWidgets.splice(draggedIndex, 1);
    newWidgets.splice(targetIndex, 0, draggedWidget);

    reorderWidgets(newWidgets);
    setDraggedId(null);
    setDragOverId(null);
  };

  if (widgets.length === 0) {
    return (
      <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <svg
              className="w-8 h-8 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m0 0h6m-6-6H6m0 0H0"
              />
            </svg>
          </div>
          <p className="text-foreground/70 text-base sm:text-lg font-medium">
            No widgets yet
          </p>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1">
            Click "Add Widget" to create your first dashboard widget
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-9xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 auto-rows-max">
        {widgets.map((widget) => (
          <div
            key={widget.id}
            draggable
            onDragStart={(e) => handleDragStart(e, widget.id)}
            onDragOver={handleDragOver}
            onDragEnter={(e) => handleDragEnter(e, widget.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, widget.id)}
            className={`relative group animate-scale-in cursor-move transition-all duration-300 ${
              draggedId === widget.id ? "opacity-50 scale-95" : ""
            } ${
              dragOverId === widget.id && draggedId !== widget.id
                ? "ring-2 ring-primary scale-105"
                : ""
            }`}
          >
            <div className="absolute top-2 sm:top-3 right-2 sm:right-3 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEditWidget(widget.id)}
                className="h-7 w-7 sm:h-8 sm:w-8 bg-primary/80 hover:bg-primary text-primary-foreground"
                title="Edit widget configuration"
              >
                <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeWidget(widget.id)}
                className="h-7 w-7 sm:h-8 sm:w-8 bg-destructive/80 hover:bg-destructive text-destructive-foreground"
                title="Delete widget"
              >
                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>

            <div className="absolute top-2 sm:top-3 left-2 sm:left-3 z-10 opacity-0 group-hover:opacity-100 transition-all duration-200">
              <div className="p-1 bg-muted/50 rounded text-muted-foreground hover:bg-muted transition-colors">
                <GripVertical className="h-3 w-3 sm:h-4 sm:w-4" />
              </div>
            </div>

            {widget.type === "chart" && <ChartWidget widget={widget} />}
            {widget.type === "card" && <CardWidget widget={widget} />}
            {widget.type === "table" && <TableWidget widget={widget} />}
          </div>
        ))}
      </div>
    </div>
  );
}
