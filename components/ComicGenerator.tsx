"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Zap, Sparkles, Download, Heart, Grid3X3, Palette } from "lucide-react";
import { toast } from "sonner";
import { ComicSkeleton } from "./ComicSkeleton";

interface ComicPanel {
  url: string;
  description: string;
}

interface Comic {
  id: string;
  prompt: string;
  panels: ComicPanel[];
  gridLayout: string;
  createdAt: Date;
}

export const ComicGenerator = () => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentComic, setCurrentComic] = useState<Comic | null>(null);
  const [savedComics, setSavedComics] = useState<Comic[]>([]);
  const [gridSize, setGridSize] = useState("2x2");
  const [artStyle, setArtStyle] = useState("cartoon");
  const [tone, setTone] = useState("funny");

  const generateComic = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a description for your comic!");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch("/api/generate-comic", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt, gridSize, artStyle, tone }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API responded with status ${response.status}: ${errorText}`);
      }

      const result = await response.json();

      const comic: Comic = {
        id: Date.now().toString(),
        prompt,
        panels: result.panels,
        gridLayout: result.gridLayout,
        createdAt: new Date(),
      };

      setCurrentComic(comic);
      toast.success(`${gridSize} comic generated successfully!`);
    } catch (error) {
      console.error("Error generating comic:", error);
      toast.error("Error generating comic");
    } finally {
      setIsGenerating(false);
    }
  };

  const saveComic = () => {
    if (currentComic) {
      setSavedComics(prev => [currentComic, ...prev]);
      toast.success("Comic saved to gallery!");
    }
  };

  const downloadAllPanels = () => {
    if (currentComic) {
      currentComic.panels.forEach((panel, index) => {
        const link = document.createElement("a");
        link.download = `comic-${currentComic.id}-panel-${index + 1}.png`;
        link.href = panel.url;
        link.click();
      });
      toast.success("All panels downloaded!");
    }
  };

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

  return (
    <div className="min-h-screen bg-gradient-hero p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold mb-4 text-white drop-shadow-lg">AI Comic Generator</h1>
          <p className="text-xl text-white/90 mb-8">Create comics of any size from any idea! 💥</p>
        </div>

        {/* Generator */}
        <Card className="p-8 mb-8 shadow-comic border-4 border-primary/20 bg-white/95 backdrop-blur">
          <div className="space-y-6">
            {/* Main Input */}
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <Input
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  placeholder="e.g. 'a programmer who hasn't slept for 48h' or 'a cat trying to use a computer'"
                  className="text-lg p-4 border-3 border-primary/30 rounded-xl"
                  onKeyPress={e => e.key === "Enter" && generateComic()}
                />
              </div>
              <Button
                onClick={generateComic}
                disabled={isGenerating}
                variant="default"
                size="lg"
                className="bg-gradient-comic text-primary-foreground font-bold text-lg px-8 py-4 rounded-xl shadow-pop hover:scale-105 transition-all duration-200 border-3 border-accent/50"
              >
                {isGenerating ? (
                  <>
                    <Sparkles className="animate-spin mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2" />
                    Create {gridSize} Comic!
                  </>
                )}
              </Button>
            </div>

            {/* Advanced Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gradient-bubble rounded-xl border-2 border-accent/20">
              <div className="space-y-2">
                <Label className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Grid3X3 className="w-4 h-4" />
                  Grid Size
                </Label>
                <Select value={gridSize} onValueChange={setGridSize}>
                  <SelectTrigger className="border-2 border-primary/30 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1x1">1x1 (Single Panel)</SelectItem>
                    <SelectItem value="2x1">2x1 (Strip)</SelectItem>
                    <SelectItem value="2x2">2x2 (Classic)</SelectItem>
                    <SelectItem value="3x1">3x1 (Long Strip)</SelectItem>
                    <SelectItem value="3x2">3x2 (Magazine)</SelectItem>
                    <SelectItem value="3x3">3x3 (Epic)</SelectItem>
                    <SelectItem value="4x1">4x1 (Timeline)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Art Style
                </Label>
                <Select value={artStyle} onValueChange={setArtStyle}>
                  <SelectTrigger className="border-2 border-secondary/30 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cartoon">Cartoon</SelectItem>
                    <SelectItem value="manga">Manga</SelectItem>
                    <SelectItem value="superhero">Superhero</SelectItem>
                    <SelectItem value="cyberpunk">Cyberpunk</SelectItem>
                    <SelectItem value="watercolor">Watercolor</SelectItem>
                    <SelectItem value="noir">Film Noir</SelectItem>
                    <SelectItem value="pixelart">Pixel Art</SelectItem>
                    <SelectItem value="disney">Disney Style</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Tone
                </Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger className="border-2 border-accent/50 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="funny">Funny</SelectItem>
                    <SelectItem value="dramatic">Dramatic</SelectItem>
                    <SelectItem value="mysterious">Mysterious</SelectItem>
                    <SelectItem value="romantic">Romantic</SelectItem>
                    <SelectItem value="action">Action</SelectItem>
                    <SelectItem value="horror">Horror</SelectItem>
                    <SelectItem value="wholesome">Wholesome</SelectItem>
                    <SelectItem value="satirical">Satirical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Quick prompts */}
          <div className="mt-6">
            <p className="text-sm text-muted-foreground mb-3">Quick ideas:</p>
            <div className="flex flex-wrap gap-2">
              {[
                "a cat trying to cook",
                "programmer vs. bug",
                "morning coffee vs. no coffee",
                "trying to understand documentation",
                "superhero who forgot their powers",
                "robot learning to be human",
                "time traveler in wrong era",
                "alien tourist on Earth",
              ].map(suggestion => (
                <Badge
                  key={suggestion}
                  variant="outline"
                  className="cursor-pointer hover:bg-accent/20 border-accent text-accent-foreground px-3 py-1"
                  onClick={() => setPrompt(suggestion)}
                >
                  {suggestion}
                </Badge>
              ))}
            </div>
          </div>
        </Card>

        {/* Loading Skeleton */}
        {isGenerating && <ComicSkeleton gridSize={gridSize} />}

        {/* Current Comic */}
        {currentComic && (
          <Card className="p-8 mb-8 shadow-pop border-4 border-secondary/30 bg-white animate-pop-in">
            <div className="flex flex-col gap-8">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-4 text-foreground">Your {currentComic.gridLayout} Comic!</h3>
                <p className="text-muted-foreground mb-6">Prompt: "{currentComic.prompt}"</p>
              </div>

              <div className={`gap-4 max-w-5xl mx-auto ${getGridClass(currentComic.gridLayout)}`}>
                {currentComic.panels.map((panel, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={panel.url}
                      alt={`Panel ${index + 1}`}
                      className="w-full aspect-square object-cover rounded-xl shadow-bubble border-4 border-secondary/20 hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute bottom-2 left-2 right-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded text-xs text-white font-bold">
                      Panel {index + 1}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-center gap-4">
                <Button
                  onClick={saveComic}
                  variant="outline"
                  className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground font-bold"
                >
                  <Heart className="mr-2" />
                  Save to Gallery
                </Button>
                <Button
                  onClick={downloadAllPanels}
                  variant="outline"
                  className="border-2 border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground font-bold"
                >
                  <Download className="mr-2" />
                  Download All Panels
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Gallery */}
        {savedComics.length > 0 && (
          <Card className="p-8 bg-white/95 backdrop-blur shadow-comic border-4 border-accent/30">
            <h2 className="text-3xl font-bold mb-6 text-center text-foreground">🎨 Your Comic Gallery</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedComics.map(comic => (
                <div key={comic.id} className="group cursor-pointer" onClick={() => setCurrentComic(comic)}>
                  <div className="relative overflow-hidden rounded-xl border-4 border-muted hover:border-primary transition-all duration-300 hover:scale-105 shadow-bubble">
                    <div className={`gap-1 p-2 ${getGridClass(comic.gridLayout)}`}>
                      {comic.panels.map((panel, index) => (
                        <img
                          key={index}
                          src={panel.url}
                          alt={`Panel ${index + 1}`}
                          className="w-full aspect-square object-cover rounded"
                        />
                      ))}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-4 left-4 right-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <p className="font-bold truncate">"{comic.prompt}"</p>
                      <p className="text-xs text-white/80">
                        {comic.createdAt.toLocaleDateString()} • {comic.gridLayout}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};
