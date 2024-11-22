"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Send, Loader2, Bot, Sparkles } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import MessageBubble from "@/components/MessageBubble";
import { Conversation, Message } from "@/types";
import {
  fetchConversations,
  createConversation,
  updateConversation,
  deleteConversation,
  generateTitle,
} from "@/lib/storage";

const SUGGESTED_PROMPTS = [
  "Explique-moi l'intelligence artificielle en termes simples",
  "Écris un exemple de conte africain",
  "Comment fonctionne Next.js ?",
  "Donne-moi des conseils pour apprendre à programmer",
];

export default function ChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConvId, setCurrentConvId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const currentConv = conversations.find((c) => c.id === currentConvId);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Load conversations from MongoDB on session ready
  useEffect(() => {
    if (session?.user) {
      fetchConversations().then((saved) => {
        setConversations(saved);
        if (saved.length > 0) {
          setCurrentConvId(saved[0].id);
        }
      });
    }
  }, [session]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentConv?.messages]);

  const handleNewConversation = async () => {
    const conv = await createConversation();
    setConversations((prev) => [conv, ...prev]);
    setCurrentConvId(conv.id);
  };

  const handleSelectConversation = (id: string) => {
    setCurrentConvId(id);
  };

  const handleDeleteConversation = async (id: string) => {
    await deleteConversation(id);
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (currentConvId === id) {
      const remaining = conversations.filter((c) => c.id !== id);
      setCurrentConvId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const sendMessage = async (messageText?: string) => {
    const text = (messageText || input).trim();
    if (!text || isLoading) return;

    setInput("");

    let convId = currentConvId;
    let updatedConversations = [...conversations];

    if (!convId) {
      const newConv = await createConversation(generateTitle(text));
      updatedConversations = [newConv, ...updatedConversations];
      setConversations(updatedConversations);
      convId = newConv.id;
      setCurrentConvId(convId);
    }

    const userMessage: Message = {
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    updatedConversations = updatedConversations.map((c) => {
      if (c.id !== convId) return c;
      const isFirst = c.messages.length === 0;
      return {
        ...c,
        title: isFirst ? generateTitle(text) : c.title,
        messages: [...c.messages, userMessage],
        updatedAt: new Date(),
      };
    });
    setConversations(updatedConversations);
    setIsLoading(true);

    try {
      const conv = updatedConversations.find((c) => c.id === convId)!;
      const apiMessages = conv.messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur API");
      }

      // Add empty assistant message immediately
      const assistantMessage: Message = {
        role: "assistant",
        content: "",
        timestamp: new Date(),
      };
      setConversations((prev) =>
        prev.map((c) =>
          c.id !== convId
            ? c
            : { ...c, messages: [...c.messages, assistantMessage], updatedAt: new Date() }
        )
      );

      // Stream response tokens
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullContent += decoder.decode(value, { stream: true });
        const captured = fullContent;
        setConversations((prev) =>
          prev.map((c) => {
            if (c.id !== convId) return c;
            const msgs = [...c.messages];
            msgs[msgs.length - 1] = { ...msgs[msgs.length - 1], content: captured };
            return { ...c, messages: msgs, updatedAt: new Date() };
          })
        );
      }

      // Persist final conversation to MongoDB
      const finalMessages = [
        ...conv.messages,
        { ...assistantMessage, content: fullContent },
      ];
      await updateConversation(convId!, conv.title, finalMessages);
    } catch (err: any) {
      const errorMessage: Message = {
        role: "assistant",
        content: `Désolé, une erreur s'est produite : ${err.message}. Vérifiez votre clé API Mistral.`,
        timestamp: new Date(),
      };
      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId ? { ...c, messages: [...c.messages, errorMessage] } : c
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <Loader2 className="animate-spin text-orange-400" size={40} />
      </div>
    );
  }

  if (!session) return null;

  const user = session.user as any;

  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden">
      <Sidebar
        conversations={conversations}
        currentConvId={currentConvId}
        onSelect={handleSelectConversation}
        onNew={handleNewConversation}
        onDelete={handleDeleteConversation}
        userName={user.name || "Utilisateur"}
        userPseudo={user.pseudo || user.email || "user"}
      />

      <div className="flex-1 flex flex-col h-full">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-800 bg-gray-900/50 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center border border-orange-500/30">
              <Bot size={16} className="text-orange-400" />
            </div>
            <div>
              <h2 className="text-white text-sm font-semibold">
                {currentConv?.title || "Chat-Bot"}
              </h2>
              <p className="text-gray-500 text-xs flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block" />
                Mistral AI · En ligne
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {!currentConv || currentConv.messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-orange-500/10 rounded-2xl flex items-center justify-center border border-orange-500/20 mb-6">
                <Sparkles size={28} className="text-orange-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Bonjour, {user.name} !
              </h2>
              <p className="text-gray-400 mb-8 max-w-md text-sm">
                Je suis votre assistant IA propulsé par Mistral. Posez-moi
                n&apos;importe quelle question, je suis là pour vous aider.
              </p>
              <div className="grid grid-cols-2 gap-3 w-full max-w-lg">
                {SUGGESTED_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => sendMessage(prompt)}
                    className="text-left bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-orange-500/40 text-gray-300 text-xs rounded-xl px-4 py-3 transition"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-6">
              {currentConv.messages.map((msg, i) => (
                <MessageBubble key={i} message={msg} />
              ))}
              {isLoading && !currentConv?.messages.at(-1)?.content && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gray-700 border border-gray-600 flex items-center justify-center flex-shrink-0">
                    <Bot size={14} className="text-gray-300" />
                  </div>
                  <div className="bg-gray-800 border border-gray-700 rounded-2xl rounded-tl-sm px-4 py-3">
                    <div className="flex gap-1 items-center h-5">
                      <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="px-6 py-4 border-t border-gray-800 bg-gray-900/50 backdrop-blur">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-end gap-3 bg-gray-800 border border-gray-700 focus-within:border-orange-500/50 rounded-2xl px-4 py-3 transition">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = Math.min(e.target.scrollHeight, 160) + "px";
                }}
                onKeyDown={handleKeyDown}
                placeholder="Posez votre question à Mistral..."
                rows={1}
                className="flex-1 bg-transparent text-white text-sm placeholder-gray-500 resize-none focus:outline-none leading-relaxed"
                style={{ maxHeight: "160px" }}
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || isLoading}
                className="w-9 h-9 bg-orange-500 hover:bg-orange-400 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-xl flex items-center justify-center transition flex-shrink-0"
              >
                {isLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}
              </button>
            </div>
            <p className="text-center text-gray-600 text-xs mt-2">
              Appuyez sur{" "}
              <kbd className="bg-gray-800 px-1 rounded text-gray-500">Entrée</kbd>{" "}
              pour envoyer ·{" "}
              <kbd className="bg-gray-800 px-1 rounded text-gray-500">Shift+Entrée</kbd>{" "}
              pour un saut de ligne
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
