import { getYoutubeTranscript } from "@/actions/getYoutubeTranscript";
import { tool } from "ai";
import { z } from "zod";

//make sure tools are not *functions*
export const fetchTranscript = tool({
  description: "Fetch the transcript of a youtube video in segments",
  parameters: z.object({
    videoId: z
      .string()
      .describe(
        "The videoId required to fetch the respective video's transcript"
      ),
  }),
  execute: async ({ videoId }) => {
    const transcriptObject = await getYoutubeTranscript(videoId);
    return {
      transcript: transcriptObject.transcript,
      cache: transcriptObject.cache,
    };
  },
});
