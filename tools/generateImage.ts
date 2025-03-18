import { generateFluxImage } from "@/actions/generateFluxImage";
import { FeatureFlag } from "@/features/flags";
import { client } from "@/lib/schematic";
import { tool } from "ai";
import { z } from "zod";

export const generateImage = (userId: string, videoId: string) =>
  tool({
    parameters: z.object({
      prompt: z.string().describe("The prompt to generate an image for"),
    }),
    description: "Generate a thumbnail for the video",
    execute: async ({ prompt }) => {
      const schematicCtx = {
        company: { id: userId },
        user: {
          id: userId,
        },
      };

      const isImageGenerationEnabled = await client.checkFlag(
        schematicCtx,
        FeatureFlag.IMAGE_GENERATION
      );

      if (!isImageGenerationEnabled) {
        return {
          error: "Image generation is not enabled, the user must upgrade",
        };
      }

      // Use only the videoId from the closure, not from parameters
      const image = await generateFluxImage(videoId, prompt);
      return { image };
    },
  });
