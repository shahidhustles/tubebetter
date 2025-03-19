"use client";

import ReactMarkdown from "react-markdown";
import { useChat } from "@ai-sdk/react";
import { Button } from "./ui/button";
import { UIMessage } from "ai";
import { Message, ToolInvocationUIPart } from "@ai-sdk/ui-utils";
import { useSchematicFlag } from "@schematichq/schematic-react";
import { FeatureFlag } from "@/features/flags";
import { BotIcon, ImageIcon, LetterText, PenIcon } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

const formatToolInvocation = (part: ToolPart) => {
  if (!part.toolInvocation) return "Unknown Tool";
  return `🔧 Tool Used: ${part.toolInvocation.toolName}`;
};

interface ToolInvocation {
  toolCallId: string;
  toolName: string;
  result?: Record<string, unknown>;
}

interface ToolPart {
  type: "tool-invocation";
  toolInvocation: ToolInvocation;
}

const AIAgentChat = ({ videoId }: { videoId: string }) => {
  //Scrolling to bottom logic
  const bottomRef = useRef<HTMLDivElement>(null) 
  const messageContainerRef = useRef<HTMLDivElement>(null)

  const { messages, input, handleInputChange, handleSubmit, append, status } =
    useChat({
      maxSteps: 5,
      body: {
        videoId: videoId,
      },
    });

  //returns if the feature is entitled in the users plan
  //useSchematicFlag() on client, and client.flag() on server
  const isScriptGenerationEnabled = useSchematicFlag(
    FeatureFlag.SCRIPT_GENERATION
  );
  const isImageGenerationEnabled = useSchematicFlag(
    FeatureFlag.IMAGE_GENERATION
  );
  const isTitleGenerationEnabled = useSchematicFlag(
    FeatureFlag.TITLE_GENERATIONS
  );
  const isVideoAnalysisEnabled = useSchematicFlag(FeatureFlag.ANALYSE_VIDEO);

useEffect(() => {
  let toastId;

  switch (status) {
    case "submitted":
      toastId = toast("Agent is thinking...", {
        id: toastId,
        icon: <BotIcon className="w-4 h-4" />,
      });
      break;
    case "streaming":
      toastId = toast("Agent is replying...", {
        id: toastId,
        icon: <BotIcon className="w-4 h-4" />,
      });
      break;
    case "error":
      toastId = toast("Whoops! Something went wrong, please try again.", {
        id: toastId,
        icon: <BotIcon className="w-4 h-4" />,
      });
      break;
    case "ready":
      toast.dismiss(toastId);

      break;
  }

}, [status])

//scroll as the message streams
useEffect(() => {
if(bottomRef.current && messageContainerRef.current) {
  messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight
}
}, [messages])


  //pragrammaticaly generate script
  const generateScript = async () => {
    const randomId = uuidv4();

    const userMessage: Message = {
      id: `generate-script-${randomId}`,
      role: "user",
      content:
        "Generate a step-by-step shooting script for this video that I can use on my own channel to produce a video that is similar to this one, dont do any other steps such as generating a image, just generate the script only!",
    };
    append(userMessage);
  };

  //pragrammaticaly generate image
  const generateImage = async () => {
    const randomId = uuidv4();
    const userMessage: Message = {
      id: `generate-image-${randomId}`,
      role: "user",
      content: "Generate a thumbnail for this video",
    };
    append(userMessage);
  };

  //pragrammaticaly generate title
  const generateTitle = async () => {
    const randomId = uuidv4();
    const userMessage: Message = {
      id: `generate-title-${randomId}`,
      role: "user",
      content: "Generate a title for this video",
    };
    append(userMessage);
  };

  // Function to render message content based on role and type
  const renderMessageContent = (message: UIMessage) => {
    switch (message.role) {
      case "assistant":
        if (message.parts) {
          return (
            <div className="space-y-3">
              {message.parts.map((part, i: number) => {
                switch (part.type) {
                  case "text":
                    return (
                      <div key={i} className="prose prose-sm max-w-none">
                        <ReactMarkdown>{part.text}</ReactMarkdown>
                      </div>
                    );
                  case "tool-invocation":
                    return (
                      <div
                        key={i}
                        className="bg-white/50 rounded-lg p-2 space-y-2 text-gray-800"
                      >
                        <div className="font-medium text-xs">
                          {formatToolInvocation(part as ToolPart)}
                        </div>
                        {(part as ToolInvocationUIPart).toolInvocation.state ===
                          "result" && (
                          <pre className="text-xs bg-white/75 p-2 rounded overflow-auto max-h-40">
                            {JSON.stringify(
                              (part as ToolPart).toolInvocation.result,
                              null,
                              2
                            )}
                          </pre>
                        )}
                      </div>
                    );
                  default:
                    return null;
                }
              })}
            </div>
          );
        }
        return <div>Empty assistant message</div>;

      case "user":
        return (
          <div className="prose prose-lg max-w-none text-white">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        );

      default:
        return <div>Unknown message type</div>;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="hidden lg:block px-4 border-b border-gray-100">
        <h2 className="text-lg text-gray-800 font-semibold">Ai Agent</h2>
      </div>

      {/* Messages */}
      <div className="overflow-y-auto flex-1 px-4 py-4" ref={messageContainerRef}>
        <div className="space-y-6">
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full min-h-[200px]">
              <div className="text-center space-y-2">
                <h3 className="text-lg font-medium text-gray-700">
                  Welcome to AI Agent Chat
                </h3>
                <p className="text-sm text-gray-500">
                  Ask any question about your video!
                </p>
              </div>
            </div>
          )}

          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] ${m.role === "user" ? "bg-blue-500 px-2 py-1 rounded-lg" : "bg-gray-100 px-2 py-1 rounded-lg"}`}
              >
                {renderMessageContent(m)}
              </div>
            </div>
          ))}
          <div ref={bottomRef}></div>
        </div>
      </div>

      {/* Input form - moved outside the messages container */}
      <div className="border-t border-gray-200 p-4 bg-white mt-auto">
        <div className="space-y-3">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              value={input}
              type="text"
              placeholder={
                !isVideoAnalysisEnabled
                  ? "Upgrade to ask anything about your video..."
                  : "Ask anything about your video..."
              }
              onChange={handleInputChange}
              className="flex-1 px-4 py-2 text-sm border border-gray-200 
              rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500
               focus:border-transparent"
            />
            <Button
              type="submit"
              disabled={
                status === "streaming" ||
                status === "submitted" ||
                !isVideoAnalysisEnabled
              }
              className="px-4 py-2 bg-blue-500 text-white text-sm rounded-full hover:bg-blue-600 
            transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === "streaming"
                ? "AI is Replying"
                : status === "submitted"
                  ? "AI is Thinking"
                  : "Send"}
            </Button>
          </form>

          <div className="flex gap-2">
            <button
              className="text-xs xl:text-sm w-full flex items-center justify-center gap-2 py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={generateScript}
              type="button"
              disabled={!isScriptGenerationEnabled}
            >
              <LetterText className="w-4 h-4" />
              {isScriptGenerationEnabled ? (
                <span>Generate Script</span>
              ) : (
                <span>Upgrade to generate a script</span>
              )}
            </button>

            <button
              className="text-xs xl:text-sm w-full flex items-center justify-center gap-2 py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={generateTitle}
              type="button"
              disabled={!isTitleGenerationEnabled}
            >
              <PenIcon className="w-4 h-4" />
              Generate Title
            </button>

            <button
              className="text-xs xl:text-sm w-full flex items-center justify-center gap-2 py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={generateImage}
              type="button"
              disabled={!isImageGenerationEnabled}
            >
              <ImageIcon className="w-4 h-4" />
              Generate Image
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AIAgentChat;
