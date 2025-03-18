"use server";

import { api } from "@/convex/_generated/api";
import { FeatureFlag, featureFlagEvents } from "@/features/flags";
import { client } from "@/lib/schematic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { currentUser } from "@clerk/nextjs/server";
import { generateText } from "ai";
import { ConvexHttpClient } from "convex/browser";


const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);


export async function titleGeneration(
  videoId: string,
  videoSummary: string,
  considerations: string
) {
  const user = await currentUser();

  if (!user?.id) {
    throw new Error("User not found");
  }

  const google = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  });

  try {
    console.log("🎯 Video summary:", videoSummary);
    console.log("🎯 Generating title for video for videoId:", videoId);
    console.log("🎯 Considerations:", considerations);

    const {text : title} = await generateText({
      model: google("gemini-2.0-flash-001"),
      messages: [
        {
          role: "system",
          content:
            "You are a helpful YouTube video creator assistant that creates high quality SEO friendly concise video titles.",
        },
        {
          role: "user",
          content: `Please provide ONE concise YouTube title (and nothing else) for this video. Focus on the main points and key takeaways, it should be SEO friendly and 100 characters or less:\n\n${videoSummary}\n\n${considerations}`,
        },
      ],
      
    });

    if (!title) {
      return {
        error: "Failed to generate title (System error)",
      };
    }

    await convex.mutation(api.titles.saveGeneratedTitles, {
      videoId,
      userId: user.id,
      title: title,
    });

    await client.track({
      event: featureFlagEvents[FeatureFlag.TITLE_GENERATIONS].event,
      company: {
        id: user.id,
      },
      user: {
        id: user.id,
      },
    });

    console.log("🎯 Title generated:", title);

    return title;
  } catch (error) {
    console.error("❌ Error generating title:", error);
    throw new Error("Failed to generate title");
  }
}