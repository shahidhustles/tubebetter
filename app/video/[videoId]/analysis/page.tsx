"use client";

import ThumbnailGeneration from "@/components/ThumbnailGeneration";
import TitleGeneration from "@/components/TitleGeneration";
import Transcription from "@/components/Transcription";
import Usage from "@/components/Usage";
import YoutubeVideoDetails from "@/components/YoutubeVideoDetails";
import { FeatureFlag } from "@/features/flags";
import { useParams } from "next/navigation";

const AnalysisPage = () => {
  const { videoId } = useParams<{ videoId: string }>();
  return (
    <div className="mx-auto xl:container px-4 md:px-0">
      <div className="grid lg:grid-cols-2 grid-cols-1 gap-4">
        {/* Left Side  */}
        <div className="flex flex-col gap-4 bg-white lg:border-r border-gray-200 p-6">
          {/* Analysis  */}
          <div className="flex flex-col gap-4 p-4 border border-gray-200 rounded-xl">
            <Usage
              featureFlag={FeatureFlag.ANALYSE_VIDEO}
              title="Analyse Video"
            />
          </div>

          {/* Youtube Video Details  */}
          <YoutubeVideoDetails videoId={videoId} />

          {/* thumbnail gen */}
          <ThumbnailGeneration videoId={videoId} />

          {/* title gen */}
          <TitleGeneration videoId={videoId} />

          {/* transcript */}
          {/* <Transcription videoId={videoId} /> */}

          <p>Stuff</p>
        </div>
        {/* RIght Side  */}
        <div className="lg:sticky lg:top-20 h-[500px] md:h-[calc(100vh-6rem)]">
          {/* ai agent chat section */}
          <p>Chat</p>
        </div>
      </div>
    </div>
  );
};
export default AnalysisPage;
