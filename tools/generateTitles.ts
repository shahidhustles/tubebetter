
import { titleGeneration } from "@/actions/titleGeneration";
import { tool } from "ai";
import { z } from "zod";

const generateTitle = tool({
  description: "Generate a title for a YouTube video",
  parameters: z.object({
    videoId: z.string().describe("The video ID to generate a title for"),
    videoSummary: z
      .string()
      .describe("The summary of the video to generate a title for"),
    considerations: z
      .string()
      .describe("Any additional considerations for the title"),
  }),
  execute: async ({ videoId, videoSummary, considerations }) => {
    const title = await titleGeneration(videoId, videoSummary, considerations);
    return { title };
  },
});

export default generateTitle;