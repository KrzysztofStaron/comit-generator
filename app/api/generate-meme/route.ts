import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { imageData, style = "funny", customPrompt = "" } = await request.json();

    if (!imageData) {
      return NextResponse.json({ error: "Image data is required" }, { status: 400 });
    }

    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 });
    }

    // Use GPT-4 Vision to analyze the image and generate meme texts
    const visionResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a master meme creator. Analyze the uploaded image and create multiple hilarious meme texts.

Your task:
1. Look at the image carefully
2. Identify key visual elements, expressions, situations, objects, people, animals, etc.
3. Generate 6 different meme text combinations in ${style} style
4. Each meme should have "topText" and "bottomText" (either can be empty if it works better)
5. Make them genuinely funny and relevant to what's happening in the image
6. Use internet meme culture and formats when appropriate

${customPrompt ? `Additional context: ${customPrompt}` : ""}

Meme style: ${style}
- funny: Classic humor, puns, unexpected twists
- sarcastic: Ironic, witty, eye-rolling humor  
- wholesome: Positive, heartwarming, feel-good
- relatable: "Me when...", daily life struggles
- absurd: Random, weird, nonsensical humor
- motivational: Inspiring but often ironically
- roast: Playful burns, teasing humor
- nostalgic: References to past trends, childhood

Return EXACTLY this JSON format:
[
  {"topText": "WHEN YOU REALIZE", "bottomText": "IT'S ALREADY MONDAY"},
  {"topText": "ME TRYING TO ADULT", "bottomText": "LIKE I KNOW WHAT I'M DOING"},
  {"topText": "", "bottomText": "WHEN SOMEONE SAYS PINEAPPLE BELONGS ON PIZZA"},
  {"topText": "EXPECTATIONS", "bottomText": "VS REALITY"},
  {"topText": "NOBODY:", "bottomText": "ABSOLUTELY NOBODY: ME AT 3AM"},
  {"topText": "THAT FACE WHEN", "bottomText": "YOU REMEMBER YOU HAVE HOMEWORK"}
]

CRITICAL: Use ALL CAPS for meme text. Keep each text under 30 characters. Make it genuinely funny and relevant to the image.`,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Create ${style} memes for this image. ${
                customPrompt ? `Context: ${customPrompt}` : "Be creative and funny!"
              }`,
            },
            {
              type: "image_url",
              image_url: {
                url: imageData,
                detail: "high",
              },
            },
          ],
        },
      ],
      max_tokens: 800,
      temperature: 0.8,
    });

    let memeTexts;
    try {
      let content = visionResponse.choices[0].message.content || "";
      // Remove markdown code blocks if present
      content = content
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();

      // Try to parse as JSON array
      const arrayMatch = content.match(/\[[\s\S]*\]/);
      if (arrayMatch) {
        memeTexts = JSON.parse(arrayMatch[0]);
      } else {
        // Fallback parsing
        throw new Error("No JSON array found");
      }
    } catch (error) {
      console.error("Error parsing meme texts:", error);
      // Fallback memes based on style
      const fallbackMemes = {
        funny: [
          { topText: "WHEN LIFE GIVES YOU LEMONS", bottomText: "MAKE MEMES" },
          { topText: "ME PRETENDING TO UNDERSTAND", bottomText: "WHAT'S HAPPENING" },
          { topText: "THAT AWKWARD MOMENT", bottomText: "WHEN YOU EXIST" },
        ],
        sarcastic: [
          { topText: "OH GREAT", bottomText: "ANOTHER MONDAY" },
          { topText: "I'M FINE", bottomText: "EVERYTHING IS FINE" },
          { topText: "SURE, I'D LOVE TO", bottomText: "DO MORE WORK" },
        ],
        relatable: [
          { topText: "ME WHEN I HAVE", bottomText: "0 UNREAD MESSAGES" },
          { topText: "TRYING TO LOOK BUSY", bottomText: "WHEN THE BOSS WALKS BY" },
          { topText: "ME VS MY RESPONSIBILITIES", bottomText: "" },
        ],
      };

      memeTexts = fallbackMemes[style as keyof typeof fallbackMemes] || fallbackMemes.funny;
    }

    // Ensure we have valid meme texts
    if (!Array.isArray(memeTexts) || memeTexts.length === 0) {
      memeTexts = [
        { topText: "WHEN AI FAILS", bottomText: "BUT YOU STILL GET MEMES" },
        { topText: "THIS IMAGE IS", bottomText: "MEME WORTHY" },
        { topText: "ERROR 404", bottomText: "CREATIVITY NOT FOUND" },
      ];
    }

    // Ensure each meme has the required format
    memeTexts = memeTexts.map((meme: any) => ({
      topText: (meme.topText || "").toString().toUpperCase(),
      bottomText: (meme.bottomText || "").toString().toUpperCase(),
    }));

    return NextResponse.json({
      memeTexts,
      style,
      message: "Meme texts generated successfully!",
    });
  } catch (error) {
    console.error("Error in generate-meme API:", error);
    return NextResponse.json({ error: "Failed to generate meme texts" }, { status: 500 });
  }
}
