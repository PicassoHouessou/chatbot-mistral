"use client";

import { Message } from "@/types";
import { Bot, User, ThumbsUp, ThumbsDown, Copy } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex gap-3 group ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
          isUser
            ? "bg-orange-500/20 border border-orange-500/30"
            : "bg-gray-700 border border-gray-600"
        }`}
      >
        {isUser ? (
          <User size={14} className="text-orange-400" />
        ) : (
          <Bot size={14} className="text-gray-300" />
        )}
      </div>

      {/* Bubble */}
      <div className={`max-w-[75%] ${isUser ? "items-end" : "items-start"} flex flex-col gap-1`}>
        <span className={`text-xs font-medium ${isUser ? "text-orange-400 text-right" : "text-gray-400"}`}>
          {isUser ? "Vous" : "Mistral"}
        </span>
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? "bg-orange-500 text-white rounded-tr-sm"
              : "bg-gray-800 text-gray-200 border border-gray-700 rounded-tl-sm"
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                h1: ({ children }) => <h1 className="text-xl font-bold text-white mt-4 mb-2">{children}</h1>,
                h2: ({ children }) => <h2 className="text-lg font-bold text-white mt-3 mb-2">{children}</h2>,
                h3: ({ children }) => <h3 className="text-base font-bold text-white mt-3 mb-1">{children}</h3>,
                strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
                em: ({ children }) => <em className="italic text-gray-300">{children}</em>,
                ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                li: ({ children }) => <li className="text-gray-200 ml-2">{children}</li>,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-2 border-orange-500 pl-3 italic text-gray-400 my-2">
                    {children}
                  </blockquote>
                ),
                hr: () => <hr className="border-gray-700 my-3" />,
                a: ({ href, children }) => (
                  <a href={href} target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline">
                    {children}
                  </a>
                ),
                code: ({ inline, children }: any) => {
                  if (inline) {
                    return (
                      <code className="bg-gray-900 text-orange-300 px-1.5 py-0.5 rounded text-xs font-mono">
                        {children}
                      </code>
                    );
                  }
                  return (
                    <pre className="bg-gray-900 border border-gray-700 rounded-lg p-3 overflow-x-auto my-2">
                      <code className="text-xs text-gray-200 font-mono">{children}</code>
                    </pre>
                  );
                },
                table: ({ children }) => (
                  <div className="overflow-x-auto my-3">
                    <table className="min-w-full text-xs border-collapse">{children}</table>
                  </div>
                ),
                thead: ({ children }) => <thead className="bg-gray-700/60">{children}</thead>,
                tbody: ({ children }) => <tbody>{children}</tbody>,
                tr: ({ children }) => <tr className="even:bg-gray-700/20">{children}</tr>,
                th: ({ children }) => (
                  <th className="border border-gray-600 px-3 py-2 text-left font-semibold text-white">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="border border-gray-600 px-3 py-2 text-gray-300">{children}</td>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>

        {/* Actions (for assistant only) */}
        {!isUser && (
          <div className="flex items-center gap-1 transition [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100">
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-1 text-gray-600 hover:text-gray-300 text-xs px-2 py-1 rounded-lg hover:bg-gray-800 transition"
            >
              <Copy size={11} />
              {copied ? "Copié !" : "Copier"}
            </button>
            <button className="text-gray-600 hover:text-green-400 p-1 rounded-lg hover:bg-gray-800 transition">
              <ThumbsUp size={11} />
            </button>
            <button className="text-gray-600 hover:text-red-400 p-1 rounded-lg hover:bg-gray-800 transition">
              <ThumbsDown size={11} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
