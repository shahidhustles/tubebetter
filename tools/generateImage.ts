import { tool } from "ai";

export const generateImage = (videoId: string) =>
  tool({
    args: {
      videoId,
    },
    description : "Generate a thumbnail for the video"
    execute : {

    }
  });
