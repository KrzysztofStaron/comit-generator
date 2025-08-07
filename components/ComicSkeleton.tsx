import { Card } from "@/components/ui/card";

interface ComicSkeletonProps {
  gridSize: string;
}

export const ComicSkeleton = ({ gridSize }: ComicSkeletonProps) => {
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
    <Card className="p-8 mb-8 shadow-pop border-4 border-primary/30 bg-white animate-pulse">
      <div className="flex flex-col gap-8">
        <div className="text-center">
          <div className="h-8 bg-gray-200 rounded-lg mb-4 w-64 mx-auto"></div>
          <div className="h-4 bg-gray-200 rounded mb-6 w-96 mx-auto"></div>
        </div>

        <div className={`gap-4 max-w-5xl mx-auto ${getGridClass(gridSize)}`}>
          {Array.from({ length: panelCount }, (_, index) => (
            <div key={index} className="relative">
              <div className="w-full aspect-square bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl shadow-bubble border-4 border-gray-200/50 animate-pulse">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
              </div>
              <div className="absolute bottom-2 left-2 right-2 bg-gray-300 px-2 py-1 rounded text-xs">
                <div className="h-3 bg-gray-400 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-4">
          <div className="h-10 bg-gray-200 rounded-lg w-32 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded-lg w-40 animate-pulse"></div>
        </div>
      </div>
    </Card>
  );
};
