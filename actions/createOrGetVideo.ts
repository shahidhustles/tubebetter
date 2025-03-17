"use server";

import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { FeatureFlag, featureFlagEvents } from "@/features/flags";
import { checkFeatureUsageLimit } from "@/lib/checkFeatureUsageLimit";
import { client } from "@/lib/schematic";
import { currentUser } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export interface VideoResponse {
  success: boolean;
  data?: Doc<"videos">;
  error?: string;
}

export const createOrGetVideo = async (
  videoId: string,
  userId: string
): Promise<VideoResponse> => {
  console.log(
    `Starting createOrGetVideo for videoId: ${videoId}, userId: ${userId}`
  );
  const user = await currentUser();

  if (!user) {
    return {
      success: false,
      error: "User not found",
    };
  }

  const featureCheck = await checkFeatureUsageLimit(
    user.id,
    featureFlagEvents[FeatureFlag.ANALYSE_VIDEO].event
  );

  if (!featureCheck.success) {
    return {
      success: false,
      error: featureCheck.error,
    };
  }

  try {
    console.log(`Querying for existing video: ${videoId}`);
    const video = await convex.query(api.videos.getVideoById, {
      videoId,
      userId,
    });

    console.log(`Query result:`, video);

    if (!video) {
      // Analyse event
      console.log(
        `🔍 Analyse event for video ${videoId} - Token will be spent`
      );

      try {
        console.log(`Creating new video entry for: ${videoId}`);
        const insertedDocId = await convex.mutation(
          api.videos.createVideoEntry,
          {
            videoId,
            userId,
          }
        );
        console.log(
          `Video entry created with internal document ID: ${insertedDocId}`
        );
      } catch (createError) {
        console.error(`Error creating video entry:`, createError);
        throw createError;
      }

      try {
        console.log(`Fetching newly created video with videoId: ${videoId}`);
        const newVideo = await convex.query(api.videos.getVideoById, {
          videoId,
          userId,
        });
        console.log(`Newly created video query result:`, newVideo);

        if (!newVideo) {
          console.error(
            `Failed to retrieve newly created video for videoId: ${videoId}`
          );
        }

        console.log("Tracking analyse video event...");
        await client.track({
          event: featureFlagEvents[FeatureFlag.ANALYSE_VIDEO].event,
          company: {
            id: userId,
          },
          user: {
            id: userId,
          },
        });

        return {
          success: true,
          data: newVideo!,
        };
      } catch (queryError) {
        console.error(`Error querying new video:`, queryError);
        throw queryError;
      }
    } else {
      console.log("Video exists - no token needs to be spent");
      return {
        success: true,
        data: video,
      };
    }
  } catch (error) {
    console.error(`Error details for videoId ${videoId}:`, error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again later.",
    };
  }
};
