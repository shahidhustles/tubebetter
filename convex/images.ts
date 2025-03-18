import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

//https://docs.convex.dev/file-storage/upload-files

export const getImages = query({
  args: {
    videoId: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const images = await ctx.db
      .query("images")
      .withIndex("by_user_and_video", (q) =>
        q.eq("userId", args.userId).eq("videoId", args.videoId)
      )
      .collect();

    const imageUrls = await Promise.all(
      images.map(async (image) => ({
        ...image,
        url: await ctx.storage.getUrl(image.storageId),
      }))
    );

    return imageUrls;
  },
});

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

// Store the storageId for a video
export const storeImage = mutation({
  args: {
    storageId: v.id("_storage"),
    videoId: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const imageDocId = await ctx.db.insert("images", {
      storageId: args.storageId,
      userId: args.userId,
      videoId: args.videoId,
    });

    return imageDocId;
  },
});

// Get images for a specific user and video combination (.first())
export const getImage = query({
  args: {
    userId: v.string(),
    videoId: v.string(),
  },
  handler: async (ctx, args) => {
    const image = await ctx.db
      .query("images")
      .withIndex("by_user_and_video", (q) =>
        q.eq("userId", args.userId).eq("videoId", args.videoId)
      )
      .first();

    if (!image) {
      return null;
    }

    return await ctx.storage.getUrl(image.storageId);
  },
});
