"use client";

import { createOrGetVideo } from "@/actions/createOrGetVideo";
import AIAgentChat from "@/components/AIAgentChat";
import ThumbnailGeneration from "@/components/ThumbnailGeneration";
import TitleGeneration from "@/components/TitleGeneration";
import Transcription from "@/components/Transcription";
import Usage from "@/components/Usage";
import YoutubeVideoDetails from "@/components/YoutubeVideoDetails";
import { Doc } from "@/convex/_generated/dataModel";
import { FeatureFlag } from "@/features/flags";
import { useUser } from "@clerk/nextjs";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const AnalysisPage = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const { user } = useUser();
  const [video, setVideo] = useState<Doc<"videos"> | null | undefined>(
    undefined
  );

  useEffect(() => {
    if (!user?.id) return;

    const fetchVideo = async () => {
      // Analyse the video (add video to db here)
      const response = await createOrGetVideo(videoId as string, user.id);
      if (!response.success) {
        // toast.error("Error creating or getting video", {
        //   description: response.error,
        //   duration: 10000,
        // });
      } else {
        setVideo(response.data!);
      }
    };

    fetchVideo();
  }, [videoId, user]);

  const VideoTranscriptionStatus =
    video === undefined ? (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
        <span className="text-sm text-gray-700">Loading...</span>
      </div>
    ) : !video ? (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-full">
        <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
        <p className="text-sm text-amber-700">
          This is your first time analyzing this video. <br />
          <span className="font-semibold">
            (1 Analysis token is being used!)
          </span>
        </p>
      </div>
    ) : (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full">
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        <p className="text-sm text-green-700">
          Analysis exists for this video - no additional tokens needed in future
          calls! <br />
        </p>
      </div>
    );

  return (
    <div className="xl:container mx-auto px-4 md:px-0">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Side */}
        <div className="order-2 lg:order-1 flex flex-col gap-4 bg-white lg:border-r border-gray-200 p-6">
          {/* Analysis Section */}
          <div className="flex flex-col gap-4 p-4 border border-gray-200 rounded-xl">
            <Usage
              featureFlag={FeatureFlag.ANALYSE_VIDEO}
              title="Analyse Video"
            />

            {/* Video Transcription status */}
            {VideoTranscriptionStatus}
          </div>

          {/* Youtube video details */}
          <YoutubeVideoDetails videoId={videoId} />

          {/* Thumbnail Generation */}
          <ThumbnailGeneration videoId={videoId} />

          {/* Title Generation */}
          <TitleGeneration videoId={videoId} />

          {/* Transcription */}
          <Transcription videoId={videoId} />
        </div>

        {/* Right Side */}
        <div className="order-1 lg:order-2 lg:sticky lg:top-20 h-[500px] md:h-[calc(100vh-6rem)]">
          {/* Ai Agent Chat Section */}
          <AIAgentChat videoId={videoId} />
        </div>
      </div>
    </div>
  );
};
export default AnalysisPage;
