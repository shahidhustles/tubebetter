"use server";

//for reference
//https://docs.convex.dev/file-storage/upload-files

import { currentUser } from "@clerk/nextjs/server";
import { createTogetherAI } from "@ai-sdk/togetherai";
import { experimental_generateImage as generateImage } from "ai";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { client } from "@/lib/schematic";
import { FeatureFlag, featureFlagEvents } from "@/features/flags";

const IMAGE_SIZE = "1792x1024" as const;
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function generateFluxImage(videoId: string, prompt: string) {
  const user = await currentUser();

  if (!user) {
    throw new Error("User not found");
  }

  const togetherai = createTogetherAI({
    apiKey: process.env.TOGETHER_AI_API_KEY ?? "",
  });

  console.log(`Starting to generate image with the following prompt : ${prompt}`);
  
  const { image } = await generateImage({
    model: togetherai.image("black-forest-labs/FLUX.1-schnell-Free"),
    prompt: prompt,
    size: IMAGE_SIZE,
    aspectRatio: `${16}:${9}`,
    n: 1,
  });

  const arr = image.uint8Array;

  if (!arr) {
    throw new Error("Failed to generate image");
  }

  // Step 1: Get a short-lived upload URL for Convex
  console.log("📤 Getting upload URL...");
  const postUrl = await convex.mutation(api.images.generateUploadUrl);
  console.log("✅ Got upload URL");

  // Step 2: convert the image from the URL
  console.log("⬇️ Convert the Unit8Array image to Blob...");
  const imageBlob: Blob = new Blob([arr], { type: "image/png" });
  console.log("✅ Converted and downloaded image successfully");

  // Step 3: Upload the image to the convex storage bucket
  console.log("📁 Uploading image to storage...");
  const result = await fetch(postUrl, {
    method: "POST",
    headers: { "Content-Type": imageBlob!.type },
    body: imageBlob,
  });

  const { storageId } = await result.json();
  console.log("✅ Uploaded image to storage with ID:", storageId);

  // Step 4: Save the newly allocated storage id to the database
  console.log("💾 Saving image reference to database...");
  await convex.mutation(api.images.storeImage, {
    storageId: storageId,
    videoId,
    userId: user.id,
  });
  console.log("✅ Saved image reference to database");

  // get serve image url
  const dbImageUrl = await convex.query(api.images.getImage, {
    videoId,
    userId: user.id,
  });

  // Track the image generation event
  await client.track({
    event: featureFlagEvents[FeatureFlag.IMAGE_GENERATION].event,
    company: {
      id: user.id,
    },
    user: {
      id: user.id,
    },
  });

  return {
    imageUrl: dbImageUrl,
  };
}
