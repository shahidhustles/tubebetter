"use client";

import { useUser } from "@clerk/nextjs";
import Usage from "./Usage";
import Image from "next/image";
import { FeatureFlag } from "@/features/flags";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const ThumbnailGeneration = ({ videoId }: { videoId: string }) => {
  const { user, isLoaded } = useUser();

  if (!user?.id && isLoaded) {
    throw new Error("Unauthorized");
  }

  const images = useQuery(api.images.getImages, {
    videoId: videoId,
    userId: user?.id || "",
  });

  console.log(images);

  return (
    <div className="rounded-xl flex flex-col p-4 border">
      <div className="min-w-52">
        <Usage
          featureFlag={FeatureFlag.IMAGE_GENERATION}
          title="Thumbnail Generation"
        />
      </div>

      {/* Simple horizontal scroll for images */}
      <div className="w-full">
        <div
          className={`flex overflow-x-scroll gap-4 pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent ${
            images?.length ? "mt-4" : ""
          }`}
          style={{
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "thin",
            msOverflowStyle: "auto",
          }}
        >
          {images?.map(
            (image) =>
              image.url && (
                <div
                  key={image._id}
                  className="flex-none flex-shrink-0 w-[200px] h-[110px] rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                >
                  <a
                    href={image.url}
                    download={`thumbnail-${image._id}.jpg`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Image
                      src={image.url}
                      alt="Generated Image"
                      width={200}
                      height={110}
                      className="object-cover w-full h-full rounded-lg"
                    />
                  </a>
                </div>
              )
          )}
        </div>
      </div>

      {/* No images generated yet */}
      {!images?.length && (
        <div className="text-center py-8 px-4 rounded-lg mt-4 border-2 border-dashed border-gray-200">
          <p className="text-gray-500">No thumbnails have been generated yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Generate thumbnails to see them appear here
          </p>
        </div>
      )}
    </div>
  );
};
export default ThumbnailGeneration;
