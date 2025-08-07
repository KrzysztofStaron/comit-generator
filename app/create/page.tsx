"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ComicGenerator } from "@/components/ComicGenerator";
import { MemeGenerator } from "@/components/MemeGenerator";
import { BookOpen, Laugh, ArrowLeft, Sparkles, Crown, Zap } from "lucide-react";
import Link from "next/link";

export default function CreatePage() {
  const [currentWord, setCurrentWord] = useState(0);
  const words = ["Comics", "Memes", "Stories", "Art"];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord(prev => (prev + 1) % words.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20" />

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 animate-bounce">
        <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full opacity-70" />
      </div>
      <div className="absolute top-40 right-20 animate-bounce delay-1000">
        <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full opacity-70" />
      </div>
      <div className="absolute bottom-20 left-20 animate-bounce delay-500">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-teal-500 rounded-full opacity-50" />
      </div>

      <div className="relative z-10 p-4">
        <Tabs defaultValue="comics" className="w-full">
          {/* Header Section */}
          <div className="text-center mb-16 pt-8">
            {/* Badge */}
            <Badge className="mb-8 bg-white/20 text-white border-white/30 backdrop-blur-sm text-sm px-4 py-2">
              <Crown className="w-4 h-4 mr-2" />
              AI-Powered Content Creation
            </Badge>

            {/* Main Title */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 drop-shadow-2xl">
              Create Amazing{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 animate-pulse">
                {words[currentWord]}
              </span>
              <br />
              with AI ✨
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
              Generate professional comics and hilarious memes using advanced AI models
            </p>

            {/* Tabs */}
            <TabsList className="grid w-full max-w-lg mx-auto grid-cols-2 bg-white/10 backdrop-blur-md border border-white/20 p-2 rounded-2xl mb-8 h-min">
              <TabsTrigger
                value="comics"
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white text-white/80 font-semibold py-3 px-6 rounded-xl transition-all duration-300"
              >
                <BookOpen className="w-5 h-5" />
                Comic Generator
              </TabsTrigger>
              <TabsTrigger
                value="memes"
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white text-white/80 font-semibold py-3 px-6 rounded-xl transition-all duration-300"
              >
                <Laugh className="w-5 h-5" />
                Meme Generator
              </TabsTrigger>
            </TabsList>

            {/* Quick Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
              <div className="group text-center hover:scale-105 transition-transform duration-300">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl mb-3 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                  <Zap className="w-7 h-7 text-white" />
                </div>
                <div className="text-sm font-semibold text-white">Instant</div>
                <div className="text-xs text-white/60">Generation</div>
              </div>
              <div className="group text-center hover:scale-105 transition-transform duration-300">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-3 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
                <div className="text-sm font-semibold text-white">AI-Powered</div>
                <div className="text-xs text-white/60">Technology</div>
              </div>
              <div className="group text-center hover:scale-105 transition-transform duration-300">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-teal-500 rounded-2xl mb-3 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                  <BookOpen className="w-7 h-7 text-white" />
                </div>
                <div className="text-sm font-semibold text-white">Multi-Panel</div>
                <div className="text-xs text-white/60">Comics</div>
              </div>
              <div className="group text-center hover:scale-105 transition-transform duration-300">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl mb-3 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                  <Laugh className="w-7 h-7 text-white" />
                </div>
                <div className="text-sm font-semibold text-white">8 Styles</div>
                <div className="text-xs text-white/60">Memes</div>
              </div>
            </div>
          </div>

          {/* Content Sections - Fixed spacing to prevent overlap */}
          <div className="mt-8">
            <TabsContent value="comics" className="mt-0">
              <div className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-8 max-w-6xl mx-auto">
                <ComicGenerator />
              </div>
            </TabsContent>

            <TabsContent value="memes" className="mt-0">
              <div className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-8 max-w-6xl mx-auto">
                <MemeGenerator />
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
