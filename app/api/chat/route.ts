import { getVideoDetails } from "@/actions/getVideoDetails";
import { createGroq } from "@ai-sdk/groq";
import { currentUser } from "@clerk/nextjs/server";
import { streamText } from "ai";
import { NextResponse } from "next/server";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { fetchTranscript } from "@/tools/fetchTranscript";

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

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
    requires more context you can use "fetchTranscript" tool from your arsenal`;

  const result = streamText({
    model : groq("gemma2-9b-it"),
    // model: google("gemini-1.5-flash"),
    messages: [
      {
        role: "system",
        content: systemMessage,
      },
      ...messages,
    ],
    tools: { fetchTranscript: fetchTranscript },
  });

  return result.toDataStreamResponse();
}
