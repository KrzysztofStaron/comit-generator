"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ComicGenerator } from "./ComicGenerator";
import { MemeGenerator } from "./MemeGenerator";
import { BookOpen, Laugh, ArrowLeft } from "lucide-react";
import Link from "next/link";

export const AppTabs = () => {
  return (
    <div className="min-h-screen bg-gradient-hero p-4">
      <Tabs defaultValue="comics" className="w-full">
        <div className="text-center mb-8">
          <div className="flex justify-between items-center mb-6">
            <Link href="/">
              <Button variant="ghost" className="text-white hover:bg-white/10">
                <ArrowLeft className="mr-2 w-5 h-5" />
                Back to Home
              </Button>
            </Link>
            <div className="flex-1" />
          </div>

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
