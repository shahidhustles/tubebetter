"use client";

import { useUser } from "@clerk/nextjs";
import Usage from "./Usage";
import { FeatureFlag } from "@/features/flags";
import { useSchematicEntitlement } from "@schematichq/schematic-react";
import { Copy } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const TitleGeneration = ({ videoId }: { videoId: string }) => {
  const { user, isLoaded } = useUser();

  if (!user && isLoaded) {
    throw new Error("UnAuthorized");
  }

  const titles = useQuery(api.titles.list, {
    videoId: videoId,
    userId: user?.id || "",
  });

  const { value: isTitleGenerationEnabled } = useSchematicEntitlement(
    FeatureFlag.TITLE_GENERATIONS
  );

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // toast.success("Copied to clipboard");
  };

  return (
    <div className="p-4 border border-gray-200 rounded-xl bg-white shadow-sm">
      <div className="min-w-52">
        <Usage featureFlag={FeatureFlag.TITLE_GENERATIONS} title="Titles" />
      </div>
      <div className="space-y-3 mt-4 max-h-[280px] overflow-y-auto">
        {titles?.map((title) => (
          <div
            key={title._id}
            className="group relative p-4 rounded-lg border border-gray-100 bg-gray-50 hover:border-blue-100 hover:bg-blue-50 transition-all duration-200"
          >
            <div className="flex items-start justify-between gap-4">
              <p className="text-sm text-gray-900 leading-relaxed">
                {title.title}
              </p>

              <button
                onClick={() => copyToClipboard(title.title)}
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1.5 hover:bg-blue-100 rounded-md"
                title="Copy to clipboard"
              >
                <Copy className="w-4 h-4 text-blue-600" />
              </button>
            </div>
          </div>
        ))}
      </div>
      {/* No titles generated yet */}
      {!titles?.length && !isTitleGenerationEnabled && (
        <div className="text-center py-8 px-4 rounded-lg mt-4 border-2 border-dashed border-gray-200">
          <p className="text-gray-500">No titles have been generated yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Generate titles to see them appear here
          </p>
        </div>
      )}
    </div>
  );
};
export default TitleGeneration;
