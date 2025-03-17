"use client";

import ReactMarkdown from "react-markdown";
import { useChat } from "@ai-sdk/react";
import { Button } from "./ui/button";
import { UIMessage } from "ai";
import { ToolInvocationUIPart } from "@ai-sdk/ui-utils";

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
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    maxSteps: 5,
    body: {
      videoId: videoId,
    },
  });

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
      <div className="overflow-y-auto flex-1 px-4 py-4">
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
        </div>
      </div>

      {/* Input form - moved outside the messages container */}
      <div className="border-t border-gray-200 p-4 bg-white mt-auto">
        <div className="space-y-3">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              value={input}
              type="text"
              placeholder="Enter a question"
              onChange={handleInputChange}
              className="flex-1 px-4 py-2 text-sm border border-gray-200 
              rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500
               focus:border-transparent"
            />
            <Button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white text-sm rounded-full hover:bg-blue-600 
            transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
export default AIAgentChat;
