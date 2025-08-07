"use client";

import { Card } from "@/components/ui/card";
import { Loader2, CheckCircle } from "lucide-react";

interface ComicPanel {
  url: string;
  description: string;
}

interface ProgressiveComicGridProps {
  gridSize: string;
  panels: (ComicPanel | null)[];
  panelStatuses: ("pending" | "generating" | "complete" | "error")[];
  currentPanel?: number;
}

export const ProgressiveComicGrid = ({
  gridSize,
  panels,
  panelStatuses,
  currentPanel = -1,
}: ProgressiveComicGridProps) => {
  const getGridClass = (layout: string) => {
    switch (layout) {
      case "1x1":
        return "grid grid-cols-1";
      case "2x1":
        return "grid grid-cols-2";
      case "2x2":
        return "grid grid-cols-2";
      case "3x1":
        return "grid grid-cols-3";
      case "3x2":
        return "grid grid-cols-3";
      case "3x3":
        return "grid grid-cols-3";
      case "4x1":
        return "grid grid-cols-4";
      default:
        return "grid grid-cols-2";
    }
  };

  const [rows, cols] = gridSize.split("x").map(Number);
  const panelCount = rows * cols;

  return (
    <Card className="p-8 mb-8 shadow-pop border-4 border-primary/30 bg-white">
      <div className="flex flex-col gap-8">
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-4 text-foreground">Generating Your {gridSize} Comic...</h3>
          <p className="text-muted-foreground mb-6">
            Progress: {panels.filter(p => p !== null).length}/{panelCount} panels completed
          </p>
        </div>

        <div className={`gap-4 max-w-5xl mx-auto ${getGridClass(gridSize)}`}>
          {Array.from({ length: panelCount }, (_, index) => {
            const panel = panels[index];
            const status = panelStatuses[index] || "pending";
            const isActive = currentPanel === index;

            return (
              <div key={index} className="relative group">
                {panel ? (
                  // Completed panel
                  <div className="relative">
                    <img
                      src={panel.url}
                      alt={`Panel ${index + 1}`}
                      className="w-full aspect-square object-cover rounded-xl shadow-bubble border-4 border-green-200 animate-pop-in"
                    />
                    <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                    <div className="absolute bottom-2 left-2 right-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded text-xs text-white font-bold">
                      Panel {index + 1}
                    </div>
                  </div>
                ) : (
                  // Skeleton/Loading panel
                  <div
                    className={`
                    w-full aspect-square rounded-xl shadow-bubble border-4 relative overflow-hidden
                    $                     {
                       status === "generating" || isActive
                         ? "border-blue-400 bg-gradient-to-br from-blue-100 to-blue-200"
                         : status === "error"
                         ? "border-orange-400 bg-gradient-to-br from-orange-100 to-orange-200"
                         : "border-gray-200 bg-gradient-to-br from-gray-100 to-gray-200"
                     }
                  `}
                  >
                    {/* Shimmer animation */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>

                    {/* Status indicator */}
                    <div className="absolute top-2 right-2">
                      {(status === "generating" || isActive) && (
                        <div className="bg-blue-500 text-white p-1 rounded-full">
                          <Loader2 className="w-4 h-4 animate-spin" />
                        </div>
                      )}
                      {status === "error" && (
                        <div className="bg-orange-500 text-white p-1 rounded-full">
                          <Loader2 className="w-4 h-4 animate-spin" />
                        </div>
                      )}
                    </div>

                    {/* Panel number */}
                    <div className="absolute bottom-2 left-2 right-2 bg-black/50 backdrop-blur-sm px-2 py-1 rounded text-xs text-white font-bold">
                      Panel {index + 1}
                      {status === "generating" && <span className="ml-1">generating...</span>}
                      {status === "error" && <span className="ml-1 text-orange-300">retrying...</span>}
                    </div>

                    {/* Progress indicator for active panel */}
                    {isActive && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-blue-500/80 backdrop-blur-sm rounded-lg p-3 text-white text-center">
                          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                          <p className="text-sm font-semibold">Generating...</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 max-w-md mx-auto">
          <div
            className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(panels.filter(p => p !== null).length / panelCount) * 100}%` }}
          ></div>
        </div>
      </div>
    </Card>
  );
};
