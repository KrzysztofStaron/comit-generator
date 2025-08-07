import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import Replicate from "replicate";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(request: NextRequest) {
  const { prompt, gridSize = "2x2", artStyle = "cartoon", tone = "funny" } = await request.json();

  if (!prompt) {
    return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
  }

  const openaiApiKey = process.env.OPENAI_API_KEY;
  const replicateApiToken = process.env.REPLICATE_API_TOKEN;

  if (!openaiApiKey) {
    return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 });
  }

  if (!replicateApiToken) {
    return NextResponse.json({ error: "Replicate API token not configured" }, { status: 500 });
  }

  // Create a readable stream for SSE
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      let isClosed = false;

      const sendEvent = (event: string, data: any) => {
        if (isClosed) {
          console.log("Attempted to send event to closed stream:", event);
          return;
        }

        try {
          const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(message));
        } catch (error) {
          console.error("Error sending event:", error);
          isClosed = true;
        }
      };

      // Handle controller close
      const closeController = () => {
        if (!isClosed) {
          isClosed = true;
          try {
            controller.close();
          } catch (error) {
            console.log("Controller already closed");
          }
        }
      };

      try {
        // Calculate panel count based on grid size
        const [rows, cols] = gridSize.split("x").map(Number);
        const panelCount = rows * cols;

        sendEvent("start", {
          message: "Starting comic generation...",
          totalPanels: panelCount,
          gridSize,
        });

        // Step 1: Generate consistent character descriptions
        sendEvent("progress", { message: "Creating character descriptions...", step: "characters" });

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
          content = content
            .replace(/```json\n?/g, "")
            .replace(/```\n?/g, "")
            .trim();
          const characterInfo = JSON.parse(content);
          characters = characterInfo.mainCharacters || [];
          setting = characterInfo.setting || "generic setting";
        } catch (error) {
          console.error("Error parsing character data:", error);
          characters = [
            {
              name: "Main Character",
              description: "A distinctive character with unique features",
              personality: "determined and expressive",
            },
          ];
          setting = "appropriate setting for the story";
        }

        sendEvent("progress", { message: "Writing the story...", step: "story" });

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

        sendEvent("progress", { message: "Breaking story into panels...", step: "panels" });

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
        comicDescriptionText = comicDescriptionText
          .replace(/```json\n?/g, "")
          .replace(/```\n?/g, "")
          .trim();

        // Parse the LLM response to extract panel descriptions
        let panelDescriptions: string[];
        try {
          const arrayMatch = comicDescriptionText.match(/\[[\s\S]*\]/);
          if (arrayMatch) {
            panelDescriptions = JSON.parse(arrayMatch[0]);
          } else {
            const panels = comicDescriptionText.split(/Panel \d+/).slice(1);
            panelDescriptions = panels.map((panel, index) => `Panel ${index + 1}${panel.trim()}`);
          }
        } catch (error) {
          console.error("Error parsing panel descriptions:", error);
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

        // Helper function to create style-specific prompt
        const getStylePrompt = (artStyle: string) => {
          switch (artStyle) {
            case "manga":
              return "Manga-style comic panel with clean line art, dramatic expressions, and manga visual effects";
            case "superhero":
              return "Superhero comic panel with bold lines, dynamic poses, and vibrant colors in classic comic book style";
            case "cyberpunk":
              return "Cyberpunk comic panel with neon colors, futuristic technology, and dark urban atmosphere";
            case "watercolor":
              return "Watercolor comic panel with soft, flowing colors and artistic brush strokes";
            case "noir":
              return "Film noir comic panel with high contrast, dramatic shadows, and monochromatic tones";
            case "pixelart":
              return "Pixel art comic panel with retro 8-bit or 16-bit video game aesthetics";
            case "disney":
              return "Disney animation style comic panel with expressive characters and bright, cheerful colors";
            default: // cartoon
              return "Cartoon comic panel with bright colors, expressive characters, and clean line art";
          }
        };

        const characterPrompt = characters.map((char: any) => `${char.name}: ${char.description}`).join(". ");
        const stylePrompt = getStylePrompt(artStyle);

        sendEvent("progress", { message: "Starting image generation...", step: "images" });

        // Step 4: Generate images with progress updates
        const panels = [];
        let previousPanelUrl = "";

        for (let i = 0; i < panelDescriptions.length; i++) {
          const panelDesc = panelDescriptions[i];

          sendEvent("panel-start", {
            panelIndex: i,
            message: `Generating panel ${i + 1}/${panelDescriptions.length}...`,
            description: panelDesc,
          });

          try {
            if (i === 0) {
              // First panel: Use DALL-E 3
              const fullPrompt = `SINGLE COMIC PANEL ONLY: ${stylePrompt}: ${panelDesc}. 

CHARACTER CONSISTENCY: ${characterPrompt}. 

CRITICAL REQUIREMENTS:
- This is ONE SINGLE comic panel, not multiple panels
- Do NOT show multiple panels or comic grid layouts
- Maintain exact same character appearance as described
- Same hair color, same clothing, same facial features, same body type
- The overall mood should be ${tone}
- Professional comic book quality single panel`;

              const imageResponse = await openai.images.generate({
                model: "dall-e-3",
                prompt: fullPrompt,
                n: 1,
                size: "1024x1024",
                quality: "standard",
                style: "vivid",
              });

              if (!imageResponse.data || !imageResponse.data[0] || !imageResponse.data[0].url) {
                throw new Error("DALL-E 3 image generation failed: No image URL returned.");
              }

              const panelUrl = imageResponse.data[0].url;
              const panel = {
                url: panelUrl,
                description: panelDesc,
              };

              panels.push(panel);
              previousPanelUrl = panelUrl;

              sendEvent("panel-complete", {
                panelIndex: i,
                panel,
                message: `Panel ${i + 1} completed!`,
              });
            } else {
              // Subsequent panels: Use Replicate Flux with previous panel as context
              const fluxPrompt = `${stylePrompt}: ${panelDesc}. 

CHARACTER CONSISTENCY: Maintain the EXACT same character appearance from the previous panel: ${characterPrompt}. 

CRITICAL REQUIREMENTS:
- This is ONE SINGLE comic panel, not multiple panels
- Use the previous panel as reference for character consistency
- Same hair color, same clothing, same facial features, same body type as in the reference image
- The overall mood should be ${tone}
- Professional comic book quality single panel`;

              console.log(`Attempting Flux generation for panel ${i + 1} with previous URL:`, previousPanelUrl);

              // Validate the previous panel URL before using it
              if (!previousPanelUrl || !previousPanelUrl.startsWith("http")) {
                throw new Error(`Invalid previous panel URL: ${previousPanelUrl}`);
              }

              try {
                // Try multiple Flux models for better success rate
                let output;
                let fluxModel:
                  | "black-forest-labs/flux-kontext-max"
                  | "black-forest-labs/flux-dev"
                  | "black-forest-labs/flux-schnell" = "black-forest-labs/flux-kontext-max";

                try {
                  // First attempt: flux-kontext-max with context
                  output = await replicate.run(fluxModel as "black-forest-labs/flux-kontext-max", {
                    input: {
                      prompt: fluxPrompt,
                      input_image: previousPanelUrl,
                      output_format: "jpg",
                      guidance_scale: 7.5,
                      num_inference_steps: 28,
                      seed: Math.floor(Math.random() * 1000000), // Random seed for variety
                    },
                  });
                } catch (kontextError) {
                  console.log(
                    `Flux kontext-max failed, trying alternative model:`,
                    kontextError instanceof Error ? kontextError.message : "Unknown error"
                  );

                  try {
                    // Second attempt: Try regular flux-dev without context reference
                    fluxModel = "black-forest-labs/flux-dev";
                    output = await replicate.run(fluxModel, {
                      input: {
                        prompt: `${stylePrompt}: ${panelDesc}. CHARACTER CONSISTENCY: ${characterPrompt}. Style: ${tone}`,
                        output_format: "jpg",
                        guidance_scale: 7.5,
                        num_inference_steps: 28,
                        seed: Math.floor(Math.random() * 1000000),
                      },
                    });

                    console.log(`Successfully generated with ${fluxModel} fallback`);
                  } catch (fluxDevError) {
                    const errorMessage =
                      fluxDevError instanceof Error
                        ? fluxDevError.message
                        : typeof fluxDevError === "object" && fluxDevError !== null && "message" in fluxDevError
                        ? (fluxDevError as any).message
                        : String(fluxDevError);

                    console.log(`Flux-dev also failed, trying flux-schnell:`, errorMessage);

                    // Third attempt: Try flux-schnell (faster, simpler model)
                    fluxModel = "black-forest-labs/flux-schnell";
                    output = await replicate.run(fluxModel, {
                      input: {
                        prompt: `${stylePrompt}: ${panelDesc}. CHARACTER: ${characterPrompt}. ${tone} mood`,
                        output_format: "jpg",
                        num_inference_steps: 4, // Schnell uses fewer steps
                        seed: Math.floor(Math.random() * 1000000),
                      },
                    });

                    console.log(`Successfully generated with ${fluxModel} as final fallback`);
                  }
                }

                // The output should be a URL or file-like object
                let panelUrl;
                if (typeof output === "string") {
                  panelUrl = output;
                } else if (output && typeof output === "object" && "url" in output) {
                  panelUrl = (output as any).url();
                } else if (Array.isArray(output) && output.length > 0) {
                  panelUrl = output[0];
                } else {
                  throw new Error("Flux image generation failed: Unexpected output format.");
                }

                const panel = {
                  url: panelUrl,
                  description: panelDesc,
                };

                panels.push(panel);
                previousPanelUrl = panelUrl;

                sendEvent("panel-complete", {
                  panelIndex: i,
                  panel,
                  message: `Panel ${i + 1} completed with ${fluxModel}!`,
                });
              } catch (fluxError) {
                console.error(`Flux generation failed for panel ${i + 1}:`, fluxError);

                // Immediate fallback to DALL-E 3 for this specific panel
                sendEvent("panel-error", {
                  panelIndex: i,
                  message: `Flux failed for panel ${i + 1}, using DALL-E 3 fallback...`,
                });

                const fallbackPrompt = `SINGLE COMIC PANEL ONLY: ${stylePrompt}: ${panelDesc}. 

CHARACTER CONSISTENCY: ${characterPrompt}. 

CRITICAL REQUIREMENTS:
- This is ONE SINGLE comic panel, not multiple panels
- Maintain exact same character appearance as described
- Same hair color, same clothing, same facial features, same body type
- The overall mood should be ${tone}
- Professional comic book quality single panel`;

                const fallbackResponse = await openai.images.generate({
                  model: "dall-e-3",
                  prompt: fallbackPrompt,
                  n: 1,
                  size: "1024x1024",
                  quality: "standard",
                  style: "vivid",
                });

                if (!fallbackResponse.data || !fallbackResponse.data[0] || !fallbackResponse.data[0].url) {
                  throw new Error("Fallback DALL-E 3 image generation also failed.");
                }

                const panelUrl = fallbackResponse.data[0].url;
                const panel = {
                  url: panelUrl,
                  description: panelDesc,
                };

                panels.push(panel);
                previousPanelUrl = panelUrl;

                sendEvent("panel-complete", {
                  panelIndex: i,
                  panel,
                  message: `Panel ${i + 1} completed (DALL-E 3 fallback)!`,
                });
              }
            }
          } catch (error) {
            console.error(`Error generating panel ${i + 1}:`, error);

            sendEvent("panel-error", {
              panelIndex: i,
              message: `Error generating panel ${i + 1}, trying fallback...`,
            });

            // Fallback: Use DALL-E 3 if Flux fails
            try {
              const fallbackPrompt = `SINGLE COMIC PANEL ONLY: ${stylePrompt}: ${panelDesc}. 

CHARACTER CONSISTENCY: ${characterPrompt}. 

CRITICAL REQUIREMENTS:
- This is ONE SINGLE comic panel, not multiple panels
- Maintain exact same character appearance as described
- The overall mood should be ${tone}
- Professional comic book quality single panel`;

              const fallbackResponse = await openai.images.generate({
                model: "dall-e-3",
                prompt: fallbackPrompt,
                n: 1,
                size: "1024x1024",
                quality: "standard",
                style: "vivid",
              });

              if (!fallbackResponse.data || !fallbackResponse.data[0] || !fallbackResponse.data[0].url) {
                throw new Error("Fallback DALL-E 3 image generation failed: No image URL returned.");
              }

              const panelUrl = fallbackResponse.data[0].url;
              const panel = {
                url: panelUrl,
                description: panelDesc,
              };

              panels.push(panel);
              previousPanelUrl = panelUrl;

              sendEvent("panel-complete", {
                panelIndex: i,
                panel,
                message: `Panel ${i + 1} completed (fallback)!`,
              });
            } catch (fallbackError) {
              console.error(`Fallback generation failed for panel ${i + 1}:`, fallbackError);
              sendEvent("panel-failed", {
                panelIndex: i,
                message: `Failed to generate panel ${i + 1}`,
              });
              throw new Error(`Failed to generate panel ${i + 1}`);
            }
          }
        }

        sendEvent("complete", {
          panels,
          gridLayout: gridSize,
          message: "Comic generation completed!",
        });
      } catch (error) {
        console.error("Error in comic generation stream:", error);
        if (!isClosed) {
          sendEvent("error", {
            message: "Failed to generate comic",
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      } finally {
        closeController();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
