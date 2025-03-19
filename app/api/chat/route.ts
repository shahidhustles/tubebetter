import { getVideoDetails } from "@/actions/getVideoDetails";
import { currentUser } from "@clerk/nextjs/server";
import { streamText, tool } from "ai";
import { NextResponse } from "next/server";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { fetchTranscript } from "@/tools/fetchTranscript";
import { generateImage } from "@/tools/generateImage";
import { z } from "zod";
import { getVideoIdFromUrl } from "@/lib/getVideoIdFromUrl";
import generateTitle from "@/tools/generateTitles";


const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export async function POST(req: Request) {
  const { videoId, messages } = await req.json();

  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const videoDetails = await getVideoDetails(videoId);

  const systemMessage = `You are an AI agent ready to accept questions from the user about ONE specific video. 
  The video ID in question is ${videoId} but you'll refer to this as ${videoDetails?.title || "Selected Video"}.
   Use emojis to make the conversation more engaging. If an error occurs, explain it to the user and ask them to try again 
   later. If the error suggest the user upgrade, explain that they must upgrade to use the feature, tell them to go 
   to 'Manage Plan' in the header and upgrade. If any tool is used, analyse the response and if it contains a cache, 
   explain that the transcript is cached because they previously transcribed the video saving the user a token - use words
    like database instead of cache to make it more easy to understand. Please format for notion. For every question which 
    requires more context you can use "fetchTranscript" tool from your arsenal,take the help of the transcript and then decide on the best performing prompt for the thumbnail,
     for generating thumbnail use "generateImage" tool. For generating titles use "generateTitle" tools and it will be helpfull
     if you pass in some summary and consideration from the transcript to provide better titles`;

  const result = streamText({
    model: google("gemini-1.5-flash"),
    messages: [
      {
        role: "system",
        content: systemMessage,
      },
      ...messages,
    ],
    tools: {
      fetchTranscript: fetchTranscript,
      generateImage: generateImage(user?.id, videoId),
      generateTitle: generateTitle,
      getVideoDetails: tool({
        parameters: z.object({
          videoId: z
            .string()
            .describe("The youtube video id to get details about it."),
        }),
        description: "GEt the details of a Youtube video",
        execute: async ({ videoId }) => {
          const videoDetails = getVideoDetails(videoId);
          return videoDetails;
        },
      }),
      extractVideoId: tool({
        description: "Extract the video ID from a URL",
        parameters: z.object({
          url: z.string().describe("The URL to extract the video ID from"),
        }),
        execute: async ({ url }) => {
          const videoId =  getVideoIdFromUrl(url);
          return { videoId };
        },
      }),
    },
  });

  return result.toDataStreamResponse();
}
