"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Upload, Sparkles, Download, Heart, Copy, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface MemeText {
  topText: string;
  bottomText: string;
}

interface GeneratedMeme {
  id: string;
  originalImage: string;
  memeTexts: MemeText[];
  selectedMeme: MemeText;
  createdAt: Date;
}

export const MemeGenerator = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedMemes, setGeneratedMemes] = useState<MemeText[]>([]);
  const [selectedMeme, setSelectedMeme] = useState<MemeText | null>(null);
  const [savedMemes, setSavedMemes] = useState<GeneratedMeme[]>([]);
  const [memeStyle, setMemeStyle] = useState("funny");
  const [customPrompt, setCustomPrompt] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Image must be smaller than 10MB");
        return;
      }

      const reader = new FileReader();
      reader.onload = e => {
        setUploadedImage(e.target?.result as string);
        setGeneratedMemes([]);
        setSelectedMeme(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateMemeTexts = async () => {
    if (!uploadedImage) {
      toast.error("Please upload an image first!");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch("/api/generate-meme", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageData: uploadedImage,
          style: memeStyle,
          customPrompt: customPrompt.trim(),
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API responded with status ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      setGeneratedMemes(result.memeTexts);
      setSelectedMeme(result.memeTexts[0]);
      toast.success("Meme texts generated successfully!");
    } catch (error) {
      console.error("Error generating meme:", error);
      toast.error("Error generating meme texts");
    } finally {
      setIsGenerating(false);
    }
  };

  const saveMeme = () => {
    if (uploadedImage && selectedMeme) {
      const newMeme: GeneratedMeme = {
        id: Date.now().toString(),
        originalImage: uploadedImage,
        memeTexts: generatedMemes,
        selectedMeme,
        createdAt: new Date(),
      };
      setSavedMemes(prev => [newMeme, ...prev]);
      toast.success("Meme saved to gallery!");
    }
  };

  const copyMemeText = () => {
    if (selectedMeme) {
      const text = `${selectedMeme.topText}\n\n${selectedMeme.bottomText}`;
      navigator.clipboard.writeText(text);
      toast.success("Meme text copied to clipboard!");
    }
  };

  const downloadMeme = () => {
    if (uploadedImage && selectedMeme) {
      // Create a canvas to combine image and text
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw the image
        ctx?.drawImage(img, 0, 0);

        if (ctx) {
          // Calculate optimal font size based on image size and text length
          const calculateFontSize = (text: string, maxWidth: number, baseSize: number) => {
            ctx.font = `${baseSize}px Arial Black`;
            const textWidth = ctx.measureText(text).width;
            if (textWidth > maxWidth) {
              return Math.floor((maxWidth / textWidth) * baseSize);
            }
            return baseSize;
          };

          const maxTextWidth = img.width * 0.9; // 90% of image width
          const baseFontSize = Math.max(Math.min(img.width / 15, img.height / 15), 20);

          // Set common text styling
          ctx.fillStyle = "white";
          ctx.strokeStyle = "black";
          ctx.lineWidth = Math.max(img.width / 400, 2);
          ctx.textAlign = "center";

          // Draw top text
          if (selectedMeme.topText) {
            const topFontSize = calculateFontSize(selectedMeme.topText, maxTextWidth, baseFontSize);
            ctx.font = `${topFontSize}px Arial Black`;
            ctx.textBaseline = "top";

            // Position text with padding from top
            const topY = Math.max(img.height * 0.05, topFontSize * 0.2);

            // Check if text fits within safe area (avoid overlap with bottom text)
            const textHeight = topFontSize * 1.2;
            const safeTopArea = img.height * 0.4;
            const finalTopY = Math.min(topY, safeTopArea - textHeight);

            ctx.strokeText(selectedMeme.topText, img.width / 2, finalTopY);
            ctx.fillText(selectedMeme.topText, img.width / 2, finalTopY);
          }

          // Draw bottom text
          if (selectedMeme.bottomText) {
            const bottomFontSize = calculateFontSize(selectedMeme.bottomText, maxTextWidth, baseFontSize);
            ctx.font = `${bottomFontSize}px Arial Black`;
            ctx.textBaseline = "bottom";

            // Position text with padding from bottom
            const bottomY = Math.min(img.height * 0.95, img.height - bottomFontSize * 0.2);

            // Check if text fits within safe area (avoid overlap with top text)
            const safeBottomArea = img.height * 0.6;
            const finalBottomY = Math.max(bottomY, safeBottomArea);

            ctx.strokeText(selectedMeme.bottomText, img.width / 2, finalBottomY);
            ctx.fillText(selectedMeme.bottomText, img.width / 2, finalBottomY);
          }
        }

        // Download the canvas as image
        canvas.toBlob(blob => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.download = `meme-${Date.now()}.png`;
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);
            toast.success("Meme downloaded!");
          }
        });
      };

      img.src = uploadedImage;
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-6xl font-bold mb-4 text-white drop-shadow-lg">AI Meme Generator</h1>
        <p className="text-xl text-white/90 mb-8">Upload any image and create hilarious memes with AI! 😂</p>
      </div>

      {/* Upload and Generation */}
      <Card className="p-8 mb-8 shadow-comic border-4 border-primary/20 bg-white/95 backdrop-blur">
        <div className="space-y-6">
          {/* Image Upload */}
          <div className="space-y-4">
            <Label className="text-lg font-bold text-foreground">Upload Image</Label>
            <div className="flex flex-col lg:flex-row gap-4">
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="border-2 border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground font-bold"
              >
                <Upload className="mr-2 w-5 h-5" />
                Choose Image
              </Button>

              {uploadedImage && (
                <div className="flex-1 flex gap-4">
                  <Input
                    value={customPrompt}
                    onChange={e => setCustomPrompt(e.target.value)}
                    placeholder="Optional: Describe the context or add specific instructions..."
                    className="flex-1"
                  />
                  <Button
                    onClick={generateMemeTexts}
                    disabled={isGenerating}
                    variant="default"
                    className="bg-gradient-comic text-primary-foreground font-bold px-6 py-2 rounded-xl shadow-pop hover:scale-105 transition-all duration-200"
                  >
                    {isGenerating ? (
                      <>
                        <Sparkles className="animate-spin mr-2" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2" />
                        Generate Memes!
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Style Selection */}
          {uploadedImage && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gradient-bubble rounded-xl border-2 border-accent/20">
              <div className="space-y-2">
                <Label className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Meme Style
                </Label>
                <Select value={memeStyle} onValueChange={setMemeStyle}>
                  <SelectTrigger className="border-2 border-primary/30 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="funny">Funny</SelectItem>
                    <SelectItem value="sarcastic">Sarcastic</SelectItem>
                    <SelectItem value="wholesome">Wholesome</SelectItem>
                    <SelectItem value="relatable">Relatable</SelectItem>
                    <SelectItem value="absurd">Absurd</SelectItem>
                    <SelectItem value="motivational">Motivational</SelectItem>
                    <SelectItem value="roast">Roast/Burn</SelectItem>
                    <SelectItem value="nostalgic">Nostalgic</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-bold text-foreground">Quick Templates</Label>
                <div className="flex flex-wrap gap-2">
                  {[
                    "when you...",
                    "me trying to...",
                    "nobody: absolutely nobody:",
                    "expectations vs reality",
                    "me explaining to my mom...",
                  ].map(template => (
                    <Badge
                      key={template}
                      variant="outline"
                      className="cursor-pointer hover:bg-accent/20 border-accent text-accent-foreground px-2 py-1 text-xs"
                      onClick={() => setCustomPrompt(template)}
                    >
                      {template}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Image Preview and Results */}
      {uploadedImage && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Image Preview */}
          <Card className="p-6 shadow-pop border-4 border-secondary/30 bg-white">
            <h3 className="text-xl font-bold mb-4 text-center">Preview</h3>
            <div className="relative">
              <img
                src={uploadedImage}
                alt="Uploaded"
                className="w-full max-h-96 object-contain rounded-lg border-2 border-gray-200"
              />
              {selectedMeme && (
                <div className="absolute inset-0 flex flex-col justify-between p-2 md:p-4 pointer-events-none">
                  {selectedMeme.topText && (
                    <div className="text-center flex-shrink-0" style={{ maxHeight: "35%" }}>
                      <span
                        className="text-white font-black drop-shadow-[2px_2px_0px_black] uppercase leading-tight"
                        style={{
                          fontSize: `${Math.max(
                            Math.min(selectedMeme.topText.length > 20 ? 14 : 18, window.innerWidth < 768 ? 16 : 24),
                            12
                          )}px`,
                          wordBreak: "break-word",
                          hyphens: "auto",
                        }}
                      >
                        {selectedMeme.topText}
                      </span>
                    </div>
                  )}
                  {selectedMeme.bottomText && (
                    <div className="text-center flex-shrink-0" style={{ maxHeight: "35%" }}>
                      <span
                        className="text-white font-black drop-shadow-[2px_2px_0px_black] uppercase leading-tight"
                        style={{
                          fontSize: `${Math.max(
                            Math.min(selectedMeme.bottomText.length > 20 ? 14 : 18, window.innerWidth < 768 ? 16 : 24),
                            12
                          )}px`,
                          wordBreak: "break-word",
                          hyphens: "auto",
                        }}
                      >
                        {selectedMeme.bottomText}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {selectedMeme && (
              <div className="flex justify-center gap-2 mt-4">
                <Button onClick={copyMemeText} variant="outline" size="sm">
                  <Copy className="mr-2 w-4 h-4" />
                  Copy Text
                </Button>
                <Button onClick={downloadMeme} variant="outline" size="sm">
                  <Download className="mr-2 w-4 h-4" />
                  Download
                </Button>
                <Button onClick={saveMeme} variant="outline" size="sm">
                  <Heart className="mr-2 w-4 h-4" />
                  Save
                </Button>
              </div>
            )}
          </Card>

          {/* Generated Memes */}
          {generatedMemes.length > 0 && (
            <Card className="p-6 shadow-pop border-4 border-accent/30 bg-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Generated Memes</h3>
                <Button onClick={generateMemeTexts} variant="outline" size="sm" disabled={isGenerating}>
                  <RefreshCw className="mr-2 w-4 h-4" />
                  Regenerate
                </Button>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {generatedMemes.map((meme, index) => (
                  <div
                    key={index}
                    className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedMeme === meme ? "border-primary bg-primary/10" : "border-gray-200 hover:border-primary/50"
                    }`}
                    onClick={() => setSelectedMeme(meme)}
                  >
                    <div className="text-center">
                      {meme.topText && <p className="font-bold text-sm mb-1 uppercase text-gray-800">{meme.topText}</p>}
                      <div className="text-xs text-gray-400 mb-1">• • •</div>
                      {meme.bottomText && (
                        <p className="font-bold text-sm uppercase text-gray-800">{meme.bottomText}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Saved Memes Gallery */}
      {savedMemes.length > 0 && (
        <Card className="p-8 bg-white/95 backdrop-blur shadow-comic border-4 border-accent/30">
          <h2 className="text-3xl font-bold mb-6 text-center text-foreground">😂 Your Meme Gallery</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedMemes.map(meme => (
              <div
                key={meme.id}
                className="group cursor-pointer"
                onClick={() => {
                  setUploadedImage(meme.originalImage);
                  setGeneratedMemes(meme.memeTexts);
                  setSelectedMeme(meme.selectedMeme);
                }}
              >
                <div className="relative overflow-hidden rounded-xl border-4 border-muted hover:border-primary transition-all duration-300 hover:scale-105 shadow-bubble">
                  <div className="relative">
                    <img src={meme.originalImage} alt="Saved meme" className="w-full aspect-square object-cover" />
                    <div className="absolute inset-0 flex flex-col justify-between p-1 md:p-2">
                      {meme.selectedMeme.topText && (
                        <div className="text-center flex-shrink-0" style={{ maxHeight: "40%" }}>
                          <span
                            className="text-white font-black drop-shadow-[1px_1px_0px_black] uppercase leading-tight"
                            style={{
                              fontSize: `${Math.max(
                                Math.min(meme.selectedMeme.topText.length > 15 ? 8 : 10, 12),
                                7
                              )}px`,
                              wordBreak: "break-word",
                              display: "block",
                              overflow: "hidden",
                            }}
                          >
                            {meme.selectedMeme.topText}
                          </span>
                        </div>
                      )}
                      {meme.selectedMeme.bottomText && (
                        <div className="text-center flex-shrink-0" style={{ maxHeight: "40%" }}>
                          <span
                            className="text-white font-black drop-shadow-[1px_1px_0px_black] uppercase leading-tight"
                            style={{
                              fontSize: `${Math.max(
                                Math.min(meme.selectedMeme.bottomText.length > 15 ? 8 : 10, 12),
                                7
                              )}px`,
                              wordBreak: "break-word",
                              display: "block",
                              overflow: "hidden",
                            }}
                          >
                            {meme.selectedMeme.bottomText}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-4 left-4 right-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="text-xs text-white/80">{meme.createdAt.toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
