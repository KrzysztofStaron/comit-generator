"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  ArrowRight,
  Brain,
  Image,
  Zap,
  BookOpen,
  Smile,
  Wand2,
  Palette,
  Download,
  Play,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";

const features = [
  {
    icon: BookOpen,
    title: "Comic Generator",
    description: "Create multi-panel comics with AI-generated stories and artwork",
    color: "bg-blue-500",
    details: ["1x1 to 3x3 grids", "AI characters", "Custom stories", "DALL-E 3 powered"],
  },
  {
    icon: Smile,
    title: "Meme Generator",
    description: "Upload images and let AI create perfect meme text",
    color: "bg-purple-500",
    details: ["8 meme styles", "Smart text placement", "GPT-4 Vision", "Instant download"],
  },
  {
    icon: Brain,
    title: "Powered by AI",
    description: "Built with the latest AI models for best results",
    color: "bg-emerald-500",
    details: ["GPT-4o-mini", "DALL-E 3", "Flux models", "Real-time generation"],
  },
];

export const LandingPage = () => {
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
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">AI Creator</span>
          </div>
          <Link href="/create">
            <Button className="bg-white text-black hover:bg-gray-100 font-medium">Try Now</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <Badge className="mb-8 bg-white/10 text-white border-white/20 backdrop-blur-sm">
            <Wand2 className="w-4 h-4 mr-2" />
            Powered by Advanced AI
          </Badge>

          <h1 className="text-6xl md:text-8xl font-bold text-white mb-8 leading-tight">
            Create Amazing
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 transition-all duration-500">
              {words[currentWord]}
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Generate comics and memes instantly using GPT-4, DALL-E 3, and Flux AI models. No signup required.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/create">
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-6 text-lg font-semibold rounded-xl shadow-2xl hover:scale-105 transition-all"
              >
                <Play className="mr-2 w-5 h-5" />
                Start Creating
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">3</div>
              <div className="text-gray-400 text-sm">AI Models</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">8</div>
              <div className="text-gray-400 text-sm">Meme Styles</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">∞</div>
              <div className="text-gray-400 text-sm">Possibilities</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">What You Can Build</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Powerful AI tools to bring your creative ideas to life
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="bg-white/5 backdrop-blur-sm border-white/10 p-8 hover:bg-white/10 transition-all duration-300 group"
              >
                <div
                  className={`w-14 h-14 ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                >
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                <p className="text-gray-300 mb-6 leading-relaxed">{feature.description}</p>
                <ul className="space-y-3">
                  {feature.details.map((detail, idx) => (
                    <li key={idx} className="flex items-center text-gray-400">
                      <div className="w-2 h-2 bg-purple-400 rounded-full mr-3" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-black/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Simple Process</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">From idea to finished content in three easy steps</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                step: "01",
                title: "Describe Your Idea",
                description: "Tell the AI what you want to create or upload an image for memes",
                icon: Brain,
              },
              {
                step: "02",
                title: "AI Works Its Magic",
                description: "Advanced models generate your content using the latest AI technology",
                icon: Sparkles,
              },
              {
                step: "03",
                title: "Download & Share",
                description: "Get your finished comic or meme ready to share anywhere",
                icon: Download,
              },
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="relative mb-8">
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto shadow-2xl">
                    <step.icon className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-black font-bold text-sm">
                    {step.step}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{step.title}</h3>
                <p className="text-gray-300 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-3xl p-12 backdrop-blur-sm border border-white/10">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to Create?</h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Start generating amazing comics and memes with AI. No account needed - just bring your creativity.
            </p>
            <Link href="/create">
              <Button
                size="lg"
                className="bg-white text-black hover:bg-gray-100 px-12 py-6 text-xl font-semibold rounded-xl shadow-2xl hover:scale-105 transition-all"
              >
                <Zap className="mr-2 w-6 h-6" />
                Try It Now
              </Button>
            </Link>
            <p className="text-gray-400 text-sm mt-6">Requires OpenAI & Replicate API keys • No signup required</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-white/10">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">AI Creator</span>
          </div>
          <p className="text-gray-400">Built with Next.js and powered by cutting-edge AI models</p>
        </div>
      </footer>
    </div>
  );
};
