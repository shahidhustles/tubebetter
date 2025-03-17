import { mutation, query } from "./_generated/server";
import { v } from "convex/values";


export const getVideoById = query({
  args: { videoId: v.string(), userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("videos")
      .withIndex("by_user_and_video_id", (q) =>
        q.eq("userId", args.userId).eq("videoId", args.videoId)
      )
      .unique();
  },
});

export const createVideoEntry = mutation({
  args: {
    videoId: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("videos", {
      videoId: args.videoId,
      userId: args.userId,
    });
    return id;
  },
});

// export const getVideoByDocId = query({

// })