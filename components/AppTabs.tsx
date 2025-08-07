"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ComicGenerator } from "./ComicGenerator";
import { MemeGenerator } from "./MemeGenerator";
import { BookOpen, Laugh } from "lucide-react";

export const AppTabs = () => {
  return (
    <div className="min-h-screen bg-gradient-hero p-4">
      <Tabs defaultValue="comics" className="w-full">
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold mb-4 text-white drop-shadow-lg">AI Content Creator</h1>
          <p className="text-xl text-white/90 mb-8">Create amazing comics and memes with the power of AI! ✨</p>

          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 bg-white/20 backdrop-blur">
            <TabsTrigger
              value="comics"
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-gray-900 text-white font-semibold"
            >
              <BookOpen className="w-5 h-5" />
              Comic Generator
            </TabsTrigger>
            <TabsTrigger
              value="memes"
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-gray-900 text-white font-semibold"
            >
              <Laugh className="w-5 h-5" />
              Meme Generator
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="comics" className="mt-8">
          <ComicGenerator />
        </TabsContent>

        <TabsContent value="memes" className="mt-8">
          <MemeGenerator />
        </TabsContent>
      </Tabs>
    </div>
  );
};
