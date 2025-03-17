import { v } from "convex/values";
import { query } from "./_generated/server";

export const list = query({
  args: {
    videoId: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    

    return await ctx.db
      .query("titles")
      .withIndex("by_user_and_video")
      .filter((q) => q.eq("userId", args.userId))
      .filter((q) => q.eq("videoId", args.videoId))
      .collect();
  },
});
