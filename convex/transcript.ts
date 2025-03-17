import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getTranscriptByVideoId = query({
  args: {
    videoId: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const transcript = await ctx.db
      .query("transcript")
      .withIndex("by_user_and_video_id", (q) =>
        q.eq("userId", args.userId).eq("videoId", args.videoId)
      )
      .unique();

    return transcript;
  },
});

export const storeTranscript = mutation({
  args: {
    videoId: v.string(),
    userId: v.string(),
    transcript: v.array(
      v.object({
        text: v.string(),
        timestamp: v.string(),
      })
    ),
  },

  handler: async (ctx, args) => {
    const existingTranscript = await ctx.db
      .query("transcript")
      .withIndex("by_user_and_video_id", (q) =>
        q.eq("userId", args.userId).eq("videoId", args.videoId)
      )
      .unique();

    if (existingTranscript) {
      return existingTranscript;
    }

    // Create new transcript and return the result
    const id = await ctx.db.insert("transcript", {
      videoId: args.videoId,
      userId: args.userId,
      transcript: args.transcript,
    });

    return await ctx.db.get(id);
  },
});
