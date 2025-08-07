import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { prompt, gridSize = "2x2", artStyle = "cartoon", tone = "funny" } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 });
    }

    // Calculate panel count based on grid size
    const [rows, cols] = gridSize.split("x").map(Number);
    const panelCount = rows * cols;

    // Step 1: Generate consistent character descriptions
    const characterResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a character designer for comics. Create detailed, consistent character descriptions for a comic about: "${prompt}". The comic will be ${panelCount} panels in ${artStyle} style with a ${tone} tone.

Return a JSON object with:
{
  "mainCharacters": [
    {
      "name": "Character Name",
      "description": "Detailed physical appearance: hair color, eye color, clothing, distinctive features, body type, age range",
      "personality": "Key personality traits"
    }
  ],
  "setting": "Main setting/environment description"
}

Make characters visually distinctive and memorable. Include specific details like "short brown hair", "wearing a red jacket", "round glasses", etc.`,
        },
        { role: "user", content: `Create character descriptions for a comic about: ${prompt}` },
      ],
      max_tokens: 600,
      temperature: 0.7,
    });

    let characters, setting;
    try {
      let content = characterResponse.choices[0].message.content || "";
      // Remove markdown code blocks if present
      content = content
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      const characterInfo = JSON.parse(content);
      characters = characterInfo.mainCharacters || [];
      setting = characterInfo.setting || "generic setting";
    } catch (error) {
      console.error("Error parsing character data:", error);
      // Fallback character
      characters = [
        {
          name: "Main Character",
          description: "A distinctive character with unique features",
          personality: "determined and expressive",
        },
      ];
      setting = "appropriate setting for the story";
    }

    // Step 2: Generate complete story first
    const completeStoryResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a storyteller. Create a complete, coherent story about "${prompt}" using these characters and setting:

CHARACTERS: ${JSON.stringify(characters)}
SETTING: ${setting}

Create a ${tone} story with:
- Clear beginning, middle, and end
- Character development and dialogue
- Appropriate pacing for ${panelCount} panels
- Logical progression of events

Write a complete narrative story (not panel descriptions) that will later be broken into ${panelCount} comic panels.`,
        },
        { role: "user", content: `Write a complete story about: ${prompt}` },
      ],
      max_tokens: 800,
      temperature: 0.7,
    });

    const completeStory = completeStoryResponse.choices[0].message.content || "";

    // Step 3: Break story into panel descriptions
    const panelResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a comic panel designer. Break this complete story into exactly ${panelCount} individual comic panels.

STORY: ${completeStory}

CHARACTERS: ${JSON.stringify(characters)}
SETTING: ${setting}

Return EXACTLY this JSON format:
[
  "Panel 1: [Single panel scene description with character details]. Dialogue: '[dialogue]'",
  "Panel 2: [Single panel scene description with character details]. Dialogue: '[dialogue]'",
  ...
]

CRITICAL RULES:
- Use EXACT character descriptions from the character list
- Each panel shows ONE moment/scene from the story
- Keep dialogue under 8 words per panel
- Describe what's happening in that specific moment
- Maintain story continuity between panels`,
        },
        { role: "user", content: `Break this story into ${panelCount} panels` },
      ],
      max_tokens: Math.min(1000, 250 * panelCount),
      temperature: 0.5,
    });

    let comicDescriptionText = panelResponse.choices[0].message.content || "";
    // Remove markdown code blocks if present
    comicDescriptionText = comicDescriptionText
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    // Parse the LLM response to extract panel descriptions
    let panelDescriptions: string[];
    try {
      // Try to parse as JSON array first
      const arrayMatch = comicDescriptionText.match(/\[.*\]/s);
      if (arrayMatch) {
        panelDescriptions = JSON.parse(arrayMatch[0]);
      } else {
        // Fallback: split by panel numbers
        const panels = comicDescriptionText.split(/Panel \d+/).slice(1);
        panelDescriptions = panels.map((panel, index) => `Panel ${index + 1}${panel.trim()}`);
      }
    } catch (error) {
      console.error("Error parsing panel descriptions:", error);
      // Fallback: create panels based on original prompt
      panelDescriptions = Array(panelCount)
        .fill(0)
        .map((_, i) => {
          const stages = ["beginning", "development", "climax", "conclusion"];
          const stage = stages[Math.min(i, stages.length - 1)];
          return `Panel ${i + 1}: ${prompt} - ${stage} scene. Speech bubble: "${
            stage === "climax" ? "Oh no!" : stage === "conclusion" ? "All done!" : "Here we go!"
          }"`;
        });
    }

    // Step 4: Generate images using DALL-E with character consistency and retry logic
    const imagePromises = panelDescriptions.map(async (panelDesc, index) => {
      // Create character consistency prompt
      const characterPrompt = characters.map((char: any) => `${char.name}: ${char.description}`).join(". ");

      // Create style-specific prompt
      let stylePrompt = "";
      switch (artStyle) {
        case "manga":
          stylePrompt = "Manga-style comic panel with clean line art, dramatic expressions, and manga visual effects";
          break;
        case "superhero":
          stylePrompt =
            "Superhero comic panel with bold lines, dynamic poses, and vibrant colors in classic comic book style";
          break;
        case "cyberpunk":
          stylePrompt = "Cyberpunk comic panel with neon colors, futuristic technology, and dark urban atmosphere";
          break;
        case "watercolor":
          stylePrompt = "Watercolor comic panel with soft, flowing colors and artistic brush strokes";
          break;
        case "noir":
          stylePrompt = "Film noir comic panel with high contrast, dramatic shadows, and monochromatic tones";
          break;
        case "pixelart":
          stylePrompt = "Pixel art comic panel with retro 8-bit or 16-bit video game aesthetics";
          break;
        case "disney":
          stylePrompt = "Disney animation style comic panel with expressive characters and bright, cheerful colors";
          break;
        default: // cartoon
          stylePrompt = "Cartoon comic panel with bright colors, expressive characters, and clean line art";
      }

      // Enhanced prompt with character consistency and single panel specification
      const fullPrompt = `SINGLE COMIC PANEL ONLY: ${stylePrompt}: ${panelDesc}. 

CHARACTER CONSISTENCY: ${characterPrompt}. 

CRITICAL REQUIREMENTS:
- This is ONE SINGLE comic panel, not multiple panels
- Do NOT show multiple panels or comic grid layouts
- Maintain exact same character appearance as described
- Same hair color, same clothing, same facial features, same body type
- The overall mood should be ${tone}
- Professional comic book quality single panel`;

      // Retry logic for image generation
      const maxRetries = 3;
      let lastError;

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          const imageResponse = await openai.images.generate({
            model: "dall-e-3",
            prompt: fullPrompt,
            n: 1,
            size: "1024x1024",
            quality: "standard",
            style: "vivid",
          });

          return {
            url: imageResponse.data[0].url,
            description: panelDesc,
          };
        } catch (error) {
          lastError = error;
          console.error(`Attempt ${attempt} failed for panel ${index + 1}:`, error);

          if (attempt < maxRetries) {
            // Wait before retrying (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          }
        }
      }

      // If all retries failed, throw the last error
      throw lastError;
    });

    const panels = await Promise.all(imagePromises);

    return NextResponse.json({
      panels: panels,
      gridLayout: gridSize,
    });
  } catch (error) {
    console.error("Error in generate-comic API:", error);
    return NextResponse.json({ error: "Failed to generate comic" }, { status: 500 });
  }
}
